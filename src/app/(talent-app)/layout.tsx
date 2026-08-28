"use client";

import { TopBar } from "@/components/shared/top-bar";
import { BottomBar } from "@/components/shared/bottom-bar";
import { useTalentNavItems } from "@/hooks/use-talent-nav-items";

export default function TalentAppLayout({ children }: { children: React.ReactNode }) {
  const navItems = useTalentNavItems();

  return (
    <div className="flex min-h-screen flex-col">
      <TopBar navItems={navItems} role="talent" showUserMenu />
      <main className="flex-1 px-4 py-6 pb-24 md:pb-8">{children}</main>
      <BottomBar navItems={navItems} iconOnly />
    </div>
  );
}
