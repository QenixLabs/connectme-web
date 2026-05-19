import { useMutation, useQueryClient } from '@tanstack/react-query';
import { campaignApi } from '@/lib/api';
import { queryKeys } from '@/lib/api/query-keys';
import { toast } from 'sonner';

export function useUpdateCampaign() {
  const queryClient = useQueryClient();

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
      toast.success('Campaign updated successfully');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to update campaign');
    },
  });
}
