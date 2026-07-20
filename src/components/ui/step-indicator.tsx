"use client";

import { Check } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "@/lib/utils";

interface Step {
  label: string;
  description?: string;
}

interface StepIndicatorProps {
  steps: Step[];
  current: number;
  className?: string;
}

export function StepIndicator({ steps, current, className }: StepIndicatorProps) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      {steps.map((step, i) => {
        const isActive = i === current;
        const isComplete = i < current;
        return (
          <div key={step.label} className="flex items-center gap-2">
            <div className="flex items-center gap-2.5">
              <motion.div
                animate={{
                  scale: isActive ? 1 : 0.9,
                  backgroundColor: isActive || isComplete ? "var(--color-brand)" : "transparent",
                  borderColor: isActive || isComplete ? "var(--color-brand)" : "var(--color-border)",
                }}
                className={cn(
                  "w-8 h-8 rounded-full border-2 flex items-center justify-center transition-colors duration-300",
                  !isActive && !isComplete && "bg-card",
                )}
              >
                <AnimatePresence mode="wait">
                  {isComplete ? (
                    <motion.span
                      key="check"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                    >
                      <Check className="w-3.5 h-3.5 text-white" strokeWidth={2.5} />
                    </motion.span>
                  ) : (
                    <motion.span
                      key="number"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                      className={cn(
                        "text-xs font-semibold",
                        isActive ? "text-white" : "text-text-muted",
                      )}
                    >
                      {i + 1}
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.div>
              <div className="hidden sm:block">
                <p
                  className={cn(
                    "text-xs font-medium leading-tight transition-colors duration-300",
                    isActive ? "text-text-primary" : "text-text-muted",
                  )}
                >
                  {step.label}
                </p>
                {step.description && (
                  <p className="text-[10px] text-text-muted leading-tight mt-0.5">
                    {step.description}
                  </p>
                )}
              </div>
            </div>
            {i < steps.length - 1 && (
              <div
                className={cn(
                  "w-8 h-px transition-colors duration-300 hidden sm:block",
                  i < current ? "bg-brand" : "bg-border",
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
