"use client";

import { useEffect } from "react";

/**
 * Registers the app service worker in production builds only.
 *
 * Development is intentionally excluded so HMR and freshly compiled chunks are
 * never served from the service worker cache. This component renders nothing:
 * installation stays a browser-native action, with no custom prompt or UI.
 */
export function ServiceWorkerRegistration() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") return;
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) return;

    let cancelled = false;

    const register = () => {
      if (cancelled) return;
      navigator.serviceWorker.register("/sw.js", { scope: "/" }).catch((error) => {
        console.error("RootIn service worker registration failed:", error);
      });
    };

    if (document.readyState === "complete") {
      register();
    } else {
      window.addEventListener("load", register, { once: true });
    }

    return () => {
      cancelled = true;
      window.removeEventListener("load", register);
    };
  }, []);

  return null;
}
