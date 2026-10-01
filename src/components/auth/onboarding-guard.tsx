"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/providers/auth-store-provider";

export function OnboardingGuard({
  role,
  children,
}: {
  role: "talent" | "recruiter";
  children: React.ReactNode;
}) {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const hasHydrated = useAuthStore((s) => s.hasHydrated);
  const fetchUser = useAuthStore((s) => s.fetchUser);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    if (!hasHydrated) return;
    fetchUser().finally(() => setChecking(false));
  }, [hasHydrated, fetchUser]);

  useEffect(() => {
    if (checking || !hasHydrated) return;
    const current = user;
    if (!current) {
      router.replace("/auth/login");
      return;
    }
    if (current.role !== role) {
      router.replace(current.role === "recruiter" ? "/recruiter/dashboard" : "/talent/dashboard");
      return;
    }
    const done = current.onboarding_completed || current.onboarding_exempted;
    if (!done) {
      router.replace(role === "recruiter" ? "/auth/recruiter/signup?resume=1" : "/auth/talent/signup?resume=1");
    }
  }, [checking, hasHydrated, user, role, router]);

  if (!hasHydrated || checking) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  const done = user?.onboarding_completed || user?.onboarding_exempted;
  if (!user || user.role !== role || !done) return null;

  return <>{children}</>;
}
