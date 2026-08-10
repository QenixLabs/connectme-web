import { apiClient } from "./client";

/* -------------------------------------------------------------------------- */
/*                                    TYPES                                   */
/* -------------------------------------------------------------------------- */

export interface DashboardTalentRecommendation {
  _id: string;
  user_id: string;
  username: string;
  full_legal_name?: string;
  profile_photo?: string;
  professions?: string[];
  location?: Record<string, string>;
  match_score: number;
  matched_campaign: string;
}

export interface DashboardTalentRecommendationsResponse {
  has_active_campaigns: boolean;
  campaigns: Array<{ id: string; name: string }>;
  data: DashboardTalentRecommendation[];
}

/* -------------------------------------------------------------------------- */
/*                                   API                                      */
/* -------------------------------------------------------------------------- */

export const recommendationsApi = {
  getDashboardTalentRecommendations: async (limit = 4) => {
    const response = await apiClient.get(
      "/recommendations/talents/dashboard",
      { params: { limit } },
    );
    return response.data as DashboardTalentRecommendationsResponse;
  },
};
