"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Home, Briefcase, MessageSquare, User } from "lucide-react";
import { useAuthStore } from "@/stores/auth-store";
import { cn } from "@/lib/utils";

export interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
}

const NAV_ITEMS_BY_ROLE: Record<"talent" | "recruiter", NavItem[]> = {
  talent: [
    { href: "/talent/dashboard", label: "Home", icon: Home },
    { href: "/talent/opportunities", label: "Jobs", icon: Briefcase },
    { href: "/talent/messages", label: "Messages", icon: MessageSquare },
    { href: "/talent/profile", label: "Profile", icon: User },
  ],
  recruiter: [
    { href: "/recruiter/dashboard", label: "Home", icon: Home },
    { href: "/recruiter/campaigns", label: "Campaigns", icon: Briefcase },
    { href: "/recruiter/messages", label: "Messages", icon: MessageSquare },
    { href: "/recruiter/profile", label: "Profile", icon: User },
  ],
};

interface DashboardLayoutProps {
  children: React.ReactNode;
  role: "talent" | "recruiter";
  homeHref: string;
}

export function DashboardLayout({
  children,
  role,
  homeHref,
}: DashboardLayoutProps) {
  const navItems = NAV_ITEMS_BY_ROLE[role];
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAuthenticated, isLoading, fetchUser, logout } =
    useAuthStore();
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      fetchUser().finally(() => setAuthChecked(true));
    } else {
      setAuthChecked(true);
    }
  }, []);

  useEffect(() => {
    if (authChecked && !isLoading && !isAuthenticated) {
      router.push("/auth/login");
    }
  }, [authChecked, isLoading, isAuthenticated, router]);

  if (!authChecked || isLoading || !user) {
    return (
      <div className="min-h-screen bg-page flex items-center justify-center">
        <div className="text-text-muted">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-page flex flex-col">
      <header className="bg-card border-b border-border px-4 py-3 sticky top-0 z-40">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <Link
            href={homeHref}
            className="text-lg font-bold text-text-primary"
          >
            Connect<span className="text-brand">Me</span>
          </Link>
          <button
            onClick={() => logout()}
            className="text-xs text-text-muted hover:text-text-secondary font-medium"
          >
            Logout
          </button>
        </div>
      </header>

      <main className="flex-1 max-w-3xl w-full mx-auto px-4 py-6 pb-24">
        {children}
      </main>

      <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border z-50 safe-area-pb">
        <div className="max-w-3xl mx-auto flex items-center justify-around h-16">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex flex-col items-center justify-center gap-0.5 w-full h-full transition-colors",
                  isActive
                    ? "text-brand"
                    : "text-text-muted hover:text-text-secondary"
                )}
              >
                <Icon
                  className={cn("w-5 h-5", isActive ? "text-brand" : "")}
                  strokeWidth={1.5}
                />
                <span className="text-2xs font-medium">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
