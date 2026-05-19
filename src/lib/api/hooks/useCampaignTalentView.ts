import { useQuery } from '@tanstack/react-query';
import { campaignApi } from '@/lib/api';
import { queryKeys } from '@/lib/api/query-keys';

export function useCampaignTalentView(campaignId: string) {
  return useQuery({
    queryKey: queryKeys.campaigns.talentView(campaignId),
    queryFn: () => campaignApi.getTalentView(campaignId),
    enabled: !!campaignId,
  });
}
