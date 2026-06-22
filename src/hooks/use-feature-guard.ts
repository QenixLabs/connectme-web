"use client";

import { useCallback } from "react";
import { featureGateStore } from "@/stores/feature-gate-store";

export interface FeatureForbiddenData {
  feature: string;
  plan?: string;
  code?: string;
}

export function isFeatureForbidden(error: unknown): FeatureForbiddenData | null {
  const err = error as {
    response?: {
      data?: {
        data?: { feature?: string; plan?: string; code?: string } | null;
        message?: string;
      };
    };
  } | null;
  const payload = err?.response?.data;
  const detail = payload?.data;

  if (detail?.code === "FEATURE_NOT_AVAILABLE") {
    return {
      feature: detail.feature || "unknown",
      plan: detail.plan,
      code: detail.code,
    };
  }

  return null;
}

export function useFeatureGuard() {
  const showFeatureGate = useCallback((feature: string, plan?: string) => {
    featureGateStore.getState().showFeatureGate(feature, plan);
  }, []);

  const closeFeatureGate = useCallback(() => {
    featureGateStore.getState().closeFeatureGate();
  }, []);

  const handleFeatureError = useCallback((error: unknown) => {
    const denied = isFeatureForbidden(error);
    if (denied) {
      featureGateStore.getState().showFeatureGate(denied.feature, denied.plan);
      return true;
    }
    return false;
  }, []);

  return {
    showFeatureGate,
    closeFeatureGate,
    handleFeatureError,
    isFeatureForbidden,
  };
}
