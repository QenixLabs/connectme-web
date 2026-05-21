import { useInfiniteQuery } from '@tanstack/react-query';
import { notificationsApi } from '@/lib/api';
import { queryKeys } from '@/lib/api/query-keys';

export function useNotifications(history: boolean = false) {
  return useInfiniteQuery({
    queryKey: queryKeys.notifications.all(history),
    queryFn: ({ pageParam }) =>
      notificationsApi.getNotifications(history, pageParam, 20),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      if (lastPage.page < lastPage.total_pages) {
        return lastPage.page + 1;
      }
      return undefined;
    },
  });
}
