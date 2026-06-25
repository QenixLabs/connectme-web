import { useQuery } from '@tanstack/react-query';
import { talentApi } from '@/lib/api';
import { queryKeys } from '@/lib/api/query-keys';
import type { TalentProfile } from '@/lib/validations/talent-profile.schema';

export function useTalentProfile() {
  return useQuery<TalentProfile | null>({
    queryKey: queryKeys.talent.myProfile(),
    queryFn: () => talentApi.getMyProfile(),
    staleTime: 60_000,
  });
}
