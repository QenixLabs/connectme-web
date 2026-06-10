import { useQuery } from '@tanstack/react-query';
import { invoicesApi } from '@/lib/api/invoices';
import { queryKeys } from '@/lib/api/query-keys';

export function useInvoices(page = 1, limit = 20) {
  return useQuery({
    queryKey: queryKeys.subscriptions.invoices(page, limit),
    queryFn: () => invoicesApi.getMyInvoices(page, limit),
  });
}
