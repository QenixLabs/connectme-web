"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { AuthWelcome } from "@/components/auth/auth-welcome";
import { UnifiedAuthForm } from "@/components/auth/unified-auth-form";
import { RecruiterSignup } from "@/components/auth/recruiter-signup/recruiter-signup";

function AuthEntryContent() {
  const searchParams = useSearchParams();
  const recruiterSignup =
    searchParams.get("mode") === "signup" && searchParams.get("role") === "recruiter";

  if (recruiterSignup) return <RecruiterSignup />;
  return searchParams.has("mode") ? <UnifiedAuthForm /> : <AuthWelcome />;
}

export function AuthEntry() {
  return (
    <Suspense fallback={<AuthWelcome />}>
      <AuthEntryContent />
    </Suspense>
  );
}
