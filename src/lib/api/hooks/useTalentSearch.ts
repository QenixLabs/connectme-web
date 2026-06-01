import { useInfiniteQuery, keepPreviousData } from '@tanstack/react-query';
import { talentApi } from '@/lib/api';
import { queryKeys } from '@/lib/api/query-keys';

export function useTalentSearch(filters: {
  profession?: string;
  location_city?: string;
  availability?: string;
  gender?: string;
  search?: string;
}) {
  return useInfiniteQuery({
    queryKey: queryKeys.talent.all(filters),
    queryFn: ({ pageParam }) => talentApi.getAllTalent({ ...filters, cursor: pageParam }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    placeholderData: keepPreviousData,
  });
}
