"use client";

import { usePathname } from "next/navigation";
import { BottomBar } from "@/components/shared/bottom-bar";
import { TopBar } from "@/components/shared/top-bar";
import {
  providerBottomNavItems,
  providerNavItems,
} from "@/components/shared/nav-config";

export function ProviderShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  if (
    pathname.startsWith("/provider/onboarding") ||
    pathname.startsWith("/provider/profile/preview")
  ) {
    return <>{children}</>;
  }

  const isConversationPage = pathname.startsWith("/provider/messages/");
  const isServiceWizard =
    pathname === "/provider/services/new" ||
    (pathname.startsWith("/provider/services/") && pathname.endsWith("/edit"));

  return (
    <div className="flex min-h-screen flex-col bg-[#f7f7fb]">
      <TopBar navItems={providerNavItems} role="provider" showUserMenu />
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-4 pb-20 sm:px-6 sm:py-6 md:pb-8 lg:px-8">
        {children}
      </main>
      {!isConversationPage && !isServiceWizard && (
        <BottomBar
          navItems={providerBottomNavItems}
          variant="settings"
          activeLabel={pathname.startsWith("/provider/profile") ? "Profile" : undefined}
        />
      )}
    </div>
  );
}
