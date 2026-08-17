"use client";

import { useQuery } from "@tanstack/react-query";

import { talentApi } from "@/lib/api/talent";
import { campaignsApi } from "@/lib/api/campaigns";
import { subscriptionsApi } from "@/lib/api/subscriptions";
import { notificationsApi } from "@/lib/api/notifications";
import { conversationsApi } from "@/lib/api/conversations";

export const talentDashboardKeys = {
  all: ["talent-dashboard"] as const,
  profile: () => [...talentDashboardKeys.all, "profile"] as const,
  completeness: () => [...talentDashboardKeys.all, "completeness"] as const,
  subscription: () => [...talentDashboardKeys.all, "subscription"] as const,
  usage: () => [...talentDashboardKeys.all, "usage"] as const,
  campaignRecommendations: (limit: number) =>
    [...talentDashboardKeys.all, "campaign-recommendations", limit] as const,
  myApplications: (limit: number) =>
    [...talentDashboardKeys.all, "my-applications", limit] as const,
  notifications: (limit: number) =>
    [...talentDashboardKeys.all, "notifications", limit] as const,
  portfolio: (limit: number) =>
    [...talentDashboardKeys.all, "portfolio", limit] as const,
  portfolioStats: () => [...talentDashboardKeys.all, "portfolio-stats"] as const,
  credits: () => [...talentDashboardKeys.all, "credits"] as const,
  testimonials: () => [...talentDashboardKeys.all, "testimonials"] as const,
};

export function useTalentProfile() {
  return useQuery({
    queryKey: talentDashboardKeys.profile(),
    queryFn: () => talentApi.getMyProfile(),
  });
}

export function useTalentCompleteness() {
  return useQuery({
    queryKey: talentDashboardKeys.completeness(),
    queryFn: () => talentApi.getCompleteness(),
  });
}

export function useTalentSubscription() {
  return useQuery({
    queryKey: talentDashboardKeys.subscription(),
    queryFn: () => subscriptionsApi.getMySubscription(),
  });
}

export function useTalentUsage() {
  return useQuery({
    queryKey: talentDashboardKeys.usage(),
    queryFn: () => subscriptionsApi.getUsage(),
  });
}

export function useCampaignRecommendations(limit = 6) {
  return useQuery({
    queryKey: talentDashboardKeys.campaignRecommendations(limit),
    queryFn: () => campaignsApi.getRecommendations(limit),
  });
}

export function useMyApplications(limit = 3) {
  return useQuery({
    queryKey: talentDashboardKeys.myApplications(limit),
    queryFn: () => campaignsApi.getMyApplications({ limit }),
  });
}

export function useDashboardNotifications(limit = 5) {
  return useQuery({
    queryKey: talentDashboardKeys.notifications(limit),
    queryFn: () => notificationsApi.getNotifications({ limit }),
    select: (res) => res.data,
  });
}

export function useUnreadMessages() {
  return useQuery({
    queryKey: ["unread-messages"],
    queryFn: () => conversationsApi.getUnreadCount(),
    staleTime: 30_000,
  });
}

export function useMyPortfolio(limit = 4) {
  return useQuery({
    queryKey: talentDashboardKeys.portfolio(limit),
    queryFn: async () => {
      const items = await talentApi.getMyPortfolio();
      return items.slice(0, limit);
    },
  });
}

export function usePortfolioStats() {
  return useQuery({
    queryKey: talentDashboardKeys.portfolioStats(),
    queryFn: () => talentApi.getPortfolioStats(),
  });
}

export function useMyCredits() {
  return useQuery({
    queryKey: talentDashboardKeys.credits(),
    queryFn: async () => {
      const items = await talentApi.getMyCredits();
      return items.slice(0, 1);
    },
  });
}

export function useMyTestimonials() {
  return useQuery({
    queryKey: talentDashboardKeys.testimonials(),
    queryFn: async () => {
      const items = await talentApi.getMyTestimonials();
      return items.slice(0, 1);
    },
  });
}
