import { useQuery } from '@tanstack/react-query';
import { campaignApi } from '@/lib/api';
import { queryKeys } from '@/lib/api/query-keys';

export function useCampaignInvites(campaignId: string) {
  return useQuery({
    queryKey: queryKeys.campaigns.invites(campaignId),
    queryFn: () => campaignApi.getInvites(campaignId),
    enabled: !!campaignId,
  });
}
