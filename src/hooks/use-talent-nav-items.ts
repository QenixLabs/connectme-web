"use client";

import { useMemo } from "react";
import { talentNavItems } from "@/components/shared/nav-config";
import { useAuthStore } from "@/providers/auth-store-provider";

export function useTalentNavItems() {
  const user = useAuthStore((s) => s.user);

  return useMemo(() => {
    if (!user?.username) return talentNavItems;
    return talentNavItems.map((item) =>
      item.label === "Profile"
        ? { ...item, href: `/talent/${user.username}` }
        : item
    );
  }, [user?.username]);
}
