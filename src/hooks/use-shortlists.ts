import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { talentApi } from "@/lib/api/talent";

export const shortlistsKeys = {
  all: ["shortlists"] as const,
  list: () => [...shortlistsKeys.all, "list"] as const,
};

export function useRecruiterShortlists() {
  return useQuery({
    queryKey: shortlistsKeys.list(),
    queryFn: () => talentApi.getRecruiterShortlists(),
    staleTime: 30 * 1000,
  });
}

export function useRemoveFromShortlist() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      username,
      campaignId,
    }: {
      username: string;
      campaignId: string;
    }) => talentApi.unshortlistTalent(username, campaignId),
    onSuccess: () => {
      toast.success("Removed from shortlist");
      queryClient.invalidateQueries({ queryKey: shortlistsKeys.all });
    },
    onError: (err) => {
      const message =
        (err as { response?: { data?: { message?: string } } }).response?.data
          ?.message || "Failed to remove from shortlist";
      toast.error(message);
    },
  });
}
