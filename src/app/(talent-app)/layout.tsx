"use client";

import { usePathname } from "next/navigation";
import { TopBar } from "@/components/shared/top-bar";
import { BottomBar } from "@/components/shared/bottom-bar";
import { useTalentNavItems } from "@/hooks/use-talent-nav-items";

export default function TalentAppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const navItems = useTalentNavItems();
  const isSettingsPage = pathname === "/talent/settings";
  const isProfileVisibilityPage = pathname === "/talent/settings/profile-visibility";
  const isReputationPage = pathname === "/talent/reputation";
  const isAnalyticsPage = pathname === "/talent/analytics";
  const analyticsMobileNav = navItems.filter((item) =>
    ["Home", "Opportunities", "Analytics", "Messages", "Profile"].includes(item.label),
  );

  if (pathname === "/talent/network") {
    return <div className="min-h-screen">{children}</div>;
  }

  return (
    <div className="flex min-h-screen flex-col">
      {!isSettingsPage && !isProfileVisibilityPage && <TopBar navItems={navItems} role="talent" showUserMenu />}
      <main className="flex-1 pb-10">{children}</main>
      {!isProfileVisibilityPage && (
        <BottomBar
          navItems={navItems}
          mobileNavItems={isAnalyticsPage ? analyticsMobileNav : undefined}
          iconOnly={!isSettingsPage && !isReputationPage && !isAnalyticsPage}
          variant={isSettingsPage ? "settings" : "default"}
        />
      )}
    </div>
  );
}
