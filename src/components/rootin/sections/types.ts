export type DisplayMode = "empty" | "compact" | "normal" | "expanded";

export function getDisplayMode(count: number): DisplayMode {
  if (count === 0) return "empty";
  if (count <= 2) return "compact";
  if (count <= 5) return "normal";
  return "expanded";
}

export interface SectionProps<T> {
  data: T[];
}

export interface Fact {
  icon: "calendar" | "height" | "globe" | "eye";
  label: string;
  value: string;
}

export interface TalentData {
  name: string;
  roles: string[];
  location: string;
  responds: string;
  bio: string;
  likes: number;
}

export interface PortfolioItem {
  img: string;
  duration?: string;
  category: string;
  title: string;
  type: "video" | "photo";
}

export interface ExperienceItem {
  years: string;
  role: string;
  pill: string;
  company: string;
  description: string;
}

export interface AwardItem {
  name: string;
  issuer: string;
}

export interface ReviewItem {
  avatar: string;
  name: string;
  role: string;
  rating: number;
  when: string;
  quote: string;
}
