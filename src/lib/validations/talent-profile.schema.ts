import { z } from 'zod';

export const PROFICIENCY = ['beginner', 'intermediate', 'expert'] as const;
export const AVAILABILITY = ['available', 'busy', 'not_available'] as const;
export const PRIVACY_MODE = ['public', 'private'] as const;
export const VISIBILITY = ['public', 'recruiters_only', 'private'] as const;

const usernameSchema = z
  .string()
  .min(3, 'Username must be at least 3 characters')
  .max(30, 'Username must be 30 characters or fewer')
  .regex(/^[a-z0-9_.-]+$/, 'Lowercase letters, digits, dot, dash, underscore only');

const locationSchema = z.object({
  country: z.string().optional(),
  state: z.string().optional(),
  city: z.string().optional(),
});

const physicalAttributesSchema = z.object({
  height_cm: z.number().int().min(50).max(300).optional(),
  weight_kg: z.number().int().min(20).max(300).optional(),
  body_type: z.string().optional(),
  complexion: z.string().optional(),
  hair_color: z.string().optional(),
  hair_length: z.string().optional(),
  eye_color: z.string().optional(),
  distinctive_features: z.string().max(300, 'Distinctive features must be 300 characters or fewer').optional(),
});

const skillSchema = z.object({
  name: z.string().min(1, 'Skill name is required').max(60),
  proficiency: z.enum(PROFICIENCY),
  order: z.number().int().optional(),
});

const strictLanguageSchema = z.object({
  name: z.string().min(1, 'Language name is required').max(40),
  fluency: z.string().min(1, 'Fluency is required'),
});

const lenientLanguageSchema = z.object({
  name: z.string().max(40).optional(),
  fluency: z.string().optional(),
});

const documentsSchema = z.object({
  resume_url: z.string().optional(),
  portfolio_pdf_url: z.string().optional(),
  measurements_sheet_url: z.string().optional(),
});

const socialLinkSchema = z.object({
  url: z.string().optional(),
  visibility: z.enum(VISIBILITY).optional(),
});

const socialLinksSchema = z.object({
  instagram: socialLinkSchema.optional(),
  youtube: socialLinkSchema.optional(),
  linkedin: socialLinkSchema.optional(),
});

export const sectionVisibilitySchema = z.object({
  bio: z.boolean().optional(),
  skills: z.boolean().optional(),
  experience: z.boolean().optional(),
  portfolio: z.boolean().optional(),
  availability: z.boolean().optional(),
  location: z.boolean().optional(),
  physical_attributes: z.boolean().optional(),
  languages: z.boolean().optional(),
  accents: z.boolean().optional(),
  documents: z.boolean().optional(),
  social_links: z.boolean().optional(),
});

export const updateTalentProfileSchema = z.object({
  username: z.string().optional(),
  full_legal_name: z.string().max(120).optional(),
  date_of_birth: z.string().optional(),
  gender: z.string().optional(),
  profile_photo: z.string().optional(),
  location: locationSchema.optional(),
  professions: z.array(z.string()).optional(),
  industries: z.array(z.string()).optional(),
  availability: z.enum(AVAILABILITY).optional(),
  headline: z.string().max(120, 'Headline must be 120 characters or fewer').optional(),
  about: z.string().max(500, 'About must be 500 characters or fewer').optional(),
  physical_attributes: physicalAttributesSchema.optional(),
  languages: z.array(lenientLanguageSchema).optional(),
  accents: z.array(z.string()).optional(),
  skills: z.array(skillSchema).optional(),
  documents: documentsSchema.optional(),
  social_links: socialLinksSchema.optional(),
  privacy_mode: z.enum(PRIVACY_MODE).optional(),
  section_visibility: sectionVisibilitySchema.optional(),
});

export const createTalentProfileSchema = updateTalentProfileSchema.extend({
  username: usernameSchema,
  languages: z.array(strictLanguageSchema).optional(),
});

export type UpdateTalentProfileInput = z.infer<typeof updateTalentProfileSchema>;
export type CreateTalentProfileInput = z.infer<typeof createTalentProfileSchema>;

export const portfolioItemSchema = z.object({
  id: z.string(),
  type: z.enum(['image', 'video']),
  category: z.enum(['work', 'personal', 'intro']),
  url: z.string(),
  thumbnail_url: z.string().optional(),
  caption: z.string().optional(),
  is_pinned: z.boolean(),
  created_at: z.string(),
});

export type PortfolioItem = z.infer<typeof portfolioItemSchema>;

export type TalentProfile = UpdateTalentProfileInput & {
  _id?: string;
  user_id?: string;
  username?: string;
  email?: string;
  phone?: string;
  media_limits?: {
    images_used: number;
    videos_used: number;
    plan_max_images: number;
    plan_max_videos: number;
  };
  analytics?: unknown;
  section_visibility?: z.infer<typeof sectionVisibilitySchema>;
  created_at?: string;
  updated_at?: string;
  __v?: number;
};
