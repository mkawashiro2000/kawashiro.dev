/**
 * resume.ts — CV imprimible desde la Terminal UI.
 *
 * El comando `print resume` abre una ventana con el currículo formateado y
 * lanza el diálogo de impresión del navegador (imprimir o guardar como PDF).
 * Funciona en cualquier navegador, sin hardware especial.
 */

import type { Locale } from '../../i18n/translations';

interface Project {
  name: string;
  role: string;
  url?: string;
  bullets: string[];
}

interface ResumeCopy {
  role: string;
  location: string;
  profileLabel: string;
  profile: string;
  skillsLabel: string;
  skills: { label: string; items: string }[];
  projectsLabel: string;
  projects: Project[];
}

export const COPY: Record<Locale, ResumeCopy> = {
  en: {
    role: 'Full Stack (Back-end/Data) Developer',
    location: 'La Vega, Constanza, Dominican Republic',
    profileLabel: 'Professional Profile',
    profile:
      'Results-driven Full Stack Developer and Data Science student specializing in back-end architecture, data engineering, and secure edge deployments. Proven expertise in building comprehensive web applications, concurrent ASGI architectures, and automated data pipelines. Adept at designing robust database schemas and managing containerized, self-hosted ARM64 infrastructure (Raspberry Pi OS Lite) to deliver highly optimized, locally operated, and cloud-integrated solutions. Passionate about translating complex operational and financial needs into scalable, high-performance software.',
    skillsLabel: 'Technical Skills',
    skills: [
      { label: 'Frontend', items: 'JavaScript (ES6+), TypeScript, React, Astro, TailwindCSS, SCSS, HTML5/CSS3' },
      { label: 'Backend', items: 'Python, Node.js, Bun, Deno, Supabase, Resend' },
      { label: 'Data Science & Engineering', items: 'Python, NumPy, Pandas, Scikit-learn, TensorFlow, Keras, Automated Data Pipelines' },
      { label: 'Database & Infrastructure', items: 'PostgreSQL, MongoDB, Redis, Docker, AWS, Git/GitHub, Self-managed ARM64 Servers, Network Monitoring Watchdogs' },
    ],
    projectsLabel: 'Technical Projects & Experience',
    projects: [
      {
        name: 'AgroBalance',
        role: 'Lead Developer',
        url: 'agrobalancerd.com',
        bullets: [
          'Architected and developed a comprehensive agrotechnological and financial management system utilizing a React frontend and Python backend, designed to professionalize agricultural production.',
          'Engineered complex database schemas that effectively separate plot metrics from seasonal cultivation data, enabling a multi-tiered pricing model.',
          'Implemented secure, locally operated deployments that provide producers with real-time, millimeter-level control over crop cycles, cost accounting, and dividend distributions, directly translating field operations into actionable financial metrics.',
        ],
      },
      {
        name: 'LubeSyncRD',
        role: 'Lead Developer',
        url: 'lubesyncrd.pages.dev',
        bullets: [
          'Developed an end-to-end customer service and operations management platform tailored for auto repair shops.',
          'Centralized workshop operations by integrating real-time service tracking, dynamic work orders, and an automated customer reminder system to reduce administrative bottlenecks.',
          'Optimized the user interface and backend logic to ensure a seamless workflow, improving client retention and operational transparency.',
        ],
      },
      {
        name: 'Micro-lending CRM System (CajaLocal)',
        role: 'Full Stack Developer',
        bullets: [
          'Developed and deployed an automated micro-lending management system engineered to streamline small business financial operations, featuring robust client portfolio tracking, fixed-rate amortization scheduling, and dynamic HTML/PDF receipt generation.',
          'Architected the application for secure, on-premise deployment tailored to client hardware, incorporating automated off-site server backups for enhanced data integrity.',
          'Provides lenders with a highly customizable, locally managed environment for total operational control.',
        ],
      },
      {
        name: 'Self-Hosted Infrastructure & Automation',
        role: 'Systems Administrator',
        bullets: [
          'Configured and maintained local server environments deploying containerized applications via Docker on Raspberry Pi OS Lite.',
          'Developed custom automated data pipelines and network monitoring watchdogs utilizing Python, optimizing local network dependencies and resource allocations.',
        ],
      },
    ],
  },
  es: {
    role: 'Full Stack (Back-end/Data) Developer',
    location: 'La Vega, Constanza, República Dominicana',
    profileLabel: 'Perfil Profesional',
    profile:
      'Desarrollador Full Stack orientado a resultados y estudiante de Data Science, especializado en arquitectura back-end, ingeniería de datos y despliegues edge seguros. Experiencia comprobada construyendo aplicaciones web integrales, arquitecturas ASGI concurrentes y pipelines de datos automatizados. Hábil en el diseño de esquemas de bases de datos robustos y en la gestión de infraestructura ARM64 autogestionada y contenerizada (Raspberry Pi OS Lite) para entregar soluciones altamente optimizadas, operadas localmente e integradas a la nube. Apasionado por traducir necesidades operativas y financieras complejas en software escalable y de alto rendimiento.',
    skillsLabel: 'Habilidades Técnicas',
    skills: [
      { label: 'Frontend', items: 'JavaScript (ES6+), TypeScript, React, Astro, TailwindCSS, SCSS, HTML5/CSS3' },
      { label: 'Backend', items: 'Python, Node.js, Bun, Deno, Supabase, Resend' },
      { label: 'Data Science e Ingeniería', items: 'Python, NumPy, Pandas, Scikit-learn, TensorFlow, Keras, pipelines de datos automatizados' },
      { label: 'Bases de Datos e Infraestructura', items: 'PostgreSQL, MongoDB, Redis, Docker, AWS, Git/GitHub, servidores ARM64 autogestionados, watchdogs de monitoreo de red' },
    ],
    projectsLabel: 'Proyectos Técnicos y Experiencia',
    projects: [
      {
        name: 'AgroBalance',
        role: 'Lead Developer',
        url: 'agrobalancerd.com',
        bullets: [
          'Arquitecturó y desarrolló un sistema integral de gestión agrotecnológica y financiera con frontend en React y backend en Python, diseñado para profesionalizar la producción agrícola.',
          'Diseñó esquemas de bases de datos complejos que separan las métricas de parcelas de los datos de cultivo por temporada, habilitando un modelo de precios multinivel.',
          'Implementó despliegues seguros y operados localmente que dan al productor control milimétrico y en tiempo real sobre ciclos de cultivo, contabilidad de costos y distribución de dividendos, traduciendo la operación de campo en métricas financieras accionables.',
        ],
      },
      {
        name: 'LubeSyncRD',
        role: 'Lead Developer',
        url: 'lubesyncrd.pages.dev',
        bullets: [
          'Desarrolló una plataforma end-to-end de gestión de servicio al cliente y operaciones para talleres de reparación automotriz.',
          'Centralizó la operación del taller integrando seguimiento de servicios en tiempo real, órdenes de trabajo dinámicas y un sistema automatizado de recordatorios a clientes para reducir cuellos de botella administrativos.',
          'Optimizó la interfaz de usuario y la lógica del backend para garantizar un flujo de trabajo fluido, mejorando la retención de clientes y la transparencia operativa.',
        ],
      },
      {
        name: 'Sistema CRM de Micropréstamos (CajaLocal)',
        role: 'Full Stack Developer',
        bullets: [
          'Desarrolló y desplegó un sistema automatizado de gestión de micropréstamos diseñado para agilizar las operaciones financieras de pequeños negocios, con seguimiento robusto de cartera de clientes, tablas de amortización a tasa fija y generación dinámica de recibos HTML/PDF.',
          'Arquitecturó la aplicación para despliegue on-premise seguro y adaptado al hardware del cliente, incorporando respaldos automatizados hacia servidor externo para mayor integridad de los datos.',
          'Provee al prestamista un entorno altamente personalizable y gestionado localmente, con control operativo total.',
        ],
      },
      {
        name: 'Infraestructura Self-Hosted y Automatización',
        role: 'Administrador de Sistemas',
        bullets: [
          'Configuró y mantuvo entornos de servidor locales desplegando aplicaciones contenerizadas vía Docker sobre Raspberry Pi OS Lite.',
          'Desarrolló pipelines de datos automatizados y watchdogs de monitoreo de red a medida con Python, optimizando dependencias de red locales y asignación de recursos.',
        ],
      },
    ],
  },
  ja: {
    role: 'フルスタック(バックエンド/データ)デベロッパー',
    location: 'ドミニカ共和国 ラ・ベガ州 コンスタンサ',
    profileLabel: '職務プロフィール',
    profile:
      '成果志向のフルスタック開発者・データサイエンス専攻。バックエンドアーキテクチャ、データエンジニアリング、セキュアなエッジデプロイを専門とする。総合的なWebアプリケーション、並行ASGIアーキテクチャ、自動データパイプラインの構築に実績あり。堅牢なデータベーススキーマの設計や、コンテナ化されたセルフホストARM64インフラ(Raspberry Pi OS Lite)の運用に長け、高度に最適化されたローカル運用・クラウド統合ソリューションを提供。複雑な業務・財務ニーズをスケーラブルで高性能なソフトウェアへ変換することに情熱を注ぐ。',
    skillsLabel: '技術スキル',
    skills: [
      { label: 'フロントエンド', items: 'JavaScript (ES6+), TypeScript, React, Astro, TailwindCSS, SCSS, HTML5/CSS3' },
      { label: 'バックエンド', items: 'Python, Node.js, Bun, Deno, Supabase, Resend' },
      { label: 'データサイエンス&エンジニアリング', items: 'Python, NumPy, Pandas, Scikit-learn, TensorFlow, Keras, 自動データパイプライン' },
      { label: 'データベース&インフラ', items: 'PostgreSQL, MongoDB, Redis, Docker, AWS, Git/GitHub, セルフマネージドARM64サーバー, ネットワーク監視ウォッチドッグ' },
    ],
    projectsLabel: '技術プロジェクト&経験',
    projects: [
      {
        name: 'AgroBalance',
        role: 'リード開発者',
        url: 'agrobalancerd.com',
        bullets: [
          'Reactフロントエンド+Pythonバックエンドによる総合的な農業技術・財務管理システムを設計・開発。農業生産の専門化を目的とする。',
          '区画メトリクスとシーズンごとの栽培データを分離する複雑なデータベーススキーマを設計し、多段階の価格モデルを実現。',
          'セキュアなローカル運用のデプロイを実装し、栽培サイクル・コスト会計・配当分配をリアルタイムかつ精密に管理。農地の運営を実用的な財務指標へ直接変換。',
        ],
      },
      {
        name: 'LubeSyncRD',
        role: 'リード開発者',
        url: 'lubesyncrd.pages.dev',
        bullets: [
          '自動車整備工場向けのエンドツーエンドな顧客サービス・運営管理プラットフォームを開発。',
          'リアルタイムのサービス追跡、動的な作業指示書、自動顧客リマインダーを統合し、工場運営を一元化して管理業務のボトルネックを削減。',
          'UIとバックエンドロジックを最適化してシームレスなワークフローを実現し、顧客維持率と運営の透明性を向上。',
        ],
      },
      {
        name: 'マイクロレンディングCRMシステム (CajaLocal)',
        role: 'フルスタック開発者',
        bullets: [
          '小規模事業の財務オペレーションを効率化する自動マイクロレンディング管理システムを開発・デプロイ。堅牢な顧客ポートフォリオ追跡、固定金利の償還スケジュール、HTML/PDF領収書の動的生成を搭載。',
          'クライアントのハードウェアに合わせたセキュアなオンプレミス展開として設計し、データ完全性を高める外部サーバーへの自動バックアップを組み込み。',
          '高度にカスタマイズ可能でローカル管理された環境を貸し手に提供し、完全な運用管理を実現。',
        ],
      },
      {
        name: 'セルフホストインフラ&自動化',
        role: 'システム管理者',
        bullets: [
          'Raspberry Pi OS Lite上でDockerによるコンテナ化アプリケーションをデプロイするローカルサーバー環境を構築・保守。',
          'Pythonによる自動データパイプラインとネットワーク監視ウォッチドッグを独自開発し、ローカルネットワークの依存関係とリソース配分を最適化。',
        ],
      },
    ],
  },
};

/**
 * Abre una ventana con el CV renderizado y dispara el diálogo de impresión.
 * Devuelve `false` si el navegador bloqueó la ventana emergente.
 */
export function openPrintableResume(locale: Locale): boolean {
  const c = COPY[locale] ?? COPY.en;

  const skillRows = c.skills
    .map((g) => `<tr><td class="k">${g.label}</td><td>${g.items}</td></tr>`)
    .join('');

  const projectBlocks = c.projects
    .map(
      (p) => `<div class="proj">
      <div class="proj-head"><strong>${p.name}</strong> | ${p.role}${p.url ? ` | <span class="url">${p.url}</span>` : ''}</div>
      <ul>${p.bullets.map((b) => `<li>${b}</li>`).join('')}</ul>
    </div>`,
    )
    .join('');

  const html = `<!doctype html>
<html lang="${locale}">
<head>
<meta charset="utf-8" />
<title>Mitsunori Kawashiro — Resume</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  @page { size: letter; margin: 0; }
  body { font-family: 'Helvetica Neue', Arial, sans-serif; color: #1a1a1a; padding: 30px 40px; max-width: 780px; margin: 0 auto; line-height: 1.32; }
  h1 { font-size: 22px; letter-spacing: 0.04em; }
  .role { font-size: 12.5px; color: #444; margin-top: 1px; }
  .loc { font-size: 11.5px; color: #666; margin-top: 1px; }
  .contact-line { font-size: 11px; color: #444; margin-top: 4px; }
  hr { border: none; border-top: 1.5px solid #1a1a1a; margin: 10px 0; }
  h2 { font-size: 10.5px; text-transform: uppercase; letter-spacing: 0.14em; margin: 10px 0 5px; color: #1a1a1a; border-bottom: 1px solid #ccc; padding-bottom: 2px; }
  p, td, li { font-size: 11px; }
  table { border-collapse: collapse; width: 100%; }
  td { padding: 1.5px 0; vertical-align: top; }
  td.k { font-weight: 600; width: 165px; padding-right: 10px; }
  .proj { margin-bottom: 7px; }
  .proj-head { font-size: 11px; margin-bottom: 2px; }
  .url { color: #555; }
  ul { padding-left: 16px; }
  li { margin-bottom: 1.5px; color: #333; }
  @media print { body { padding: 26px 36px; } }
</style>
</head>
<body>
  <h1>MITSUNORI KAWASHIRO</h1>
  <div class="role">${c.role}</div>
  <div class="loc">${c.location}</div>
  <div class="contact-line">kawashiro.dev &nbsp;|&nbsp; mkawashiro01@gmail.com &nbsp;|&nbsp; +1 (829) 958-9614 &nbsp;|&nbsp; github.com/mkawashiro2000</div>
  <hr />
  <h2>${c.profileLabel}</h2>
  <p>${c.profile}</p>
  <h2>${c.skillsLabel}</h2>
  <table>${skillRows}</table>
  <h2>${c.projectsLabel}</h2>
  ${projectBlocks}
  <script>window.onload = function () { window.print(); };</script>
</body>
</html>`;

  const win = window.open('', '_blank', 'width=820,height=900');
  if (!win) return false;

  win.document.open();
  win.document.write(html);
  win.document.close();
  return true;
}
