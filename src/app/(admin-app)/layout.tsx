"use client";

import { useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import Image from "next/image";
import {
  LayoutDashboard,
  Users,
  Gavel,
  ShieldCheck,
  Flag,
  MessageSquareWarning,
  ScrollText,
  CreditCard,
  BarChart3,
  Image as ImageIcon,
  Clock,
  KeyRound,
  Headphones,
  TicketPercent,
  Gift,
  LogOut,
  Megaphone,
  FileText,
} from "lucide-react";
import { useAuthStore } from "@/providers/auth-store-provider";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";

import rootinLogo from "@/assets/rootin-logo-orange.png";
import { CommunicationFeed } from "@/components/content/communication-feed";
import { MarketplaceNotificationBell } from "@/components/marketplace/marketplace-notification-bell";

const navigation = [
  {
    title: "Main",
    items: [{ label: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard, permission: "dashboard.view" }],
  },
  {
    title: "Management",
    items: [
      { label: "Users", href: "/admin/users", icon: Users, permission: "users.view" },
      { label: "Free upgrades", href: "/admin/free-upgrades", icon: Gift, permission: "subscriptions.manage" },
      { label: "Talent overview", href: "/admin/talents", icon: Users, permission: "users.view" },
      { label: "Provider overview", href: "/admin/providers", icon: Users, permission: "users.view" },
      { label: "Recruiter overview", href: "/admin/recruiters", icon: Users, permission: "users.view" },
      { label: "Bulk Moderation", href: "/admin/moderation", icon: Gavel, permission: ["moderation.warn", "moderation.suspend", "moderation.ban", "moderation.unrestrict", "moderation.mark_safe"] },
      { label: "Verifications", href: "/admin/verifications", icon: ShieldCheck, permission: "verifications.view" },
    ],
  },
  {
    title: "Moderation",
    items: [
      { label: "Reports", href: "/admin/reports", icon: Flag, permission: "reports.view" },
      { label: "Appeals", href: "/admin/appeals", icon: MessageSquareWarning, permission: "reports.view" },
      { label: "Support", href: "/admin/support", icon: Headphones, permission: "reports.view" },
      { label: "Portfolio", href: "/admin/portfolio", icon: ImageIcon, permission: "portfolio.view" },
    ],
  },
  {
    title: "System",
    items: [
      { label: "Admin access", href: "/admin/admin-access", icon: KeyRound, permission: "admins.manage" },
      { label: "Audit Logs", href: "/admin/audit-logs", icon: ScrollText, permission: "audit_logs.view" },
      { label: "Communication", href: "/admin/communication", icon: Megaphone, permission: "admins.manage" },
      { label: "Terms & Conditions", href: "/admin/terms-and-conditions", icon: FileText, permission: "admins.manage" },
      { label: "Plans", href: "/admin/plans", icon: CreditCard, permission: "subscriptions.manage" },
      { label: "Subscriptions", href: "/admin/subscriptions", icon: BarChart3, permission: "subscriptions.view" },
      { label: "Coupons", href: "/admin/coupons", icon: TicketPercent, permission: "subscriptions.manage" },
      { label: "Cron Jobs", href: "/admin/cron-jobs", icon: Clock, permission: "admins.manage" },
      { label: "OTP Test", href: "/admin/otp-test", icon: KeyRound, permission: "admins.manage" },
    ],
  },
];

const pageTitles: Record<string, string> = {
  "/admin/dashboard": "Dashboard",
  "/admin/users": "Users",
  "/admin/free-upgrades": "Free upgrades",
  "/admin/talents": "Talent overview",
  "/admin/providers": "Provider overview",
  "/admin/recruiters": "Recruiter overview",
  "/admin/moderation": "Bulk Moderation",
  "/admin/verifications": "Verifications",
  "/admin/reports": "Reports",
  "/admin/appeals": "Appeals",
  "/admin/support": "Support",
  "/admin/audit-logs": "Audit Logs",
  "/admin/admin-access": "Admin access",
  "/admin/communication": "Communication",
  "/admin/notifications": "Notifications",
  "/admin/terms-and-conditions": "Terms & Conditions",
  "/admin/plans": "Plans",
  "/admin/subscriptions": "Subscriptions",
  "/admin/coupons": "Coupons",
  "/admin/portfolio": "Portfolio",
  "/admin/cron-jobs": "Cron Jobs",
  "/admin/otp-test": "OTP Test",
};

function getPageTitle(pathname: string): string {
  for (const [prefix, title] of Object.entries(pageTitles)) {
    if (pathname.startsWith(prefix)) return title;
  }
  return "Admin";
}

function isActive(pathname: string, href: string): boolean {
  if (href === "/admin/dashboard") return pathname === "/admin/dashboard";
  return pathname.startsWith(href);
}

function canAccess(user: { admin_level?: string; admin_permissions?: string[] }, permission?: string | string[]) {
  if (!permission || user.admin_level === "super_admin") return true;
  const permissions = user.admin_permissions ?? [];
  return Array.isArray(permission) ? permission.some((item) => permissions.includes(item)) : permissions.includes(permission);
}

function permissionForPath(pathname: string): string | string[] | undefined {
  return navigation.flatMap((group) => group.items).find((item) => pathname === item.href || pathname.startsWith(`${item.href}/`))?.permission;
}

function firstAccessiblePath(user: { admin_level?: string; admin_permissions?: string[] }) {
  return navigation.flatMap((group) => group.items).find((item) => canAccess(user, item.permission))?.href ?? "/auth/login";
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, hasHydrated, logout } = useAuthStore();

  useEffect(() => {
    if (!hasHydrated) return;
    if (!user || user.role !== "admin") {
      router.push("/auth/login");
      return;
    }
    const requiredPermission = permissionForPath(pathname);
    if (!canAccess(user, requiredPermission)) router.replace(firstAccessiblePath(user));
  }, [hasHydrated, user, pathname, router]);

  const handleLogout = useCallback(async () => {
    await logout();
    router.push("/auth/login");
  }, [logout, router]);

  if (!hasHydrated || !user || user.role !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse text-muted-foreground text-sm">Loading...</div>
        </div>
    );
  }

  const userInitial = user.email?.charAt(0).toUpperCase() || "A";
  const userDisplayName = user.email?.split("@")[0] || "Admin";
  const pageTitle = getPageTitle(pathname);

  return (
    <SidebarProvider>
      <Sidebar collapsible="icon">
        <SidebarHeader>
          <div className="flex h-12 items-center gap-2.5 px-2">
            <div className="relative h-8 w-8 shrink-0">
              <Image
                src={rootinLogo}
                alt="RootIn"
                fill
                className="object-contain"
              />
            </div>
            <span className="text-sm font-semibold tracking-tight group-data-[collapsible=icon]:hidden">
              RootIn Admin
            </span>
          </div>
        </SidebarHeader>
        <SidebarContent>
          {navigation.map((group) => (
            <SidebarGroup key={group.title}>
              <SidebarGroupLabel>{group.title}</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {group.items.filter((item) => canAccess(user, item.permission)).map((item) => (
                    <SidebarMenuItem key={item.href}>
                      <SidebarMenuButton
                        asChild
                        isActive={isActive(pathname, item.href)}
                        tooltip={item.label}
                      >
                        <Link href={item.href}>
                          <item.icon strokeWidth={1.5} />
                          <span>{item.label}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          ))}
        </SidebarContent>
        <SidebarFooter>
          <div className="flex items-center gap-3 px-2 py-1.5">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary text-[10px] font-semibold text-primary-foreground">
              {userInitial}
            </div>
            <div className="min-w-0 flex-1 group-data-[collapsible=icon]:hidden">
              <p className="truncate text-xs font-medium">{userDisplayName}</p>
              <p className="truncate text-[10px] text-muted-foreground">Administrator</p>
            </div>
          </div>
        </SidebarFooter>
      </Sidebar>

      <SidebarInset>
        <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-border bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/60 sm:px-6">
          <SidebarTrigger />
          <div className="flex items-center gap-2.5">
            <nav className="hidden items-center gap-1.5 text-sm text-muted-foreground sm:flex">
              <span>Admin</span>
              <span className="text-border">/</span>
              <span className="font-medium text-foreground">{pageTitle}</span>
            </nav>
            <span className="text-sm font-medium text-foreground sm:hidden">{pageTitle}</span>
          </div>

          <div className="ml-auto flex items-center gap-2">
            <MarketplaceNotificationBell role="admin" />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-2 h-8 px-2 -mr-2">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-[9px] font-semibold text-primary-foreground">
                    {userInitial}
                  </div>
                  <span className="text-sm hidden sm:inline">{userDisplayName}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuLabel className="font-normal">
                  <p className="text-sm font-medium">{userDisplayName}</p>
                  <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-destructive cursor-pointer">
                  <LogOut className="mr-2 h-4 w-4" />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-6">{pathname === "/admin/dashboard" && <CommunicationFeed />}{children}</main>
      </SidebarInset>

    </SidebarProvider>
  );
}
