import { useState } from "react";
import { useFieldArray, useFormContext } from "react-hook-form";
import { Plus, Trash2 } from "lucide-react";
import { Button, Field, Input } from "@/components/ui";
import { cn } from "@/components/ui";
import { CONCEPTOS_ADMIN, CONCEPTOS_LUMISIAL } from "@/types/tesoreria";
import type { TesoreríaFormValues } from "@/types/tesoreria";

type Tab = "admin" | "1008" | "lumisial";

export function Step4Salidas() {
  const [tab, setTab] = useState<Tab>("admin");

  return (
    <div className="flex flex-col gap-4">
      {/* Tabs */}
      <div className="flex gap-1 rounded-lg bg-slate-100 p-1">
        {(["admin", "1008", "lumisial"] as Tab[]).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={cn(
              "flex-1 rounded-md py-1.5 text-xs font-medium transition-colors",
              tab === t
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-500 hover:text-slate-700"
            )}
          >
            {t === "admin" && "Administración"}
            {t === "1008" && "Formato 1008"}
            {t === "lumisial" && "Lumisial"}
          </button>
        ))}
      </div>

      {tab === "admin" && <SalidasAdmin />}
      {tab === "1008" && <Salidas1008 />}
      {tab === "lumisial" && <SalidasLumisial />}
    </div>
  );
}

// ─── Salidas de Administración ───────────────────────────────────────────────

function SalidasAdmin() {
  const { register, formState: { errors } } = useFormContext<TesoreríaFormValues>();

  return (
    <div className="flex flex-col gap-3">
      <p className="text-xs text-slate-500">
        Gastos fijos del mes. Solo completá los que aplican.
      </p>
      {CONCEPTOS_ADMIN.map((concepto, i) => (
        <div key={i} className="flex flex-col gap-1.5 sm:flex-row sm:items-center sm:gap-3">
          <span className="text-xs font-medium text-slate-500 sm:text-sm sm:text-slate-600 sm:w-56 sm:flex-shrink-0">
            {concepto || <span className="italic">Otro</span>}
          </span>
          <div className="flex gap-2">
            <div className="flex-1 min-w-0">
              <Input
                {...register(`salidas_admin.${i}.fecha`)}
                type="date"
                className="w-full text-xs"
              />
            </div>
            <Input
              {...register(`salidas_admin.${i}.valor`, { valueAsNumber: true })}
              type="number"
              min={0}
              placeholder="$0"
              className="w-24 text-xs sm:w-32"
              error={errors.salidas_admin?.[i]?.valor?.message}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Salidas Formato 1008 ─────────────────────────────────────────────────────

function Salidas1008() {
  const { register, control, formState: { errors } } = useFormContext<TesoreríaFormValues>();
  const { fields, append, remove } = useFieldArray({ control, name: "salidas_1008" });

  return (
    <div className="flex flex-col gap-3">
      <p className="text-xs text-slate-500">
        Fondos enviados a la Tesorería Diocesana. El Óbolo siempre es el primer ítem.
      </p>

      <Field label="N° Comprobante inicial" required>
        <Input
          {...register("cuadre_caja.comprobante_inicial", { valueAsNumber: true })}
          type="number"
          min={1}
          placeholder="100"
          className="w-32 text-sm"
        />
      </Field>

      {/* OBOLO — fixed */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3 rounded-lg border border-violet-200 bg-violet-50 p-3">
        <span className="text-sm font-medium text-violet-700 sm:w-56 sm:flex-shrink-0">ÓBOLO</span>
        <Input
          {...register("salidas_1008.0.valor", { valueAsNumber: true })}
          type="number"
          min={0}
          placeholder="$0"
          className="w-full sm:w-32 text-xs"
          error={errors.salidas_1008?.[0]?.valor?.message}
        />
        <input type="hidden" {...register("salidas_1008.0.concepto")} value="OBOLO" />
      </div>

      {fields.slice(1).map((f, i) => {
        const idx = i + 1;
        return (
          <div key={f.id} className="flex items-center gap-3">
            <Input
              {...register(`salidas_1008.${idx}.concepto`)}
              placeholder="Concepto"
              className="flex-1 text-sm"
            />
            <Input
              {...register(`salidas_1008.${idx}.valor`, { valueAsNumber: true })}
              type="number"
              min={0}
              placeholder="$0"
              className="w-32 text-xs"
              error={errors.salidas_1008?.[idx]?.valor?.message}
            />
            <button
              type="button"
              onClick={() => remove(idx)}
              className="p-1.5 text-red-400 hover:text-red-600"
            >
              <Trash2 size={15} />
            </button>
          </div>
        );
      })}

      {fields.length < 16 && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="self-start"
          onClick={() => append({ concepto: "", valor: 0 })}
        >
          <Plus size={14} /> Agregar ítem
        </Button>
      )}
    </div>
  );
}

// ─── Salidas Lumisial ─────────────────────────────────────────────────────────

function SalidasLumisial() {
  const { register, control, formState: { errors } } = useFormContext<TesoreríaFormValues>();
  const { fields, append, remove } = useFieldArray({ control, name: "salidas_lumisial" });

  return (
    <div className="flex flex-col gap-3">
      <p className="text-xs text-slate-500">
        Gastos operativos del Lumisial. Los 8 primeros conceptos son fijos.
      </p>

      {/* Pre-filled concepts */}
      {CONCEPTOS_LUMISIAL.map((concepto, i) => {
        const existingIdx = fields.findIndex(
          (f) => (f as { concepto: string }).concepto.toUpperCase() === concepto
        );
        const idx = existingIdx >= 0 ? existingIdx : i;
        return (
          <div key={concepto} className="flex items-center gap-3">
            <span className="text-sm text-slate-600 w-28 flex-shrink-0">{concepto}</span>
            <Input
              {...register(`salidas_lumisial.${idx}.valor`, { valueAsNumber: true })}
              type="number"
              min={0}
              placeholder="$0"
              className="w-32 text-xs"
              error={errors.salidas_lumisial?.[idx]?.valor?.message}
            />
            <input
              type="hidden"
              {...register(`salidas_lumisial.${idx}.concepto`)}
              value={concepto}
            />
          </div>
        );
      })}

      <div className="border-t border-slate-200 pt-3 flex flex-col gap-2">
        {fields.slice(CONCEPTOS_LUMISIAL.length).map((f, i) => {
          const idx = CONCEPTOS_LUMISIAL.length + i;
          return (
            <div key={f.id} className="flex items-center gap-3">
              <Input
                {...register(`salidas_lumisial.${idx}.concepto`)}
                placeholder="Concepto"
                className="flex-1 text-sm"
              />
              <Input
                {...register(`salidas_lumisial.${idx}.valor`, { valueAsNumber: true })}
                type="number"
                min={0}
                placeholder="$0"
                className="w-32 text-xs"
              />
              <button
                type="button"
                onClick={() => remove(idx)}
                className="p-1.5 text-red-400 hover:text-red-600"
              >
                <Trash2 size={15} />
              </button>
            </div>
          );
        })}
      </div>

      {fields.length < 25 && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="self-start"
          onClick={() => append({ concepto: "", valor: 0 })}
        >
          <Plus size={14} /> Agregar ítem
        </Button>
      )}
    </div>
  );
}
