import { useFormContext, useWatch } from "react-hook-form";
import type { TesoreríaFormValues } from "@/types/tesoreria";
import { compute1008Preview, formatCOP } from "@/lib/calculos";

export function Resumen1008Preview() {
  const { control } = useFormContext<TesoreríaFormValues>();
  const values = useWatch({ control }) as TesoreríaFormValues;

  const { lineas, total } = compute1008Preview(values);

  if (lineas.length === 0) {
    return (
      <p className="text-xs text-slate-400 italic">
        Completá los miembros y las salidas 1008 para ver el resumen.
      </p>
    );
  }

  return (
    <div className="rounded-lg border border-violet-100 bg-violet-50 overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-violet-100">
            <th className="text-left px-4 py-2 text-xs font-semibold text-violet-700 uppercase tracking-wide">
              Concepto
            </th>
            <th className="text-right px-4 py-2 text-xs font-semibold text-violet-700 uppercase tracking-wide">
              Valor
            </th>
          </tr>
        </thead>
        <tbody>
          {lineas.map((l, i) => (
            <tr key={i} className="border-b border-violet-100 last:border-0">
              <td className="px-4 py-2 text-slate-700">{l.concepto}</td>
              <td className="px-4 py-2 text-right text-slate-700 tabular-nums">
                {formatCOP(l.valor)}
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr className="bg-violet-100">
            <td className="px-4 py-2.5 font-semibold text-violet-900">Total a entregar</td>
            <td className="px-4 py-2.5 text-right font-semibold text-violet-900 tabular-nums">
              {formatCOP(total)}
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}
