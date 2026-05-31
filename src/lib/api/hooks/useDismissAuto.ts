import { useMutation, useQueryClient } from '@tanstack/react-query';
import { notificationsApi } from '@/lib/api';

export function useDismissAuto() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => notificationsApi.dismissAuto(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
}
