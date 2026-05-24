import { useState, useEffect } from "react";
import { type FieldErrors, FormProvider, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Download, FileSpreadsheet, LogOut } from "lucide-react";
import { generateExcel, clearToken } from "@/api/client";
import { useFormPersist } from "@/hooks/useFormPersist";
import { Badge, Button, Card, CardContent, CardHeader, CardTitle, cn } from "@/components/ui";
import { Step1Organizacion } from "@/components/steps/Step1Organizacion";
import { Step2Miembros } from "@/components/steps/Step2Miembros";
import { Step3OtrasEntradas } from "@/components/steps/Step3OtrasEntradas";
import { Step4Salidas } from "@/components/steps/Step4Salidas";
import { Step5DatosFinales } from "@/components/steps/Step5DatosFinales";
import {
  tesoreríaFormSchema,
  toApiPayload,
  type TesoreríaFormValues,
  CONCEPTOS_LUMISIAL,
} from "@/types/tesoreria";

const STEP_FIELDS: Record<number, (keyof TesoreríaFormValues)[]> = {
  1: ["organizacion"],
  2: ["miembros"],
  3: ["otras_entradas"],
  4: ["salidas_admin", "salidas_1008", "salidas_lumisial"],
  5: ["actividades_lumisial", "cuadre_caja"],
};

function firstStepWithErrors(errors: FieldErrors<TesoreríaFormValues>): number {
  for (const [step, fields] of Object.entries(STEP_FIELDS)) {
    if (fields.some((f) => f in errors)) return Number(step);
  }
  return 1;
}

const STEPS = [
  { id: 1, label: "Organización", description: "Datos del Lumisial" },
  { id: 2, label: "Miembros", description: "Aportes y recibos" },
  { id: 3, label: "Otras entradas", description: "Ingresos extraordinarios" },
  { id: 4, label: "Salidas", description: "Gastos del mes" },
  { id: 5, label: "Datos finales", description: "Cuadre de caja" },
];

function buildDefaultValues(): TesoreríaFormValues {
  return {
    organizacion: {
      diocesis: "CAUCA",
      codigo_diocesis: 23,
      santuario: "",
      codigo_santuario: 0,
      mes_anio: "",
    },
    miembros: [],
    otras_entradas: [{ concepto: "OBOLO", valor: 0 }],
    salidas_admin: Array.from({ length: 7 }, () => ({ fecha: "", valor: 0 })),
    salidas_1008: [{ concepto: "OBOLO", valor: 0 }],
    salidas_lumisial: CONCEPTOS_LUMISIAL.map((c) => ({ concepto: c, valor: 0 })),
    actividades_lumisial: [],
    cuadre_caja: {
      comprobante_inicial: 100,
      recibo_desde: 1,
      recibo_hasta: 1,
      voucher_desde: 100,
      voucher_hasta: 100,
      saldo_anterior: 0,
      obolo: 0,
      cuentas_por_pagar: 0,
    },
  };
}

interface FormPageProps {
  onLogout: () => void;
}

export function FormPage({ onLogout }: FormPageProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [generating, setGenerating] = useState(false);
  const [genError, setGenError] = useState("");

  const methods = useForm<TesoreríaFormValues>({
    resolver: zodResolver(tesoreríaFormSchema),
    defaultValues: buildDefaultValues(),
    mode: "onBlur",
  });

  const { clearDraft } = useFormPersist(methods);

  // Mirror obolo from Otras Entradas → Salidas 1008 (same amount, business rule)
  const oboloEntrada = useWatch({ control: methods.control, name: "otras_entradas.0.valor" }) as number;
  useEffect(() => {
    if (typeof oboloEntrada === "number" && !isNaN(oboloEntrada)) {
      methods.setValue("salidas_1008.0.valor", oboloEntrada);
    }
  }, [oboloEntrada]);

  async function handleGenerate(data: TesoreríaFormValues) {
    setGenerating(true);
    setGenError("");
    try {
      await generateExcel(toApiPayload(data));
      clearDraft();
      methods.reset(buildDefaultValues());
      setCurrentStep(1);
    } catch (e) {
      setGenError(e instanceof Error ? e.message : "Error al generar");
    } finally {
      setGenerating(false);
    }
  }

  function handleInvalid(errors: FieldErrors<TesoreríaFormValues>) {
    const step = firstStepWithErrors(errors);
    setCurrentStep(step);

    if (step === 2 && Array.isArray(errors.miembros)) {
      const idx = errors.miembros.findIndex(Boolean);
      if (idx >= 0) {
        setGenError(`El miembro ${idx + 1} tiene campos incompletos.`);
        return;
      }
    }

    setGenError(`Completá los campos requeridos en el paso ${step}.`);
  }

  function handleLogout() {
    clearDraft();
    clearToken();
    onLogout();
  }

  const StepComponent = [
    null,
    Step1Organizacion,
    Step2Miembros,
    Step3OtrasEntradas,
    Step4Salidas,
    Step5DatosFinales,
  ][currentStep];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <FileSpreadsheet size={22} className="text-violet-600" />
          <span className="font-semibold text-slate-900">Tesorería Local 2026</span>
        </div>
        <button
          type="button"
          onClick={handleLogout}
          className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700"
        >
          <LogOut size={15} /> Salir
        </button>
      </header>

      <main className="max-w-3xl mx-auto p-4 py-6">
        {/* Step indicator */}
        <div className="flex gap-1 mb-6">
          {STEPS.map((step) => (
            <button
              key={step.id}
              type="button"
              onClick={() => setCurrentStep(step.id)}
              className={cn(
                "flex-1 flex flex-col items-center py-2 px-1 rounded-lg text-center transition-colors text-xs",
                currentStep === step.id
                  ? "bg-violet-600 text-white"
                  : currentStep > step.id
                  ? "bg-violet-100 text-violet-700"
                  : "bg-white text-slate-400 border border-slate-200"
              )}
            >
              <span className="font-semibold">{step.id}</span>
              <span className="hidden sm:block font-medium mt-0.5">{step.label}</span>
            </button>
          ))}
        </div>

        <FormProvider {...methods}>
          <form onSubmit={(e) => e.preventDefault()}>
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>{STEPS[currentStep - 1].label}</CardTitle>
                    <p className="text-sm text-slate-500 mt-0.5">
                      {STEPS[currentStep - 1].description}
                    </p>
                  </div>
                  <Badge>{currentStep} / {STEPS.length}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                {StepComponent && <StepComponent />}
              </CardContent>
            </Card>

            {/* Navigation */}
            <div className="flex items-center justify-between mt-4">
              <Button
                type="button"
                variant="outline"
                disabled={currentStep === 1}
                onClick={() => setCurrentStep((s) => s - 1)}
              >
                Anterior
              </Button>

              <div className="flex flex-col items-end gap-1 sm:flex-row sm:items-center sm:gap-2">
                {genError && (
                  <p className="text-sm text-red-500 text-right max-w-xs sm:text-left">{genError}</p>
                )}

                {currentStep < STEPS.length ? (
                  <Button
                    type="button"
                    onClick={() => setCurrentStep((s) => s + 1)}
                  >
                    Siguiente
                  </Button>
                ) : (
                  <Button
                    type="button"
                    disabled={generating}
                    className="gap-2"
                    onClick={() =>
                      methods.handleSubmit(handleGenerate, handleInvalid)()
                    }
                  >
                    <Download size={16} />
                    {generating ? "Generando..." : "Generar y Descargar"}
                  </Button>
                )}
              </div>
            </div>
          </form>
        </FormProvider>
      </main>
    </div>
  );
}
