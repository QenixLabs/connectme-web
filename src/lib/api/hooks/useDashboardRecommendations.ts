import { useQuery } from '@tanstack/react-query';
import { talentApi } from '@/lib/api';

export function useDashboardRecommendations(limit?: number, enabled?: boolean) {
  return useQuery({
    queryKey: ['recruiter', 'dashboard-recommendations', limit],
    queryFn: () => talentApi.getDashboardRecommendations(limit),
    enabled,
    refetchInterval: 300_000,
  });
}
