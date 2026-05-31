"use client";

import { motion } from "motion/react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const popupVariants = cva(
  "pointer-events-auto flex w-full max-w-md flex-col gap-1 rounded-lg p-4 shadow-lg",
  {
    variants: {
      variant: {
        success: "bg-green-600 text-white",
        error: "bg-red-600 text-white",
        info: "bg-blue-600 text-white",
        warning: "bg-amber-500 text-white",
        custom: "",
      },
    },
    defaultVariants: {
      variant: "info",
    },
  }
);

export interface PopupCardProps extends VariantProps<typeof popupVariants> {
  title: string;
  description?: string;
  bgColor?: string;
  textColor?: string;
}

export function PopupCard({
  title,
  description,
  variant,
  bgColor,
  textColor,
}: PopupCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
      className={cn(
        popupVariants({ variant }),
        variant === "custom" && bgColor,
        variant === "custom" && textColor
      )}
    >
      <h3 className="font-semibold text-sm">{title}</h3>
      {description && <p className="text-xs opacity-90">{description}</p>}
    </motion.div>
  );
}
