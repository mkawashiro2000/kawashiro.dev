import React, { useState, useEffect } from 'react';
import { useAppStore, type Locale } from '../../store/useAppStore';
import { calcularPrestamo, type Frecuencia } from './simulador';

/**
 * LoanSimulator — simulador de préstamos funcional de CajaLocal, con la MISMA
 * lógica que el producto real (interés flat, redondeo a pesos completos, última
 * cuota que cuadra el residuo, y vencimientos movidos a día laborable).
 * No guarda datos: todo el cálculo ocurre en el navegador.
 */

interface Cuota {
  numero: number;
  vencimiento: string;
  capital: number;
  interes: number;
  total: number;
}

interface Resumen {
  capitalTotal: number;
  interesTotal: number;
  granTotal: number;
  tasaMensual: string;
}

const T = {
  en: {
    title: 'Loan Simulator',
    subtitle: 'The real calculation engine from the product — flat interest, whole-peso rounding, and due dates shifted to the next business day. Nothing is saved.',
    name: 'Prospect name',
    namePh: 'Optional',
    capital: 'Capital (RD$)',
    rate: 'Total rate %',
    installments: 'Installments',
    frequency: 'Frequency',
    startDate: 'Start date',
    calc: 'Calculate',
    freq: { DIARIA: 'Daily', SEMANAL: 'Weekly', QUINCENAL: 'Biweekly', MENSUAL: 'Monthly' },
    docTitle: 'LOAN PROJECTION',
    docNote: 'Informative document',
    prospect: 'Prospect',
    noClient: 'Unregistered client',
    payments: 'payments',
    conditions: 'Conditions',
    requested: 'Requested capital',
    monthlyRate: 'Monthly rate',
    no: 'No.',
    due: 'Due date',
    cap: 'Capital',
    int: 'Interest',
    pay: 'Payment',
    totals: 'PROJECTED TOTALS',
    disclaimer: 'This is an informative simulation and does not represent a legal credit obligation until a formal contract is signed.',
  },
  es: {
    title: 'Simulador de Préstamos',
    subtitle: 'El motor de cálculo real del producto — interés flat, redondeo a pesos completos y vencimientos movidos al siguiente día laborable. No se guarda nada.',
    name: 'Nombre del prospecto',
    namePh: 'Opcional',
    capital: 'Capital (RD$)',
    rate: 'Tasa % total',
    installments: 'Cuotas',
    frequency: 'Frecuencia',
    startDate: 'Fecha inicio',
    calc: 'Calcular',
    freq: { DIARIA: 'Diaria', SEMANAL: 'Semanal', QUINCENAL: 'Quincenal', MENSUAL: 'Mensual' },
    docTitle: 'PROYECCIÓN DE PRÉSTAMO',
    docNote: 'Documento informativo',
    prospect: 'Prospecto',
    noClient: 'Cliente no registrado',
    payments: 'Pagos',
    conditions: 'Condiciones',
    requested: 'Capital solicitado',
    monthlyRate: 'Tasa mensual',
    no: 'No.',
    due: 'Vencimiento',
    cap: 'Capital',
    int: 'Interés',
    pay: 'Cuota a pagar',
    totals: 'TOTALES PROYECTADOS',
    disclaimer: 'Esta es una simulación informativa y no representa una obligación crediticia legal hasta la firma del contrato formal.',
  },
  ja: {
    title: 'ローンシミュレーター',
    subtitle: '製品の実際の計算エンジン — フラット金利、ペソ単位の丸め、翌営業日への支払日調整。データは保存されません。',
    name: '見込み客の名前',
    namePh: '任意',
    capital: '元金 (RD$)',
    rate: '総利率 %',
    installments: '分割回数',
    frequency: '頻度',
    startDate: '開始日',
    calc: '計算',
    freq: { DIARIA: '毎日', SEMANAL: '毎週', QUINCENAL: '隔週', MENSUAL: '毎月' },
    docTitle: 'ローン予測',
    docNote: '情報提供書類',
    prospect: '見込み客',
    noClient: '未登録の顧客',
    payments: '支払い',
    conditions: '条件',
    requested: '申請元金',
    monthlyRate: '月利',
    no: 'No.',
    due: '支払期日',
    cap: '元金',
    int: '利息',
    pay: '支払額',
    totals: '予測合計',
    disclaimer: 'これは情報提供のためのシミュレーションであり、正式な契約に署名するまで法的な信用義務を表すものではありません。',
  },
};

const dop = (n: number) =>
  new Intl.NumberFormat('es-DO', {
    style: 'currency',
    currency: 'DOP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(n);

// Paleta del producto real (CajaLocal)
const NAVY = '#17385A';
const BLUE = '#2494E2';

export const LoanSimulator: React.FC = () => {
  const locale = useAppStore((s) => s.locale);
  const setLocale = useAppStore((s) => s.setLocale);
  const t = T[locale] ?? T.en;

  // El selector EN/ES/JA de esta página es HTML estático (i18n.js): sin esto,
  // la isla React no se enteraría del cambio y quedaría en el idioma de carga.
  useEffect(() => {
    const onLocaleChange = (e: Event) => {
      const next = (e as CustomEvent<{ locale: Locale }>).detail?.locale;
      if (next) setLocale(next);
    };
    document.addEventListener('kawashiro:localechange', onLocaleChange);
    return () => document.removeEventListener('kawashiro:localechange', onLocaleChange);
  }, [setLocale]);

  const [form, setForm] = useState({
    nombre: '',
    capital: '50000',
    tasa: '15',
    cuotas: '12',
    frecuencia: 'MENSUAL' as Frecuencia,
    fecha: new Date().toISOString().split('T')[0],
  });
  const [cronograma, setCronograma] = useState<Cuota[]>([]);
  const [resumen, setResumen] = useState<Resumen | null>(null);

  const calcular = (e: React.FormEvent) => {
    e.preventDefault();
    const r = calcularPrestamo(
      parseFloat(form.capital),
      parseFloat(form.tasa),
      parseInt(form.cuotas, 10),
      form.frecuencia,
      form.fecha,
    );
    if (!r) return;
    setCronograma(r.cronograma);
    setResumen({
      capitalTotal: r.capitalTotal,
      interesTotal: r.interesTotal,
      granTotal: r.granTotal,
      tasaMensual: r.tasaMensual,
    });
  };

  const field = 'w-full rounded-lg px-3 py-2.5 text-sm outline-none border transition-colors';
  const fieldStyle: React.CSSProperties = {
    backgroundColor: 'var(--color-bg-secondary)',
    borderColor: 'color-mix(in srgb, var(--color-text-muted) 30%, transparent)',
    color: 'var(--color-text-main)',
  };
  const label = 'block mb-1.5 text-[0.7rem] font-bold uppercase tracking-wider';

  return (
    <div>
      <h3 className="font-display text-2xl sm:text-3xl font-semibold mb-1" style={{ color: 'var(--color-text-main)' }}>
        {t.title}
      </h3>
      <p className="mb-6 opacity-70 max-w-2xl" style={{ color: 'var(--color-text-main)' }}>
        {t.subtitle}
      </p>

      <form
        onSubmit={calcular}
        className="rounded-2xl p-5 mb-8 flex flex-wrap gap-3 items-end"
        style={{ backgroundColor: 'var(--color-bg-secondary)', border: '1px solid color-mix(in srgb, var(--color-text-muted) 20%, transparent)' }}
      >
        <div className="flex-[2_1_180px]">
          <label className={label} style={{ color: 'var(--color-text-muted)' }}>{t.name}</label>
          <input className={field} style={fieldStyle} placeholder={t.namePh} value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} />
        </div>
        <div className="flex-[1_1_110px]">
          <label className={label} style={{ color: 'var(--color-text-muted)' }}>{t.capital}</label>
          <input className={field} style={fieldStyle} type="number" step="1" required value={form.capital} onChange={(e) => setForm({ ...form, capital: e.target.value })} />
        </div>
        <div className="flex-[1_1_90px]">
          <label className={label} style={{ color: 'var(--color-text-muted)' }}>{t.rate}</label>
          <input className={field} style={fieldStyle} type="number" step="0.1" required value={form.tasa} onChange={(e) => setForm({ ...form, tasa: e.target.value })} />
        </div>
        <div className="flex-[1_1_80px]">
          <label className={label} style={{ color: 'var(--color-text-muted)' }}>{t.installments}</label>
          <input className={field} style={fieldStyle} type="number" required value={form.cuotas} onChange={(e) => setForm({ ...form, cuotas: e.target.value })} />
        </div>
        <div className="flex-[1_1_120px]">
          <label className={label} style={{ color: 'var(--color-text-muted)' }}>{t.frequency}</label>
          <select className={field} style={fieldStyle} value={form.frecuencia} onChange={(e) => setForm({ ...form, frecuencia: e.target.value as Frecuencia })}>
            <option value="DIARIA">{t.freq.DIARIA}</option>
            <option value="SEMANAL">{t.freq.SEMANAL}</option>
            <option value="QUINCENAL">{t.freq.QUINCENAL}</option>
            <option value="MENSUAL">{t.freq.MENSUAL}</option>
          </select>
        </div>
        <div className="flex-[1_1_140px]">
          <label className={label} style={{ color: 'var(--color-text-muted)' }}>{t.startDate}</label>
          <input className={field} style={fieldStyle} type="date" required value={form.fecha} onChange={(e) => setForm({ ...form, fecha: e.target.value })} />
        </div>
        <button
          type="submit"
          className="px-6 py-2.5 rounded-lg font-bold text-sm transition-transform hover:scale-105 whitespace-nowrap"
          style={{ backgroundColor: BLUE, color: '#ffffff', minHeight: 44 }}
        >
          🧮 {t.calc}
        </button>
      </form>

      {resumen && cronograma.length > 0 && (
        <div className="rounded-2xl overflow-hidden shadow-xl" style={{ background: '#ffffff', color: '#1a1a1a' }}>
          <div className="p-6 sm:p-8">
            {/* Encabezado del documento (estilo del recibo real) */}
            <div className="flex items-center justify-between flex-wrap gap-3 pb-4 mb-6" style={{ borderBottom: `2px solid ${NAVY}` }}>
              <img src="/img/proyectos/cajalocal.webp" alt="CajaLocal" style={{ maxHeight: 48 }} />
              <div className="text-right">
                <div className="text-lg font-bold tracking-wide" style={{ color: NAVY }}>{t.docTitle}</div>
                <div className="text-xs" style={{ color: '#6b7280' }}>
                  {t.docNote} · {form.fecha.split('-').reverse().join('/')}
                </div>
              </div>
            </div>

            <div className="flex justify-between flex-wrap gap-4 mb-6 text-sm">
              <div>
                <div className="text-[0.7rem] uppercase tracking-wide font-bold mb-1" style={{ color: '#6b7280' }}>{t.prospect}</div>
                <div className="font-semibold">{form.nombre || t.noClient}</div>
                <div style={{ color: '#374151' }}>{t.freq[form.frecuencia]} — {t.payments}</div>
              </div>
              <div className="text-right">
                <div className="text-[0.7rem] uppercase tracking-wide font-bold mb-1" style={{ color: '#6b7280' }}>{t.conditions}</div>
                <div><span style={{ color: '#374151' }}>{t.requested}:</span> <strong>{dop(resumen.capitalTotal)}</strong></div>
                <div><span style={{ color: '#374151' }}>{t.monthlyRate}:</span> <strong>{resumen.tasaMensual}%</strong></div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm" style={{ borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: `2px solid ${NAVY}` }}>
                    {[t.no, t.due, t.cap, t.int, t.pay].map((h, i) => (
                      <th key={i} className="py-2.5 px-3 text-[0.68rem] font-bold uppercase tracking-wide" style={{ color: NAVY, textAlign: i === 0 ? 'center' : i === 1 ? 'left' : 'right' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {cronograma.map((c) => (
                    <tr key={c.numero}>
                      <td className="py-2 px-3 text-center" style={{ borderBottom: '1px solid #d1d5db' }}>{c.numero}</td>
                      <td className="py-2 px-3" style={{ borderBottom: '1px solid #d1d5db' }}>{c.vencimiento}</td>
                      <td className="py-2 px-3 text-right" style={{ borderBottom: '1px solid #d1d5db' }}>{dop(c.capital)}</td>
                      <td className="py-2 px-3 text-right" style={{ borderBottom: '1px solid #d1d5db' }}>{dop(c.interes)}</td>
                      <td className="py-2 px-3 text-right font-bold" style={{ borderBottom: '1px solid #d1d5db' }}>{dop(c.total)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="font-bold" style={{ borderTop: `2px solid ${NAVY}` }}>
                    <td colSpan={2} className="py-3 px-3 text-right">{t.totals}</td>
                    <td className="py-3 px-3 text-right">{dop(resumen.capitalTotal)}</td>
                    <td className="py-3 px-3 text-right">{dop(resumen.interesTotal)}</td>
                    <td className="py-3 px-3 text-right" style={{ color: NAVY }}>{dop(resumen.granTotal)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>

            <p className="text-center text-xs mt-5 leading-relaxed" style={{ color: '#9ca3af' }}>{t.disclaimer}</p>
          </div>
        </div>
      )}
    </div>
  );
};
