"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LogOut,
  ShieldCheck,
  Check,
  Bell,
  CreditCard,
  ChevronRight,
  Star,
  Loader2,
  Pencil,
  Shield,
  BadgeCheck,
  Mail,
  Phone,
  Building2,
  Settings,
  TrendingUp,
} from "lucide-react";
import { useAuthStore } from "@/providers/auth-store-provider";
import { recruiterApi, authApi, verificationApi } from "@/lib/api";
import { getApiErrorMessage } from "@/lib/formatters";
import type { RecruiterProfile } from "@/lib/validations/recruiter-profile.schema";
import type { VerificationStatusResponse } from "@/lib/api/verification";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { OtpInput } from "@/components/ui/otp-input";

type VerifyTarget = "email" | "phone" | null;

function TrustScoreRing({ score }: { score: number }) {
  const radius = 26;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (Math.min(100, Math.max(0, score)) / 100) * circumference;

  let color: string;
  if (score >= 80) color = "stroke-emerald-500";
  else if (score >= 60) color = "stroke-amber-500";
  else if (score >= 40) color = "stroke-orange-500";
  else color = "stroke-red-500";

  return (
    <div className="relative flex items-center justify-center">
      <svg width="64" height="64" className="-rotate-90">
        <circle
          cx="32"
          cy="32"
          r={radius}
          fill="none"
          stroke="currentColor"
          className="text-slate-100"
          strokeWidth="3"
        />
        <circle
          cx="32"
          cy="32"
          r={radius}
          fill="none"
          className={color}
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 0.8s ease" }}
        />
      </svg>
      <span className="absolute text-sm font-bold text-slate-900">{score}</span>
    </div>
  );
}

function TrustLabel({ score }: { score: number }) {
  if (score >= 80) return "Excellent";
  if (score >= 60) return "Good";
  if (score >= 40) return "Fair";
  return "Low";
}

function TrustColor({ score }: { score: number }) {
  if (score >= 80) return "text-emerald-600";
  if (score >= 60) return "text-amber-600";
  if (score >= 40) return "text-orange-600";
  return "text-red-600";
}

export default function RecruiterProfilePage() {
  const router = useRouter();
  const { user, logout, fetchUser } = useAuthStore();
  const [profile, setProfile] = useState<RecruiterProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [verification, setVerification] = useState<VerificationStatusResponse | null>(null);

  const [verifyTarget, setVerifyTarget] = useState<VerifyTarget>(null);
  const [otp, setOtp] = useState("");
  const [sending, setSending] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [dialogError, setDialogError] = useState<string | null>(null);
  const [dialogSuccess, setDialogSuccess] = useState<string | null>(null);

  useEffect(() => {
    recruiterApi
      .getMyProfile()
      .then((data) => setProfile(data as RecruiterProfile))
      .catch((err) => setError(getApiErrorMessage(err, "Failed to load profile")))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!user?._id) return;
    let cancelled = false;
    verificationApi
      .getVerificationStatus(user._id)
      .then((data) => {
        if (!cancelled) setVerification(data);
      })
      .catch(() => {
        // ignore
      });
    return () => {
      cancelled = true;
    };
  }, [user?._id]);

  const handleLogout = () => {
    logout();
    router.push("/auth/login");
  };

  const handleOpenVerify = async (t: VerifyTarget) => {
    if (!user) return;
    setVerifyTarget(t);
    setOtp("");
    setDialogError(null);
    setDialogSuccess(null);
    setSending(true);
    try {
      if (t === "email") {
        await authApi.sendEmailOtp();
      } else if (t === "phone") {
        await authApi.sendPhoneOtp();
      }
      setDialogSuccess("OTP sent successfully.");
    } catch (err) {
      setDialogError(getApiErrorMessage(err, "Failed to send OTP."));
    } finally {
      setSending(false);
    }
  };

  const handleVerify = async () => {
    if (!verifyTarget || otp.length !== 6 || !user) return;
    setVerifying(true);
    setDialogError(null);
    setDialogSuccess(null);
    try {
      if (verifyTarget === "email") {
        await authApi.verifyEmailOtp(user.email, otp);
      } else if (verifyTarget === "phone") {
        await authApi.verifyPhoneOtp(user.phone, otp);
      }
      await fetchUser();
      setDialogSuccess("Verified successfully!");
      setTimeout(() => {
        setVerifyTarget(null);
        setOtp("");
        setDialogSuccess(null);
      }, 1200);
    } catch (err) {
      setDialogError(getApiErrorMessage(err, "Invalid OTP."));
    } finally {
      setVerifying(false);
    }
  };

  if (loading) {
    return (
      <div className="px-4 pt-4 space-y-3">
        <div className="flex items-center justify-between">
          <Skeleton className="h-7 w-24" />
          <Skeleton className="h-8 w-8 rounded-lg" />
        </div>
        <Skeleton className="h-[172px] w-full rounded-2xl" />
        <Skeleton className="h-[360px] w-full rounded-2xl" />
        <Skeleton className="h-24 w-full rounded-2xl" />
      </div>
    );
  }

  if (error && !profile) {
    return (
      <div className="px-4 pt-4 pb-6">
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  const verificationStatus = verification?.verification?.status ?? "";
  const isCompanyVerified =
    verificationStatus === "approved" ||
    verificationStatus === "auto_approved" ||
    profile?.verification_status === "verified" ||
    profile?.verification_status === "basic" ||
    profile?.verification_status === "enterprise" ||
    profile?.verification_status === "trusted_partner";

  const hasVerificationRecord = !!verification?.verification;

  const allContactVerified = user?.is_email_verified && user?.is_phone_verified;

  const trustScore = user?.trust_score ?? 0;
  const companyName = profile?.company_name || "Company";
  const userName = user?.email?.split("@")[0] || "User";
  const specialties = profile?.specialties?.join(", ") || "Not set";
  const initials = companyName
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("");

  return (
    <div className="px-4 pt-4 pb-6 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-bold tracking-tight text-slate-900">
          Profile
        </h1>
        <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
          <SheetTrigger asChild>
            <button className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 transition-colors hover:border-slate-300 hover:text-slate-700">
              <Settings className="h-4 w-4" strokeWidth={1.5} />
            </button>
          </SheetTrigger>
          <SheetContent side="bottom" className="rounded-t-2xl" showCloseButton={false}>
            <SheetHeader>
              <SheetTitle className="text-left text-base font-semibold">Settings</SheetTitle>
            </SheetHeader>
            <div className="flex flex-col py-2">
              <button
                onClick={() => {
                  setMenuOpen(false);
                  router.push("/recruiter/profile/edit");
                }}
                className="flex items-center gap-3 px-3 py-3 text-left text-sm font-medium text-slate-700 hover:bg-slate-50 rounded-xl transition-colors"
              >
                <Pencil className="h-4 w-4 text-slate-400" strokeWidth={1.5} />
                Edit profile
              </button>
              <button
                onClick={() => {
                  setMenuOpen(false);
                  handleLogout();
                }}
                className="flex items-center gap-3 px-3 py-3 text-left text-sm font-medium text-red-600 hover:bg-red-50 rounded-xl transition-colors"
              >
                <LogOut className="h-4 w-4" strokeWidth={1.5} />
                Logout
              </button>
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Profile Header Card */}
      <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white">
        {/* Decorative gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950 h-[80px]" />
        <div className="absolute right-0 top-0 h-[80px] w-[120px] bg-gradient-to-bl from-amber-500/30 to-transparent" />

        <div className="relative px-5 pt-5 pb-4">
          {/* Avatar */}
          <div className="flex items-end gap-4">
            <div className="relative">
              <div className="flex h-[72px] w-[72px] items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 text-xl font-bold text-white shadow-lg ring-4 ring-white">
                {initials}
              </div>
              {isCompanyVerified && (
                <div className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-white">
                  <BadgeCheck className="h-5 w-5 text-amber-500" strokeWidth={2.5} />
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0 pb-1">
              <button
                onClick={() => router.push("/recruiter/profile/edit")}
                className="text-left w-full"
              >
                <h2 className="text-lg font-bold leading-tight text-white truncate">
                  {companyName}
                </h2>
                <p className="mt-0.5 text-xs text-white/70 capitalize">{userName}</p>
              </button>
            </div>
          </div>

          {/* Company info row */}
          <button
            onClick={() => router.push("/recruiter/profile/edit")}
            className="mt-4 flex w-full items-center justify-between rounded-xl bg-slate-50 px-4 py-3 transition-colors hover:bg-slate-100"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white border border-slate-200">
                <Building2 className="h-4 w-4 text-slate-500" strokeWidth={1.5} />
              </div>
              <div className="text-left">
                <p className="text-[13px] font-medium text-slate-700">{specialties}</p>
                <p className="text-[11px] text-slate-400">Specialties</p>
              </div>
            </div>
            <ChevronRight className="h-4 w-4 text-slate-400" />
          </button>
        </div>
      </div>

      {/* Verification & Trust Card */}
      {(user?.verification_tier ?? 0) < 3 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold text-slate-900">Verification</h3>
              <p className="mt-0.5 text-[11px] text-slate-400">Complete steps to unlock more features</p>
            </div>
            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-600">
              Tier {user?.verification_tier ?? 1} of 3
            </span>
          </div>

          {/* Tier Progress */}
          <div className="flex items-center gap-2.5 mb-5">
            {[1, 2, 3].map((t) => {
              const active = (user?.verification_tier ?? 1) >= t;
              const current = (user?.verification_tier ?? 1) === t;
              return (
                <div key={t} className="flex items-center gap-2.5" style={{ flex: t < 3 ? 1 : "none" }}>
                  <div
                    className={cn(
                      "flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold transition-all",
                      active
                        ? "bg-slate-900 text-white shadow-sm"
                        : "bg-slate-100 text-slate-400 border border-slate-200",
                      current && active && "ring-2 ring-slate-900/20"
                    )}
                  >
                    {active ? <Check className="h-3.5 w-3.5" strokeWidth={3} /> : t}
                  </div>
                  <span
                    className={cn(
                      "text-[11px] font-medium",
                      active ? "text-slate-900" : "text-slate-400"
                    )}
                  >
                    {t === 1 ? "Account" : t === 2 ? "Contact" : "Documents"}
                  </span>
                  {t < 3 && (
                    <div
                      className={cn(
                        "h-0.5 flex-1 rounded-full",
                        (user?.verification_tier ?? 1) > t
                          ? "bg-slate-900"
                          : "bg-slate-100"
                      )}
                    />
                  )}
                </div>
              );
            })}
          </div>

          <div className="space-y-0.5">
            {/* Email */}
            <div className="flex items-center justify-between rounded-xl px-3 py-3 transition-colors hover:bg-slate-50">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-50">
                  <Mail className="h-4 w-4 text-slate-500" strokeWidth={1.5} />
                </div>
                <div>
                  <p className="text-[13px] font-medium text-slate-900">Email</p>
                  {user?.is_email_verified && (
                    <p className="text-[11px] text-slate-400 truncate max-w-[160px]">{user.email}</p>
                  )}
                </div>
              </div>
              {user?.is_email_verified ? (
                <Check className="h-4 w-4 text-emerald-500" strokeWidth={2.5} />
              ) : (
                <button
                  onClick={() => handleOpenVerify("email")}
                  className="rounded-lg bg-slate-900 px-3 py-1.5 text-[11px] font-semibold text-white transition-colors hover:bg-slate-800"
                >
                  Verify
                </button>
              )}
            </div>

            {/* Phone */}
            <div className="flex items-center justify-between rounded-xl px-3 py-3 transition-colors hover:bg-slate-50">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-50">
                  <Phone className="h-4 w-4 text-slate-500" strokeWidth={1.5} />
                </div>
                <div>
                  <p className="text-[13px] font-medium text-slate-900">Phone</p>
                  {user?.is_phone_verified && (
                    <p className="text-[11px] text-slate-400 truncate max-w-[160px]">{user.phone}</p>
                  )}
                </div>
              </div>
              {user?.is_phone_verified ? (
                <Check className="h-4 w-4 text-emerald-500" strokeWidth={2.5} />
              ) : (
                <button
                  onClick={() => handleOpenVerify("phone")}
                  className="rounded-lg bg-slate-900 px-3 py-1.5 text-[11px] font-semibold text-white transition-colors hover:bg-slate-800"
                >
                  Verify
                </button>
              )}
            </div>

            {/* Company / Documents */}
            <button
              onClick={() =>
                router.push(
                  hasVerificationRecord
                    ? "/recruiter/profile/verification"
                    : "/recruiter/verify-documents"
                )
              }
              className="flex w-full items-center justify-between rounded-xl px-3 py-3 text-left transition-colors hover:bg-slate-50"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-50">
                  <Shield className="h-4 w-4 text-slate-500" strokeWidth={1.5} />
                </div>
                <div>
                  <p className="text-[13px] font-medium text-slate-900">Company</p>
                  <p className="text-[11px] text-slate-400">
                    {isCompanyVerified
                      ? "Approved"
                      : hasVerificationRecord
                        ? "Under review"
                        : "Not submitted"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <span
                  className={cn(
                    "rounded-full px-2 py-0.5 text-[10px] font-semibold",
                    isCompanyVerified
                      ? "bg-emerald-50 text-emerald-700"
                      : hasVerificationRecord
                        ? "bg-amber-50 text-amber-700"
                        : "bg-slate-100 text-slate-500"
                  )}
                >
                  {isCompanyVerified
                    ? "Approved"
                    : hasVerificationRecord
                      ? "Pending"
                      : "Start"}
                </span>
                <ChevronRight className="h-4 w-4 text-slate-400" />
              </div>
            </button>
          </div>

          {/* Trust Score */}
          <div className="mt-4 flex items-center gap-4 rounded-xl bg-gradient-to-r from-slate-50 to-amber-50/50 border border-slate-100 p-4">
            <TrustScoreRing score={trustScore} />
            <div>
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-slate-500" strokeWidth={1.5} />
                <span className="text-[13px] font-semibold text-slate-900">Trust Score</span>
              </div>
              <p className={cn("mt-0.5 text-[11px] font-medium", TrustColor({ score: trustScore }))}>
                <TrustLabel score={trustScore} />
              </p>
              <div className="mt-1.5 flex gap-0.5">
                {[0, 1, 2].map((i) => (
                  <Star key={i} className="h-3 w-3 fill-amber-400 text-amber-400" />
                ))}
              </div>
            </div>
          </div>

          {/* Tier 3 Banner */}
          {(user?.verification_tier ?? 0) >= 3 && (
            <div className="mt-4 flex items-center gap-3 rounded-xl bg-emerald-50 border border-emerald-200 p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500 shadow-sm">
                <BadgeCheck className="h-5 w-5 text-white" strokeWidth={2.5} />
              </div>
              <div>
                <p className="text-sm font-semibold text-emerald-900">Fully Verified</p>
                <p className="text-[11px] text-emerald-700">
                  Your email, phone, and company documents are all verified.
                </p>
              </div>
            </div>
          )}

          {/* Partial verified banner */}
          {allContactVerified && !isCompanyVerified && (user?.verification_tier ?? 0) < 3 && (
            <button
              onClick={() => router.push("/recruiter/verify-documents")}
              className="mt-4 flex w-full items-center gap-3 rounded-xl bg-amber-50 border border-amber-200 p-4 text-left transition-colors hover:bg-amber-100"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-500 shadow-sm">
                <ShieldCheck className="h-5 w-5 text-white" strokeWidth={2} />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-amber-900">Contact Verified</p>
                <p className="text-[11px] text-amber-700">
                  Submit company documents to reach Tier 3.
                </p>
              </div>
              <ChevronRight className="h-4 w-4 text-amber-700 shrink-0" />
            </button>
          )}
        </div>
      ) : (
        /* Tier 3+ Verified Profile */
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <div className="flex items-center gap-3 rounded-xl bg-gradient-to-r from-emerald-50 to-green-50 border border-emerald-200 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500 shadow-sm">
              <BadgeCheck className="h-5 w-5 text-white" strokeWidth={2.5} />
            </div>
            <div>
              <p className="text-sm font-semibold text-emerald-900">Fully Verified</p>
              <p className="text-[11px] text-emerald-700">Tier 3 · All verifications complete</p>
            </div>
          </div>

          <div className="mt-4 flex items-center gap-4 rounded-xl bg-gradient-to-r from-slate-50 to-amber-50/50 border border-slate-100 p-4">
            <TrustScoreRing score={trustScore} />
            <div>
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-slate-500" strokeWidth={1.5} />
                <span className="text-[13px] font-semibold text-slate-900">Trust Score</span>
              </div>
              <p className={cn("mt-0.5 text-[11px] font-medium", TrustColor({ score: trustScore }))}>
                <TrustLabel score={trustScore} />
              </p>
              <div className="mt-1.5 flex gap-0.5">
                {[0, 1, 2].map((i) => (
                  <Star key={i} className="h-3 w-3 fill-amber-400 text-amber-400" />
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Verify Company CTA — only when no record */}
      {!hasVerificationRecord && !isCompanyVerified && (
        <div className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-900 text-white">
            <Shield className="h-5 w-5" strokeWidth={1.5} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-slate-900">Verify your company</p>
            <p className="text-xs text-slate-500">Submit documents to build trust with talents and unlock features.</p>
          </div>
          <button
            onClick={() => router.push("/recruiter/verify-documents")}
            className="shrink-0 rounded-xl bg-slate-900 px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-slate-800"
          >
            Verify
          </button>
        </div>
      )}

      {/* Quick Links */}
      <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
        <button
          onClick={() => router.push("/recruiter/notifications")}
          className="flex w-full items-center justify-between px-5 py-3.5 transition-colors hover:bg-slate-50"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-50">
              <Bell className="h-4 w-4 text-slate-500" strokeWidth={1.5} />
            </div>
            <span className="text-sm font-medium text-slate-900">Notifications</span>
          </div>
          <ChevronRight className="h-4 w-4 text-slate-400" />
        </button>
        <div className="mx-5 h-px bg-slate-100" />
        <button
          onClick={() => router.push("/recruiter/billing")}
          className="flex w-full items-center justify-between px-5 py-3.5 transition-colors hover:bg-slate-50"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-50">
              <CreditCard className="h-4 w-4 text-slate-500" strokeWidth={1.5} />
            </div>
            <span className="text-sm font-medium text-slate-900">Billing</span>
          </div>
          <ChevronRight className="h-4 w-4 text-slate-400" />
        </button>
      </div>

      {/* OTP Dialog */}
      <Dialog open={!!verifyTarget} onOpenChange={(open) => !open && setVerifyTarget(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-slate-900" strokeWidth={1.5} />
              Verify {verifyTarget === "email" ? "Email" : "Phone"}
            </DialogTitle>
            <DialogDescription>
              Enter the 6-digit OTP sent to your{" "}
              {verifyTarget === "email" ? user?.email : user?.phone}.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {dialogSuccess && (
              <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
                {dialogSuccess}
              </div>
            )}
            {dialogError && (
              <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {dialogError}
              </div>
            )}
            <OtpInput
              value={otp}
              onChange={setOtp}
              disabled={verifying}
            />
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setVerifyTarget(null)}
              disabled={verifying}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleVerify}
              disabled={otp.length !== 6 || verifying || sending}
            >
              {verifying && <Loader2 className="h-4 w-4 mr-1.5 animate-spin" strokeWidth={1.5} />}
              Verify
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}