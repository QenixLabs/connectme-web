import { useQuery } from "@tanstack/react-query";
import { subscriptionsApi } from "@/lib/api/subscriptions";

export const recruiterBillingKeys = {
  all: ["recruiter-billing"] as const,
  subscription: () => [...recruiterBillingKeys.all, "subscription"] as const,
  usage: () => [...recruiterBillingKeys.all, "usage"] as const,
  invoices: (page: number, limit: number) =>
    [...recruiterBillingKeys.all, "invoices", { page, limit }] as const,
};

export function useRecruiterBillingSubscription() {
  return useQuery({
    queryKey: recruiterBillingKeys.subscription(),
    queryFn: () => subscriptionsApi.getMySubscription(),
  });
}

export function useRecruiterBillingUsage() {
  return useQuery({
    queryKey: recruiterBillingKeys.usage(),
    queryFn: () => subscriptionsApi.getUsage(),
  });
}

export function useRecruiterBillingInvoices(page = 1, limit = 20) {
  return useQuery({
    queryKey: recruiterBillingKeys.invoices(page, limit),
    queryFn: () => subscriptionsApi.getInvoices(page, limit),
  });
}
