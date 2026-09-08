import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { savedSearchesApi } from "@/lib/api/saved-searches";
import type { SavedSearchKind, UpsertSavedSearchPayload } from "@/lib/api/saved-searches";

export const savedSearchKeys = {
  all: ["saved-searches"] as const,
  list: (kind: SavedSearchKind) => [...savedSearchKeys.all, kind] as const,
};

export function useSavedSearches(kind: SavedSearchKind) {
  return useQuery({
    queryKey: savedSearchKeys.list(kind),
    queryFn: () => savedSearchesApi.list(kind),
    staleTime: 30 * 1000,
  });
}

export function useUpsertSavedSearch() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: UpsertSavedSearchPayload) =>
      savedSearchesApi.upsert(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: savedSearchKeys.all });
    },
  });
}

export function useMarkSavedSearchViewed() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => savedSearchesApi.markViewed(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: savedSearchKeys.all });
    },
  });
}

export function useDeleteSavedSearch() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => savedSearchesApi.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: savedSearchKeys.all });
    },
  });
}

export function useClearRecentSearches() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => savedSearchesApi.clearRecent(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: savedSearchKeys.all });
    },
  });
}
