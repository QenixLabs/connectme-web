"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  LogOut,
  ShieldCheck,
  Check,
  Bell,
  CreditCard,
  ChevronRight,
  Star,
  Loader2,
  MoreHorizontal,
  Pencil,
  Shield,
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

function TrustBar({ score }: { score: number }) {
  return (
    <div className="mt-2 h-1 w-full bg-slate-100 rounded-full overflow-hidden">
      <div
        className="h-full bg-emerald-600 rounded-full transition-all"
        style={{ width: `${Math.min(100, Math.max(0, score))}%` }}
      />
    </div>
  );
}

function TrustLabel({ score }: { score: number }) {
  if (score >= 80) return "Excellent";
  if (score >= 60) return "Good";
  if (score >= 40) return "Fair";
  return "Low";
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
        await authApi.resendOtp(user.email);
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
        await authApi.verifyOtp(user.email, otp);
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
      <div className="px-4 pt-4  space-y-3">
        <div className="flex items-center justify-between">
          <Skeleton className="h-7 w-24" />
          <Skeleton className="h-8 w-8 rounded-lg" />
        </div>
        <Skeleton className="h-32 w-full rounded-2xl" />
        <Skeleton className="h-48 w-full rounded-2xl" />
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

  const documentsApproved = verification?.verification?.submitted_docs?.length ?? 0;
  const hasVerificationRecord = !!verification?.verification;

  const allContactVerified = user?.is_email_verified && user?.is_phone_verified;
  const fullyVerified = isCompanyVerified && allContactVerified;

  const trustScore = user?.trust_score ?? 0;
  const companyName = profile?.company_name || "Company";
  const userName = user?.email?.split("@")[0] || "User";
  const industry = profile?.industry || "Not set";
  const initials = companyName
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("");

  return (
    <div className="px-4 pt-4  space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1
          className="text-[17px] font-semibold text-slate-900"
          style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}
        >
          Profile
        </h1>
        <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
          <SheetTrigger asChild>
            <button className="p-1.5 text-slate-900 hover:bg-slate-100 rounded-lg transition-colors">
              <MoreHorizontal className="w-5 h-5" />
            </button>
          </SheetTrigger>
          <SheetContent side="bottom" className="rounded-t-2xl" showCloseButton={false}>
            <SheetHeader>
              <SheetTitle className="text-left text-base font-semibold">Menu</SheetTitle>
            </SheetHeader>
            <div className="flex flex-col py-2">
              <button
                onClick={() => {
                  setMenuOpen(false);
                  router.push("/recruiter/profile/edit");
                }}
                className="flex items-center gap-3 px-2 py-3 text-left text-sm font-medium text-text-primary hover:bg-slate-50 rounded-lg transition-colors"
              >
                <Pencil className="w-4 h-4 text-text-muted" />
                Edit profile
              </button>
              <button
                onClick={() => {
                  setMenuOpen(false);
                  handleLogout();
                }}
                className="flex items-center gap-3 px-2 py-3 text-left text-sm font-medium text-destructive hover:bg-destructive/5 rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Profile Header Card */}
      <div className="rounded-2xl bg-white border border-slate-100 p-4">
        <div className="flex items-start gap-3">
          <div className="w-[60px] h-[60px] rounded-full bg-gradient-to-br from-[#c8b99a] to-[#a09070] flex items-center justify-center text-xl font-semibold text-white shrink-0 overflow-hidden">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <h2
              className="text-[17px] font-bold text-slate-900 leading-tight"
              style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}
            >
              {companyName}
            </h2>
            <p className="text-[13px] text-slate-500 mt-0.5 capitalize">{userName}</p>
            {isCompanyVerified && (
              <div className="mt-1.5 inline-flex items-center gap-1.5 bg-amber-50 border border-amber-200 rounded-full px-2.5 py-1">
                <div className="w-[18px] h-[18px] rounded-full bg-amber-500 flex items-center justify-center">
                  <ShieldCheck className="w-3 h-3 text-white" strokeWidth={2.5} />
                </div>
                <span className="text-[11.5px] font-medium text-amber-800">Verified Business</span>
              </div>
            )}
          </div>
        </div>
        <button
          onClick={() => router.push("/recruiter/profile/edit")}
          className="w-full flex items-center justify-between pt-3 mt-3 border-t border-slate-100 text-[13px] text-slate-500 hover:text-slate-900 transition-colors"
        >
          <span>{industry}</span>
          <ChevronRight className="w-4 h-4 text-slate-400" />
        </button>
      </div>

      {/* Verification Status Card */}
      <div className="rounded-2xl bg-white border border-slate-100 p-4">
        <div className="divide-y divide-slate-100">
          {/* Verified Status */}
          <button
            onClick={() =>
              router.push(
                hasVerificationRecord
                  ? "/recruiter/profile/verification"
                  : "/recruiter/verify-documents"
              )
            }
            className="w-full flex items-center justify-between py-3 first:pt-0 text-left"
          >
            <span className="text-[13.5px] text-slate-900">Verified Status</span>
            <div className="flex items-center gap-1">
              <span className="text-[13px] font-medium text-emerald-700">
                {isCompanyVerified ? "Verified" : hasVerificationRecord ? "Pending" : "Not started"}
              </span>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </div>
          </button>

          {/* Documents Approved */}
          <button
            onClick={() =>
              router.push(
                hasVerificationRecord
                  ? "/recruiter/profile/verification"
                  : "/recruiter/verify-documents"
              )
            }
            className="w-full flex items-center justify-between py-3 text-left"
          >
            <span className="text-[13.5px] text-slate-900">Documents Approved</span>
            <div className="flex items-center gap-1">
              <span className="text-[13px] text-slate-500">{documentsApproved} Documents</span>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </div>
          </button>

          {/* Email */}
          {!allContactVerified && (
            <div className="flex items-center justify-between py-3">
              <span className="text-[13.5px] text-slate-900">Email</span>
              <div className="flex items-center gap-1.5">
                {user?.is_email_verified ? (
                  <>
                    <span className="text-[13px] text-slate-500 truncate max-w-[140px]">{user.email}</span>
                    <Check className="w-4 h-4 text-emerald-600" strokeWidth={2} />
                  </>
                ) : (
                  <button
                    onClick={() => handleOpenVerify("email")}
                    className="text-[13px] font-medium text-amber-600 hover:text-amber-700"
                  >
                    Verify now
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Phone */}
          {!allContactVerified && (
            <div className="flex items-center justify-between py-3">
              <span className="text-[13.5px] text-slate-900">Phone</span>
              <div className="flex items-center gap-1.5">
                {user?.is_phone_verified ? (
                  <>
                    <span className="text-[13px] text-slate-500 truncate max-w-[140px]">{user.phone}</span>
                    <Check className="w-4 h-4 text-emerald-600" strokeWidth={2} />
                  </>
                ) : (
                  <button
                    onClick={() => handleOpenVerify("phone")}
                    className="text-[13px] font-medium text-amber-600 hover:text-amber-700"
                  >
                    Verify now
                  </button>
                )}
              </div>
            </div>
          )}

          {/* All verified state */}
          {allContactVerified && (
            <div className="flex items-center justify-between py-3">
              <span className="text-[13.5px] text-slate-900">Contact</span>
              <div className="flex items-center gap-1.5">
                <span className="text-[13px] font-medium text-emerald-700">All verified</span>
                <Check className="w-4 h-4 text-emerald-600" strokeWidth={2} />
              </div>
            </div>
          )}

          {/* Trust Score */}
          <div className="py-3 last:pb-0">
            <div className="flex items-center justify-between">
              <span className="text-[13.5px] text-slate-900">Trust Score</span>
              <div className="flex items-center gap-2">
                <div className="flex gap-0.5">
                  {[0, 1, 2].map((i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                  ))}
                </div>
                <span className="text-[13px] text-slate-900 font-medium">
                  <TrustLabel score={trustScore} />
                </span>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </div>
            </div>
            <TrustBar score={trustScore} />
          </div>
        </div>

        {/* Verified Banner */}
        {fullyVerified && (
          <div className="mt-3 flex items-center justify-between bg-amber-50 border border-amber-200 rounded-xl p-3">
            <div className="flex items-center gap-3">
              <div className="w-[34px] h-[34px] rounded-full bg-amber-500 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-5 h-5 text-white" strokeWidth={2} />
              </div>
              <p className="text-[12.5px] text-amber-900 leading-snug">
                <strong className="font-semibold text-amber-950">Your account</strong> and business details are fully verified.
              </p>
            </div>
            <ChevronRight className="w-4 h-4 text-amber-700 shrink-0" />
          </div>
        )}
      </div>

      {/* Verify Company CTA — only when no record */}
      {!hasVerificationRecord && !isCompanyVerified && (
        <div className="rounded-2xl bg-white border border-slate-100 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-brand-light flex items-center justify-center shrink-0">
              <Shield className="w-5 h-5 text-brand" strokeWidth={1.5} />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-text-primary">Verify your company</p>
              <p className="text-xs text-text-muted">Submit documents to build trust with talents.</p>
            </div>
            <button
              onClick={() => router.push("/recruiter/verify-documents")}
              className="px-3 py-1.5 rounded-lg text-xs font-medium bg-brand-light text-brand-hover border border-brand-muted hover:bg-brand-soft transition-colors shrink-0"
            >
              Verify
            </button>
          </div>
        </div>
      )}

      {/* Settings Card */}
      <div className="rounded-2xl bg-white border border-slate-100 p-4">
        <div className="divide-y divide-slate-100">
          <button
            onClick={() => router.push("/recruiter/notifications")}
            className="w-full flex items-center justify-between py-3 first:pt-0 group"
          >
            <div className="flex items-center gap-3">
              <div className="w-[34px] h-[34px] rounded-[10px] bg-slate-50 flex items-center justify-center">
                <Bell className="w-4 h-4 text-slate-500" strokeWidth={1.5} />
              </div>
              <span className="text-[14px] text-slate-900">Notifications</span>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-slate-600 transition-colors" />
          </button>
          <button
            onClick={() => router.push("/recruiter/billing")}
            className="w-full flex items-center justify-between py-3 last:pb-0 group"
          >
            <div className="flex items-center gap-3">
              <div className="w-[34px] h-[34px] rounded-[10px] bg-slate-50 flex items-center justify-center">
                <CreditCard className="w-4 h-4 text-slate-500" strokeWidth={1.5} />
              </div>
              <span className="text-[14px] text-slate-900">Billing</span>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-slate-600 transition-colors" />
          </button>
        </div>
      </div>

      {/* OTP Dialog */}
      <Dialog open={!!verifyTarget} onOpenChange={(open) => !open && setVerifyTarget(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-brand" strokeWidth={1.5} />
              Verify {verifyTarget === "email" ? "Email" : "Phone"}
            </DialogTitle>
            <DialogDescription>
              Enter the 6-digit OTP sent to your{" "}
              {verifyTarget === "email" ? user?.email : user?.phone}.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {dialogSuccess && (
              <div className="text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2">
                {dialogSuccess}
              </div>
            )}
            {dialogError && (
              <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                {dialogError}
              </div>
            )}
            <OtpInput
              value={otp}
              onChange={setOtp}
              placeholder="000000"
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
              {verifying && <Loader2 className="w-4 h-4 mr-1.5 animate-spin" strokeWidth={1.5} />}
              Verify
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
