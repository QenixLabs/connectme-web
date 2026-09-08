import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { talentApi } from "@/lib/api/talent";
import type { SearchTalentsParams } from "@/lib/api/talent";

export const talentSearchKeys = {
  all: ["talent-search"] as const,
  search: (params: SearchTalentsParams) =>
    [...talentSearchKeys.all, "search", params] as const,
  professions: (q?: string) =>
    [...talentSearchKeys.all, "professions", q] as const,
};

export function useTalentSearch(params: SearchTalentsParams = {}) {
  const stableParams = { ...params };
  delete stableParams.cursor;
  delete stableParams.page;

  return useInfiniteQuery({
    queryKey: talentSearchKeys.search(stableParams),
    queryFn: ({ pageParam }) =>
      talentApi.searchTalents({
        ...stableParams,
        ...(stableParams.sort === "relevance"
          ? { page: pageParam as number }
          : { cursor: pageParam as string | undefined }),
      }),
    initialPageParam: (stableParams.sort === "relevance" ? 1 : undefined) as
      | string
      | number
      | undefined,
    getNextPageParam: (lastPage, allPages) => {
      if (lastPage.hasMore === false) return undefined;
      if (lastPage.nextCursor) return lastPage.nextCursor;
      if (lastPage.hasMore) return (lastPage.page ?? allPages.length) + 1;
      return undefined;
    },
    placeholderData: (prev) => prev,
  });
}

export function useProfessions(q?: string) {
  return useQuery({
    queryKey: talentSearchKeys.professions(q),
    queryFn: () => talentApi.getProfessions(q),
    placeholderData: (prev) => prev,
  });
}
