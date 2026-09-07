"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { AuthWelcome } from "@/components/auth/auth-welcome";
import { UnifiedAuthForm } from "@/components/auth/unified-auth-form";

function AuthEntryContent() {
  const searchParams = useSearchParams();

  return searchParams.has("mode") ? <UnifiedAuthForm /> : <AuthWelcome />;
}

export function AuthEntry() {
  return (
    <Suspense fallback={<AuthWelcome />}>
      <AuthEntryContent />
    </Suspense>
  );
}
