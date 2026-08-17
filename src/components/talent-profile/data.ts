import type {
  TalentProfile,
  PortfolioApiResponse,
  Credit,
  Testimonial,
  Award,
} from "@/lib/api/talent";
import type { PortfolioItem } from "@/lib/types/portfolio";

export interface ProfileFacts {
  icon: "calendar" | "height" | "globe" | "eye";
  label: string;
  value: string;
}

export interface ExperienceItem {
  id: string;
  years: string;
  role: string;
  platform: string;
  company: string;
  projectName?: string;
  director?: string;
  creditUrl?: string;
  description: string;
}

export interface ReviewItem {
  id: string;
  name: string;
  role: string;
  rating: number;
  when: string;
  quote: string;
}

export interface AwardItem {
  id: string;
  name: string;
  issuer: string;
}

export function formatLocation(
  location?: { country?: string; state?: string; city?: string },
): string {
  if (!location) return "";
  return [location.city, location.state, location.country]
    .filter(Boolean)
    .join(", ");
}

export function formatRelativeTime(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
  return `${Math.floor(diffDays / 365)} years ago`;
}

export function getFacts(profile: TalentProfile): ProfileFacts[] {
  const facts: ProfileFacts[] = [];

  if (profile.physical_attributes?.height_cm) {
    const cm = profile.physical_attributes.height_cm;
    const feet = Math.floor(cm / 30.48);
    const inches = Math.round((cm / 25.4) % 12);
    facts.push({ icon: "height", label: "Height", value: `${feet}'${inches}"` });
  }

  if (profile.languages && profile.languages.length > 0) {
    facts.push({
      icon: "globe",
      label: "Languages",
      value: profile.languages.map((l) => `${l.name} (${l.fluency})`).join(", "),
    });
  }

  if (profile.physical_attributes?.eye_color) {
    facts.push({
      icon: "eye",
      label: "Eye Color",
      value: profile.physical_attributes.eye_color,
    });
  }

  if (profile.date_of_birth) {
    const birth = new Date(profile.date_of_birth);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
    facts.push({ icon: "calendar", label: "Age", value: String(age) });
  }

  return facts;
}

export function toPortfolioItems(
  items: PortfolioApiResponse[],
): PortfolioItem[] {
  return items.map((item, index) => {
    const type =
      item.type === "image" ||
      item.type === "video" ||
      item.type === "youtube" ||
      item.type === "instagram"
        ? item.type
        : "image";
    return {
      id: item.id,
      type,
      category: item.category || "work",
      title: item.title || item.caption || "Untitled work",
      description: item.description || "",
      url: item.url,
      thumbnailUrl: item.thumbnail_url || item.url,
      embedUrl: item.embed_url,
      isFeatured: !!item.is_pinned,
      sortOrder: index,
      skills: [],
      likesCount: item.likes_count ?? 0,
      isLiked: !!item.is_liked_by_me,
      viewsCount: item.view_count ?? 0,
      visibility: "public",
      createdAt: item.created_at || new Date().toISOString(),
      updatedAt: item.updated_at || item.created_at || new Date().toISOString(),
    };
  });
}

export function toExperienceItems(credits: Credit[]): ExperienceItem[] {
  return credits
    .filter((c) => c.type === "credit")
    .sort((a, b) => {
      if (!a.year && !b.year) return 0;
      if (!a.year) return 1;
      if (!b.year) return -1;
      return b.year - a.year;
    })
    .map((c) => ({
      id: c._id,
      years: c.year ? String(c.year) : "N/A",
      role: c.role_played || "",
      platform: c.platform || "Film",
      company: [c.project_name, c.director].filter(Boolean).join(" • "),
      projectName: c.project_name,
      director: c.director,
      creditUrl: c.credit_url,
      description: c.description || "",
    }));
}

export function toAwardItems(awards: Award[]): AwardItem[] {
  return awards.map((a) => ({
    id: a._id,
    name: a.title,
    issuer: [a.awarding_body, a.year ? String(a.year) : ""]
      .filter(Boolean)
      .join(" • "),
  }));
}

export function toReviewItems(testimonials: Testimonial[]): ReviewItem[] {
  return testimonials.map((t) => ({
    id: t._id,
    name: t.author_name,
    role: [t.author_role, t.author_company].filter(Boolean).join(", "),
    rating: t.rating ?? 5,
    when: formatRelativeTime(t.created_at),
    quote: t.content || "",
  }));
}

export function computeRating(testimonials: Testimonial[]): {
  average: number;
  count: number;
} {
  if (testimonials.length === 0) return { average: 0, count: 0 };
  const sum = testimonials.reduce((acc, t) => acc + (t.rating ?? 5), 0);
  return { average: Number((sum / testimonials.length).toFixed(1)), count: testimonials.length };
}
