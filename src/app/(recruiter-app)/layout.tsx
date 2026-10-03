"use client";

import { usePathname } from "next/navigation";
import { TopBar } from "@/components/shared/top-bar";
import { BottomBar } from "@/components/shared/bottom-bar";
import {
  recruiterBottomNavItems,
  recruiterNavItems,
} from "@/components/shared/nav-config";
import { OnboardingGuard } from "@/components/auth/onboarding-guard";
import { useRecruiterProfile } from "@/hooks/use-recruiter-profile";

export default function RecruiterAppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isConversationPage = pathname.startsWith("/recruiter/messages/");
  const { data: recruiterProfile } = useRecruiterProfile();
  const bottomNavItems = recruiterBottomNavItems.map((item) =>
    item.label === "Profile" && recruiterProfile?.slug
      ? { ...item, href: `/recruiter/${recruiterProfile.slug}` }
      : item,
  );

  return (
    <OnboardingGuard role="recruiter">
      <div className="flex min-h-screen flex-col">
        <TopBar navItems={recruiterNavItems} role="recruiter" showUserMenu />
        <main className="flex-1 pb-16 md:pb-0">{children}</main>
        {!isConversationPage && (
          <BottomBar
            navItems={bottomNavItems}
            activeLabel={pathname.startsWith("/recruiter/profile") ? "Profile" : undefined}
          />
        )}
      </div>
    </OnboardingGuard>
  );
}
