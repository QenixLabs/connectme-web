import type { Profile, StrengthItem, StrengthResult } from "./profile-types";

export function computeStrength(profile: Profile): StrengthResult {
  const items: StrengthItem[] = [
    {
      key: "profile_photo",
      label: "Profile photo",
      done: Boolean(profile.profilePhoto),
    },
    {
      key: "cover_image",
      label: "Cover image",
      done: Boolean(profile.heroBackground),
    },
    {
      key: "basic_info",
      label: "Basic information",
      done:
        Boolean(profile.fullLegalName) &&
        Boolean(profile.username) &&
        Boolean(profile.location),
    },
    {
      key: "professional_profile",
      label: "Professional profile",
      done: profile.professions.length > 0 && Boolean(profile.headline),
    },
    {
      key: "about",
      label: "About Me",
      done: profile.about.trim().length > 80,
    },
    {
      key: "skills",
      label: "Skills",
      done: profile.skills.length >= 5,
    },
    {
      key: "portfolio",
      label: "Portfolio",
      done: profile.portfolio.length > 0,
    },
    {
      key: "media",
      label: "Media",
      done: profile.media.length > 0,
    },
    {
      key: "awards",
      label: "Awards",
      done: profile.awards.length > 0,
    },
    {
      key: "physical_attributes",
      label: "Physical attributes",
      done:
        Boolean(profile.physicalAttributes.height_cm) &&
        Boolean(profile.physicalAttributes.weight_kg),
    },
    {
      key: "languages",
      label: "Add languages",
      done: profile.languages.length >= 4,
    },
    {
      key: "social_links",
      label: "Add social links",
      done:
        Object.values(profile.socialLinks).filter((link) => Boolean(link.url))
          .length >= 3,
    },
    {
      key: "resume",
      label: "Upload resume",
      done: Boolean(profile.documents.resume_url),
    },
    {
      key: "measurements",
      label: "Measurements document",
      done: Boolean(profile.documents.measurements_sheet_url),
    },
  ];

  const doneCount = items.filter((i) => i.done).length;
  const percent = Math.round((doneCount / items.length) * 100);
  return { percent, items };
}
