"use client";

import { useState } from "react";
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
  const [agreementError, setAgreementError] = useState<string | null>(null);

  const set = (key: keyof AccountValues) => (value: string) => {
    onChange({ ...values, [key]: value });
    setErrors((current) => ({ ...current, [key]: undefined }));
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const next: Partial<Record<keyof AccountValues, string>> = {};
    const digits = values.phone.replace(/\D/g, "");
    if (!values.fullName.trim()) next.fullName = "Full name is required";
    if (!/^\S+@\S+\.\S+$/.test(values.email.trim())) next.email = "Enter a valid work email";
    if (digits.length !== 10) next.phone = "Enter a valid 10-digit mobile number";
    const passwordError = validatePassword(values.password);
    if (passwordError) next.password = passwordError;
    if (!agreed) setAgreementError("Accept the Terms of Service and Privacy Policy to continue");
    else setAgreementError(null);
    setErrors(next);
    if (Object.keys(next).length === 0 && agreed) onContinue();
  };

  return (
    <form className="space-y-3" onSubmit={handleSubmit} noValidate>

       <section
       className="
         relative
         -mx-4 w-[calc(100%+2rem)]
         sm:-mx-7 sm:w-[calc(100%+3.5rem)]
         h-[22vh]
        bg-cover
        bg-center
        bg-no-repeat
      "
       style={{
         backgroundImage: "url('/images/recruiter-hero.png')",
       }}
      >
       <Link
         href="/"
         aria-label="Go to RootIn homepage"
         className="absolute left-[6%] top-3 z-10 sm:top-4"
       >
         <RootInLogo className="w-28 pb-4" />
       </Link>
       <div className="absolute left-[6%] top-[56%] w-[52%] -translate-y-1/2 mt-1">
         <h1 className="text-[clamp(20px,5vw,36px)] font-bold leading-[1.05] text-[#080B2B]">
           Create your
           <br />
           <span className="text-[#5B32FF]">recruiter account</span>
         </h1>

         <p className="mt-3 max-w-[300px] text-[clamp(10px,2.5vw,15px)] leading-[1.4] text-[#555C7A]">
           Join India&apos;s growing entertainment professional network.
           Discover talent, create opportunities and bring extraordinary
           stories to life.
         </p>
       </div>
     </section>
       <div className="perks-marquee min-w-0 overflow-hidden rounded-2xl bg-accent/35 px-2.5 py-2 sm:rounded-3xl sm:p-4">
         <div className="perks-marquee-track flex w-max animate-perks-scroll">
           {[perks, perks].map((perkSet, setIndex) => (
             <div
               key={setIndex}
               aria-hidden={setIndex === 1}
               className="flex shrink-0 gap-2 pr-2"
             >
               {perkSet.map(({ icon: Icon, label }) => (
                  <div key={label.join(" ")} className="flex min-h-[2.65rem] shrink-0 items-center gap-1.5 px-3">
                   <Icon className="size-[17px] shrink-0 text-primary" />
                   <p className="text-[11px] font-medium leading-[1.05] text-foreground">
                     {label[0]}
                     <br />
                     {label[1]}
                   </p>
                 </div>
               ))}
             </div>
           ))}
         </div>
       </div>

      <div className="space-y-2">
         <Field icon={<User className="size-5" />} label="Full Name" required error={errors.fullName}>
          <input
            required
            className={inputClass}
            placeholder="e.g. Karan Mehta"
             value={values.fullName}
             onChange={(e) => set("fullName")(e.target.value)}
             aria-invalid={Boolean(errors.fullName)}
           />
         </Field>
         <Field icon={<Mail className="size-5" />} label="Work Email" required error={errors.email}>
          <input
            required
            type="email"
            className={inputClass}
            placeholder="e.g. karan@company.com"
             value={values.email}
             onChange={(e) => set("email")(e.target.value)}
             aria-invalid={Boolean(errors.email)}
           />
         </Field>
         <Field
           icon={<Phone className="size-5" />}
           label="Mobile Number"
           required
           error={errors.phone}
          trailing={
            <span className="rounded-md border border-border px-2 py-0.5 text-xs font-semibold text-muted-foreground">
              IN
            </span>
          }
        >
          <input
            required
            inputMode="numeric"
            maxLength={10}
            className={inputClass}
            placeholder="98765 43210"
             value={values.phone}
             onChange={(e) => set("phone")(e.target.value.replace(/\D/g, "").slice(0, 10))}
             aria-invalid={Boolean(errors.phone)}
           />
         </Field>
         <Field
           icon={<Lock className="size-5" />}
           label="Password"
           required
           error={errors.password}
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
             aria-invalid={Boolean(errors.password)}
           />
         </Field>
       </div>

      <SocialAuthButtons role="recruiter" mode="signup" />

      <label className="flex items-center gap-2 text-[11px] leading-4 text-foreground">
        <input
          type="checkbox"
          checked={agreed}
          onChange={(e) => {
            setAgreed(e.target.checked);
            if (e.target.checked) setAgreementError(null);
          }}
          className={`size-4 shrink-0 accent-[var(--primary)] ${agreementError ? "ring-2 ring-destructive ring-offset-1" : ""}`}
        />
        <span>
          I agree to the <span className="font-semibold text-primary">Terms of Service</span> and{" "}
          <span className="font-semibold text-primary">Privacy Policy</span>
        </span>
      </label>
      {agreementError ? (
        <p className="-mt-1 text-[11px] font-medium text-destructive" role="alert">
          {agreementError}
        </p>
      ) : null}

      <button
        type="submit"
        className="bg-[linear-gradient(100deg,#7c3aed,#a855f7)] shadow-button flex h-[52px] w-full items-center justify-center gap-2 rounded-xl px-6 text-[15px] font-semibold text-primary-foreground transition-opacity disabled:opacity-50"
      >
        Create Account
        <ChevronRight className="size-[18px]" />
      </button>

      <p className="text-center text-xs text-muted-foreground">
        Already have an account?{" "}
        <Link href="/auth?mode=signin" className="font-semibold text-primary">
          Sign In
        </Link>
      </p>
    </form>
  );
}
