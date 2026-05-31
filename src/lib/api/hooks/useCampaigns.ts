import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { campaignApi } from '@/lib/api';
import { queryKeys } from '@/lib/api/query-keys';
import { usePopup } from '@/hooks/use-popup';

export function useCampaigns(filters: {
  status?: string;
  search?: string;
  industry?: string;
  role_type?: string;
  gender?: string;
  location_city?: string;
  skills?: string;
  languages?: string;
  applied?: string;
  limit?: number;
}) {
  return useInfiniteQuery({
    queryKey: queryKeys.campaigns.all(filters),
    queryFn: ({ pageParam }) => campaignApi.getAll({ ...filters, cursor: pageParam }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
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
    onError: (error: any) => {
      show({ title: 'Failed to delete campaign', description: error?.response?.data?.message, variant: 'error', position: 'bottom-center' });
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
    onError: (error: any) => {
      show({ title: 'Failed to publish campaign', description: error?.response?.data?.message, variant: 'error', position: 'bottom-center' });
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
    onError: (error: any) => {
      show({ title: 'Failed to close campaign', description: error?.response?.data?.message, variant: 'error', position: 'bottom-center' });
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
    onError: (error: any) => {
      show({ title: 'Failed to reopen campaign', description: error?.response?.data?.message, variant: 'error', position: 'bottom-center' });
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
    onError: (error: any) => {
      show({ title: 'Failed to clone campaign', description: error?.response?.data?.message, variant: 'error', position: 'bottom-center' });
    },
  });
}

export function useBookmarkCampaign() {
  const queryClient = useQueryClient();
  const { show } = usePopup();
  return useMutation({
    mutationFn: campaignApi.bookmark,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
      show({ title: 'Campaign saved', variant: 'success', position: 'bottom-center' });
    },
    onError: (error: any) => {
      show({ title: 'Failed to save', description: error?.response?.data?.message, variant: 'error', position: 'bottom-center' });
    },
  });
}

export function useUnbookmarkCampaign() {
  const queryClient = useQueryClient();
  const { show } = usePopup();
  return useMutation({
    mutationFn: campaignApi.unbookmark,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
      show({ title: 'Removed from saved', variant: 'success', position: 'bottom-center' });
    },
    onError: (error: any) => {
      show({ title: 'Failed to remove', description: error?.response?.data?.message, variant: 'error', position: 'bottom-center' });
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
    onError: (error: any) => {
      show({ title: 'Upload failed', description: error?.response?.data?.message, variant: 'error', position: 'bottom-center' });
    },
  });
}

export function useDeleteCampaignMedia() {
  const queryClient = useQueryClient();
  const { show } = usePopup();
  return useMutation({
    mutationFn: ({ campaignId, url }: { campaignId: string; url: string }) =>
      campaignApi.deleteMedia(campaignId, url),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.campaigns.detail(variables.campaignId) });
      show({ title: 'Media deleted', variant: 'success', position: 'bottom-center' });
    },
    onError: (error: any) => {
      show({ title: 'Delete failed', description: error?.response?.data?.message, variant: 'error', position: 'bottom-center' });
    },
  });
}
