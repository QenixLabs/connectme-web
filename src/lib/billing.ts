import type { SubscriptionResponse } from "@/lib/api/subscriptions";

export interface BillingPlanDetails {
  plan: SubscriptionResponse["effective_plan"];
  planKey: string | null;
  planName: string;
  isPaid: boolean;
  status: string;
  periodEnd: string | null;
}

export function getBillingPlanDetails(
  response: SubscriptionResponse,
  freePlanName: string,
): BillingPlanDetails {
  const access = response.effective_access;
  const plan = access ? response.effective_plan ?? null : response.plan;
  const planKey = access ? access.plan_key : response.subscription?.plan_key ?? null;
  const fallbackName = planKey
    ? planKey.replace(/_/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase())
    : freePlanName;

  return {
    plan,
    planKey,
    planName: plan?.display_name ?? access?.plan_display_name ?? fallbackName,
    isPaid: plan
      ? plan.monthly_price > 0 || plan.yearly_price > 0
      : !!planKey && !planKey.endsWith("_free"),
    status: access?.status ?? response.subscription?.status ?? "active",
    periodEnd:
      access?.expires_at ?? response.subscription?.current_period_end ?? null,
  };
}
