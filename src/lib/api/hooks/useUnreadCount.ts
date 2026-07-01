import { useQuery } from '@tanstack/react-query';
import { notificationsApi } from '@/lib/api';
import { queryKeys } from '@/lib/api/query-keys';

export function useUnreadCount() {
  return useQuery({
    queryKey: queryKeys.notifications.unreadCount(),
    queryFn: () => notificationsApi.getUnreadCount(),
    refetchOnWindowFocus: true,
  });
}
