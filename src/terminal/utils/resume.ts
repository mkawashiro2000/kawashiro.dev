/**
 * resume.ts — CV imprimible desde la Terminal UI.
 *
 * El comando `print resume` abre una ventana con el currículo formateado y
 * lanza el diálogo de impresión del navegador (imprimir o guardar como PDF).
 * Funciona en cualquier navegador, sin hardware especial.
 */

import type { Locale } from '../../i18n/translations';

interface ResumeCopy {
  role: string;
  location: string;
  profileLabel: string;
  profile: string;
  stackLabel: string;
  projectsLabel: string;
  contactLabel: string;
  projects: { name: string; url: string; desc: string }[];
}

const COPY: Record<Locale, ResumeCopy> = {
  en: {
    role: 'Full Stack (Back-end/Data) Developer',
    location: 'Constanza, Dominican Republic',
    profileLabel: 'Profile',
    profile:
      'Full Stack developer focused on back-end and data. I build with data, analytics and web apps: concurrent ASGI architectures, self-managed ARM64 infrastructure, and Zero Trust edge deployments.',
    stackLabel: 'Stack',
    projectsLabel: 'Projects',
    contactLabel: 'Contact',
    projects: [
      {
        name: 'AgroBalance',
        url: 'agrobalancerd.com',
        desc: 'Comprehensive agrotechnological and financial management system for agricultural producers.',
      },
      {
        name: 'LubeSyncRD',
        url: 'lubesyncrd.pages.dev',
        desc: 'Customer service and operations management platform for auto shops.',
      },
    ],
  },
  es: {
    role: 'Full Stack (Back-end/Data) Developer',
    location: 'Constanza, República Dominicana',
    profileLabel: 'Perfil',
    profile:
      'Desarrollador Full Stack enfocado en back-end y datos. Construyo con datos, analítica y aplicaciones web: arquitecturas ASGI concurrentes, infraestructura ARM64 autogestionada y despliegues edge Zero Trust.',
    stackLabel: 'Stack',
    projectsLabel: 'Proyectos',
    contactLabel: 'Contacto',
    projects: [
      {
        name: 'AgroBalance',
        url: 'agrobalancerd.com',
        desc: 'Sistema integral de gestión agrotecnológica y financiera para productores agrícolas.',
      },
      {
        name: 'LubeSyncRD',
        url: 'lubesyncrd.pages.dev',
        desc: 'Plataforma de gestión de servicio al cliente y operación para talleres.',
      },
    ],
  },
  ja: {
    role: 'フルスタック(バックエンド/データ)デベロッパー',
    location: 'ドミニカ共和国・コンスタンサ',
    profileLabel: 'プロフィール',
    profile:
      'バックエンドとデータに特化したフルスタック開発者。データ・分析・Webアプリを構築:並行ASGIアーキテクチャ、自己管理のARM64インフラ、Zero Trustエッジデプロイ。',
    stackLabel: 'スタック',
    projectsLabel: 'プロジェクト',
    contactLabel: '連絡先',
    projects: [
      {
        name: 'AgroBalance',
        url: 'agrobalancerd.com',
        desc: '農業生産者向けの総合的な農業技術・財務管理システム。',
      },
      {
        name: 'LubeSyncRD',
        url: 'lubesyncrd.pages.dev',
        desc: '整備工場向けの顧客サービス・運営管理プラットフォーム。',
      },
    ],
  },
};

const STACK_GROUPS: { label: string; items: string }[] = [
  { label: 'Frontend', items: 'JavaScript · TypeScript · TailwindCSS · Astro · SCSS' },
  { label: 'Backend', items: 'Node.js · Bun · Deno · Supabase · Resend' },
  { label: 'Data Science', items: 'Python · NumPy · Pandas · Scikit-learn · TensorFlow · Keras' },
  { label: 'DB & DevOps', items: 'PostgreSQL · MongoDB · Redis · AWS · Docker · GitHub' },
];

/**
 * Abre una ventana con el CV renderizado y dispara el diálogo de impresión.
 * Devuelve `false` si el navegador bloqueó la ventana emergente.
 */
export function openPrintableResume(locale: Locale): boolean {
  const c = COPY[locale] ?? COPY.en;

  const stackRows = STACK_GROUPS.map(
    (g) => `<tr><td class="k">${g.label}</td><td>${g.items}</td></tr>`,
  ).join('');

  const projectRows = c.projects
    .map(
      (p) =>
        `<div class="proj"><strong>${p.name}</strong> — <span class="url">${p.url}</span><br/><span class="desc">${p.desc}</span></div>`,
    )
    .join('');

  const html = `<!doctype html>
<html lang="${locale}">
<head>
<meta charset="utf-8" />
<title>Mitsunori Kawashiro — Resume</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: 'Helvetica Neue', Arial, sans-serif; color: #1a1a1a; padding: 48px 56px; max-width: 760px; margin: 0 auto; line-height: 1.5; }
  h1 { font-size: 26px; letter-spacing: 0.04em; }
  .role { font-size: 14px; color: #444; margin-top: 2px; }
  .loc { font-size: 13px; color: #666; margin-top: 2px; }
  hr { border: none; border-top: 1.5px solid #1a1a1a; margin: 18px 0; }
  h2 { font-size: 12px; text-transform: uppercase; letter-spacing: 0.14em; margin: 20px 0 8px; color: #1a1a1a; }
  p, td, .desc { font-size: 13px; }
  table { border-collapse: collapse; width: 100%; }
  td { padding: 3px 0; vertical-align: top; }
  td.k { font-weight: 600; width: 120px; padding-right: 12px; white-space: nowrap; }
  .proj { margin-bottom: 10px; font-size: 13px; }
  .url { color: #555; }
  .desc { color: #444; }
  .contact { font-size: 13px; line-height: 1.7; }
  @media print { body { padding: 24px 32px; } }
</style>
</head>
<body>
  <h1>MITSUNORI KAWASHIRO</h1>
  <div class="role">${c.role}</div>
  <div class="loc">${c.location}</div>
  <hr />
  <h2>${c.profileLabel}</h2>
  <p>${c.profile}</p>
  <h2>${c.stackLabel}</h2>
  <table>${stackRows}</table>
  <h2>${c.projectsLabel}</h2>
  ${projectRows}
  <h2>${c.contactLabel}</h2>
  <div class="contact">
    https://kawashiro.dev<br/>
    contact@kawashiro.dev<br/>
    github.com/kawashiro-dev
  </div>
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
