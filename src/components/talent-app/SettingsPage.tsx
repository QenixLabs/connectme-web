"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type ReactNode } from "react";
import { toast } from "sonner";
import {
  ArrowLeft,
  BadgeCheck,
  Bell,
  Briefcase,
  Camera,
  CheckCircle2,
  ChevronRight,
  HelpCircle,
  Instagram,
  Link2,
  Linkedin,
  LockKeyhole,
  LogOut,
  MapPin,
  Mail,
  Shield,
  ShieldCheck,
  Smartphone,
  UserRound,
  X as XIcon,
  Youtube,
} from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useUnreadNotifications } from "@/hooks/use-unread-counts";
import { useMyProfile } from "@/hooks/use-talent-profile";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/providers/auth-store-provider";
import logoImage from "@/assets/rootin-logo-orange.png";

import { ChangePasswordDialog } from "./settings/change-password-dialog";
import { VerifyPhoneDialog } from "./settings/verify-phone-dialog";

type SettingTone = "purple" | "red";

const toneClasses: Record<SettingTone, string> = {
  purple: "bg-[#f1eaff] text-[#7635ee]",
  red: "bg-[#fff0f0] text-[#e3262e]",
};

function SettingIcon({
  tone = "purple",
  children,
}: {
  tone?: SettingTone;
  children: ReactNode;
}) {
  return (
    <span
      className={cn(
        "grid size-12 shrink-0 place-items-center rounded-full sm:size-[52px]",
        toneClasses[tone],
      )}
    >
      {children}
    </span>
  );
}

function VerifiedLabel({
  children = "Verified",
  pill = false,
}: {
  children?: ReactNode;
  pill?: boolean;
}) {
  return (
    <Badge
      variant="outline"
      className={cn(
        "inline-flex shrink-0 items-center gap-1.5 border-0 bg-transparent px-0 py-0 text-sm font-medium text-[#08a767] sm:text-base",
        pill && "border border-[#b8efd4] bg-[#edfff5] px-3 py-2",
      )}
    >
      <CheckCircle2 className="size-5 fill-[#08a767] text-white" />
      {children}
    </Badge>
  );
}

function SettingRow({
  icon,
  title,
  description,
  action,
  href,
  onClick,
  className,
}: {
  icon: ReactNode;
  title: string;
  description: string;
  action?: ReactNode;
  href?: string;
  onClick?: () => void;
  className?: string;
}) {
  const content = (
    <>
      {icon}
      <span className="min-w-0 flex-1 text-left">
        <span className="block truncate text-[16px] font-bold leading-5 text-[#151b4c] sm:text-[18px]">
          {title}
        </span>
        <span className="mt-1 block truncate text-[13px] leading-5 text-[#5e5b8c] sm:text-[15px]">
          {description}
        </span>
      </span>
      {action && <span className="hidden shrink-0 items-center sm:flex">{action}</span>}
      <ChevronRight className="size-6 shrink-0 text-[#7835ec]" strokeWidth={2.25} />
    </>
  );

  const rowClassName = cn(
    "flex min-h-[76px] w-full items-center justify-start gap-3 border-b border-[#ebe8f6] px-4 py-3 transition-colors last:border-b-0 sm:min-h-[84px] sm:gap-4 sm:px-6",
    "hover:bg-[#fcfbff] focus-visible:z-10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#7835ec]",
    className,
  );

  if (href) {
    return (
      <Link href={href} className={rowClassName}>
        {content}
      </Link>
    );
  }

  if (onClick) {
    return (
      <Button
        type="button"
        variant="ghost"
        onClick={onClick}
        className={cn(rowClassName, "h-auto rounded-none p-0 hover:bg-[#fcfbff]")}
      >
        {content}
      </Button>
    );
  }

  return <div className={rowClassName}>{content}</div>;
}

function SocialCircle({
  className,
  children,
}: {
  className: string;
  children: ReactNode;
}) {
  return (
    <span className={cn("grid size-8 place-items-center rounded-full text-white", className)}>
      {children}
    </span>
  );
}

export function SettingsPage() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const profileQuery = useMyProfile();
  const notificationQuery = useUnreadNotifications(!!user);
  const [passwordOpen, setPasswordOpen] = useState(false);
  const [phoneVerifyOpen, setPhoneVerifyOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const profile = profileQuery.data;
  const displayName = profile?.full_legal_name || user?.username || "Ananya Kapoor";
  const initials = displayName
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  const professions = profile?.professions?.length
    ? profile.professions.slice(0, 3)
    : ["Actor", "Model", "Creator"];
  const location =
    [profile?.location?.city, profile?.location?.country].filter(Boolean).join(", ") ||
    "Mumbai, India";
  const email = user?.email || "ananya.kapoor@gmail.com";
  const phone = user?.phone || "+91 98765 43210";
  const connectedAccounts =
    Object.values(profile?.social_links ?? {}).filter((account) => account?.url).length || 4;
  const notificationCount = notificationQuery.data?.count ?? 0;
  const isVerified = profile?.is_verified ?? (user?.verification_tier ?? 0) >= 2;

  async function handleLogout() {
    setIsLoggingOut(true);
    try {
      await logout();
      router.push("/auth/login");
    } finally {
      setIsLoggingOut(false);
    }
  }

  function showComingSoon(label: string) {
    toast.info(`${label} settings are coming soon`);
  }

  return (
    <div className="talent-settings-theme relative min-h-svh overflow-hidden bg-[#faf9ff] text-[#151b4c]">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-36 top-24 size-[300px] rounded-full bg-[#e3caff]/35 blur-3xl" />
        <div className="absolute right-[-150px] top-8 size-[360px] rounded-full bg-[#d9e8ff]/45 blur-3xl" />
        <div className="absolute -right-32 bottom-36 size-[320px] rounded-full bg-[#e5caff]/30 blur-3xl" />
      </div>

      <div className="relative mx-auto w-full max-w-[980px] px-4 pb-32 pt-4 sm:px-6 sm:pt-5 lg:px-8">
        <header>
          <div className="flex items-center justify-between gap-4">
            <Link href="/talent/dashboard" className="inline-flex items-center rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7835ec]">
              <Image
                src={logoImage}
                alt="Rootin"
                priority
                className="h-10 w-auto object-contain sm:h-12"
                style={{ filter: "hue-rotate(200deg) saturate(1.35)" }}
              />
            </Link>

            <div className="flex items-center gap-2 sm:gap-3">
              <Button
                asChild
                variant="ghost"
                size="icon"
                className="relative size-11 rounded-full text-[#151b4c] hover:bg-white/75"
                aria-label="Notifications"
              >
                <Link href="/talent/notifications">
                  <Bell className="size-6" strokeWidth={1.9} />
                  {notificationCount > 0 && (
                    <Badge className="absolute right-0 top-0 grid size-5 place-items-center rounded-full border-0 bg-[#f02538] p-0 text-[11px] font-bold text-white ring-2 ring-[#faf9ff]">
                      {notificationCount > 9 ? "9+" : notificationCount}
                    </Badge>
                  )}
                </Link>
              </Button>
              <Link
                href="/talent/profile"
                className="rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7835ec]"
                aria-label="Open profile"
              >
                <Avatar className="size-11 border-2 border-white bg-[#eee8ff] shadow-[0_5px_18px_rgba(95,66,180,0.13)] sm:size-14">
                  <AvatarImage src={profile?.profile_photo} alt={`${displayName} profile photo`} />
                  <AvatarFallback className="bg-[#eee8ff] text-sm font-bold text-[#7131e9]">
                    {initials || "AK"}
                  </AvatarFallback>
                </Avatar>
              </Link>
            </div>
          </div>

          <div className="mt-6 flex items-start gap-3 sm:mt-8 sm:gap-5">
            <Button
              asChild
              variant="ghost"
              size="icon"
              className="mt-1 size-12 shrink-0 rounded-full border border-[#e3d8ff] bg-[#f3edff] text-[#7434eb] shadow-[0_4px_14px_rgba(113,55,220,0.08)] hover:bg-[#ece3ff]"
              aria-label="Back to profile"
            >
              <Link href="/talent/profile">
                <ArrowLeft className="size-7" strokeWidth={1.8} />
              </Link>
            </Button>
            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h1 className="font-display text-[30px] font-bold leading-[1.05] tracking-[-0.04em] text-[#121846] sm:text-[48px]">
                    Account Settings
                  </h1>
                  <p className="mt-2 text-[15px] leading-6 text-[#4e4d80] sm:text-[22px] sm:leading-7">
                    Manage your account, security and preferences.
                  </p>
                </div>
                <p className="hidden shrink-0 pt-1 text-right font-script text-[27px] leading-[0.9] text-[#1e1792] sm:block sm:text-[34px]">
                  Your Talent
                  <br />
                  Your Control.
                </p>
              </div>
            </div>
          </div>
        </header>

        <main className="mt-7 space-y-4 sm:mt-8 sm:space-y-5">
          <Card className="relative overflow-hidden rounded-[20px] border-[#e4ddf8] bg-white/90 p-4 shadow-[0_10px_30px_rgba(69,47,160,0.08)] backdrop-blur sm:p-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-5">
              <Link
                href="/talent/profile"
                className="relative mx-auto shrink-0 rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7835ec] sm:mx-0"
                aria-label="Edit profile photo"
              >
                <Avatar className="size-[104px] border-4 border-white bg-[#eee8ff] shadow-[0_6px_22px_rgba(71,42,155,0.16)] sm:size-[132px]">
                  <AvatarImage src={profile?.profile_photo} alt={`${displayName} profile photo`} />
                  <AvatarFallback className="bg-gradient-to-br from-[#f0d7c7] via-[#e9c3b1] to-[#8b4b3a] text-2xl font-bold text-[#4e2b2b]">
                    {initials || "AK"}
                  </AvatarFallback>
                </Avatar>
                <span className="absolute bottom-0 right-0 grid size-10 place-items-center rounded-full border-2 border-white bg-[#8038ed] text-white shadow-[0_4px_12px_rgba(95,35,220,0.25)] sm:size-11">
                  <Camera className="size-5" strokeWidth={2} />
                </span>
              </Link>

              <div className="min-w-0 flex-1 text-center sm:text-left">
                <div className="flex items-center justify-center gap-2 sm:justify-start">
                  <h2 className="truncate text-[22px] font-bold tracking-[-0.02em] text-[#151b4c] sm:text-[29px]">
                    {displayName}
                  </h2>
                  {isVerified && <BadgeCheck className="size-6 shrink-0 fill-[#1fa6f4] text-white sm:size-7" />}
                </div>
                <div className="mt-1 flex flex-wrap items-center justify-center gap-x-2 text-[14px] text-[#595785] sm:justify-start sm:text-[18px]">
                  {professions.map((profession, index) => (
                    <span key={profession} className="inline-flex items-center gap-2">
                      {profession}
                      {index < professions.length - 1 && <span className="text-[#7d35ee]">|</span>}
                    </span>
                  ))}
                </div>
                <div className="mt-2 flex items-center justify-center gap-2 text-[14px] text-[#595785] sm:justify-start sm:text-[17px]">
                  <MapPin className="size-5 text-[#7d35ee]" fill="currentColor" strokeWidth={1.5} />
                  {location}
                </div>
              </div>

              <Button
                asChild
                variant="outline"
                className="h-12 rounded-xl border-2 border-[#9c63ff] bg-white px-6 text-[15px] font-bold text-[#7434eb] shadow-none hover:bg-[#f8f2ff] sm:h-14 sm:min-w-[170px] sm:text-[17px]"
              >
                <Link href="/talent/profile">Edit Profile</Link>
              </Button>
            </div>
          </Card>

          <Card className="overflow-hidden rounded-[19px] border-[#e4ddf8] bg-white/90 py-0 shadow-[0_10px_30px_rgba(69,47,160,0.06)] backdrop-blur">
            <SettingRow
              href="/talent/profile"
              icon={
                <SettingIcon>
                  <UserRound className="size-6" strokeWidth={1.8} />
                </SettingIcon>
              }
              title="Personal Information"
              description="Name, Date of Birth, Gender, Location, Bio"
              action={<span className="text-sm text-[#5b5789]">Manage your basic details</span>}
            />
            <SettingRow
              href="/talent/profile"
              icon={
                <SettingIcon>
                  <Mail className="size-6" strokeWidth={1.8} />
                </SettingIcon>
              }
              title="Email"
              description={email}
              action={user?.is_email_verified ? <VerifiedLabel /> : <span className="text-sm font-medium text-[#e87913]">Verify</span>}
            />
            <SettingRow
              href={user?.is_phone_verified ? "/talent/profile" : undefined}
              onClick={user?.is_phone_verified ? undefined : () => setPhoneVerifyOpen(true)}
              icon={
                <SettingIcon>
                  <Smartphone className="size-6" strokeWidth={1.8} />
                </SettingIcon>
              }
              title="Mobile"
              description={phone}
              action={user?.is_phone_verified ? <VerifiedLabel /> : <span className="text-sm font-medium text-[#e87913]">Verify</span>}
            />
            <SettingRow
              onClick={() => setPasswordOpen(true)}
              icon={
                <SettingIcon>
                  <LockKeyhole className="size-6" strokeWidth={1.8} />
                </SettingIcon>
              }
              title="Password"
              description="Update your password regularly"
            />
          </Card>

          <Card className="overflow-hidden rounded-[19px] border-[#e4ddf8] bg-white/90 py-0 shadow-[0_10px_30px_rgba(69,47,160,0.06)] backdrop-blur">
            <SettingRow
              onClick={() => showComingSoon("Login & Security")}
              icon={
                <SettingIcon>
                  <ShieldCheck className="size-6" strokeWidth={1.8} />
                </SettingIcon>
              }
              title="Login & Security"
              description="Two-step verification, login activity, devices"
            />
            <SettingRow
              onClick={() => showComingSoon("Connected Accounts")}
              icon={
                <SettingIcon>
                  <Link2 className="size-6" strokeWidth={1.8} />
                </SettingIcon>
              }
              title="Connected Accounts"
              description="Link your social media and professional accounts"
              action={
                <span className="flex items-center gap-1.5 text-[12px] text-[#5d5988] sm:text-sm">
                  <span className="flex -space-x-1.5">
                    <SocialCircle className="bg-gradient-to-br from-[#f7b34a] via-[#ea3d80] to-[#7038d8]"><Instagram className="size-4" /></SocialCircle>
                    <SocialCircle className="bg-[#f0242c]"><Youtube className="size-4" /></SocialCircle>
                    <SocialCircle className="bg-[#1177a9]"><Linkedin className="size-4" /></SocialCircle>
                    <SocialCircle className="bg-black"><XIcon className="size-4" /></SocialCircle>
                  </span>
                  <span className="ml-1 whitespace-nowrap">{connectedAccounts} connected</span>
                </span>
              }
            />
          </Card>

          <Card className="overflow-hidden rounded-[19px] border-[#e4ddf8] bg-white/90 py-0 shadow-[0_10px_30px_rgba(69,47,160,0.06)] backdrop-blur">
            <SettingRow
              href="/talent/profile"
              icon={
                <SettingIcon>
                  <Briefcase className="size-6" strokeWidth={1.8} />
                </SettingIcon>
              }
              title="Professional Identity"
              description="Profession, skills, experience, verified documents"
            />
            <SettingRow
              href="/talent/verify-documents"
              icon={
                <SettingIcon>
                  <BadgeCheck className="size-6" strokeWidth={1.8} />
                </SettingIcon>
              }
              title="Account Status"
              description="Verification status, subscription, account health"
              action={isVerified ? <VerifiedLabel pill>Verified Talent</VerifiedLabel> : <span className="text-sm text-[#5b5789]">Review status</span>}
            />
          </Card>

          <Card className="overflow-hidden rounded-[19px] border-[#e4ddf8] bg-white/90 py-0 shadow-[0_10px_30px_rgba(69,47,160,0.06)] backdrop-blur">
            <SettingRow
              href="/talent/notifications"
              icon={
                <SettingIcon>
                  <Bell className="size-6" strokeWidth={1.8} />
                </SettingIcon>
              }
              title="Notifications & Preferences"
              description="Email, push notifications, communication preferences"
            />
            <SettingRow
              onClick={() => showComingSoon("Privacy & Data")}
              icon={
                <SettingIcon>
                  <Shield className="size-6" strokeWidth={1.8} />
                </SettingIcon>
              }
              title="Privacy & Data"
              description="Control your data and privacy settings"
            />
            <SettingRow
              href="/talent/support"
              icon={
                <SettingIcon>
                  <HelpCircle className="size-6" strokeWidth={1.8} />
                </SettingIcon>
              }
              title="Help & Support"
              description="Get help or contact our support team"
            />
          </Card>

          <Button
            type="button"
            variant="ghost"
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="flex min-h-[78px] w-full items-center justify-start gap-3 rounded-[19px] border border-[#ffb9be] bg-[#fff8f8] px-4 py-3 text-left shadow-[0_7px_22px_rgba(225,42,53,0.04)] hover:bg-[#fff0f1] sm:gap-4 sm:px-6"
          >
            <SettingIcon tone="red">
              <LogOut className="size-6" strokeWidth={1.8} />
            </SettingIcon>
            <span className="min-w-0 flex-1">
              <span className="block text-[17px] font-bold leading-5 text-[#e3262e] sm:text-[19px]">Logout</span>
              <span className="mt-1 block text-[13px] leading-5 text-[#5e5b8c] sm:text-[15px]">Sign out from your Rootin account</span>
            </span>
            <ChevronRight className="size-6 shrink-0 text-[#e3262e]" strokeWidth={2.25} />
          </Button>

          <div className="overflow-hidden rounded-[20px] border border-[#e2dcfa] bg-white shadow-[0_10px_30px_rgba(69,47,160,0.08)]">
            <Image
              src="/assets/talent-edit/talent-setting-bottom.png"
              alt="Same passion. Bigger opportunities."
              width={941}
              height={160}
              className="h-auto w-full object-cover"
            />
          </div>
        </main>
      </div>

      <ChangePasswordDialog open={passwordOpen} onOpenChange={setPasswordOpen} />
      <VerifyPhoneDialog
        open={phoneVerifyOpen}
        onOpenChange={setPhoneVerifyOpen}
        phone={user?.phone ?? phone}
      />
    </div>
  );
}
