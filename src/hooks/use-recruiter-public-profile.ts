import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { recruiterApi } from "@/lib/api/recruiter";
import type { SubmitRecruiterReviewPayload } from "@/lib/api/recruiter";

export const recruiterPublicKeys = {
  all: ["recruiter-public"] as const,
  profile: (slug: string) => [...recruiterPublicKeys.all, "profile", slug] as const,
  campaigns: (slug: string) => [...recruiterPublicKeys.all, "campaigns", slug] as const,
  team: (slug: string) => [...recruiterPublicKeys.all, "team", slug] as const,
  reviews: (slug: string, viewerUserId?: string) =>
    [...recruiterPublicKeys.all, "reviews", slug, viewerUserId] as const,
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

export function usePublicRecruiterTeam(slug: string) {
  return useQuery({
    queryKey: recruiterPublicKeys.team(slug),
    queryFn: () => recruiterApi.getPublicTeam(slug),
    enabled: !!slug,
  });
}

export function usePublicRecruiterReviews(slug: string, viewerUserId?: string) {
  return useInfiniteQuery({
    queryKey: recruiterPublicKeys.reviews(slug, viewerUserId),
    queryFn: ({ pageParam }) => recruiterApi.getPublicReviews(slug, pageParam, 10),
    initialPageParam: 1,
    getNextPageParam: (lastPage, pages) => {
      const loaded = pages.reduce((count, page) => count + page.data.length, 0);
      return loaded < lastPage.total ? pages.length + 1 : undefined;
    },
    enabled: !!slug,
  });
}

export function useSubmitRecruiterReview(slug: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: SubmitRecruiterReviewPayload) =>
      recruiterApi.submitReview(slug, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: recruiterPublicKeys.reviews(slug) });
      queryClient.invalidateQueries({ queryKey: recruiterPublicKeys.profile(slug) });
    },
  });
}
