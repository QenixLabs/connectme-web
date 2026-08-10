import { useQuery } from "@tanstack/react-query";
import { recruiterApi } from "@/lib/api/recruiter";
import { campaignsApi } from "@/lib/api/campaigns";
import { subscriptionsApi } from "@/lib/api/subscriptions";
import { recommendationsApi } from "@/lib/api/recommendations";

export const recruiterDashboardKeys = {
  all: ["recruiter-dashboard"] as const,
  profile: () => [...recruiterDashboardKeys.all, "profile"] as const,
  stats: () => [...recruiterDashboardKeys.all, "stats"] as const,
  subscription: () => [...recruiterDashboardKeys.all, "subscription"] as const,
  usage: () => [...recruiterDashboardKeys.all, "usage"] as const,
  recommendations: (limit: number) =>
    [...recruiterDashboardKeys.all, "recommendations", limit] as const,
};

export function useRecruiterProfile() {
  return useQuery({
    queryKey: recruiterDashboardKeys.profile(),
    queryFn: () => recruiterApi.getMyProfile(),
  });
}

export function useRecruiterDashboardStats() {
  return useQuery({
    queryKey: recruiterDashboardKeys.stats(),
    queryFn: () => campaignsApi.getDashboardStats(),
  });
}

export function useRecruiterSubscription() {
  return useQuery({
    queryKey: recruiterDashboardKeys.subscription(),
    queryFn: () => subscriptionsApi.getMySubscription(),
  });
}

export function useRecruiterUsage() {
  return useQuery({
    queryKey: recruiterDashboardKeys.usage(),
    queryFn: () => subscriptionsApi.getUsage(),
  });
}

export function useDashboardTalentRecommendations(limit = 4) {
  return useQuery({
    queryKey: recruiterDashboardKeys.recommendations(limit),
    queryFn: () => recommendationsApi.getDashboardTalentRecommendations(limit),
  });
}
