"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Home, Briefcase, MessageSquare, User, Bell } from "lucide-react";
import { notificationsApi } from "@/lib/api";
import { useAuthStore } from "@/providers/auth-store-provider";
import { useSocket } from "@/hooks/use-socket";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

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
  const { user, isAuthenticated, isLoading, fetchUser } =
    useAuthStore();
  const [authChecked, setAuthChecked] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const { socket } = useSocket();

  useEffect(() => {
    if (!isAuthenticated) {
      fetchUser().finally(() => setAuthChecked(true));
    } else {
      setAuthChecked(true);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated && user) {
      notificationsApi.getUnreadCount().then((count) => setUnreadCount(count));
    }
  }, [isAuthenticated, user, pathname]);

  useEffect(() => {
    if (!socket) return;

    const handleNotification = (notification: { title?: string; body?: string }) => {
      setUnreadCount((prev) => prev + 1);
      toast.info(notification.title || "New notification", {
        description: notification.body,
      });
    };

    socket.on("notification:new", handleNotification);

    return () => {
      socket.off("notification:new", handleNotification);
    };
  }, [socket]);

  useEffect(() => {
    if (authChecked && !isLoading && !isAuthenticated) {
      router.push("/auth/login");
    }
  }, [authChecked, isLoading, isAuthenticated, router]);

  useEffect(() => {
    if (authChecked && !isLoading && user && user.role !== role) {
      const fallback =
        user.role === "talent"
          ? "/talent/dashboard"
          : user.role === "recruiter"
            ? "/recruiter/dashboard"
            : "/auth/login";
      router.push(fallback);
    }
  }, [authChecked, isLoading, user, role, router]);

  const roleMismatch = user ? user.role !== role : false;

  if (!authChecked || isLoading || !user || roleMismatch) {
    return (
      <div className="min-h-screen bg-page flex flex-col">
        <header className="bg-card border-b border-border px-4 py-3 sticky top-0 z-40">
          <div className="max-w-3xl mx-auto flex items-center justify-between">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-8 w-8 rounded-full" />
          </div>
        </header>
        <main className="flex-1 p-4 max-w-3xl mx-auto w-full">
          <div className="space-y-4 pt-4">
            <Skeleton className="h-32 w-full rounded-2xl" />
            <Skeleton className="h-24 w-full rounded-2xl" />
            <Skeleton className="h-24 w-full rounded-2xl" />
          </div>
        </main>
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
          <Link
            href={`/${role}/notifications`}
            className="relative p-2 text-text-muted hover:text-text-secondary transition-colors"
          >
            <Bell className="w-5 h-5" strokeWidth={1.5} />
            {unreadCount > 0 && (
              <span className="absolute top-0.5 right-0.5 min-w-[18px] h-[18px] flex items-center justify-center bg-destructive text-white text-[10px] font-bold rounded-full px-1">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </Link>
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
