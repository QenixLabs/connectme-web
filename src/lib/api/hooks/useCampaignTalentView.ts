import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { campaignApi } from '@/lib/api';
import { queryKeys } from '@/lib/api/query-keys';
import { usePopup } from '@/hooks/use-popup';

export function useCampaignTalentView(campaignId: string) {
  return useQuery({
    queryKey: queryKeys.campaigns.talentView(campaignId),
    queryFn: () => campaignApi.getTalentView(campaignId),
    enabled: !!campaignId,
  });
}

export function useWithdrawApplication() {
  const queryClient = useQueryClient();
  const { show } = usePopup();

  return useMutation({
    mutationFn: (campaignId: string) => campaignApi.withdrawApplication(campaignId),
    onSuccess: (_, campaignId) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.campaigns.talentView(campaignId) });
      queryClient.invalidateQueries({ queryKey: ['campaigns', 'list'] });
      show({ title: 'Application withdrawn', variant: 'success', position: 'bottom-center' });
    },
    onError: (error) => {
      const err = error as { response?: { data?: { message?: string } } };
      show({ title: 'Failed to withdraw application', description: err.response?.data?.message, variant: 'error', position: 'bottom-center' });
    },
  });
}
