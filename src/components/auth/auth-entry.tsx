"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { UnifiedAuthForm } from "@/components/auth/unified-auth-form";
import { RecruiterSignup } from "@/components/auth/recruiter-signup/recruiter-signup";
import { OnboardingFlow, RoleScreen } from "@/components/onboarding/onboarding-flow";

function AuthEntryContent() {
  const searchParams = useSearchParams();
  const mode = searchParams.get("mode");
  const role = searchParams.get("role");
  const recruiterSignup = mode === "signup" && role === "recruiter";

  if (recruiterSignup) return <RecruiterSignup />;
  if (mode === "signup" && role !== "talent" && role !== "recruiter") {
    return (
      <div className="app-shell onboarding-theme">
        <RoleScreen />
      </div>
    );
  }
  return searchParams.has("mode") ? <UnifiedAuthForm /> : <OnboardingFlow />;
}

export function AuthEntry() {
  return (
    <Suspense fallback={<OnboardingFlow />}>
      <AuthEntryContent />
    </Suspense>
  );
}
