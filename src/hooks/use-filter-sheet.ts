"use client";

import { useSyncExternalStore } from "react";

let isOpen = false;
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((cb) => cb());
}

export function useFilterSheetOpen() {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    () => isOpen,
    () => false,
  );
}

export function setFilterSheetOpen(open: boolean) {
  if (isOpen === open) return;
  isOpen = open;
  emit();
}
