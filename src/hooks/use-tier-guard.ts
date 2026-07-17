"use client";

import { useCallback } from "react";
import { useAuthStore } from "@/providers/auth-store-provider";
import { usePopup } from "@/hooks/use-popup";

export function useTierGuard(requiredTier: number = 3) {
  const { user } = useAuthStore();
  const popup = usePopup();

  const tier = user?.verification_tier ?? 1;
  const canAct = tier >= requiredTier;

  const guard = useCallback(
    (action: () => void) => {
      if (tier >= requiredTier) {
        action();
        return;
      }
      popup.show({
        title: "Verification required",
        description: `Only Tier ${requiredTier} verified users can access this feature. Complete your verification to unlock it.`,
        variant: "warning",
      });
    },
    [tier, requiredTier, popup]
  );

  return { canAct, guard, tier };
}
