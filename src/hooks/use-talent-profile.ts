import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { talentApi, type UpdateTalentProfilePayload } from "@/lib/api/talent";

export const talentProfileKeys = {
  all: ["talent-profile"] as const,
  myProfile: () => [...talentProfileKeys.all, "my"] as const,
  completeness: () => [...talentProfileKeys.all, "completeness"] as const,
  publicProfile: (username: string) =>
    [...talentProfileKeys.all, "public", username] as const,
  portfolio: (username: string) =>
    [...talentProfileKeys.all, "portfolio", username] as const,
  credits: (username: string) =>
    [...talentProfileKeys.all, "credits", username] as const,
  testimonials: (username: string) =>
    [...talentProfileKeys.all, "testimonials", username] as const,
  awards: (username: string) =>
    [...talentProfileKeys.all, "awards", username] as const,
};

export function useMyProfile() {
  return useQuery({
    queryKey: talentProfileKeys.myProfile(),
    queryFn: () => talentApi.getMyProfile(),
  });
}

export function useProfileCompleteness() {
  return useQuery({
    queryKey: talentProfileKeys.completeness(),
    queryFn: () => talentApi.getCompleteness(),
  });
}

export function useUpdateMyProfile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdateTalentProfilePayload) => talentApi.updateMyProfile(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: talentProfileKeys.myProfile() });
      qc.invalidateQueries({ queryKey: talentProfileKeys.completeness() });
    },
  });
}

export function usePublicTalentProfile(username: string) {
  return useQuery({
    queryKey: talentProfileKeys.publicProfile(username),
    queryFn: () => talentApi.getPublicProfile(username),
    enabled: !!username,
  });
}

export function useTalentPortfolio(username: string) {
  return useQuery({
    queryKey: talentProfileKeys.portfolio(username),
    queryFn: () => talentApi.getPortfolio(username),
    enabled: !!username,
  });
}

export function useTalentCredits(username: string) {
  return useQuery({
    queryKey: talentProfileKeys.credits(username),
    queryFn: () => talentApi.getCredits(username),
    enabled: !!username,
  });
}

export function useTalentTestimonials(username: string) {
  return useQuery({
    queryKey: talentProfileKeys.testimonials(username),
    queryFn: () => talentApi.getTestimonials(username),
    enabled: !!username,
  });
}

export function useTalentAwards(username: string) {
  return useQuery({
    queryKey: talentProfileKeys.awards(username),
    queryFn: () => talentApi.getAwards(username),
    enabled: !!username,
  });
}

export function useLikeTalent(username: string) {
  const queryClient = useQueryClient();

  const likeStatusQuery = useQuery({
    queryKey: [...talentProfileKeys.all, "like-status", username],
    queryFn: () => talentApi.getLikeStatus(username),
    enabled: !!username,
  });

  const likeMutation = useMutation({
    mutationFn: () => talentApi.likeTalent(username),
    onMutate: async () => {
      await queryClient.cancelQueries({
        queryKey: [...talentProfileKeys.all, "like-status", username],
      });
      const prev = queryClient.getQueryData<{ is_liked: boolean }>([
        ...talentProfileKeys.all,
        "like-status",
        username,
      ]);
      queryClient.setQueryData(
        [...talentProfileKeys.all, "like-status", username],
        { is_liked: true },
      );
      return { prev };
    },
    onError: (_err, _vars, context) => {
      if (context?.prev) {
        queryClient.setQueryData(
          [...talentProfileKeys.all, "like-status", username],
          context.prev,
        );
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: [...talentProfileKeys.all, "like-status", username],
      });
      queryClient.invalidateQueries({
        queryKey: talentProfileKeys.publicProfile(username),
      });
    },
  });

  const unlikeMutation = useMutation({
    mutationFn: () => talentApi.unlikeTalent(username),
    onMutate: async () => {
      await queryClient.cancelQueries({
        queryKey: [...talentProfileKeys.all, "like-status", username],
      });
      const prev = queryClient.getQueryData<{ is_liked: boolean }>([
        ...talentProfileKeys.all,
        "like-status",
        username,
      ]);
      queryClient.setQueryData(
        [...talentProfileKeys.all, "like-status", username],
        { is_liked: false },
      );
      return { prev };
    },
    onError: (_err, _vars, context) => {
      if (context?.prev) {
        queryClient.setQueryData(
          [...talentProfileKeys.all, "like-status", username],
          context.prev,
        );
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: [...talentProfileKeys.all, "like-status", username],
      });
      queryClient.invalidateQueries({
        queryKey: talentProfileKeys.publicProfile(username),
      });
    },
  });

  const isLiked = likeStatusQuery.data?.is_liked ?? false;
  const isPending = likeMutation.isPending || unlikeMutation.isPending;

  const toggleLike = () => {
    if (isLiked) {
      unlikeMutation.mutate();
    } else {
      likeMutation.mutate();
    }
  };

  return { isLiked, isPending, toggleLike };
}
