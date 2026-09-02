"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { LogOut, Bell, User, CreditCard } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/providers/auth-store-provider";
import { useUnreadNotifications } from "@/hooks/use-unread-counts";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { NavItem } from "./nav-config";
import logoImage from "@/assets/rootin-logo-orange.png";

interface TopBarProps {
  navItems: NavItem[];
  role: "talent" | "recruiter" | "admin";
  showUserMenu?: boolean;
}

export function TopBar({ navItems, role, showUserMenu = false }: TopBarProps) {
  const pathname = usePathname();

  if (pathname.startsWith(`/${role}/messages`)) return null;
  if (pathname.match(/^\/talent\/[^/]+\/portfolio(\/|$)/)) return null;

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-bg-surface/95 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href={`/${role}/dashboard`} className="flex items-center">
          <Image
            src={logoImage}
            alt="RootIn"
            height={32}
            className="h-10 w-auto"
            priority
          />
        </Link>

        <nav className="hidden items-center gap-1 rounded-full border border-border bg-bg-surface p-1 md:flex">
          {navItems.map((item) => {
            const active = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "relative rounded-full px-4 py-1.5 text-sm font-medium transition-all duration-200",
                  active
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-1">
          {showUserMenu && <NotificationBell role={role} />}
          {showUserMenu && <UserMenu role={role} />}
        </div>
      </div>
    </header>
  );
}

function NotificationBell({ role }: { role: TopBarProps["role"] }) {
  const { data } = useUnreadNotifications();
  const count = data?.count ?? 0;

  return (
    <Button
      asChild
      variant="ghost"
      size="icon"
      className="relative size-10 rounded-full text-muted-foreground hover:bg-surface hover:text-foreground"
      aria-label="Notifications"
    >
      <Link href={`/${role}/notifications`}>
        <Bell className="size-5" />
        {count > 0 && (
          <Badge className="pointer-events-none absolute -top-0.5 -right-0.5 flex size-4 items-center justify-center rounded-full bg-badge-red p-0 text-[10px] font-semibold text-white">
            {count > 9 ? "9+" : count}
          </Badge>
        )}
      </Link>
    </Button>
  );
}

function UserMenu({ role }: { role: TopBarProps["role"] }) {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);

  const handleLogout = async () => {
    setIsPending(true);
    try {
      await logout();
    } finally {
      router.push("/auth/login");
    }
  };

  const initials =
    user?.username?.slice(0, 2).toUpperCase() ||
    user?.email?.slice(0, 2).toUpperCase() ||
    "ME";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="size-10 rounded-full hover:bg-surface"
          aria-label="User menu"
        >
          <Avatar className="size-8 border border-border">
            <AvatarFallback className="bg-muted text-xs font-semibold">
              {initials}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium">
              {user?.username || user?.email || "User"}
            </p>
            <p className="text-xs text-muted-foreground">{user?.email}</p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {role !== "admin" && (
          <>
            <DropdownMenuItem asChild>
              <Link href={`/${role}/profile`} className="cursor-pointer">
                <User className="mr-2 size-4" />
                Profile
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href={`/${role}/billing`} className="cursor-pointer">
                <CreditCard className="mr-2 size-4" />
                Billing
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
          </>
        )}
        <DropdownMenuItem
          onSelect={handleLogout}
          disabled={isPending}
          className="cursor-pointer text-destructive focus:text-destructive"
        >
          <LogOut className="mr-2 size-4" />
          {isPending ? "Logging out..." : "Log out"}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
