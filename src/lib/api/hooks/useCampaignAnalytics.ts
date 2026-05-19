import { useQuery } from '@tanstack/react-query';
import { campaignApi } from '@/lib/api';
import { queryKeys } from '@/lib/api/query-keys';

export function useCampaignAnalytics(campaignId: string) {
  return useQuery({
    queryKey: queryKeys.campaigns.analytics(campaignId),
    queryFn: () => campaignApi.getAnalytics(campaignId),
    enabled: !!campaignId,
  });
}

export function useCampaignDemographics(campaignId: string) {
  return useQuery({
    queryKey: queryKeys.campaigns.demographics(campaignId),
    queryFn: () => campaignApi.getDemographics(campaignId),
    enabled: !!campaignId,
  });
}
