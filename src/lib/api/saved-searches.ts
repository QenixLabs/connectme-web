import { apiClient } from "./client";
import type { SearchCriteria } from "@/lib/find-talent/search-model";

export type SavedSearchKind = "recent" | "saved";

/** Snapshot of the find-talent filters; mirrors GET /talents/all params. */
export interface SavedSearchCriteria {
  search?: string;
  profession?: string;
  location?: string;
  gender?: string;
  availability?: string;
  languages?: string[];
  skills?: string[];
  age_min?: number;
  age_max?: number;
  min_experience?: number;
  max_experience?: number;
}

export interface SavedSearch {
  id: string;
  recruiter_id: string;
  kind: SavedSearchKind;
  title: string;
  subtitle?: string;
  criteria: SavedSearchCriteria;
  result_count: number;
  last_seen_count: number;
  /** Present on kind=saved: result_count - last_seen_count. */
  new_results?: number;
  last_run_at?: string;
  created_at?: string;
}

export type UpsertSavedSearchPayload = {
  kind: SavedSearchKind;
  title: string;
  subtitle?: string;
  criteria: SavedSearchCriteria;
  result_count?: number;
};

/** Convert UI criteria to the persisted/API shape (nulls dropped). */
export function toSavedSearchCriteria(c: SearchCriteria): SavedSearchCriteria {
  return {
    search: c.search || undefined,
    profession: c.profession || undefined,
    location: c.location || undefined,
    gender: c.gender || undefined,
    availability: c.availability || undefined,
    languages: c.languages.length ? c.languages : undefined,
    skills: c.skills.length ? c.skills : undefined,
    age_min: c.ageMin ?? undefined,
    age_max: c.ageMax ?? undefined,
    min_experience: c.experienceMin ?? undefined,
    max_experience: c.experienceMax ?? undefined,
  };
}

/** Convert a persisted criteria snapshot back into UI criteria. */
export function fromSavedSearchCriteria(sc: SavedSearchCriteria): SearchCriteria {
  return {
    search: sc.search ?? "",
    profession: sc.profession ?? "",
    location: sc.location ?? "",
    gender: sc.gender ?? "",
    availability: sc.availability ?? "",
    languages: sc.languages ?? [],
    skills: sc.skills ?? [],
    ageMin: sc.age_min ?? null,
    ageMax: sc.age_max ?? null,
    experienceMin: sc.min_experience ?? null,
    experienceMax: sc.max_experience ?? null,
  };
}

export const savedSearchesApi = {
  list: async (kind: SavedSearchKind) => {
    const response = await apiClient.get("/saved-searches", { params: { kind } });
    return response.data as SavedSearch[];
  },

  upsert: async (payload: UpsertSavedSearchPayload) => {
    const response = await apiClient.post("/saved-searches", payload);
    return response.data as SavedSearch;
  },

  markViewed: async (id: string) => {
    const response = await apiClient.post(`/saved-searches/${id}/viewed`);
    return response.data as { success: true };
  },

  remove: async (id: string) => {
    const response = await apiClient.delete(`/saved-searches/${id}`);
    return response.data as { success: true };
  },

  clearRecent: async () => {
    const response = await apiClient.post("/saved-searches/clear-recent");
    return response.data as { success: true };
  },
};
