import type { TalentProfile } from "@/lib/validations/talent-profile.schema";

export interface TabVisibility {
  overview: boolean;
  looks: boolean;
  skills: boolean;
  links: boolean;
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
    looks: get("physical_attributes") || get("languages") || get("accents"),
    skills: get("skills"),
    links: get("social_links") || get("documents"),
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
