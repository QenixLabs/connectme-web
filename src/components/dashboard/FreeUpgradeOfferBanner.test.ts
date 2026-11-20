import { describe, expect, it } from "vitest";
import type { Notification } from "@/lib/api/notifications";
import { findPendingFreeUpgradeOffer } from "./FreeUpgradeOfferBanner";

function makeNotification(overrides: Partial<Notification> = {}): Notification {
  return {
    _id: "offer-1",
    user_id: "user-1",
    actor_id: null,
    type: "subscription_plan_offer",
    title: "Plan offer",
    body: "A plan offer is waiting",
    data: { expires_at: "2026-12-01T00:00:00.000Z" },
    status: "unread",
    action_status: "pending",
    is_history: false,
    dismiss_strategy: "manual",
    created_at: "2026-11-20T00:00:00.000Z",
    updated_at: "2026-11-20T00:00:00.000Z",
    ...overrides,
  };
}

describe("findPendingFreeUpgradeOffer", () => {
  it("finds a pending plan offer that has not expired", () => {
    const offer = makeNotification();

    expect(findPendingFreeUpgradeOffer([offer], Date.parse("2026-11-21T00:00:00.000Z"))).toBe(offer);
  });

  it("ignores answered and expired offers", () => {
    const answered = makeNotification({ action_status: "accepted" });
    const expired = makeNotification({
      _id: "offer-2",
      data: { expires_at: "2026-11-19T00:00:00.000Z" },
    });

    expect(findPendingFreeUpgradeOffer([answered, expired], Date.parse("2026-11-21T00:00:00.000Z"))).toBeUndefined();
  });
});
