import { z } from "zod";

export const signInSchema = z.object({
  email: z.string().min(1, "Email is required").email("Enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

export type SignInValues = z.infer<typeof signInSchema>;

export const roleSchema = z.enum(["talent", "recruiter"]);

export const credentialsSchema = z
  .object({
    name: z.string().min(1, "Full name is required").max(80, "Name is too long"),
    email: z.string().min(1, "Email is required").email("Enter a valid email address"),
    phone: z
      .string()
      .min(1, "Phone number is required")
      .regex(/^\d{10}$/, "Enter a valid 10-digit number"),
    password: z
      .string()
      .min(8, "At least 8 characters")
      .regex(/[A-Z]/, "One uppercase letter required")
      .regex(/\d/, "One number required")
      .regex(/[^A-Za-z0-9]/, "One special character required"),
    confirmPassword: z.string().min(1, "Confirm your password"),
    verification_method: z.enum(["email", "phone"]),
    role: roleSchema,
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type CredentialsValues = z.infer<typeof credentialsSchema>;

export const talentProfessionSchema = z.object({
  profession: z.string().min(1, "Please select a profession"),
});

export type TalentProfessionValues = z.infer<typeof talentProfessionSchema>;

export const recruiterOrgSchema = z.object({
  companyName: z.string().min(1, "Company name is required").max(100),
  companyWebsite: z.string().url("Enter a valid URL").optional().or(z.literal("")),
  companySize: z.string().min(1, "Please select company size"),
});

export type RecruiterOrgValues = z.infer<typeof recruiterOrgSchema>;

export const signupSchema = credentialsSchema
  .and(
    z.discriminatedUnion("role", [
      z.object({ role: z.literal("talent") }).merge(talentProfessionSchema),
      z.object({ role: z.literal("recruiter") }).merge(recruiterOrgSchema),
    ]),
  );

export type SignupValues = z.infer<typeof signupSchema>;

export interface SignupFormValues {
  name: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
  verification_method: "email" | "phone";
  role: "talent" | "recruiter";
  profession: string;
  creator_link: string;
  companyName: string;
  companyWebsite: string;
  companySize: string;
}
