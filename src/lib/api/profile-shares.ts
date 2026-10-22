import { apiClient } from "./client";

/** Mirrors `ProfileShareEventType` in the API. */
export type ProfileShareEventType =
  | "dialog_open"
  | "link_copy"
  | "destination_selected"
  | "native_share"
  | "card_download"
  | "attempt_failed"
  | "profile_visit";

export type ProfileShareTargetType = "talent" | "recruiter";

export type ProfileShareDestinationType =
  | "whatsapp"
  | "instagram"
  | "linkedin"
  | "more"
  | "copy"
  | "native"
  | "download";

export type ProfileShareMethodType =
  | "native"
  | "clipboard"
  | "file"
  | "external_link"
  | "download"
  | "none";

export interface RecordProfileShareEventPayload {
  target: ProfileShareTargetType;
  slug: string;
  event_type: ProfileShareEventType;
  destination?: ProfileShareDestinationType;
  method?: ProfileShareMethodType;
  source?: string;
  referrer_host?: string;
  idempotency_key?: string;
}

export interface ProfileShareEventResult {
  recorded: boolean;
  event_id: string;
  duplicate: boolean;
}

export interface ProfileShareTotals {
  shares: number;
  opens: number;
  copies: number;
  destinations: number;
  native_shares: number;
  card_downloads: number;
  failures: number;
  visits: number;
}

export interface ProfileShareStats {
  range: string;
  from: string;
  to: string;
  profile: { target: ProfileShareTargetType; slug: string } | null;
  totals: ProfileShareTotals;
  previous: ProfileShareTotals;
  change: {
    shares: number | null;
    copies: number | null;
    opens: number | null;
    visits: number | null;
  };
  by_destination: Array<{ destination: string; count: number }>;
  by_source: Array<{ source: string; count: number }>;
  by_method: Array<{ method: string; count: number }>;
  series: Array<{ date: string; shares: number; visits: number }>;
}

export const profileSharesApi = {
  recordEvent: async (
    payload: RecordProfileShareEventPayload,
  ): Promise<ProfileShareEventResult> => {
    const response = await apiClient.post(
      "/profile-shares/events",
      payload,
    );
    return response.data as ProfileShareEventResult;
  },

  getMyStats: async (range = "30d"): Promise<ProfileShareStats> => {
    const response = await apiClient.get("/profile-shares/stats", {
      params: { range },
    });
    return response.data as ProfileShareStats;
  },
};
