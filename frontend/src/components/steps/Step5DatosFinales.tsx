import { useEffect } from "react";
import { useFieldArray, useFormContext, useWatch } from "react-hook-form";
import { Plus, Trash2 } from "lucide-react";
import { Button, Field, Input } from "@/components/ui";
import type { TesoreríaFormValues } from "@/types/tesoreria";

export function Step5DatosFinales() {
  const {
    register,
    control,
    setValue,
    formState: { errors },
  } = useFormContext<TesoreríaFormValues>();

  const actividadesArr = useFieldArray({ control, name: "actividades_lumisial" });

  const miembros = useWatch({ control, name: "miembros" }) as TesoreríaFormValues["miembros"];
  const oboloEntrada = useWatch({ control, name: "otras_entradas.0.valor" }) as number;
  const otrasEntradas = useWatch({ control, name: "otras_entradas" }) as TesoreríaFormValues["otras_entradas"];
  const actividadesLumisial = useWatch({ control, name: "actividades_lumisial" }) as TesoreríaFormValues["actividades_lumisial"];
  const salidasAdmin = useWatch({ control, name: "salidas_admin" }) as TesoreríaFormValues["salidas_admin"];
  const salidas1008 = useWatch({ control, name: "salidas_1008" }) as TesoreríaFormValues["salidas_1008"];
  const salidasLumisial = useWatch({ control, name: "salidas_lumisial" }) as TesoreríaFormValues["salidas_lumisial"];
  const comprobinicialVal = useWatch({ control, name: "cuadre_caja.comprobante_inicial" }) as number;

  // Auto-fill recibo_desde / recibo_hasta from receipt numbers
  useEffect(() => {
    const numeros = (miembros || [])
      .map((m) => parseInt(m.num_recibo || "", 10))
      .filter((n): n is number => !isNaN(n) && n > 0);

    if (numeros.length > 0) {
      numeros.sort((a, b) => a - b);
      setValue("cuadre_caja.recibo_desde", numeros[0]);
      setValue("cuadre_caja.recibo_hasta", numeros[numeros.length - 1]);
    }
  }, [miembros]);

  // Auto-fill cuadre_caja.obolo from otras_entradas ÓBOLO
  useEffect(() => {
    if (typeof oboloEntrada === "number" && !isNaN(oboloEntrada)) {
      setValue("cuadre_caja.obolo", oboloEntrada);
    }
  }, [oboloEntrada]);

  // Auto-fill voucher range: inicial + count of non-zero 1008 salidas - 1
  useEffect(() => {
    const desde = comprobinicialVal || 100;
    const count = (salidas1008 || []).filter((s) => (s.valor || 0) > 0).length;
    setValue("cuadre_caja.voucher_desde", desde);
    setValue("cuadre_caja.voucher_hasta", count > 0 ? desde + count - 1 : desde);
  }, [comprobinicialVal, salidas1008]);

  // Auto-calculate cuentas_por_pagar: deficit when expenses exceed income
  useEffect(() => {
    const totalIngresos =
      (miembros || []).reduce((sum, m) => {
        const aporte = (m.aportes || 0) * (m.num_cuotas || 1);
        const cv = (m.cuentas_varias || []).reduce((s, c) => s + (c.valor || 0), 0);
        return sum + aporte + cv;
      }, 0) +
      (otrasEntradas || []).reduce((s, e) => s + (e.valor || 0), 0) +
      (actividadesLumisial || []).reduce((s, a) => s + (a.valor || 0), 0);

    const totalEgresos =
      (salidasAdmin || []).reduce((s, e) => s + (e.valor || 0), 0) +
      (salidas1008 || []).reduce((s, e) => s + (e.valor || 0), 0) +
      (salidasLumisial || []).reduce((s, e) => s + (e.valor || 0), 0);

    const diff = totalIngresos - totalEgresos;
    setValue("cuadre_caja.cuentas_por_pagar", diff < 0 ? Math.round(Math.abs(diff) * 100) / 100 : 0);
  }, [miembros, otrasEntradas, actividadesLumisial, salidasAdmin, salidas1008, salidasLumisial]);

  const cc = errors.cuadre_caja;

  return (
    <div className="flex flex-col gap-6">
      {/* Actividades Lumisial */}
      <section>
        <h3 className="text-sm font-semibold text-slate-700 mb-3">
          Actividades Lumisial
        </h3>
        <p className="text-xs text-slate-500 mb-3">
          Ingresos por actividades o eventos del Lumisial (bingos, bazares, etc.)
        </p>
        <div className="flex flex-col gap-2">
          {actividadesArr.fields.map((f, i) => (
            <div key={f.id} className="flex gap-3 items-start">
              <Input
                {...register(`actividades_lumisial.${i}.concepto`)}
                placeholder="Concepto"
                className="flex-1 text-sm"
              />
              <Input
                {...register(`actividades_lumisial.${i}.valor`, { valueAsNumber: true })}
                type="number"
                min={0}
                placeholder="$0"
                className="w-36 text-sm"
              />
              <button
                type="button"
                onClick={() => actividadesArr.remove(i)}
                className="p-2 text-red-400 hover:text-red-600"
              >
                <Trash2 size={15} />
              </button>
            </div>
          ))}
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="mt-2"
          onClick={() => actividadesArr.append({ concepto: "", valor: 0 })}
        >
          <Plus size={14} /> Agregar actividad
        </Button>
      </section>

      {/* Cuadre de Caja */}
      <section className="rounded-lg border border-slate-200 p-4 bg-slate-50">
        <h3 className="text-sm font-semibold text-slate-700 mb-4">
          Cuadre de Caja (Formato 1004)
        </h3>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Recibo desde" error={cc?.recibo_desde?.message} required>
            <Input
              {...register("cuadre_caja.recibo_desde", { valueAsNumber: true })}
              type="number"
              min={1}
              placeholder="1001"
            />
          </Field>
          <Field label="Recibo hasta" error={cc?.recibo_hasta?.message} required>
            <Input
              {...register("cuadre_caja.recibo_hasta", { valueAsNumber: true })}
              type="number"
              min={1}
              placeholder="1010"
            />
          </Field>

          <Field label="Comprobante desde">
            <Input
              {...register("cuadre_caja.voucher_desde", { valueAsNumber: true })}
              type="number"
              disabled
              className="bg-slate-100 text-slate-500"
            />
          </Field>
          <Field label="Comprobante hasta">
            <Input
              {...register("cuadre_caja.voucher_hasta", { valueAsNumber: true })}
              type="number"
              disabled
              className="bg-slate-100 text-slate-500"
            />
          </Field>

          <Field label="Saldo Anterior" error={cc?.saldo_anterior?.message} required>
            <Input
              {...register("cuadre_caja.saldo_anterior", { valueAsNumber: true })}
              type="number"
              min={0}
              placeholder="$0"
            />
          </Field>
          <Field label="Óbolo total" error={cc?.obolo?.message} required>
            <Input
              {...register("cuadre_caja.obolo", { valueAsNumber: true })}
              type="number"
              min={0}
              placeholder="$0"
            />
          </Field>

          <Field label="Cuentas por pagar" error={cc?.cuentas_por_pagar?.message}>
            <Input
              {...register("cuadre_caja.cuentas_por_pagar", { valueAsNumber: true })}
              type="number"
              min={0}
              placeholder="$0"
              disabled
              className="bg-slate-100 text-slate-500"
            />
          </Field>
        </div>
      </section>
    </div>
  );
}
