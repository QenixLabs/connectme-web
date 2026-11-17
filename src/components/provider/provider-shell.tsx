"use client";

import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { BottomBar } from "@/components/shared/bottom-bar";
import { TopBar } from "@/components/shared/top-bar";
import { CommunicationFeed } from "@/components/content/communication-feed";
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
  const isListingEditor =
    pathname === "/provider/services/new" ||
    pathname === "/provider/products/new" ||
    ((pathname.startsWith("/provider/services/") ||
      pathname.startsWith("/provider/products/")) &&
      pathname.endsWith("/edit"));

  const isDashboard = pathname === "/provider/dashboard";

  return (
    <div className="flex min-h-screen flex-col bg-[#f7f7fb]">
      <TopBar navItems={providerNavItems} role="provider" showUserMenu />
      <main
        className={cn(
          "mx-auto w-full flex-1 px-3 py-3.5 pb-28 sm:px-6 sm:py-6 md:pb-8",
          isDashboard ? "max-w-xl sm:max-w-2xl" : "max-w-7xl lg:px-8"
        )}
      >
        {isDashboard && <CommunicationFeed />}
        {children}
      </main>
      {!isConversationPage && !isListingEditor && (
        <BottomBar
          navItems={providerBottomNavItems}
          variant="settings"
          activeLabel={
            pathname === "/provider/dashboard"
              ? "Dashboard"
              : pathname.startsWith("/provider/inquiries")
                ? "Inquiries"
                : pathname.startsWith("/provider/listings")
                  ? "Listings"
                  : pathname.startsWith("/provider/profile")
                    ? "More"
                    : undefined
          }
        />
      )}
    </div>
  );
}
