import { useQuery } from '@tanstack/react-query';
import { campaignApi } from '@/lib/api';

export function useRecruiterDashboardStats() {
  return useQuery({
    queryKey: ['recruiter', 'dashboard', 'stats'],
    queryFn: () => campaignApi.getDashboardStats(),
  });
}
