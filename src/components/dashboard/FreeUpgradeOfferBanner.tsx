"use client";

import Link from "next/link";
import { Gift } from "lucide-react";
import { useNotifications } from "@/hooks/use-notifications";
import type { Notification } from "@/lib/api/notifications";

export function findPendingFreeUpgradeOffer(
  notifications: Notification[],
  now = Date.now(),
): Notification | undefined {
  return notifications.find((notification) => {
    if (
      notification.type !== "subscription_plan_offer" ||
      notification.action_status !== "pending"
    ) {
      return false;
    }

    const expiresAt = new Date(String(notification.data.expires_at ?? "")).getTime();
    return Number.isFinite(expiresAt) && expiresAt > now;
  });
}

export function FreeUpgradeOfferBanner() {
  const { data } = useNotifications({ page: 1, limit: 50 }, 30_000);
  const offer = findPendingFreeUpgradeOffer(data?.data ?? []);

  if (!offer) return null;

  return (
    <aside className="flex items-center gap-3 rounded-2xl border border-amber-200 bg-gradient-to-r from-amber-50 via-white to-violet-50 p-3.5 shadow-sm" role="status">
      <span className="flex size-11 shrink-0 items-center justify-center rounded-full border border-amber-200 bg-white text-amber-600 shadow-sm">
        <Gift className="size-5" aria-hidden="true" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-bold text-foreground">Complimentary upgrade invitation</p>
        <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
          You have a free plan upgrade waiting. Review the offer and accept it to activate.
        </p>
      </div>
      <Link
        href="/notifications"
        className="shrink-0 rounded-full bg-amber-600 px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-amber-700"
      >
        Review offer
      </Link>
    </aside>
  );
}
