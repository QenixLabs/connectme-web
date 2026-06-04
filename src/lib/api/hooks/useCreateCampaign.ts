import { useMutation, useQueryClient } from '@tanstack/react-query';
import { campaignApi } from '@/lib/api';
import { usePopup } from '@/hooks/use-popup';

export function useCreateCampaign() {
  const queryClient = useQueryClient();
  const { show } = usePopup();

  return useMutation({
    mutationFn: campaignApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaigns', 'list'] });
      show({ title: 'Campaign created', variant: 'success', position: 'bottom-center' });
    },
    onError: (error) => {
      const err = error as { response?: { data?: { message?: string } } };
      show({
        title: 'Failed to create campaign',
        description: err.response?.data?.message,
        variant: 'error',
        position: 'bottom-center',
      });
    },
  });
}
