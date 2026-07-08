import { useInfiniteQuery, keepPreviousData } from '@tanstack/react-query';
import { talentApi } from '@/lib/api';
import { queryKeys } from '@/lib/api/query-keys';

export function useTalentSearch(filters: {
  profession?: string;
  location_city?: string;
  availability?: string;
  gender?: string;
  search?: string;
  sort?: string;
}) {
  const isRelevance = filters.sort === 'relevance';

  return useInfiniteQuery({
    queryKey: queryKeys.talent.all(filters),
    queryFn: ({ pageParam }) =>
      isRelevance
        ? talentApi.getAllTalent({ ...filters, page: (pageParam as number) ?? 1 })
        : talentApi.getAllTalent({ ...filters, cursor: pageParam as string | undefined }),
    initialPageParam: isRelevance ? (1 as number) : (undefined as string | undefined),
    getNextPageParam: (lastPage) =>
      isRelevance
        ? (lastPage.hasMore ? (lastPage.page ?? 1) + 1 : undefined)
        : (lastPage.nextCursor ?? undefined),
    placeholderData: keepPreviousData,
  });
}
