import type { TesoreríaFormValues } from "@/types/tesoreria";

export interface LineaEntregaFondos {
  concepto: string;
  valor: number;
}

export interface Preview1008 {
  lineas: LineaEntregaFondos[];
  total: number;
}

export function compute1008Preview(values: TesoreríaFormValues): Preview1008 {
  const miembros = values.miembros ?? [];
  const salidas1008 = values.salidas_1008 ?? [];

  let totalCuota = 0;
  let totalMision = 0;

  for (const m of miembros) {
    const aportes = m.aportes ?? 0;
    const cuotas = m.num_cuotas ?? 1;

    if (cuotas >= 2) {
      totalCuota += cuotas * 10_000;
      totalMision += cuotas * 3_000;
    } else {
      totalCuota += Math.min(aportes, 10_000);
      totalMision += aportes > 12_000 ? 3_000 : aportes === 12_000 ? 2_000 : 0;
    }
  }

  const lineas: LineaEntregaFondos[] = [];

  if (totalCuota > 0) lineas.push({ concepto: "Cuota Estatutaria", valor: totalCuota });
  if (totalMision > 0) lineas.push({ concepto: "Misión Diócesis", valor: totalMision });

  for (const s of salidas1008) {
    if ((s.valor ?? 0) > 0) {
      lineas.push({ concepto: s.concepto, valor: s.valor });
    }
  }

  return {
    lineas,
    total: lineas.reduce((sum, l) => sum + l.valor, 0),
  };
}

export function formatCOP(value: number): string {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}
