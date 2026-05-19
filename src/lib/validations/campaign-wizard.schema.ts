import { z } from 'zod';

export const campaignWizardSchema = z
  .object({
    name: z
      .string()
      .min(1, 'Campaign name is required')
      .max(100, 'Must be 100 characters or fewer'),
    description: z
      .string()
      .max(2000, 'Must be 2000 characters or fewer')
      .optional(),
    role_type: z.string().optional(),
    industry: z.string().optional(),
    location: z
      .object({
        city: z.string().optional(),
        state: z.string().optional(),
      })
      .optional(),
    dates: z
      .object({
        start: z.string().optional(),
        end: z.string().optional(),
      })
      .optional(),
    deadline: z.string().optional(),
    requirements: z
      .object({
        skills: z.array(z.string().max(50, 'Too long')).max(20, 'Max 20 skills').optional(),
        languages: z.array(z.string().max(50, 'Too long')).max(20, 'Max 20 languages').optional(),
        gender: z.string().optional(),
        age_range: z
          .object({
            min: z.number().min(0, 'Must be 0 or more').optional(),
            max: z.number().min(0, 'Must be 0 or more').optional(),
          })
          .optional(),
        attributes: z.string().max(1000, 'Too long').optional(),
      })
      .optional(),
    budget_range: z
      .object({
        min: z.number().min(0, 'Must be 0 or more').optional(),
        max: z.number().min(0, 'Must be 0 or more').optional(),
        currency: z.string().optional(),
      })
      .optional(),
    publishOption: z.enum(['draft', 'public', 'invite_only']),
  })
  .superRefine((data, ctx) => {
    if (data.dates?.start && data.dates?.end) {
      if (new Date(data.dates.end) < new Date(data.dates.start)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'End date must be after start date',
          path: ['dates', 'end'],
        });
      }
    }
    if (
      data.requirements?.age_range?.min != null &&
      data.requirements?.age_range?.max != null
    ) {
      if (data.requirements.age_range.max < data.requirements.age_range.min) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Max age must be greater than or equal to min age',
          path: ['requirements', 'age_range', 'max'],
        });
      }
    }
    if (
      data.budget_range?.min != null &&
      data.budget_range?.max != null
    ) {
      if (data.budget_range.max < data.budget_range.min) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Max budget must be greater than or equal to min budget',
          path: ['budget_range', 'max'],
        });
      }
    }
  });

export type CampaignWizardInput = z.infer<typeof campaignWizardSchema>;
