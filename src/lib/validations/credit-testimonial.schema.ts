import { z } from "zod";

export interface Credit {
  _id: string;
  user_id?: string;
  type: string;
  project_name?: string;
  role_played?: string;
  platform?: string;
  year?: number;
  director?: string;
  credit_url?: string;
  verification_status?: string;
  order?: number;
  description?: string;
  media_url?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Testimonial {
  _id: string;
  user_id?: string;
  type: string;
  author_name?: string;
  author_role?: string;
  author_company?: string;
  content?: string;
  rating?: number;
  is_video?: boolean;
  video_url?: string;
  is_approved_by_talent?: boolean;
  order?: number;
  description?: string;
  media_url?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Award {
  _id: string;
  user_id?: string;
  type: string;
  title?: string;
  awarding_body?: string;
  year?: number;
  description?: string;
  media_url?: string;
  verification_status?: string;
  order?: number;
  created_at?: string;
  updated_at?: string;
}

// ── Zod validation schemas ──

export const creditFormSchema = z.object({
  project_name: z.string().min(1, "Project name is required").max(200),
  role_played: z.string().min(1, "Role is required").max(200),
  platform: z.string().max(200).optional().or(z.literal("")),
  year: z.number().int().min(1900).max(2030).optional(),
  director: z.string().max(200).optional().or(z.literal("")),
  credit_url: z.string().url("Invalid URL").optional().or(z.literal("")),
  order: z.number().int().min(0).optional(),
});

export type CreditFormValues = z.infer<typeof creditFormSchema>;

export const testimonialFormSchema = z.object({
  author_name: z.string().min(1, "Name is required").max(200),
  author_role: z.string().max(200).optional().or(z.literal("")),
  author_company: z.string().max(200).optional().or(z.literal("")),
  content: z.string().min(1, "Testimonial text is required").max(2000),
  rating: z.number().int().min(1).max(5).optional(),
});

export type TestimonialFormValues = z.infer<typeof testimonialFormSchema>;

export const awardFormSchema = z.object({
  title: z.string().min(1, "Award title is required").max(200),
  awarding_body: z.string().min(1, "Awarding body is required").max(200),
  year: z.number().int().min(1900).max(2030).optional(),
  description: z.string().max(500).optional().or(z.literal("")),
});

export type AwardFormValues = z.infer<typeof awardFormSchema>;
