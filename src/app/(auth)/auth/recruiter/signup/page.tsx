import type { Metadata } from "next";
import { RecruiterSignup } from "@/components/auth/recruiter-signup/recruiter-signup";

export const metadata: Metadata = {
  title: "RootIn — Recruiter Signup for Entertainment Hiring",
  description:
    "Create your RootIn recruiter account in three steps: your details, your roles, and your organization. Discover verified entertainment talent.",
};

export default function RecruiterSignupPage() {
  return <RecruiterSignup />;
}
