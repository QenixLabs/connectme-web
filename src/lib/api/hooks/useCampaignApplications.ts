import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { campaignApi } from '@/lib/api';
import { queryKeys } from '@/lib/api/query-keys';
import { usePopup } from '@/hooks/use-popup';

export function useCampaignApplications(campaignId: string) {
  return useQuery({
    queryKey: queryKeys.campaigns.applications(campaignId),
    queryFn: () => campaignApi.getApplications(campaignId),
    enabled: !!campaignId,
  });
}

export function useUpdateApplicationStatus() {
  const queryClient = useQueryClient();
  const { show } = usePopup();

  return useMutation({
    mutationFn: ({
      campaignId,
      applicationId,
      status,
    }: {
      campaignId: string;
      applicationId: string;
      status: string;
    }) =>
      campaignApi.updateApplicationStatus(campaignId, applicationId, status),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.campaigns.applications(variables.campaignId),
      });
      show({ title: 'Application status updated', variant: 'success', position: 'bottom-center' });
    },
    onError: (error: any) => {
      show({
        title: 'Failed to update application status',
        description: error?.response?.data?.message,
        variant: 'error',
        position: 'bottom-center',
      });
    },
  });
}

export function useBulkUpdateApplicationStatus() {
  const queryClient = useQueryClient();
  const { show } = usePopup();

  return useMutation({
    mutationFn: ({
      campaignId,
      applicationIds,
      status,
    }: {
      campaignId: string;
      applicationIds: string[];
      status: string;
    }) => campaignApi.bulkUpdateApplicationStatus(campaignId, applicationIds, status),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.campaigns.applications(variables.campaignId),
      });
      show({ title: 'Applications updated', variant: 'success', position: 'bottom-center' });
    },
    onError: (error: any) => {
      show({
        title: 'Failed to update applications',
        description: error?.response?.data?.message,
        variant: 'error',
        position: 'bottom-center',
      });
    },
  });
}

export function useAddToShortlist() {
  const queryClient = useQueryClient();
  const { show } = usePopup();

  return useMutation({
    mutationFn: ({ campaignId, applicationId }: { campaignId: string; applicationId: string }) =>
      campaignApi.addToShortlist(campaignId, applicationId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.campaigns.applications(variables.campaignId),
      });
      show({ title: 'Added to shortlist', variant: 'success', position: 'bottom-center' });
    },
    onError: (error: any) => {
      show({ title: 'Failed to add to shortlist', description: error?.response?.data?.message, variant: 'error', position: 'bottom-center' });
    },
  });
}

export function useRemoveFromShortlist() {
  const queryClient = useQueryClient();
  const { show } = usePopup();

  return useMutation({
    mutationFn: ({ campaignId, applicationId }: { campaignId: string; applicationId: string }) =>
      campaignApi.removeFromShortlist(campaignId, applicationId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.campaigns.applications(variables.campaignId),
      });
      show({ title: 'Removed from shortlist', variant: 'success', position: 'bottom-center' });
    },
    onError: (error: any) => {
      show({ title: 'Failed to remove from shortlist', description: error?.response?.data?.message, variant: 'error', position: 'bottom-center' });
    },
  });
}

export function useUpsertApplicantNote() {
  const queryClient = useQueryClient();
  const { show } = usePopup();

  return useMutation({
    mutationFn: ({
      campaignId,
      applicationId,
      payload,
    }: {
      campaignId: string;
      applicationId: string;
      payload: { note_text?: string; rating?: number };
    }) => campaignApi.upsertApplicantNote(campaignId, applicationId, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.campaigns.applications(variables.campaignId),
      });
      show({ title: 'Note saved', variant: 'success', position: 'bottom-center' });
    },
    onError: (error: any) => {
      show({ title: 'Failed to save note', description: error?.response?.data?.message, variant: 'error', position: 'bottom-center' });
    },
  });
}

export function useDeleteApplicantNote() {
  const queryClient = useQueryClient();
  const { show } = usePopup();

  return useMutation({
    mutationFn: ({ campaignId, applicationId }: { campaignId: string; applicationId: string }) =>
      campaignApi.deleteApplicantNote(campaignId, applicationId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.campaigns.applications(variables.campaignId),
      });
      show({ title: 'Note deleted', variant: 'success', position: 'bottom-center' });
    },
    onError: (error: any) => {
      show({ title: 'Failed to delete note', description: error?.response?.data?.message, variant: 'error', position: 'bottom-center' });
    },
  });
}
