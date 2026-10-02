"use client";

import { usePathname } from "next/navigation";
import { TopBar } from "@/components/shared/top-bar";
import { BottomBar } from "@/components/shared/bottom-bar";
import { useTalentNavItems } from "@/hooks/use-talent-nav-items";
import { OnboardingGuard } from "@/components/auth/onboarding-guard";

export default function TalentAppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const navItems = useTalentNavItems();
  const isSettingsPage = pathname === "/talent/settings";
  const isProfileVisibilityPage = pathname === "/talent/settings/profile-visibility";
  const isReputationPage = pathname === "/talent/reputation";
  const isAnalyticsPage = pathname === "/talent/analytics";
  const isConversationPage = pathname.startsWith("/talent/messages/");
  const mobileNavItems = ["Home", "Network", "Opportunities", "Messages", "Profile"].flatMap(
    (label) => {
      const item = navItems.find((navItem) => navItem.label === label);
      return item ? [item] : [];
    },
  );

  const content = (
    <div className="flex min-h-screen flex-col">
      {!isSettingsPage && !isProfileVisibilityPage && <TopBar navItems={navItems} role="talent" showUserMenu />}
      <main className="flex-1 pb-10">{children}</main>
      {!isProfileVisibilityPage && !isConversationPage && (
        <BottomBar
          navItems={navItems}
          mobileNavItems={mobileNavItems}
          iconOnly={!isReputationPage && !isAnalyticsPage}
          activeLabel={isSettingsPage ? "Profile" : undefined}
        />
      )}
    </div>
  );

  if (pathname === "/talent/network") {
    return (
      <OnboardingGuard role="talent">
        <div className="min-h-screen">{children}</div>
      </OnboardingGuard>
    );
  }

  return <OnboardingGuard role="talent">{content}</OnboardingGuard>;
}
