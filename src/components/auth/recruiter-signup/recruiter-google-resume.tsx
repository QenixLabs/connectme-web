"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { authApi, recruiterApi } from "@/lib/api";
import { OtpInput } from "@/components/ui/otp-input";
import { useAuthStore } from "@/providers/auth-store-provider";

function toE164(phone: string) {
  const digits = phone.replace(/\D/g, "");
  if (digits.length === 10) return `+91${digits}`;
  if (digits.length === 12 && digits.startsWith("91")) return `+${digits}`;
  return phone.startsWith("+") ? phone : `+${digits}`;
}

const ROLE_OPTIONS = [
  "Casting Director",
  "Talent Manager",
  "Talent Agency",
  "Production House",
  "Brand / Advertiser",
  "Creative Director",
  "Event Company",
  "Photographer",
];

export function RecruiterGoogleResume() {
  const router = useRouter();
  const fetchUser = useAuthStore((s) => s.fetchUser);
  const [loading, setLoading] = useState(true);
  const [contactName, setContactName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [roles, setRoles] = useState<string[]>([]);
  const [independent, setIndependent] = useState(false);
  const [companyName, setCompanyName] = useState("");
  const [industry, setIndustry] = useState("");
  const [city, setCity] = useState("");
  const [website, setWebsite] = useState("");
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
        setContactName((user.google_name as string) ?? "");
        if (user.phone) {
          setPhone(user.phone.replace(/\D/g, "").slice(-10));
          if (user.is_phone_verified) setPhoneVerified(true);
        }
        try {
          const profile = await recruiterApi.getMyProfile();
          if (profile.contact_name) setContactName(profile.contact_name);
          if (profile.company_name) setCompanyName(profile.company_name);
          if (profile.industry) setIndustry(profile.industry);
          if (profile.location?.city) setCity(profile.location.city);
          if (profile.company_website) setWebsite(profile.company_website);
          if (profile.specialties?.length) setRoles(profile.specialties);
          if (profile.is_independent) setIndependent(true);
        } catch {
          // no profile yet for Google recruiters; expected
        }
        if ((user.onboarding_completed || user.onboarding_exempted) && user.role === "recruiter") {
          router.replace("/recruiter/dashboard");
          return;
        }
        if (user.role && user.role !== "recruiter") {
          router.replace("/talent/dashboard");
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
      await authApi.sendPhoneOtp(toE164(phone));
      setOtpSent(true);
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      setError(e.response?.data?.message || "Could not send OTP.");
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
      setError(e.response?.data?.message || "Invalid OTP.");
    }
  };

  const finalize = async () => {
    setError(null);
    setSubmitting(true);
    try {
      if (!phoneVerified) throw new Error("Please verify your phone number first.");
      if (!roles.length) throw new Error("Please select at least one role.");
      if (!independent && !companyName.trim()) throw new Error("Please enter your organization name.");
      if (!industry.trim()) throw new Error("Please select your industry.");
      if (!city.trim()) throw new Error("Please enter your city.");

      const finalCompany = independent ? `${contactName.trim()} (Independent)` : companyName.trim();
      const payload = {
        company_name: finalCompany,
        contact_name: contactName.trim() || undefined,
        industry: industry.trim() || undefined,
        location: { city: city.trim(), country: "India" },
        specialties: roles,
        company_website: website.trim() || undefined,
        is_independent: independent || undefined,
      };

      try {
        await recruiterApi.getMyProfile();
        await recruiterApi.updateProfile(payload);
      } catch {
        await recruiterApi.createProfile(payload as { company_name: string } & typeof payload);
      }

      await authApi.completeOnboarding();
      await fetchUser();
      router.replace("/recruiter/welcome");
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
      <h1 className="text-3xl font-extrabold tracking-tight">Complete your recruiter profile</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Google verified your email. Please complete the remaining RootIn-required details.
      </p>

      <div className="mt-6 space-y-3">
        <label className="block">
          <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Contact name</span>
          <input value={contactName} onChange={(e) => setContactName(e.target.value)} className="mt-1 w-full rounded-xl border px-4 py-3 text-sm" placeholder="Your full name" />
        </label>
        <label className="block">
          <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Email (verified by Google)</span>
          <input value={email} disabled className="mt-1 w-full cursor-not-allowed rounded-xl border bg-muted px-4 py-3 text-sm opacity-70" />
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
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Roles (select at least one)</span>
          <div className="mt-2 grid grid-cols-2 gap-2">
            {ROLE_OPTIONS.map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setRoles((cur) => (cur.includes(r) ? cur.filter((x) => x !== r) : [...cur, r]))}
                className={`rounded-xl border px-3 py-2 text-left text-sm ${roles.includes(r) ? "border-primary bg-primary/5 font-semibold" : ""}`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={independent} onChange={(e) => setIndependent(e.target.checked)} />
          I work independently
        </label>
        {!independent && (
          <label className="block">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Organization name</span>
            <input value={companyName} onChange={(e) => setCompanyName(e.target.value)} className="mt-1 w-full rounded-xl border px-4 py-3 text-sm" placeholder="e.g. R1 Casting Agency" />
          </label>
        )}
        <label className="block">
          <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Industry</span>
          <input value={industry} onChange={(e) => setIndustry(e.target.value)} className="mt-1 w-full rounded-xl border px-4 py-3 text-sm" placeholder="e.g. Film" />
        </label>
        <label className="block">
          <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">City</span>
          <input value={city} onChange={(e) => setCity(e.target.value)} className="mt-1 w-full rounded-xl border px-4 py-3 text-sm" placeholder="e.g. Mumbai" />
        </label>
        <label className="block">
          <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Website (optional)</span>
          <input value={website} onChange={(e) => setWebsite(e.target.value)} className="mt-1 w-full rounded-xl border px-4 py-3 text-sm" placeholder="https://..." />
        </label>
      </div>

      {error && <p className="mt-4 rounded-xl bg-red-500/10 px-4 py-3 text-sm font-medium text-red-700" role="alert">{error}</p>}

      <button type="button" onClick={finalize} disabled={submitting} className="mt-6 flex min-h-[3.25rem] w-full items-center justify-center gap-2 rounded-xl bg-primary text-base font-bold text-primary-foreground disabled:opacity-60">
        {submitting ? <Loader2 className="size-5 animate-spin" /> : "Finish setup"}
      </button>
    </main>
  );
}
