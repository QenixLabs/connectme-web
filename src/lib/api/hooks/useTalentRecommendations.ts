import { useQuery } from '@tanstack/react-query';
import { talentApi } from '@/lib/api';

export function useTalentRecommendations(
  campaignId: string,
  limit = 10,
  enabled = true,
) {
  return useQuery({
    queryKey: ['recruiter', 'talent-recommendations', campaignId, limit],
    queryFn: () => talentApi.getTalentRecommendations(campaignId, limit),
    enabled: !!campaignId && enabled,
    staleTime: 120_000,
  });
}
