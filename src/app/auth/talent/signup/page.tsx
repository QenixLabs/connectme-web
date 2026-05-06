"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { authApi } from "@/lib/api";

type Step = 1 | 2 | 3;

const PROFESSIONS = [
  "Actor", "Model", "Content Creator",
  "Dancer", "Musician", "Voice Artist", "Photographer",
  "Other",
];

const INDUSTRIES = [
  "Bollywood", "OTT / Streaming", "Advertising",
  "Digital Content", "Theatre", "Fashion", "Corporate", "Events",
];

export default function TalentSignupPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>(1);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState({
    profession: "",
    customProfession: "",
    fullName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    industry: "",
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
    if (!formData.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      setError("Enter a valid email address");
      return false;
    }
    if (!formData.phone.match(/^[6-9]\d{9}$/)) {
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
      const payload = {
        role: "talent" as const,
        email: formData.email,
        phone: `+91${formData.phone}`,
        password: formData.password,
        auth_provider: "credentials",
      };

      await authApi.signup(payload);
      router.push(`/auth/verify-email?email=${encodeURIComponent(formData.email)}`);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  const passwordStrength = (pw: string) => {
    let score = 0;
    if (pw.length >= 8) score++;
    if (/[A-Z]/.test(pw)) score++;
    if (/\d/.test(pw)) score++;
    if (/[^A-Za-z0-9]/.test(pw)) score++;
    const levels = [
      { label: "", color: "bg-surface-secondary" },
      { label: "Weak", color: "bg-strength-weak" },
      { label: "Fair", color: "bg-strength-fair" },
      { label: "Good", color: "bg-strength-good" },
      { label: "Strong", color: "bg-strength-strong" },
    ];
    return { score, ...levels[score] };
  };

  const strength = passwordStrength(formData.password);

  return (
    <div className="min-h-screen bg-page flex items-center justify-center px-4 py-12">
      <div className="fixed inset-0 pointer-events-none" style={{
        background: "radial-gradient(ellipse 70% 50% at 50% -5%, var(--glow) 0%, transparent 60%)",
      }} />

      <div className="relative w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-block text-2xl font-bold text-text-primary">
            Connect<span className="text-brand">Me</span>
          </Link>
          <p className="mt-2 text-sm text-text-tertiary font-light">
            Create your talent account
          </p>
        </div>

        <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
          {/* Progress Bar */}
          <div className="h-1 w-full bg-muted-bg">
            <div
              className="h-full bg-gradient-to-r from-brand to-brand-light transition-all duration-500"
              style={{ width: `${(step / totalSteps) * 100}%` }}
            />
          </div>

          <div className="px-8 py-8">
            {/* Step Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-xl font-bold text-text-primary">
                  {step === 1 && "Your Profession"}
                  {step === 2 && "Your Details"}
                  {step === 3 && "Secure Your Account"}
                </h1>
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

            {/* Error */}
            {error && (
              <div className="mb-4 flex items-start gap-2.5 bg-error-surface border border-error-border text-error-text rounded-lg px-4 py-3 text-sm">
                <svg className="w-4 h-4 mt-0.5 flex-shrink-0" viewBox="0 0 16 16" fill="none">
                  <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5" />
                  <path d="M8 5v3.5M8 11v.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
                {error}
              </div>
            )}

            {/* STEP 1: Profession */}
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
                      onClick={() => { setFormData((f) => ({ ...f, profession: p })); setError(null); }}
className={`relative rounded-xl border-2 p-4 text-center transition-all ${
                          formData.profession === p
                            ? "border-brand bg-brand-light"
                            : "border-border bg-card hover:border-border"
                        }`}
                    >
                      <div className="font-medium text-sm text-text-primary">{p}</div>
                      {formData.profession === p && (
                        <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-brand flex items-center justify-center">
                          <svg className="w-3 h-3 text-white" viewBox="0 0 12 12" fill="none">
                            <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </div>
                      )}
                    </button>
                  ))}
                </div>

                {formData.profession === "Other" && (
                  <div>
                    <label className="block text-xs font-medium text-text-secondary mb-1.5 tracking-wide uppercase">
                      Your Profession
                    </label>
                    <input
                      type="text"
                      value={formData.customProfession}
                      onChange={(e) => setFormData((f) => ({ ...f, customProfession: e.target.value }))}
                      placeholder="Enter your profession"
                      className="w-full h-11 px-4 rounded-lg border border-border bg-page text-text-primary text-sm placeholder:text-text-placeholder focus:outline-none focus:ring-2 focus:ring-brand-focus focus:bg-card transition-all"
                    />
                  </div>
                )}

                <button
                  type="button"
                  onClick={handleNext}
                  disabled={!formData.profession || (formData.profession === "Other" && !formData.customProfession.trim())}
                  className="w-full h-11 rounded-lg bg-surface-dark text-white text-sm font-medium hover:bg-surface-darker active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1.5"
                >
                  Continue
                  <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none">
                    <path d="M6 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              </div>
            )}

            {/* STEP 2: Details */}
            {step === 2 && (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-text-secondary mb-1.5 tracking-wide uppercase">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={formData.fullName}
                    onChange={(e) => setFormData((f) => ({ ...f, fullName: e.target.value }))}
                    placeholder="As on your ID"
                    className="w-full h-11 px-4 rounded-lg border border-border bg-page text-text-primary text-sm placeholder:text-text-placeholder focus:outline-none focus:ring-2 focus:ring-brand-focus focus:bg-card transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-text-secondary mb-1.5 tracking-wide uppercase">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData((f) => ({ ...f, email: e.target.value }))}
                    placeholder="you@example.com"
                    className="w-full h-11 px-4 rounded-lg border border-border bg-page text-text-primary text-sm placeholder:text-text-placeholder focus:outline-none focus:ring-2 focus:ring-brand-focus focus:bg-card transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-text-secondary mb-1.5 tracking-wide uppercase">
                    Mobile Number
                  </label>
                  <div className="flex">
                    <div className="flex items-center px-3 h-11 border border-r-0 border-border rounded-l-lg bg-muted-bg text-text-tertiary text-sm select-none">
                      🇮🇳 +91
                    </div>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData((f) => ({ ...f, phone: e.target.value.replace(/\D/g, "").slice(0, 10) }))}
                      placeholder="9876543210"
                      className="flex-1 h-11 px-4 rounded-r-lg border border-border bg-page text-text-primary text-sm placeholder:text-text-placeholder focus:outline-none focus:ring-2 focus:ring-brand-focus focus:bg-card transition-all"
                    />
                  </div>
                  <p className="text-xs text-text-muted mt-1">OTP will be sent to verify this number</p>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={handleBack}
                    className="h-11 px-5 rounded-lg border border-border text-text-secondary text-sm hover:bg-page active:scale-[0.98] transition-all"
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={handleNext}
                    className="flex-1 h-11 rounded-lg bg-surface-dark text-white text-sm font-medium hover:bg-surface-darker active:scale-[0.98] transition-all flex items-center justify-center gap-1.5"
                  >
                    Continue
                    <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none">
                      <path d="M6 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                </div>
              </div>
            )}

            {/* STEP 3: Password */}
            {step === 3 && (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-text-secondary mb-1.5 tracking-wide uppercase">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={formData.password}
                      onChange={(e) => setFormData((f) => ({ ...f, password: e.target.value }))}
                      placeholder="Min. 8 characters"
                      className="w-full h-11 px-4 pr-11 rounded-lg border border-border bg-page text-text-primary text-sm placeholder:text-text-placeholder focus:outline-none focus:ring-2 focus:ring-brand-focus focus:bg-card transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-secondary transition-colors"
                      tabIndex={-1}
                    >
                      <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none">
                        <path d="M2 8s2.5-4 6-4 6 4 6 4-2.5 4-6 4-6-4-6-4z" stroke="currentColor" strokeWidth="1.3" />
                        <circle cx="8" cy="8" r="1.5" stroke="currentColor" strokeWidth="1.3" />
                      </svg>
                    </button>
                  </div>

                  {formData.password.length > 0 && (
                    <div className="mt-2">
                      <div className="flex gap-1 mb-1">
                        {Array.from({ length: 4 }).map((_, i) => (
                          <div
                            key={i}
                            className={`h-1 flex-1 rounded-full transition-all ${
                              i < strength.score ? strength.color : "bg-surface-secondary"
                            }`}
                          />
                        ))}
                      </div>
                      {strength.label && (
                        <p className="text-xs text-text-muted">
                          Strength: <span className="font-medium text-text-secondary">{strength.label}</span>
                        </p>
                      )}
                    </div>
                  )}

                  <ul className="mt-2 space-y-0.5">
                    {[
                      { ok: formData.password.length >= 8, text: "At least 8 characters" },
                      { ok: /[A-Z]/.test(formData.password), text: "One uppercase letter" },
                      { ok: /\d/.test(formData.password), text: "One number" },
                    ].map((r) => (
                      <li key={r.text} className={`flex items-center gap-1.5 text-xs transition-colors ${r.ok ? "text-success-text" : "text-text-muted"}`}>
                        <svg className="w-3 h-3" viewBox="0 0 12 12" fill="none">
                          {r.ok ? (
                            <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                          ) : (
                            <circle cx="6" cy="6" r="4" stroke="currentColor" strokeWidth="1.2" />
                          )}
                        </svg>
                        {r.text}
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <label className="block text-xs font-medium text-text-secondary mb-1.5 tracking-wide uppercase">
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData((f) => ({ ...f, confirmPassword: e.target.value }))}
                    placeholder="Re-enter your password"
                    className={`w-full h-11 px-4 rounded-lg border bg-page text-text-primary text-sm placeholder:text-text-placeholder focus:outline-none focus:ring-2 focus:ring-brand-focus focus:bg-card transition-all ${
                      formData.confirmPassword && formData.confirmPassword !== formData.password
                        ? "border-error-border-strong"
                        : "border-border"
                    }`}
                  />
                  {formData.confirmPassword && formData.confirmPassword !== formData.password && (
                    <p className="text-xs text-error mt-1">Passwords do not match</p>
                  )}
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={handleBack}
                    className="h-11 px-5 rounded-lg border border-border text-text-secondary text-sm hover:bg-page active:scale-[0.98] transition-all"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 h-11 rounded-lg bg-brand text-white text-sm font-medium hover:bg-brand-hover active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <svg className="w-4 h-4 animate-spin" viewBox="0 0 16 16" fill="none">
                          <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="2" strokeOpacity="0.3" />
                          <path d="M14 8a6 6 0 0 0-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                        </svg>
                        Creating account...
                      </>
                    ) : (
                      "Create account"
                    )}
                  </button>
                </div>
              </form>
            )}

            {step === 1 && (
              <>
                <div className="relative my-5">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-border-subtle" />
                  </div>
                  <div className="relative flex justify-center">
                    <span className="bg-card px-3 text-xs text-text-muted">Already have an account?</span>
                  </div>
                </div>
                <Link
                  href="/auth/login"
                  className="block w-full h-11 rounded-lg border border-border text-text-primary text-sm font-medium hover:bg-page active:scale-[0.98] transition-all flex items-center justify-center"
                >
                  Sign in instead
                </Link>
              </>
            )}
          </div>
        </div>

        <p className="text-center text-xs text-text-muted mt-6">
          By creating an account you agree to our{" "}
          <Link href="/terms" className="text-text-tertiary hover:text-text-primary underline underline-offset-2">Terms</Link>{" "}
          and{" "}
          <Link href="/privacy" className="text-text-tertiary hover:text-text-primary underline underline-offset-2">Privacy Policy</Link>
        </p>
      </div>
    </div>
  );
}