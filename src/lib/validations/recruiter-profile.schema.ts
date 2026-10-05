import { z } from "zod";

const currentYear = new Date().getFullYear();

const optionalUrl = z
  .string()
  .trim()
  .max(500, "URL must be 500 characters or fewer")
  .refine(
    (value) => value.length === 0 || /^https?:\/\/[^\s]+$/i.test(value),
    "Use a full URL starting with https://",
  );

const optionalText = (max: number, message: string) =>
  z.string().trim().max(max, message);

const tagList = z
  .array(z.string().trim().min(1, "Remove empty tags").max(50, "Tag must be 50 characters or fewer"));

export const recruiterProfileSchema = z.object({
  company_name: z
    .string()
    .trim()
    .min(2, "Agency name must be at least 2 characters")
    .max(100, "Agency name must be 100 characters or fewer"),
  slug: z
    .string()
    .trim()
    .min(3, "Profile URL must be at least 3 characters")
    .max(40, "Profile URL must be 40 characters or fewer")
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase letters, numbers, and single hyphens"),
  company_website: optionalUrl,
  linkedin_company_url: optionalUrl,
  instagram_url: optionalUrl,
  youtube_url: optionalUrl,
  x_url: optionalUrl,
  company_size: optionalText(50, "Company size must be 50 characters or fewer"),
  industry: optionalText(80, "Industry must be 80 characters or fewer"),
  headline: optionalText(120, "Headline must be 120 characters or fewer"),
  about: z
    .string()
    .trim()
    .min(1, "Professional description is required")
    .max(1000, "Description must be 1000 characters or fewer"),
  founded_year: z
    .number()
    .int("Enter a whole year")
    .min(1800, "Founded year must be 1800 or later")
    .max(currentYear, `Founded year cannot be after ${currentYear}`)
    .optional(),
  location: z
    .object({
      country: optionalText(80, "Country must be 80 characters or fewer").optional(),
      state: optionalText(80, "State must be 80 characters or fewer").optional(),
      city: optionalText(80, "City must be 80 characters or fewer").optional(),
    })
    .optional(),
  specialties: tagList.max(10, "Select up to 10 specialties"),
  languages: tagList.max(20, "Select up to 20 languages"),
  position: optionalText(80, "Position must be 80 characters or fewer"),
  profile_photo: z.string().max(500).optional(),
  banner_image_url: z.string().max(500).optional(),
  banner_tags: tagList.max(20, "Add up to 20 banner tags"),
  motto: optionalText(120, "Motto must be 120 characters or fewer"),
  casting_categories: tagList.max(20, "Add up to 20 casting categories"),
  team_values: z
    .array(
      z.object({
        title: optionalText(80, "Value title must be 80 characters or fewer"),
        description: optionalText(160, "Value description must be 160 characters or fewer"),
      }),
    )
    .max(10, "Add up to 10 team values")
    .superRefine((values, ctx) => {
      values.forEach((value, index) => {
        const hasTitle = value.title.trim().length > 0;
        const hasDescription = value.description.trim().length > 0;

        if (!hasTitle || !hasDescription) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Add both a title and description, or remove this value",
            path: [index, hasTitle ? "description" : "title"],
          });
        }
      });
    }),
  cta_headline: optionalText(120, "CTA headline must be 120 characters or fewer"),
  cta_subheadline: optionalText(240, "CTA subheadline must be 240 characters or fewer"),
  cta_image_url: z.string().max(500).optional(),
});

export type RecruiterProfileFormValues = z.infer<typeof recruiterProfileSchema>;
