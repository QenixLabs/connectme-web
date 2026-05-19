import { useQuery } from '@tanstack/react-query';
import { campaignApi } from '@/lib/api';
import { queryKeys } from '@/lib/api/query-keys';

export function useCampaign(id: string) {
  return useQuery({
    queryKey: queryKeys.campaigns.detail(id),
    queryFn: () => campaignApi.getById(id),
    enabled: !!id,
  });
}
