import { useMutation, useQueryClient } from '@tanstack/react-query';
import { talentApi } from '@/lib/api';
import { queryKeys } from '@/lib/api/query-keys';
import { usePopup } from '@/hooks/use-popup';

export function useRequestProfileAccess() {
  const queryClient = useQueryClient();
  const { show } = usePopup();

  return useMutation({
    mutationFn: (username: string) => talentApi.requestAccess(username),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['talent', 'list'] });
      show({ title: 'Access request sent', variant: 'success', position: 'bottom-center' });
    },
    onError: (error: any) => {
      show({
        title: 'Failed to send access request',
        description: error?.response?.data?.message,
        variant: 'error',
        position: 'bottom-center',
      });
    },
  });
}
