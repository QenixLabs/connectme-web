"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Shield, Users, Building2, FolderKanban, Flag, LogOut, MessageSquareWarning, ScrollText, CreditCard, BarChart3 } from "lucide-react";
import { useAuthStore } from "@/providers/auth-store-provider";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, hasHydrated, logout } = useAuthStore();

  useEffect(() => {
    if (!hasHydrated) return;
    if (!user || user.role !== "admin") {
      router.push("/auth/login");
    }
  }, [hasHydrated, user, router]);

  if (!hasHydrated || !user || user.role !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  const navItems = [
    { label: "Artists", href: "/admin/dashboard", icon: Users },
    { label: "Users", href: "/admin/users", icon: Users },
    { label: "Brands", href: "/admin/dashboard", icon: Building2 },
    { label: "Projects", href: "/admin/dashboard", icon: FolderKanban },
    { label: "Reports", href: "/admin/reports", icon: Flag },
    { label: "Appeals", href: "/admin/appeals", icon: MessageSquareWarning },
    { label: "Audit Logs", href: "/admin/audit-logs", icon: ScrollText },
    { label: "Plans", href: "/admin/plans", icon: CreditCard },
    { label: "Subscriptions", href: "/admin/subscriptions", icon: BarChart3 },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Top nav */}
      <header className="border-b border-border">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex items-center justify-between h-14">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-brand" strokeWidth={1.5} />
            <span className="font-medium text-sm">
              {pathname === "/admin/verifications"
              ? "Verification"
              : pathname === "/admin/reports"
                ? "Reports"
                : "Admin Dashboard"}
            </span>
          </div>

          <nav className="hidden sm:flex items-center gap-6">
            {navItems.map((item) => (
              <a
                key={item.label}
                href={item.href}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                {item.label}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-purple-300 to-blue-400 flex items-center justify-center text-[10px] font-medium text-white">
              {user.email?.charAt(0).toUpperCase() || "A"}
            </div>
            <span className="text-sm text-muted-foreground hidden sm:inline">{user.email?.split("@")[0] || "Admin"}</span>
            <button
              onClick={async () => {
                await logout();
                router.push("/auth/login");
              }}
              className="ml-2 p-1.5 rounded-md hover:bg-accent transition-colors"
              title="Logout"
            >
              <LogOut className="w-4 h-4 text-muted-foreground" strokeWidth={1.5} />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6">{children}</main>
    </div>
  );
}
