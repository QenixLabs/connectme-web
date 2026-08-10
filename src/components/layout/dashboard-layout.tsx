"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import {
  Home,
  Briefcase,
  MessageSquare,
  User,
  Bell,
  Search,
  LogOut,
  UserCheck,
  Award,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useUnreadCount } from "@/lib/api";
import { useUnreadMessageCount } from "@/lib/api/hooks/use-unread-message-count";
import { useAuthStore } from "@/providers/auth-store-provider";
import { useSocket } from "@/hooks/use-socket";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { usePopup } from "@/hooks/use-popup";
import { useSwipeNavigation } from "@/hooks/use-swipe-navigation";
import { queryKeys } from "@/lib/api/query-keys";
import { redirectToSuspendedPage } from "@/lib/redirect";

export interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
}

const BOTTOM_NAV_ITEMS: Record<"talent" | "recruiter", NavItem[]> = {
  talent: [
    { href: "/talent/dashboard", label: "Home", icon: Home },
    { href: "/talent/opportunities", label: "Jobs", icon: Briefcase },
    { href: "/talent/experience", label: "Experience", icon: Award },
    { href: "/talent/messages", label: "Messages", icon: MessageSquare },
  ],
  recruiter: [
    { href: "/recruiter/dashboard", label: "Home", icon: Home },
    { href: "/recruiter/find-talent", label: "Search", icon: Search },
    { href: "/recruiter/campaigns", label: "Campaigns", icon: Briefcase },
    { href: "/recruiter/requests", label: "Requests", icon: UserCheck },
    { href: "/recruiter/messages", label: "Messages", icon: MessageSquare },
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
  const navItems = BOTTOM_NAV_ITEMS[role];
  const router = useRouter();
  const pathname = usePathname();
  const isMessagesPage = pathname.includes("/messages");
  const isProfilePage = pathname.includes("/profile");
  const isChatPage = /\/messages\/.+/.test(pathname);
  const queryClient = useQueryClient();
  const { user, isAuthenticated, isLoading, fetchUser, logout } =
    useAuthStore();
  const [authChecked, setAuthChecked] = useState(false);
  const { data: unreadCount = 0, refetch: refetchUnread } = useUnreadCount();
  const { data: unreadMessageData } = useUnreadMessageCount();
  const unreadMessageCount = unreadMessageData?.count ?? 0;
  const { socket } = useSocket();
  const { show } = usePopup();
  const { handleTouchStart, handleTouchEnd } = useSwipeNavigation(navItems, pathname);

  useEffect(() => {
    if (!isAuthenticated) {
      fetchUser().finally(() => setAuthChecked(true));
    } else {
      setAuthChecked(true);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated && user) {
      refetchUnread();
    }
  }, [isAuthenticated, user, pathname, refetchUnread]);

  useEffect(() => {
    if (!socket) return;

    const handleNotification = (notification: { title?: string; body?: string; type?: string }) => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      if (notification.type === "moderation_violation") {
        return;
      }
      show({
        title: notification.title || "New notification",
        description: notification.body,
        variant: "info",
        position: "top-right",
      });
    };

    const handleCollaborationRequest = () => {
      queryClient.invalidateQueries({ queryKey: ["collaboration-requests"] });
      show({
        title: "New connection request",
        variant: "info",
        position: "top-right",
      });
    };

    const handleCollaborationAccepted = (data: {
      requestId?: string;
      actorId?: string;
      name?: string;
      username?: string;
      profilePhoto?: string;
      conversationId?: string;
    }) => {
      queryClient.invalidateQueries({ queryKey: ["collaboration-requests"] });
      const displayName = data.name || data.username || "Talent";
      show({
        title: `${displayName} accepted your connection request`,
        variant: "success",
        position: "top-right",
      });
    };

    const handleCollaborationRejected = (data: {
      requestId?: string;
      actorId?: string;
      name?: string;
      username?: string;
      profilePhoto?: string;
    }) => {
      queryClient.invalidateQueries({ queryKey: ["collaboration-requests"] });
      const displayName = data.name || data.username || "Talent";
      show({
        title: `${displayName} declined your connection request`,
        variant: "info",
        position: "top-right",
      });
    };

    const handleNewMessage = (message: {
      content?: string;
      sender_id?: {
        _id?: string;
        full_legal_name?: string;
        username?: string;
        company_name?: string;
        email?: string;
        role?: string;
      };
    }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.messages.unreadCount() });

      if (isMessagesPage) return;
      if (message.sender_id?._id === user?._id) return;

      const sender = message.sender_id;
      const senderName = sender?.role === "recruiter"
        ? sender?.company_name || sender?.full_legal_name || sender?.email
        : sender?.role === "talent"
          ? sender?.username || sender?.full_legal_name || sender?.email
          : sender?.full_legal_name || sender?.username || sender?.company_name || sender?.email;

      show({
        title: senderName ? `New message from ${senderName}` : "New message",
        variant: "info",
        position: "top-right",
      });
    };

    const handleModerationWarning = (data: { type?: string; reason?: string }) => {
      show({
        title: "Content Warning",
        description: data.reason || "Your message contained inappropriate content and was not delivered.",
        variant: "warning",
        position: "top-center",
        duration: 6000,
      });
    };

    const handleModerationSuspension = (data: {
      type?: string;
      reason?: string;
      duration_hours?: number;
      suspended_until?: string;
    }) => {
      show({
        title: "Account Suspended",
        description: data.reason || "Your account has been suspended due to repeated violations.",
        variant: "error",
        position: "top-center",
        duration: 8000,
      });
      redirectToSuspendedPage(data.suspended_until || "", data.reason || "");
    };

    socket.on("notification:new", handleNotification);
    socket.on("collaboration-request:new", handleCollaborationRequest);
    socket.on("collaboration-request:accepted", handleCollaborationAccepted);
    socket.on("collaboration-request:rejected", handleCollaborationRejected);
    socket.on("message:new", handleNewMessage);
    socket.on("moderation:warning", handleModerationWarning);
    socket.on("moderation:suspension", handleModerationSuspension);

    return () => {
      socket.off("notification:new", handleNotification);
      socket.off("collaboration-request:new", handleCollaborationRequest);
      socket.off("collaboration-request:accepted", handleCollaborationAccepted);
      socket.off("collaboration-request:rejected", handleCollaborationRejected);
      socket.off("message:new", handleNewMessage);
      socket.off("moderation:warning", handleModerationWarning);
      socket.off("moderation:suspension", handleModerationSuspension);
    };
  }, [socket, queryClient, isMessagesPage, user, show]);

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

  const hideNav = pathname.includes("/edit") || isChatPage;

  const roleMismatch = user ? user.role !== role : false;

  const handleLogout = useCallback(async () => {
    await logout();
    router.push("/auth/login");
  }, [logout, router]);

  if (!authChecked || isLoading || !user || roleMismatch) {
    return (
      <div className="min-h-screen bg-page flex flex-col">
        <header className="bg-card border-b border-border px-4 py-3 sticky top-0 z-40">
          <div className="max-w-3xl mx-auto flex items-center justify-between">
            <Skeleton className="h-6 w-32" />
            <div className="flex items-center gap-1">
              <Skeleton className="h-8 w-8 rounded-full" />
              <Skeleton className="h-8 w-8 rounded-full" />
            </div>
          </div>
        </header>
        <main className="flex-1 max-w-3xl mx-auto w-full pb-24">
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
      <header className={cn("bg-card border-b border-border px-4 py-3 sticky top-0 z-40 flex items-center gap-3", (isMessagesPage || isProfilePage) && "hidden")}>
        <Link
          href={homeHref}
          className="text-lg font-bold text-text-primary"
        >
          Connect<span className="text-brand">Me</span>
        </Link>
        <div className="flex items-center gap-1 ml-auto">
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
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className={cn(
                  "p-2 transition-colors",
                  pathname === `/${role}/profile`
                    ? "text-brand"
                    : "text-text-muted hover:text-text-secondary"
                )}
              >
                <User className="w-5 h-5" strokeWidth={1.5} />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuItem asChild>
                <Link href={`/${role}/profile`} className="cursor-pointer">
                  Profile
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href={`/${role}/requests`} className="cursor-pointer">
                  Requests
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={handleLogout}
                className="cursor-pointer text-destructive focus:text-destructive"
              >
                <LogOut className="w-4 h-4 mr-2" strokeWidth={1.5} />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      <main
        className={cn(
          "flex-1 w-full touch-pan-y",
          !isMessagesPage && "max-w-3xl mx-auto",
          isMessagesPage
            ? hideNav
              ? "pb-0"
              : "pb-16 md:pb-20"
            : hideNav
              ? "pb-4"
              : "pb-20",
          isMessagesPage && "flex flex-col min-h-0 overflow-hidden",
        )}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {children}
      </main>

      {!hideNav && (
        <nav className="fixed bottom-0 left-0 right-0 bg-card z-50 safe-area-pb rounded-t-2xl border-t border-border shadow-nav">
          <div className="max-w-3xl mx-auto flex items-center justify-around h-16">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              const isMessagesTab = item.label === "Messages";
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex flex-col items-center justify-center gap-1 w-full h-full transition-colors relative",
                    isActive
                      ? "text-brand"
                      : "text-text-muted hover:text-text-secondary"
                  )}
                >
                  <div className="relative">
                    <Icon
                      className={cn("w-5 h-5", isActive ? "text-brand" : "")}
                      strokeWidth={isActive ? 2 : 1.5}
                    />
                    {isMessagesTab && unreadMessageCount > 0 && (
                      <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-destructive rounded-full border-2 border-card" />
                    )}
                  </div>
                  <span className={cn("text-[11px] leading-none", isActive && "font-semibold")}>{item.label}</span>
                </Link>
              );
            })}
          </div>
        </nav>
      )}
    </div>
  );
}
