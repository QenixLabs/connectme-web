"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useSyncExternalStore } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  LogOut,
  User,
  CreditCard,
  Settings,
  BarChart3,
  Star,
  UsersRound,
  Users,
  Store,
  Briefcase,
  ClipboardList,
  ShieldCheck,
  Headphones,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/providers/auth-store-provider";
import { talentApi } from "@/lib/api/talent";
import { recruiterApi } from "@/lib/api/recruiter";
import { providersApi } from "@/lib/api/marketplace";
import { MarketplaceNotificationBell } from "@/components/marketplace/marketplace-notification-bell";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { NavItem } from "./nav-config";
import logoImage from "@/assets/morporfile-logo-orange.png";
import { tourReplayEventForRole } from "@/components/onboarding/tour-events";

const subscribe = () => () => {};
const getClientSnapshot = () => true;
const getServerSnapshot = () => false;
const talentTourNavTargets: Record<string, string> = {
  Opportunities: "opportunities-nav",
  Services: "services-nav",
  Network: "network-nav",
  Profile: "profile-nav",
};

interface TopBarProps {
  navItems: NavItem[];
  role: "talent" | "recruiter" | "provider" | "admin";
  showUserMenu?: boolean;
}

export function TopBar({ navItems, role, showUserMenu = false }: TopBarProps) {
  const pathname = usePathname();
  const isMounted = useSyncExternalStore(
    subscribe,
    getClientSnapshot,
    getServerSnapshot,
  );

  if (pathname.startsWith(`/${role}/messages`)) return null;
  if (pathname.match(/^\/talent\/[^/]+\/portfolio(\/|$)/)) return null;
  if (pathname === "/talent/applications") return null;
  if (pathname === "/recruiter/find-talent/ai-search") return null;
  if (pathname.match(/^\/recruiter\/campaigns\/[^/]+\/applications(\/|$)/))
    return null;

  // Talent Search owns its compact mobile header â€” hide the large app bar on
  // small screens so the page matches the reference (desktop keeps nav).
  const hideOnMobile = pathname === "/recruiter/find-talent";
  const hideNav = role === "provider" && pathname === "/provider/dashboard";
  const showSupportShortcut =
    (role === "recruiter" || role === "provider") &&
    pathname === `/${role}/dashboard`;

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full border-b border-border bg-bg-surface/95 backdrop-blur-xl",
        hideOnMobile && "max-md:hidden",
      )}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-3 sm:px-6 lg:px-8">
        <div className="flex items-center gap-1.5 sm:gap-3">
          <Link href={`/${role}/dashboard`} className="flex items-center">
            <Image
              src={logoImage}
              alt="Morporfile"
              height={32}
              className="h-7 w-auto sm:h-9"
              priority
            />
          </Link>
        </div>

        {!hideNav && (
          <nav className="hidden items-center gap-1 rounded-full border border-border bg-bg-surface p-1 md:flex">
            {navItems.map((item) => {
              const active = isMounted && pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  data-tour={role === "talent" ? talentTourNavTargets[item.label] : undefined}
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
        )}

          <div className="flex items-center gap-1">
            {showSupportShortcut && (
              <Button
                asChild
                variant="outline"
                size="sm"
                className="h-9 gap-1.5 rounded-full px-3"
              >
                <Link href={`/${role}/support`} aria-label="Help and support">
                  <Headphones className="size-4" />
                  <span className="hidden sm:inline">Support</span>
                </Link>
              </Button>
            )}
            {showUserMenu && <MarketplaceNotificationBell role={role} />}
            {showUserMenu && <UserMenu role={role} />}
          </div>
        </div>
    </header>
  );
}

function UserMenu({ role }: { role: TopBarProps["role"] }) {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);
  const { data: profile } = useQuery<{ profile_photo?: string; slug?: string }>({
    queryKey:
      role === "talent"
        ? ["talent-profile", "my"]
        : role === "provider"
          ? ["provider-profile", "my"]
          : ["recruiter-profile", "profile"],
    queryFn: async () =>
      role === "talent"
        ? talentApi.getMyProfile()
        : role === "provider"
          ? (await providersApi.getMyProfile()).profile
          : recruiterApi.getMyProfile(),
    enabled: role !== "admin" && !!user,
  });

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
  const hasProviderAccess =
    user?.role === "provider" || user?.account_capabilities?.includes("provider") === true;
  const profileHref =
    role === "recruiter"
      ? profile?.slug
        ? `/recruiter/${profile.slug}`
        : "/recruiter/profile/edit"
      : role === "provider"
        ? "/provider/profile"
        : "/talent/profile";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="size-10 rounded-full hover:bg-surface"
          aria-label="User menu"
          data-tour={role === "talent" ? "profile-menu" : `${role}-profile-menu`}
        >
          <Avatar className="size-8 sm:size-9 border border-border">
            <AvatarImage
              src={profile?.profile_photo}
              alt={`${user?.username || user?.email || "User"} profile photo`}
            />
            <AvatarFallback
              className={cn(
                "text-xs font-semibold",
                role === "provider"
                  ? "bg-[#0b132b] font-bold text-white"
                  : "bg-muted"
              )}
            >
              {role === "provider" && (!user?.username && !user?.email)
                ? "SF"
                : initials}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-56"
        data-tour={role === "talent" ? "profile-menu-content" : `${role}-profile-menu-content`}
      >
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
            {(role === "talent" || role === "recruiter" || role === "provider") && (
              <DropdownMenuItem asChild>
                <Link href={`/${role}/billing`} className="cursor-pointer">
                  <CreditCard className="mr-2 size-4" />
                  Billing
                </Link>
              </DropdownMenuItem>
            )}
            {role === "talent" && (
              <>
                <DropdownMenuItem asChild>
                  <Link href="/talent/profile" className="cursor-pointer">
                    <User className="mr-2 size-4" />
                    Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/talent/verify-documents" className="cursor-pointer">
                    <ShieldCheck className="mr-2 size-4" />
                    Verification
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/talent/support" className="cursor-pointer">
                    <Headphones className="mr-2 size-4" />
                    Help &amp; Support
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="cursor-pointer"
                  onSelect={() => window.dispatchEvent(new Event(tourReplayEventForRole(role)))}
                >
                  <span className="mr-2 size-4" aria-hidden="true">âœ¦</span>
                  Take a tour
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/talent/analytics" className="cursor-pointer">
                    <BarChart3 className="mr-2 size-4" />
                    Analytics
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/talent/reputation" className="cursor-pointer">
                    <Star className="mr-2 size-4" />
                    Reputation
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/talent/requests" className="cursor-pointer">
                    <UsersRound className="mr-2 size-4" />
                    Requests
                  </Link>
                </DropdownMenuItem>
              </>
            )}
            {role === "recruiter" && (
              <>
                <DropdownMenuItem asChild>
                  <Link href={profileHref} className="cursor-pointer">
                    <User className="mr-2 size-4" />
                    Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/recruiter/verify-documents" className="cursor-pointer">
                    <ShieldCheck className="mr-2 size-4" />
                    Verification
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/recruiter/support" className="cursor-pointer">
                    <Headphones className="mr-2 size-4" />
                    Help &amp; Support
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/recruiter/analytics" className="cursor-pointer">
                    <BarChart3 className="mr-2 size-4" />
                    Analytics
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/recruiter/shortlist" className="cursor-pointer">
                    <UsersRound className="mr-2 size-4" />
                    Shortlist
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/recruiter/team" className="cursor-pointer">
                    <Users className="mr-2 size-4" />
                    Team
                  </Link>
                </DropdownMenuItem>
              </>
            )}
            {role === "provider" && (
              <>
                <DropdownMenuItem asChild>
                  <Link href={profileHref} className="cursor-pointer">
                    <User className="mr-2 size-4" />
                    Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/provider/support" className="cursor-pointer">
                    <Headphones className="mr-2 size-4" />
                    Help &amp; Support
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/provider/listings" className="cursor-pointer">
                    <Briefcase className="mr-2 size-4" />
                    Listings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/provider/inquiries" className="cursor-pointer">
                    <ClipboardList className="mr-2 size-4" />
                    Inquiries
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/provider/verify-documents" className="cursor-pointer">
                    <ShieldCheck className="mr-2 size-4" />
                    Verification
                  </Link>
                </DropdownMenuItem>
              </>
            )}
            {(role === "recruiter" || role === "provider") && (
              <DropdownMenuItem
                className="cursor-pointer"
                onSelect={() => window.dispatchEvent(new Event(tourReplayEventForRole(role)))}
              >
                <Sparkles className="mr-2 size-4" aria-hidden="true" />
                Take a tour
              </DropdownMenuItem>
            )}
            {role === "talent" && (
              <DropdownMenuItem asChild>
                <Link href="/talent/settings" className="cursor-pointer">
                  <Settings className="mr-2 size-4" />
                  Settings
                </Link>
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            {(role === "talent" || role === "recruiter") && (
              <DropdownMenuItem asChild>
                <Link
                  href={hasProviderAccess ? "/provider/dashboard" : "/provider/onboarding"}
                  className="cursor-pointer"
                >
                  <Store className="mr-2 size-4" />
                  {hasProviderAccess ? "Provider WorkShop" : "Become a service provider"}
                </Link>
              </DropdownMenuItem>
            )}
            {(role === "talent" || role === "recruiter") && <DropdownMenuSeparator />}
            {role === "provider" &&
              (user?.role === "talent" || user?.role === "recruiter") && (
                <DropdownMenuItem asChild>
                  <Link href={`/${user.role}/dashboard`} className="cursor-pointer">
                    <Store className="mr-2 size-4" />
                    {user.role === "recruiter" ? "Recruiter workspace" : "Talent workspace"}
                  </Link>
                </DropdownMenuItem>
              )}
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
