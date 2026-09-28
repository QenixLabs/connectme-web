import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { requestsApi } from "@/lib/api/requests";
import { queryKeys } from "@/lib/api/query-keys";

export const requestsKeys = {
  all: ["requests"] as const,
  my: () => [...requestsKeys.all, "my"] as const,
};

export function useMyRequests() {
  return useQuery({
    queryKey: requestsKeys.my(),
    queryFn: () => requestsApi.getMyRequests(),
  });
}

export function useAcceptRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => requestsApi.acceptRequest(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: requestsKeys.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.collaborationRequests.all() });
    },
  });
}

export function useRejectRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => requestsApi.rejectRequest(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: requestsKeys.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.collaborationRequests.all() });
    },
  });
}

export function useCreateRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { receiver_id: string; message?: string; reason?: string }) =>
      requestsApi.createRequest(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: requestsKeys.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.collaborationRequests.all() });
    },
  });
}
