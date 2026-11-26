import type { Metadata } from "next";
import { RecruiterSignup } from "@/components/auth/recruiter-signup/recruiter-signup";

export const metadata: Metadata = {
  title: "Morporfiil - Recruiter Signup for Entertainment Hiring",
  description:
    "Create your Morporfiil recruiter account in three steps: your details, your roles, and your organization. Discover verified entertainment talent.",
};

export default async function RecruiterSignupPage({
  searchParams,
}: {
  searchParams: Promise<{ resume?: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  return <RecruiterSignup isGoogleResume={params.resume === "1"} />;
}
