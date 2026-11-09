import { apiClient } from "./client";

export type ServiceStatus = "draft" | "published" | "unpublished";
export type ServiceType = "one_time" | "package" | "custom";
export type ServiceDeliveryTime =
  | "1-3_days"
  | "5-10_days"
  | "2-4_weeks"
  | "1_month_or_more"
  | "custom";
export type ServiceTeamSize = "1-10" | "11-50" | "51+";
export type ServiceEquipment = "provider" | "client" | "both";

export interface ProviderLocation {
  country?: string;
  state?: string;
  city?: string;
}

export interface ProviderPortfolioItem {
  title: string;
  description?: string;
  image_url?: string;
  link_url?: string;
  image_path?: string;
}

export interface PublicProviderPackage {
  id?: string;
  service_id?: string;
  name?: string;
  subtitle?: string;
  image_url?: string;
  price?: IndicativePrice;
  original_price?: IndicativePrice;
  savings_percent?: number;
  badge?: "Most Popular" | "Best Value";
  inclusions?: string[];
}

export interface IndicativePrice {
  amount: number;
  currency?: string;
  unit?: "hour" | "day" | "project" | "session" | "custom";
  note?: string;
}

export interface ProviderProfile {
  id: string;
  _id?: string;
  user_id?: string;
  slug?: string;
  display_name?: string;
  business_name?: string;
  provider_type?: string;
  tagline?: string;
  email?: string;
  phone?: string;
  about?: string;
  profile_photo?: string;
  profile_photo_path?: string;
  banner_image?: string;
  banner_image_path?: string;
  location?: ProviderLocation;
  categories: string[];
  service_areas: string[];
  skills: string[];
  portfolio: ProviderPortfolioItem[];
  onboarding_completed?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface PublicProviderSummary {
  id: string;
  slug: string;
  display_name?: string;
  business_name?: string;
  provider_type?: string;
  tagline?: string;
  profile_photo?: string;
  location?: ProviderLocation;
  categories: string[];
  service_areas: string[];
  skills: string[];
  about?: string;
  services_count: number;
  starting_price: number | null;
  average_rating: number | null;
  review_count: number;
  created_at?: string;
}

export interface PublicServiceProviderSummary {
  slug?: string;
  display_name?: string;
  business_name?: string;
  provider_type?: string;
  tagline?: string;
  profile_photo?: string;
  location?: ProviderLocation;
  categories: string[];
  service_areas: string[];
  skills: string[];
  about?: string;
  average_rating: number | null;
  review_count: number;
}

export interface PublicServiceSummary {
  id: string;
  title: string;
  description: string;
  short_description?: string;
  category: string;
  subcategory?: string;
  service_type?: ServiceType;
  images: string[];
  service_areas: string[];
  delivery_time?: ServiceDeliveryTime;
  team_size?: ServiceTeamSize;
  equipment?: ServiceEquipment;
  indicative_price?: IndicativePrice | null;
  published_at?: string | null;
  provider?: PublicServiceProviderSummary | null;
}

export interface PublicProviderProfile {
  id: string;
  slug: string;
  display_name?: string;
  business_name?: string;
  provider_type?: string;
  tagline?: string;
  profile_photo?: string;
  banner_image?: string;
  gallery_images?: string[];
  is_verified?: boolean;
  project_count?: number;
  experience_years?: number;
  team_size?: number;
  equipment_summary?: string;
  pan_verified?: boolean;
  gst_verified?: boolean;
  public_phone?: string;
  public_email?: string;
  website_url?: string;
  map_image_url?: string;
  coordinates?: {
    latitude?: number;
    longitude?: number;
  };
  business_hours?: {
    day?: string;
    open?: string;
    close?: string;
    is_closed?: boolean;
  }[];
  is_open_now?: boolean;
  established_year?: number;
  languages?: string[];
  certifications?: string[];
  social_links?: {
    platform?: string;
    url?: string;
  }[];
  choose_us_reasons?: string[];
  team_members?: {
    name?: string;
    avatar_url?: string;
    title?: string;
  }[];
  team_members_count?: number;
  packages?: PublicProviderPackage[];
  about?: string;
  location?: ProviderLocation;
  categories: string[];
  service_areas: string[];
  skills: string[];
  portfolio: ProviderPortfolioItem[];
  services: PublicServiceSummary[];
  services_count: number;
  products_count?: number;
  member_since?: string | null;
}

export interface ProviderReview {
  id: string;
  rating: number;
  text: string;
  created_at: string;
  updated_at: string;
  reviewer?: {
    display_name?: string;
    avatar_url?: string;
  };
  media?: {
    type?: "image" | "video";
    url?: string;
    alt_text?: string;
  }[];
}

export interface ProviderReviewDraft extends ProviderReview {
  inquiry_id: string;
  moderation_state: "pending" | "approved" | "hidden" | "removed";
}

export type ProviderReviewsResponse = Paginated<ProviderReview>;

export interface ProviderRatingSummary {
  average_rating: number | null;
  review_count: number;
  rating_distribution?: Partial<Record<1 | 2 | 3 | 4 | 5, number>>;
}

export interface ProviderReviewEligibility {
  can_review: boolean;
  reason?: string;
  inquiry_id?: string;
  my_review?: ProviderReviewDraft;
}

export interface ServiceListing {
  id: string;
  title: string;
  description: string;
  short_description?: string;
  category: string;
  subcategory?: string;
  service_type?: ServiceType;
  images: string[];
  image_urls: string[];
  service_areas: string[];
  delivery_time?: ServiceDeliveryTime;
  team_size?: ServiceTeamSize;
  equipment?: ServiceEquipment;
  indicative_price?: IndicativePrice | null;
  status: ServiceStatus;
  published_at?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface PublicServiceDetail extends PublicServiceSummary {
  provider: PublicServiceProviderSummary | null;
}

export interface Paginated<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

export interface ProviderFacets {
  categories: string[];
  locations: string[];
}

export interface ServiceFacets {
  categories: string[];
  locations: string[];
  currencies: string[];
  price_range: { min: number | null; max: number | null };
  providers_count: number;
}

export interface ProviderDirectoryQuery {
  search?: string;
  category?: string;
  location?: string;
  sort?: "relevance" | "newest" | "highest_rating" | "name_asc" | "name_desc";
  min_rating?: number;
  page?: number;
  limit?: number;
}

export interface ServiceQuery {
  search?: string;
  category?: string;
  location?: string;
  provider_slug?: string;
  currency?: string;
  sort?: "relevance" | "newest" | "oldest" | "price_low" | "price_high" | "highest_rating";
  min_price?: number;
  max_price?: number;
  min_rating?: number;
  page?: number;
  limit?: number;
}

export interface MyServicesQuery {
  status?: "all" | ServiceStatus;
  search?: string;
  category?: string;
  sort?: "recent" | "newest" | "oldest";
  page?: number;
  limit?: number;
}

export interface UpdateProviderProfilePayload {
  slug?: string;
  display_name?: string;
  business_name?: string;
  provider_type?: string;
  tagline?: string;
  phone?: string;
  country?: string;
  state?: string;
  city?: string;
  categories?: string[];
  service_areas?: string[];
  skills?: string[];
  portfolio?: ProviderPortfolioItem[];
  about?: string;
  profile_photo?: string;
}

export interface ServiceListingPayload {
  title: string;
  description: string;
  short_description?: string;
  category: string;
  subcategory?: string;
  service_type?: ServiceType;
  images?: string[];
  service_areas?: string[];
  delivery_time?: ServiceDeliveryTime;
  team_size?: ServiceTeamSize;
  equipment?: ServiceEquipment;
  indicative_price?: IndicativePrice | null;
}

export interface MyServiceSummary {
  total: number;
  draft: number;
  published: number;
  paused: number;
}

export interface MyServicesResponse extends Paginated<ServiceListing> {
  summary: MyServiceSummary;
}

export const providersApi = {
  getDirectory: async (params?: ProviderDirectoryQuery, signal?: AbortSignal) => {
    const response = await apiClient.get("/providers", { params, signal });
    return response.data as Paginated<PublicProviderSummary>;
  },

  getFacets: async () => {
    const response = await apiClient.get("/providers/facets");
    return response.data as ProviderFacets;
  },

  getPublicProfile: async (slugOrId: string) => {
    const response = await apiClient.get(
      `/providers/${encodeURIComponent(slugOrId)}`,
    );
    return response.data as PublicProviderProfile;
  },

  getPublicReviews: async (slug: string, page = 1, limit = 10) => {
    const response = await apiClient.get(
      `/providers/${encodeURIComponent(slug)}/reviews`,
      { params: { page, limit } },
    );
    return response.data as ProviderReviewsResponse;
  },

  getRatingSummary: async (slug: string) => {
    const response = await apiClient.get(
      `/providers/${encodeURIComponent(slug)}/reviews/rating-summary`,
    );
    return response.data as ProviderRatingSummary;
  },

  getReviewEligibility: async (slug: string) => {
    const response = await apiClient.get(
      `/provider-reviews/eligibility/${encodeURIComponent(slug)}`,
    );
    return response.data as ProviderReviewEligibility;
  },

  createReview: async (
    slug: string,
    payload: { inquiry_id: string; rating: number; text: string },
  ) => {
    const response = await apiClient.post(
      `/provider-reviews/${encodeURIComponent(slug)}`,
      payload,
    );
    return response.data as { review: ProviderReviewDraft };
  },

  updateReview: async (
    id: string,
    payload: { rating?: number; text?: string },
  ) => {
    const response = await apiClient.patch(
      `/provider-reviews/${encodeURIComponent(id)}`,
      payload,
    );
    return response.data as { review: ProviderReviewDraft };
  },

  deleteReview: async (id: string) => {
    const response = await apiClient.delete(
      `/provider-reviews/${encodeURIComponent(id)}`,
    );
    return response.data as { deleted: boolean };
  },

  reportReview: async (id: string, reason: string) => {
    const response = await apiClient.post(
      `/provider-reviews/${encodeURIComponent(id)}/reports`,
      { reason },
    );
    return response.data as { report: { id: string; status: string } };
  },

  checkSlugAvailability: async (slug: string) => {
    const response = await apiClient.get(
      `/providers/slug-availability/${encodeURIComponent(slug)}`,
    );
    return response.data as { available: boolean };
  },

  getMyProfile: async () => {
    const response = await apiClient.get("/provider/profile");
    return response.data as { profile: ProviderProfile };
  },

  updateMyProfile: async (payload: UpdateProviderProfilePayload) => {
    const response = await apiClient.patch("/provider/profile", payload);
    return response.data as { profile: ProviderProfile };
  },

  activate: async () => {
    const response = await apiClient.post("/provider/activate");
    return response.data as { profile: ProviderProfile | null };
  },

  completeOnboarding: async () => {
    const response = await apiClient.post("/provider/onboarding/complete");
    return response.data as {
      profile: ProviderProfile;
      onboarding_completed: boolean;
    };
  },

  uploadProfilePhoto: async (file: File) => {
    const body = new FormData();
    body.append("file", file);
    const response = await apiClient.post(
      "/provider/upload/profile-photo",
      body,
      {
        headers: { "Content-Type": "multipart/form-data" },
      },
    );
    return response.data as { relativePath: string; signedUrl: string };
  },

  uploadBannerImage: async (file: File) => {
    const body = new FormData();
    body.append("file", file);
    const response = await apiClient.post(
      "/provider/upload/banner-image",
      body,
      {
        headers: { "Content-Type": "multipart/form-data" },
      },
    );
    return response.data as { relativePath: string; signedUrl: string };
  },

  uploadPortfolioImage: async (file: File) => {
    const body = new FormData();
    body.append("file", file);
    const response = await apiClient.post(
      "/provider/upload/portfolio-image",
      body,
      {
        headers: { "Content-Type": "multipart/form-data" },
      },
    );
    return response.data as { relativePath: string; signedUrl: string };
  },
};

export const servicesApi = {
  getPublicListings: async (params?: ServiceQuery, signal?: AbortSignal) => {
    const response = await apiClient.get("/services", { params, signal });
    return response.data as Paginated<PublicServiceSummary>;
  },

  getFacets: async () => {
    const response = await apiClient.get("/services/facets");
    return response.data as ServiceFacets;
  },

  getPublicListing: async (id: string) => {
    const response = await apiClient.get(`/services/${encodeURIComponent(id)}`);
    return response.data as { service: PublicServiceDetail };
  },

  getMine: async (params?: MyServicesQuery) => {
    const response = await apiClient.get("/provider/services", { params });
    return response.data as MyServicesResponse;
  },

  getMineById: async (id: string) => {
    const response = await apiClient.get(
      `/provider/services/${encodeURIComponent(id)}`,
    );
    return response.data as { service: ServiceListing };
  },

  create: async (payload: ServiceListingPayload) => {
    const response = await apiClient.post("/provider/services", payload);
    return response.data as { service: ServiceListing };
  },

  update: async (id: string, payload: Partial<ServiceListingPayload>) => {
    const response = await apiClient.patch(
      `/provider/services/${encodeURIComponent(id)}`,
      payload,
    );
    return response.data as { service: ServiceListing };
  },

  remove: async (id: string) => {
    const response = await apiClient.delete(
      `/provider/services/${encodeURIComponent(id)}`,
    );
    return response.data as { deleted: boolean };
  },

  publish: async (id: string) => {
    const response = await apiClient.post(
      `/provider/services/${encodeURIComponent(id)}/publish`,
    );
    return response.data as { service: ServiceListing };
  },

  unpublish: async (id: string) => {
    const response = await apiClient.post(
      `/provider/services/${encodeURIComponent(id)}/unpublish`,
    );
    return response.data as { service: ServiceListing };
  },

  uploadImage: async (file: File, onProgress?: (percent: number) => void) => {
    const body = new FormData();
    body.append("file", file);
    const response = await apiClient.post(
      "/provider/services/upload/image",
      body,
      {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: (event) => {
          if (!onProgress || !event.total) return;
          onProgress(Math.min(100, Math.round((event.loaded / event.total) * 100)));
        },
      },
    );
    return response.data as { relativePath: string; signedUrl: string };
  },
};
