"use client";

import { useState } from "react";
import { authApi } from "@/lib/api";
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
      await authApi.signup({
        name: account.fullName.trim(),
        email: account.email.trim(),
        phone: account.phone.replace(/\D/g, "").slice(-10),
        password: account.password,
        role: "recruiter",
        verification_method: "email",
        specialties: roles,
        company_name: org.independent ? undefined : org.name.trim() || undefined,
        company_website: org.website.trim() || undefined,
        company_size: org.teamSize ? (COMPANY_SIZE_MAP[org.teamSize] ?? org.teamSize) : undefined,
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

  const footerLines =
    step === 1
      ? ["Hire", "Collaborate", "Create", "Grow"]
      : step === 2
        ? ["Great", "Collaborations", "Create", "Great Work"]
        : step === 3
          ? ["More", "Stories", "Together"]
          : ["You", "Made", "It"];

  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto w-full max-w-2xl px-5 pt-8">
        <StepHeader step={step} total={TOTAL_STEPS} onBack={() => goTo(Math.max(1, step - 1))} />
        <div className="mt-8">
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
            />
          )}
        </div>
        <FooterFlourish lines={footerLines} />
      </div>
    </main>
  );
}
