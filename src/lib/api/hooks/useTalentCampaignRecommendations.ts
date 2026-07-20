import { useQuery } from '@tanstack/react-query';
import { talentApi } from '@/lib/api';

export function useTalentCampaignRecommendations(limit = 10, enabled = true) {
  return useQuery({
    queryKey: ['talent', 'campaign-recommendations', limit],
    queryFn: () => talentApi.getCampaignRecommendations(limit),
    enabled,
    staleTime: 120_000,
  });
}
