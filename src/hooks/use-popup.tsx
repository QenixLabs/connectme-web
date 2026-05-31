"use client";

import { toast } from "sonner";
import { PopupCard } from "@/components/ui/popup-card";

export type PopupPosition =
  | "top-left"
  | "top-center"
  | "top-right"
  | "bottom-left"
  | "bottom-center"
  | "bottom-right";

export type PopupVariant = "success" | "error" | "info" | "warning" | "custom";

export interface ShowPopupOptions {
  title: string;
  description?: string;
  duration?: number;
  position?: PopupPosition;
  variant?: PopupVariant;
  bgColor?: string;
  textColor?: string;
}

const DEFAULT_DURATION = 4000;
const MIN_DURATION = 1000;

export function usePopup() {
  const show = (options: ShowPopupOptions) => {
    const {
      title,
      description,
      duration = DEFAULT_DURATION,
      position: _position,
      variant = "info",
      bgColor,
      textColor,
    } = options;

    const position: PopupPosition = "top-center";
    const finalDuration = Math.max(duration, MIN_DURATION);

    if (variant === "custom" && (!bgColor || !textColor)) {
      console.warn(
        "[usePopup] variant 'custom' requires both bgColor and textColor"
      );
      return;
    }

    toast.custom(
      () => (
        <PopupCard
          title={title}
          description={description}
          variant={variant}
          bgColor={bgColor}
          textColor={textColor}
        />
      ),
      {
        duration: finalDuration,
        position,
      }
    );
  };

  return { show };
}
