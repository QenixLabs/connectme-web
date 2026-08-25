import { apiClient } from "./client";

export type Availability = "available" | "busy" | "not_available";
export type PrivacyMode = "public" | "recruiters_only" | "private";

export interface SectionVisibility {
  bio?: boolean;
  skills?: boolean;
  experience?: boolean;
  portfolio?: boolean;
  availability?: boolean;
  location?: boolean;
  physical_attributes?: boolean;
  languages?: boolean;
  accents?: boolean;
  documents?: boolean;
  social_links?: boolean;
}

export interface UpdateTalentProfilePayload {
  username?: string;
  full_legal_name?: string;
  date_of_birth?: string;
  gender?: string;
  profile_photo?: string;
  location?: { country?: string; state?: string; city?: string };
  professions?: string[];
  specialties?: string[];
  hero_background?: string;
  availability?: Availability;
  headline?: string;
  about?: string;
  years_of_experience?: number;
  physical_attributes?: {
    height_cm?: number;
    weight_kg?: number;
    body_type?: string;
    complexion?: string;
    hair_color?: string;
    hair_length?: string;
    eye_color?: string;
    distinctive_features?: string;
  };
  languages?: { name: string; fluency: string }[];
  accents?: string[];
  skills?: { name: string; proficiency: "beginner" | "intermediate" | "expert"; order?: number }[];
  documents?: { resume_url?: string; portfolio_pdf_url?: string; measurements_sheet_url?: string };
  social_links?: Record<string, { url?: string; visibility?: string; show_on_profile?: boolean }>;
  privacy_mode?: PrivacyMode;
  section_visibility?: SectionVisibility;
}

export interface TalentProfile {
  _id: string;
  user_id: string;
  username: string;
  full_legal_name?: string;
  date_of_birth?: string;
  gender?: string;
  profile_photo?: string;
  location?: { country?: string; state?: string; city?: string };
  professions?: string[];
  availability?: Availability;
  headline?: string;
  about?: string;
  years_of_experience?: number;
  physical_attributes?: {
    height_cm?: number;
    weight_kg?: number;
    body_type?: string;
    complexion?: string;
    hair_color?: string;
    hair_length?: string;
    eye_color?: string;
    distinctive_features?: string;
  };
  languages?: { name: string; fluency: string }[];
  accents?: string[];
  skills?: { name: string; proficiency: string; order: number }[];
  documents?: { resume_url?: string; portfolio_pdf_url?: string; measurements_sheet_url?: string };
  social_links?: Record<string, { url?: string; visibility?: string; show_on_profile?: boolean }>;
  privacy_mode?: PrivacyMode;
  section_visibility?: SectionVisibility;
  specialties?: string[];
  media_limits?: {
    images_used: number;
    videos_used: number;
    plan_max_images: number;
    plan_max_videos: number;
  };
  analytics?: {
    profile_views_7d: number;
    profile_views_30d: number;
    shortlist_count: number;
    like_count: number;
  };
  hero_background?: string;
  creator_link?: string;
  trust_score?: number;
  response_rate?: number;
  response_time?: string;
  is_verified?: boolean;
  created_at: string;
  updated_at: string;
}

export type TalentProfilePreview = Pick<TalentProfile, "user_id" | "username"> &
  Partial<Omit<TalentProfile, "user_id" | "username">>;

export interface PrivateTalentProfileResponse {
  private: true;
  hasConnection?: boolean;
  preview: TalentProfilePreview;
  is_verified?: boolean;
  active_plan?: string | null;
}

export type PublicTalentProfileResponse =
  | TalentProfile
  | PrivateTalentProfileResponse;

export function isPrivateTalentProfileResponse(
  profile: PublicTalentProfileResponse | undefined,
): profile is PrivateTalentProfileResponse {
  return profile != null && "private" in profile && profile.private === true;
}

export interface PortfolioApiResponse {
  id: string;
  type: "image" | "video" | "youtube" | "instagram";
  category: "work" | "personal" | "intro";
  url: string;
  thumbnail_url?: string;
  caption?: string;
  title?: string;
  description?: string;
  is_pinned?: boolean;
  embed_url?: string;
  ai_moderation_status?: "pending" | "approved" | "flagged";
  view_count?: number;
  likes_count?: number;
  is_liked_by_me?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface PortfolioStatsResponse {
  total_items: number;
  total_views: number;
  images_count: number;
  videos_count: number;
  links_count: number;
}

export interface Credit {
  _id: string;
  user_id: string;
  type: "credit";
  project_name?: string;
  role_played?: string;
  platform?: string;
  director?: string;
  year?: number;
  credit_url?: string;
  verification_status?: "self_reported" | "public_record" | "recruiter_cosigned";
  description?: string;
  media_url?: string;
  order?: number;
  created_at: string;
}

export interface Testimonial {
  _id: string;
  user_id: string;
  type: "testimonial";
  author_name: string;
  author_role?: string;
  author_company?: string;
  content?: string;
  rating?: number;
  is_video?: boolean;
  video_url?: string;
  is_approved_by_talent?: boolean;
  order?: number;
  created_at: string;
}

export interface Award {
  _id: string;
  user_id: string;
  type: "award";
  title: string;
  awarding_body: string;
  year?: number;
  description?: string;
  media_url?: string;
  order?: number;
  created_at: string;
}

export interface SearchTalentsParams {
  search?: string;
  profession?: string;
  location_city?: string;
  availability?: string;
  gender?: string;
  sort?: "newest" | "oldest" | "name_asc" | "name_desc" | "relevance";
  page?: number;
  limit?: number;
}

export interface SearchTalentsResponse {
  data: TalentProfile[];
  total: number;
  page?: number;
  hasMore?: boolean;
}

export const talentApi = {
  getMyProfile: async () => {
    const response = await apiClient.get("/talent/me");
    return response.data as TalentProfile;
  },

  updateMyProfile: async (data: UpdateTalentProfilePayload) => {
    const response = await apiClient.patch("/talent", data);
    return response.data as TalentProfile;
  },

  uploadProfilePhoto: async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    const response = await apiClient.post("/talent/upload/profile-photo", formData, {
      headers: { "Content-Type": undefined },
    });
    return response.data as { relativePath: string; signedUrl: string };
  },

  getCompleteness: async () => {
    const response = await apiClient.get("/talent/completeness");
    return response.data as { isComplete: boolean; missingFields: string[] };
  },

  getPublicProfile: async (username: string) => {
    const response = await apiClient.get(`/talent/profile/${username}`);
    return response.data as PublicTalentProfileResponse;
  },

  getPortfolio: async (username: string) => {
    const response = await apiClient.get(`/talent/portfolio/${username}`);
    const body = response.data as { profile: unknown; items: PortfolioApiResponse[] };
    return body.items;
  },

  getCredits: async (username: string) => {
    const response = await apiClient.get(`/talent/profile/${username}/credits`);
    return response.data as Credit[];
  },

  getTestimonials: async (username: string) => {
    const response = await apiClient.get(`/talent/profile/${username}/testimonials`);
    return response.data as Testimonial[];
  },

  getAwards: async (username: string) => {
    const response = await apiClient.get(`/talent/profile/${username}/awards`);
    return response.data as Award[];
  },

  getMyPortfolio: async () => {
    const response = await apiClient.get("/talent/portfolio");
    const body = response.data as { items: PortfolioApiResponse[] };
    return body.items;
  },

  getPortfolioStats: async () => {
    const response = await apiClient.get("/talent/portfolio/stats");
    return response.data as PortfolioStatsResponse;
  },

  addPortfolioLink: async (data: {
    url: string;
    title?: string;
    caption?: string;
    description?: string;
    category?: string;
    is_pinned?: boolean;
  }) => {
    const response = await apiClient.post("/talent/portfolio/link", data);
    return response.data as PortfolioApiResponse;
  },

  updatePortfolioItem: async (
    itemId: string,
    data: {
      title?: string;
      caption?: string;
      description?: string;
      category?: string;
      is_pinned?: boolean;
    },
  ) => {
    const response = await apiClient.patch(
      `/talent/portfolio/items/${itemId}`,
      data,
    );
    return response.data as PortfolioApiResponse;
  },

  deletePortfolioItem: async (itemId: string) => {
    const response = await apiClient.delete(
      `/talent/portfolio/items/${itemId}`,
    );
    return response.data;
  },

  reorderPortfolio: async (itemIds: string[]) => {
    const response = await apiClient.patch("/talent/portfolio/reorder", {
      item_ids: itemIds,
    });
    return response.data;
  },

  togglePortfolioFeatured: async (itemId: string, isPinned: boolean) => {
    const response = await apiClient.patch(
      `/talent/portfolio/items/${itemId}`,
      { is_pinned: isPinned },
    );
    return response.data as PortfolioApiResponse;
  },

  uploadPortfolioImage: async (
    file: File,
    data?: {
      caption?: string;
      title?: string;
      description?: string;
      category?: string;
      is_pinned?: boolean;
    },
  ) => {
    const formData = new FormData();
    formData.append("file", file);
    if (data) {
      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          formData.append(key, String(value));
        }
      });
    }
    const response = await apiClient.post("/talent/portfolio/upload/image", formData, {
      headers: { "Content-Type": undefined },
    });
    return response.data as PortfolioApiResponse;
  },

  uploadPortfolioVideo: async (
    file: File,
    thumbnail?: File,
    data?: {
      caption?: string;
      title?: string;
      description?: string;
      category?: string;
      is_pinned?: boolean;
    },
  ) => {
    const formData = new FormData();
    formData.append("file", file);
    if (thumbnail) {
      formData.append("thumbnail", thumbnail);
    }
    if (data) {
      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          formData.append(key, String(value));
        }
      });
    }
    const response = await apiClient.post("/talent/portfolio/upload/video", formData, {
      headers: { "Content-Type": undefined },
    });
    return response.data as PortfolioApiResponse;
  },

  // ── Credits ──────────────────────────────────────────────
  getMyCredits: async () => {
    const response = await apiClient.get("/talent/credits");
    const body = response.data as { data: Credit[]; total: number };
    return body.data;
  },

  createCredit: async (data: {
    type: "credit";
    project_name: string;
    role_played: string;
    platform?: string;
    director?: string;
    year?: number;
    credit_url?: string;
    description?: string;
    media_url?: string;
    order?: number;
  }) => {
    const response = await apiClient.post("/talent/credits", data);
    return response.data as Credit;
  },

  updateCredit: async (
    id: string,
    data: {
      project_name?: string;
      role_played?: string;
      platform?: string;
      director?: string;
      year?: number;
      credit_url?: string;
      description?: string;
      media_url?: string;
      order?: number;
    },
  ) => {
    const response = await apiClient.patch(`/talent/credits/${id}`, data);
    return response.data as Credit;
  },

  deleteCredit: async (id: string) => {
    await apiClient.delete(`/talent/credits/${id}`);
  },

  // ── Testimonials ─────────────────────────────────────────
  getMyTestimonials: async () => {
    const response = await apiClient.get("/talent/testimonials");
    const body = response.data as { data: Testimonial[]; total: number };
    return body.data;
  },

  createTestimonial: async (data: {
    type: "testimonial";
    author_name: string;
    content: string;
    author_role?: string;
    author_company?: string;
    rating?: number;
    is_video?: boolean;
    video_url?: string;
    order?: number;
  }) => {
    const response = await apiClient.post("/talent/testimonials", data);
    return response.data as Testimonial;
  },

  updateTestimonial: async (
    id: string,
    data: {
      author_name?: string;
      content?: string;
      author_role?: string;
      author_company?: string;
      rating?: number;
      is_video?: boolean;
      video_url?: string;
      is_approved_by_talent?: boolean;
      order?: number;
    },
  ) => {
    const response = await apiClient.patch(`/talent/testimonials/${id}`, data);
    return response.data as Testimonial;
  },

  approveTestimonial: async (id: string) => {
    const response = await apiClient.patch(`/talent/testimonials/${id}/approve`);
    return response.data as Testimonial;
  },

  deleteTestimonial: async (id: string) => {
    await apiClient.delete(`/talent/testimonials/${id}`);
  },

  // ── Awards ───────────────────────────────────────────────
  getMyAwards: async () => {
    const response = await apiClient.get("/talent/awards");
    const body = response.data as { data: Award[]; total: number };
    return body.data;
  },

  createAward: async (data: {
    type: "award";
    title: string;
    awarding_body: string;
    year?: number;
    description?: string;
    media_url?: string;
    order?: number;
  }) => {
    const response = await apiClient.post("/talent/awards", data);
    return response.data as Award;
  },

  updateAward: async (
    id: string,
    data: {
      title?: string;
      awarding_body?: string;
      year?: number;
      description?: string;
      media_url?: string;
      order?: number;
    },
  ) => {
    const response = await apiClient.patch(`/talent/awards/${id}`, data);
    return response.data as Award;
  },

  deleteAward: async (id: string) => {
    await apiClient.delete(`/talent/awards/${id}`);
  },

  // ── Like ────────────────────────────────────────────────
  likeTalent: async (username: string) => {
    const response = await apiClient.post(`/talent/like/${username}`);
    return response.data as { liked: boolean };
  },

  unlikeTalent: async (username: string) => {
    const response = await apiClient.delete(`/talent/like/${username}`);
    return response.data as { liked: boolean };
  },

  getLikeStatus: async (username: string) => {
    const response = await apiClient.get(`/talent/like/${username}/status`);
    return response.data as { is_liked: boolean };
  },

  // ── Save ────────────────────────────────────────────────
  saveTalent: async (username: string) => {
    const response = await apiClient.post(`/talent/save/${username}`);
    return response.data as { saved: boolean };
  },

  unsaveTalent: async (username: string) => {
    const response = await apiClient.delete(`/talent/save/${username}`);
    return response.data as { saved: boolean };
  },

  getSaveStatus: async (username: string) => {
    const response = await apiClient.get(`/talent/save/${username}/status`);
    return response.data as { is_saved: boolean };
  },

  // ── Shortlist ───────────────────────────────────────────
  shortlistTalent: async (username: string, campaignId: string) => {
    const response = await apiClient.post('/talent/shortlist', {
      username,
      campaign_id: campaignId,
    });
    return response.data as { shortlisted: boolean };
  },

  unshortlistTalent: async (username: string, campaignId: string) => {
    const response = await apiClient.delete('/talent/shortlist', {
      data: { username, campaign_id: campaignId },
    });
    return response.data as { shortlisted: boolean };
  },

  getShortlistStatus: async (username: string, campaignId: string) => {
    const response = await apiClient.get('/talent/shortlist/status', {
      params: { username, campaign_id: campaignId },
    });
    return response.data as { is_shortlisted: boolean };
  },

  likePortfolioItem: async (itemId: string) => {
    const response = await apiClient.post(`/talent/portfolio/items/${itemId}/like`);
    return response.data as { liked: boolean; likes_count: number };
  },

  unlikePortfolioItem: async (itemId: string) => {
    const response = await apiClient.delete(`/talent/portfolio/items/${itemId}/like`);
    return response.data as { liked: boolean; likes_count: number };
  },

  getPortfolioItemLikeStatus: async (itemId: string) => {
    const response = await apiClient.get(`/talent/portfolio/items/${itemId}/like/status`);
    return response.data as { liked: boolean; likes_count: number };
  },

  // ── Media Kit ───────────────────────────────────────────
  getMediaKit: async (username: string) => {
    const response = await apiClient.get(`/talent/media-kit/${username}`);
    return response.data as {
      social_links?: Record<string, { url?: string; visibility?: string; show_on_profile?: boolean }>;
      documents?: { resume_url?: string; portfolio_pdf_url?: string; measurements_sheet_url?: string };
      profile_photo?: string;
      headline?: string;
    };
  },

  // ── Talent Search (Recruiter) ───────────────────────────
  searchTalents: async (params: SearchTalentsParams = {}) => {
    const response = await apiClient.get("/talent/all", { params });
    return response.data as SearchTalentsResponse;
  },

  getProfessions: async (q?: string) => {
    const response = await apiClient.get("/talent/professions", {
      params: q ? { q } : undefined,
    });
    return response.data as string[];
  },
};
