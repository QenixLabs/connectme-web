import { useQuery } from '@tanstack/react-query';
import { recruiterApi } from '@/lib/api';
import { queryKeys } from '@/lib/api/query-keys';

export function useRecruiterProfile() {
  return useQuery({
    queryKey: queryKeys.recruiter.me(),
    queryFn: () => recruiterApi.getMyProfile(),
  });
}
