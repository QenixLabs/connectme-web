export const DASH = "—";

export function showStr(v?: string | null): string {
  return v && v.trim() !== "" ? v : DASH;
}

export function showNum(v?: number | null, suffix = ""): string {
  return typeof v === "number" && Number.isFinite(v) ? `${v}${suffix}` : DASH;
}

export function formatDob(v?: string | null): string {
  if (!v) return DASH;
  const s = typeof v === "string" ? v.slice(0, 10) : DASH;
  return s || DASH;
}

export function titleCase(v?: string | null): string {
  if (!v) return DASH;
  return v.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export function formatLocation(parts: (string | null | undefined)[]): string {
  return parts.filter((s): s is string => !!s && s.trim() !== "").join(", ");
}
