import { useQuery } from '@tanstack/react-query';
import { talentApi } from '@/lib/api';

interface TopMatch {
  username: string;
  matchScore: number;
}

export function useCampaignTopMatches(campaignIds: string[], enabled = true) {
  return useQuery({
    queryKey: ['recruiter', 'campaign-top-matches', campaignIds],
    queryFn: async (): Promise<Map<string, TopMatch | null>> => {
      const map = new Map<string, TopMatch | null>();
      const results = await Promise.all(
        campaignIds.map(async (id) => {
          try {
            const res = await talentApi.getTalentRecommendations(id, 1);
            const top = res?.data?.[0];
            if (top) {
              const talent = top.talent as Record<string, unknown>;
              return {
                campaignId: id,
                match: {
                  username: (talent?.username as string) || '',
                  matchScore: top.total_score as number,
                },
              };
            }
            return { campaignId: id, match: null };
          } catch {
            return { campaignId: id, match: null };
          }
        }),
      );
      for (const { campaignId, match } of results) {
        map.set(campaignId, match);
      }
      return map;
    },
    enabled: enabled && campaignIds.length > 0,
    staleTime: 120_000,
  });
}
