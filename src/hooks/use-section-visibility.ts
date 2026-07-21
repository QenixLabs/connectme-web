import type { TalentProfile } from "@/lib/validations/talent-profile.schema";

export interface TabVisibility {
  overview: boolean;
  portfolio: boolean;
  experience: boolean;
  skills: boolean;
  "media-kit": boolean;
  reviews: boolean;
}

export interface CardVisibility {
  bio: boolean;
  physical_attributes: boolean;
  languages: boolean;
  accents: boolean;
  skills: boolean;
  social_links: boolean;
  documents: boolean;
}

export interface HeroVisibility {
  location: boolean;
  availability: boolean;
}

export function useSectionVisibility(profile: TalentProfile | null | undefined) {
  const sv = profile?.section_visibility ?? {};
  const get = (key: keyof typeof sv): boolean => (sv[key] ?? true) as boolean;

  const tabVisibility: TabVisibility = {
    overview: true,
    portfolio: get("portfolio"),
    experience: true,
    skills: get("skills"),
    "media-kit": get("social_links") || get("documents"),
    reviews: true,
  };

  const cardVisibility: CardVisibility = {
    bio: get("bio"),
    physical_attributes: get("physical_attributes"),
    languages: get("languages") || get("accents"),
    accents: get("accents"),
    skills: get("skills"),
    social_links: get("social_links"),
    documents: get("documents"),
  };

  const heroVisibility: HeroVisibility = {
    location: get("location"),
    availability: get("availability"),
  };

  return { tabVisibility, cardVisibility, heroVisibility };
}
