"use client";

import { useState, useCallback } from "react";
import type { UseFormReturn, FieldValues } from "react-hook-form";

interface UseMultiStepOptions<T extends FieldValues> {
  totalSteps: number;
  form: UseFormReturn<T>;
  stepFields: Record<number, string[] | ((form: UseFormReturn<T>) => string[])>;
}

interface UseMultiStepReturn {
  step: number;
  direction: number;
  isFirstStep: boolean;
  isLastStep: boolean;
  goNext: () => Promise<boolean>;
  goBack: () => void;
  goTo: (target: number) => void;
}

export function useMultiStep<T extends FieldValues>({
  totalSteps,
  form,
  stepFields,
}: UseMultiStepOptions<T>): UseMultiStepReturn {
  const [step, setStep] = useState(1);
  const [direction, setDirection] = useState(1);

  const goNext = useCallback(async () => {
    const fieldDef = stepFields[step];
    const fields = typeof fieldDef === "function" ? fieldDef(form) : fieldDef ?? [];
    if (fields.length > 0) {
      const ok = await form.trigger(fields as Parameters<typeof form.trigger>[0]);
      if (!ok) return false;
    }
    setDirection(1);
    setStep((s) => Math.min(s + 1, totalSteps));
    return true;
  }, [step, stepFields, form, totalSteps]);

  const goBack = useCallback(() => {
    setDirection(-1);
    setStep((s) => Math.max(s - 1, 1));
  }, []);

  const goTo = useCallback(
    (target: number) => {
      setDirection(target > step ? 1 : -1);
      setStep(Math.max(1, Math.min(target, totalSteps)));
    },
    [step, totalSteps],
  );

  return {
    step,
    direction,
    isFirstStep: step === 1,
    isLastStep: step === totalSteps,
    goNext,
    goBack,
    goTo,
  };
}
