import { useQueries } from "@tanstack/react-query";
import {
  isPrivateTalentProfileResponse,
  talentApi,
} from "@/lib/api/talent";
import { talentProfileKeys } from "@/hooks/use-talent-profile";

export const MAX_COMPARE_TALENTS = 4;
const SKILLS_SHOWN = 3;
const CREDITS_SHOWN = 2;

export interface CompareTalentData {
  username: string;
  userId: string;
  name: string;
  profilePhoto?: string;
  isVerified: boolean;
  professions: string[];
  availability?: string;
  location?: string;
  languages: string[];
  skills: string[];
  extraSkills: number;
  credits: { title: string; detail?: string }[];
  extraCredits: number;
  testimonialCount: number;
  trustScore?: number;
  responseRate?: number;
  yearsOfExperience?: number;
}

export type CompareTalentStatus = "loading" | "error" | "ready";

export interface CompareTalentResult {
  username: string;
  status: CompareTalentStatus;
  data?: CompareTalentData;
  refetch?: () => void;
}

async function fetchCompareTalent(
  username: string,
): Promise<CompareTalentData> {
  const [profile, credits, testimonials] = await Promise.all([
    talentApi.getPublicProfile(username),
    talentApi.getCredits(username),
    talentApi.getTestimonials(username),
  ]);

  const isPrivate = isPrivateTalentProfileResponse(profile);
  const p = isPrivate ? profile.preview : profile;
  const isVerified = isPrivate
    ? Boolean(profile.is_verified)
    : Boolean(p.is_verified);

  const sortedSkills = [...(p.skills ?? [])].sort(
    (a, b) => (a.order ?? 0) - (b.order ?? 0),
  );
  const sortedCredits = [...credits]
    .sort((a, b) => (b.year ?? 0) - (a.year ?? 0))
    .filter((c) => c.project_name);

  const location = [p.location?.city, p.location?.state]
    .filter(Boolean)
    .join(", ");

  return {
    username,
    userId: p.user_id,
    name: p.full_legal_name || username,
    profilePhoto: p.profile_photo,
    isVerified,
    professions: p.professions ?? [],
    availability: p.availability,
    location: location || undefined,
    languages: (p.languages ?? []).map((l) => l.name).filter(Boolean),
    skills: sortedSkills.slice(0, SKILLS_SHOWN).map((s) => s.name),
    extraSkills: Math.max(sortedSkills.length - SKILLS_SHOWN, 0),
    credits: sortedCredits.slice(0, CREDITS_SHOWN).map((c) => ({
      title: c.project_name!,
      detail: c.role_played || c.platform,
    })),
    extraCredits: Math.max(sortedCredits.length - CREDITS_SHOWN, 0),
    // Public endpoint returns only talent-approved testimonials; count
    // everything that isn't explicitly unapproved.
    testimonialCount: testimonials.filter(
      (t) => t.is_approved_by_talent !== false,
    ).length,
    trustScore: p.trust_score,
    responseRate: p.response_rate,
    yearsOfExperience: p.years_of_experience,
  };
}

export function useCompareTalents(usernames: string[]): CompareTalentResult[] {
  const results = useQueries({
    queries: usernames.map((username) => ({
      queryKey: [...talentProfileKeys.all, "compare", username] as const,
      queryFn: () => fetchCompareTalent(username),
      staleTime: 60_000,
    })),
  });

  return usernames.map((username, index) => {
    const result = results[index];
    if (result.isPending) return { username, status: "loading" as const };
    if (result.isError) {
      return {
        username,
        status: "error" as const,
        refetch: () => void result.refetch(),
      };
    }
    return { username, status: "ready" as const, data: result.data };
  });
}
