import { useMutation, useQueryClient } from '@tanstack/react-query';
import { campaignApi } from '@/lib/api';
import { toast } from 'sonner';

export function useCreateCampaign() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: campaignApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaigns', 'list'] });
      toast.success('Campaign created successfully');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to create campaign');
    },
  });
}
