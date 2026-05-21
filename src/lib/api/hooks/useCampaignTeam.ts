import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { campaignApi } from '@/lib/api';
import { queryKeys } from '@/lib/api/query-keys';
import { usePopup } from '@/hooks/use-popup';

export function useCampaignTeam(campaignId: string) {
  return useQuery({
    queryKey: queryKeys.campaigns.team(campaignId),
    queryFn: () => campaignApi.getTeam(campaignId),
    enabled: !!campaignId,
  });
}

export function useInviteTeamMember() {
  const queryClient = useQueryClient();
  const { show } = usePopup();

  return useMutation({
    mutationFn: ({
      campaignId,
      email,
      role,
    }: {
      campaignId: string;
      email: string;
      role: string;
    }) => campaignApi.inviteTeamMember(campaignId, email, role),
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.campaigns.team(vars.campaignId) });
      show({ title: 'Team member invited', variant: 'success', position: 'bottom-center' });
    },
    onError: (error: any) => {
      show({ title: 'Failed to invite', description: error?.response?.data?.message, variant: 'error', position: 'bottom-center' });
    },
  });
}

export function useUpdateTeamMemberRole() {
  const queryClient = useQueryClient();
  const { show } = usePopup();

  return useMutation({
    mutationFn: ({
      campaignId,
      memberId,
      role,
    }: {
      campaignId: string;
      memberId: string;
      role: string;
    }) => campaignApi.updateTeamMemberRole(campaignId, memberId, role),
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.campaigns.team(vars.campaignId) });
      show({ title: 'Role updated', variant: 'success', position: 'bottom-center' });
    },
    onError: (error: any) => {
      show({ title: 'Failed to update role', description: error?.response?.data?.message, variant: 'error', position: 'bottom-center' });
    },
  });
}

export function useRemoveTeamMember() {
  const queryClient = useQueryClient();
  const { show } = usePopup();

  return useMutation({
    mutationFn: ({ campaignId, memberId }: { campaignId: string; memberId: string }) =>
      campaignApi.removeTeamMember(campaignId, memberId),
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.campaigns.team(vars.campaignId) });
      show({ title: 'Team member removed', variant: 'success', position: 'bottom-center' });
    },
    onError: (error: any) => {
      show({ title: 'Failed to remove', description: error?.response?.data?.message, variant: 'error', position: 'bottom-center' });
    },
  });
}
