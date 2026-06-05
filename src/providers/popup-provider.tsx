"use client";

import { useEffect } from "react";
import { Toaster, toast } from "sonner";

export function PopupProvider() {
  useEffect(() => {
    const handleApiError = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (detail?.status === 429) {
        toast.error(detail.message || "Too many requests. Please slow down.", {
          duration: 5000,
        });
      }
    };

    window.addEventListener("api-error", handleApiError);
    return () => window.removeEventListener("api-error", handleApiError);
  }, []);

  return (
    <Toaster
      position="top-center"
      richColors
      closeButton={false}
      toastOptions={{ duration: 4000 }}
    />
  );
}
