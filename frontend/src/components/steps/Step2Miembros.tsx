import { useState } from "react";
import { useFieldArray, useFormContext } from "react-hook-form";
import { ChevronDown, ChevronUp, Plus, Trash2 } from "lucide-react";
import { Button, Field, Input } from "@/components/ui";
import { cn } from "@/components/ui";
import type { TesoreríaFormValues } from "@/types/tesoreria";

export function Step2Miembros() {
  const {
    register,
    control,
    getValues,
    formState: { errors },
  } = useFormContext<TesoreríaFormValues>();

  const { fields, append, remove } = useFieldArray({
    control,
    name: "miembros",
  });

  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());

  function toggleExpand(idx: number) {
    setExpandedRows((prev) => {
      const next = new Set(prev);
      next.has(idx) ? next.delete(idx) : next.add(idx);
      return next;
    });
  }

  function suggestReceiptNumber(): string {
    const existing = getValues("miembros");
    const nums = existing
      .map((m) => parseInt(m.num_recibo, 10))
      .filter((n) => !isNaN(n) && n > 0);
    return nums.length > 0 ? `${Math.max(...nums) + 1}` : "1001";
  }

  function addMember() {
    const idx = fields.length;
    append({
      nombre: "",
      cedula: "" as unknown as number,
      aportes: "" as unknown as number,
      num_cuotas: 1,
      fecha_recibo: "",
      num_recibo: suggestReceiptNumber(),
      cuentas_varias: [],
    });
    setExpandedRows((prev) => new Set(prev).add(idx));
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500">
          {fields.length} miembro{fields.length !== 1 ? "s" : ""} agregado
          {fields.length !== 1 ? "s" : ""}
        </p>
        <Button type="button" variant="outline" size="sm" onClick={addMember}>
          <Plus size={14} /> Agregar miembro
        </Button>
      </div>

      {fields.length === 0 && (
        <div className="rounded-lg border-2 border-dashed border-slate-200 py-10 text-center">
          <p className="text-slate-400 text-sm">
            No hay miembros. Hacé clic en "Agregar miembro" para comenzar.
          </p>
        </div>
      )}

      {fields.length > 0 && (
        <div className="flex items-center gap-2 px-4 py-1">
          <span className="w-5" />
          <div className="flex-1 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {["Apellido(s) Nombre(s)", "N° Cédula", "Aportes ($)", "N° Cuotas"].map((label, i) => (
              <span key={label} className="text-xs font-medium text-slate-400">
                {label}
                {i < 3 && <span className="text-red-400 ml-0.5">*</span>}
              </span>
            ))}
          </div>
          <span className="w-8" />
          <span className="w-6" />
        </div>
      )}

      <div className="flex flex-col gap-3">
        {fields.map((field, idx) => {
          const err = errors.miembros?.[idx];
          const expanded = expandedRows.has(idx);

          return (
            <div
              key={field.id}
              className="rounded-lg border border-slate-200 bg-white overflow-hidden"
            >
              {/* Row header */}
              <div className="flex items-center gap-2 px-4 py-3 bg-slate-50">
                <span className="text-xs font-mono text-slate-400 w-5">
                  {idx + 1}
                </span>
                <div className="flex-1 grid grid-cols-2 gap-3 sm:grid-cols-4">
                  <Input
                    {...register(`miembros.${idx}.nombre`)}
                    placeholder="Apellido(s) Nombre(s)"
                    className="uppercase text-xs"
                    error={err?.nombre?.message}
                  />
                  <Input
                    {...register(`miembros.${idx}.cedula`, {
                      valueAsNumber: true,
                    })}
                    type="number"
                    placeholder="N° Cédula"
                    className="text-xs"
                    error={err?.cedula?.message}
                  />
                  <Input
                    {...register(`miembros.${idx}.aportes`, {
                      valueAsNumber: true,
                    })}
                    type="number"
                    min={0}
                    placeholder="Aportes $"
                    className="text-xs"
                    error={err?.aportes?.message}
                  />
                  <Input
                    {...register(`miembros.${idx}.num_cuotas`, {
                      valueAsNumber: true,
                    })}
                    type="number"
                    min={1}
                    placeholder="Cuotas"
                    className="text-xs"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => toggleExpand(idx)}
                  className="p-1 text-slate-400 hover:text-slate-600 rounded"
                  title="Datos del recibo"
                >
                  {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </button>
                <button
                  type="button"
                  onClick={() => remove(idx)}
                  className="p-1 text-red-400 hover:text-red-600 rounded"
                  title="Eliminar miembro"
                >
                  <Trash2 size={16} />
                </button>
              </div>

              {/* Expanded: recibo + cuentas varias */}
              {expanded && (
                <div className="px-4 py-4 border-t border-slate-100 flex flex-col gap-4">
                  <div className="grid grid-cols-2 gap-4">
                    <Field
                      label="Fecha del recibo"
                      error={err?.fecha_recibo?.message}
                      required
                    >
                      <Input
                        {...register(`miembros.${idx}.fecha_recibo`)}
                        type="date"
                        className="text-xs"
                      />
                    </Field>
                    <Field
                      label="N° Recibo de Caja"
                      error={err?.num_recibo?.message}
                      required
                    >
                      <Input
                        {...register(`miembros.${idx}.num_recibo`)}
                        placeholder="1001"
                        className="text-xs"
                      />
                    </Field>
                  </div>
                  <CuentasVariasSection idx={idx} />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function CuentasVariasSection({ idx }: { idx: number }) {
  const { register, control, formState: { errors } } = useFormContext<TesoreríaFormValues>();
  const { fields, append, remove } = useFieldArray({
    control,
    name: `miembros.${idx}.cuentas_varias`,
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-medium text-slate-600">
          Cuentas Varias (opcional, máx 3)
        </span>
        {fields.length < 3 && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => append({ detalle: "", valor: 0 })}
          >
            <Plus size={12} /> Agregar
          </Button>
        )}
      </div>
      {fields.map((f, j) => (
        <div key={f.id} className={cn("flex gap-2 items-start", j > 0 && "mt-2")}>
          <Input
            {...register(`miembros.${idx}.cuentas_varias.${j}.detalle`)}
            placeholder="Descripción"
            className="flex-1 text-xs"
            error={errors.miembros?.[idx]?.cuentas_varias?.[j]?.detalle?.message}
          />
          <Input
            {...register(`miembros.${idx}.cuentas_varias.${j}.valor`, {
              valueAsNumber: true,
            })}
            type="number"
            min={0}
            placeholder="Valor $"
            className="w-28 text-xs"
          />
          <button
            type="button"
            onClick={() => remove(j)}
            className="p-2 text-red-400 hover:text-red-600"
          >
            <Trash2 size={14} />
          </button>
        </div>
      ))}
    </div>
  );
}
