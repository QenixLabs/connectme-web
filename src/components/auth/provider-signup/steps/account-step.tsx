"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  AlertCircle,
  ArrowRight,
  Check,
  ChevronDown,
  ChevronRight,
  Eye,
  EyeOff,
  Loader2,
  Lock,
  Mail,
  Phone,
  Rocket,
  Search,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  User,
  Users,
} from "lucide-react";
import type { ProviderSignupData, StepProps } from "../types";
import { SignupHeader } from "../signup-header";
import { Stepper } from "../stepper";
import { ProviderStudioVisual } from "../provider-studio-visual";
import { SocialAuthButtons } from "@/components/auth/social-auth-buttons";

type FieldKey = "firstName" | "lastName" | "email" | "phone" | "password";

const FIELD_IDS: Record<FieldKey, string> = {
  firstName: "provider-first-name",
  lastName: "provider-last-name",
  email: "provider-email",
  phone: "provider-phone",
  password: "provider-password",
};

const BENEFITS = [
  {
    title: "More Projects",
    description: "Discover new opportunities.",
    icon: Rocket,
    tone: "bg-[#8738FF]/20 text-[#C7A4FF]",
  },
  {
    title: "Trusted Clients",
    description: "Connect with professionals.",
    icon: Users,
    tone: "bg-[#2875E8]/20 text-[#93C1FF]",
  },
  {
    title: "Grow Your Business",
    description: "Build your service presence.",
    icon: TrendingUp,
    tone: "bg-[#27D9A0]/15 text-[#7CF0C9]",
  },
];

const JOURNEY = [
  { title: "Build your profile", icon: User },
  { title: "Get discovered", icon: Search },
  { title: "Win projects", icon: Sparkles },
];

const PASSWORD_RULES = [
  { label: "8+ characters", test: (value: string) => value.length >= 8 },
  {
    label: "Upper & lowercase",
    test: (value: string) => /[a-z]/.test(value) && /[A-Z]/.test(value),
  },
  { label: "A number", test: (value: string) => /\d/.test(value) },
  {
    label: "A symbol (recommended)",
    test: (value: string) => /[^A-Za-z0-9]/.test(value),
  },
];

const STRENGTH_LEVELS = [
  { label: "Add a password", text: "text-[#9AA6BC]", bar: "bg-[#E1E7F2]" },
  { label: "Too weak", text: "text-[#E5484D]", bar: "bg-[#F43F5E]" },
  { label: "Fair", text: "text-[#D97706]", bar: "bg-[#F59E0B]" },
  { label: "Good", text: "text-[#2875E8]", bar: "bg-[#2875E8]" },
  { label: "Strong", text: "text-[#0F9D74]", bar: "bg-[#27D9A0]" },
];

const inputClass =
  "w-full bg-transparent py-3 text-[14px] font-medium text-[#101333] outline-none placeholder:font-normal placeholder:text-[#9AA6BC]";

function getFieldError(
  key: FieldKey,
  data: ProviderSignupData,
): string | undefined {
  switch (key) {
    case "firstName":
      return data.firstName.trim() ? undefined : "First name is required";
    case "email":
      if (!data.email.trim()) return "Email is required";
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email.trim())
        ? undefined
        : "Please enter a valid email address";
    case "phone": {
      const digits = data.phone.replace(/\D/g, "");
      if (!digits) return "Phone number is required";
      return digits.length < 10
        ? "Phone number must be at least 10 digits"
        : undefined;
    }
    case "password":
      if (!data.password) return "Password is required";
      if (data.password.length < 8)
        return "Password must be at least 8 characters";
      if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(data.password))
        return "Must contain uppercase, lowercase, and a number";
      return undefined;
    default:
      return undefined;
  }
}

function Field({
  id,
  label,
  icon,
  error,
  hint,
  optional = false,
  trailing,
  children,
  className = "",
}: {
  id: string;
  label: string;
  icon: React.ReactNode;
  error?: string | undefined;
  hint?: string | undefined;
  optional?: boolean;
  trailing?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`pb-2 ${className}`}>
      <div className="mb-1.5 flex items-center justify-between gap-2">
        <label
          htmlFor={id}
          className="text-[12px] font-semibold text-[#101333]"
        >
          {label}
          {!optional ? (
            <span className="ml-0.5 text-[#8738FF]" aria-hidden="true">
              *
            </span>
          ) : null}
        </label>
        {optional ? (
          <span className="text-[10px] font-medium text-[#9AA6BC]">
            Optional
          </span>
        ) : null}
      </div>

      <div
        className={`group flex min-h-12 items-center gap-2.5 rounded-xl border bg-white px-3.5 transition-all duration-200 motion-reduce:transition-none ${
          error
            ? "border-[#F43F5E] bg-[#FFF7F8] shadow-[0_0_0_3px_rgba(244,63,94,0.07)]"
            : "border-[#E1E7F2] hover:border-[#CBD5E1] focus-within:border-[#8738FF] focus-within:shadow-[0_0_0_4px_rgba(135,56,255,0.10)]"
        }`}
      >
        <span
          className={`shrink-0 transition-colors duration-200 motion-reduce:transition-none ${
            error
              ? "text-[#F43F5E]"
              : "text-[#8A96AC] group-focus-within:text-[#8738FF]"
          }`}
        >
          {icon}
        </span>
        <div className="min-w-0 flex-1">{children}</div>
        {trailing}
      </div>

      <div className="min-h-[22px] pt-1">
        {error ? (
          <p
            id={`${id}-error`}
            role="alert"
            className="flex items-center gap-1 text-[11px] font-medium leading-4 text-[#E5484D]"
          >
            <AlertCircle className="size-3 shrink-0" aria-hidden="true" />
            {error}
          </p>
        ) : hint ? (
          <p
            id={`${id}-hint`}
            className="text-[10.5px] leading-4 text-[#9AA6BC]"
          >
            {hint}
          </p>
        ) : null}
      </div>
    </div>
  );
}

export function AccountStep({ data, update, onNext, loading = false }: StepProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<FieldKey, string>>>({});
  const [touched, setTouched] = useState<Partial<Record<FieldKey, boolean>>>(
    {},
  );

  const passwordChecks = useMemo(
    () =>
      PASSWORD_RULES.map((rule) => ({
        ...rule,
        met: rule.test(data.password),
      })),
    [data.password],
  );

  const strengthScore = passwordChecks.filter((rule) => rule.met).length;
  const strength = STRENGTH_LEVELS[strengthScore] ?? STRENGTH_LEVELS[0]!;

  const handleChange = (key: FieldKey, value: string) => {
    update({ [key]: value } as Partial<ProviderSignupData>);
    if (touched[key] || errors[key]) {
      const nextData = { ...data, [key]: value } as ProviderSignupData;
      setErrors((prev) => ({ ...prev, [key]: getFieldError(key, nextData) }));
    }
  };

  const handleBlur = (key: FieldKey) => {
    setTouched((prev) => ({ ...prev, [key]: true }));
    setErrors((prev) => ({ ...prev, [key]: getFieldError(key, data) }));
  };

  const validateAll = (): FieldKey | null => {
    const keys: FieldKey[] = ["firstName", "email", "phone", "password"];
    const nextErrors: Partial<Record<FieldKey, string>> = {};
    let firstInvalid: FieldKey | null = null;

    for (const key of keys) {
      const message = getFieldError(key, data);
      if (message) {
        nextErrors[key] = message;
        firstInvalid ??= key;
      }
    }

    setErrors(nextErrors);
    setTouched((prev) => ({
      ...prev,
      firstName: true,
      email: true,
      phone: true,
      password: true,
    }));

    return firstInvalid;
  };

  const handleContinue = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (loading) return;

    const firstInvalid = validateAll();
    if (firstInvalid) {
      requestAnimationFrame(() => {
        document.getElementById(FIELD_IDS[firstInvalid])?.focus();
      });
      return;
    }

    const derivedName = `${data.firstName} ${data.lastName}`.trim();
    if (!data.fullName || data.fullName === derivedName) {
      update({ fullName: derivedName });
    }
    onNext();
  };

  const errorFor = (key: FieldKey) =>
    touched[key] ? errors[key] : undefined;

  const describedBy = (key: FieldKey, hint?: string) => {
    if (errorFor(key)) return `${FIELD_IDS[key]}-error`;
    return hint ? `${FIELD_IDS[key]}-hint` : undefined;
  };

  return (
    <div className="grid w-full lg:grid-cols-[0.94fr_1.06fr]">
      {/* Brand / story panel */}
      <section className="relative overflow-hidden bg-[linear-gradient(155deg,#080B2A_0%,#101338_48%,#171943_100%)] px-5 pb-10 pt-4 text-white lg:flex lg:flex-col lg:px-9 lg:pb-9 lg:pt-6">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-24 -top-28 size-72 rounded-full bg-[#8738FF]/25 blur-3xl"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-24 -left-24 size-72 rounded-full bg-[#2875E8]/15 blur-3xl"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.16)_1px,transparent_1px)] opacity-[0.07] [background-size:22px_22px]"
        />

        <div className="relative">
          <SignupHeader variant="dark" showBack={false} />
        </div>

        <div className="relative mt-5 lg:mt-9">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-white/12 bg-white/[0.06] px-2.5 py-1 text-[10px] font-semibold text-white/70">
            <Sparkles className="size-3 text-[#C7A4FF]" aria-hidden="true" />
            For creative service providers
          </span>

          <h1 className="mt-3 max-w-[26rem] text-[27px] font-bold leading-[1.12] tracking-[-0.02em] text-white sm:text-[32px] lg:text-[38px]">
            Turn Your Skills Into{" "}
            <span className="bg-gradient-to-r from-[#D5BBFF] via-[#B66BFF] to-[#9B5CFF] bg-clip-text text-transparent">
              Opportunities
            </span>
          </h1>

          <p className="mt-2.5 max-w-[27rem] text-[12px] leading-[1.6] text-white/60 sm:text-[13px] lg:text-[14px]">
            Showcase your services, connect with professionals and get discovered
            by talent, recruiters and production houses.
          </p>
        </div>

        <div className="relative mt-4 grid grid-cols-3 gap-2 lg:mt-6 lg:grid-cols-1 lg:gap-2.5">
          {BENEFITS.map(({ title, description, icon: Icon, tone }) => (
            <div
              key={title}
              className="flex flex-col items-center gap-1.5 rounded-xl border border-white/[0.07] bg-white/[0.04] px-1.5 py-2.5 text-center lg:flex-row lg:items-start lg:gap-3 lg:rounded-2xl lg:px-3.5 lg:py-3 lg:text-left"
            >
              <span
                className={`grid size-7 shrink-0 place-items-center rounded-lg lg:size-9 lg:rounded-xl ${tone}`}
              >
                <Icon className="size-3.5 lg:size-4" aria-hidden="true" />
              </span>
              <div className="min-w-0">
                <p className="text-[9.5px] font-semibold leading-tight text-white lg:text-xs">
                  {title}
                </p>
                <p className="mt-0.5 hidden text-[10.5px] leading-snug text-white/45 lg:block">
                  {description}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="relative mt-4 hidden lg:block">
          <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-white/30">
            How Morporfile works
          </p>
          <div className="mt-2 flex items-center gap-1.5">
            {JOURNEY.map(({ title, icon: Icon }, index) => (
              <div
                key={title}
                className="flex flex-1 items-center gap-1.5 rounded-lg border border-white/[0.06] bg-white/[0.03] px-2 py-2"
              >
                <Icon
                  className="size-3.5 shrink-0 text-[#C7A4FF]"
                  aria-hidden="true"
                />
                <span className="text-[9px] font-semibold leading-tight text-white/65">
                  {title}
                </span>
                {index < JOURNEY.length - 1 ? (
                  <ChevronRight
                    className="ml-auto size-2.5 shrink-0 text-white/20"
                    aria-hidden="true"
                  />
                ) : null}
              </div>
            ))}
          </div>
        </div>

        <div className="relative mt-5 lg:mt-auto lg:pt-9">
          <ProviderStudioVisual />
        </div>

        <p className="relative mt-5 hidden text-[9.5px] font-semibold uppercase tracking-[0.24em] text-white/25 lg:block">
          Create. Support. Enable. Entertainment.
        </p>
      </section>

      {/* Form panel */}
      <section className="relative -mt-5 min-w-0 rounded-t-[26px] bg-white px-5 pb-8 pt-6 shadow-[0_-16px_40px_-30px_rgba(8,11,42,0.5)] sm:px-7 lg:mt-0 lg:rounded-none lg:px-10 lg:pb-9 lg:pt-8 lg:shadow-none">
        <div className="rounded-2xl border border-[#EDF1F8] bg-[#FBFCFF] px-3 py-3.5 sm:px-5">
          <Stepper current={1} />
        </div>

        <div className="mt-6">
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#8738FF]">
            Step 1 of 4
          </p>
          <h2 className="mt-1.5 text-[24px] font-bold tracking-[-0.02em] text-[#101333] sm:text-[28px]">
            Create Your Provider Account
          </h2>
          <p className="mt-1.5 text-[12.5px] leading-[1.6] text-[#7885A3] sm:text-[13px]">
            Let&rsquo;s get started! Enter your basic details to create your
            Morporfile account.
          </p>
        </div>

        <form onSubmit={handleContinue} noValidate className="mt-5">
          <div className="grid grid-cols-1 gap-x-3 sm:grid-cols-2">
            <Field
              id={FIELD_IDS.firstName}
              label="First Name"
              icon={<User className="size-4.5" aria-hidden="true" />}
              error={errorFor("firstName")}
            >
              <input
                id={FIELD_IDS.firstName}
                name="firstName"
                className={inputClass}
                value={data.firstName}
                onChange={(event) =>
                  handleChange("firstName", event.target.value)
                }
                onBlur={() => handleBlur("firstName")}
                placeholder="First name"
                autoComplete="given-name"
                required
                aria-invalid={Boolean(errorFor("firstName"))}
                aria-describedby={describedBy("firstName")}
              />
            </Field>

            <Field
              id={FIELD_IDS.lastName}
              label="Last Name"
              icon={<User className="size-4.5" aria-hidden="true" />}
              error={errorFor("lastName")}
              optional
            >
              <input
                id={FIELD_IDS.lastName}
                name="lastName"
                className={inputClass}
                value={data.lastName}
                onChange={(event) =>
                  handleChange("lastName", event.target.value)
                }
                placeholder="Last name"
                autoComplete="family-name"
              />
            </Field>
          </div>

          <Field
            id={FIELD_IDS.email}
            label="Email Address"
            icon={<Mail className="size-4.5" aria-hidden="true" />}
            error={errorFor("email")}
            hint="We'll send your verification code here."
          >
            <input
              id={FIELD_IDS.email}
              name="email"
              type="email"
              inputMode="email"
              className={inputClass}
              value={data.email}
              onChange={(event) => handleChange("email", event.target.value)}
              onBlur={() => handleBlur("email")}
              placeholder="you@example.com"
              autoComplete="email"
              autoCapitalize="none"
              spellCheck={false}
              required
              aria-invalid={Boolean(errorFor("email"))}
              aria-describedby={describedBy("email", "hint")}
            />
          </Field>

          <Field
            id={FIELD_IDS.phone}
            label="Mobile Number"
            icon={<Phone className="size-4.5" aria-hidden="true" />}
            error={errorFor("phone")}
            hint="Use your 10-digit mobile number."
          >
            <div className="flex min-w-0 items-center gap-2">
              <div className="relative flex shrink-0 items-center rounded-lg border border-[#E1E7F2] bg-[#F7F8FC] pl-2 pr-1">
                <select
                  aria-label="Country calling code"
                  className="h-11 appearance-none bg-transparent pr-5 text-[11px] font-semibold text-[#101333] outline-none"
                  value={data.phoneCountry}
                  onChange={(event) =>
                    update({ phoneCountry: event.target.value })
                  }
                >
                  <option value="+91">+91 IN</option>
                  <option value="+1">+1 US</option>
                  <option value="+44">+44 UK</option>
                  <option value="+61">+61 AU</option>
                </select>
                <ChevronDown
                  className="pointer-events-none absolute right-1 size-3 text-[#8A96AC]"
                  aria-hidden="true"
                />
              </div>
              <span
                aria-hidden="true"
                className="h-5 w-px shrink-0 bg-[#E1E7F2]"
              />
              <input
                id={FIELD_IDS.phone}
                name="phone"
                type="tel"
                inputMode="tel"
                className={inputClass}
                value={data.phone}
                onChange={(event) => handleChange("phone", event.target.value)}
                onBlur={() => handleBlur("phone")}
                placeholder="98765 43210"
                autoComplete="tel"
                maxLength={20}
                required
                aria-invalid={Boolean(errorFor("phone"))}
                aria-describedby={describedBy("phone", "hint")}
              />
            </div>
          </Field>

          <Field
            id={FIELD_IDS.password}
            label="Password"
            icon={<Lock className="size-4.5" aria-hidden="true" />}
            error={errorFor("password")}
            trailing={
              <button
                type="button"
                aria-label={showPassword ? "Hide password" : "Show password"}
                aria-pressed={showPassword}
                onClick={() => setShowPassword((current) => !current)}
                className="-mr-1.5 grid size-11 shrink-0 place-items-center rounded-lg text-[#8A96AC] transition-colors duration-200 hover:bg-[#F6F1FF] hover:text-[#8738FF] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#8738FF] motion-reduce:transition-none"
              >
                {showPassword ? (
                  <EyeOff className="size-4.5" aria-hidden="true" />
                ) : (
                  <Eye className="size-4.5" aria-hidden="true" />
                )}
              </button>
            }
          >
            <input
              id={FIELD_IDS.password}
              name="password"
              type={showPassword ? "text" : "password"}
              className={inputClass}
              value={data.password}
              onChange={(event) => handleChange("password", event.target.value)}
              onBlur={() => handleBlur("password")}
              placeholder="Create a strong password"
              autoComplete="new-password"
              required
              aria-invalid={Boolean(errorFor("password"))}
              aria-describedby={describedBy("password")}
            />
          </Field>

          <div className="mt-1 rounded-xl border border-[#EDF1F8] bg-[#FBFCFF] px-3.5 py-2.5">
            <div className="flex items-center justify-between gap-3">
              <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#8A96AC]">
                Password strength
              </span>
              <span
                aria-live="polite"
                className={`text-[10.5px] font-bold ${strength.text}`}
              >
                {strength.label}
              </span>
            </div>
            <div className="mt-1.5 grid grid-cols-4 gap-1" aria-hidden="true">
              {[1, 2, 3, 4].map((bar) => (
                <span
                  key={bar}
                  className={`h-1 rounded-full transition-colors duration-300 motion-reduce:transition-none ${
                    bar <= strengthScore ? strength.bar : "bg-[#E1E7F2]"
                  }`}
                />
              ))}
            </div>
            <ul className="mt-2 grid grid-cols-2 gap-x-3 gap-y-1">
              {passwordChecks.map((rule) => (
                <li
                  key={rule.label}
                  className={`flex items-center gap-1 text-[10px] leading-4 ${
                    rule.met ? "text-[#0F9D74]" : "text-[#8A96AC]"
                  }`}
                >
                  <Check
                    className={`size-3 shrink-0 ${
                      rule.met ? "opacity-100" : "opacity-30"
                    }`}
                    aria-hidden="true"
                  />
                  {rule.label}
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-5 flex items-start gap-3 rounded-2xl border border-[#E7DDFB] bg-[#F7F3FF] p-3.5">
            <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-white text-[#8738FF] shadow-sm ring-1 ring-[#E7DDFB]">
              <ShieldCheck className="size-4.5" aria-hidden="true" />
            </span>
            <div className="min-w-0">
              <p className="text-[12px] font-bold text-[#101333]">
                Your information is protected
              </p>
              <p className="mt-0.5 text-[11px] leading-[1.55] text-[#5F6C87]">
                Your personal information is handled securely. Your details are
                used to create and manage your provider account.
              </p>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="group mt-5 flex h-[52px] w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#8738FF] via-[#7E33F6] to-[#6C2BE8] px-5 text-[14px] font-bold text-white shadow-[0_12px_28px_-10px_rgba(135,56,255,0.65)] transition-all duration-200 hover:shadow-[0_16px_34px_-10px_rgba(135,56,255,0.75)] hover:brightness-105 active:scale-[0.99] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#8738FF] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 motion-reduce:transition-none"
          >
            {loading ? (
              <>
                <Loader2 className="size-4.5 animate-spin" aria-hidden="true" />
                <span>Creating accountâ€¦</span>
              </>
            ) : (
              <>
                <span>Continue to Provider Type</span>
                <ArrowRight
                  className="size-4.5 transition-transform duration-200 group-hover:translate-x-0.5 motion-reduce:transition-none"
                  aria-hidden="true"
                />
              </>
            )}
          </button>
        </form>

        <div className="mt-6 flex items-center gap-3">
          <span className="h-px flex-1 bg-[#EDF1F8]" aria-hidden="true" />
          <span className="text-[9.5px] font-bold uppercase tracking-[0.16em] text-[#9AA6BC]">
            Or continue with
          </span>
          <span className="h-px flex-1 bg-[#EDF1F8]" aria-hidden="true" />
        </div>

        <div className="mt-3.5">
          <SocialAuthButtons mode="signup" role="provider" googleOnly />
        </div>

        <p className="mt-6 border-t border-[#EDF1F8] pt-5 pb-1 text-center text-[12px] text-[#7885A3]">
          Already have an account?{" "}
          <Link
            href="/auth/login"
            className="inline-flex min-h-11 items-center px-1 -mx-1 font-bold text-[#8738FF] underline-offset-2 transition-colors hover:text-[#6C2BE8] hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-[#8738FF] focus-visible:ring-offset-2"
          >
            Sign In
          </Link>
        </p>
      </section>
    </div>
  );
}
