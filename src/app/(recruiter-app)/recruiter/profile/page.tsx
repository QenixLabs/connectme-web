"use client";

import Link from "next/link";
import {
  Settings,
  BadgeCheck,
  Check,
  ChevronRight,
  Star,
  Bell,
  CreditCard,
  ShieldCheck,
  MapPin,
  ExternalLink,
  Pencil,
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
    <div className="relative h-[76px] w-[76px] shrink-0">
      <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
        <circle
          cx="50"
          cy="50"
          r={r}
          fill="none"
          strokeWidth="7"
          className="stroke-[#E6EAF0]"
        />
        <circle
          cx="50"
          cy="50"
          r={r}
          fill="none"
          strokeWidth="7"
          strokeLinecap="round"
          className="stroke-accent-teal"
          strokeDasharray={c}
          strokeDashoffset={c - (c * score) / 100}
        />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center text-[22px] font-bold tabular-nums text-[#0F1D2E]">
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

function getWebsiteInfo(raw?: string | null): { href: string; label: string } | null {
  if (!raw) return null;
  const trimmed = raw.trim();
  if (!trimmed) return null;
  const withProtocol = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
  try {
    return { href: withProtocol, label: new URL(withProtocol).hostname };
  } catch {
    return { href: withProtocol, label: trimmed };
  }
}

function SkeletonBlock({ className }: { className?: string }) {
  return (
    <div className={`animate-pulse rounded-lg bg-[#EDF1F7] ${className ?? ""}`} />
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-1.5 px-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-[#8A94A6]">
      {children}
    </p>
  );
}

function UsageBar({
  label,
  used,
  limit,
}: {
  label: string;
  used: number;
  limit: number;
}) {
  const pct = limit > 0 ? Math.min((used / limit) * 100, 100) : 0;
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between text-[13px]">
        <span className="text-[#3E4C63]">{label}</span>
        <span className="font-semibold tabular-nums text-[#0F1D2E]">
          {used} <span className="font-normal text-[#8A94A6]">/ {limit}</span>
        </span>
      </div>
      <div className="h-1 overflow-hidden rounded-full bg-[#EDF1F7]">
        <div
          className="h-full rounded-full bg-accent-teal transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
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
  const website = getWebsiteInfo(profile?.company_website);

  const categoryTags = [...specialties.slice(0, 2)];
  if (industry && !categoryTags.includes(industry) && categoryTags.length < 2) {
    categoryTags.push(industry);
  }
  const categoryLine = categoryTags.join(" • ");

  const locationText = [profile?.location?.city, profile?.location?.country]
    .map((v) => v?.trim())
    .filter(Boolean)
    .join(", ");

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
    <div className="min-h-screen bg-[#F6F8FC]">
      <div className="mx-auto w-full max-w-[430px] px-4 pb-10 pt-5">
        {/* 1 — Header */}
        <header className="flex items-center justify-between pb-4">
          <h1 className="text-[29px] font-bold tracking-tight text-[#0F1D2E]">
            Profile
          </h1>
          <Link
            href="/recruiter/profile/edit"
            aria-label="Profile settings"
            className="flex h-9 w-9 items-center justify-center rounded-full text-[#64748B] transition-colors hover:bg-[#E9EEF5] hover:text-[#0F1D2E]"
          >
            <Settings className="h-5 w-5" />
          </Link>
        </header>

        {/* 2 — Company identity hero (no card, no gradient) */}
        <section aria-label="Company identity" className="flex items-start gap-3.5">
          {profilePhoto ? (
            <img
              src={profilePhoto}
              alt={companyName}
              className="h-[88px] w-[88px] shrink-0 rounded-[20px] border border-black/5 object-cover shadow-[0_1px_2px_rgba(15,23,42,0.08)]"
            />
          ) : (
            <div className="flex h-[88px] w-[88px] shrink-0 items-center justify-center rounded-[20px] bg-[#E8EFFD] text-[26px] font-bold text-rootin shadow-[0_1px_2px_rgba(15,23,42,0.08)]">
              {getInitials(companyName)}
            </div>
          )}

          <div className="min-w-0 flex-1 pt-0.5">
            <div className="flex items-center gap-1.5">
              <h2 className="truncate text-[19px] font-bold leading-snug text-[#0F1D2E]">
                {loadingProfile ? "Loading…" : companyName}
              </h2>
              {verification.verified && (
                <BadgeCheck
                  className="h-[18px] w-[18px] shrink-0 text-rootin"
                  strokeWidth={2.5}
                  aria-label={verification.label}
                />
              )}
            </div>
            {profile?.slug && (
              <p className="mt-px truncate text-[13px] text-[#64748B]">
                @{profile.slug}
              </p>
            )}
            {categoryLine && (
              <p className="mt-1 truncate text-[13px] font-medium text-[#3E4C63]">
                {categoryLine}
              </p>
            )}
            {locationText && (
              <p className="mt-1 flex items-center gap-1 text-[12.5px] text-[#64748B]">
                <MapPin className="h-3 w-3 shrink-0" />
                <span className="truncate">{locationText}</span>
              </p>
            )}
            {profile?.headline && (
              <p className="mt-1 line-clamp-2 text-[13px] leading-snug text-[#64748B]">
                {profile.headline}
              </p>
            )}
            <Link
              href="/recruiter/profile/edit"
              className="mt-2.5 inline-flex h-9 items-center gap-1.5 rounded-full border border-[#E6EAF0] bg-white px-4 text-[13px] font-semibold text-rootin shadow-[0_1px_2px_rgba(15,23,42,0.05)] transition-colors hover:border-rootin/40"
            >
              <Pencil className="h-3.5 w-3.5" />
              Edit profile
            </Link>
          </div>
        </section>

        {/* 3 — Credibility: trust score + verification merged */}
        <section aria-label="Credibility" className="mt-5">
          <SectionLabel>Credibility</SectionLabel>
          <div className="rounded-[20px] border border-[#E6EAF0] bg-white p-4 shadow-[0_1px_2px_rgba(15,23,42,0.05)]">
            <div className="flex items-center gap-4">
              <TrustRing score={trustScore} />
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-[15px] font-semibold text-[#0F1D2E]">
                    Trust Score
                  </p>
                  <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-[#EAF1FE] px-2 py-0.5 text-[11px] font-semibold text-rootin">
                    <Check className="h-3 w-3" strokeWidth={3} />
                    Tier {verificationTier}
                  </span>
                </div>
                <p className="mt-0.5 text-[13px] text-[#64748B]">{trustLabel}</p>
                <div className="mt-1.5 flex gap-0.5" aria-label={`${trustStars} out of 5 stars`}>
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`h-3.5 w-3.5 ${
                        i < trustStars
                          ? "fill-accent-amber text-accent-amber"
                          : "fill-[#E2E8F0] text-[#E2E8F0]"
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>
            <div className="mt-3 flex items-center justify-between gap-2 border-t border-[#EEF2F7] pt-3">
              <span className="flex min-w-0 items-center gap-2 text-[13px] font-medium text-[#0F1D2E]">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-accent-amber-bg">
                  <ShieldCheck className="h-3.5 w-3.5 text-accent-amber" />
                </span>
                <span className="truncate">{verification.label}</span>
              </span>
              <Link
                href="/recruiter/verify-documents"
                className="flex shrink-0 items-center gap-0.5 text-[13px] font-semibold text-accent-teal"
              >
                {verification.verified ? "View details" : "Verify now"}
                <ChevronRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        </section>

        {/* 4 — Business plan / usage */}
        <section aria-label="Business plan" className="mt-4">
          <div className="rounded-[20px] border border-[#E6EAF0] bg-white p-4 shadow-[0_1px_2px_rgba(15,23,42,0.05)]">
            <div className="mb-3 flex items-baseline justify-between gap-2">
              <p className="truncate text-[12px] font-bold uppercase tracking-[0.06em] text-[#0F1D2E]">
                {plan?.display_name ?? "Business"}
              </p>
              {subscription?.status === "active" && renewalDate && (
                <p className="shrink-0 text-[11.5px] text-[#8A94A6]">
                  Renews {renewalDate}
                </p>
              )}
            </div>
            {loadingSub || loadingUsage ? (
              <div className="space-y-3">
                <SkeletonBlock className="h-3 w-full" />
                <SkeletonBlock className="h-3 w-full" />
              </div>
            ) : (
              <>
                <UsageBar
                  label="Messages"
                  used={messagesUsed}
                  limit={messagesLimit}
                />
                <div className="mt-3">
                  <UsageBar
                    label="Campaigns"
                    used={campaignsUsed}
                    limit={campaignsLimit}
                  />
                </div>
              </>
            )}
            <div className="mt-3 border-t border-[#EEF2F7] pt-2.5">
              <Link
                href="/recruiter/billing"
                className="flex items-center justify-between text-[13px] font-semibold text-accent-teal"
              >
                Manage plan
                <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>

        {/* 5 — Settings */}
        <section aria-label="Settings" className="mt-4">
          <SectionLabel>Settings</SectionLabel>
          <div className="overflow-hidden rounded-[20px] border border-[#E6EAF0] bg-white shadow-[0_1px_2px_rgba(15,23,42,0.05)]">
            {settingsItems.map(({ icon: Icon, label, href, badge }, i) => (
              <Link
                key={label}
                href={href}
                className={`flex min-h-[58px] items-center gap-3 px-4 ${
                  i > 0 ? "border-t border-[#EEF2F7]" : ""
                }`}
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[12px] bg-[#F1F5F9] text-accent-teal">
                  <Icon className="h-[18px] w-[18px]" />
                </span>
                <span className="flex-1 text-[14px] font-medium text-[#0F1D2E]">
                  {label}
                </span>
                {typeof badge === "number" && badge > 0 && (
                  <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-badge-red px-1.5 text-[10px] font-bold text-white">
                    {badge > 99 ? "99+" : badge}
                  </span>
                )}
                <ChevronRight className="h-4 w-4 shrink-0 text-[#C3CAD6]" />
              </Link>
            ))}
          </div>
        </section>

        {/* 6 — Account information */}
        <section aria-label="Account information" className="mt-4">
          <SectionLabel>Account</SectionLabel>
          <div className="rounded-[20px] border border-[#E6EAF0] bg-white px-4 py-1 shadow-[0_1px_2px_rgba(15,23,42,0.05)]">
            <div className="flex items-center justify-between gap-3 border-b border-[#F1F5F9] py-2.5">
              <span className="shrink-0 text-[13px] text-[#64748B]">Email</span>
              <span className="truncate text-[13px] font-medium text-[#0F1D2E]">
                {user?.email ?? "—"}
              </span>
            </div>
            <div className="flex items-center justify-between gap-3 border-b border-[#F1F5F9] py-2.5">
              <span className="shrink-0 text-[13px] text-[#64748B]">Phone</span>
              <span className="truncate text-[13px] font-medium text-[#0F1D2E]">
                {user?.phone ?? "—"}
              </span>
            </div>
            {website && (
              <div className="flex items-center justify-between gap-3 border-b border-[#F1F5F9] py-2.5">
                <span className="shrink-0 text-[13px] text-[#64748B]">Website</span>
                <a
                  href={website.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex min-w-0 items-center gap-1 text-[13px] font-medium text-accent-teal"
                >
                  <span className="truncate">{website.label}</span>
                  <ExternalLink className="h-3 w-3 shrink-0" />
                </a>
              </div>
            )}
            <div className="flex items-center justify-between gap-3 py-2.5">
              <span className="shrink-0 text-[13px] text-[#64748B]">
                Member since
              </span>
              <span className="text-[13px] font-medium text-[#0F1D2E]">
                {user?.created_at
                  ? new Date(user.created_at).toLocaleDateString("en-US", {
                      month: "short",
                      year: "numeric",
                    })
                  : "—"}
              </span>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
