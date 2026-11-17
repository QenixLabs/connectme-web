import { apiClient } from "./client";

export type ContentRole = "talent" | "recruiter" | "provider" | "admin";
export type CommunicationKind = "notice" | "notification" | "announcement";
export interface CommunicationDraft {
  kind: CommunicationKind;
  title: string;
  message: string;
  audience: ContentRole[];
  action_link: string;
}
export interface Communication extends CommunicationDraft {
  _id: string;
  revision: number;
  status: "draft" | "published" | "sending" | "sent" | "failed" | "archived";
  created_at: string;
  published_at?: string;
  queued_at?: string;
  sent_at?: string;
  delivered: number;
  suppressed: number;
  last_error?: string;
}
export interface ContentList {
  items: Communication[];
  total: number;
  page: number;
  total_pages: number;
}
export type LegalKey = "terms" | "privacy";
export interface LegalContent {
  title: string;
  content: string;
  effective_at: string;
}
export interface LegalVersion extends LegalContent {
  version: number;
  published_at: string;
}
export interface LegalDocument {
  key: LegalKey;
  revision: number;
  draft: LegalContent | null;
  versions: LegalVersion[];
}
export interface PlatformSettings {
  revision: number;
  renewal_reminders_enabled: boolean;
  renewal_reminder_days: number;
}
export interface ContentTeamRole {
  _id: string;
  name: string;
  code: string;
  description: string;
  is_system: boolean;
  company_id?: string;
  permissions: string[];
}
export interface PermissionModel {
  platform_roles: ContentRole[];
  platform_admin_access: string;
  groups: { key: string; label: string; permissions: string[] }[];
  roles: ContentTeamRole[];
}
export interface AudiencePreview {
  audience: ContentRole[];
  count: number;
  revision: number;
  note: string;
}

const base = "/admin/content";
export const adminContentApi = {
  roles: async () => (await apiClient.get<ContentRole[]>(`${base}/roles`)).data,
  list: async (params: {
    kind: CommunicationKind;
    status?: string;
    search?: string;
    audience?: string;
    page: number;
  }) =>
    (await apiClient.get<ContentList>(`${base}/communications`, { params }))
      .data,
  save: async (draft: CommunicationDraft, item?: Communication) =>
    item
      ? (
          await apiClient.patch<Communication>(
            `${base}/communications/${item._id}`,
            { ...draft, revision: item.revision },
          )
        ).data
      : (await apiClient.post<Communication>(`${base}/communications`, draft))
          .data,
  audience: async (id: string) =>
    (
      await apiClient.get<AudiencePreview>(
        `${base}/communications/${id}/audience`,
      )
    ).data,
  publish: async (item: Communication, preview: AudiencePreview) =>
    (
      await apiClient.post(`${base}/communications/${item._id}/publish`, {
        revision: preview.revision,
        audience: preview.audience,
      })
    ).data,
  archive: async (item: Communication) =>
    (
      await apiClient.post(`${base}/communications/${item._id}/archive`, {
        revision: item.revision,
      })
    ).data,
  legal: async (key: LegalKey) =>
    (await apiClient.get<LegalDocument>(`${base}/legal/${key}`)).data,
  saveLegal: async (key: LegalKey, revision: number, draft: LegalContent) =>
    (
      await apiClient.patch<LegalDocument>(`${base}/legal/${key}`, {
        ...draft,
        revision,
      })
    ).data,
  publishLegal: async (key: LegalKey, revision: number) =>
    (
      await apiClient.post<LegalDocument>(`${base}/legal/${key}/publish`, {
        revision,
      })
    ).data,
  settings: async () =>
    (await apiClient.get<PlatformSettings>(`${base}/settings`)).data,
  rule: async (revision: number, enabled: boolean) =>
    (
      await apiClient.patch(`${base}/rules/renewal-reminders`, {
        revision,
        enabled,
      })
    ).data,
  configure: async (revision: number, days: number) =>
    (
      await apiClient.patch(`${base}/configuration`, {
        revision,
        renewal_reminder_days: days,
      })
    ).data,
  permissions: async () =>
    (await apiClient.get<PermissionModel>(`${base}/permissions`)).data,
  savePermissions: async (role: ContentTeamRole, permissions: string[]) =>
    (
      await apiClient.patch(`${base}/permissions/${role._id}`, {
        permissions,
        previous_permissions: role.permissions,
      })
    ).data,
};

export const publicContentApi = {
  legal: async (key: LegalKey) =>
    (await apiClient.get<LegalVersion>(`/content/legal/${key}`)).data,
  feed: async (page: number) =>
    (
      await apiClient.get<ContentList>("/content/communications", {
        params: { page },
      })
    ).data,
};
