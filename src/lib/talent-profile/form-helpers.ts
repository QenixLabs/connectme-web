import type {
  CreateTalentProfileInput,
  TalentProfile,
} from "@/lib/validations/talent-profile.schema";

export const emptyToUndefined = (v: unknown): unknown =>
  v === "" || v === null || v === undefined ? undefined : v;

export const numberOrUndefined = (v: unknown): number | undefined => {
  if (v === "" || v === null || v === undefined) return undefined;
  const n = typeof v === "number" ? v : Number(v);
  return Number.isFinite(n) ? n : undefined;
};

export const DEFAULT_VALUES: CreateTalentProfileInput = {
  username: "",
  full_legal_name: "",
  date_of_birth: "",
  gender: "",
  profile_photo: "",
  location: { country: "", state: "", city: "" },
  professions: [],
  industries: [],
  availability: undefined,
  headline: "",
  about: "",
  physical_attributes: {
    height_cm: undefined,
    weight_kg: undefined,
    body_type: "",
    complexion: "",
    hair_color: "",
    hair_length: "",
    eye_color: "",
    distinctive_features: "",
  },
  languages: [],
  accents: [],
  skills: [],
  documents: { resume_url: "", portfolio_pdf_url: "", measurements_sheet_url: "" },
  social_links: {
    instagram: { url: "", visibility: "public" },
    youtube: { url: "", visibility: "public" },
    linkedin: { url: "", visibility: "public" },
  },
  privacy_mode: undefined,
};

export function hydrateFromServer(profile: TalentProfile): CreateTalentProfileInput {
  const dob = profile.date_of_birth
    ? typeof profile.date_of_birth === "string"
      ? profile.date_of_birth.slice(0, 10)
      : ""
    : "";

  return {
    username: profile.username ?? "",
    full_legal_name: profile.full_legal_name ?? "",
    date_of_birth: dob,
    gender: profile.gender ?? "",
    profile_photo: profile.profile_photo ?? "",
    location: {
      country: profile.location?.country ?? "",
      state: profile.location?.state ?? "",
      city: profile.location?.city ?? "",
    },
    professions: profile.professions ?? [],
    industries: profile.industries ?? [],
    availability: profile.availability,
    headline: profile.headline ?? "",
    about: profile.about ?? "",
    physical_attributes: {
      height_cm: profile.physical_attributes?.height_cm,
      weight_kg: profile.physical_attributes?.weight_kg,
      body_type: profile.physical_attributes?.body_type ?? "",
      complexion: profile.physical_attributes?.complexion ?? "",
      hair_color: profile.physical_attributes?.hair_color ?? "",
      hair_length: profile.physical_attributes?.hair_length ?? "",
      eye_color: profile.physical_attributes?.eye_color ?? "",
      distinctive_features: profile.physical_attributes?.distinctive_features ?? "",
    },
    languages: (profile.languages ?? []).map((l) => ({
      name: l.name ?? "",
      fluency: l.fluency ?? "",
    })),
    accents: profile.accents ?? [],
    skills: (profile.skills ?? []).map((s) => ({
      name: s.name,
      proficiency: s.proficiency,
      order: s.order,
    })),
    documents: {
      resume_url: profile.documents?.resume_url ?? "",
      portfolio_pdf_url: profile.documents?.portfolio_pdf_url ?? "",
      measurements_sheet_url: profile.documents?.measurements_sheet_url ?? "",
    },
    social_links: {
      instagram: {
        url: profile.social_links?.instagram?.url ?? "",
        visibility:
          (profile.social_links?.instagram?.visibility as "public" | "recruiters_only" | "private") ??
          "public",
      },
      youtube: {
        url: profile.social_links?.youtube?.url ?? "",
        visibility:
          (profile.social_links?.youtube?.visibility as "public" | "recruiters_only" | "private") ??
          "public",
      },
      linkedin: {
        url: profile.social_links?.linkedin?.url ?? "",
        visibility:
          (profile.social_links?.linkedin?.visibility as "public" | "recruiters_only" | "private") ??
          "public",
      },
    },
    privacy_mode: profile.privacy_mode,
  };
}

function isEmptyValue(v: unknown): boolean {
  return v === undefined || v === null || v === "";
}

function stripEmptyObject<T extends Record<string, unknown>>(
  obj: T
): Partial<T> | undefined {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(obj)) {
    if (isEmptyValue(v)) continue;
    if (v && typeof v === "object" && !Array.isArray(v)) {
      const inner = stripEmptyObject(v as Record<string, unknown>);
      if (inner !== undefined) out[k] = inner;
      continue;
    }
    out[k] = v;
  }
  return Object.keys(out).length > 0 ? (out as Partial<T>) : undefined;
}

export function buildPayload(values: CreateTalentProfileInput): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [key, val] of Object.entries(values) as [
    keyof CreateTalentProfileInput,
    unknown,
  ][]) {
    if (val === undefined || val === null) continue;
    if (typeof val === "string") {
      if (val !== "") out[key] = val;
      continue;
    }
    if (Array.isArray(val)) {
      out[key] = val;
      continue;
    }
    if (typeof val === "object") {
      const cleaned = stripEmptyObject(val as Record<string, unknown>);
      if (cleaned !== undefined) out[key] = cleaned;
      continue;
    }
    out[key] = val;
  }
  return out;
}
