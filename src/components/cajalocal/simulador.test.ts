import { describe, it, expect } from 'vitest';
import { calcularPrestamo } from './simulador';
import { esDiaLaborable, proximaFechaLaborable, domingoDePascua } from './fechas';

describe('calcularPrestamo — amortización flat', () => {
  it('reparte capital e interés y cuadra el total exacto', () => {
    // 50000 al 15% en 10 cuotas mensuales
    const r = calcularPrestamo(50000, 15, 10, 'MENSUAL', '2026-01-15')!;
    expect(r).not.toBeNull();
    expect(r.capitalTotal).toBe(50000);
    expect(r.interesTotal).toBe(7500); // 50000 * 0.15
    expect(r.granTotal).toBe(57500);
    // La suma de las cuotas debe igualar EXACTAMENTE el gran total (sin centavos perdidos)
    const sumaCapital = r.cronograma.reduce((s, c) => s + c.capital, 0);
    const sumaInteres = r.cronograma.reduce((s, c) => s + c.interes, 0);
    expect(sumaCapital).toBe(50000);
    expect(sumaInteres).toBe(7500);
    expect(r.cronograma).toHaveLength(10);
  });

  it('la última cuota absorbe el residuo del redondeo', () => {
    // 10000 en 3 cuotas: 10000/3 = 3333.33 → base 3333, última 3334
    const r = calcularPrestamo(10000, 0, 3, 'MENSUAL', '2026-03-02')!;
    expect(r.cronograma[0].capital).toBe(3333);
    expect(r.cronograma[1].capital).toBe(3333);
    expect(r.cronograma[2].capital).toBe(10000 - 3333 * 2); // 3334
    expect(r.cronograma.reduce((s, c) => s + c.capital, 0)).toBe(10000);
  });

  it('calcula la tasa mensual equivalente según la frecuencia', () => {
    // 12% total en 12 cuotas mensuales = 12 meses → 12/12 = 1.00 %/mes
    expect(calcularPrestamo(1000, 12, 12, 'MENSUAL', '2026-01-05')!.tasaMensual).toBe('1.00');
    // 12 cuotas semanales ≈ 3 meses → 12/3 = 4.00 %/mes
    expect(calcularPrestamo(1000, 12, 12, 'SEMANAL', '2026-01-05')!.tasaMensual).toBe('4.00');
  });

  it('rechaza entradas inválidas', () => {
    expect(calcularPrestamo(0, 15, 10, 'MENSUAL', '2026-01-15')).toBeNull();
    expect(calcularPrestamo(50000, 15, 0, 'MENSUAL', '2026-01-15')).toBeNull();
  });

  it('ningún vencimiento cae en domingo ni feriado', () => {
    const r = calcularPrestamo(90000, 20, 30, 'DIARIA', '2026-12-20')!;
    for (const cuota of r.cronograma) {
      const [d, m, y] = cuota.vencimiento.split('/').map(Number);
      expect(esDiaLaborable(new Date(y, m - 1, d))).toBe(true);
    }
  });
});

describe('días laborables', () => {
  it('mueve un domingo al lunes siguiente', () => {
    // 2026-07-26 es domingo
    const domingo = new Date(2026, 6, 26);
    expect(domingo.getDay()).toBe(0);
    const mov = proximaFechaLaborable(domingo);
    expect(mov.getDay()).toBe(1); // lunes
    expect(mov.getDate()).toBe(27);
  });

  it('marca 24 y 25 de diciembre como no laborables', () => {
    expect(esDiaLaborable(new Date(2026, 11, 24))).toBe(false);
    expect(esDiaLaborable(new Date(2026, 11, 25))).toBe(false);
  });

  it('calcula el Domingo de Pascua (computus) correctamente', () => {
    // Valores conocidos del algoritmo gregoriano
    expect(domingoDePascua(2026).getMonth()).toBe(3); // abril
    expect(domingoDePascua(2026).getDate()).toBe(5);
    expect(domingoDePascua(2027).getMonth()).toBe(2); // marzo
    expect(domingoDePascua(2027).getDate()).toBe(28);
  });

  it('la Semana Santa completa es no laborable', () => {
    const pascua = domingoDePascua(2026); // 5 abril
    const juevesSanto = new Date(pascua);
    juevesSanto.setDate(pascua.getDate() - 3);
    expect(esDiaLaborable(juevesSanto)).toBe(false);
    expect(esDiaLaborable(pascua)).toBe(false);
  });
});
