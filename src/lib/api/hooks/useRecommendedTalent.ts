import { useQuery } from '@tanstack/react-query';
import { talentApi } from '@/lib/api';
import { queryKeys } from '@/lib/api/query-keys';

export function useRecommendedTalent(limit?: number) {
  return useQuery({
    queryKey: queryKeys.talent.recommendations(limit),
    queryFn: () => talentApi.getRecommendations(limit),
  });
}
