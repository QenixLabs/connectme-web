"use client";

import { useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import {
  Shield,
  LayoutDashboard,
  Users,
  ShieldCheck,
  Flag,
  MessageSquareWarning,
  ScrollText,
  CreditCard,
  BarChart3,
  Image,
  LogOut,
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

const navigation = [
  {
    title: "Main",
    items: [{ label: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard }],
  },
  {
    title: "Management",
    items: [
      { label: "Users", href: "/admin/users", icon: Users },
      { label: "Verifications", href: "/admin/verifications", icon: ShieldCheck },
    ],
  },
  {
    title: "Moderation",
    items: [
      { label: "Reports", href: "/admin/reports", icon: Flag },
      { label: "Appeals", href: "/admin/appeals", icon: MessageSquareWarning },
      { label: "Portfolio", href: "/admin/portfolio", icon: Image },
    ],
  },
  {
    title: "System",
    items: [
      { label: "Audit Logs", href: "/admin/audit-logs", icon: ScrollText },
      { label: "Plans", href: "/admin/plans", icon: CreditCard },
      { label: "Subscriptions", href: "/admin/subscriptions", icon: BarChart3 },
    ],
  },
];

const pageTitles: Record<string, string> = {
  "/admin/dashboard": "Dashboard",
  "/admin/users": "Users",
  "/admin/verifications": "Verifications",
  "/admin/reports": "Reports",
  "/admin/appeals": "Appeals",
  "/admin/audit-logs": "Audit Logs",
  "/admin/plans": "Plans",
  "/admin/subscriptions": "Subscriptions",
  "/admin/portfolio": "Portfolio",
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

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, hasHydrated, logout } = useAuthStore();

  useEffect(() => {
    if (!hasHydrated) return;
    if (!user || user.role !== "admin") {
      router.push("/auth/login");
    }
  }, [hasHydrated, user, router]);

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
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10">
              <Shield className="h-[18px] w-[18px] text-primary" strokeWidth={1.5} />
            </div>
            <span className="text-sm font-semibold tracking-tight group-data-[collapsible=icon]:hidden">
              Admin Panel
            </span>
          </div>
        </SidebarHeader>
        <SidebarContent>
          {navigation.map((group) => (
            <SidebarGroup key={group.title}>
              <SidebarGroupLabel>{group.title}</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {group.items.map((item) => (
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
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-400 to-blue-500 text-[10px] font-semibold text-white">
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

          <div className="ml-auto">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-2 h-8 px-2 -mr-2">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-indigo-400 to-blue-500 text-[9px] font-semibold text-white">
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

        <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-6">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
