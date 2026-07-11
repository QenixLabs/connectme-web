import type { PortfolioItem } from "@/lib/validations/talent-profile.schema";

export interface MediaKitData {
  username: string;
  full_legal_name?: string;
  profile_photo?: string;
  hero_background?: string;
  is_verified?: boolean;
  location?: { country?: string; state?: string; city?: string };
  professions?: string[];
  headline?: string;
  about?: string;
  instagramFollowers?: number;
  youtubeSubscribers?: number;
  youtubeViews?: number;
  avgMonthlyViews?: number;
  portfolioHighlights: PortfolioItem[];
  publicSlug: string;
}
