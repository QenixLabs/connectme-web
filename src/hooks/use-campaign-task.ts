import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { campaignsApi } from "@/lib/api/campaigns";

export const campaignTaskKeys = {
  all: ["campaign-task"] as const,
  document: (campaignId: string) =>
    [...campaignTaskKeys.all, "document", campaignId] as const,
};

export function useTaskDocument(campaignId: string) {
  return useQuery({
    queryKey: campaignTaskKeys.document(campaignId),
    queryFn: () => campaignsApi.getTaskDocument(campaignId),
    enabled: !!campaignId,
  });
}

export function useUploadTaskDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      campaignId,
      file,
    }: {
      campaignId: string;
      file: File;
    }) => campaignsApi.uploadTaskDocument(campaignId, file),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: campaignTaskKeys.document(variables.campaignId),
      });
    },
  });
}

export function useDeleteTaskDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (campaignId: string) =>
      campaignsApi.deleteTaskDocument(campaignId),
    onSuccess: (_data, campaignId) => {
      queryClient.invalidateQueries({
        queryKey: campaignTaskKeys.document(campaignId),
      });
    },
  });
}

export function useUpsertTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      campaignId,
      payload,
    }: {
      campaignId: string;
      payload: Parameters<typeof campaignsApi.upsertTask>[1];
    }) => campaignsApi.upsertTask(campaignId, payload),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: campaignTaskKeys.document(variables.campaignId),
      });
    },
  });
}
