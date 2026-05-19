import { useInfiniteQuery } from '@tanstack/react-query';
import { campaignApi } from '@/lib/api';
import { queryKeys } from '@/lib/api/query-keys';

export function useCampaigns(filters: {
  status?: string;
  search?: string;
  industry?: string;
  role_type?: string;
  gender?: string;
  location_city?: string;
  limit?: number;
}) {
  return useInfiniteQuery({
    queryKey: queryKeys.campaigns.all(filters),
    queryFn: ({ pageParam }) => campaignApi.getAll({ ...filters, cursor: pageParam }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
  });
}
