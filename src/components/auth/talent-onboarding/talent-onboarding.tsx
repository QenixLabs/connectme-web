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
}) {
  return (
    <label htmlFor={id} className="flex min-h-[4.4rem] items-center gap-[0.85rem] rounded-xl border border-[oklch(0.87_0.035_288)] bg-[oklch(1_0_0_/_78%)] px-4 py-3 shadow-[0_4px_14px_oklch(0.53_0.31_293_/_7%)] backdrop-blur-[8px] focus-within:border-[oklch(0.53_0.31_293)] focus-within:shadow-[0_0_0_3px_oklch(0.53_0.31_293_/_13%)]">
      <span className="grid w-8 flex-none place-items-center text-[oklch(0.53_0.31_293)] [&>svg]:size-[1.35rem] [&>svg]:stroke-[2.1]" aria-hidden="true">{icon}</span>
      <span className="min-w-0 flex-1">
        <span className="block text-[0.78rem] font-bold text-[oklch(0.27_0.13_279)]">{label} {optional && <small className="text-[0.72rem] font-normal text-[oklch(0.51_0.08_279)]">(Optional)</small>}</span>
        <input className="mt-[0.2rem] w-full border-0 bg-transparent text-[0.9rem] text-[oklch(0.27_0.13_279)] outline-0 placeholder:text-[oklch(0.51_0.08_279)]" id={id} name={id} type={type} value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} required={!optional} />
      </span>
      {right}
    </label>
  );
}

function AccountStep({ account, setAccount, onContinue }: { account: Account; setAccount: (account: Account) => void; onContinue: () => void }) {
  const [showPassword, setShowPassword] = useState(false);
  const checks = passwordRules.map(({ test }) => test(account.password));
  const canContinue =
    account.fullName.trim().length > 0 &&
    /^\S+@\S+\.\S+$/.test(account.email.trim()) &&
    /^\d{10}$/.test(account.phone) &&
    /^[a-zA-Z0-9]{6,20}$/.test(account.username) &&
    checks.every(Boolean);
  const update = (field: keyof Account, value: string) => setAccount({ ...account, [field]: value });
  const ctaClasses = "flex min-h-[3.35rem] w-full items-center justify-center gap-3 rounded-xl border-0 bg-[linear-gradient(110deg,oklch(0.49_0.27_288),oklch(0.57_0.27_300))] text-base font-bold text-white shadow-[0_12px_28px_oklch(0.49_0.27_288_/_28%)] hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-50";

  return (
    <form className="mt-[2.2rem] w-full max-w-[52rem] max-[700px]:mt-[1.7rem]" onSubmit={(event) => { event.preventDefault(); onContinue(); }}>
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
            <AccountField id="full-name" label="Full Name" placeholder="Enter your full name" icon={<UserRound />} value={account.fullName} onChange={(value) => update("fullName", value)} />
            <AccountField id="professional-name" label="Professional Name" optional placeholder="How you want to be known" icon={<Sparkles />} value={account.professionalName} onChange={(value) => update("professionalName", value)} />
            <AccountField id="username" label="Username" placeholder="6-20 letters or numbers" icon={<User />} value={account.username} onChange={(value) => update("username", value.replace(/[^a-zA-Z0-9]/g, "").slice(0, 20))} />
            <AccountField id="email" label="Email Address" placeholder="you@example.com" type="email" icon={<Mail />} value={account.email} onChange={(value) => update("email", value)} />

            <label htmlFor="mobile" className="flex min-h-[4.4rem] items-center gap-[0.85rem] rounded-xl border border-[oklch(0.87_0.035_288)] bg-[oklch(1_0_0_/_78%)] px-4 py-3 shadow-[0_4px_14px_oklch(0.53_0.31_293_/_7%)] backdrop-blur-[8px] focus-within:border-[oklch(0.53_0.31_293)] focus-within:shadow-[0_0_0_3px_oklch(0.53_0.31_293_/_13%)]">
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

            <AccountField id="password" label="Password" placeholder="Create a strong password" type={showPassword ? "text" : "password"} icon={<LockKeyhole />} value={account.password} onChange={(value) => update("password", value)} right={<button type="button" className="cursor-pointer border-0 bg-transparent text-[oklch(0.53_0.31_293)]" onClick={() => setShowPassword((visible) => !visible)} aria-label={showPassword ? "Hide password" : "Show password"}>{showPassword ? <Eye size={20} /> : <EyeOff size={20} />}</button>} />
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
          <button type="button" className="inline-flex min-h-[2.9rem] min-w-0 flex-1 cursor-pointer items-center justify-center gap-2 rounded-[0.7rem] border border-[oklch(0.87_0.035_288)] bg-[oklch(1_0_0_/_75%)] text-[0.78rem] font-semibold text-[oklch(0.27_0.13_279)] hover:border-[oklch(0.53_0.31_293)]"><b className="text-[1.1rem] text-[oklch(0.53_0.31_293)]">G</b><span className="max-[420px]:hidden">Continue with Google</span></button>
          <button type="button" className="inline-flex min-h-[2.9rem] min-w-0 flex-1 cursor-pointer items-center justify-center gap-2 rounded-[0.7rem] border border-[oklch(0.87_0.035_288)] bg-[oklch(1_0_0_/_75%)] text-[0.78rem] font-semibold text-[oklch(0.27_0.13_279)] hover:border-[oklch(0.53_0.31_293)]"><b className="text-base text-[oklch(0.27_0.13_279)]">●</b><span className="max-[420px]:hidden">Continue with Apple</span></button>
        </div>
        <label className="my-4 flex items-start justify-center gap-[0.6rem] text-[0.75rem] leading-[1.5] text-[oklch(0.27_0.13_279)]"><input className="mt-[0.15rem] size-4 accent-[oklch(0.53_0.31_293)]" type="checkbox" defaultChecked required /><span>I agree to the <a className="font-bold text-[oklch(0.53_0.31_293)] underline" href="/terms">Terms of Service</a> and <a className="font-bold text-[oklch(0.53_0.31_293)] underline" href="/privacy">Privacy Policy</a>.</span></label>
         <button className={ctaClasses} type="submit" disabled={!canContinue}><span>Continue</span><ArrowRight size={20} /></button>
      </div>

      <div className="mt-[1.15rem] flex items-center gap-[0.7rem] text-[0.76rem] text-[oklch(0.51_0.08_279)]"><i className="h-px flex-1 bg-[oklch(0.87_0.035_288)]" /><p className="m-0 whitespace-nowrap">Already have an account? <a className="font-bold text-[oklch(0.53_0.31_293)] underline" href="/auth/login">Sign In</a></p><i className="h-px flex-1 bg-[oklch(0.87_0.035_288)]" /></div>
      <div className="mt-6 flex items-center gap-[0.8rem] text-[0.72rem] leading-[1.4] text-[oklch(0.51_0.08_279)] max-[700px]:items-start"><div className="flex pl-[0.45rem]"><span className="-ml-[0.45rem] grid size-[1.8rem] place-items-center rounded-full border-2 border-[oklch(0.985_0.009_288)] bg-[oklch(0.53_0.31_293)] text-[0.62rem] font-bold text-white">A</span><span className="-ml-[0.45rem] grid size-[1.8rem] place-items-center rounded-full border-2 border-[oklch(0.985_0.009_288)] bg-[oklch(0.63_0.22_350)] text-[0.62rem] font-bold text-white">M</span><span className="-ml-[0.45rem] grid size-[1.8rem] place-items-center rounded-full border-2 border-[oklch(0.985_0.009_288)] bg-[oklch(0.6_0.2_255)] text-[0.62rem] font-bold text-white">R</span><span className="-ml-[0.45rem] grid size-[1.8rem] place-items-center rounded-full border-2 border-[oklch(0.985_0.009_288)] bg-[oklch(0.67_0.18_160)] text-[0.62rem] font-bold text-white">S</span></div><i className="h-8 w-px flex-none bg-[oklch(0.87_0.035_288)]" /><p className="m-0 max-[700px]:max-w-[15rem]">Trusted by 50,000+ talented creators across film, OTT, TV, music, fashion and more.</p></div>
    </form>
  );
}

function CategoriesStep({ selected, onToggle, onContinue }: { selected: string[]; onToggle: (id: string) => void; onContinue: () => void }) {
  const [query, setQuery] = useState("");
  const visible = useMemo(() => {
    const value = query.trim().toLowerCase();
    return value ? categories.filter((category) => category.label.toLowerCase().includes(value)) : categories;
  }, [query]);
  const ctaClasses = "mt-[1.2rem] flex min-h-[3.35rem] w-full items-center justify-center gap-3 rounded-xl border-0 bg-[linear-gradient(110deg,oklch(0.49_0.27_288),oklch(0.57_0.27_300))] text-base font-bold text-white shadow-[0_12px_28px_oklch(0.49_0.27_288_/_28%)] hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-50";
  const searchClasses = "flex min-h-[3.05rem] items-center gap-3 rounded-xl border border-[oklch(0.87_0.035_288)] bg-[oklch(1_0_0_/_82%)] px-4 shadow-[0_2px_8px_oklch(0.27_0.13_279_/_5%)] focus-within:border-[oklch(0.53_0.31_293)] focus-within:shadow-[0_0_0_3px_oklch(0.53_0.31_293_/_13%)]";

  return (
    <form className="mt-[2.2rem] w-full max-w-[31rem] max-[700px]:mt-[1.7rem]" onSubmit={(event) => { event.preventDefault(); if (selected.length) onContinue(); }}>
      <div className="mt-[1.4rem]"><p className="m-0 text-[0.72rem] font-bold tracking-[0.16em] text-[oklch(0.51_0.08_279)]">TELL US ABOUT YOUR TALENT</p><h1 className="mt-[0.8rem] text-[clamp(2.5rem,6vw,3.25rem)] font-extrabold leading-[0.98] tracking-[-0.055em] text-[oklch(0.27_0.13_279)]">What do <em className="not-italic text-[oklch(0.53_0.31_293)]">you do?</em></h1><p className="mt-4 max-w-[32rem] text-base font-medium leading-[1.55] text-[oklch(0.51_0.08_279)]">Select one or more categories that best describe you. You can always update this later.</p></div>
      <label className={`${searchClasses} mt-6`}><Search size={20} className="flex-none text-[oklch(0.51_0.08_279)]" /><input className="w-full border-0 bg-transparent text-[0.82rem] text-[oklch(0.27_0.13_279)] outline-0 placeholder:text-[oklch(0.51_0.08_279)]" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search categories (e.g. Actor, Singer, Dancer...)" /></label>
      <div className="mt-4 grid grid-cols-2 gap-[0.85rem]">
        {visible.map((category) => {
          const active = selected.includes(category.id);
          const Icon = category.Icon;
          return <button type="button" key={category.id} onClick={() => onToggle(category.id)} aria-pressed={active} className={`overflow-hidden rounded-[0.85rem] border-2 bg-white pb-[0.8rem] text-left text-[oklch(0.27_0.13_279)] shadow-[0_2px_10px_oklch(0.53_0.27_288_/_15%)] ${active ? "border-[oklch(0.53_0.31_293)] bg-[oklch(0.95_0.03_295)]" : "border-transparent"}`}>
            <div className="relative mx-[0.2rem] mt-[0.2rem] h-28 overflow-hidden rounded-[0.7rem] bg-[oklch(0.95_0.035_291)]">
              {category.image ? <Image src={category.image} alt={category.label} fill sizes="(max-width: 700px) 45vw, 240px" className="object-cover" /> : <span className="grid size-full place-items-center bg-[linear-gradient(135deg,oklch(0.53_0.31_293_/_82%),oklch(0.27_0.13_279))] text-white"><MoreHorizontal size={30} /></span>}
              {active && <b className="absolute right-[0.45rem] top-[0.45rem] grid size-7 place-items-center rounded-full bg-[oklch(0.53_0.31_293)] text-white"><Check size={16} /></b>}
              <i className="absolute -bottom-[0.9rem] left-1/2 grid size-9 -translate-x-1/2 place-items-center rounded-full bg-white text-[oklch(0.53_0.31_293)] shadow-[0_2px_10px_oklch(0.27_0.13_279_/_12%)]"><Icon size={17} /></i>
            </div>
            <strong className={`mt-4 block text-center text-[0.82rem] ${active ? "text-[oklch(0.53_0.31_293)]" : ""}`}>{category.label}</strong>
          </button>;
        })}
      </div>
      <div className="relative mt-5 min-h-20 overflow-hidden rounded-[0.85rem] bg-[oklch(0.95_0.03_295)]"><div className="absolute inset-y-0 right-0 w-[45%]"><Image src="/assets/talent-onboarding/protip-clapper.jpg" alt="Film clapperboard in purple haze" fill sizes="180px" className="object-cover opacity-80" /></div><div className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,oklch(0.95_0.03_295),oklch(0.95_0.03_295_/_90%)_45%,transparent)]" /><div className="relative z-10 flex gap-[0.65rem] px-4 py-[0.9rem] pr-28 text-[oklch(0.53_0.31_293)]"><Sparkles size={20} className="flex-none" /><p className="m-0 text-[0.78rem] leading-[1.35] text-[oklch(0.27_0.13_279)]"><strong>Pro Tip</strong><br /><span className="text-[0.68rem] text-[oklch(0.51_0.08_279)]">Showcase all your talents to get more relevant opportunities from top recruiters.</span></p></div></div>
      <button className={ctaClasses} type="submit" disabled={!selected.length}><span>Continue</span><ArrowRight size={20} /></button>
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

function FieldHeading({ Icon, title, description, optional }: { Icon: LucideIcon; title: string; description?: string; optional?: boolean }) {
  return <div className="mb-[0.65rem] flex items-start gap-3"><Icon className="mt-[0.1rem] size-[1.35rem] flex-none text-[oklch(0.53_0.31_293)]" /><div><h2 className="m-0 text-[0.86rem] font-extrabold text-[oklch(0.27_0.13_279)]">{title} {optional && <small className="text-[0.72rem] font-normal text-[oklch(0.51_0.08_279)]">(Optional)</small>}</h2>{description && <p className="mt-[0.15rem] text-[0.7rem] leading-[1.35] text-[oklch(0.51_0.08_279)]">{description}</p>}</div></div>;
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
}: {
  onComplete: (preferences: LocationPreferences) => void;
  submitting: boolean;
  error: string | null;
}) {
  const [travel, setTravel] = useState("");
  const [city, setCity] = useState("");
  const [cities, setCities] = useState<string[]>([]);
  const [languages, setLanguages] = useState<string[]>([]);
  const [nativeLanguage, setNativeLanguage] = useState("");
  const [workingLanguage, setWorkingLanguage] = useState("");
  // Native / working must be one of Languages Spoken — clear stale selection when list changes.
  const updateLanguages = (next: string[]) => {
    setLanguages(next);
    const has = (value: string) => value !== "" && next.some((lang) => lang.toLowerCase() === value.toLowerCase());
    if (!has(nativeLanguage)) setNativeLanguage("");
    if (!has(workingLanguage)) setWorkingLanguage("");
  };
  const searchClasses = "flex min-h-[3.05rem] items-center gap-3 rounded-xl border border-[oklch(0.87_0.035_288)] bg-[oklch(1_0_0_/_82%)] px-4 shadow-[0_2px_8px_oklch(0.27_0.13_279_/_5%)] focus-within:border-[oklch(0.53_0.31_293)] focus-within:shadow-[0_0_0_3px_oklch(0.53_0.31_293_/_13%)]";
  const ctaClasses = "mt-[1.8rem] ml-[2.1rem] flex min-h-[3.35rem] max-w-[39rem] w-[calc(100%-2.1rem)] items-center justify-center gap-3 rounded-xl border-0 bg-[linear-gradient(110deg,oklch(0.49_0.27_288),oklch(0.57_0.27_300))] text-base font-bold text-white shadow-[0_12px_28px_oklch(0.49_0.27_288_/_28%)] hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-60 max-[700px]:ml-0 max-[700px]:w-full";
  const canSubmit = city.trim().length > 0 && travel !== "";
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

  return <form className="mt-[2.2rem] w-full max-w-[50rem] max-[700px]:mt-[1.7rem]" onSubmit={(event) => { event.preventDefault(); if (!canSubmit) return; onComplete({ city: city.trim(), travel, preferredCities: cities, languages, nativeLanguage: nativeLanguage.trim(), workingLanguage: workingLanguage.trim() }); }}>
    <div className="mt-[2.2rem]"><p className="m-0 text-[0.72rem] font-bold tracking-[0.16em] text-[oklch(0.51_0.08_279)]">LET THE RIGHT OPPORTUNITIES FIND YOU</p><h1 className="mt-[0.8rem] text-[clamp(2.8rem,6vw,3.8rem)] font-extrabold leading-[0.98] tracking-[-0.055em] text-[oklch(0.27_0.13_279)] max-[700px]:text-[2.8rem]">Help opportunities<br /><em className="not-italic text-[oklch(0.53_0.31_293)]">find you.</em></h1><p className="mt-4 max-w-[32rem] text-base font-medium leading-[1.55] text-[oklch(0.51_0.08_279)]">Share your location and language preferences to get better matches.</p></div>
     <section className="mt-7"><FieldHeading Icon={MapPin} title="Current City" /><label className={`${searchClasses} ml-[2.1rem] max-w-[39rem] max-[700px]:ml-0`}><Search size={20} className="flex-none text-[oklch(0.51_0.08_279)]" /><input className="w-full border-0 bg-transparent text-[0.82rem] text-[oklch(0.27_0.13_279)] outline-0 placeholder:text-[oklch(0.51_0.08_279)]" value={city} onChange={(event) => setCity(event.target.value)} placeholder="e.g. Mumbai, Maharashtra, India" aria-label="Current city" required />{city.length > 0 && <button type="button" onClick={() => setCity("")} className="cursor-pointer border-0 bg-transparent text-[1.2rem] text-[oklch(0.51_0.08_279)]" aria-label="Clear current city">&times;</button>}</label></section>
    <section className="mt-7"><FieldHeading Icon={Plane} title="Willing to Travel" description="Select how far you are open to travel for work." /><div className="grid grid-cols-3 gap-3 max-[700px]:grid-cols-1">{travelChoices.map(({ id, title, description, Icon }) => <button key={id} type="button" onClick={() => setTravel(id)} className={`relative grid min-h-[4.7rem] grid-cols-[2.2rem_1fr_auto] items-center gap-x-2 gap-y-[0.35rem] rounded-[0.7rem] border bg-[oklch(1_0_0_/_72%)] p-[0.65rem] text-left text-[oklch(0.27_0.13_279)] ${travel === id ? "border-[oklch(0.53_0.31_293)] shadow-[0_0_0_1px_oklch(0.53_0.31_293)]" : "border-[oklch(0.87_0.035_288)]"}`} aria-pressed={travel === id}><span className="row-span-2 grid size-8 place-items-center rounded-[0.55rem] bg-[oklch(0.95_0.03_295)] text-[oklch(0.53_0.31_293)]"><Icon /></span><strong className="text-[0.75rem]">{title}</strong><small className="text-[0.63rem] text-[oklch(0.51_0.08_279)]">{description}</small><i className={`absolute right-[0.6rem] top-[0.65rem] size-[0.7rem] rounded-full ${travel === id ? "bg-[oklch(0.53_0.31_293)] shadow-[inset_0_0_0_2px_white]" : "border border-[oklch(0.87_0.035_288)]"}`} /></button>)}</div></section>
    <section className="mt-7"><FieldHeading Icon={MapPin} title="Preferred Cities" optional description="Select cities where you'd like to work." /><ChipInput values={cities} setValues={setCities} placeholder="Search and add cities" /></section>
    <section className="mt-7"><FieldHeading Icon={Languages} title="Languages Spoken" description="Select all languages you speak." /><LanguageMultiSelect values={languages} setValues={updateLanguages} /></section>
     <section className="mt-7 grid grid-cols-2 gap-6 max-[700px]:grid-cols-1 max-[700px]:gap-5"><div><FieldHeading Icon={Sparkles} title="Native Language" optional description="Choose one of your spoken languages." /><div className="ml-[2.1rem] max-w-[39rem] max-[700px]:ml-0"><Select value={nativeLanguage} onValueChange={setNativeLanguage} disabled={languages.length === 0}><SelectTrigger aria-label="Native language" className="flex min-h-[2.8rem] w-full items-center justify-between gap-3 rounded-xl border border-[oklch(0.87_0.035_288)] bg-[oklch(1_0_0_/_82%)] px-4 text-[0.82rem] text-[oklch(0.27_0.13_279)] shadow-[0_2px_8px_oklch(0.27_0.13_279_/_5%)] data-[placeholder]:text-[oklch(0.51_0.08_279)] disabled:cursor-not-allowed disabled:opacity-60"><SelectValue placeholder={languages.length === 0 ? "Add languages above first" : "Select native language"} /></SelectTrigger><SelectContent>{languages.map((lang) => <SelectItem key={lang} value={lang}>{lang}</SelectItem>)}</SelectContent></Select></div></div><div><FieldHeading Icon={Languages} title="Working Language" optional description="Choose one of your spoken languages." /><div className="ml-[2.1rem] max-w-[39rem] max-[700px]:ml-0"><Select value={workingLanguage} onValueChange={setWorkingLanguage} disabled={languages.length === 0}><SelectTrigger aria-label="Working language" className="flex min-h-[2.8rem] w-full items-center justify-between gap-3 rounded-xl border border-[oklch(0.87_0.035_288)] bg-[oklch(1_0_0_/_82%)] px-4 text-[0.82rem] text-[oklch(0.27_0.13_279)] shadow-[0_2px_8px_oklch(0.27_0.13_279_/_5%)] data-[placeholder]:text-[oklch(0.51_0.08_279)] disabled:cursor-not-allowed disabled:opacity-60"><SelectValue placeholder={languages.length === 0 ? "Add languages above first" : "Select working language"} /></SelectTrigger><SelectContent>{languages.map((lang) => <SelectItem key={lang} value={lang}>{lang}</SelectItem>)}</SelectContent></Select></div></div></section>
    <section className="mt-7"><FieldHeading Icon={Sparkles} title="Language Proficiency" optional description="Set your proficiency level for selected languages." />{proficiencyLanguages.length === 0 ? <p className="rounded-[0.7rem] border border-dashed border-[oklch(0.87_0.035_288)] bg-[oklch(1_0_0_/_72%)] px-4 py-5 text-center text-[0.75rem] text-[oklch(0.51_0.08_279)]">No languages selected yet. Add languages above to see proficiency here.</p> : <div className="overflow-hidden rounded-[0.7rem] border border-[oklch(0.87_0.035_288)] bg-[oklch(1_0_0_/_72%)]">{proficiencyLanguages.map(({ name, label, level }, rowIndex) => <div key={name} className={`grid min-h-[2.7rem] grid-cols-[9rem_8rem_1fr] items-center gap-[0.7rem] px-4 text-[0.7rem] max-[700px]:grid-cols-[5rem_6rem_1fr] max-[700px]:gap-[0.4rem] max-[700px]:px-[0.65rem] ${rowIndex ? "border-t border-[oklch(0.87_0.035_288)]" : ""}`}><strong>{name}</strong><span className="text-right text-[oklch(0.51_0.08_279)]">{label}</span><i className="flex gap-[0.18rem]">{Array.from({ length: 9 }, (_, index) => <b key={index} className={`block h-[0.35rem] w-[0.65rem] rounded-full max-[700px]:w-2 ${index < level ? "bg-[oklch(0.53_0.31_293)]" : "bg-[oklch(0.87_0.035_288)]"}`} />)}</i></div>)}</div>}</section>
     {error && <p className="mt-5 rounded-xl bg-red-500/10 px-4 py-3 text-sm font-medium text-red-700" role="alert">{error}</p>}
     <button className={ctaClasses} type="submit" disabled={submitting || !canSubmit}><span>{submitting ? "Creating account..." : "Create account"}</span>{submitting ? <Loader2 size={20} className="animate-spin" /> : <ArrowRight size={20} />}</button>
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

export function TalentOnboarding() {
  const [step, setStep] = useState<Step>(1);
  const [account, setAccount] = useState<Account>({ fullName: "", professionalName: "", username: "", email: "", phone: "", password: "" });
  const [selected, setSelected] = useState<string[]>([]);
  const [signupEmail, setSignupEmail] = useState<string | null>(null);
  const [preferences, setPreferences] = useState<LocationPreferences | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [signupError, setSignupError] = useState<string | null>(null);

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
