"use client";

import { usePathname } from "next/navigation";
import { TopBar } from "@/components/shared/top-bar";
import { BottomBar } from "@/components/shared/bottom-bar";
import { useTalentNavItems } from "@/hooks/use-talent-nav-items";

export default function TalentAppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const navItems = useTalentNavItems();
  const isSettingsPage = pathname === "/talent/settings";

  if (pathname === "/talent/network") {
    return <div className="min-h-screen">{children}</div>;
  }

  return (
    <div className="flex min-h-screen flex-col">
      {!isSettingsPage && <TopBar navItems={navItems} role="talent" showUserMenu />}
      <main className="flex-1 pb-10">{children}</main>
      <BottomBar
        navItems={navItems}
        iconOnly={!isSettingsPage}
        variant={isSettingsPage ? "settings" : "default"}
      />
    </div>
  );
}
