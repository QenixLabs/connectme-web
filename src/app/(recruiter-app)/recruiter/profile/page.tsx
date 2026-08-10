"use client";

import Link from "next/link";
import {
  Settings,
  Building2,
  ChevronRight,
  BadgeCheck,
  TrendingUp,
  Star,
  Bell,
  CreditCard,
  ShieldCheck,
  MessageSquare,
  CalendarDays,
  ExternalLink,
} from "lucide-react";
import { useAuthStore } from "@/providers/auth-store-provider";
import {
  useRecruiterProfile,
  useRecruiterSubscription,
  useRecruiterUsage,
  useUnreadNotificationCount,
  useUnreadMessageCount,
} from "@/hooks/use-recruiter-profile";

function TrustRing({ score }: { score: number }) {
  const r = 42;
  const c = 2 * Math.PI * r;
  return (
    <div className="relative h-28 w-28 shrink-0">
      <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
        <circle
          cx="50"
          cy="50"
          r={r}
          fill="none"
          strokeWidth="6"
          className="stroke-slate-800"
        />
        <circle
          cx="50"
          cy="50"
          r={r}
          fill="none"
          strokeWidth="6"
          strokeLinecap="round"
          className="stroke-teal-500"
          strokeDasharray={c}
          strokeDashoffset={c - (c * score) / 100}
        />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center text-3xl font-bold text-white">
        {score}
      </span>
    </div>
  );
}

function getTrustLabel(score: number): string {
  if (score >= 80) return "Excellent";
  if (score >= 60) return "Good";
  if (score >= 40) return "Fair";
  return "Needs improvement";
}

function getTrustStars(score: number): number {
  if (score >= 80) return 5;
  if (score >= 60) return 4;
  if (score >= 40) return 3;
  if (score >= 20) return 2;
  return 1;
}

function getVerificationDisplay(
  tier: number,
  status: string,
): { label: string; sublabel: string; verified: boolean } {
  if (status === "enterprise" || status === "trusted_partner") {
    return {
      label: "Fully Verified",
      sublabel: `Tier ${tier} · All verifications complete`,
      verified: true,
    };
  }
  if (status === "basic") {
    return {
      label: "Basic Verified",
      sublabel: `Tier ${tier} · Basic verification`,
      verified: true,
    };
  }
  return {
    label: "Verification Pending",
    sublabel: `Tier ${tier} · Complete verification to unlock features`,
    verified: false,
  };
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function SkeletonBlock({ className }: { className?: string }) {
  return (
    <div className={`animate-pulse rounded-lg bg-slate-800 ${className ?? ""}`} />
  );
}

export default function RecruiterProfilePage() {
  const user = useAuthStore((s) => s.user);
  const { data: profile, isLoading: loadingProfile } = useRecruiterProfile();
  const { data: subResponse, isLoading: loadingSub } = useRecruiterSubscription();
  const { data: usage, isLoading: loadingUsage } = useRecruiterUsage();
  const { data: unreadNotif } = useUnreadNotificationCount();
  const { data: unreadMsg } = useUnreadMessageCount();

  const subscription = subResponse?.subscription ?? null;
  const plan = subResponse?.plan ?? null;
  const trustScore = user?.trust_score ?? 0;
  const verificationTier = user?.verification_tier ?? 1;
  const verificationStatus = profile?.verification_status ?? "pending";

  const verification = getVerificationDisplay(verificationTier, verificationStatus);
  const trustLabel = getTrustLabel(trustScore);
  const trustStars = getTrustStars(trustScore);

  const messagesUsed = usage?.messages?.used ?? 0;
  const messagesLimit = usage?.messages?.limit ?? 1;
  const campaignsUsed = usage?.campaigns?.used ?? 0;
  const campaignsLimit = usage?.campaigns?.limit ?? 1;

  const companyName = profile?.company_name ?? "Your Company";
  const specialties = profile?.specialties ?? [];
  const industry = profile?.industry;
  const profilePhoto = profile?.profile_photo;

  const renewalDate = subscription?.current_period_end
    ? new Date(subscription.current_period_end).toLocaleDateString("en-US", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : null;

  const settingsItems = [
    {
      icon: Bell,
      label: "Notifications",
      href: "/recruiter/notifications",
      badge: unreadNotif?.count,
    },
    {
      icon: CreditCard,
      label: "Billing",
      href: "/recruiter/billing",
    },
    {
      icon: ShieldCheck,
      label: "Verification",
      href: "/recruiter/verify-documents",
    },
  ];

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-6">
      {/* Header */}
      <header className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight text-white">Profile</h1>
        <Link
          href="/recruiter/profile/edit"
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-800 bg-[#0a1420] text-slate-400 transition-colors hover:border-teal-800/60 hover:text-teal-400"
        >
          <Settings className="h-5 w-5" />
        </Link>
      </header>

      {/* Company card */}
      <div className="relative mb-4 overflow-hidden rounded-2xl border border-teal-900/40 bg-gradient-to-br from-[#0a1a24] via-[#081420] to-[#050b14] p-5">
        <div className="absolute right-0 top-0 h-40 w-40 rounded-full bg-teal-500/10 blur-2xl" />

        <div className="relative flex items-start gap-4">
          <div className="relative">
            {profilePhoto ? (
              <img
                src={profilePhoto}
                alt={companyName}
                className="h-20 w-20 rounded-2xl object-cover"
              />
            ) : (
              <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-teal-950/60 text-2xl font-bold text-teal-300">
                {getInitials(companyName)}
              </div>
            )}
            {(verificationStatus === "enterprise" ||
              verificationStatus === "trusted_partner") && (
              <span className="absolute -bottom-1.5 -right-1.5 flex h-7 w-7 items-center justify-center rounded-full border-2 border-[#0a1a24] bg-teal-500">
                <BadgeCheck className="h-4 w-4 text-[#050b14]" strokeWidth={2.5} />
              </span>
            )}
          </div>

          <div className="min-w-0 flex-1 pt-1">
            <h2 className="truncate text-xl font-bold leading-tight text-white">
              {companyName}
            </h2>
            {profile?.slug && (
              <p className="mt-0.5 text-sm text-slate-500">@{profile.slug}</p>
            )}
            {profile?.headline && (
              <p className="mt-1 text-sm text-slate-400">{profile.headline}</p>
            )}
          </div>
        </div>

        {/* Specialties */}
        <Link
          href="/recruiter/profile/edit"
          className="relative mt-4 flex w-full items-center gap-3 rounded-xl border border-slate-800 bg-[#0a1420] p-3.5 text-left transition-colors hover:border-teal-800/60"
        >
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-slate-800 bg-slate-900 text-teal-400">
            <Building2 className="h-5 w-5" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-sm font-medium text-white">
              {specialties.length > 0
                ? specialties.join(", ")
                : industry ?? "No specialties set"}
            </span>
            <span className="block text-xs text-slate-500">Specialties</span>
          </span>
          <ChevronRight className="h-4 w-4 shrink-0 text-slate-600" />
        </Link>
      </div>

      {/* Verification */}
      <div
        className={`mb-4 flex items-center gap-4 rounded-2xl border p-4 ${
          verification.verified
            ? "border-teal-900/40 bg-[#0a1420]"
            : "border-slate-800 bg-[#0a1420]"
        }`}
      >
        <span
          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full ${
            verification.verified ? "bg-teal-950/60" : "bg-slate-800"
          }`}
        >
          <BadgeCheck
            className={`h-6 w-6 ${
              verification.verified ? "text-teal-400" : "text-slate-500"
            }`}
          />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-base font-semibold text-white">{verification.label}</p>
          <p
            className={`mt-0.5 text-sm ${
              verification.verified ? "text-teal-400" : "text-slate-500"
            }`}
          >
            {verification.sublabel}
          </p>
        </div>
        {!verification.verified && (
          <Link
            href="/recruiter/verify-documents"
            className="shrink-0 rounded-lg border border-teal-700 px-3 py-1.5 text-xs font-medium text-teal-400 transition-colors hover:bg-teal-950/40"
          >
            Verify
          </Link>
        )}
      </div>

      {/* Trust score */}
      <div className="mb-4 flex items-center gap-5 rounded-2xl border border-slate-800 bg-[#0a1420] p-5">
        <TrustRing score={trustScore} />
        <div>
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-white" />
            <p className="text-lg font-semibold text-white">Trust Score</p>
          </div>
          <p className="mt-1 text-sm text-teal-400">{trustLabel}</p>
          <div className="mt-2 flex gap-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={`h-4 w-4 ${
                  i < trustStars
                    ? "fill-teal-400 text-teal-400"
                    : "fill-slate-800 text-slate-800"
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Subscription & Quotas */}
      {(loadingSub || loadingUsage) ? (
        <div className="mb-4 space-y-3 rounded-2xl border border-slate-800 bg-[#0a1420] p-4">
          <SkeletonBlock className="h-4 w-24" />
          <SkeletonBlock className="h-3 w-32" />
          <SkeletonBlock className="h-1.5 w-full" />
          <SkeletonBlock className="h-1.5 w-full" />
        </div>
      ) : (
        <div className="mb-4 rounded-2xl border border-slate-800 bg-[#0a1420] p-4">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-[11px] font-semibold tracking-wide text-teal-400">
              {plan?.display_name?.toUpperCase() ?? "FREE PLAN"}
            </span>
            {subscription?.status === "active" && renewalDate && (
              <span className="flex items-center gap-1.5 text-xs text-slate-500">
                <CalendarDays size={12} />
                Renews {renewalDate}
              </span>
            )}
          </div>

          {/* Messages quota */}
          <div className="mb-3">
            <div className="mb-1.5 flex items-center justify-between text-xs">
              <span className="text-slate-300">Messages</span>
              <span className="text-slate-500">
                {messagesUsed} / {messagesLimit}
              </span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-slate-800">
              <div
                className="h-full rounded-full bg-teal-500 transition-all"
                style={{
                  width: `${Math.min((messagesUsed / messagesLimit) * 100, 100)}%`,
                }}
              />
            </div>
          </div>

          {/* Campaigns quota */}
          <div>
            <div className="mb-1.5 flex items-center justify-between text-xs">
              <span className="text-slate-300">Campaigns</span>
              <span className="text-slate-500">
                {campaignsUsed} / {campaignsLimit}
              </span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-slate-800">
              <div
                className="h-full rounded-full bg-teal-500 transition-all"
                style={{
                  width: `${Math.min((campaignsUsed / campaignsLimit) * 100, 100)}%`,
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Settings list */}
      <div className="mb-4 overflow-hidden rounded-2xl border border-slate-800 bg-[#0a1420]">
        {settingsItems.map(({ icon: Icon, label, href, badge }, i) => (
          <Link
            key={label}
            href={href}
            className={`flex w-full items-center gap-3 p-4 text-left transition-colors hover:bg-slate-900/50 ${
              i > 0 ? "border-t border-slate-800" : ""
            }`}
          >
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-slate-800 bg-slate-900 text-teal-400">
              <Icon className="h-5 w-5" />
            </span>
            <span className="flex-1 text-sm font-medium text-white">{label}</span>
            {typeof badge === "number" && badge > 0 && (
              <span className="mr-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-teal-500 px-1.5 text-[10px] font-bold text-[#050b14]">
                {badge > 99 ? "99+" : badge}
              </span>
            )}
            <ChevronRight className="h-4 w-4 text-slate-600" />
          </Link>
        ))}
      </div>

      {/* Account info */}
      <div className="rounded-2xl border border-slate-800 bg-[#0a1420] p-4">
        <div className="mb-3 text-[11px] font-semibold tracking-wide text-teal-400">
          ACCOUNT
        </div>
        <div className="space-y-2.5 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-slate-500">Email</span>
            <span className="text-slate-300">{user?.email ?? "—"}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-500">Phone</span>
            <span className="text-slate-300">{user?.phone ?? "—"}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-500">Member since</span>
            <span className="text-slate-300">
              {user?.created_at
                ? new Date(user.created_at).toLocaleDateString("en-US", {
                    month: "short",
                    year: "numeric",
                  })
                : "—"}
            </span>
          </div>
          {profile?.company_website && (
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Website</span>
              <a
                href={profile.company_website}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-teal-400 hover:underline"
              >
                {new URL(profile.company_website).hostname}
                <ExternalLink size={12} />
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
