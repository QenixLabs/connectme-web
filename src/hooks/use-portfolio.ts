import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { talentApi, type PortfolioApiResponse } from "@/lib/api/talent";

// ── Query Key Factory ──────────────────────────────────────
export const portfolioKeys = {
  all: ["portfolio"] as const,
  items: () => [...portfolioKeys.all, "items"] as const,
  stats: () => [...portfolioKeys.all, "stats"] as const,
};

// ── Query Hooks ────────────────────────────────────────────
export function useMyPortfolio() {
  return useQuery({
    queryKey: portfolioKeys.items(),
    queryFn: () => talentApi.getMyPortfolio(),
  });
}

export function usePortfolioStats() {
  return useQuery({
    queryKey: portfolioKeys.stats(),
    queryFn: () => talentApi.getPortfolioStats(),
  });
}

// ── Upload Mutations ───────────────────────────────────────
export function useUploadPortfolioImage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      file,
      data,
    }: {
      file: File;
      data?: Parameters<typeof talentApi.uploadPortfolioImage>[1];
    }) => talentApi.uploadPortfolioImage(file, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: portfolioKeys.items() });
      qc.invalidateQueries({ queryKey: portfolioKeys.stats() });
    },
  });
}

export function useUploadPortfolioVideo() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      file,
      data,
    }: {
      file: File;
      data?: Parameters<typeof talentApi.uploadPortfolioVideo>[1];
    }) => talentApi.uploadPortfolioVideo(file, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: portfolioKeys.items() });
      qc.invalidateQueries({ queryKey: portfolioKeys.stats() });
    },
  });
}

// ── Link Mutation ──────────────────────────────────────────
export function useAddPortfolioLink() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Parameters<typeof talentApi.addPortfolioLink>[0]) =>
      talentApi.addPortfolioLink(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: portfolioKeys.items() });
      qc.invalidateQueries({ queryKey: portfolioKeys.stats() });
    },
  });
}

// ── Update Mutation ────────────────────────────────────────
export function useUpdatePortfolioItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      itemId,
      data,
    }: {
      itemId: string;
      data: Parameters<typeof talentApi.updatePortfolioItem>[1];
    }) => talentApi.updatePortfolioItem(itemId, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: portfolioKeys.items() });
    },
  });
}

// ── Delete Mutation ────────────────────────────────────────
export function useDeletePortfolioItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (itemId: string) => talentApi.deletePortfolioItem(itemId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: portfolioKeys.items() });
      qc.invalidateQueries({ queryKey: portfolioKeys.stats() });
    },
  });
}

// ── Reorder Mutation ───────────────────────────────────────
export function useReorderPortfolio() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (itemIds: string[]) => talentApi.reorderPortfolio(itemIds),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: portfolioKeys.items() });
    },
  });
}
