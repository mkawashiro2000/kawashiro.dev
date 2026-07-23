---
title: "SSE と FastAPI によるリアルタイムサーバーテレメトリ"
description: "Raspberry Pi からブラウザへ CPU・RAM・温度をライブ配信するのに、WebSocket ではなく Server-Sent Events を選んだ理由。"
pubDate: 2026-07-22
tags: ["fastapi", "sse", "python", "telemetry"]
---

このサイトのターミナルモードの `htop` コマンドは、ページを配信している Raspberry Pi の**リアルな** CPU・RAM・SoC 温度を 1.5 秒ごとに更新しながら表示します。その仕組みと、WebSocket ではなく SSE にした理由を説明します。

## SSE vs WebSocket

テレメトリは厳密に一方向です:サーバー → ブラウザ。それだけで WebSocket が提供するものの大半は不要になり、**Server-Sent Events** が最もシンプルな道具になります:

- 素の HTTP — nginx、Cloudflare、社内プロキシを特別扱いなしで通過。
- `EventSource` API に自動再接続が組み込み済み。
- アップグレードのハンドシェイクなし、ping/pong の管理なし、両端ともライブラリ不要。

## バックエンド

FastAPI + `sse-starlette`、約 30 行:

```python
async def hardware_telemetry_generator(request: Request):
    while True:
        if await request.is_disconnected():
            break
        yield {
            "event": "telemetry",
            "data": json.dumps({
                "cpu_usage": psutil.cpu_percent(interval=None),
                "ram_usage": psutil.virtual_memory().percent,
                "soc_temp": soc_temperature(),
            }),
        }
        await asyncio.sleep(1.5)
```

見た目以上に重要なポイントが2つ:

1. **`request.is_disconnected()`** — これがないと、タブを閉じた訪問者ごとにゾンビジェネレーターが永遠にループし続けます。
2. **`json.dumps`** — `sse-starlette` は Python の dict を平気で `str()` し、`JSON.parse` が拒否するシングルクォートの擬似 JSON を生成します。私はこのバグを本番に出して学びました。

SoC の温度はカーネルから直接取得します:`/sys/class/thermal/thermal_zone0/temp`。カーネルは共有されているので、コンテナ内からでも読めます。

## フロントエンド

完全に失敗した場合のみ手動で再生成する `EventSource`:

```ts
const es = new EventSource('/api/v1/telemetry');
es.addEventListener('telemetry', (e) => {
  setMetrics(JSON.parse(e.data));
});
es.onerror = () => {
  if (es.readyState === EventSource.CLOSED) {
    setTimeout(connect, 3000); // 接続を再構築
  }
};
```

一時的なエラーは `EventSource` が自力でリトライします。タイマーが必要なのは、ブラウザが完全に諦めたケースだけです。

## 間に立つ nginx

デフォルトのプロキシ設定の裏では SSE は静かに死にます。重要なのはこの3行:

```nginx
proxy_buffering off;
proxy_read_timeout 24h;
proxy_set_header Connection '';
```

これで、60 ユーロのシングルボードコンピュータから Cloudflare のエッジを経由して世界中のどのブラウザへもストリームが流れます — ポーリングなし、WebSocket インフラなし、サードパーティサービスなし。
