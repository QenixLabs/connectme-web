"use client";

import { useState } from "react";
import { authApi, recruiterApi } from "@/lib/api";
import { StepHeader, FooterFlourish } from "./brand";
import { StepAccount, type AccountValues } from "./step-account";
import { StepRoles } from "./step-roles";
import { StepOrganization, type OrgValues } from "./step-organization";
import { VerifyStep } from "./verify-step";

const TOTAL_STEPS = 3;

/** Maps the display labels to the company_size values the API expects. */
const COMPANY_SIZE_MAP: Record<string, string> = {
  "Just me": "1-10",
  "2 - 10": "1-10",
  "11 - 50": "11-50",
  "51 - 200": "51-200",
  "200+": "500+",
};

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

export function RecruiterSignup() {
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
