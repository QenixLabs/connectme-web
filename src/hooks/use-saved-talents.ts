import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { talentApi } from "@/lib/api/talent";
import { campaignsApi } from "@/lib/api/campaigns";
import { campaignKeys } from "@/hooks/use-campaigns";

export const savedTalentsKeys = {
  all: ["saved-talents"] as const,
  list: () => [...savedTalentsKeys.all, "list"] as const,
};

export function useSavedTalents() {
  return useQuery({
    queryKey: savedTalentsKeys.list(),
    queryFn: () => talentApi.getSavedTalents(),
    staleTime: 30 * 1000,
  });
}

export function useRemoveSavedTalent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (username: string) => talentApi.unsaveTalent(username),
    onSuccess: () => {
      toast.success("Removed from saved");
      queryClient.invalidateQueries({ queryKey: savedTalentsKeys.all });
    },
    onError: (err) => {
      const message =
        (err as { response?: { data?: { message?: string } } }).response?.data
          ?.message || "Failed to remove saved talent";
      toast.error(message);
    },
  });
}

export function useInviteTalentToCampaign() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      campaignId,
      talentId,
      message,
    }: {
      campaignId: string;
      talentId: string;
      message?: string;
    }) => campaignsApi.inviteTalent(campaignId, talentId, message),
    onSuccess: () => {
      toast.success("Invite sent");
      queryClient.invalidateQueries({
        queryKey: [...campaignKeys.all, "invites"],
      });
    },
    onError: (err) => {
      const message =
        (err as { response?: { data?: { message?: string } } }).response?.data
          ?.message || "Failed to send invite";
      toast.error(message);
    },
  });
}
