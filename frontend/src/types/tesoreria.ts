import { z } from "zod";

// ─── Primitivos reutilizables ─────────────────────────────────────────────────

// Coerces NaN (empty number inputs) to 0 — used for optional numeric fields.
const num = () => z.number().catch(0);
const posNum = () => z.number().positive();
const intPos = () => z.number().int().positive();

// ─── Sub-schemas ──────────────────────────────────────────────────────────────

export const cuentaVariaSchema = z.object({
  detalle: z.string().min(1, "Requerido"),
  valor: num(),
});

export const miembroSchema = z.object({
  nombre: z.string().min(2, "Ingrese el nombre completo"),
  cedula: intPos(),
  aportes: posNum(),
  num_cuotas: z.number().int().min(1),
  fecha_recibo: z.string().min(1, "Requerido"),
  num_recibo: z.string().min(1, "Requerido"),
  cuentas_varias: z.array(cuentaVariaSchema).max(3),
});

export const organizacionSchema = z.object({
  diocesis: z.string().min(1, "Requerido"),
  codigo_diocesis: z.number().int().positive(),
  santuario: z.string().min(1, "Requerido"),
  codigo_santuario: z.number().int().min(1, "Seleccione un santuario").max(99),
  mes_anio: z.string().min(1, "Requerido"),
});

export const otraEntradaSchema = z.object({
  concepto: z.string().min(1, "Requerido"),
  valor: num(),
});

export const salidaAdminItemSchema = z.object({
  fecha: z.string(),
  valor: num(),
});

export const salidaItemSchema = z.object({
  concepto: z.string(),
  valor: num(),
});

export const actividadLumisialSchema = z.object({
  concepto: z.string().min(1, "Requerido"),
  valor: num(),
});

export const cuadreCajaSchema = z.object({
  comprobante_inicial: intPos(),
  recibo_desde: intPos(),
  recibo_hasta: intPos(),
  voucher_desde: intPos(),
  voucher_hasta: intPos(),
  saldo_anterior: num(),
  obolo: num(),
  cuentas_por_pagar: num(),
});

export const tesoreríaFormSchema = z.object({
  organizacion: organizacionSchema,
  miembros: z.array(miembroSchema).max(150),
  otras_entradas: z.array(otraEntradaSchema).max(15),
  salidas_admin: z.array(salidaAdminItemSchema).max(7),
  salidas_1008: z.array(salidaItemSchema).max(16),
  salidas_lumisial: z.array(salidaItemSchema).max(25),
  actividades_lumisial: z.array(actividadLumisialSchema),
  cuadre_caja: cuadreCajaSchema,
});

export type TesoreríaFormValues = z.infer<typeof tesoreríaFormSchema>;

// ─── API payload type (voucher_numbers as plain strings) ──────────────────────

export interface TesoreríaData {
  organizacion: z.infer<typeof organizacionSchema> & { mes_anio: string };
  miembros: z.infer<typeof miembroSchema>[];
  otras_entradas: z.infer<typeof otraEntradaSchema>[];
  salidas_admin: (Omit<z.infer<typeof salidaAdminItemSchema>, "fecha"> & { fecha: string | null })[];
  salidas_1008: z.infer<typeof salidaItemSchema>[];
  salidas_lumisial: z.infer<typeof salidaItemSchema>[];
  actividades_lumisial: z.infer<typeof actividadLumisialSchema>[];
  cuadre_caja: z.infer<typeof cuadreCajaSchema>;
}

export function toApiPayload(form: TesoreríaFormValues): TesoreríaData {
  return { ...form };
}

// ─── Constants ────────────────────────────────────────────────────────────────

export const DIOCESIS_LIST = [
  { nombre: "CAUCA", codigo: 23 },
] as const;

export const SANTUARIOS_LIST = [
  { nombre: "MICHAEL", codigo: 7 },
  { nombre: "YOD-HE-VAV-HE", codigo: 8 },
  { nombre: "LAKSHMI", codigo: 9 },
  { nombre: "RAMZU", codigo: 10 },
  { nombre: "MELQUISEDEC", codigo: 11 },
  { nombre: "URIEL-VENUS", codigo: 12 },
] as const;

export const CONCEPTOS_ADMIN = [
  "Impuesto predial",
  "Servicio Telefonía e Internet",
  "Servicio Público de Agua",
  "Servicio Público de Energía",
  "Servicio Público de Gas",
  "Arriendo / Pago cuota Lumisial",
  "",
];

export const CONCEPTOS_LUMISIAL = [
  "FLORES",
  "UVAS",
  "COPAS",
  "OASIS",
  "VELAS",
  "ACEITE",
  "CARBON",
  "PAN",
];
