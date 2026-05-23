import { useFieldArray, useFormContext } from "react-hook-form";
import { Plus, Trash2 } from "lucide-react";
import { Button, Field, Input } from "@/components/ui";
import type { TesoreríaFormValues } from "@/types/tesoreria";

export function Step3OtrasEntradas() {
  const {
    register,
    control,
    formState: { errors },
  } = useFormContext<TesoreríaFormValues>();

  const { fields, append, remove } = useFieldArray({
    control,
    name: "otras_entradas",
  });

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-slate-500">
        Entradas extraordinarias o esporádicas que no son aportes de miembros.
        El Óbolo siempre va primero.
      </p>

      {/* OBOLO — fixed first item */}
      <div className="rounded-lg border border-violet-200 bg-violet-50 p-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
          <span className="text-sm font-medium text-violet-700 sm:w-32">ÓBOLO</span>
          <Input
            {...register("otras_entradas.0.valor", { valueAsNumber: true })}
            type="number"
            min={0}
            placeholder="$0"
            className="w-full sm:w-36"
            error={errors.otras_entradas?.[0]?.valor?.message}
          />
          {/* Hidden concept field */}
          <input
            type="hidden"
            {...register("otras_entradas.0.concepto")}
            value="OBOLO"
          />
        </div>
      </div>

      {/* Free items */}
      <div className="flex flex-col gap-2">
        {fields.slice(1).map((f, i) => {
          const idx = i + 1;
          return (
            <div key={f.id} className="flex gap-3 items-start">
              <Input
                {...register(`otras_entradas.${idx}.concepto`)}
                placeholder="Concepto"
                className="flex-1 text-sm"
                error={errors.otras_entradas?.[idx]?.concepto?.message}
              />
              <Input
                {...register(`otras_entradas.${idx}.valor`, {
                  valueAsNumber: true,
                })}
                type="number"
                min={0}
                placeholder="Valor $"
                className="w-36 text-sm"
                error={errors.otras_entradas?.[idx]?.valor?.message}
              />
              <button
                type="button"
                onClick={() => remove(idx)}
                className="p-2 text-red-400 hover:text-red-600 mt-0.5"
              >
                <Trash2 size={16} />
              </button>
            </div>
          );
        })}
      </div>

      {fields.length < 15 && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="self-start"
          onClick={() => append({ concepto: "", valor: 0 })}
        >
          <Plus size={14} /> Agregar entrada
        </Button>
      )}

      <Field
        label="Total Otras Entradas"
        error={undefined}
      >
        <div className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-mono text-slate-700">
          {new Intl.NumberFormat("es-CO", {
            style: "currency",
            currency: "COP",
            minimumFractionDigits: 0,
          }).format(0)}
          <span className="text-xs text-slate-400 ml-2">(calculado al generar)</span>
        </div>
      </Field>
    </div>
  );
}
