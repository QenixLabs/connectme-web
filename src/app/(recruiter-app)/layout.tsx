"use client";

import { TopBar } from "@/components/shared/top-bar";
import { BottomBar } from "@/components/shared/bottom-bar";
import { recruiterNavItems } from "@/components/shared/nav-config";
import { OnboardingGuard } from "@/components/auth/onboarding-guard";

export default function RecruiterAppLayout({ children }: { children: React.ReactNode }) {
  return (
    <OnboardingGuard role="recruiter">
      <div className="flex min-h-screen flex-col">
        <TopBar navItems={recruiterNavItems} role="recruiter" showUserMenu />
        <main className="flex-1 pb-16 md:pb-0">{children}</main>
        <BottomBar navItems={recruiterNavItems} />
      </div>
    </OnboardingGuard>
  );
}
