"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronRight } from "lucide-react";
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

const PROFESSIONS = [
  "Actor", "Model", "Content Creator",
  "Dancer", "Musician", "Voice Artist", "Photographer",
  "Other",
];

export default function TalentSignupPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>(1);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    profession: "",
    customProfession: "",
    fullName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });

  const totalSteps = 3;

  const validateStep1 = () => {
    if (!formData.profession) {
      setError("Please select your profession");
      return false;
    }
    if (formData.profession === "Other" && !formData.customProfession.trim()) {
      setError("Please enter your profession");
      return false;
    }
    return true;
  };

  const validateStep2 = () => {
    if (!formData.fullName.trim()) {
      setError("Full name is required");
      return false;
    }
    if (!formData.email.match(EMAIL_REGEX)) {
      setError("Enter a valid email address");
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
        role: "talent",
        email: formData.email,
        phone: `+91${formData.phone}`,
        password: formData.password,
        auth_provider: "credentials",
      });
      router.push(`/auth/verify-email?email=${encodeURIComponent(formData.email)}`);
    } catch (err: any) {
      setError(getApiErrorMessage(err, "Registration failed"));
    } finally {
      setLoading(false);
    }
  };

  const stepTitle =
    step === 1 ? "Your Profession" :
    step === 2 ? "Your Details" :
    "Secure Your Account";

  const passwordRules = [
    { ok: formData.password.length >= 8, text: "At least 8 characters" },
    { ok: /[A-Z]/.test(formData.password), text: "One uppercase letter" },
    { ok: /\d/.test(formData.password), text: "One number" },
  ];

  return (
    <AuthLayout subtitle="Create your talent account" showGlow>
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
            <div className="space-y-5">
              <p className="text-sm text-text-tertiary mb-4">
                Select your primary profession to personalize your experience.
              </p>

              <div className="grid grid-cols-2 gap-3">
                {PROFESSIONS.map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => {
                      setFormData((f) => ({ ...f, profession: p }));
                      setError(null);
                    }}
                    className={`relative rounded-xl border-2 p-4 text-center transition-all ${
                      formData.profession === p
                        ? "border-brand bg-brand-light"
                        : "border-border bg-card hover:border-border"
                    }`}
                  >
                    <div className="font-medium text-sm text-text-primary">{p}</div>
                    {formData.profession === p && (
                      <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-brand flex items-center justify-center">
                        <ChevronRight className="w-3 h-3 text-on-brand" strokeWidth={2.5} />
                      </div>
                    )}
                  </button>
                ))}
              </div>

              {formData.profession === "Other" && (
                <TextInput
                  label="Your Profession"
                  value={formData.customProfession}
                  onChange={(e) =>
                    setFormData((f) => ({ ...f, customProfession: e.target.value }))
                  }
                  placeholder="Enter your profession"
                />
              )}

              <Button
                type="button"
                variant="dark"
                className="w-full"
                onClick={handleNext}
                disabled={
                  !formData.profession ||
                  (formData.profession === "Other" && !formData.customProfession.trim())
                }
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
                label="Full Name"
                value={formData.fullName}
                onChange={(e) =>
                  setFormData((f) => ({ ...f, fullName: e.target.value }))
                }
                placeholder="As on your ID"
              />

              <TextInput
                label="Email Address"
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData((f) => ({ ...f, email: e.target.value }))
                }
                placeholder="you@example.com"
              />

              <PhoneInput
                label="Mobile Number"
                value={formData.phone}
                onChange={(val) => setFormData((f) => ({ ...f, phone: val }))}
                showFlag
                placeholder="9876543210"
              />
              <p className="text-xs text-text-muted -mt-2">
                OTP will be sent to verify this number
              </p>

              <div className="flex gap-3 pt-2">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={handleBack}
                >
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
                <Button
                  type="button"
                  variant="secondary"
                  onClick={handleBack}
                >
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
