/**
 * Find-talent search criteria — trimmed port of the talent-finder-flow
 * search-model, limited to fields the real GET /talents/all API supports:
 * search, profession, location (city), gender, availability, languages,
 * skills, age range (computed from date_of_birth), experience range.
 */

export type SearchCriteria = {
  search: string;
  profession: string;
  location: string;
  gender: string;
  availability: string;
  languages: string[];
  skills: string[];
  ageMin: number | null;
  ageMax: number | null;
  experienceMin: number | null;
  experienceMax: number | null;
};

export const emptyCriteria: SearchCriteria = {
  search: "",
  profession: "",
  location: "",
  gender: "",
  availability: "",
  languages: [],
  skills: [],
  ageMin: null,
  ageMax: null,
  experienceMin: null,
  experienceMax: null,
};

/* ---------- URL <-> criteria ---------- */

const str = (v: unknown) => (typeof v === "string" ? v : "");
const num = (v: unknown) => {
  const n = Number(v);
  return Number.isFinite(n) && String(v ?? "").length > 0 ? n : null;
};
const list = (v: unknown) =>
  typeof v === "string" && v.length > 0 ? v.split(",").filter(Boolean) : [];

export function parseCriteria(raw: Record<string, unknown>): SearchCriteria {
  return {
    search: str(raw.q),
    profession: str(raw.profession),
    location: str(raw.location),
    gender: str(raw.gender),
    availability: str(raw.availability),
    languages: list(raw.languages),
    skills: list(raw.skills),
    ageMin: num(raw.ageMin),
    ageMax: num(raw.ageMax),
    experienceMin: num(raw.expMin),
    experienceMax: num(raw.expMax),
  };
}

export function toSearchParams(c: SearchCriteria): Record<string, string> {
  const out: Record<string, string> = {};
  if (c.search) out.q = c.search;
  if (c.profession) out.profession = c.profession;
  if (c.location) out.location = c.location;
  if (c.gender) out.gender = c.gender;
  if (c.availability) out.availability = c.availability;
  if (c.languages.length) out.languages = c.languages.join(",");
  if (c.skills.length) out.skills = c.skills.join(",");
  if (c.ageMin != null) out.ageMin = String(c.ageMin);
  if (c.ageMax != null) out.ageMax = String(c.ageMax);
  if (c.experienceMin != null) out.expMin = String(c.experienceMin);
  if (c.experienceMax != null) out.expMax = String(c.experienceMax);
  return out;
}

/** Map criteria onto the real talent search API params. */
export function toApiParams(c: SearchCriteria) {
  return {
    search: c.search || undefined,
    profession: c.profession || undefined,
    location_city: c.location || undefined,
    gender: c.gender || undefined,
    availability: c.availability || undefined,
    languages: c.languages.length ? c.languages.join(",") : undefined,
    skills: c.skills.length ? c.skills.join(",") : undefined,
    age_min: c.ageMin ?? undefined,
    age_max: c.ageMax ?? undefined,
    min_experience: c.experienceMin ?? undefined,
    max_experience: c.experienceMax ?? undefined,
  };
}

/** "25–30" -> [25, 30]; works for any "a–b" band including experience. */
export function bandToRange(band: string): [number | null, number | null] {
  const m = band.match(/(\d+)\D+(\d+)/);
  if (!m) return [null, null];
  return [Number(m[1]), Number(m[2])];
}

/* ---------- chips / summary ---------- */

export type CriteriaChip = {
  label: string;
  key: keyof SearchCriteria;
  value?: string;
};

export function criteriaChips(c: SearchCriteria): CriteriaChip[] {
  const chips: CriteriaChip[] = [];
  if (c.profession) chips.push({ label: c.profession, key: "profession" });
  if (c.gender) chips.push({ label: c.gender, key: "gender" });
  if (c.ageMin != null && c.ageMax != null)
    chips.push({ label: `${c.ageMin}–${c.ageMax} yrs`, key: "ageMin" });
  c.languages.forEach((l) => chips.push({ label: l, key: "languages", value: l }));
  if (c.location) chips.push({ label: c.location, key: "location" });
  if (c.experienceMin != null || c.experienceMax != null)
    chips.push({
      label:
        c.experienceMin != null && c.experienceMax != null
          ? `${c.experienceMin}–${c.experienceMax} yrs exp`
          : c.experienceMin != null
            ? `${c.experienceMin}+ yrs exp`
            : `≤${c.experienceMax} yrs exp`,
      key: "experienceMin",
    });
  if (c.availability) chips.push({ label: availabilityLabel(c.availability), key: "availability" });
  c.skills.forEach((s) => chips.push({ label: s, key: "skills", value: s }));
  return chips;
}

export function removeChip(c: SearchCriteria, chip: CriteriaChip): SearchCriteria {
  switch (chip.key) {
    case "languages":
      return { ...c, languages: c.languages.filter((l) => l !== chip.value) };
    case "skills":
      return { ...c, skills: c.skills.filter((s) => s !== chip.value) };
    case "ageMin":
      return { ...c, ageMin: null, ageMax: null };
    case "experienceMin":
      return { ...c, experienceMin: null, experienceMax: null };
    default:
      return { ...c, [chip.key]: "" } as SearchCriteria;
  }
}

export function criteriaSummary(c: SearchCriteria): string {
  const parts: string[] = [];
  const who = [c.gender, c.profession].filter(Boolean).join(" ");
  if (who) parts.push(who);
  if (c.ageMin != null && c.ageMax != null) parts.push(`${c.ageMin}–${c.ageMax}`);
  if (c.languages.length) parts.push(c.languages.join(" + "));
  if (c.location) parts.push(c.location);
  if (c.experienceMin != null && c.experienceMax != null)
    parts.push(`${c.experienceMin}–${c.experienceMax} yrs exp`);
  if (c.availability) parts.push(availabilityLabel(c.availability));
  if (c.skills.length) parts.push(c.skills.join(", "));
  if (!parts.length) return c.search || "All talent";
  return parts.join(", ") + ".";
}

export function hasAnyCriteria(c: SearchCriteria): boolean {
  return criteriaChips(c).length > 0 || c.search.trim().length > 0;
}

/* ---------- static filter options ---------- */

export const AGE_BANDS = ["18–25", "20–28", "25–30", "25–35", "30–40"];

export const EXPERIENCE_BANDS = [
  { label: "Fresher", value: "0–1 years", min: 0, max: 1 },
  { label: "1–3 years", value: "1–3 years", min: 1, max: 3 },
  { label: "3–5 years", value: "3–5 years", min: 3, max: 5 },
  { label: "5–10 years", value: "5–10 years", min: 5, max: 10 },
];

export const LANGUAGE_OPTIONS = [
  "Hindi",
  "Telugu",
  "Tamil",
  "English",
  "Marathi",
  "Malayalam",
];

export const SKILL_OPTIONS = [
  "Drama",
  "Commercial",
  "Dance",
  "Theatre",
  "Voice Over",
  "Fashion",
  "Classical",
  "Ad Films",
];

export const GENDER_OPTIONS = ["Female", "Male"];

export const AVAILABILITY_OPTIONS = [
  { label: "Available", value: "available" },
  { label: "Busy", value: "busy" },
  { label: "Not available", value: "not_available" },
];

export function availabilityLabel(value: string): string {
  return AVAILABILITY_OPTIONS.find((o) => o.value === value)?.label ?? value;
}
