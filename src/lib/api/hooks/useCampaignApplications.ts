import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { campaignApi } from '@/lib/api';
import { queryKeys } from '@/lib/api/query-keys';
import { toast } from 'sonner';

export function useCampaignApplications(campaignId: string) {
  return useQuery({
    queryKey: queryKeys.campaigns.applications(campaignId),
    queryFn: () => campaignApi.getApplications(campaignId),
    enabled: !!campaignId,
  });
}

export function useUpdateApplicationStatus() {
  const queryClient = useQueryClient();

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
      toast.success('Application status updated');
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message || 'Failed to update application status',
      );
    },
  });
}
