"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { useStore } from "zustand/react";
import {
  talentApi,
  subscriptionsApi,
  campaignsApi,
  conversationsApi,
  type TalentProfile,
  type SubscriptionResponse,
  type CampaignRecommendation,
} from "@/lib/api";
import { authStore } from "@/stores/auth-store";

type SubscriptionData = SubscriptionResponse | null;

interface DashboardData {
  profile: TalentProfile | null;
  completeness: number;
  subscription: SubscriptionData;
  campaignRecommendations: CampaignRecommendation[];
  unreadCount: number;
  isLoading: boolean;
}

const DashboardContext = createContext<DashboardData>({
  profile: null,
  completeness: 0,
  subscription: null,
  campaignRecommendations: [],
  unreadCount: 0,
  isLoading: true,
});

export function useDashboard() {
  return useContext(DashboardContext);
}

export function DashboardProvider({ children }: { children: ReactNode }) {
  const user = useStore(authStore, (s) => s.user);
  const [profile, setProfile] = useState<TalentProfile | null>(null);
  const [completeness, setCompleteness] = useState(0);
  const [subscription, setSubscription] = useState<SubscriptionData>(null);
  const [campaignRecommendations, setCampaignRecommendations] = useState<CampaignRecommendation[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    let cancelled = false;

    async function fetchAll() {
      try {
        const [profileData, completenessData, subData, campaignsData, unreadData] =
          await Promise.allSettled([
            talentApi.getMyProfile(),
            talentApi.getCompleteness(),
            subscriptionsApi.getMySubscription(),
            campaignsApi.getRecommendations(4),
            conversationsApi.getUnreadCount(),
          ]);

        if (cancelled) return;

        if (profileData.status === "fulfilled") setProfile(profileData.value);
        if (completenessData.status === "fulfilled") {
          const { missingFields } = completenessData.value;
          setCompleteness(Math.round(((30 - missingFields.length) / 30) * 100));
        }
        if (subData.status === "fulfilled") setSubscription(subData.value);
        if (campaignsData.status === "fulfilled") setCampaignRecommendations(campaignsData.value);
        if (unreadData.status === "fulfilled") setUnreadCount(unreadData.value.count);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    fetchAll();

    return () => {
      cancelled = true;
    };
  }, [user]);

  return (
    <DashboardContext.Provider
      value={{ profile, completeness, subscription, campaignRecommendations, unreadCount, isLoading }}
    >
      {children}
    </DashboardContext.Provider>
  );
}
