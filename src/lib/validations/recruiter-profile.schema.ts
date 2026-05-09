import { z } from 'zod';

export const updateRecruiterProfileSchema = z.object({
  company_name: z.string().min(1, 'Company name is required').max(100, 'Company name must be 100 characters or fewer').optional(),
  company_website: z.string().max(200, 'Website must be 200 characters or fewer').optional().or(z.literal('')),
  linkedin_company_url: z.string().max(300, 'LinkedIn URL must be 300 characters or fewer').optional().or(z.literal('')),
  company_size: z.string().max(50).optional().or(z.literal('')),
  industry: z.string().max(80).optional().or(z.literal('')),
  position: z.string().max(100, 'Position must be 100 characters or fewer').optional().or(z.literal('')),
});

export type UpdateRecruiterProfileInput = z.infer<typeof updateRecruiterProfileSchema>;

export type RecruiterProfile = UpdateRecruiterProfileInput & {
  _id?: string;
  user_id?: string;
  company_email_domain?: string;
  verification_status?: string;
  subscription_tier?: string;
  created_at?: string;
  updated_at?: string;
};
