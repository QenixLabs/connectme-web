import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { talentApi, type PortfolioApiResponse } from "@/lib/api/talent";
import type {
  PortfolioItem,
  PortfolioItemType,
  PortfolioVisibility,
} from "@/lib/types/portfolio";

export const portfolioKeys = {
  all: ["portfolio"] as const,
  my: () => [...portfolioKeys.all, "my"] as const,
  public: (username: string) =>
    [...portfolioKeys.all, "public", username] as const,
  like: (itemId: string) =>
    [...portfolioKeys.all, "like", itemId] as const,
};

function updatePortfolioItemInCache(
  qc: ReturnType<typeof useQueryClient>,
  itemId: string,
  updater: (item: PortfolioItem) => PortfolioItem,
) {
  qc.setQueriesData<PortfolioItem[]>(
    { queryKey: portfolioKeys.all },
    (old) => {
      if (!old) return old;
      return old.map((item) => (item.id === itemId ? updater(item) : item));
    },
  );
}

function apiItemToPortfolioItem(
  item: PortfolioApiResponse,
  index: number,
): PortfolioItem {
  const type = item.type || "image";
  const title = item.title || item.caption || "Untitled work";
  const safeType: PortfolioItem["type"] =
    type === "image" || type === "video" || type === "youtube" || type === "instagram"
      ? type
      : "image";

  return {
    id: item.id,
    type: safeType,
    category: item.category || "work",
    title,
    description: item.description || "",
    url: item.url,
    thumbnailUrl: item.thumbnail_url || item.url,
    embedUrl: item.embed_url,
    isFeatured: !!item.is_pinned,
    sortOrder: index,
    skills: [],
    likesCount: item.likes_count ?? 0,
    isLiked: !!item.is_liked_by_me,
    viewsCount: item.view_count ?? 0,
    visibility: "public" as PortfolioVisibility,
    createdAt: item.created_at || new Date().toISOString(),
    updatedAt: item.updated_at || item.created_at || new Date().toISOString(),
  };
}

export function usePublicPortfolio(username: string) {
  return useQuery({
    queryKey: portfolioKeys.public(username),
    queryFn: async () => {
      const items = await talentApi.getPortfolio(username);
      return items.map(apiItemToPortfolioItem);
    },
    enabled: !!username,
  });
}

export function useMyPortfolio() {
  return useQuery({
    queryKey: portfolioKeys.my(),
    queryFn: () => talentApi.getMyPortfolio(),
  });
}

export function usePortfolioItemLikeStatus(itemId: string) {
  return useQuery({
    queryKey: portfolioKeys.like(itemId),
    queryFn: () => talentApi.getPortfolioItemLikeStatus(itemId),
    enabled: !!itemId,
  });
}

export function useLikePortfolioItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (itemId: string) => talentApi.likePortfolioItem(itemId),
    onSuccess: (data, itemId) => {
      qc.setQueryData(portfolioKeys.like(itemId), data);
      updatePortfolioItemInCache(qc, itemId, (item) => ({
        ...item,
        likesCount: data.likes_count,
        isLiked: true,
      }));
    },
  });
}

export function useUnlikePortfolioItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (itemId: string) => talentApi.unlikePortfolioItem(itemId),
    onSuccess: (data, itemId) => {
      qc.setQueryData(portfolioKeys.like(itemId), data);
      updatePortfolioItemInCache(qc, itemId, (item) => ({
        ...item,
        likesCount: data.likes_count,
        isLiked: false,
      }));
    },
  });
}

export function usePortfolioStats() {
  return useQuery({
    queryKey: [...portfolioKeys.all, "stats"],
    queryFn: () => talentApi.getPortfolioStats(),
  });
}

export function useCreatePortfolioLink() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: {
      url: string;
      title?: string;
      caption?: string;
      description?: string;
      category?: string;
      is_pinned?: boolean;
    }) => talentApi.addPortfolioLink(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: portfolioKeys.my() });
    },
  });
}

export function useUpdatePortfolioItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      itemId,
      data,
    }: {
      itemId: string;
      data: {
        title?: string;
        caption?: string;
        description?: string;
        category?: string;
        is_pinned?: boolean;
      };
    }) => talentApi.updatePortfolioItem(itemId, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: portfolioKeys.my() });
    },
  });
}

export function useDeletePortfolioItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (itemId: string) => talentApi.deletePortfolioItem(itemId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: portfolioKeys.my() });
    },
  });
}

export function useTogglePortfolioFeatured() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ itemId, isPinned }: { itemId: string; isPinned: boolean }) =>
      talentApi.togglePortfolioFeatured(itemId, isPinned),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: portfolioKeys.my() });
    },
  });
}

export function useReorderPortfolio() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (itemIds: string[]) => talentApi.reorderPortfolio(itemIds),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: portfolioKeys.my() });
    },
  });
}

export function useUploadPortfolioImage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      file,
      data,
    }: {
      file: File;
      data?: {
        title?: string;
        caption?: string;
        description?: string;
        category?: string;
        is_pinned?: boolean;
      };
    }) => talentApi.uploadPortfolioImage(file, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: portfolioKeys.my() });
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
      data?: {
        title?: string;
        caption?: string;
        description?: string;
        category?: string;
        is_pinned?: boolean;
      };
    }) => talentApi.uploadPortfolioVideo(file, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: portfolioKeys.my() });
    },
  });
}

export function useUploadPortfolioYouTube() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      url,
      data,
    }: {
      url: string;
      data?: {
        title?: string;
        caption?: string;
        description?: string;
        category?: string;
        is_pinned?: boolean;
      };
    }) =>
      talentApi.addPortfolioLink({
        url,
        ...data,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: portfolioKeys.my() });
    },
  });
}

export function useIsPortfolioOwner(username: string) {
  // Best-effort client-side ownership check. In RSC layouts this is checked
  // via cookies; here we mirror it for UI controls.
  if (typeof document === "undefined") return false;
  const match = document.cookie.match(/(?:^|; )user_role=([^;]+)/);
  const role = match ? decodeURIComponent(match[1]) : null;
  return role === "talent";
}

export function filterPortfolioItems(
  items: PortfolioItem[],
  tab: "All" | "Images" | "Videos" | "YouTube",
) {
  if (tab === "All") return items;
  if (tab === "Images") return items.filter((i) => i.type === "image");
  if (tab === "Videos")
    return items.filter((i) => i.type === "video" || i.type === "youtube");
  return items.filter((i) => i.type === "youtube");
}

export function getYouTubeVideoId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/v\/|youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/,
    /^([a-zA-Z0-9_-]{11})$/,
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match?.[1]) return match[1];
  }
  return null;
}

export function getYouTubeThumbnail(url: string): string | null {
  const id = getYouTubeVideoId(url);
  return id ? `https://img.youtube.com/vi/${id}/hqdefault.jpg` : null;
}

export function getYouTubeEmbedUrl(url: string): string | null {
  const id = getYouTubeVideoId(url);
  return id ? `https://www.youtube.com/embed/${id}` : null;
}

export function formatDuration(seconds?: number): string | undefined {
  if (!seconds || seconds <= 0) return undefined;
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

export function formatCount(count: number): string {
  if (count >= 1_000_000) return `${(count / 1_000_000).toFixed(1)}M`;
  if (count >= 1_000) return `${(count / 1_000).toFixed(1)}K`;
  return String(count);
}

// Backward-compatible aliases used by legacy dashboard components.
export const useAddPortfolioLink = useCreatePortfolioLink;
