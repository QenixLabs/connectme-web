"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Brush,
  Camera,
  Check,
  CheckCircle2,
  ChevronDown,
  Clapperboard,
  Drama,
  Eye,
  EyeOff,
  Globe2,
  House,
  Languages,
  LockKeyhole,
  Loader2,
  Mail,
  MapPin,
  Megaphone,
  Mic,
  MoreHorizontal,
  Music,
  PenLine,
  PersonStanding,
  Phone,
  Plane,
  PlayCircle,
  Scissors,
  Search,
  Shirt,
  Sparkles,
  User,
  UserRound,
  Building2,
  type LucideIcon,
} from "lucide-react";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { authApi, talentApi } from "@/lib/api";
import { useAuthStore } from "@/providers/auth-store-provider";
import { OtpInput } from "@/components/ui/otp-input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import logoImage from "@/assets/rootin-logo-orange.png";

type Step = 1 | 2 | 3;

type Account = {
  fullName: string;
  professionalName: string;
  username: string;
  email: string;
  phone: string;
  password: string;
};

type Category = {
  id: string;
  label: string;
  image?: string;
  Icon: LucideIcon;
};

const categories: Category[] = [
  { id: "actor", label: "Actor", image: "/assets/talent-onboarding/cat-actor.jpg", Icon: Drama },
  { id: "model", label: "Model", image: "/assets/talent-onboarding/cat-model.jpg", Icon: PersonStanding },
  { id: "dancer", label: "Dancer", image: "/assets/talent-onboarding/cat-dancer.jpg", Icon: PersonStanding },
  { id: "singer", label: "Singer", image: "/assets/talent-onboarding/cat-singer.jpg", Icon: Music },
  { id: "musician", label: "Musician", image: "/assets/talent-onboarding/cat-musician.jpg", Icon: Music },
  { id: "voice", label: "Voice Artist", image: "/assets/talent-onboarding/cat-voice.jpg", Icon: Mic },
  { id: "creator", label: "Creator", image: "/assets/talent-onboarding/cat-creator.jpg", Icon: PlayCircle },
  { id: "influencer", label: "Influencer", image: "/assets/talent-onboarding/cat-influencer.jpg", Icon: User },
  { id: "photographer", label: "Photographer", image: "/assets/talent-onboarding/cat-photographer.jpg", Icon: Camera },
  { id: "filmmaker", label: "Filmmaker", image: "/assets/talent-onboarding/cat-filmmaker.jpg", Icon: Clapperboard },
  { id: "writer", label: "Writer", image: "/assets/talent-onboarding/cat-writer.jpg", Icon: PenLine },
  { id: "director", label: "Director", image: "/assets/talent-onboarding/cat-director.jpg", Icon: Megaphone },
  { id: "editor", label: "Editor", image: "/assets/talent-onboarding/cat-editor.jpg", Icon: Scissors },
  { id: "makeup", label: "Makeup Artist", image: "/assets/talent-onboarding/cat-makeup.jpg", Icon: Brush },
  { id: "stylist", label: "Stylist", image: "/assets/talent-onboarding/cat-stylist.jpg", Icon: Shirt },
  { id: "other", label: "Other", Icon: MoreHorizontal },
];

const passwordRules = [
  { label: "At least 8 characters", test: (value: string) => value.length >= 8 },
  { label: "Include an uppercase letter", test: (value: string) => /[A-Z]/.test(value) },
  { label: "Include a lowercase letter", test: (value: string) => /[a-z]/.test(value) },
  { label: "Include a number", test: (value: string) => /\d/.test(value) },
  { label: "Include a special character", test: (value: string) => /[^A-Za-z0-9]/.test(value) },
];

function BrandMark() {
  return (
    <Image
      src={logoImage}
      alt="Rootin"
      className="h-auto w-[8.5rem] max-[700px]:w-[7rem] max-[420px]:w-[6rem]"
      priority
    />
  );
}

function GoogleBrandIcon() {
  return (
    <svg className="size-[1.15rem] shrink-0" viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  );
}

function AppleBrandIcon() {
  return (
    <svg className="size-[1.15rem] shrink-0" viewBox="0 0 384 512" fill="currentColor" aria-hidden="true">
      <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z" />
    </svg>
  );
}

function Brand() {
  return (
    <div className="flex min-w-0 items-center gap-[0.7rem]">
      <BrandMark />
    </div>
  );
}

function TopBar({ step }: { step: Step }) {
  return (
    <header className="flex items-center justify-between gap-4">
      <Brand />
      <div className="w-[10.5rem] text-right text-[0.8rem] font-semibold text-[oklch(0.51_0.08_279)] max-[700px]:w-[5.2rem] max-[700px]:text-[0.68rem]">
        <div>Step {step} of 3</div>
        <div className="mt-[0.65rem] flex items-center justify-end gap-[0.3rem]">
          {[1, 2, 3].map((item) => <i key={item} className={`block h-[0.35rem] flex-1 rounded-full max-[700px]:h-[0.3rem] ${item <= step ? "bg-[oklch(0.53_0.31_293)]" : "bg-[oklch(0.87_0.035_288)]"}`} />)}
        </div>
      </div>
    </header>
  );
}

function AccountField({
  id,
  label,
  optional,
  placeholder,
  icon,
  type = "text",
  value,
  onChange,
  right,
  error,
  status,
  onBlur,
}: {
  id: string;
  label: string;
  optional?: boolean;
  placeholder: string;
  icon: ReactNode;
  type?: string;
  value: string;
  onChange: (value: string) => void;
  right?: ReactNode;
  error?: string;
  status?: "checking" | "available" | "taken";
  onBlur?: () => void;
}) {
  const hasError = Boolean(error) || status === "taken";
  const statusMessage = error || (status === "checking" ? "Checking username..." : status === "available" ? "Username available" : status === "taken" ? "Username already taken" : null);
  return (
    <label htmlFor={id} className={`flex min-h-[4.4rem] items-center gap-[0.85rem] rounded-xl border bg-[oklch(1_0_0_/_78%)] px-4 py-3 shadow-[0_4px_14px_oklch(0.53_0.31_293_/_7%)] backdrop-blur-[8px] focus-within:border-[oklch(0.53_0.31_293)] focus-within:shadow-[0_0_0_3px_oklch(0.53_0.31_293_/_13%)] ${hasError ? "border-red-500" : status === "available" ? "border-green-500" : "border-[oklch(0.87_0.035_288)]"}`}>
      <span className="grid w-8 flex-none place-items-center text-[oklch(0.53_0.31_293)] [&>svg]:size-[1.35rem] [&>svg]:stroke-[2.1]" aria-hidden="true">{icon}</span>
      <span className="min-w-0 flex-1">
        <span className="block text-[0.78rem] font-bold text-[oklch(0.27_0.13_279)]">{label} {optional && <small className="text-[0.72rem] font-normal text-[oklch(0.51_0.08_279)]">(Optional)</small>}</span>
        <input className="mt-[0.2rem] w-full border-0 bg-transparent text-[0.9rem] text-[oklch(0.27_0.13_279)] outline-0 placeholder:text-[oklch(0.51_0.08_279)]" id={id} name={id} type={type} value={value} onChange={(event) => onChange(event.target.value)} onBlur={onBlur} placeholder={placeholder} required={!optional} aria-invalid={hasError} />
        {statusMessage ? <span className={`mt-1 block text-[0.7rem] font-medium ${hasError ? "text-red-600" : status === "available" ? "text-green-600" : "text-[oklch(0.51_0.08_279)]"}`} role={hasError ? "alert" : undefined}>{statusMessage}</span> : null}
      </span>
      {right}
    </label>
  );
}

function AccountStep({ account, setAccount, onContinue }: { account: Account; setAccount: (account: Account) => void; onContinue: () => void }) {
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<"fullName" | "username" | "email" | "phone" | "password", string>>>({});
  const [usernameStatus, setUsernameStatus] = useState<"checking" | "available" | "taken" | undefined>();
  const [checkingUsername, setCheckingUsername] = useState(false);
  const [agreed, setAgreed] = useState(true);
  const [agreementError, setAgreementError] = useState<string | null>(null);

  const handleGoogleSignup = () => {
    const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api/v1";
    window.location.href = `${apiBase}/auth/google?intent=signup&role=talent`;
  };
  const checks = passwordRules.map(({ test }) => test(account.password));
  const update = (field: keyof Account, value: string) => {
    setAccount({ ...account, [field]: value });
    setErrors((current) => ({ ...current, [field]: undefined }));
    if (field === "username") setUsernameStatus(undefined);
  };
  const checkUsername = async () => {
    const username = account.username.trim();
    if (!/^[a-zA-Z0-9]{6,20}$/.test(username)) return false;
    setCheckingUsername(true);
    setUsernameStatus("checking");
    try {
      const result = await authApi.checkUsername(username);
      if (!result.available) {
        setUsernameStatus("taken");
        setErrors((current) => ({ ...current, username: "Username already taken" }));
        return false;
      }
      setUsernameStatus("available");
      setErrors((current) => ({ ...current, username: undefined }));
      return true;
    } catch {
      setUsernameStatus(undefined);
      setErrors((current) => ({ ...current, username: "Could not check username availability" }));
      return false;
    } finally {
      setCheckingUsername(false);
    }
  };
  const handleUsernameBlur = () => {
    if (/^[a-zA-Z0-9]{6,20}$/.test(account.username.trim())) void checkUsername();
  };
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const next: Partial<Record<"fullName" | "username" | "email" | "phone" | "password", string>> = {};
    if (!account.fullName.trim()) next.fullName = "Full name is required";
    if (!/^[a-zA-Z0-9]{6,20}$/.test(account.username.trim())) next.username = "Use 6-20 letters or numbers";
    if (!/^\S+@\S+\.\S+$/.test(account.email.trim())) next.email = "Enter a valid email address";
    if (!/^\d{10}$/.test(account.phone)) next.phone = "Enter a valid 10-digit mobile number";
    if (!checks.every(Boolean)) next.password = "Complete all password requirements";
    if (!agreed) setAgreementError("Accept the Terms of Service and Privacy Policy to continue");
    else setAgreementError(null);
    setErrors(next);
    if (Object.keys(next).length > 0 || !agreed) return;
    if (!(await checkUsername())) return;
    onContinue();
  };
  const ctaClasses = "flex min-h-[3.35rem] w-full items-center justify-center gap-3 rounded-xl border-0 bg-[linear-gradient(110deg,oklch(0.49_0.27_288),oklch(0.57_0.27_300))] text-base font-bold text-white shadow-[0_12px_28px_oklch(0.49_0.27_288_/_28%)] hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-50";

  return (
    <form className="mt-[2.2rem] w-full max-w-[52rem] max-[700px]:mt-[1.7rem]" onSubmit={(event) => void handleSubmit(event)} noValidate>
      <div className=" min-w-0 bg-contain bg-center bg-no-repeat grid items-stretch gap-6 grid-cols-[minmax(0,7fr)_minmax(13rem,3fr)] max-[700px]:grid-cols-[minmax(0,7fr)_minmax(6rem,3fr)] max-[700px]:gap-3 max-[420px]:grid-cols-1"
        style={{
    backgroundImage: "url('/assets/onboarding/talent-onboarding.png')",
  }}
>
        <div className="min-w-0">
          <div className="mb-8">
            <p className="m-0 text-[0.72rem] font-bold tracking-[0.16em] text-[oklch(0.51_0.08_279)]">JOIN A GLOBAL TALENT COMMUNITY</p>
            <h1 className="mt-[0.8rem] text-[clamp(2.7rem,6vw,3.8rem)] font-extrabold leading-[0.98] tracking-[-0.055em] text-[oklch(0.27_0.13_279)] w-screen">Create your <em className="not-italic text-[oklch(0.53_0.31_293)]">talent account.</em></h1>
            <p className="mt-4 max-w-[32rem] text-base font-medium leading-[1.55] text-[oklch(0.51_0.08_279)]">Take the first step towards new opportunities, bigger projects and a brighter career.</p>
          </div>

          <div className="grid gap-[0.8rem]">
             <AccountField id="full-name" label="Full Name" placeholder="Enter your full name" icon={<UserRound />} value={account.fullName} onChange={(value) => update("fullName", value)} error={errors.fullName} />
             <AccountField id="professional-name" label="Professional Name" optional placeholder="How you want to be known" icon={<Sparkles />} value={account.professionalName} onChange={(value) => update("professionalName", value)} />
             <AccountField id="username" label="Username" placeholder="6-20 letters or numbers" icon={<User />} value={account.username} onChange={(value) => update("username", value.replace(/[^a-zA-Z0-9]/g, "").slice(0, 20))} onBlur={handleUsernameBlur} error={errors.username} status={usernameStatus} />
             <AccountField id="email" label="Email Address" placeholder="you@example.com" type="email" icon={<Mail />} value={account.email} onChange={(value) => update("email", value)} error={errors.email} />

             <div>
             <label htmlFor="mobile" className={`flex min-h-[4.4rem] items-center gap-[0.85rem] rounded-xl border bg-[oklch(1_0_0_/_78%)] px-4 py-3 shadow-[0_4px_14px_oklch(0.53_0.31_293_/_7%)] backdrop-blur-[8px] focus-within:border-[oklch(0.53_0.31_293)] focus-within:shadow-[0_0_0_3px_oklch(0.53_0.31_293_/_13%)] ${errors.phone ? "border-red-500" : "border-[oklch(0.87_0.035_288)]"}`}>
              <span className="grid w-8 flex-none place-items-center text-[oklch(0.53_0.31_293)] [&>svg]:size-[1.35rem] [&>svg]:stroke-[2.1]" aria-hidden="true"><Phone /></span>
              <span className="min-w-0 flex-1">
                <span className="block text-[0.78rem] font-bold text-[oklch(0.27_0.13_279)]">Mobile Number</span>
                <span className="mt-[0.2rem] flex items-center gap-[0.45rem] text-[0.88rem] text-[oklch(0.27_0.13_279)]">
                  <span className="grid h-[1.1rem] w-[1.4rem] place-items-center rounded-[0.2rem] bg-[oklch(0.9_0.04_285)] text-[0.52rem] font-extrabold text-[oklch(0.53_0.31_293)]" aria-label="India">IN</span>
                  <strong>+91</strong><ChevronDown size={15} className="text-[oklch(0.53_0.31_293)]" /><i className="h-[1.4rem] w-px bg-[oklch(0.87_0.035_288)]" />
                   <input className="mt-0 min-w-0 w-full border-0 bg-transparent text-[0.9rem] text-[oklch(0.27_0.13_279)] outline-0 placeholder:text-[oklch(0.51_0.08_279)]" id="mobile" name="mobile" type="tel" inputMode="numeric" maxLength={10} value={account.phone} onChange={(event) => update("phone", event.target.value.replace(/\D/g, "").slice(0, 10))} placeholder="Enter mobile number" required />
                </span>
              </span>
             </label>
             {errors.phone ? <p className="mt-1 px-1 text-[0.7rem] font-medium text-red-600" role="alert">{errors.phone}</p> : null}
             </div>

             <AccountField id="password" label="Password" placeholder="Create a strong password" type={showPassword ? "text" : "password"} icon={<LockKeyhole />} value={account.password} onChange={(value) => update("password", value)} error={errors.password} right={<button type="button" className="cursor-pointer border-0 bg-transparent text-[oklch(0.53_0.31_293)]" onClick={() => setShowPassword((visible) => !visible)} aria-label={showPassword ? "Hide password" : "Show password"}>{showPassword ? <Eye size={20} /> : <EyeOff size={20} />}</button>} />
            <div className="grid gap-[0.18rem] px-0 pb-[0.2rem]  pt-[0.2rem] text-[0.75rem] text-[oklch(0.51_0.08_279)]">
              {passwordRules.map(({ label }, index) => <p key={label} className={`m-0 ${checks[index] ? "text-[oklch(0.57_0.16_153)]" : ""}`}><span className="mr-[0.45rem] inline-grid size-[1.15rem] place-items-center rounded-full border border-current align-[-0.25rem]"><Check size={12} /></span>{label}</p>)}
            </div>
          </div>

        </div>

        <div className="relative h-full min-h-0 aspect-[0.62/1] overflow-hidden rounded-[1.1rem]  max-[420px]:hidden" aria-hidden="true">
        </div>
      </div>

      <div className="w-full">
        <div className="my-[1.25rem] mb-[0.8rem] flex w-full items-center gap-3 text-[0.65rem] font-bold tracking-[0.08em] text-[oklch(0.51_0.08_279)]"><i className="h-px flex-1 bg-[oklch(0.87_0.035_288)]" /><span>OR CONTINUE WITH</span><i className="h-px flex-1 bg-[oklch(0.87_0.035_288)]" /></div>
        <div className="flex w-full gap-3">
          <button type="button" onClick={handleGoogleSignup} className="inline-flex min-h-[2.9rem] min-w-0 flex-1 cursor-pointer items-center justify-center gap-2 rounded-[0.7rem] border border-[oklch(0.87_0.035_288)] bg-[oklch(1_0_0_/_75%)] text-[0.78rem] font-semibold text-[oklch(0.27_0.13_279)] hover:border-[oklch(0.53_0.31_293)]"><GoogleBrandIcon /><span className="max-[420px]:hidden">Continue with Google</span></button>
          <button type="button" disabled aria-disabled="true" title="Coming Soon" className="inline-flex min-h-[2.9rem] min-w-0 flex-1 cursor-not-allowed items-center justify-center gap-2 rounded-[0.7rem] border border-[oklch(0.87_0.035_288)] bg-[oklch(1_0_0_/_40%)] text-[0.78rem] font-semibold text-[oklch(0.27_0.13_279)] opacity-60"><AppleBrandIcon /><span className="max-[420px]:hidden">Continue with Apple</span><span className="rounded-full bg-[oklch(0.53_0.31_293)]/10 px-2 py-0.5 text-[0.65rem] font-bold text-[oklch(0.53_0.31_293)]">Coming Soon</span></button>
        </div>
        <label className="my-4 flex items-start justify-center gap-[0.6rem] text-[0.75rem] leading-[1.5] text-[oklch(0.27_0.13_279)]"><input className={`mt-[0.15rem] size-4 accent-[oklch(0.53_0.31_293)] ${agreementError ? "ring-2 ring-red-500 ring-offset-1" : ""}`} type="checkbox" checked={agreed} onChange={(event) => { setAgreed(event.target.checked); if (event.target.checked) setAgreementError(null); }} aria-invalid={Boolean(agreementError)} /><span>I agree to the <a className="font-bold text-[oklch(0.53_0.31_293)] underline" href="/terms">Terms of Service</a> and <a className="font-bold text-[oklch(0.53_0.31_293)] underline" href="/privacy">Privacy Policy</a>.</span></label>
        {agreementError ? <p className="-mt-3 mb-3 text-center text-[0.7rem] font-medium text-red-600" role="alert">{agreementError}</p> : null}
         <button className={ctaClasses} type="submit" disabled={checkingUsername}><span>{checkingUsername ? "Checking username..." : "Continue"}</span>{checkingUsername ? <Loader2 size={20} className="animate-spin" /> : <ArrowRight size={20} />}</button>
      </div>

      <div className="mt-[1.15rem] flex items-center gap-[0.7rem] text-[0.76rem] text-[oklch(0.51_0.08_279)]"><i className="h-px flex-1 bg-[oklch(0.87_0.035_288)]" /><p className="m-0 whitespace-nowrap">Already have an account? <a className="font-bold text-[oklch(0.53_0.31_293)] underline" href="/auth/login">Sign In</a></p><i className="h-px flex-1 bg-[oklch(0.87_0.035_288)]" /></div>
      <div className="mt-6 flex items-center gap-[0.8rem] text-[0.72rem] leading-[1.4] text-[oklch(0.51_0.08_279)] max-[700px]:items-start"><div className="flex pl-[0.45rem]"><span className="-ml-[0.45rem] grid size-[1.8rem] place-items-center rounded-full border-2 border-[oklch(0.985_0.009_288)] bg-[oklch(0.53_0.31_293)] text-[0.62rem] font-bold text-white">A</span><span className="-ml-[0.45rem] grid size-[1.8rem] place-items-center rounded-full border-2 border-[oklch(0.985_0.009_288)] bg-[oklch(0.63_0.22_350)] text-[0.62rem] font-bold text-white">M</span><span className="-ml-[0.45rem] grid size-[1.8rem] place-items-center rounded-full border-2 border-[oklch(0.985_0.009_288)] bg-[oklch(0.6_0.2_255)] text-[0.62rem] font-bold text-white">R</span><span className="-ml-[0.45rem] grid size-[1.8rem] place-items-center rounded-full border-2 border-[oklch(0.985_0.009_288)] bg-[oklch(0.67_0.18_160)] text-[0.62rem] font-bold text-white">S</span></div><i className="h-8 w-px flex-none bg-[oklch(0.87_0.035_288)]" /><p className="m-0 max-[700px]:max-w-[15rem]">Trusted by 50,000+ talented creators across film, OTT, TV, music, fashion and more.</p></div>
    </form>
  );
}

function CategoriesStep({ selected, onToggle, onContinue }: { selected: string[]; onToggle: (id: string) => void; onContinue: () => void }) {
  const [query, setQuery] = useState("");
  const [error, setError] = useState<string | null>(null);
  const visible = useMemo(() => {
    const value = query.trim().toLowerCase();
    return value ? categories.filter((category) => category.label.toLowerCase().includes(value)) : categories;
  }, [query]);
  const ctaClasses = "mt-[1.2rem] flex min-h-[3.35rem] w-full items-center justify-center gap-3 rounded-xl border-0 bg-[linear-gradient(110deg,oklch(0.49_0.27_288),oklch(0.57_0.27_300))] text-base font-bold text-white shadow-[0_12px_28px_oklch(0.49_0.27_288_/_28%)] hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-50";
  const searchClasses = "flex min-h-[3.05rem] items-center gap-3 rounded-xl border border-[oklch(0.87_0.035_288)] bg-[oklch(1_0_0_/_82%)] px-4 shadow-[0_2px_8px_oklch(0.27_0.13_279_/_5%)] focus-within:border-[oklch(0.53_0.31_293)] focus-within:shadow-[0_0_0_3px_oklch(0.53_0.31_293_/_13%)]";
  const handleContinue = () => {
    if (selected.length === 0) {
      setError("Select at least one category to continue");
      return;
    }
    onContinue();
  };

  return (
    <form className="mt-[2.2rem] w-full max-w-[31rem] max-[700px]:mt-[1.7rem]" onSubmit={(event) => { event.preventDefault(); handleContinue(); }} noValidate>
      <div className="mt-[1.4rem]"><p className="m-0 text-[0.72rem] font-bold tracking-[0.16em] text-[oklch(0.51_0.08_279)]">TELL US ABOUT YOUR TALENT</p><h1 className="mt-[0.8rem] text-[clamp(2.5rem,6vw,3.25rem)] font-extrabold leading-[0.98] tracking-[-0.055em] text-[oklch(0.27_0.13_279)]">What do <em className="not-italic text-[oklch(0.53_0.31_293)]">you do?</em></h1><p className="mt-4 max-w-[32rem] text-base font-medium leading-[1.55] text-[oklch(0.51_0.08_279)]">Select one or more categories that best describe you. You can always update this later.</p></div>
      <label className={`${searchClasses} mt-6`}><Search size={20} className="flex-none text-[oklch(0.51_0.08_279)]" /><input className="w-full border-0 bg-transparent text-[0.82rem] text-[oklch(0.27_0.13_279)] outline-0 placeholder:text-[oklch(0.51_0.08_279)]" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search categories (e.g. Actor, Singer, Dancer...)" /></label>
       <div className="mt-4 grid grid-cols-2 gap-[0.85rem]" aria-invalid={Boolean(error)}>
        {visible.map((category) => {
          const active = selected.includes(category.id);
          const Icon = category.Icon;
           return <button type="button" key={category.id} onClick={() => { onToggle(category.id); setError(null); }} aria-pressed={active} className={`overflow-hidden rounded-[0.85rem] border-2 bg-white pb-[0.8rem] text-left text-[oklch(0.27_0.13_279)] shadow-[0_2px_10px_oklch(0.53_0.27_288_/_15%)] ${active ? "border-[oklch(0.53_0.31_293)] bg-[oklch(0.95_0.03_295)]" : "border-transparent"}`}>
            <div className="relative mx-[0.2rem] mt-[0.2rem] h-28 overflow-hidden rounded-[0.7rem] bg-[oklch(0.95_0.035_291)]">
              {category.image ? <Image src={category.image} alt={category.label} fill sizes="(max-width: 700px) 45vw, 240px" className="object-cover" /> : <span className="grid size-full place-items-center bg-[linear-gradient(135deg,oklch(0.53_0.31_293_/_82%),oklch(0.27_0.13_279))] text-white"><MoreHorizontal size={30} /></span>}
              {active && <b className="absolute right-[0.45rem] top-[0.45rem] grid size-7 place-items-center rounded-full bg-[oklch(0.53_0.31_293)] text-white"><Check size={16} /></b>}
              <i className="absolute -bottom-[0.9rem] left-1/2 grid size-9 -translate-x-1/2 place-items-center rounded-full bg-white text-[oklch(0.53_0.31_293)] shadow-[0_2px_10px_oklch(0.27_0.13_279_/_12%)]"><Icon size={17} /></i>
            </div>
            <strong className={`mt-4 block text-center text-[0.82rem] ${active ? "text-[oklch(0.53_0.31_293)]" : ""}`}>{category.label}</strong>
          </button>;
       })}
      </div>
      {error ? <p className="mt-2 text-sm font-medium text-red-600" role="alert">{error}</p> : null}
      <div className="relative mt-5 min-h-20 overflow-hidden rounded-[0.85rem] bg-[oklch(0.95_0.03_295)]"><div className="absolute inset-y-0 right-0 w-[45%]"><Image src="/assets/talent-onboarding/protip-clapper.jpg" alt="Film clapperboard in purple haze" fill sizes="180px" className="object-cover opacity-80" /></div><div className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,oklch(0.95_0.03_295),oklch(0.95_0.03_295_/_90%)_45%,transparent)]" /><div className="relative z-10 flex gap-[0.65rem] px-4 py-[0.9rem] pr-28 text-[oklch(0.53_0.31_293)]"><Sparkles size={20} className="flex-none" /><p className="m-0 text-[0.78rem] leading-[1.35] text-[oklch(0.27_0.13_279)]"><strong>Pro Tip</strong><br /><span className="text-[0.68rem] text-[oklch(0.51_0.08_279)]">Showcase all your talents to get more relevant opportunities from top recruiters.</span></p></div></div>
       <button className={ctaClasses} type="submit"><span>Continue</span><ArrowRight size={20} /></button>
      <div className="mt-[1.15rem] flex items-center gap-[0.7rem] text-[0.76rem] text-[oklch(0.51_0.08_279)]"><i className="h-px flex-1 bg-[oklch(0.87_0.035_288)]" /><p className="m-0 whitespace-nowrap">Already have an account? <a className="font-bold text-[oklch(0.53_0.31_293)] underline" href="/auth/login">Sign In</a></p><i className="h-px flex-1 bg-[oklch(0.87_0.035_288)]" /></div>
    </form>
  );
}

type Choice = { id: string; title: string; description: string; Icon: LucideIcon };

const travelChoices: Choice[] = [
  { id: "local", title: "Local Only", description: "Within my city", Icon: House },
  { id: "india", title: "Within India", description: "Open to work across India", Icon: Building2 },
  { id: "global", title: "International", description: "Open to global opportunities", Icon: Globe2 },
];

const languageOptions = [
  "Hindi",
  "English",
  "Marathi",
  "Tamil",
  "Telugu",
  "Bengali",
  "Kannada",
  "Malayalam",
  "Punjabi",
  "Gujarati",
  "Urdu",
  "Odia",
  "Assamese",
  "Sanskrit",
];

function FieldHeading({ Icon, title, description, optional, required }: { Icon: LucideIcon; title: string; description?: string; optional?: boolean; required?: boolean }) {
  return <div className="mb-[0.65rem] flex items-start gap-3"><Icon className="mt-[0.1rem] size-[1.35rem] flex-none text-[oklch(0.53_0.31_293)]" /><div><h2 className="m-0 text-[0.86rem] font-extrabold text-[oklch(0.27_0.13_279)]">{title} {required && <small className="text-red-600">*</small>} {optional && <small className="text-[0.72rem] font-normal text-[oklch(0.51_0.08_279)]">(Optional)</small>}</h2>{description && <p className="mt-[0.15rem] text-[0.7rem] leading-[1.35] text-[oklch(0.51_0.08_279)]">{description}</p>}</div></div>;
}

function ChipInput({ values, setValues, placeholder }: { values: string[]; setValues: (values: string[]) => void; placeholder: string }) {
  const [draft, setDraft] = useState("");
  const add = () => { const value = draft.trim(); if (value && !values.some((item) => item.toLowerCase() === value.toLowerCase())) setValues([...values, value]); setDraft(""); };
  const searchClasses = "flex min-h-[3.05rem] items-center gap-3 rounded-xl border border-[oklch(0.87_0.035_288)] bg-[oklch(1_0_0_/_82%)] px-4 shadow-[0_2px_8px_oklch(0.27_0.13_279_/_5%)] focus-within:border-[oklch(0.53_0.31_293)] focus-within:shadow-[0_0_0_3px_oklch(0.53_0.31_293_/_13%)]";
  return <><label className={`${searchClasses} ml-[2.1rem] max-w-[39rem] max-[700px]:ml-0`}><Search size={20} className="flex-none text-[oklch(0.51_0.08_279)]" /><input className="w-full border-0 bg-transparent text-[0.82rem] text-[oklch(0.27_0.13_279)] outline-0 placeholder:text-[oklch(0.51_0.08_279)]" value={draft} onChange={(event) => setDraft(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter" || event.key === ",") { event.preventDefault(); add(); } }} onBlur={add} placeholder={placeholder} /></label><div className="mt-[0.6rem] ml-[2.1rem] flex flex-wrap gap-[0.45rem] max-[700px]:ml-0">{values.map((value) => <span key={value} className="inline-flex items-center gap-[0.35rem] rounded-full border border-[oklch(0.84_0.06_292)] bg-[oklch(0.95_0.03_295)] px-[0.7rem] py-[0.35rem] pr-[0.55rem] text-[0.68rem] font-semibold text-[oklch(0.42_0.23_290)]">{value}<button type="button" className="cursor-pointer border-0 bg-transparent text-[0.95rem] leading-[0.7] text-current" onClick={() => setValues(values.filter((item) => item !== value))} aria-label={`Remove ${value}`}>&times;</button></span>)}<button type="button" className="cursor-pointer border-0 bg-transparent text-[0.7rem] font-bold text-[oklch(0.53_0.31_293)]" onClick={(event) => (event.currentTarget.parentElement?.previousElementSibling?.querySelector("input") as HTMLInputElement | null)?.focus()}>+ Add More</button></div></>;
}

function LanguageMultiSelect({ values, setValues }: { values: string[]; setValues: (values: string[]) => void }) {
  const toggle = (lang: string) => {
    setValues(
      values.some((item) => item.toLowerCase() === lang.toLowerCase())
        ? values.filter((item) => item.toLowerCase() !== lang.toLowerCase())
        : [...values, lang]
    );
  };
  const label = values.length === 0 ? "Select languages you speak" : `${values.length} selected — ${values.slice(0, 2).join(", ")}${values.length > 2 ? ` +${values.length - 2} more` : ""}`;
  return (
    <div className="ml-[2.1rem] max-w-[39rem] max-[700px]:ml-0">
      <DropdownMenu>
        <DropdownMenuTrigger className="flex min-h-[3.05rem] w-full items-center gap-3 rounded-xl border border-[oklch(0.87_0.035_288)] bg-[oklch(1_0_0_/_82%)] px-4 text-left text-[0.82rem] text-[oklch(0.27_0.13_279)] shadow-[0_2px_8px_oklch(0.27_0.13_279_/_5%)] data-[state=open]:border-[oklch(0.53_0.31_293)]">
          <Search size={20} className="flex-none text-[oklch(0.51_0.08_279)]" />
          <span className={`flex-1 truncate ${values.length === 0 ? "text-[oklch(0.51_0.08_279)]" : ""}`}>{label}</span>
          <ChevronDown size={16} className="flex-none text-[oklch(0.53_0.31_293)]" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="max-h-72 w-[var(--radix-dropdown-menu-trigger-width)] overflow-auto">
          <DropdownMenuLabel>Select all languages you speak</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {languageOptions.map((lang) => (
            <DropdownMenuCheckboxItem
              key={lang}
              checked={values.some((item) => item.toLowerCase() === lang.toLowerCase())}
              onCheckedChange={() => toggle(lang)}
              onSelect={(event) => event.preventDefault()}
            >
              {lang}
            </DropdownMenuCheckboxItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
      {values.length > 0 && (
        <div className="mt-[0.6rem] flex flex-wrap gap-[0.45rem]">
          {values.map((value) => (
            <span key={value} className="inline-flex items-center gap-[0.35rem] rounded-full border border-[oklch(0.84_0.06_292)] bg-[oklch(0.95_0.03_295)] px-[0.7rem] py-[0.35rem] pr-[0.55rem] text-[0.68rem] font-semibold text-[oklch(0.42_0.23_290)]">
              {value}
              <button type="button" className="cursor-pointer border-0 bg-transparent text-[0.95rem] leading-[0.7] text-current" onClick={() => setValues(values.filter((item) => item !== value))} aria-label={`Remove ${value}`}>
                &times;
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

export type LocationPreferences = {
  city: string;
  travel: string;
  preferredCities: string[];
  languages: string[];
  nativeLanguage: string;
  workingLanguage: string;
};

function LocationStep({
  onComplete,
  submitting,
  error,
  submitLabel = "Create account",
  submittingLabel = "Creating account...",
}: {
  onComplete: (preferences: LocationPreferences) => void;
  submitting: boolean;
  error: string | null;
  submitLabel?: string;
  submittingLabel?: string;
}) {
  const [travel, setTravel] = useState("");
  const [city, setCity] = useState("");
  const [cities, setCities] = useState<string[]>([]);
  const [languages, setLanguages] = useState<string[]>([]);
  const [nativeLanguage, setNativeLanguage] = useState("");
  const [workingLanguage, setWorkingLanguage] = useState("");
  const [fieldErrors, setFieldErrors] = useState<{ city?: string; travel?: string }>({});
  // Native / working must be one of Languages Spoken — clear stale selection when list changes.
  const updateLanguages = (next: string[]) => {
    setLanguages(next);
    const has = (value: string) => value !== "" && next.some((lang) => lang.toLowerCase() === value.toLowerCase());
    if (!has(nativeLanguage)) setNativeLanguage("");
    if (!has(workingLanguage)) setWorkingLanguage("");
  };
  const searchClasses = "flex min-h-[3.05rem] items-center gap-3 rounded-xl border border-[oklch(0.87_0.035_288)] bg-[oklch(1_0_0_/_82%)] px-4 shadow-[0_2px_8px_oklch(0.27_0.13_279_/_5%)] focus-within:border-[oklch(0.53_0.31_293)] focus-within:shadow-[0_0_0_3px_oklch(0.53_0.31_293_/_13%)]";
  const ctaClasses = "mt-[1.8rem] ml-[2.1rem] flex min-h-[3.35rem] max-w-[39rem] w-[calc(100%-2.1rem)] items-center justify-center gap-3 rounded-xl border-0 bg-[linear-gradient(110deg,oklch(0.49_0.27_288),oklch(0.57_0.27_300))] text-base font-bold text-white shadow-[0_12px_28px_oklch(0.49_0.27_288_/_28%)] hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-60 max-[700px]:ml-0 max-[700px]:w-full";
  const proficiencyLanguages = useMemo(() => {
    const names = Array.from(
      new Set([nativeLanguage, workingLanguage, ...languages].map((name) => name.trim()).filter(Boolean))
    );
    return names.map((name) => ({
      name,
      label: name === nativeLanguage ? "Native" : name === workingLanguage ? "Fluent" : "Conversational",
      level: name === nativeLanguage ? 9 : name === workingLanguage ? 7 : 4,
    }));
  }, [languages, nativeLanguage, workingLanguage]);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const next: { city?: string; travel?: string } = {};
    if (!city.trim()) next.city = "Current city is required";
    if (!travel) next.travel = "Choose how far you are willing to travel";
    setFieldErrors(next);
    if (Object.keys(next).length > 0) return;
    onComplete({ city: city.trim(), travel, preferredCities: cities, languages, nativeLanguage: nativeLanguage.trim(), workingLanguage: workingLanguage.trim() });
  };

  return <form className="mt-[2.2rem] w-full max-w-[50rem] max-[700px]:mt-[1.7rem]" onSubmit={handleSubmit} noValidate>
    <div className="mt-[2.2rem]"><p className="m-0 text-[0.72rem] font-bold tracking-[0.16em] text-[oklch(0.51_0.08_279)]">LET THE RIGHT OPPORTUNITIES FIND YOU</p><h1 className="mt-[0.8rem] text-[clamp(2.8rem,6vw,3.8rem)] font-extrabold leading-[0.98] tracking-[-0.055em] text-[oklch(0.27_0.13_279)] max-[700px]:text-[2.8rem]">Help opportunities<br /><em className="not-italic text-[oklch(0.53_0.31_293)]">find you.</em></h1><p className="mt-4 max-w-[32rem] text-base font-medium leading-[1.55] text-[oklch(0.51_0.08_279)]">Share your location and language preferences to get better matches.</p></div>
      <section className="mt-7"><FieldHeading Icon={MapPin} title="Current City" required /><label className={`${searchClasses} ml-[2.1rem] max-w-[39rem] max-[700px]:ml-0 ${fieldErrors.city ? "border-red-500" : ""}`}><Search size={20} className="flex-none text-[oklch(0.51_0.08_279)]" /><input className="w-full border-0 bg-transparent text-[0.82rem] text-[oklch(0.27_0.13_279)] outline-0 placeholder:text-[oklch(0.51_0.08_279)]" value={city} onChange={(event) => { setCity(event.target.value); setFieldErrors((current) => ({ ...current, city: undefined })); }} placeholder="e.g. Mumbai, Maharashtra, India" aria-label="Current city" aria-invalid={Boolean(fieldErrors.city)} />{city.length > 0 && <button type="button" onClick={() => setCity("")} className="cursor-pointer border-0 bg-transparent text-[1.2rem] text-[oklch(0.51_0.08_279)]" aria-label="Clear current city">&times;</button>}</label>{fieldErrors.city ? <p className="mt-1 ml-[2.1rem] text-[0.7rem] font-medium text-red-600 max-[700px]:ml-0" role="alert">{fieldErrors.city}</p> : null}</section>
     <section className="mt-7"><FieldHeading Icon={Plane} title="Willing to Travel" required description="Select how far you are open to travel for work." /><div className="grid grid-cols-3 gap-3 max-[700px]:grid-cols-1">{travelChoices.map(({ id, title, description, Icon }) => <button key={id} type="button" onClick={() => { setTravel(id); setFieldErrors((current) => ({ ...current, travel: undefined })); }} className={`relative grid min-h-[4.7rem] grid-cols-[2.2rem_1fr_auto] items-center gap-x-2 gap-y-[0.35rem] rounded-[0.7rem] border bg-[oklch(1_0_0_/_72%)] p-[0.65rem] text-left text-[oklch(0.27_0.13_279)] ${travel === id ? "border-[oklch(0.53_0.31_293)] shadow-[0_0_0_1px_oklch(0.53_0.31_293)]" : fieldErrors.travel ? "border-red-500" : "border-[oklch(0.87_0.035_288)]"}`} aria-pressed={travel === id}><span className="row-span-2 grid size-8 place-items-center rounded-[0.55rem] bg-[oklch(0.95_0.03_295)] text-[oklch(0.53_0.31_293)]"><Icon /></span><strong className="text-[0.75rem]">{title}</strong><small className="text-[0.63rem] text-[oklch(0.51_0.08_279)]">{description}</small><i className={`absolute right-[0.6rem] top-[0.65rem] size-[0.7rem] rounded-full ${travel === id ? "bg-[oklch(0.53_0.31_293)] shadow-[inset_0_0_0_2px_white]" : "border border-[oklch(0.87_0.035_288)]"}`} /></button>)}</div>{fieldErrors.travel ? <p className="mt-1 text-[0.7rem] font-medium text-red-600" role="alert">{fieldErrors.travel}</p> : null}</section>
    <section className="mt-7"><FieldHeading Icon={MapPin} title="Preferred Cities" optional description="Select cities where you'd like to work." /><ChipInput values={cities} setValues={setCities} placeholder="Search and add cities" /></section>
    <section className="mt-7"><FieldHeading Icon={Languages} title="Languages Spoken" description="Select all languages you speak." /><LanguageMultiSelect values={languages} setValues={updateLanguages} /></section>
     <section className="mt-7 grid grid-cols-2 gap-6 max-[700px]:grid-cols-1 max-[700px]:gap-5"><div><FieldHeading Icon={Sparkles} title="Native Language" optional description="Choose one of your spoken languages." /><div className="ml-[2.1rem] max-w-[39rem] max-[700px]:ml-0"><Select value={nativeLanguage} onValueChange={setNativeLanguage} disabled={languages.length === 0}><SelectTrigger aria-label="Native language" className="flex min-h-[2.8rem] w-full items-center justify-between gap-3 rounded-xl border border-[oklch(0.87_0.035_288)] bg-[oklch(1_0_0_/_82%)] px-4 text-[0.82rem] text-[oklch(0.27_0.13_279)] shadow-[0_2px_8px_oklch(0.27_0.13_279_/_5%)] data-[placeholder]:text-[oklch(0.51_0.08_279)] disabled:cursor-not-allowed disabled:opacity-60"><SelectValue placeholder={languages.length === 0 ? "Add languages above first" : "Select native language"} /></SelectTrigger><SelectContent>{languages.map((lang) => <SelectItem key={lang} value={lang}>{lang}</SelectItem>)}</SelectContent></Select></div></div><div><FieldHeading Icon={Languages} title="Working Language" optional description="Choose one of your spoken languages." /><div className="ml-[2.1rem] max-w-[39rem] max-[700px]:ml-0"><Select value={workingLanguage} onValueChange={setWorkingLanguage} disabled={languages.length === 0}><SelectTrigger aria-label="Working language" className="flex min-h-[2.8rem] w-full items-center justify-between gap-3 rounded-xl border border-[oklch(0.87_0.035_288)] bg-[oklch(1_0_0_/_82%)] px-4 text-[0.82rem] text-[oklch(0.27_0.13_279)] shadow-[0_2px_8px_oklch(0.27_0.13_279_/_5%)] data-[placeholder]:text-[oklch(0.51_0.08_279)] disabled:cursor-not-allowed disabled:opacity-60"><SelectValue placeholder={languages.length === 0 ? "Add languages above first" : "Select working language"} /></SelectTrigger><SelectContent>{languages.map((lang) => <SelectItem key={lang} value={lang}>{lang}</SelectItem>)}</SelectContent></Select></div></div></section>
    <section className="mt-7"><FieldHeading Icon={Sparkles} title="Language Proficiency" optional description="Set your proficiency level for selected languages." />{proficiencyLanguages.length === 0 ? <p className="rounded-[0.7rem] border border-dashed border-[oklch(0.87_0.035_288)] bg-[oklch(1_0_0_/_72%)] px-4 py-5 text-center text-[0.75rem] text-[oklch(0.51_0.08_279)]">No languages selected yet. Add languages above to see proficiency here.</p> : <div className="overflow-hidden rounded-[0.7rem] border border-[oklch(0.87_0.035_288)] bg-[oklch(1_0_0_/_72%)]">{proficiencyLanguages.map(({ name, label, level }, rowIndex) => <div key={name} className={`grid min-h-[2.7rem] grid-cols-[9rem_8rem_1fr] items-center gap-[0.7rem] px-4 text-[0.7rem] max-[700px]:grid-cols-[5rem_6rem_1fr] max-[700px]:gap-[0.4rem] max-[700px]:px-[0.65rem] ${rowIndex ? "border-t border-[oklch(0.87_0.035_288)]" : ""}`}><strong>{name}</strong><span className="text-right text-[oklch(0.51_0.08_279)]">{label}</span><i className="flex gap-[0.18rem]">{Array.from({ length: 9 }, (_, index) => <b key={index} className={`block h-[0.35rem] w-[0.65rem] rounded-full max-[700px]:w-2 ${index < level ? "bg-[oklch(0.53_0.31_293)]" : "bg-[oklch(0.87_0.035_288)]"}`} />)}</i></div>)}</div>}</section>
     {error && <p className="mt-5 rounded-xl bg-red-500/10 px-4 py-3 text-sm font-medium text-red-700" role="alert">{error}</p>}
       <button className={ctaClasses} type="submit" disabled={submitting}><span>{submitting ? submittingLabel : submitLabel}</span>{submitting ? <Loader2 size={20} className="animate-spin" /> : <ArrowRight size={20} />}</button>
    <div className="mt-[1.15rem] flex items-center gap-[0.7rem] text-[0.76rem] text-[oklch(0.51_0.08_279)]"><i className="h-px flex-1 bg-[oklch(0.87_0.035_288)]" /><p className="m-0 whitespace-nowrap">Already have an account? <a className="font-bold text-[oklch(0.53_0.31_293)] underline" href="/auth/login">Sign In</a></p><i className="h-px flex-1 bg-[oklch(0.87_0.035_288)]" /></div>
   </form>;
}

function TalentVerificationStep({
  email,
  onBack,
  onVerified,
}: {
  email: string;
  onBack: () => void;
  onVerified: () => Promise<void>;
}) {
  const router = useRouter();
  const { setAccessToken, fetchUser } = useAuthStore();
  const [otp, setOtp] = useState("");
  const [status, setStatus] = useState<"entering" | "verifying" | "verified">("entering");
  const [error, setError] = useState<string | null>(null);
  const [resendLoading, setResendLoading] = useState(false);
  const [cooldown, setCooldown] = useState(60);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = window.setTimeout(() => setCooldown((current) => current - 1), 1000);
    return () => window.clearTimeout(timer);
  }, [cooldown]);

  useEffect(() => {
    if (status !== "verified") return;
    const timer = window.setTimeout(() => router.replace("/talent/dashboard"), 1400);
    return () => window.clearTimeout(timer);
  }, [router, status]);

  const handleVerify = async () => {
    setError(null);
    setStatus("verifying");
    try {
      const result = await authApi.verifyOtp(email, otp);
      setAccessToken(result.access_token);
      await fetchUser();
      await onVerified();
      setStatus("verified");
    } catch (err: unknown) {
      const response = err as { response?: { data?: { message?: string } } };
      setError(response.response?.data?.message || "Invalid OTP. Please try again.");
      setStatus("entering");
    }
  };

  const handleResend = async () => {
    setError(null);
    setResendLoading(true);
    try {
      await authApi.resendOtp(email);
      setOtp("");
      setCooldown(60);
    } catch (err: unknown) {
      const response = err as { response?: { data?: { message?: string } } };
      setError(response.response?.data?.message || "Could not resend the verification code.");
    } finally {
      setResendLoading(false);
    }
  };

  if (status === "verified") {
    return <div className="mx-auto mt-16 flex max-w-[32rem] flex-col items-center text-center"><div className="mb-4 grid size-16 place-items-center rounded-full bg-green-500/15 text-green-600"><CheckCircle2 size={34} /></div><h1 className="text-3xl font-extrabold tracking-tight">You&apos;re all set!</h1><p className="mt-2 text-sm text-[oklch(0.51_0.08_279)]">Your talent profile is ready. Redirecting to your dashboard...</p></div>;
  }

  return <div className="mx-auto mt-16 flex w-full max-w-[32rem] flex-col items-center text-center"><div className="mb-4 grid size-14 place-items-center rounded-full border border-[oklch(0.53_0.31_293_/_30%)] bg-[oklch(0.53_0.31_293_/_10%)] text-[oklch(0.53_0.31_293)]"><Mail size={25} /></div><h1 className="text-3xl font-extrabold tracking-tight">Verify your email</h1><p className="mt-2 text-sm text-[oklch(0.51_0.08_279)]">We&apos;ve sent a 6-digit code to</p><p className="mt-1 font-semibold text-[oklch(0.53_0.31_293)]">{email}</p>{error && <p className="mt-5 w-full rounded-xl bg-red-500/10 px-4 py-3 text-sm font-medium text-red-700" role="alert">{error}</p>}<h2 className="mt-8 text-lg font-bold">Enter verification code</h2><p className="mt-1 text-sm text-[oklch(0.51_0.08_279)]">Check your inbox and enter the code</p><OtpInput value={otp} onChange={setOtp} className="mt-5" /><p className="mt-4 text-sm text-[oklch(0.51_0.08_279)]">{cooldown > 0 ? <>Resend code in <strong className="text-[oklch(0.27_0.13_279)]">{String(Math.floor(cooldown / 60)).padStart(2, "0")}:{String(cooldown % 60).padStart(2, "0")}</strong></> : <button type="button" onClick={handleResend} disabled={resendLoading} className="font-semibold text-[oklch(0.53_0.31_293)] hover:underline">{resendLoading ? "Resending..." : "Resend code"}</button>}</p><button type="button" disabled={otp.length < 6 || status === "verifying"} onClick={handleVerify} className="mt-5 flex min-h-[3.35rem] w-full items-center justify-center gap-3 rounded-xl border-0 bg-[linear-gradient(110deg,oklch(0.49_0.27_288),oklch(0.57_0.27_300))] text-base font-bold text-white shadow-[0_12px_28px_oklch(0.49_0.27_288_/_28%)] disabled:cursor-not-allowed disabled:opacity-60">{status === "verifying" ? <><Loader2 size={20} className="animate-spin" />Verifying...</> : <>Verify &amp; continue<ArrowRight size={20} /></>}</button><button type="button" onClick={onBack} className="mt-4 text-sm font-semibold text-[oklch(0.53_0.31_293)] hover:underline">Back to edit details</button></div>;
}

export function TalentOnboarding({ isGoogleResume = false }: { isGoogleResume?: boolean }) {
  const [step, setStep] = useState<Step>(1);
  const [account, setAccount] = useState<Account>({ fullName: "", professionalName: "", username: "", email: "", phone: "", password: "" });
  const [selected, setSelected] = useState<string[]>([]);
  const [signupEmail, setSignupEmail] = useState<string | null>(null);
  const [preferences, setPreferences] = useState<LocationPreferences | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [signupError, setSignupError] = useState<string | null>(null);
  if (isGoogleResume) return <GoogleTalentOnboarding />;

  const selectedLabels = selected.map((id) => categories.find((category) => category.id === id)?.label).filter((label): label is string => Boolean(label));

  const handleSignup = async (nextPreferences: LocationPreferences) => {
    setSignupError(null);
    setSubmitting(true);
    try {
      const username = account.username.trim();
      const usernameResult = await authApi.checkUsername(username);
      if (!usernameResult.available) {
        throw new Error("That username is not available. Please choose another one.");
      }

      await authApi.signup({
        name: account.fullName.trim(),
        email: account.email.trim().toLowerCase(),
        phone: account.phone,
        password: account.password,
        role: "talent",
        verification_method: "email",
        username,
        profession: selectedLabels[0],
        specialties: selectedLabels.slice(1),
        professional_name: account.professionalName.trim() || undefined,
        willing_to_travel: nextPreferences.travel || undefined,
        preferred_cities: nextPreferences.preferredCities.length
          ? nextPreferences.preferredCities
          : undefined,
      });
      setPreferences(nextPreferences);
      setSignupEmail(account.email.trim().toLowerCase());
    } catch (err: unknown) {
      const response = err as { response?: { data?: { message?: string } } };
      setSignupError(response.response?.data?.message || (err instanceof Error ? err.message : "Could not create your account. Please try again."));
    } finally {
      setSubmitting(false);
    }
  };

  const completeProfile = async () => {
    if (!preferences) return;
    const locationParts = preferences.city.split(",").map((part) => part.trim()).filter(Boolean);
    const languageNames = Array.from(
      new Set(
        [...preferences.languages, preferences.nativeLanguage, preferences.workingLanguage]
          .map((name) => name?.trim())
          .filter((name): name is string => Boolean(name))
      )
    );
    try {
      await talentApi.updateMyProfile({
        professions: selectedLabels,
        specialties: selectedLabels.slice(1),
        professional_name: account.professionalName.trim() || undefined,
        willing_to_travel: preferences.travel || undefined,
        preferred_cities: preferences.preferredCities.length ? preferences.preferredCities : undefined,
        location: {
          city: locationParts[0] || preferences.city,
          state: locationParts[1],
          country: locationParts[2] || "India",
        },
        languages: languageNames.length
          ? languageNames.map((name) => ({
              name,
              fluency: name === preferences.nativeLanguage ? "native" : name === preferences.workingLanguage ? "fluent" : "conversational",
            }))
          : undefined,
      });
    } catch {
      // The account is already verified; profile details can be completed from the dashboard.
    }
  };

  const backdrop = step === 3 ? "/assets/talent-onboarding/mumbai-opportunities.jpg" : "/assets/onboarding/rootin-talent-collage.png";
  const backdropAlt = step === 3 ? "Mumbai skyline and the Gateway of India at sunset" : "Actors, a dancer and a singer pursuing creative careers";
  const backdropClasses = step === 3 ? "absolute inset-0 h-full w-full object-cover object-right opacity-[0.78]" : "absolute inset-0 h-full w-full object-cover object-center opacity-[0.12]";
  const washClasses = step === 3 ? "absolute inset-0 bg-[linear-gradient(90deg,oklch(0.985_0.009_288_/_99%),oklch(0.985_0.009_288_/_94%)_52%,oklch(0.985_0.009_288_/_34%)_78%,transparent)]" : "absolute inset-0 bg-[linear-gradient(90deg,oklch(0.985_0.009_288_/_98%),oklch(0.985_0.009_288_/_91%)_55%,oklch(0.985_0.009_288_/_72%))]";

  if (signupEmail) {
    return <main className="min-h-svh overflow-x-hidden bg-[oklch(0.88_0.055_287)] font-[var(--font-rubik)] text-[oklch(0.27_0.13_279)]"><div className="relative mx-auto min-h-svh w-full max-w-[56rem] overflow-hidden bg-[oklch(0.985_0.009_288)] shadow-[0_0_80px_oklch(0.28_0.12_280_/_22%)]"><div className="relative z-10 min-h-svh w-full px-[1.25rem] pb-12 pt-8 max-[700px]:pb-8 max-[700px]:pt-5"><TopBar step={3} /><TalentVerificationStep email={signupEmail} onBack={() => setSignupEmail(null)} onVerified={completeProfile} /></div></div></main>;
  }

  return <main className="min-h-svh overflow-x-hidden bg-[oklch(0.88_0.055_287)] font-[var(--font-rubik)] text-[oklch(0.27_0.13_279)]"><div className="relative mx-auto min-h-svh w-full max-w-[56rem] overflow-hidden bg-[oklch(0.985_0.009_288)] shadow-[0_0_80px_oklch(0.28_0.12_280_/_22%)]">
    {step !== 1 && <><Image className={backdropClasses} src={backdrop} alt={backdropAlt} fill sizes="(max-width: 900px) 100vw, 900px" /><div className={`${washClasses} pointer-events-none`} /></>}
     <div className="relative z-10 min-h-svh w-full px-[1.25rem] pb-12 pt-8 max-[700px]:pb-8 max-[700px]:pt-5">
      <TopBar step={step} />
      {step === 1 && <AccountStep account={account} setAccount={setAccount} onContinue={() => setStep(2)} />}
      {step === 2 && <CategoriesStep selected={selected} onToggle={(id) => setSelected((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id])} onContinue={() => setStep(3)} />}
       {step === 3 && <LocationStep onComplete={handleSignup} submitting={submitting} error={signupError} />}
     </div>
   </div></main>;
}

type GoogleAccount = {
  fullName: string;
  username: string;
  phone: string;
};

function toE164(phone: string) {
  const digits = phone.replace(/\D/g, "");
  if (digits.length === 10) return `+91${digits}`;
  if (digits.length === 12 && digits.startsWith("91")) return `+${digits}`;
  return phone.startsWith("+") ? phone : `+${digits}`;
}

function GoogleAccountStep({
  account,
  setAccount,
  email,
  phoneVerified,
  setPhoneVerified,
  onContinue,
}: {
  account: GoogleAccount;
  setAccount: (account: GoogleAccount) => void;
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
  const [checkingUsername, setCheckingUsername] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof GoogleAccount, string>>>({});
  const [usernameStatus, setUsernameStatus] = useState<"checking" | "available" | "taken" | undefined>();

  const update = (field: keyof GoogleAccount, value: string) => {
    setAccount({ ...account, [field]: value });
    setFieldErrors((current) => ({ ...current, [field]: undefined }));
    if (field === "username") setUsernameStatus(undefined);
    setError(null);
  };

  const handlePhoneChange = (value: string) => {
    update("phone", value.replace(/\D/g, "").slice(0, 10));
    setPhoneVerified(false);
    setOtpSent(false);
    setOtp("");
  };

  const handleSendOtp = async () => {
    if (account.phone.length !== 10) {
      setFieldErrors((current) => ({ ...current, phone: "Enter a valid 10-digit mobile number first" }));
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

  const checkUsername = async () => {
    setCheckingUsername(true);
    setUsernameStatus("checking");
    try {
      const result = await authApi.checkUsername(account.username.trim());
      if (!result.available) {
        setUsernameStatus("taken");
        setFieldErrors((current) => ({ ...current, username: "Username already taken" }));
        return false;
      }
      setUsernameStatus("available");
      setFieldErrors((current) => ({ ...current, username: undefined }));
      return true;
    } catch {
      setUsernameStatus(undefined);
      setFieldErrors((current) => ({ ...current, username: "Could not check username availability" }));
      return false;
    } finally {
      setCheckingUsername(false);
    }
  };

  const handleUsernameBlur = () => {
    if (/^[a-zA-Z0-9]{6,20}$/.test(account.username.trim())) void checkUsername();
  };

  const handleContinue = async () => {
    const next: Partial<Record<keyof GoogleAccount, string>> = {};
    if (!account.fullName.trim()) next.fullName = "Full name is required";
    if (!/^[a-zA-Z0-9]{6,20}$/.test(account.username.trim())) next.username = "Use 6-20 letters or numbers";
    if (account.phone.length !== 10) next.phone = "Enter a valid 10-digit mobile number";
    else if (!phoneVerified) next.phone = "Verify your mobile number before continuing";
    setFieldErrors(next);
    if (Object.keys(next).length > 0) return;
    setError(null);
    if (await checkUsername()) onContinue();
  };

  const ctaClasses = "flex min-h-[3.35rem] w-full items-center justify-center gap-3 rounded-xl border-0 bg-[linear-gradient(110deg,oklch(0.49_0.27_288),oklch(0.57_0.27_300))] text-base font-bold text-white shadow-[0_12px_28px_oklch(0.49_0.27_288_/_28%)] hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-50";

  return (
    <form
      className="mt-[2.2rem] w-full max-w-[52rem] max-[700px]:mt-[1.7rem]"
      onSubmit={(event) => {
        event.preventDefault();
        void handleContinue();
      }}
      noValidate
    >
      <div
        className="grid min-w-0 items-stretch gap-6 bg-contain bg-center bg-no-repeat grid-cols-[minmax(0,7fr)_minmax(13rem,3fr)] max-[700px]:grid-cols-[minmax(0,7fr)_minmax(6rem,3fr)] max-[700px]:gap-3 max-[420px]:grid-cols-1"
        style={{ backgroundImage: "url('/assets/onboarding/talent-onboarding.png')" }}
      >
        <div className="min-w-0">
          <div className="mb-7">
            <p className="m-0 text-[0.72rem] font-bold tracking-[0.16em] text-[oklch(0.51_0.08_279)]">WELCOME TO ROOTIN</p>
            <h1 className="mt-[0.8rem] text-[clamp(2.7rem,6vw,3.8rem)] font-extrabold leading-[0.98] tracking-[-0.055em] text-[oklch(0.27_0.13_279)]">
              Great, you&apos;re<br /><em className="not-italic text-[oklch(0.53_0.31_293)]">signed in!</em> <Sparkles className="inline size-8 align-[0.08em] text-[oklch(0.53_0.31_293)]" aria-hidden="true" />
            </h1>
            <p className="mt-4 max-w-[32rem] text-base font-medium leading-[1.55] text-[oklch(0.51_0.08_279)]">Let&apos;s finish setting up your talent profile.</p>
          </div>

          <div className="flex items-center gap-3 rounded-2xl border border-[oklch(0.87_0.035_288)] bg-white/85 px-4 py-4 shadow-[0_8px_24px_oklch(0.53_0.31_293_/_10%)] backdrop-blur-sm">
            <GoogleBrandIcon />
            <div className="min-w-0 flex-1">
              <p className="m-0 text-[0.82rem] font-bold text-[oklch(0.27_0.13_279)]">Signed in with Google</p>
              <p className="mt-1 truncate text-[0.8rem] text-[oklch(0.51_0.08_279)]">{email}</p>
            </div>
            <CheckCircle2 className="size-5 flex-none text-[oklch(0.57_0.16_153)]" aria-label="Google account verified" />
          </div>

          <div className="mt-5 grid gap-[0.8rem]">
             <AccountField id="google-full-name" label="Your Name" placeholder="Enter your full name" icon={<UserRound />} value={account.fullName} onChange={(value) => update("fullName", value)} error={fieldErrors.fullName} />
             <AccountField id="google-username" label="Choose a Username" placeholder="6-20 letters or numbers" icon={<User />} value={account.username} onChange={(value) => update("username", value.replace(/[^a-zA-Z0-9]/g, "").slice(0, 20))} onBlur={handleUsernameBlur} error={fieldErrors.username} status={usernameStatus} />

             <div className={`rounded-xl border bg-[oklch(1_0_0_/_78%)] px-4 py-3 shadow-[0_4px_14px_oklch(0.53_0.31_293_/_7%)] backdrop-blur-[8px] ${fieldErrors.phone ? "border-red-500" : "border-[oklch(0.87_0.035_288)]"}`}>
              <div className="flex items-center gap-[0.85rem]">
                <span className="grid w-8 flex-none place-items-center text-[oklch(0.53_0.31_293)] [&>svg]:size-[1.35rem] [&>svg]:stroke-[2.1]" aria-hidden="true"><Phone /></span>
                <label htmlFor="google-mobile" className="min-w-0 flex-1">
                  <span className="block text-[0.78rem] font-bold text-[oklch(0.27_0.13_279)]">Mobile Number</span>
                  <span className="mt-[0.2rem] flex items-center gap-[0.45rem] text-[0.88rem] text-[oklch(0.27_0.13_279)]">
                    <span className="grid h-[1.1rem] w-[1.4rem] place-items-center rounded-[0.2rem] bg-[oklch(0.9_0.04_285)] text-[0.52rem] font-extrabold text-[oklch(0.53_0.31_293)]" aria-label="India">IN</span>
                    <strong>+91</strong><ChevronDown size={15} className="text-[oklch(0.53_0.31_293)]" /><i className="h-[1.4rem] w-px bg-[oklch(0.87_0.035_288)]" />
                     <input className="mt-0 min-w-0 w-full border-0 bg-transparent text-[0.9rem] text-[oklch(0.27_0.13_279)] outline-0 placeholder:text-[oklch(0.51_0.08_279)]" id="google-mobile" name="google-mobile" type="tel" inputMode="numeric" maxLength={10} value={account.phone} onChange={(event) => handlePhoneChange(event.target.value)} placeholder="Enter mobile number" required aria-invalid={Boolean(fieldErrors.phone)} />
                  </span>
                </label>
                <button type="button" onClick={() => void handleSendOtp()} disabled={sendingOtp || account.phone.length !== 10 || phoneVerified} className="min-h-10 shrink-0 rounded-lg bg-[oklch(0.53_0.31_293)] px-3 text-[0.72rem] font-bold text-white shadow-[0_6px_14px_oklch(0.53_0.31_293_/_22%)] hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-50">
                  {sendingOtp ? "Sending..." : phoneVerified ? "Verified" : "Send OTP"}
                </button>
              </div>
               {phoneVerified ? <p className="mt-2 pl-[2.85rem] text-[0.72rem] font-semibold text-[oklch(0.57_0.16_153)]"><CheckCircle2 className="mr-1 inline size-3.5 align-[-0.15rem]" />Phone number verified</p> : <p className="mt-2 pl-[2.85rem] text-[0.72rem] text-[oklch(0.51_0.08_279)]"><LockKeyhole className="mr-1 inline size-3.5 align-[-0.15rem]" />We&apos;ll send a verification code to your number</p>}
               {fieldErrors.phone ? <p className="mt-1 pl-[2.85rem] text-[0.7rem] font-medium text-red-600" role="alert">{fieldErrors.phone}</p> : null}
            </div>

            {otpSent && !phoneVerified && <div className="rounded-xl border border-[oklch(0.87_0.035_288)] bg-white/70 px-4 py-4"><p className="m-0 text-[0.72rem] font-bold uppercase tracking-[0.12em] text-[oklch(0.51_0.08_279)]">Enter phone OTP</p><OtpInput value={otp} onChange={setOtp} className="mt-3" /><button type="button" onClick={() => void handleVerifyOtp()} disabled={verifyingOtp || otp.length < 6} className="mt-3 min-h-10 w-full rounded-lg border border-[oklch(0.53_0.31_293)] bg-transparent text-sm font-bold text-[oklch(0.53_0.31_293)] disabled:cursor-not-allowed disabled:opacity-50">{verifyingOtp ? "Verifying..." : "Verify phone number"}</button></div>}
          </div>
        </div>
        <div className="relative h-full min-h-0 aspect-[0.62/1] overflow-hidden rounded-[1.1rem] max-[420px]:hidden" aria-hidden="true" />
      </div>

      {error && <p className="mt-4 rounded-xl bg-red-500/10 px-4 py-3 text-sm font-medium text-red-700" role="alert">{error}</p>}
      <button className={`${ctaClasses} mt-5`} type="submit" disabled={checkingUsername}><span>{checkingUsername ? "Checking username..." : "Continue"}</span>{checkingUsername ? <Loader2 size={20} className="animate-spin" /> : <ArrowRight size={20} />}</button>
      <div className="mt-[1.15rem] flex items-center gap-[0.7rem] text-[0.76rem] text-[oklch(0.51_0.08_279)]"><i className="h-px flex-1 bg-[oklch(0.87_0.035_288)]" /><p className="m-0 whitespace-nowrap">Your Google email is already verified</p><i className="h-px flex-1 bg-[oklch(0.87_0.035_288)]" /></div>
    </form>
  );
}

function GoogleTalentOnboarding() {
  const router = useRouter();
  const fetchUser = useAuthStore((state) => state.fetchUser);
  const [step, setStep] = useState<Step>(1);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [account, setAccount] = useState<GoogleAccount>({ fullName: "", username: "", phone: "" });
  const [phoneVerified, setPhoneVerified] = useState(false);
  const [selected, setSelected] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [signupError, setSignupError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const loadDraft = async () => {
      try {
        const { user } = await authApi.getCurrentUser();
        if (user.role !== "talent") {
          router.replace("/recruiter/dashboard");
          return;
        }
        if (user.onboarding_completed || user.onboarding_exempted) {
          router.replace("/talent/dashboard");
          return;
        }

        let profile: Awaited<ReturnType<typeof talentApi.getMyProfile>> | null = null;
        try {
          profile = await talentApi.getMyProfile();
        } catch {
          // Google signup creates a draft profile; an unavailable draft is safe to ignore.
        }

        if (cancelled) return;
        setEmail(user.email ?? "");
        setAccount({
          fullName: profile?.full_legal_name || user.google_name || "",
          username: profile?.username && !/^user[0-9a-f]{4,}$/i.test(profile.username) ? profile.username : "",
          phone: user.phone?.replace(/\D/g, "").slice(-10) || "",
        });
        setPhoneVerified(Boolean(user.is_phone_verified));
        if (profile?.professions?.length) {
          setSelected(
            profile.professions.flatMap((profession) => {
              const category = categories.find((item) => item.label.toLowerCase() === profession.toLowerCase());
              return category ? [category.id] : [];
            }),
          );
        }
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

  const selectedLabels = useMemo(
    () => selected.map((id) => categories.find((category) => category.id === id)?.label).filter((label): label is string => Boolean(label)),
    [selected],
  );

  const finishGoogleOnboarding = async (preferences: LocationPreferences) => {
    setSignupError(null);
    setSubmitting(true);
    try {
      const locationParts = preferences.city.split(",").map((part) => part.trim()).filter(Boolean);
      const languageNames = Array.from(
        new Set(
          [...preferences.languages, preferences.nativeLanguage, preferences.workingLanguage]
            .map((name) => name.trim())
            .filter(Boolean),
        ),
      );

      await talentApi.updateMyProfile({
        username: account.username.trim().toLowerCase(),
        full_legal_name: account.fullName.trim(),
        professions: selectedLabels,
        specialties: selectedLabels.slice(1),
        willing_to_travel: preferences.travel,
        preferred_cities: preferences.preferredCities.length ? preferences.preferredCities : undefined,
        location: {
          city: locationParts[0] || preferences.city.trim(),
          state: locationParts[1],
          country: locationParts[2] || "India",
        },
        languages: languageNames.length
          ? languageNames.map((name) => ({
              name,
              fluency: name === preferences.nativeLanguage ? "native" : name === preferences.workingLanguage ? "fluent" : "conversational",
            }))
          : undefined,
      });
      await authApi.completeOnboarding();
      await fetchUser();
      router.replace("/talent/dashboard");
    } catch (err: unknown) {
      const response = err as { response?: { data?: { message?: string } } };
      setSignupError(response.response?.data?.message || (err instanceof Error ? err.message : "Could not complete your profile. Please try again."));
    } finally {
      setSubmitting(false);
    }
  };

  const backdrop = step === 3 ? "/assets/talent-onboarding/mumbai-opportunities.jpg" : "/assets/onboarding/rootin-talent-collage.png";
  const backdropAlt = step === 3 ? "Mumbai skyline and the Gateway of India at sunset" : "Actors, a dancer and a singer pursuing creative careers";
  const backdropClasses = step === 3 ? "absolute inset-0 h-full w-full object-cover object-right opacity-[0.78]" : "absolute inset-0 h-full w-full object-cover object-center opacity-[0.12]";
  const washClasses = step === 3 ? "absolute inset-0 bg-[linear-gradient(90deg,oklch(0.985_0.009_288_/_99%),oklch(0.985_0.009_288_/_94%)_52%,oklch(0.985_0.009_288_/_34%)_78%,transparent)]" : "absolute inset-0 bg-[linear-gradient(90deg,oklch(0.985_0.009_288_/_98%),oklch(0.985_0.009_288_/_91%)_55%,oklch(0.985_0.009_288_/_72%))]";

  if (loading) {
    return <main className="flex min-h-svh items-center justify-center bg-[oklch(0.88_0.055_287)] font-[var(--font-rubik)]"><Loader2 className="size-8 animate-spin text-[oklch(0.53_0.31_293)]" /></main>;
  }

  return <main className="min-h-svh overflow-x-hidden bg-[oklch(0.88_0.055_287)] font-[var(--font-rubik)] text-[oklch(0.27_0.13_279)]"><div className="relative mx-auto min-h-svh w-full max-w-[56rem] overflow-hidden bg-[oklch(0.985_0.009_288)] shadow-[0_0_80px_oklch(0.28_0.12_280_/_22%)]">
    {step !== 1 && <><Image className={backdropClasses} src={backdrop} alt={backdropAlt} fill sizes="(max-width: 900px) 100vw, 900px" /><div className={`${washClasses} pointer-events-none`} /></>}
    <div className="relative z-10 min-h-svh w-full px-[1.25rem] pb-12 pt-8 max-[700px]:pb-8 max-[700px]:pt-5">
      <TopBar step={step} />
      {step === 1 && <GoogleAccountStep account={account} setAccount={setAccount} email={email} phoneVerified={phoneVerified} setPhoneVerified={setPhoneVerified} onContinue={() => setStep(2)} />}
      {step === 2 && <CategoriesStep selected={selected} onToggle={(id) => setSelected((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id])} onContinue={() => setStep(3)} />}
      {step === 3 && <LocationStep onComplete={finishGoogleOnboarding} submitting={submitting} error={signupError} submitLabel="Finish setup" submittingLabel="Finishing setup..." />}
    </div>
  </div></main>;
}
