import { apiClient } from "./client";

/* -------------------------------------------------------------------------- */
/*                                    TYPES                                   */
/* -------------------------------------------------------------------------- */

export interface MyApplication {
  _id?: string;
  status: "pending" | "accepted" | "rejected";
  created_at: string;
  message?: string;
}

export interface Campaign {
  _id: string;
  recruiter_id: string;
  recruiter?: {
    _id: string;
    company_name?: string;
    slug?: string;
    profile_photo?: string;
    headline?: string;
    verification_status?: string;
    location?: { country?: string; state?: string; city?: string };
  };
  name: string;
  description?: string;
  role_type?: string;
  industry?: string;
  location?: { city?: string; state?: string };
  dates?: { start?: string; end?: string };
  budget_range?: { min?: number; max?: number; currency?: string };
  requirements?: {
    skills?: string[];
    languages?: string[];
    attributes?: string;
    gender?: string;
    age_range?: { min?: number; max?: number };
  };
  visibility: string;
  deadline?: string;
  status: "draft" | "active" | "closed";
  applications_count: number;
  cover_image_url?: string;
  specialties?: string[];
  needs_influencer?: boolean;
  influencer_speciality?: string[];
  questions?: CampaignQuestion[];
  scheduled_publish_at?: string;
  auto_close_on_deadline?: boolean;
  task?: {
    is_enabled?: boolean;
    title?: string;
    description?: string;
    task_type?: string;
    deadline_days?: number;
    nda_enabled?: boolean;
    nda_text?: string;
    document?: { url: string; name: string; mime_type: string; size: number; uploaded_at: string };
  };
  my_application?: MyApplication | null;
  is_bookmarked?: boolean;
  created_at: string;
  updated_at: string;
}

export interface CampaignQuestion {
  _id?: string;
  question_text: string;
  question_type?: string;
  options?: string[];
  is_required?: boolean;
  order?: number;
}

export interface CampaignRecommendation {
  _id: string;
  name: string;
  description?: string;
  role_type?: string;
  location?: { city?: string; state?: string };
  specialties?: string[];
  requirements?: {
    skills?: string[];
    languages?: string[];
    gender?: string;
    age_range?: { min?: number; max?: number };
  };
  budget_range?: { min?: number; max?: number; currency?: string };
  deadline?: string;
  status: string;
  visibility: string;
  applications_count: number;
  cover_image_url?: string;
  match_score?: number;
  total_score?: number;
  created_at: string;
}

export interface QueryCampaignsParams {
  status?: string;
  search?: string;
  role_type?: string;
  location_city?: string;
  gender?: string;
  skills?: string;
  languages?: string;
  sort?: "relevance" | "newest" | "oldest";
  page?: number;
  limit?: number;
  applied?: string;
  recruiter_id?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface CursorPaginatedResponse {
  data: Campaign[];
  nextCursor: string | null;
}

export interface RecruiterCampaignParams {
  status?: string;
  search?: string;
  cursor?: string;
  limit?: number;
}

export interface ApplyCampaignPayload {
  message?: string;
  answers?: { question_id: string; answer: string }[];
}

/* -------------------------------------------------------------------------- */
/*                           CAMPAIGN APPLICATIONS                            */
/* -------------------------------------------------------------------------- */

export type TaskSubmissionStatus = "assigned" | "submitted" | "reviewed";

export interface TaskSubmissionFile {
  url: string;
  name: string;
  mime_type: string;
  size: number;
}

export interface TaskSubmission {
  _id: string;
  campaign_id: string;
  talent_id: string;
  application_id: string;
  status: TaskSubmissionStatus;
  response_text?: string;
  files: TaskSubmissionFile[];
  submitted_at?: string;
  recruiter_notes?: string;
  recruiter_rating?: number;
  assigned_at: string;
  deadline_at: string;
  reminder_sent: boolean;
  nda_accepted: boolean;
  nda_accepted_at?: string;
  created_at: string;
  updated_at: string;
}

export interface EnrichedApplication {
  _id: string;
  campaign_id: string;
  talent_id:
    | { _id: string; email: string; full_legal_name?: string; username?: string }
    | string;
  status: "pending" | "accepted" | "rejected";
  message?: string;
  answers?: Array<{
    question_id: string;
    question_text: string;
    answer: string;
  }>;
  is_shortlisted: boolean;
  note: {
    _id: string;
    note_text?: string;
    rating?: number;
    created_at: string;
    updated_at: string;
  } | null;
  match_score: number;
  task_submission: TaskSubmission | null;
  task_submission_status: TaskSubmissionStatus | null;
  talent_profile: {
    full_legal_name: string;
    username: string;
    profile_photo?: string;
    professions: string[];
    location?: { country?: string; state?: string; city?: string };
    availability?: string;
    specialties?: string[];
    languages?: Array<{ name: string; fluency: string }>;
    is_verified?: boolean;
  } | null;
  created_at: string;
  updated_at: string;
}

export interface CampaignApplicationsResponse {
  data: EnrichedApplication[];
  total: number;
  pending: number;
  accepted: number;
  rejected: number;
  shortlisted: number;
}

export interface QueryApplicationParams {
  status?: string;
  shortlisted?: string;
  search?: string;
  sort?: string;
  limit?: number;
}

export interface CampaignApplicantNote {
  _id: string;
  campaign_id: string;
  recruiter_id: string;
  talent_id: string;
  note_text?: string;
  rating?: number;
  created_at: string;
  updated_at: string;
}

/* -------------------------------------------------------------------------- */
/*                          CAMPAIGN ANALYTICS                                */
/* -------------------------------------------------------------------------- */

export interface CampaignAnalytics {
  applications_over_time: Array<{ date: string; count: number }>;
  status_breakdown: { pending: number; accepted: number; rejected: number };
  total_applications: number;
  total_invites: number;
  accepted_invites: number;
  declined_invites: number;
  response_rate: number;
}

export interface CampaignAnalyticsParams {
  from?: string;
  to?: string;
}

/* -------------------------------------------------------------------------- */
/*                         CAMPAIGN DEMOGRAPHICS                              */
/* -------------------------------------------------------------------------- */

export interface CampaignDemographics {
  gender: Record<string, number>;
  professions: Array<{ name: string; count: number }>;
  locations: Array<{ city: string; count: number }>;
}

/* -------------------------------------------------------------------------- */
/*                           CAMPAIGN INVITES                                 */
/* -------------------------------------------------------------------------- */

export interface CampaignInvite {
  _id: string;
  campaign_id: string;
  talent_id: {
    _id: string;
    email: string;
    full_legal_name: string;
    username: string;
    professions: string[];
  } | string;
  status: "pending" | "accepted" | "declined";
  message?: string;
  created_at: string;
}

/* -------------------------------------------------------------------------- */
/*                            CAMPAIGN TEAM                                   */
/* -------------------------------------------------------------------------- */

export interface CampaignTeamMember {
  _id: string;
  campaign_id: string;
  user_id: {
    _id: string;
    email: string;
    full_legal_name: string;
    username: string;
  } | string;
  role: "owner" | "editor" | "viewer";
  invited_by: {
    _id: string;
    email: string;
    full_legal_name: string;
    username: string;
  } | string;
  status: "active" | "pending" | "removed";
  created_at: string;
  updated_at: string;
}

export interface CampaignTeamResponse {
  campaign: Campaign;
  members: CampaignTeamMember[];
}

/* -------------------------------------------------------------------------- */
/*                          CAMPAIGN SUBMISSIONS                              */
/* -------------------------------------------------------------------------- */

export interface CampaignSubmission {
  _id: string;
  campaign_id: string;
  talent_id: string;
  application_id: string;
  status: TaskSubmissionStatus;
  response_text?: string;
  files: TaskSubmissionFile[];
  submitted_at?: string;
  recruiter_notes?: string;
  recruiter_rating?: number;
  assigned_at: string;
  deadline_at: string;
  reminder_sent: boolean;
  nda_accepted: boolean;
  nda_accepted_at?: string;
  created_at: string;
  updated_at: string;
  talent_name: string;
  talent_photo: string | null;
}

export interface CampaignSubmissionsResponse {
  data: CampaignSubmission[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}

export interface QuerySubmissionsParams {
  page?: number;
  limit?: number;
  status?: TaskSubmissionStatus;
}

/* -------------------------------------------------------------------------- */
/*                         RECRUITER DASHBOARD STATS                           */
/* -------------------------------------------------------------------------- */

export interface RecruiterDashboardStats {
  active_campaigns: number;
  total_applications_this_week: number;
  response_rate: number;
  pending_reviews: number;
  shortlisted_count: number;
}

/* -------------------------------------------------------------------------- */
/*                                   API                                      */
/* -------------------------------------------------------------------------- */

function normalizeCampaignList(data: unknown): Campaign[] {
  if (Array.isArray(data)) return data as Campaign[];
  if (
    data &&
    typeof data === "object" &&
    "data" in data &&
    Array.isArray((data as { data: unknown }).data)
  ) {
    return (data as { data: Campaign[] }).data;
  }
  return [];
}

export const campaignsApi = {
  getCampaigns: async (params: QueryCampaignsParams = {}) => {
    const response = await apiClient.get("/campaigns", { params });
    return normalizeCampaignList(response.data);
  },

  getRecruiterCampaigns: async (params: RecruiterCampaignParams = {}) => {
    const response = await apiClient.get("/campaigns", { params });
    const raw = response.data;
    if (raw && typeof raw === "object" && "data" in raw && "nextCursor" in raw) {
      return raw as CursorPaginatedResponse;
    }
    return { data: normalizeCampaignList(raw), nextCursor: null };
  },

  getMyApplications: async (params: Omit<QueryCampaignsParams, "applied"> = {}) => {
    const response = await apiClient.get("/campaigns", {
      params: { ...params, applied: "true" },
    });
    return normalizeCampaignList(response.data);
  },

  getCampaignCount: async (params: QueryCampaignsParams = {}) => {
    const response = await apiClient.get("/campaigns/count", { params });
    return response.data as { count: number };
  },

  getCampaignById: async (id: string) => {
    const response = await apiClient.get(`/campaigns/${id}`);
    return response.data as Campaign;
  },

  getCampaignTalentView: async (id: string) => {
    const response = await apiClient.get(`/campaigns/${id}/talent-view`);
    return response.data as Campaign;
  },

  getRecommendations: async (limit = 10) => {
    const response = await apiClient.get("/recommendations/campaigns", {
      params: { limit },
    });
    return response.data as CampaignRecommendation[];
  },

  getBookmarks: async () => {
    const response = await apiClient.get("/campaigns/bookmarks");
    return response.data as Campaign[];
  },

  bookmarkCampaign: async (id: string) => {
    const response = await apiClient.post(`/campaigns/${id}/bookmark`);
    return response.data as { bookmarked: boolean };
  },

  unbookmarkCampaign: async (id: string) => {
    const response = await apiClient.delete(`/campaigns/${id}/bookmark`);
    return response.data as { bookmarked: boolean };
  },

  applyToCampaign: async (id: string, payload: ApplyCampaignPayload = {}) => {
    const response = await apiClient.post(`/campaigns/${id}/apply`, payload);
    return response.data;
  },

  withdrawApplication: async (id: string) => {
    const response = await apiClient.delete(`/campaigns/${id}/apply`);
    return response.data as { message: string };
  },

  /* ---- Campaign Applications (Recruiter) ---- */

  getCampaignApplications: async (
    campaignId: string,
    params: QueryApplicationParams = {},
  ) => {
    const response = await apiClient.get(
      `/campaigns/${campaignId}/applications`,
      { params },
    );
    return response.data as CampaignApplicationsResponse;
  },

  bulkUpdateApplications: async (
    campaignId: string,
    applicationIds: string[],
    status: "pending" | "accepted" | "rejected",
  ) => {
    const response = await apiClient.patch(
      `/campaigns/${campaignId}/applications/bulk`,
      { application_ids: applicationIds, status },
    );
    return response.data as { updated: number };
  },

  shortlistApplication: async (campaignId: string, applicationId: string) => {
    const response = await apiClient.post(
      `/campaigns/${campaignId}/applications/${applicationId}/shortlist`,
    );
    return response.data;
  },

  unshortlistApplication: async (campaignId: string, applicationId: string) => {
    const response = await apiClient.delete(
      `/campaigns/${campaignId}/applications/${applicationId}/shortlist`,
    );
    return response.data;
  },

  upsertApplicantNote: async (
    campaignId: string,
    applicationId: string,
    noteText?: string,
    rating?: number,
  ) => {
    const response = await apiClient.post(
      `/campaigns/${campaignId}/applications/${applicationId}/notes`,
      { note_text: noteText, rating },
    );
    return response.data as CampaignApplicantNote;
  },

  deleteApplicantNote: async (campaignId: string, applicationId: string) => {
    const response = await apiClient.delete(
      `/campaigns/${campaignId}/applications/${applicationId}/notes`,
    );
    return response.data;
  },

  /* ---- Campaign Analytics (Recruiter) ---- */

  getCampaignAnalytics: async (
    campaignId: string,
    params: CampaignAnalyticsParams = {},
  ) => {
    const response = await apiClient.get(`/campaigns/${campaignId}/analytics`, {
      params,
    });
    return response.data as CampaignAnalytics;
  },

  getCampaignDemographics: async (campaignId: string) => {
    const response = await apiClient.get(
      `/campaigns/${campaignId}/analytics/demographics`,
    );
    return response.data as CampaignDemographics;
  },

  /* ---- Campaign Invites (Recruiter) ---- */

  getCampaignInvites: async (campaignId: string) => {
    const response = await apiClient.get(`/campaigns/${campaignId}/invites`);
    return response.data as CampaignInvite[];
  },

  /* ---- Campaign Team (Recruiter) ---- */

  getCampaignTeam: async (campaignId: string) => {
    const response = await apiClient.get(`/campaigns/${campaignId}/team`);
    return response.data as CampaignTeamResponse;
  },

  /* ---- Campaign Submissions (Recruiter) ---- */

  getCampaignSubmissions: async (
    campaignId: string,
    params: QuerySubmissionsParams = {},
  ) => {
    const response = await apiClient.get(
      `/campaigns/${campaignId}/task/submissions`,
      { params },
    );
    return response.data as CampaignSubmissionsResponse;
  },

  /* ---- Campaign Actions (Recruiter) ---- */

  closeCampaign: async (campaignId: string) => {
    const response = await apiClient.post(`/campaigns/${campaignId}/close`);
    return response.data as Campaign;
  },

  cloneCampaign: async (campaignId: string) => {
    const response = await apiClient.post(`/campaigns/${campaignId}/clone`);
    return response.data as Campaign;
  },

  exportCampaign: async (campaignId: string) => {
    const response = await apiClient.get(`/campaigns/${campaignId}/export`, {
      responseType: "blob",
    });
    return response.data as Blob;
  },

  /* ---- Recruiter Dashboard Stats ---- */

  getDashboardStats: async () => {
    const response = await apiClient.get("/campaigns/dashboard/stats");
    return response.data as RecruiterDashboardStats;
  },

  /* ---- Create / Update Campaign ---- */

  createCampaign: async (payload: {
    name: string;
    description?: string;
    role_type?: string;
    location?: { city?: string; state?: string };
    dates?: { start?: string; end?: string };
    budget_range?: { min?: number; max?: number; currency?: string };
    requirements?: {
      skills?: string[];
      languages?: string[];
      gender?: string;
      age_range?: { min?: number; max?: number };
      attributes?: string;
    };
    visibility?: string;
    deadline?: string;
    status?: string;
    scheduled_publish_at?: string;
    auto_close_on_deadline?: boolean;
    specialties?: string[];
    needs_influencer?: boolean;
    influencer_speciality?: string[];
    cover_image_url?: string;
    questions?: CampaignQuestion[];
    task?: {
      is_enabled?: boolean;
      title?: string;
      description?: string;
      task_type?: string;
      deadline_days?: number;
      nda_enabled?: boolean;
      nda_text?: string;
    };
  }) => {
    const response = await apiClient.post("/campaigns", payload);
    return response.data as Campaign;
  },

  updateCampaign: async (
    id: string,
    payload: Partial<
      Omit<Campaign, "_id" | "recruiter_id" | "applications_count" | "created_at">
    >,
  ) => {
    const response = await apiClient.patch(`/campaigns/${id}`, payload);
    return response.data as Campaign;
  },

  /* ---- Campaign Media ---- */

  uploadCampaignMedia: async (campaignId: string, formData: FormData) => {
    const response = await apiClient.post(`/campaigns/${campaignId}/media`, formData, {
      headers: { "Content-Type": undefined },
    });
    return response.data as { url: string };
  },

  deleteCampaignMedia: async (campaignId: string) => {
    const response = await apiClient.delete(`/campaigns/${campaignId}/media`);
    return response.data as { message: string };
  },

  /* ---- Campaign Task ---- */

  upsertTask: async (
    campaignId: string,
    payload: {
      is_enabled: boolean;
      title?: string;
      description?: string;
      task_type?: string;
      deadline_days?: number;
      nda_enabled?: boolean;
      nda_text?: string;
    },
  ) => {
    const response = await apiClient.put(`/campaigns/${campaignId}/task`, payload);
    return response.data;
  },

  deleteTask: async (campaignId: string) => {
    const response = await apiClient.delete(`/campaigns/${campaignId}/task`);
    return response.data as { message: string };
  },

  getTaskDocument: async (campaignId: string) => {
    const response = await apiClient.get(`/campaigns/${campaignId}/task/document`);
    return response.data as { url: string; name: string; mime_type: string; size: number } | null;
  },

  uploadTaskDocument: async (campaignId: string, file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    const response = await apiClient.post(`/campaigns/${campaignId}/task/document`, formData, {
      headers: { "Content-Type": undefined },
    });
    return response.data as { url: string };
  },

  deleteTaskDocument: async (campaignId: string) => {
    const response = await apiClient.delete(`/campaigns/${campaignId}/task/document`);
    return response.data as { message: string };
  },

  /* ---- Campaign Publish / Close / Reopen ---- */

  publishCampaign: async (campaignId: string) => {
    const response = await apiClient.post(`/campaigns/${campaignId}/publish`);
    return response.data as Campaign;
  },

  reopenCampaign: async (campaignId: string) => {
    const response = await apiClient.post(`/campaigns/${campaignId}/reopen`);
    return response.data as Campaign;
  },
};
