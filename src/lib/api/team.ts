import { apiClient } from "./client";

export type TeamPermission = string;
export type TeamMembershipStatus = "ACTIVE" | "DEACTIVATED" | "REMOVED";
export type TeamInvitationStatus =
  "PENDING" | "ACCEPTED" | "DECLINED" | "EXPIRED" | "CANCELLED";

export interface TeamCompany {
  id: string;
  name: string;
  logo_url?: string;
  cover_url?: string;
  verified: boolean;
  type?: string;
  location?: { city?: string; state?: string; country?: string };
}

export interface TeamRole {
  id: string;
  code: string;
  name: string;
  description: string;
  is_system: boolean;
  permissions: TeamPermission[];
  member_count: number;
}

export interface TeamMember {
  id: string;
  user_id: string;
  name: string;
  email?: string;
  phone?: string;
  avatar_url?: string;
  location?: { city?: string; state?: string; country?: string };
  verified: boolean;
  status: TeamMembershipStatus;
  role: TeamRole | null;
  department?: string;
  last_active_at?: string;
  joined_at?: string;
}

export interface TeamResponse {
  company: TeamCompany;
  stats: {
    team_members: number;
    active_projects: number;
    pending_invitations: number;
    roles: number;
  };
  permissions: TeamPermission[];
  current_membership_id: string;
  members: TeamMember[];
}

export interface TeamInvitation {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  department?: string;
  message?: string;
  status: TeamInvitationStatus;
  expires_at: string;
  created_at: string;
  role?: Pick<TeamRole, "id" | "code" | "name">;
}

export interface PermissionGroup {
  key: string;
  label: string;
  permissions: TeamPermission[];
}

export interface TeamPermissionsResponse {
  groups: PermissionGroup[];
  permissions: TeamPermission[];
}

export interface TeamMemberResponse {
  member: TeamMember;
  permissions: TeamPermission[];
  activity: Array<{
    _id: string;
    action: string;
    target_type: string;
    target_id: string;
    metadata: Record<string, unknown>;
    created_at: string;
  }>;
}

export interface InviteTeamMemberPayload {
  email: string;
  role_id: string;
  first_name?: string;
  last_name?: string;
  department?: string;
  message?: string;
  password?: string;
}

export interface TeamAccountVerificationRequired {
  verification_required: true;
  verification_token: string;
  email: string;
  message: string;
}

export interface CreatedTeamMemberAccount {
  account_created: true;
  email: string;
  message: string;
}

export const teamApi = {
  getTeam: async () =>
    (await apiClient.get("/recruiter/team")).data as TeamResponse,
  getMember: async (memberId: string) =>
    (await apiClient.get(`/recruiter/team/${memberId}`))
      .data as TeamMemberResponse,
  getRoles: async () =>
    (await apiClient.get("/recruiter/team/roles")).data as TeamRole[],
  getPermissions: async () =>
    (await apiClient.get("/recruiter/team/permissions"))
      .data as TeamPermissionsResponse,
  getPermissionMatrix: async () =>
    (await apiClient.get("/recruiter/team/permission-matrix"))
      .data as TeamPermissionsResponse & { roles: TeamRole[] },
  getInvitations: async () =>
    (await apiClient.get("/recruiter/team/invitations"))
      .data as TeamInvitation[],
  invite: async (payload: InviteTeamMemberPayload) =>
    (await apiClient.post("/recruiter/team/invitations", payload))
      .data as TeamInvitation | TeamAccountVerificationRequired,
  verifyAccount: async (payload: {
    verification_token: string;
    otp: string;
  }) =>
    (await apiClient.post("/recruiter/team/invitations/verify-account", payload))
      .data as CreatedTeamMemberAccount,
  resendInvitation: async (id: string) =>
    (await apiClient.post(`/recruiter/team/invitations/${id}/resend`))
      .data as TeamInvitation,
  cancelInvitation: async (id: string) =>
    (await apiClient.delete(`/recruiter/team/invitations/${id}`)).data as {
      cancelled: boolean;
    },
  updateMember: async (
    id: string,
    payload: {
      department?: string;
      status?: TeamMembershipStatus;
      display_name?: string;
    },
  ) =>
    (await apiClient.patch(`/recruiter/team/${id}`, payload))
      .data as TeamMemberResponse,
  changeMemberRole: async (id: string, role_id: string) =>
    (await apiClient.patch(`/recruiter/team/${id}/role`, { role_id }))
      .data as TeamMemberResponse,
  removeMember: async (id: string) =>
    (await apiClient.delete(`/recruiter/team/${id}`)).data as {
      removed: boolean;
    },
  createRole: async (payload: {
    name: string;
    description: string;
    permissions: string[];
  }) =>
    (await apiClient.post("/recruiter/team/roles", payload)).data as TeamRole,
  updateRole: async (
    id: string,
    payload: { name?: string; description?: string; permissions?: string[] },
  ) =>
    (await apiClient.patch(`/recruiter/team/roles/${id}`, payload))
      .data as TeamRole,
  deleteRole: async (id: string, replacement_role_id?: string) =>
    (
      await apiClient.delete(`/recruiter/team/roles/${id}`, {
        data: { replacement_role_id },
      })
    ).data as { deleted: boolean },
  getAuditLogs: async (page = 1) =>
    (await apiClient.get("/recruiter/team/audit-logs", { params: { page } }))
      .data as {
      logs: TeamMemberResponse["activity"];
      total: number;
      total_pages: number;
    },
  acceptInvitation: async (token: string) =>
    (await apiClient.post(`/team/invitations/${token}/accept`)).data as {
      joined: boolean;
      company_id: string;
    },
  declineInvitation: async (token: string) =>
    (await apiClient.post(`/team/invitations/${token}/decline`)).data as {
      declined: boolean;
    },
};
