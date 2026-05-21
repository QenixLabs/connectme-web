"use client";

import { Toaster } from "sonner";

export function PopupProvider() {
  return (
    <Toaster
      position="top-center"
      richColors
      closeButton={false}
      toastOptions={{ duration: 4000 }}
    />
  );
}
