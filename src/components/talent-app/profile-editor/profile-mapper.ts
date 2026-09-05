import type {
  TalentProfile,
  UpdateTalentProfilePayload,
  Award as ApiAward,
} from "@/lib/api/talent";
import type {
  Profile,
  PortfolioProject,
  Credit,
  Experience,
  MediaItem,
  Award,
  Testimonial,
} from "./profile-types";

export function mapServerToView(server: TalentProfile): Profile {
  return {
    fullLegalName: server.full_legal_name ?? "",
    username: server.username ?? "",
    headline: server.headline ?? "",
    gender: server.gender ?? "",
    dateOfBirth: server.date_of_birth ?? "",
    location: formatLocation(server.location),
    professions: server.professions ?? [],
    specialties: server.specialties ?? [],
    yearsOfExperience: server.years_of_experience ?? 0,
    about: server.about ?? "",
    availability: server.availability ?? "available",
    physicalAttributes: {
      height_cm: server.physical_attributes?.height_cm,
      weight_kg: server.physical_attributes?.weight_kg,
      body_type: server.physical_attributes?.body_type,
      complexion: server.physical_attributes?.complexion,
      hair_color: server.physical_attributes?.hair_color,
      hair_length: server.physical_attributes?.hair_length,
      eye_color: server.physical_attributes?.eye_color,
      distinctive_features: server.physical_attributes?.distinctive_features,
      chest: (server.physical_attributes as Record<string, unknown>)?.chest as string | undefined,
      waist: (server.physical_attributes as Record<string, unknown>)?.waist as string | undefined,
      shoe_size: (server.physical_attributes as Record<string, unknown>)?.shoe_size as string | undefined,
      tattoos: (server.physical_attributes as Record<string, unknown>)?.tattoos as string | undefined,
    },
    languages: server.languages ?? [],
    accents: server.accents ?? [],
    skills:
      server.skills?.map((s, index) => ({
        name: s.name,
        proficiency: s.proficiency as "beginner" | "intermediate" | "expert",
        order: s.order ?? index,
      })) ?? [],
    documents: {
      resume_url: server.documents?.resume_url,
      portfolio_pdf_url: server.documents?.portfolio_pdf_url,
      measurements_sheet_url: server.documents?.measurements_sheet_url,
    },
    socialLinks: mapServerSocialLinks(server.social_links),
    privacyMode: server.privacy_mode ?? "public",
    sectionVisibility: {
      bio: server.section_visibility?.bio ?? true,
      skills: server.section_visibility?.skills ?? true,
      experience: server.section_visibility?.experience ?? true,
      portfolio: server.section_visibility?.portfolio ?? true,
      availability: server.section_visibility?.availability ?? true,
      location: server.section_visibility?.location ?? true,
      physical_attributes: server.section_visibility?.physical_attributes ?? true,
      languages: server.section_visibility?.languages ?? true,
      accents: server.section_visibility?.accents ?? true,
      documents: server.section_visibility?.documents ?? true,
      social_links: server.section_visibility?.social_links ?? true,
    },
    profilePhoto: server.profile_photo ?? "",
    heroBackground: server.hero_background ?? "",
    isVerified: server.is_verified ?? false,

    portfolio: [],
    credits: [],
    experience: [],
    media: [],
    awards: [],
    testimonials: [],
    travelLocations: [],
    creatorLink: "",
    availableFrom: "",
    openToTravel: false,
  };
}

export function mapApiAwardsToView(awards: ApiAward[] | undefined): Award[] {
  return (awards ?? []).map((a) => ({
    id: a._id,
    name: a.title ?? "",
    organization: a.awarding_body ?? "",
    year: a.year != null ? String(a.year) : "",
    description: a.description ?? "",
  }));
}

function formatLocation(loc?: TalentProfile["location"]): string {
  if (!loc) return "";
  const parts = [loc.city, loc.state, loc.country].filter(Boolean);
  return parts.join(", ");
}

function mapServerSocialLinks(
  server?: Record<string, { url?: string; visibility?: string; show_on_profile?: boolean }>,
): Record<string, { url: string; visibility: string; show_on_profile: boolean }> {
  if (!server) return {};
  return Object.fromEntries(
    Object.entries(server).map(([key, value]) => [
      key,
      {
        url: value.url ?? "",
        visibility: value.visibility ?? "public",
        show_on_profile: value.show_on_profile ?? true,
      },
    ]),
  );
}

export function mapViewToPayload(patch: Partial<Profile>): UpdateTalentProfilePayload {
  const payload: UpdateTalentProfilePayload = {};

  if (patch.fullLegalName !== undefined) payload.full_legal_name = patch.fullLegalName;
  if (patch.username !== undefined) payload.username = patch.username;
  if (patch.headline !== undefined) payload.headline = patch.headline;
  if (patch.gender !== undefined) payload.gender = patch.gender;
  if (patch.dateOfBirth !== undefined) payload.date_of_birth = patch.dateOfBirth;
  if (patch.location !== undefined) payload.location = parseLocation(patch.location);
  if (patch.professions !== undefined) payload.professions = patch.professions;
  if (patch.specialties !== undefined) payload.specialties = patch.specialties;
  if (patch.yearsOfExperience !== undefined)
    payload.years_of_experience = patch.yearsOfExperience;
  if (patch.about !== undefined) payload.about = patch.about;
  if (patch.availability !== undefined) payload.availability = patch.availability;
  if (patch.physicalAttributes !== undefined)
    payload.physical_attributes = patch.physicalAttributes;
  if (patch.languages !== undefined) payload.languages = patch.languages;
  if (patch.accents !== undefined) payload.accents = patch.accents;
  if (patch.skills !== undefined) payload.skills = patch.skills;
  if (patch.documents !== undefined) payload.documents = patch.documents;
  if (patch.socialLinks !== undefined) payload.social_links = patch.socialLinks;
  if (patch.privacyMode !== undefined) payload.privacy_mode = patch.privacyMode;
  if (patch.sectionVisibility !== undefined)
    payload.section_visibility = patch.sectionVisibility;
  if (patch.profilePhoto !== undefined) payload.profile_photo = patch.profilePhoto;
  if (patch.heroBackground !== undefined) payload.hero_background = patch.heroBackground;

  return payload;
}

function parseLocation(location: string): { city?: string; state?: string; country?: string } {
  const parts = location
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);

  if (parts.length === 0) return {};
  if (parts.length === 1) return { city: parts[0] };
  if (parts.length === 2) return { city: parts[0], state: parts[1] };
  return {
    city: parts[0],
    state: parts.slice(1, -1).join(", "),
    country: parts[parts.length - 1],
  };
}
