import { describe, expect, it } from "vitest";

import {
  cuentaVariaSchema,
  cuadreCajaSchema,
  miembroSchema,
  organizacionSchema,
  tesoreríaFormSchema,
  toApiPayload,
} from "./tesoreria";

// ─── organizacionSchema ───────────────────────────────────────────────────────

describe("organizacionSchema", () => {
  const valid = {
    diocesis: "CAUCA",
    codigo_diocesis: 23,
    santuario: "MICHAEL",
    codigo_santuario: 7,
    mes_anio: "2026-01",
  };

  it("accepts a fully valid organization", () => {
    expect(organizacionSchema.safeParse(valid).success).toBe(true);
  });

  it("rejects an empty diocesis string", () => {
    expect(organizacionSchema.safeParse({ ...valid, diocesis: "" }).success).toBe(false);
  });

  it("rejects codigo_santuario = 0", () => {
    expect(organizacionSchema.safeParse({ ...valid, codigo_santuario: 0 }).success).toBe(false);
  });

  it("rejects codigo_santuario > 99", () => {
    expect(organizacionSchema.safeParse({ ...valid, codigo_santuario: 100 }).success).toBe(false);
  });

  it("rejects an empty mes_anio", () => {
    expect(organizacionSchema.safeParse({ ...valid, mes_anio: "" }).success).toBe(false);
  });
});

// ─── miembroSchema ────────────────────────────────────────────────────────────

describe("miembroSchema", () => {
  const valid = {
    nombre: "Juan Pérez",
    cedula: 12345678,
    aportes: 100,
    num_cuotas: 1,
    fecha_recibo: "2026-01-01",
    num_recibo: "001",
    cuentas_varias: [],
  };

  it("accepts a fully valid member", () => {
    expect(miembroSchema.safeParse(valid).success).toBe(true);
  });

  it("rejects nombre shorter than 2 characters", () => {
    expect(miembroSchema.safeParse({ ...valid, nombre: "J" }).success).toBe(false);
  });

  it("rejects cedula = 0 (intPos constraint)", () => {
    expect(miembroSchema.safeParse({ ...valid, cedula: 0 }).success).toBe(false);
  });

  it("rejects negative cedula", () => {
    expect(miembroSchema.safeParse({ ...valid, cedula: -1 }).success).toBe(false);
  });

  it("rejects aportes = 0 (posNum constraint)", () => {
    expect(miembroSchema.safeParse({ ...valid, aportes: 0 }).success).toBe(false);
  });

  it("rejects more than 3 cuentas_varias", () => {
    const cv = { detalle: "Extra", valor: 0 };
    expect(
      miembroSchema.safeParse({ ...valid, cuentas_varias: [cv, cv, cv, cv] }).success
    ).toBe(false);
  });
});

// ─── cuadreCajaSchema ─────────────────────────────────────────────────────────

describe("cuadreCajaSchema", () => {
  const valid = {
    comprobante_inicial: 100,
    recibo_desde: 1,
    recibo_hasta: 1,
    voucher_desde: 100,
    voucher_hasta: 100,
    saldo_anterior: 0,
    obolo: 0,
    cuentas_por_pagar: 0,
  };

  it("accepts valid cuadre data", () => {
    expect(cuadreCajaSchema.safeParse(valid).success).toBe(true);
  });

  it("rejects comprobante_inicial = 0", () => {
    expect(cuadreCajaSchema.safeParse({ ...valid, comprobante_inicial: 0 }).success).toBe(false);
  });

  it("rejects non-integer recibo_desde", () => {
    expect(cuadreCajaSchema.safeParse({ ...valid, recibo_desde: 1.5 }).success).toBe(false);
  });
});

// ─── num() coercion via cuentaVariaSchema ─────────────────────────────────────

describe("num() — NaN coercion", () => {
  it("coerces NaN valor to 0 instead of throwing", () => {
    const result = cuentaVariaSchema.safeParse({ detalle: "Varios", valor: NaN });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.valor).toBe(0);
  });
});

// ─── toApiPayload ─────────────────────────────────────────────────────────────

describe("toApiPayload", () => {
  it("is a pass-through — returned object structurally equals the input", () => {
    const form = tesoreríaFormSchema.parse({
      organizacion: {
        diocesis: "CAUCA",
        codigo_diocesis: 23,
        santuario: "MICHAEL",
        codigo_santuario: 7,
        mes_anio: "2026-01",
      },
      miembros: [],
      otras_entradas: [{ concepto: "OBOLO", valor: 0 }],
      salidas_admin: [{ fecha: "", valor: 0 }],
      salidas_1008: [{ concepto: "OBOLO", valor: 0 }],
      salidas_lumisial: [],
      actividades_lumisial: [],
      cuadre_caja: {
        comprobante_inicial: 1,
        recibo_desde: 1,
        recibo_hasta: 1,
        voucher_desde: 1,
        voucher_hasta: 1,
        saldo_anterior: 0,
        obolo: 0,
        cuentas_por_pagar: 0,
      },
    });

    expect(toApiPayload(form)).toEqual(form);
  });
});
