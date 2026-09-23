import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  teamApi,
  type InviteTeamMemberPayload,
  type TeamMembershipStatus,
} from "@/lib/api/team";

export const teamKeys = {
  all: ["recruiter-team"] as const,
  team: () => [...teamKeys.all, "team"] as const,
  member: (id: string) => [...teamKeys.all, "member", id] as const,
  roles: () => [...teamKeys.all, "roles"] as const,
  permissions: () => [...teamKeys.all, "permissions"] as const,
  matrix: () => [...teamKeys.all, "matrix"] as const,
  invitations: () => [...teamKeys.all, "invitations"] as const,
  audit: (page: number) => [...teamKeys.all, "audit", page] as const,
};

export function useTeam() {
  return useQuery({ queryKey: teamKeys.team(), queryFn: teamApi.getTeam });
}

export function useTeamMember(id: string) {
  return useQuery({
    queryKey: teamKeys.member(id),
    queryFn: () => teamApi.getMember(id),
    enabled: Boolean(id),
  });
}

export function useTeamRoles() {
  return useQuery({ queryKey: teamKeys.roles(), queryFn: teamApi.getRoles });
}

export function useTeamPermissions() {
  return useQuery({
    queryKey: teamKeys.permissions(),
    queryFn: teamApi.getPermissions,
  });
}

export function usePermissionMatrix() {
  return useQuery({
    queryKey: teamKeys.matrix(),
    queryFn: teamApi.getPermissionMatrix,
  });
}

export function useTeamInvitations() {
  return useQuery({
    queryKey: teamKeys.invitations(),
    queryFn: teamApi.getInvitations,
  });
}

export function useTeamAuditLogs(page = 1) {
  return useQuery({
    queryKey: teamKeys.audit(page),
    queryFn: () => teamApi.getAuditLogs(page),
  });
}

function invalidateTeam(queryClient: ReturnType<typeof useQueryClient>) {
  queryClient.invalidateQueries({ queryKey: teamKeys.all });
}

export function useInviteTeamMember() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: InviteTeamMemberPayload) => teamApi.invite(payload),
    onSuccess: () => invalidateTeam(queryClient),
  });
}

export function useVerifyTeamMemberAccount() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: teamApi.verifyAccount,
    onSuccess: () => invalidateTeam(queryClient),
  });
}

export function useResendTeamInvitation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => teamApi.resendInvitation(id),
    onSuccess: () => invalidateTeam(queryClient),
  });
}

export function useCancelTeamInvitation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => teamApi.cancelInvitation(id),
    onSuccess: () => invalidateTeam(queryClient),
  });
}

export function useUpdateTeamMember() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: {
        department?: string;
        status?: TeamMembershipStatus;
        display_name?: string;
      };
    }) => teamApi.updateMember(id, payload),
    onSuccess: (_, variables) => {
      invalidateTeam(queryClient);
      queryClient.invalidateQueries({
        queryKey: teamKeys.member(variables.id),
      });
    },
  });
}

export function useChangeMemberRole() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, roleId }: { id: string; roleId: string }) =>
      teamApi.changeMemberRole(id, roleId),
    onSuccess: (_, variables) => {
      invalidateTeam(queryClient);
      queryClient.invalidateQueries({
        queryKey: teamKeys.member(variables.id),
      });
    },
  });
}

export function useRemoveTeamMember() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => teamApi.removeMember(id),
    onSuccess: () => invalidateTeam(queryClient),
  });
}

export function useCreateRole() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: teamApi.createRole,
    onSuccess: () => invalidateTeam(queryClient),
  });
}

export function useUpdateRole() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: { name?: string; description?: string; permissions?: string[] };
    }) => teamApi.updateRole(id, payload),
    onSuccess: () => invalidateTeam(queryClient),
  });
}

export function useDeleteRole() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      replacementRoleId,
    }: {
      id: string;
      replacementRoleId?: string;
    }) => teamApi.deleteRole(id, replacementRoleId),
    onSuccess: () => invalidateTeam(queryClient),
  });
}
