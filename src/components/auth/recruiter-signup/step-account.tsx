"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Eye,
  EyeOff,
  Lock,
  Mail,
  Phone,
  User,
  Users,
  Target,
  Zap,
  BarChart3,
  ChevronRight,
} from "lucide-react";
import { RootInLogo } from "@/components/RootInLogo";
import { SocialAuthButtons } from "@/components/auth/social-auth-buttons";
import { ScriptNote } from "./brand";
import { Field, inputClass } from "./field";

export type AccountValues = {
  fullName: string;
  email: string;
  phone: string;
  password: string;
};

const perks = [
  { icon: Users, label: ["Verified", "Talent Network"] },
  { icon: Target, label: ["Smart", "Matching"] },
  { icon: Zap, label: ["Faster", "Hiring"] },
  { icon: BarChart3, label: ["Bigger", "Opportunities"] },
];

function validatePassword(password: string): string | null {
  if (password.length < 8) return "Password must be at least 8 characters";
  if (!/[A-Z]/.test(password)) return "Password needs one uppercase letter";
  if (!/\d/.test(password)) return "Password needs one number";
  if (!/[^A-Za-z0-9]/.test(password)) return "Password needs one special character";
  return null;
}

export function StepAccount({
  values,
  onChange,
  onContinue,
}: {
  values: AccountValues;
  onChange: (values: AccountValues) => void;
  onContinue: () => void;
}) {
  const [showPassword, setShowPassword] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof AccountValues, string>>>({});

  const set = (key: keyof AccountValues) => (value: string) => {
    onChange({ ...values, [key]: value });
    setErrors((current) => ({ ...current, [key]: undefined }));
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const next: Partial<Record<keyof AccountValues, string>> = {};
    const digits = values.phone.replace(/\D/g, "");
    if (!values.fullName.trim()) next.fullName = "Full name is required";
    if (digits.length !== 10) next.phone = "Enter a valid 10-digit mobile number";
    const passwordError = validatePassword(values.password);
    if (passwordError) next.password = passwordError;
    setErrors(next);
    if (Object.keys(next).length === 0) onContinue();
  };

  return (
    <form className="space-y-6" onSubmit={handleSubmit} noValidate>
      <div className="flex items-start justify-between gap-4">
        <RootInLogo className="w-28 pt-1" />
        <ScriptNote lines={["Great", "Stories", "Start with", "Great People"]} />
      </div>

      <div className="grid gap-6 sm:grid-cols-[1.1fr_1fr] sm:items-center">
        <div>
          <h1 className="text-4xl font-extrabold leading-tight tracking-tight text-foreground">
            Create your <span className="block text-primary">recruiter account</span>
          </h1>
          <p className="mt-3 text-base text-muted-foreground">
            Join India&apos;s growing entertainment professional network. Discover talent, create
            opportunities and bring extraordinary stories to life.
          </p>
        </div>
        <Image
          src="/assets/recruiter-signup/hero-filmset.jpg"
          alt="Cinematographer filming on set at dusk"
          width={900}
          height={1024}
          priority
          className="h-56 w-full rounded-[2rem] rounded-tr-[5rem] object-cover sm:h-64"
        />
      </div>

      <div className="grid grid-cols-2 gap-4 rounded-3xl bg-accent/60 p-4 sm:grid-cols-4">
        {perks.map(({ icon: Icon, label }) => (
          <div key={label.join(" ")} className="flex items-center gap-2">
            <Icon className="size-5 shrink-0 text-primary" />
            <p className="text-sm font-medium leading-4 text-foreground">
              {label[0]}
              <br />
              {label[1]}
            </p>
          </div>
        ))}
      </div>

      <div className="space-y-3">
        <Field icon={<User className="size-5" />} label="Full Name">
          <input
            required
            className={inputClass}
            placeholder="e.g. Karan Mehta"
            value={values.fullName}
            onChange={(e) => set("fullName")(e.target.value)}
          />
        </Field>
        <Field icon={<Mail className="size-5" />} label="Work Email">
          <input
            required
            type="email"
            className={inputClass}
            placeholder="e.g. karan@company.com"
            value={values.email}
            onChange={(e) => set("email")(e.target.value)}
          />
        </Field>
        <Field
          icon={<Phone className="size-5" />}
          label="Mobile Number"
          trailing={
            <span className="rounded-md border border-border px-2 py-0.5 text-xs font-semibold text-muted-foreground">
              IN
            </span>
          }
        >
          <input
            required
            inputMode="tel"
            className={inputClass}
            placeholder="+91 98765 43210"
            value={values.phone}
            onChange={(e) => set("phone")(e.target.value)}
          />
        </Field>
        {errors.phone ? (
          <p className="-mt-1 px-1 text-sm text-destructive">{errors.phone}</p>
        ) : null}
        <Field
          icon={<Lock className="size-5" />}
          label="Password"
          trailing={
            <button
              type="button"
              aria-label={showPassword ? "Hide password" : "Show password"}
              onClick={() => setShowPassword((v) => !v)}
              className="text-muted-foreground"
            >
              {showPassword ? <Eye className="size-5" /> : <EyeOff className="size-5" />}
            </button>
          }
        >
          <input
            required
            type={showPassword ? "text" : "password"}
            className={inputClass}
            placeholder="Create a strong password"
            value={values.password}
            onChange={(e) => set("password")(e.target.value)}
          />
        </Field>
        {errors.password ? (
          <p className="-mt-1 px-1 text-sm text-destructive">{errors.password}</p>
        ) : null}
      </div>

      <SocialAuthButtons />

      <label className="flex items-center gap-3 text-sm text-foreground">
        <input
          type="checkbox"
          checked={agreed}
          onChange={(e) => setAgreed(e.target.checked)}
          className="size-5 accent-[var(--primary)]"
        />
        <span>
          I agree to the <span className="font-semibold text-primary">Terms of Service</span> and{" "}
          <span className="font-semibold text-primary">Privacy Policy</span>
        </span>
      </label>

      <button
        type="submit"
        disabled={!agreed}
        className="gradient-cta shadow-button flex w-full items-center justify-center gap-2 rounded-2xl px-6 py-4 text-lg font-semibold text-primary-foreground transition-opacity disabled:opacity-50"
      >
        Create Account
        <ChevronRight className="size-5" />
      </button>

      <p className="text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link href="/auth?mode=signin" className="font-semibold text-primary">
          Sign In
        </Link>
      </p>
    </form>
  );
}
