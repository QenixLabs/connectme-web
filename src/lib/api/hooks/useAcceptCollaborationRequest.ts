import { useMutation, useQueryClient } from '@tanstack/react-query';
import { collaborationRequestsApi } from '@/lib/api/messages';
import { queryKeys } from '@/lib/api/query-keys';

export function useAcceptCollaborationRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (requestId: string) => collaborationRequestsApi.acceptRequest(requestId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.collaborationRequests.all() });
    },
  });
}
