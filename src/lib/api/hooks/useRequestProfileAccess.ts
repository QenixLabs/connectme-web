import { useMutation, useQueryClient } from '@tanstack/react-query';
import { talentApi } from '@/lib/api';
import { queryKeys } from '@/lib/api/query-keys';
import { toast } from 'sonner';

export function useRequestProfileAccess() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (username: string) => talentApi.requestAccess(username),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['talent', 'list'] });
      toast.success('Access request sent');
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message || 'Failed to send access request',
      );
    },
  });
}
