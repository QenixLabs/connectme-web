import { useQuery } from "@tanstack/react-query";
import { recruiterApi } from "@/lib/api/recruiter";

export const recruiterPublicKeys = {
  all: ["recruiter-public"] as const,
  profile: (slug: string) => [...recruiterPublicKeys.all, "profile", slug] as const,
  campaigns: (slug: string) => [...recruiterPublicKeys.all, "campaigns", slug] as const,
};

export function usePublicRecruiterProfile(slug: string) {
  return useQuery({
    queryKey: recruiterPublicKeys.profile(slug),
    queryFn: () => recruiterApi.getPublicProfile(slug),
    enabled: !!slug,
  });
}

export function usePublicRecruiterCampaigns(slug: string, limit?: number) {
  return useQuery({
    queryKey: recruiterPublicKeys.campaigns(slug),
    queryFn: () => recruiterApi.getPublicCampaigns(slug, limit),
    enabled: !!slug,
  });
}
