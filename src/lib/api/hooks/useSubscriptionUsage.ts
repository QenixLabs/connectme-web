import { useQuery } from '@tanstack/react-query';
import { subscriptionsApi } from '@/lib/api/subscriptions';
import { queryKeys } from '@/lib/api/query-keys';

export function useSubscriptionUsage() {
  return useQuery({
    queryKey: queryKeys.subscriptions.usage(),
    queryFn: () => subscriptionsApi.getUsage(),
  });
}
