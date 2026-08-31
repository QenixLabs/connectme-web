export type ScreenKey =
  | "basic"
  | "professional"
  | "about"
  | "availability"
  | "strength"
  | "skills"
  | "portfolio"
  | "media"
  | "awards"
  | "experience"
  | "credits"
  | "physical"
  | "languages"
  | "social"
  | "documents"
  | "privacy"
  | "testimonials";

export type Availability = "available" | "busy" | "not_available";
export type PrivacyMode = "public" | "recruiters_only" | "private";

export interface PhysicalAttributes {
  height_cm?: number;
  weight_kg?: number;
  body_type?: string;
  complexion?: string;
  hair_color?: string;
  hair_length?: string;
  eye_color?: string;
  distinctive_features?: string;
  chest?: string;
  waist?: string;
  shoe_size?: string;
  tattoos?: string;
}

export interface LanguageItem {
  name: string;
  fluency: string;
}

export interface SkillItem {
  name: string;
  proficiency: "beginner" | "intermediate" | "expert";
  order: number;
}

export interface SocialLinkItem {
  url: string;
  visibility: string;
  show_on_profile: boolean;
}

export interface DocumentItem {
  resume_url?: string;
  portfolio_pdf_url?: string;
  measurements_sheet_url?: string;
}

export interface SectionVisibility {
  bio?: boolean;
  skills?: boolean;
  experience?: boolean;
  portfolio?: boolean;
  availability?: boolean;
  location?: boolean;
  physical_attributes?: boolean;
  languages?: boolean;
  accents?: boolean;
  documents?: boolean;
  social_links?: boolean;
}

export interface PortfolioProject {
  id: string;
  title: string;
  subtitle: string;
  date: string;
  featured: boolean;
}

export interface Credit {
  id: string;
  project: string;
  role: string;
  production: string;
  year: string;
  description: string;
}

export interface Experience {
  id: string;
  title: string;
  company: string;
  period: string;
  description: string;
}

export interface MediaItem {
  id: string;
  name: string;
  kind: "showreel" | "video" | "image";
  meta: string;
  featured: boolean;
}

export interface Award {
  id: string;
  name: string;
  organization: string;
  year: string;
  description: string;
}

export interface Testimonial {
  id: string;
  author: string;
  role: string;
  rating: number;
  text: string;
  approvedByTalent: boolean;
}

export interface Profile {
  fullLegalName: string;
  username: string;
  headline: string;
  gender: string;
  dateOfBirth: string;
  location: string;
  professions: string[];
  specialties: string[];
  yearsOfExperience: number;
  about: string;
  availability: Availability;
  physicalAttributes: PhysicalAttributes;
  languages: LanguageItem[];
  accents: string[];
  skills: SkillItem[];
  documents: DocumentItem;
  socialLinks: Record<string, SocialLinkItem>;
  privacyMode: PrivacyMode;
  sectionVisibility: SectionVisibility;
  profilePhoto: string;
  heroBackground: string;
  isVerified: boolean;

  portfolio: PortfolioProject[];
  credits: Credit[];
  experience: Experience[];
  media: MediaItem[];
  awards: Award[];
  testimonials: Testimonial[];
  travelLocations: string[];
  creatorLink: string;
  availableFrom: string;
  openToTravel: boolean;
}

export interface StrengthItem {
  key: string;
  label: string;
  done: boolean;
}

export interface StrengthResult {
  percent: number;
  items: StrengthItem[];
}
