import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { campaignApi } from '@/lib/api';
import { queryKeys } from '@/lib/api/query-keys';
import { usePopup } from '@/hooks/use-popup';

export function useCampaignTemplates() {
  return useQuery({
    queryKey: ['campaigns', 'templates'],
    queryFn: () => campaignApi.getTemplates(),
  });
}

export function useSaveCampaignTemplate() {
  const queryClient = useQueryClient();
  const { show } = usePopup();

  return useMutation({
    mutationFn: ({ name, campaignId }: { name: string; campaignId: string }) =>
      campaignApi.saveTemplate(name, campaignId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaigns', 'templates'] });
      show({ title: 'Template saved', variant: 'success', position: 'bottom-center' });
    },
    onError: (error: any) => {
      show({ title: 'Failed to save template', description: error?.response?.data?.message, variant: 'error', position: 'bottom-center' });
    },
  });
}

export function useUseCampaignTemplate() {
  const queryClient = useQueryClient();
  const { show } = usePopup();

  return useMutation({
    mutationFn: (templateId: string) => campaignApi.useTemplate(templateId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaigns', 'list'] });
      show({ title: 'Campaign created from template', variant: 'success', position: 'bottom-center' });
    },
    onError: (error: any) => {
      show({ title: 'Failed to use template', description: error?.response?.data?.message, variant: 'error', position: 'bottom-center' });
    },
  });
}
