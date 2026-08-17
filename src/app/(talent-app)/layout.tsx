import { TopBar } from "@/components/shared/top-bar";
import { BottomBar } from "@/components/shared/bottom-bar";
import { talentNavItems } from "@/components/shared/nav-config";

export default function TalentAppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <TopBar navItems={talentNavItems} role="talent" showUserMenu />
      <main className="flex-1 px-4 py-6 pb-24 md:pb-8">{children}</main>
      <BottomBar navItems={talentNavItems} iconOnly />
    </div>
  );
}
