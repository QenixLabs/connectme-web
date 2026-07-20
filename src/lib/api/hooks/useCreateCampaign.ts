import { useMutation, useQueryClient } from '@tanstack/react-query';
import { campaignApi } from '@/lib/api';
import { usePopup } from '@/hooks/use-popup';
import { useFeatureGuard } from '@/hooks/use-feature-guard';

export function useCreateCampaign() {
  const queryClient = useQueryClient();
  const { show } = usePopup();
  const { handleFeatureError } = useFeatureGuard();

  return useMutation({
    mutationFn: campaignApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaigns', 'list'] });
      show({ title: 'Campaign created', variant: 'success', position: 'bottom-center' });
    },
    onError: (error) => {
      if (handleFeatureError(error)) return;
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
