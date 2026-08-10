import { TopBar } from "@/components/shared/top-bar";
import { adminNavItems } from "@/components/shared/nav-config";

export default function AdminAppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <TopBar navItems={adminNavItems} role="admin" />
      <main className="flex-1">{children}</main>
    </div>
  );
}
