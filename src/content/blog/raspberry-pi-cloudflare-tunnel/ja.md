---
title: "Raspberry Pi と Cloudflare Tunnel でポートフォリオを配信する"
description: "kawashiro.dev がドミニカ共和国コンスタンサの Raspberry Pi 4 上で、開放ポートゼロで動く仕組み。Docker、nginx、Cloudflare Zero Trust。"
pubDate: 2026-07-22
tags: ["raspberry-pi", "cloudflare", "self-hosting", "docker"]
---

多くのポートフォリオは Vercel や Netlify にあります。私のは**ドミニカ共和国コンスタンサにある Raspberry Pi 4** で動いています — このサイトのターミナルモードで `htop` を実行すれば、その Pi のリアルな CPU と RAM をその瞬間に読んでいることになります。

## なぜセルフホスティングか

ポートフォリオ自体が*プロジェクト*だからです。PaaS への `git push` は誰にでもできます。リバースプロキシ、コンテナ化されたサービス、TLS、DNS、監視 — 小さな本番システムを設計し、自分のハードウェアで動かし続けることは、チュートリアルが飛ばす運用面を教えてくれます。面接でも良い話のネタになります。

## アーキテクチャ

3つのコンテナ、1つの Docker 内部ネットワーク:

```
[Cloudflare Edge] ⇄ cloudflared (トンネル)
                        │
                        ▼
                  nginx (frontend)  ── Astro の静的ビルド
                        │ /api/*
                        ▼
                  FastAPI (edge-api) ── テレメトリ、天気、ゲストブック
```

- **nginx** は Astro の静的ビルドを配信し、`/api/*` をバックエンドへプロキシ。
- **FastAPI** は Server-Sent Events でホストの実メトリクスを公開(`psutil` + `/sys/class/thermal`)。
- **cloudflared** は Cloudflare のエッジへ4本のアウトバウンド接続を維持。インバウンドのトラフィックはその接続を通って戻ってきます。

## 開放ポートゼロ

Pi のルーターには**ポートフォワーディングが一切ありません**。トンネルはアウトバウンド専用:`cloudflared` が Cloudflare へ発信し、トークンで認証し、Cloudflare が `kawashiro.dev` のトラフィックをそのパイプ経由でルーティングします。自宅の IP をポートスキャンしても、攻撃できるものは何も見つかりません。

TLS は自動です — `.dev` ドメインは HSTS がプリロードされており、Cloudflare がエッジで HTTPS を終端します。

## ハマったポイント

1. **コンテナの DNS。** ホストはローカル専用リゾルバの AdGuard Home を使っており、コンテナからは届きません。`cloudflared` も API も compose で明示的な `dns: [1.1.1.1]` が必要でした — これがないと、トンネルは起動時に SRV レコードを解決できず死にます。
2. **ARM64 の wheel。** `psutil` 5.x は aarch64 の wheel を出しておらず、ビルドのためだけにイメージに gcc が必要でした。7.x に上げたらビルド済み wheel が使え、ツールチェイン全体をイメージから削除できました。
3. **プロキシ越しの SSE。** Server-Sent Events は nginx で `proxy_buffering off` と長い `proxy_read_timeout` が必要です。さもないとストリームは静かに死にます。

## 結果

ポートフォリオが生きたデモにもなりました:リアルなテレメトリ、サーバーの実在地のリアルな天気、Pi 内の SQLite に永続化されたゲストブック — すべて、物理的に触れるハードウェアから、クラウドデプロイと同等のセキュリティ体制で配信されています。
