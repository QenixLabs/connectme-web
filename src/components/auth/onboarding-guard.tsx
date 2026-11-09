"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/providers/auth-store-provider";
import type { User } from "@/stores/auth-store";

function hasWorkspaceAccess(user: User, role: "talent" | "recruiter") {
  return user.role === role || user.account_capabilities?.includes(role) === true;
}

function getDefaultWorkspace(user: User) {
  if (user.role === "talent" || user.role === "recruiter") {
    return `/${user.role}/dashboard`;
  }
  if (user.role === "provider" || user.account_capabilities?.includes("provider")) {
    return "/provider/dashboard";
  }
  return "/talent/dashboard";
}

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
    if (!hasWorkspaceAccess(current, role)) {
      router.replace(getDefaultWorkspace(current));
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
  if (!user || !hasWorkspaceAccess(user, role) || !done) return null;

  return <>{children}</>;
}
