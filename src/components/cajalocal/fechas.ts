/**
 * fechas.ts — días laborables de CajaLocal, port fiel de frontend/src/fechas.js
 * del producto real. Regla: nadie paga domingos, Semana Santa (Jueves Santo a
 * Domingo de Pascua), 24-25 dic y 31 dic-1 ene; la cuota se mueve al siguiente
 * día laborable.
 */

const FERIADOS_FIJOS = new Set(['12-24', '12-25', '12-31', '1-1']);

export function domingoDePascua(anio: number): Date {
  const a = anio % 19;
  const b = Math.floor(anio / 100);
  const c = anio % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const mes = Math.floor((h + l - 7 * m + 114) / 31);
  const dia = ((h + l - 7 * m + 114) % 31) + 1;
  return new Date(anio, mes - 1, dia);
}

export function esDiaLaborable(fecha: Date): boolean {
  if (fecha.getDay() === 0) return false; // domingo
  if (FERIADOS_FIJOS.has(`${fecha.getMonth() + 1}-${fecha.getDate()}`)) return false;

  const pascua = domingoDePascua(fecha.getFullYear());
  const juevesSanto = new Date(pascua);
  juevesSanto.setDate(pascua.getDate() - 3);
  const t = new Date(fecha.getFullYear(), fecha.getMonth(), fecha.getDate()).getTime();
  if (t >= juevesSanto.getTime() && t <= pascua.getTime()) return false;

  return true;
}

export function proximaFechaLaborable(fecha: Date): Date {
  const f = new Date(fecha.getFullYear(), fecha.getMonth(), fecha.getDate());
  while (!esDiaLaborable(f)) f.setDate(f.getDate() + 1);
  return f;
}
