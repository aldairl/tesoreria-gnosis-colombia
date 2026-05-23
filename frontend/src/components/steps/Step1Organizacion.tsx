import { useFormContext } from "react-hook-form";
import { Field, Input, Select } from "@/components/ui";
import type { TesoreríaFormValues } from "@/types/tesoreria";
import { DIOCESIS_LIST, SANTUARIOS_LIST } from "@/types/tesoreria";

export function Step1Organizacion() {
  const {
    register,
    setValue,
    formState: { errors },
  } = useFormContext<TesoreríaFormValues>();

  const e = errors.organizacion;

  return (
    <div className="flex flex-col gap-5">
      <p className="text-sm text-slate-500">
        Esta información aparecerá en el encabezado de todos los formatos.
      </p>

      <Field label="Diócesis" error={e?.diocesis?.message} required>
        <Select
          {...register("organizacion.codigo_diocesis", {
            valueAsNumber: true,
            onChange: (ev) => {
              const code = parseInt(ev.target.value);
              const item = DIOCESIS_LIST.find((d) => d.codigo === code);
              if (item) setValue("organizacion.diocesis", item.nombre);
            },
          })}
        >
          {DIOCESIS_LIST.map((d) => (
            <option key={d.codigo} value={d.codigo}>
              {d.nombre}
            </option>
          ))}
        </Select>
      </Field>

      <Field
        label="Santuario / Lumisial"
        error={e?.santuario?.message ?? e?.codigo_santuario?.message}
        required
      >
        <Select
          {...register("organizacion.codigo_santuario", {
            valueAsNumber: true,
            onChange: (ev) => {
              const code = parseInt(ev.target.value);
              const item = SANTUARIOS_LIST.find((s) => s.codigo === code);
              if (item) {
                setValue("organizacion.santuario", item.nombre);
              } else {
                setValue("organizacion.santuario", "");
              }
            },
          })}
        >
          <option value={0}>-- Seleccionar --</option>
          {SANTUARIOS_LIST.map((s) => (
            <option key={s.codigo} value={s.codigo}>
              {s.nombre}
            </option>
          ))}
        </Select>
      </Field>

      <Field label="Mes y Año" error={e?.mes_anio?.message} required>
        <Input {...register("organizacion.mes_anio")} type="month" />
      </Field>
    </div>
  );
}
