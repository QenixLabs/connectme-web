import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { talentApi } from '@/lib/api';
import { queryKeys } from '@/lib/api/query-keys';

export function useDistinctProfessions(search: string) {
  return useQuery({
    queryKey: queryKeys.talent.professions(search),
    queryFn: () => talentApi.getDistinctProfessions(search),
    staleTime: 5 * 60_000,
    placeholderData: keepPreviousData,
  });
}
