import { useQuery } from '@tanstack/react-query';
import { collaborationRequestsApi } from '@/lib/api/messages';
import { queryKeys } from '@/lib/api/query-keys';

export function useCollaborationRequests() {
  return useQuery({
    queryKey: queryKeys.collaborationRequests.all(),
    queryFn: () => collaborationRequestsApi.getMyRequests(),
  });
}
