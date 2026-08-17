import { redirect } from "next/navigation";

export default function TalentSignupPage() {
  redirect("/auth?mode=signup&role=talent");
}
