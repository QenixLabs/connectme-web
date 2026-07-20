import { useMutation, useQueryClient } from '@tanstack/react-query';
import { campaignApi } from '@/lib/api';
import { queryKeys } from '@/lib/api/query-keys';

export function useInviteTalent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ campaignId, talentId, message }: { campaignId: string; talentId: string; message?: string }) =>
      campaignApi.invite(campaignId, { talent_id: talentId, message }),
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.campaigns.invites(vars.campaignId) });
    },
  });
}

export function useBulkInviteTalent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ campaignId, talentIds, message }: { campaignId: string; talentIds: string[]; message?: string }) =>
      campaignApi.bulkInvite(campaignId, { talent_ids: talentIds, message }),
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.campaigns.invites(vars.campaignId) });
    },
  });
}

export function useRespondToInvite() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ inviteId, action }: { inviteId: string; action: 'accept' | 'decline' }) =>
      action === 'accept' ? campaignApi.acceptInvite(inviteId) : campaignApi.declineInvite(inviteId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaigns', 'invites'] });
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
}
