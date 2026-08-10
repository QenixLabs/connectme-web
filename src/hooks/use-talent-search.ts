import { useQuery } from "@tanstack/react-query";
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
  return useQuery({
    queryKey: talentSearchKeys.search(params),
    queryFn: () => talentApi.searchTalents(params),
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
