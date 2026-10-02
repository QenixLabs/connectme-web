"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Loader2, Mail, Phone, User } from "lucide-react";
import { authApi, recruiterApi } from "@/lib/api";
import { useAuthStore } from "@/providers/auth-store-provider";
import { OtpInput } from "@/components/ui/otp-input";
import { StepHeader, FooterFlourish } from "./brand";
import { StepAccount, type AccountValues } from "./step-account";
import { StepRoles } from "./step-roles";
import { StepOrganization, type OrgValues } from "./step-organization";
import { VerifyStep } from "./verify-step";
import { Field, inputClass } from "./field";

const TOTAL_STEPS = 3;

/** Maps the display labels to the company_size values the API expects. */
const COMPANY_SIZE_MAP: Record<string, string> = {
  "Just me": "1-10",
  "2 - 10": "1-10",
  "11 - 50": "11-50",
  "51 - 200": "51-200",
  "200+": "500+",
};

function companySizeToOption(companySize?: string): string {
  if (!companySize) return "";
  if (companySize === "1-10") return "2 - 10";
  if (companySize === "500+") return "200+";
  return companySize;
}

function yearsBucketToFoundedYear(bucket: string): number | undefined {
  const year = new Date().getFullYear();
  const normalized = bucket.trim().toLowerCase();
  if (!normalized) return undefined;
  if (normalized.includes("less than")) return year;
  if (normalized.startsWith("1 -") || normalized.startsWith("1-")) return year - 2;
  if (normalized.startsWith("3 -") || normalized.startsWith("3-")) return year - 4;
  if (normalized.startsWith("5 -") || normalized.startsWith("5-")) return year - 7;
  if (normalized.startsWith("10")) return year - 12;
  return undefined;
}

function parseCityString(city: string): { city?: string; state?: string; country?: string } | undefined {
  const parts = city.split(",").map((p) => p.trim()).filter(Boolean);
  if (parts.length === 0) return undefined;
  if (parts.length === 1) return { city: parts[0] };
  if (parts.length === 2) return { city: parts[0], state: parts[1] };
  return { city: parts[0], state: parts[1], country: parts.slice(2).join(", ") };
}

export function RecruiterSignup({ isGoogleResume = false }: { isGoogleResume?: boolean }) {
  const [step, setStep] = useState(1);
  const [account, setAccount] = useState<AccountValues>({
    fullName: "",
    email: "",
    phone: "",
    password: "",
  });
  const [roles, setRoles] = useState<string[]>([]);
  const [org, setOrg] = useState<OrgValues>({
    name: "",
    industry: "",
    city: "",
    website: "",
    years: "",
    teamSize: "",
    independent: false,
  });
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [signupError, setSignupError] = useState<string | null>(null);
  if (isGoogleResume) return <GoogleRecruiterOnboarding />;

  const goTo = (next: number) => {
    setStep(next);
    if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleFinish = async () => {
    setSignupError(null);
    setSubmitting(true);
    try {
      const contactName = account.fullName.trim();
      const companyName = org.independent
        ? contactName
          ? `${contactName} (Independent)`
          : undefined
        : org.name.trim() || undefined;
      await authApi.signup({
        name: contactName,
        email: account.email.trim(),
        phone: account.phone.replace(/\D/g, "").slice(-10),
        password: account.password,
        role: "recruiter",
        verification_method: "email",
        specialties: roles,
        company_name: companyName,
        company_website: org.website.trim() || undefined,
        company_size: org.teamSize ? (COMPANY_SIZE_MAP[org.teamSize] ?? org.teamSize) : undefined,
        contact_name: contactName || undefined,
        industry: org.industry || undefined,
        city: org.city.trim() || undefined,
        years_in_business: org.years || undefined,
        founded_year: org.years ? yearsBucketToFoundedYear(org.years) : undefined,
        is_independent: org.independent || undefined,
      });
      goTo(4);
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      setSignupError(
        e.response?.data?.message || "Could not create your account. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const completeProfile = async () => {
    try {
      const uploadedLogo = logoFile ? await recruiterApi.uploadProfilePhoto(logoFile) : null;
      const contactName = account.fullName.trim();
      await recruiterApi.updateProfile({
        contact_name: contactName || undefined,
        industry: org.industry || undefined,
        location: org.city ? parseCityString(org.city) : undefined,
        specialties: roles.length > 0 ? roles : undefined,
        profile_photo: uploadedLogo?.signedUrl,
        company_name: org.independent
          ? contactName
            ? `${contactName} (Independent)`
            : undefined
          : org.name.trim() || undefined,
        years_in_business: org.years || undefined,
        founded_year: org.years ? yearsBucketToFoundedYear(org.years) : undefined,
        is_independent: org.independent || undefined,
      });
    } catch {
      // Account creation and verification should not fail because profile polish failed.
    }
  };

  const footerLines =
    step === 1
      ? ["Hire", "Collaborate", "Create", "Grow"]
      : step === 2
        ? ["Great", "Collaborations", "Create", "Great Work"]
        : step === 3
          ? ["More", "Stories", "Together"]
          : ["You", "Made", "It"];

  return (
    <main className="app-shell signup-shell onboarding-theme">
      <div className="screen signup-screen flex flex-col overflow-visible pb-2">
        <StepHeader
          step={Math.min(step, TOTAL_STEPS)}
          total={TOTAL_STEPS}
          onBack={() => goTo(Math.max(1, step - 1))}
        />
        <div className="px-4 pt-3 sm:px-7 sm:pt-5">
          {step === 1 && (
            <StepAccount values={account} onChange={setAccount} onContinue={() => goTo(2)} />
          )}
          {step === 2 && (
            <StepRoles
              selected={roles}
              onToggle={(id) =>
                setRoles((current) =>
                  current.includes(id) ? current.filter((r) => r !== id) : [...current, id],
                )
              }
              onContinue={() => goTo(3)}
            />
          )}
          {step === 3 && (
            <StepOrganization
              values={org}
              onChange={setOrg}
              onLogoChange={setLogoFile}
              onSubmit={handleFinish}
              submitting={submitting}
              error={signupError}
            />
          )}
          {step === 4 && (
            <VerifyStep
              email={account.email}
              password={account.password}
              onBack={() => goTo(3)}
              onVerified={completeProfile}
            />
          )}
        </div>
        <FooterFlourish lines={footerLines} />
      </div>
    </main>
  );
}

type GoogleRecruiterAccount = {
  contactName: string;
  phone: string;
};

function toE164(phone: string) {
  const digits = phone.replace(/\D/g, "");
  if (digits.length === 10) return `+91${digits}`;
  if (digits.length === 12 && digits.startsWith("91")) return `+${digits}`;
  return phone.startsWith("+") ? phone : `+${digits}`;
}

function GoogleRecruiterAccountStep({
  account,
  setAccount,
  email,
  phoneVerified,
  setPhoneVerified,
  onContinue,
}: {
  account: GoogleRecruiterAccount;
  setAccount: (account: GoogleRecruiterAccount) => void;
  email: string;
  phoneVerified: boolean;
  setPhoneVerified: (verified: boolean) => void;
  onContinue: () => void;
}) {
  const fetchUser = useAuthStore((state) => state.fetchUser);
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const update = (field: keyof GoogleRecruiterAccount, value: string) => {
    setAccount({ ...account, [field]: value });
  };

  const handlePhoneChange = (value: string) => {
    update("phone", value.replace(/\D/g, "").slice(0, 10));
    setPhoneVerified(false);
    setOtpSent(false);
    setOtp("");
  };

  const handleSendOtp = async () => {
    if (account.phone.length !== 10) {
      setError("Enter a valid 10-digit mobile number first.");
      return;
    }
    setError(null);
    setSendingOtp(true);
    try {
      await authApi.sendPhoneOtp(toE164(account.phone));
      setOtpSent(true);
      setOtp("");
    } catch (err: unknown) {
      const response = err as { response?: { data?: { message?: string } } };
      setError(response.response?.data?.message || "Could not send OTP. Please try again.");
    } finally {
      setSendingOtp(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (otp.length < 6) return;
    setError(null);
    setVerifyingOtp(true);
    try {
      await authApi.verifyPhoneOtp(toE164(account.phone), otp);
      setPhoneVerified(true);
      await fetchUser();
    } catch (err: unknown) {
      const response = err as { response?: { data?: { message?: string } } };
      setError(response.response?.data?.message || "Invalid OTP. Please try again.");
    } finally {
      setVerifyingOtp(false);
    }
  };

  const handleContinue = (event: React.FormEvent) => {
    event.preventDefault();
    if (!account.contactName.trim()) {
      setError("Enter your full name.");
      return;
    }
    if (account.phone.length !== 10 || !phoneVerified) {
      setError("Verify your mobile number before continuing.");
      return;
    }
    setError(null);
    onContinue();
  };

  return (
    <form className="space-y-4" onSubmit={handleContinue} noValidate>
      <section
        className="relative -mx-4 h-[22vh] w-[calc(100%+2rem)] bg-cover bg-center bg-no-repeat sm:-mx-7 sm:w-[calc(100%+3.5rem)]"
        style={{ backgroundImage: "url('/images/recruiter-hero.png')" }}
      >
        <div className="absolute inset-0 bg-white/45" />
        <div className="relative flex h-full items-center px-6 sm:px-10">
          <div className="max-w-[20rem]">
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
              Welcome to RootIn
            </p>
            <h1 className="mt-2 text-[clamp(25px,5vw,36px)] font-bold leading-[1.05] text-[#080B2B]">
              Finish your <span className="text-[#5B32FF]">recruiter account</span>
            </h1>
            <p className="mt-3 text-[clamp(10px,2.5vw,15px)] leading-[1.4] text-[#555C7A]">
              Google verified your email. Add your contact details to continue.
            </p>
          </div>
        </div>
      </section>

      <div className="flex items-center gap-3 rounded-2xl border border-primary/20 bg-accent/40 px-4 py-3">
        <CheckCircle2 className="size-5 shrink-0 text-green-600" />
        <div className="min-w-0">
          <p className="text-sm font-bold text-foreground">Google account verified</p>
          <p className="truncate text-xs text-muted-foreground">{email}</p>
        </div>
      </div>

      <div className="space-y-3">
        <Field icon={<User className="size-5" />} label="Contact Name" required>
          <input
            required
            autoComplete="name"
            className={inputClass}
            placeholder="e.g. Karan Mehta"
            value={account.contactName}
            onChange={(event) => update("contactName", event.target.value)}
          />
        </Field>

        <Field icon={<Mail className="size-5" />} label="Work Email">
          <input
            type="email"
            value={email}
            disabled
            className={`${inputClass} cursor-not-allowed opacity-60`}
          />
        </Field>

        <Field
          icon={<Phone className="size-5" />}
          label="Mobile Number"
          required
          trailing={
            <button
              type="button"
              onClick={() => void handleSendOtp()}
              disabled={sendingOtp || account.phone.length !== 10 || phoneVerified}
              className="shrink-0 rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground disabled:cursor-not-allowed disabled:opacity-50"
            >
              {sendingOtp ? "Sending..." : phoneVerified ? "Verified" : "Send OTP"}
            </button>
          }
        >
          <input
            required
            inputMode="numeric"
            maxLength={10}
            autoComplete="tel"
            className={inputClass}
            placeholder="98765 43210"
            value={account.phone}
            onChange={(event) => handlePhoneChange(event.target.value)}
          />
        </Field>
      </div>

      {phoneVerified ? (
        <p className="text-xs font-semibold text-green-600">
          <CheckCircle2 className="mr-1 inline size-3.5 align-[-0.15rem]" />
          Phone number verified
        </p>
      ) : null}

      {otpSent && !phoneVerified ? (
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-xs font-bold uppercase tracking-[0.12em] text-muted-foreground">
            Enter phone OTP
          </p>
          <OtpInput value={otp} onChange={setOtp} className="mt-3" />
          <button
            type="button"
            onClick={() => void handleVerifyOtp()}
            disabled={verifyingOtp || otp.length < 6}
            className="mt-3 min-h-10 w-full rounded-lg border border-primary bg-transparent text-sm font-bold text-primary disabled:cursor-not-allowed disabled:opacity-50"
          >
            {verifyingOtp ? "Verifying..." : "Verify phone number"}
          </button>
        </div>
      ) : null}

      {error ? (
        <p className="rounded-2xl bg-destructive/10 px-4 py-3 text-sm font-medium text-destructive" role="alert">
          {error}
        </p>
      ) : null}

      <button
        type="submit"
        className="gradient-cta shadow-button flex w-full items-center justify-center gap-2 rounded-2xl px-6 py-4 text-lg font-semibold text-primary-foreground"
      >
        Continue
      </button>
    </form>
  );
}

function GoogleRecruiterOnboarding() {
  const router = useRouter();
  const fetchUser = useAuthStore((state) => state.fetchUser);
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [account, setAccount] = useState<GoogleRecruiterAccount>({ contactName: "", phone: "" });
  const [phoneVerified, setPhoneVerified] = useState(false);
  const [roles, setRoles] = useState<string[]>([]);
  const [org, setOrg] = useState<OrgValues>({
    name: "",
    industry: "",
    city: "",
    website: "",
    years: "",
    teamSize: "",
    independent: false,
  });
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [hasProfile, setHasProfile] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const loadDraft = async () => {
      try {
        const { user } = await authApi.getCurrentUser();
        if (user.role !== "recruiter") {
          router.replace("/talent/dashboard");
          return;
        }
        if (user.onboarding_completed || user.onboarding_exempted) {
          router.replace("/recruiter/dashboard");
          return;
        }

        let profile: Awaited<ReturnType<typeof recruiterApi.getMyProfile>> | null = null;
        try {
          profile = await recruiterApi.getMyProfile();
        } catch {
          // Google recruiter accounts do not have a profile until this flow creates one.
        }

        if (cancelled) return;
        setEmail(user.email ?? "");
        setAccount({
          contactName: profile?.contact_name || user.google_name || "",
          phone: user.phone?.replace(/\D/g, "").slice(-10) || "",
        });
        setPhoneVerified(Boolean(user.is_phone_verified));
        setHasProfile(Boolean(profile));
        setRoles(profile?.specialties ?? []);
        setOrg({
          name: profile?.company_name || "",
          industry: profile?.industry || "",
          city: [profile?.location?.city, profile?.location?.state, profile?.location?.country]
            .filter(Boolean)
            .join(", "),
          website: profile?.company_website || "",
          years: profile?.years_in_business || "",
          teamSize: companySizeToOption(profile?.company_size),
          independent: Boolean(profile?.is_independent),
        });
      } catch {
        if (!cancelled) router.replace("/auth?mode=signin");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    void loadDraft();
    return () => {
      cancelled = true;
    };
  }, [router]);

  const finishOnboarding = async () => {
    setError(null);
    setSubmitting(true);
    try {
      if (!phoneVerified) throw new Error("Please verify your phone number first.");

      const contactName = account.contactName.trim();
      const companyName = org.independent
        ? `${contactName} (Independent)`
        : org.name.trim();
      const payload = {
        company_name: companyName,
        contact_name: contactName,
        industry: org.industry || undefined,
        location: parseCityString(org.city),
        specialties: roles,
        company_website: org.website.trim() || undefined,
        company_size: org.teamSize ? (COMPANY_SIZE_MAP[org.teamSize] ?? org.teamSize) : undefined,
        years_in_business: org.years || undefined,
        founded_year: org.years ? yearsBucketToFoundedYear(org.years) : undefined,
        is_independent: org.independent,
      };

      if (hasProfile) {
        await recruiterApi.updateProfile(payload);
      } else {
        await recruiterApi.createProfile(payload);
        setHasProfile(true);
      }

      if (logoFile) {
        await recruiterApi.uploadProfilePhoto(logoFile);
      }

      await authApi.completeOnboarding();
      await fetchUser();
      router.replace("/recruiter/welcome");
    } catch (err: unknown) {
      const response = err as { response?: { data?: { message?: string } } };
      setError(
        response.response?.data?.message ||
          (err instanceof Error ? err.message : "Could not complete your profile. Please try again."),
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <main className="flex min-h-svh items-center justify-center bg-background">
        <Loader2 className="size-8 animate-spin text-primary" />
      </main>
    );
  }

  return (
    <main className="min-h-svh overflow-x-hidden bg-background text-foreground">
      <div className="relative mx-auto min-h-svh w-full max-w-[56rem] overflow-hidden bg-card shadow-[0_0_80px_rgba(55,33,110,0.14)]">
        <div className="relative z-10 min-h-svh w-full px-4 pb-12 pt-5 sm:px-7 sm:pt-8">
          <StepHeader step={step} total={3} onBack={() => setStep((current) => Math.max(1, current - 1))} />
          {step === 1 ? (
            <GoogleRecruiterAccountStep
              account={account}
              setAccount={setAccount}
              email={email}
              phoneVerified={phoneVerified}
              setPhoneVerified={setPhoneVerified}
              onContinue={() => setStep(2)}
            />
          ) : null}
          {step === 2 ? (
            <StepRoles
              selected={roles}
              onToggle={(id) =>
                setRoles((current) =>
                  current.includes(id) ? current.filter((role) => role !== id) : [...current, id],
                )
              }
              onContinue={() => setStep(3)}
            />
          ) : null}
          {step === 3 ? (
            <StepOrganization
              values={org}
              onChange={setOrg}
              onLogoChange={setLogoFile}
              onSubmit={() => void finishOnboarding()}
              submitting={submitting}
              error={error}
              submitLabel="Finish setup"
              submittingLabel="Finishing setup..."
            />
          ) : null}
        </div>
      </div>
    </main>
  );
}
