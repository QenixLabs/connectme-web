import { useQuery } from '@tanstack/react-query';
import { messagesApi } from '@/lib/api';
import { queryKeys } from '@/lib/api/query-keys';

export function useUnreadMessageCount() {
  return useQuery({
    queryKey: queryKeys.messages.unreadCount(),
    queryFn: () => messagesApi.getUnreadCount(),
  });
}
