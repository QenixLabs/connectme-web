import { useMutation, useQueryClient } from '@tanstack/react-query';
import { campaignApi } from '@/lib/api';
import { queryKeys } from '@/lib/api/query-keys';
import { usePopup } from '@/hooks/use-popup';

export function useUpdateCampaign() {
  const queryClient = useQueryClient();
  const { show } = usePopup();

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: Parameters<typeof campaignApi.update>[1];
    }) => campaignApi.update(id, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['campaigns', 'list'] });
      queryClient.invalidateQueries({
        queryKey: queryKeys.campaigns.detail(variables.id),
      });
      show({ title: 'Campaign updated', variant: 'success', position: 'bottom-center' });
    },
    onError: (error: any) => {
      show({
        title: 'Failed to update campaign',
        description: error?.response?.data?.message,
        variant: 'error',
        position: 'bottom-center',
      });
    },
  });
}
