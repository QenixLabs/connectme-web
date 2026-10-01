"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Loader2 } from "lucide-react";
import { authApi, talentApi } from "@/lib/api";
import { OtpInput } from "@/components/ui/otp-input";
import { useAuthStore } from "@/providers/auth-store-provider";

function toE164(phone: string) {
  const digits = phone.replace(/\D/g, "");
  if (digits.length === 10) return `+91${digits}`;
  if (digits.length === 12 && digits.startsWith("91")) return `+${digits}`;
  return phone.startsWith("+") ? phone : `+${digits}`;
}

export function TalentGoogleResume() {
  const router = useRouter();
  const fetchUser = useAuthStore((s) => s.fetchUser);
  const [loading, setLoading] = useState(true);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [phone, setPhone] = useState("");
  const [profession, setProfession] = useState("");
  const [city, setCity] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [phoneVerified, setPhoneVerified] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const { user } = await authApi.getCurrentUser();
        setEmail(user.email ?? "");
        setFullName((user.google_name as string) ?? "");
        if (user.phone) {
          setPhone(user.phone.replace(/\D/g, "").slice(-10));
          if (user.is_phone_verified) setPhoneVerified(true);
        }
        try {
          const profile = await talentApi.getMyProfile();
          if (profile.full_legal_name) setFullName(profile.full_legal_name);
          const existingUsername = profile.username ?? "";
          if (existingUsername && !/^user[0-9a-f]{4,}$/i.test(existingUsername)) {
            setUsername(existingUsername);
          }
          if (profile.professions?.length) setProfession(profile.professions[0]);
          if (profile.location?.city) setCity(profile.location.city);
        } catch {
          // draft may be minimal; ignore
        }
        if ((user.onboarding_completed || user.onboarding_exempted) && user.role === "talent") {
          router.replace("/talent/dashboard");
          return;
        }
        if (user.role && user.role !== "talent") {
          router.replace("/recruiter/dashboard");
          return;
        }
      } catch {
        router.replace("/auth?mode=signin");
        return;
      } finally {
        setLoading(false);
      }
    })();
  }, [router]);

  const sendOtp = async () => {
    setError(null);
    try {
      const e164 = toE164(phone);
      await authApi.sendPhoneOtp(e164);
      setOtpSent(true);
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      setError(e.response?.data?.message || "Could not send OTP. Please try again.");
    }
  };

  const verifyOtp = async () => {
    setError(null);
    try {
      await authApi.verifyPhoneOtp(toE164(phone), otp);
      setPhoneVerified(true);
      await fetchUser();
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      setError(e.response?.data?.message || "Invalid OTP. Please try again.");
    }
  };

  const finalize = async () => {
    setError(null);
    setSubmitting(true);
    try {
      const cleanUsername = username.trim();
      if (!cleanUsername) throw new Error("Please choose a username.");
      const check = await authApi.checkUsername(cleanUsername);
      if (!check.available) throw new Error("That username is not available. Please choose another one.");
      if (!profession) throw new Error("Please select your profession.");
      if (!city.trim()) throw new Error("Please enter your city.");
      if (!phoneVerified) throw new Error("Please verify your phone number first.");

      await talentApi.updateMyProfile({
        username: cleanUsername.toLowerCase(),
        full_legal_name: fullName.trim() || undefined,
        professions: [profession],
        location: { city: city.trim(), country: "India" },
      });
      await authApi.completeOnboarding();
      await fetchUser();
      router.replace("/talent/dashboard");
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      setError(e.response?.data?.message || (err instanceof Error ? err.message : "Could not complete onboarding."));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-svh items-center justify-center">
        <Loader2 className="size-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <main className="mx-auto min-h-svh w-full max-w-[36rem] px-5 py-10">
      <h1 className="text-3xl font-extrabold tracking-tight">Complete your talent profile</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Google verified your email. Please complete the remaining RootIn-required details.
      </p>

      <div className="mt-6 space-y-3">
        <label className="block">
          <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Full name</span>
          <input value={fullName} onChange={(e) => setFullName(e.target.value)} className="mt-1 w-full rounded-xl border px-4 py-3 text-sm" placeholder="Your full name" />
        </label>
        <label className="block">
          <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Email (verified by Google)</span>
          <input value={email} disabled className="mt-1 w-full cursor-not-allowed rounded-xl border bg-muted px-4 py-3 text-sm opacity-70" />
        </label>
        <label className="block">
          <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Username</span>
          <input value={username} onChange={(e) => setUsername(e.target.value.replace(/[^a-zA-Z0-9]/g, "").slice(0, 20))} className="mt-1 w-full rounded-xl border px-4 py-3 text-sm" placeholder="6-20 letters or numbers" />
        </label>
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Mobile number</span>
          <div className="mt-1 flex gap-2">
            <input value={phone} onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))} inputMode="numeric" className="w-full rounded-xl border px-4 py-3 text-sm" placeholder="10-digit mobile" />
            <button type="button" onClick={sendOtp} className="shrink-0 rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground">
              Send OTP
            </button>
          </div>
          {phoneVerified && <p className="mt-1 text-xs font-semibold text-green-600">Phone verified</p>}
        </div>
        {otpSent && !phoneVerified && (
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Phone OTP</span>
            <OtpInput value={otp} onChange={setOtp} className="mt-2" />
            <button type="button" onClick={verifyOtp} disabled={otp.length < 6} className="mt-2 rounded-xl border px-4 py-2 text-sm font-semibold disabled:opacity-50">
              Verify phone
            </button>
          </div>
        )}
        <label className="block">
          <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Profession / category</span>
          <input value={profession} onChange={(e) => setProfession(e.target.value)} className="mt-1 w-full rounded-xl border px-4 py-3 text-sm" placeholder="e.g. Actor" />
        </label>
        <label className="block">
          <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Current city</span>
          <input value={city} onChange={(e) => setCity(e.target.value)} className="mt-1 w-full rounded-xl border px-4 py-3 text-sm" placeholder="e.g. Mumbai" />
        </label>
      </div>

      {error && <p className="mt-4 rounded-xl bg-red-500/10 px-4 py-3 text-sm font-medium text-red-700" role="alert">{error}</p>}

      <button type="button" onClick={finalize} disabled={submitting} className="mt-6 flex min-h-[3.25rem] w-full items-center justify-center gap-2 rounded-xl bg-primary text-base font-bold text-primary-foreground disabled:opacity-60">
        {submitting ? <Loader2 className="size-5 animate-spin" /> : <>Complete & continue <ArrowRight size={20} /></>}
      </button>
    </main>
  );
}
