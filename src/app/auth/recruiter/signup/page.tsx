"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronRight, Check } from "lucide-react";
import { authApi } from "@/lib/api";
import { getApiErrorMessage } from "@/lib/formatters";
import { EMAIL_REGEX, PHONE_REGEX } from "@/lib/validation";
import { AuthLayout } from "@/components/layout/auth-layout";
import { Card } from "@/components/ui/card";
import { ErrorBanner } from "@/components/ui/error-banner";
import { TextInput } from "@/components/ui/text-input";
import { PasswordInput } from "@/components/ui/password-input";
import { PhoneInput } from "@/components/ui/phone-input";
import { Button } from "@/components/ui/button";
import { PasswordStrength } from "@/components/ui/password-strength";
import { PasswordRules } from "@/components/ui/password-rules";
import { DividerLabel } from "@/components/ui/divider-label";

type Step = 1 | 2 | 3;

const COMPANY_SIZES = ["1-10", "11-50", "51-200", "201-500", "500+"];

const INDUSTRIES = [
  "Film & Entertainment", "Advertising & Marketing", "Fashion & Lifestyle",
  "E-commerce", "Media & Publishing", "Technology", "Events & Wedding",
  "Corporate", "Other",
];

export default function RecruiterSignupPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>(1);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    companyName: "",
    companyWebsite: "",
    companySize: "",
    industry: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });

  const totalSteps = 3;

  const validateStep1 = () => {
    if (!formData.companyName.trim()) {
      setError("Company name is required");
      return false;
    }
    if (!formData.companySize) {
      setError("Please select company size");
      return false;
    }
    if (!formData.industry) {
      setError("Please select industry");
      return false;
    }
    return true;
  };

  const validateStep2 = () => {
    if (!formData.email.match(EMAIL_REGEX)) {
      setError("Enter a valid work email");
      return false;
    }
    if (!formData.phone.match(PHONE_REGEX)) {
      setError("Enter a valid 10-digit mobile number");
      return false;
    }
    return true;
  };

  const validateStep3 = () => {
    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters");
      return false;
    }
    if (!/[A-Z]/.test(formData.password)) {
      setError("Password must contain at least one uppercase letter");
      return false;
    }
    if (!/\d/.test(formData.password)) {
      setError("Password must contain at least one number");
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return false;
    }
    return true;
  };

  const handleNext = () => {
    setError(null);
    if (step === 1 && !validateStep1()) return;
    if (step === 2 && !validateStep2()) return;
    setStep((s) => Math.min(s + 1, totalSteps) as Step);
  };

  const handleBack = () => {
    setError(null);
    setStep((s) => Math.max(s - 1, 1) as Step);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep3()) return;

    setLoading(true);
    setError(null);

    try {
      await authApi.signup({
        role: "recruiter",
        email: formData.email,
        phone: `+91${formData.phone}`,
        password: formData.password,
        auth_provider: "credentials",
        company_name: formData.companyName,
      });
      router.push(`/auth/verify-email?email=${encodeURIComponent(formData.email)}`);
    } catch (err: any) {
      setError(getApiErrorMessage(err, "Registration failed"));
    } finally {
      setLoading(false);
    }
  };

  const stepTitle =
    step === 1 ? "Company Details" :
    step === 2 ? "Contact Info" :
    "Secure Your Account";

  const passwordRules = [
    { ok: formData.password.length >= 8, text: "At least 8 characters" },
    { ok: /[A-Z]/.test(formData.password), text: "One uppercase letter" },
    { ok: /\d/.test(formData.password), text: "One number" },
  ];

  const selectClassName =
    "w-full h-11 px-4 rounded-lg border border-border bg-page text-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-brand-focus focus:bg-card transition-all appearance-none";

  return (
    <AuthLayout subtitle="Create your recruiter account" showGlow>
      <Card progress={(step / totalSteps) * 100}>
        <div className="px-8 py-8">
          {/* Step Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-xl font-bold text-text-primary">{stepTitle}</h1>
              <p className="text-sm text-text-muted font-light mt-0.5">
                Step {step} of {totalSteps}
              </p>
            </div>
            <div className="flex gap-1.5">
              {Array.from({ length: totalSteps }).map((_, i) => (
                <div
                  key={i}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    i < step ? "bg-brand w-6" : "bg-surface-secondary w-3"
                  }`}
                />
              ))}
            </div>
          </div>

          {error && (
            <ErrorBanner variant="surface" className="mb-4">
              {error}
            </ErrorBanner>
          )}

          {/* STEP 1 */}
          {step === 1 && (
            <div className="space-y-4">
              <TextInput
                label="Company Name"
                value={formData.companyName}
                onChange={(e) =>
                  setFormData((f) => ({ ...f, companyName: e.target.value }))
                }
                placeholder="Your company or agency name"
              />

              <TextInput
                label="Website (Optional)"
                type="url"
                value={formData.companyWebsite}
                onChange={(e) =>
                  setFormData((f) => ({ ...f, companyWebsite: e.target.value }))
                }
                placeholder="https://yourcompany.com"
              />

              <div>
                <label className="block text-xs font-medium text-text-secondary mb-1.5 tracking-wide uppercase">
                  Company Size
                </label>
                <select
                  value={formData.companySize}
                  onChange={(e) =>
                    setFormData((f) => ({ ...f, companySize: e.target.value }))
                  }
                  className={selectClassName}
                >
                  <option value="">Select company size...</option>
                  {COMPANY_SIZES.map((s) => (
                    <option key={s} value={s}>{s} employees</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-text-secondary mb-1.5 tracking-wide uppercase">
                  Industry
                </label>
                <select
                  value={formData.industry}
                  onChange={(e) =>
                    setFormData((f) => ({ ...f, industry: e.target.value }))
                  }
                  className={selectClassName}
                >
                  <option value="">Select industry...</option>
                  {INDUSTRIES.map((i) => (
                    <option key={i} value={i}>{i}</option>
                  ))}
                </select>
              </div>

              <Button
                type="button"
                variant="dark"
                className="w-full mt-2"
                onClick={handleNext}
              >
                Continue
                <ChevronRight className="w-4 h-4" strokeWidth={1.5} />
              </Button>
            </div>
          )}

          {/* STEP 2 */}
          {step === 2 && (
            <div className="space-y-4">
              <TextInput
                label="Work Email"
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData((f) => ({ ...f, email: e.target.value }))
                }
                placeholder="you@company.com"
              />

              <PhoneInput
                label="Mobile Number"
                value={formData.phone}
                onChange={(val) => setFormData((f) => ({ ...f, phone: val }))}
                placeholder="9876543210"
              />
              <p className="text-xs text-text-muted -mt-2">
                OTP will be sent to verify this number
              </p>

              <div className="flex gap-3 pt-2">
                <Button type="button" variant="secondary" onClick={handleBack}>
                  Back
                </Button>
                <Button
                  type="button"
                  variant="dark"
                  className="flex-1"
                  onClick={handleNext}
                >
                  Continue
                  <ChevronRight className="w-4 h-4" strokeWidth={1.5} />
                </Button>
              </div>
            </div>
          )}

          {/* STEP 3 */}
          {step === 3 && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <PasswordInput
                  label="Password"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData((f) => ({ ...f, password: e.target.value }))
                  }
                  placeholder="Min. 8 characters"
                />
                <PasswordStrength password={formData.password} />
                <PasswordRules rules={passwordRules} />
              </div>

              <TextInput
                label="Confirm Password"
                type="password"
                value={formData.confirmPassword}
                onChange={(e) =>
                  setFormData((f) => ({ ...f, confirmPassword: e.target.value }))
                }
                placeholder="Re-enter your password"
                error={
                  !!(
                    formData.confirmPassword &&
                    formData.confirmPassword !== formData.password
                  )
                }
              />
              {formData.confirmPassword &&
                formData.confirmPassword !== formData.password && (
                  <p className="text-xs text-error mt-1">Passwords do not match</p>
                )}

              <div className="flex gap-3 pt-2">
                <Button type="button" variant="secondary" onClick={handleBack}>
                  Back
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  className="flex-1"
                  disabled={loading}
                  isLoading={loading}
                  loadingLabel="Creating account..."
                >
                  Create account
                </Button>
              </div>
            </form>
          )}

          {step === 1 && (
            <>
              <DividerLabel label="Already have an account?" />
              <Link
                href="/auth/login"
                className="block w-full h-11 rounded-lg border border-border text-text-primary text-sm font-medium hover:bg-page active:scale-[0.98] transition-all flex items-center justify-center"
              >
                Sign in instead
              </Link>
            </>
          )}
        </div>
      </Card>

      <p className="text-center text-xs text-text-muted mt-6">
        By creating an account you agree to our{" "}
        <Link href="/terms" className="text-text-tertiary hover:text-text-primary underline underline-offset-2">
          Terms
        </Link>{" "}
        and{" "}
        <Link href="/privacy" className="text-text-tertiary hover:text-text-primary underline underline-offset-2">
          Privacy Policy
        </Link>
      </p>
    </AuthLayout>
  );
}
