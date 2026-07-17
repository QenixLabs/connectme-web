export const DASH = "—";

export function showStr(v?: string | null): string {
  return v && v.trim() !== "" ? v : DASH;
}

export function showNum(v?: number | null, suffix = ""): string {
  return typeof v === "number" && Number.isFinite(v) ? `${v}${suffix}` : DASH;
}

export function formatDob(v?: string | null): string {
  if (!v) return DASH;
  const iso = typeof v === "string" ? v.slice(0, 10) : "";
  if (!iso) return DASH;
  const d = new Date(`${iso}T00:00:00Z`);
  if (Number.isNaN(d.getTime())) return DASH;
  return d.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}

export function titleCase(v?: string | null): string {
  if (!v) return DASH;
  return v.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export function formatLocation(parts: (string | null | undefined)[]): string {
  return parts.filter((s): s is string => !!s && s.trim() !== "").join(", ");
}

const COMPLETENESS_FIELDS = [
  "username",
  "full_legal_name",
  "date_of_birth",
  "gender",
  "profile_photo",
  "location",
  "location.country",
  "location.state",
  "location.city",
  "professions",
  "availability",
  "headline",
  "about",
  "physical_attributes",
  "physical_attributes.height_cm",
  "physical_attributes.weight_kg",
  "physical_attributes.body_type",
  "physical_attributes.complexion",
  "physical_attributes.hair_color",
  "physical_attributes.hair_length",
  "physical_attributes.eye_color",
  "physical_attributes.distinctive_features",
  "languages",
  "accents",
  "skills",
  "documents",
  "documents.resume_url",
  "documents.portfolio_pdf_url",
  "documents.measurements_sheet_url",
  "social_links",
  "privacy_mode",
] as const;

function getNested(obj: unknown, path: string): unknown {
  return path.split(".").reduce<unknown>((curr, key) => {
    if (curr && typeof curr === "object") {
      return (curr as Record<string, unknown>)[key];
    }
    return undefined;
  }, obj);
}

function isFieldFilled(value: unknown): boolean {
  if (value === undefined || value === null || value === "") return false;
  if (Array.isArray(value)) return value.length > 0;
  if (typeof value === "object") return Object.keys(value as object).length > 0;
  return true;
}

export function computeCompletenessPct(profile: unknown): number {
  if (!profile || typeof profile !== "object") return 0;
  const total = COMPLETENESS_FIELDS.length;
  let filled = 0;
  for (const path of COMPLETENESS_FIELDS) {
    if (isFieldFilled(getNested(profile, path))) filled += 1;
  }
  return Math.round((filled / total) * 100);
}
