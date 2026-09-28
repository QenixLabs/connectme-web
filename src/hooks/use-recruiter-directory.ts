import { useInfiniteQuery } from "@tanstack/react-query";
import { recruiterApi, type PublicRecruiterDirectoryParams } from "@/lib/api/recruiter";

export const recruiterDirectoryKeys = {
  all: ["recruiter-directory"] as const,
  list: (params: PublicRecruiterDirectoryParams) => [...recruiterDirectoryKeys.all, params] as const,
};

export function useRecruiterDirectory(params: PublicRecruiterDirectoryParams = {}) {
  const stableParams = { ...params };
  delete stableParams.page;

  return useInfiniteQuery({
    queryKey: recruiterDirectoryKeys.list(stableParams),
    queryFn: ({ pageParam }) => recruiterApi.getPublicDirectory({
      ...stableParams,
      page: pageParam as number,
    }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => lastPage.hasMore ? lastPage.page + 1 : undefined,
    placeholderData: (previous) => previous,
  });
}
