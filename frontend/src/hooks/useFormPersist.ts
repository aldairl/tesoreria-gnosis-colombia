import { useEffect, useRef } from "react";
import type { UseFormReturn } from "react-hook-form";
import type { TesoreríaFormValues } from "@/types/tesoreria";

const STORAGE_KEY = "tesoreria-draft";

export function useFormPersist(methods: UseFormReturn<TesoreríaFormValues>) {
  const { reset, watch } = methods;
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    try {
      reset(JSON.parse(raw), { keepDefaultValues: false });
    } catch {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [reset]);

  useEffect(() => {
    const sub = watch((data) => {
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      }, 600);
    });
    return () => {
      sub.unsubscribe();
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [watch]);

  function clearDraft() {
    localStorage.removeItem(STORAGE_KEY);
  }

  return { clearDraft };
}
