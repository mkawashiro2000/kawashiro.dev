/**
 * projects.ts — Sistema de archivos virtual de proyectos para la Terminal UI.
 *
 * `ls` lista los proyectos como archivos; `cat <archivo>` imprime la ficha
 * del proyecto y un extracto representativo de su código.
 */

import type { Locale } from '../../i18n/translations';

export interface ProjectFile {
  filename: string;
  size: string;
  date: string;
  desc: Record<Locale, string>;
  stack: string;
  url?: string;
  code: string[];
}

export const PROJECT_FILES: ProjectFile[] = [
  {
    filename: 'agrobalance.py',
    size: '4.2K',
    date: 'may 12',
    desc: {
      en: 'Agrotechnological and financial management system for agricultural producers.',
      es: 'Sistema de gestión agrotecnológica y financiera para productores agrícolas.',
      ja: '農業生産者向けの農業技術・財務管理システム。',
    },
    stack: 'React · Python (FastAPI) · PostgreSQL',
    url: 'agrobalancerd.com',
    code: [
      '@router.get("/parcelas/{parcela_id}/balance")',
      'async def balance_de_parcela(parcela_id: int, temporada: str):',
      '    """Cruza métricas agronómicas con contabilidad de costos."""',
      '    parcela = await repo.obtener_parcela(parcela_id)',
      '    ciclo = await repo.ciclo_activo(parcela_id, temporada)',
      '',
      '    costos = sum(m.costo for m in ciclo.movimientos)',
      '    ingresos = ciclo.cosecha_kg * ciclo.precio_por_kg(parcela.nivel)',
      '',
      '    return BalanceParcela(',
      '        parcela=parcela.nombre,',
      '        rendimiento_kg_ha=ciclo.cosecha_kg / parcela.hectareas,',
      '        margen=ingresos - costos,',
      '        roi=round((ingresos - costos) / costos * 100, 2),',
      '    )',
    ],
  },
  {
    filename: 'lubesyncrd.tsx',
    size: '3.8K',
    date: 'jul 18',
    desc: {
      en: 'Customer service and operations management platform for auto repair shops.',
      es: 'Plataforma de gestión de servicio al cliente y operaciones para talleres.',
      ja: '自動車整備工場向けの顧客サービス・運営管理プラットフォーム。',
    },
    stack: 'React · TypeScript · Supabase',
    url: 'lubesyncrd.pages.dev',
    code: [
      'export function OrdenDeServicio({ orden }: { orden: Orden }) {',
      '  const vencimiento = proximoCambio(orden.km_actual, orden.intervalo_km);',
      '  const { mutate: recordar } = useRecordatorio(orden.cliente_id);',
      '',
      '  useEffect(() => {',
      '    // Recordatorio automático: 500 km antes del próximo cambio',
      '    if (vencimiento.km_restantes < 500 && !orden.recordado) {',
      '      recordar({ canal: "whatsapp", plantilla: "cambio_aceite" });',
      '    }',
      '  }, [vencimiento]);',
      '',
      '  return (',
      '    <Card estado={vencimiento.urgencia}>',
      '      <ServicioTimeline items={orden.historial} />',
      '    </Card>',
      '  );',
      '}',
    ],
  },
  {
    filename: 'kampit.tsx',
    size: '3.4K',
    date: 'jul 22',
    desc: {
      en: 'Camping gear rental platform: dates, kit builder, WhatsApp checkout.',
      es: 'Plataforma de renta de equipo de campamento: fechas, armado de kit y confirmación por WhatsApp.',
      ja: 'キャンプ用品レンタル:日程、キット構成、WhatsApp確認。',
    },
    stack: 'Next.js · TypeScript · Cloudflare Workers',
    url: 'kampit.mkawashiro01.workers.dev',
    code: [
      'export function KitBuilder({ fechas }: { fechas: RangoFechas }) {',
      '  const { data: stock } = useDisponibilidad(fechas);',
      '  const [kit, dispatch] = useReducer(kitReducer, KIT_VACIO);',
      '',
      '  const confirmar = () => {',
      '    // Checkout sin fricción: resumen del kit directo a WhatsApp',
      '    const resumen = kit.items',
      '      .map((i) => `${i.cantidad}x ${i.nombre}`)',
      '      .join(", ");',
      '    window.open(waLink(fechas, resumen, precioTotal(kit)));',
      '  };',
      '',
      '  return <Resumen kit={kit} stock={stock} onConfirm={confirmar} />;',
      '}',
    ],
  },
  {
    filename: 'dinero-rapido-sgf.js',
    size: '2.9K',
    date: 'feb 03',
    desc: {
      en: 'Automated micro-lending CRM with flat-rate amortization and PDF receipts.',
      es: 'CRM de micropréstamos automatizado con amortización a tasa fija y recibos PDF.',
      ja: '固定金利償還とPDF領収書を備えた自動マイクロレンディングCRM。',
    },
    stack: 'Node.js · Express · MongoDB',
    code: [
      'function tablaDeAmortizacion(capital, tasaMensual, cuotas) {',
      '  // Tasa fija (flat): el interés se calcula sobre el capital inicial',
      '  const interesTotal = capital * tasaMensual * cuotas;',
      '  const cuotaFija = (capital + interesTotal) / cuotas;',
      '',
      '  return Array.from({ length: cuotas }, (_, i) => ({',
      '    numero: i + 1,',
      '    vence: sumarMeses(new Date(), i + 1),',
      '    cuota: redondearRD(cuotaFija),',
      '    balance: redondearRD((capital + interesTotal) - cuotaFija * (i + 1)),',
      '  }));',
      '}',
    ],
  },
  {
    filename: 'kawashiro-dev.py',
    size: '1.7K',
    date: 'jul 22',
    desc: {
      en: 'This very site: dual-mode portfolio served from a Raspberry Pi via Cloudflare Tunnel.',
      es: 'Este mismo sitio: portafolio de doble modo servido desde una Raspberry Pi vía túnel de Cloudflare.',
      ja: 'このサイト自体:Cloudflare Tunnel経由でRaspberry Piから配信されるデュアルモードポートフォリオ。',
    },
    stack: 'Astro · React · FastAPI · Docker · Cloudflare Zero Trust',
    url: 'kawashiro.dev',
    code: [
      'async def hardware_telemetry_generator(request: Request):',
      '    """Métricas reales del SoC BCM2712, vía Server-Sent Events."""',
      '    while True:',
      '        if await request.is_disconnected():',
      '            break',
      '        yield {',
      '            "event": "telemetry",',
      '            "data": json.dumps({',
      '                "cpu_usage": psutil.cpu_percent(interval=None),',
      '                "ram_usage": psutil.virtual_memory().percent,',
      '            }),',
      '        }',
      '        await asyncio.sleep(1.5)',
    ],
  },
];

/** Salida estilo `ls -l` del directorio virtual de proyectos. */
export function listProjects(): string[] {
  const rows = PROJECT_FILES.map(
    (f) =>
      `-rw-r--r--  1 mitsunori dev  ${f.size.padStart(5)}  ${f.date}  ${f.filename}`,
  );
  return [`total ${PROJECT_FILES.length}`, ...rows];
}

/** Contenido de `cat <archivo>`: ficha (texto) + extracto de código (para CodeBlock). */
export function catProject(
  filename: string,
  locale: Locale,
): { meta: string[]; code: string[] } | null {
  const file = PROJECT_FILES.find((f) => f.filename === filename);
  if (!file) return null;

  const meta = [
    `# ${file.filename}`,
    file.desc[locale] ?? file.desc.en,
    `Stack: ${file.stack}`,
  ];
  if (file.url) meta.push(`URL: https://${file.url}`);
  return { meta, code: file.code };
}

/** Resuelve el destino de `open <nombre>`: por nombre de proyecto o archivo. */
export function resolveOpenTarget(query: string): { name: string; url: string } | null {
  const q = query.toLowerCase();
  for (const f of PROJECT_FILES) {
    if (!f.url) continue;
    const stem = f.filename.replace(/\.[a-z]+$/, '');
    if (q === f.filename || q === stem || stem.includes(q) || q.includes(stem.split('-')[0])) {
      return { name: stem, url: `https://${f.url}` };
    }
  }
  return null;
}
