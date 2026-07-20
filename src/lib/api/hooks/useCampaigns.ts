import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { keepPreviousData } from '@tanstack/react-query';
import { campaignApi } from '@/lib/api';
import { queryKeys } from '@/lib/api/query-keys';
import { usePopup } from '@/hooks/use-popup';
import { useFeatureGuard } from '@/hooks/use-feature-guard';

export function useCampaigns(filters: {
  status?: string;
  search?: string;
  role_type?: string;
  gender?: string;
  location_city?: string;
  skills?: string;
  languages?: string;
  applied?: string;
  sort?: string;
  limit?: number;
}) {
  const isRelevance = filters.sort === 'relevance';

  return useInfiniteQuery({
    queryKey: queryKeys.campaigns.all(filters),
    queryFn: ({ pageParam }) =>
      isRelevance
        ? campaignApi.getAll({ ...filters, page: (pageParam as number) ?? 1 })
        : campaignApi.getAll({ ...filters, cursor: pageParam as string | undefined }),
    initialPageParam: isRelevance ? (1 as number) : (undefined as string | undefined),
    getNextPageParam: (lastPage) =>
      isRelevance
        ? (lastPage.hasMore ? (lastPage.page ?? 1) + 1 : undefined)
        : (lastPage.nextCursor ?? undefined),
    placeholderData: keepPreviousData,
  });
}

export function useDeleteCampaign() {
  const queryClient = useQueryClient();
  const { show } = usePopup();
  return useMutation({
    mutationFn: campaignApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaigns', 'list'] });
      show({ title: 'Campaign deleted', variant: 'success', position: 'bottom-center' });
    },
    onError: (error) => {
      const err = error as { response?: { data?: { message?: string } } };
      show({ title: 'Failed to delete campaign', description: err.response?.data?.message, variant: 'error', position: 'bottom-center' });
    },
  });
}

export function usePublishCampaign() {
  const queryClient = useQueryClient();
  const { show } = usePopup();
  return useMutation({
    mutationFn: campaignApi.publish,
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['campaigns', 'list'] });
      queryClient.invalidateQueries({ queryKey: queryKeys.campaigns.detail(id) });
      show({ title: 'Campaign published', variant: 'success', position: 'bottom-center' });
    },
    onError: (error) => {
      const err = error as { response?: { data?: { message?: string } } };
      show({ title: 'Failed to publish campaign', description: err.response?.data?.message, variant: 'error', position: 'bottom-center' });
    },
  });
}

export function useCloseCampaign() {
  const queryClient = useQueryClient();
  const { show } = usePopup();
  return useMutation({
    mutationFn: campaignApi.close,
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['campaigns', 'list'] });
      queryClient.invalidateQueries({ queryKey: queryKeys.campaigns.detail(id) });
      show({ title: 'Campaign closed', variant: 'success', position: 'bottom-center' });
    },
    onError: (error) => {
      const err = error as { response?: { data?: { message?: string } } };
      show({ title: 'Failed to close campaign', description: err.response?.data?.message, variant: 'error', position: 'bottom-center' });
    },
  });
}

export function useReopenCampaign() {
  const queryClient = useQueryClient();
  const { show } = usePopup();
  return useMutation({
    mutationFn: campaignApi.reopen,
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['campaigns', 'list'] });
      queryClient.invalidateQueries({ queryKey: queryKeys.campaigns.detail(id) });
      show({ title: 'Campaign reopened', variant: 'success', position: 'bottom-center' });
    },
    onError: (error) => {
      const err = error as { response?: { data?: { message?: string } } };
      show({ title: 'Failed to reopen campaign', description: err.response?.data?.message, variant: 'error', position: 'bottom-center' });
    },
  });
}

export function useCloneCampaign() {
  const queryClient = useQueryClient();
  const { show } = usePopup();
  return useMutation({
    mutationFn: campaignApi.clone,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaigns', 'list'] });
      show({ title: 'Campaign cloned', variant: 'success', position: 'bottom-center' });
    },
    onError: (error) => {
      const err = error as { response?: { data?: { message?: string } } };
      show({ title: 'Failed to clone campaign', description: err.response?.data?.message, variant: 'error', position: 'bottom-center' });
    },
  });
}

export function useBookmarkCampaign() {
  const queryClient = useQueryClient();
  const { show } = usePopup();
  const { handleFeatureError } = useFeatureGuard();
  return useMutation({
    mutationFn: campaignApi.bookmark,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
      show({ title: 'Campaign saved', variant: 'success', position: 'bottom-center' });
    },
    onError: (error) => {
      if (handleFeatureError(error)) return;
      const err = error as { response?: { data?: { message?: string } } };
      show({ title: 'Failed to save', description: err.response?.data?.message, variant: 'error', position: 'bottom-center' });
    },
  });
}

export function useUnbookmarkCampaign() {
  const queryClient = useQueryClient();
  const { show } = usePopup();
  const { handleFeatureError } = useFeatureGuard();
  return useMutation({
    mutationFn: campaignApi.unbookmark,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
      show({ title: 'Removed from saved', variant: 'success', position: 'bottom-center' });
    },
    onError: (error) => {
      if (handleFeatureError(error)) return;
      const err = error as { response?: { data?: { message?: string } } };
      show({ title: 'Failed to remove', description: err.response?.data?.message, variant: 'error', position: 'bottom-center' });
    },
  });
}

export function useBookmarkedCampaigns() {
  return useQuery({
    queryKey: ['campaigns', 'bookmarks'],
    queryFn: () => campaignApi.getBookmarks(),
  });
}

export function useRecommendedCampaigns(limit?: number) {
  return useQuery({
    queryKey: ['campaigns', 'recommendations', limit],
    queryFn: () => campaignApi.getRecommendations(limit),
  });
}

export function useUploadCampaignMedia() {
  const queryClient = useQueryClient();
  const { show } = usePopup();
  return useMutation({
    mutationFn: ({ campaignId, formData }: { campaignId: string; formData: FormData }) =>
      campaignApi.uploadMedia(campaignId, formData),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.campaigns.detail(variables.campaignId) });
      show({ title: 'Media uploaded', variant: 'success', position: 'bottom-center' });
    },
    onError: (error) => {
      const err = error as { response?: { data?: { message?: string } } };
      show({ title: 'Upload failed', description: err.response?.data?.message, variant: 'error', position: 'bottom-center' });
    },
  });
}

export function useDeleteCampaignMedia() {
  const queryClient = useQueryClient();
  const { show } = usePopup();
  return useMutation({
    mutationFn: ({ campaignId }: { campaignId: string }) =>
      campaignApi.deleteMedia(campaignId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.campaigns.detail(variables.campaignId) });
      show({ title: 'Media deleted', variant: 'success', position: 'bottom-center' });
    },
    onError: (error) => {
      const err = error as { response?: { data?: { message?: string } } };
      show({ title: 'Delete failed', description: err.response?.data?.message, variant: 'error', position: 'bottom-center' });
    },
  });
}
