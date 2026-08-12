import { redirect } from "next/navigation";

export default function RecruiterSignupPage() {
  redirect("/auth?mode=signup&role=recruiter");
}
