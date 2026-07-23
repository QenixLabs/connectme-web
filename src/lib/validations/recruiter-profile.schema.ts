import { z } from 'zod';

export const updateRecruiterProfileSchema = z.object({
  slug: z.string().min(1).max(80).optional(),
  company_name: z.string().min(1, 'Company name is required').max(100, 'Company name must be 100 characters or fewer').optional(),
  company_website: z.string().max(200, 'Website must be 200 characters or fewer').optional().or(z.literal('')),
  linkedin_company_url: z.string().max(300, 'LinkedIn URL must be 300 characters or fewer').optional().or(z.literal('')),
  company_size: z.string().max(50).optional().or(z.literal('')),
  industry: z.string().max(100).optional().or(z.literal('')),
  headline: z.string().max(120).optional().or(z.literal('')),
  about: z.string().max(500).optional().or(z.literal('')),
  founded_year: z.number().min(1800).max(2100).optional(),
  location: z
    .object({
      country: z.string().optional(),
      state: z.string().optional(),
      city: z.string().optional(),
    })
    .optional(),
  specialties: z.array(z.string()).optional(),
  position: z.string().max(100, 'Position must be 100 characters or fewer').optional().or(z.literal('')),
  profile_photo: z.string().optional(),
});

export type UpdateRecruiterProfileInput = z.infer<typeof updateRecruiterProfileSchema>;

export type RecruiterProfile = UpdateRecruiterProfileInput & {
  _id?: string;
  user_id?: string;
  company_email_domain?: string;
  verification_status?: string;
  profile_photo?: string;
  created_at?: string;
  updated_at?: string;
};

export type RecruiterPublicProfile = {
  user_id: string;
  slug: string;
  company_name: string;
  profile_photo?: string;
  company_website?: string;
  linkedin_company_url?: string;
  company_size?: string;
  industry?: string;
  headline?: string;
  about?: string;
  founded_year?: number;
  location?: { country?: string; state?: string; city?: string };
  specialties?: string[];
  position?: string;
  verification_status: string;
  trust_score: number;
  verification_tier: number;
  active_plan: string | null;
  member_since: string | null;
  active_campaigns_count: number;
};
