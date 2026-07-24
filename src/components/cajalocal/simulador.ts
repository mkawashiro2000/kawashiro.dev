/**
 * simulador.ts — lógica pura de amortización de CajaLocal, extraída del
 * componente para poder testearla. Interés flat, redondeo a pesos completos,
 * última cuota que cuadra el residuo, vencimientos en día laborable.
 */
import { proximaFechaLaborable } from './fechas';

export type Frecuencia = 'DIARIA' | 'SEMANAL' | 'QUINCENAL' | 'MENSUAL';

export interface Cuota {
  numero: number;
  vencimiento: string; // dd/mm/yyyy
  capital: number;
  interes: number;
  total: number;
}

export interface Resultado {
  cronograma: Cuota[];
  capitalTotal: number;
  interesTotal: number;
  granTotal: number;
  tasaMensual: string;
}

const addMonths = (date: Date, n: number): Date => {
  const diaOriginal = date.getDate();
  const d = new Date(date.getFullYear(), date.getMonth() + n, 1);
  const ultimoDia = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
  d.setDate(Math.min(diaOriginal, ultimoDia));
  return d;
};

export function calcularPrestamo(
  montoRaw: number,
  tasaPct: number,
  cuotas: number,
  frecuencia: Frecuencia,
  fechaISO: string,
): Resultado | null {
  const monto = Math.round(montoRaw);
  const tasa = tasaPct / 100;
  const cantidad = Math.trunc(cuotas);
  if (!monto || monto < 1 || !cantidad || cantidad < 1 || isNaN(tasa)) return null;

  const interesTotal = Math.round(monto * tasa);
  const capitalBase = Math.round(monto / cantidad);
  const interesBase = Math.round(interesTotal / cantidad);

  let duracionMeses = cantidad;
  if (frecuencia === 'DIARIA') duracionMeses = cantidad / 30;
  else if (frecuencia === 'SEMANAL') duracionMeses = cantidad / 4;
  else if (frecuencia === 'QUINCENAL') duracionMeses = cantidad / 2;
  if (duracionMeses <= 0) duracionMeses = 1;
  const tasaMensual = (tasaPct / duracionMeses).toFixed(2);

  const [y, m, d] = fechaISO.split('-').map((n) => parseInt(n, 10));
  let fecha = new Date(y, m - 1, d);
  const pad = (n: number) => (n < 10 ? '0' + n : '' + n);
  const cronograma: Cuota[] = [];

  for (let i = 1; i <= cantidad; i++) {
    if (frecuencia === 'DIARIA') fecha.setDate(fecha.getDate() + 1);
    else if (frecuencia === 'SEMANAL') fecha.setDate(fecha.getDate() + 7);
    else if (frecuencia === 'QUINCENAL') fecha.setDate(fecha.getDate() + 15);
    else fecha = addMonths(fecha, 1);

    const fc = proximaFechaLaborable(fecha);
    const esUltima = i === cantidad;
    const capital = esUltima ? monto - capitalBase * (cantidad - 1) : capitalBase;
    const interes = esUltima ? interesTotal - interesBase * (cantidad - 1) : interesBase;
    cronograma.push({
      numero: i,
      vencimiento: `${pad(fc.getDate())}/${pad(fc.getMonth() + 1)}/${fc.getFullYear()}`,
      capital,
      interes,
      total: capital + interes,
    });
  }

  return { cronograma, capitalTotal: monto, interesTotal, granTotal: monto + interesTotal, tasaMensual };
}
