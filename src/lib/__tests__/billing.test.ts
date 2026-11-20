import { describe, expect, it } from "vitest";
import type { SubscriptionResponse } from "@/lib/api/subscriptions";
import { getBillingPlanDetails } from "@/lib/billing";

const paidPlan = {
  key: "talent_pro",
  display_name: "Talent Pro",
  description: "",
  monthly_price: 49900,
  yearly_price: 499000,
  features: [],
  permissions: [],
};

describe("getBillingPlanDetails", () => {
  it("uses the effective plan and expiry when access differs from billing", () => {
    const response: SubscriptionResponse = {
      subscription: {
        _id: "sub",
        user_id: "user",
        plan_key: "talent_starter",
        status: "active",
        cancel_at_period_end: false,
        created_at: "",
        updated_at: "",
      },
      plan: { ...paidPlan, key: "talent_starter", display_name: "Starter" },
      effective_access: {
        plan_key: "talent_pro",
        plan_display_name: "Talent Pro",
        status: "active",
        source: "admin_granted",
        expires_at: "2026-12-01",
      },
      effective_plan: paidPlan,
    };

    expect(getBillingPlanDetails(response, "Free Plan")).toMatchObject({
      planName: "Talent Pro",
      planKey: "talent_pro",
      isPaid: true,
      periodEnd: "2026-12-01",
    });
  });

  it("does not display a stale paid subscription when effective access is free", () => {
    const response: SubscriptionResponse = {
      subscription: {
        _id: "sub",
        user_id: "user",
        plan_key: "talent_pro",
        status: "cancelled",
        cancel_at_period_end: false,
        created_at: "",
        updated_at: "",
      },
      plan: paidPlan,
      effective_access: {
        plan_key: "talent_free",
        plan_display_name: "Free Talent",
        status: "active",
        source: "free",
        expires_at: null,
      },
      effective_plan: null,
    };

    expect(getBillingPlanDetails(response, "Free Plan")).toMatchObject({
      planName: "Free Talent",
      planKey: "talent_free",
      isPaid: false,
      status: "active",
    });
  });

  it("falls back to the subscription for older responses without effective access", () => {
    const response: SubscriptionResponse = {
      subscription: {
        _id: "sub",
        user_id: "user",
        plan_key: "talent_pro",
        status: "active",
        cancel_at_period_end: false,
        created_at: "",
        updated_at: "",
      },
      plan: paidPlan,
    };

    expect(getBillingPlanDetails(response, "Free Plan")).toMatchObject({
      planName: "Talent Pro",
      planKey: "talent_pro",
      isPaid: true,
    });
  });
});
