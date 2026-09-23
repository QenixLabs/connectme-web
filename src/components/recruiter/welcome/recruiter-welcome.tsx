"use client";

import { useEffect, useState, type ImgHTMLAttributes } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Search,
  ArrowRight,
  Clock,
  Rocket,
  Users,
  ShieldCheck,
  Zap,
  Star,
  CircleCheck,
  Circle,
  MessageCircle,
  Sparkles,
  UserSearch,
  Clapperboard,
  type LucideIcon,
} from "lucide-react";
import { useAuthStore } from "@/providers/auth-store-provider";
import {
  hasSeenRecruiterWelcome,
  markRecruiterWelcomeSeen,
} from "@/lib/recruiter-welcome";

/**
 * One-time recruiter welcome screen, migrated from
 * screenshot-exact `src/routes/index.tsx`.
 *
 * Original artwork was never exported — using existing local images directly
 * (no missing-src 404s). To swap in final art later, drop files as
 *   - `public/assets/recruiter-welcome/rootin-hero.png`
 *   - `public/assets/recruiter-welcome/rootin-robot.png`
 * and point HERO_SRC / ROBOT_SRC back at them.
 */
const HERO_SRC = "/images/casting/rootin-creative-talent-showcase.png";
const HERO_FALLBACK = "/images/casting/casting-hero.png";
const ROBOT_SRC = "/images/casting/cute-neon-robot-pointing-up.png";
const ROBOT_FALLBACK = "/images/support-agent.png";

function ImgWithFallback({
  src,
  fallback,
  alt = "",
  ...rest
}: ImgHTMLAttributes<HTMLImageElement> & { src: string; fallback: string }) {
  const [current, setCurrent] = useState(src);
  return (
    <img
      {...rest}
      src={current}
      alt={alt}
      onError={() => {
        if (current !== fallback) setCurrent(fallback);
      }}
    />
  );
}

interface Step {
  n: number;
  title: string;
  copy: string;
  metaIcon: LucideIcon;
  meta: string;
  cta: string;
  href: string;
  tint: string;
  badge: string;
  icon: LucideIcon;
  button: string;
}

const steps: Step[] = [
  {
    n: 1,
    title: "Complete Profile",
    copy: "Tell us about your organisation, hiring needs and preferences.",
    metaIcon: Clock,
    meta: "Takes 3 minutes",
    cta: "Complete Profile",
    href: "/recruiter/profile",
    tint: "bg-tint-violet",
    icon: UserSearch,
    badge: "bg-gradient-primary",
    button: "bg-gradient-primary text-primary-foreground shadow-cta",
  },
  {
    n: 2,
    title: "Find Talent",
    copy: "Explore a diverse pool of verified talent across film, OTT, TV, music and more.",
    metaIcon: Search,
    meta: "Discover top talent",
    cta: "Search Talent",
    href: "/recruiter/find-talent",
    tint: "bg-tint-blue",
    icon: Search,
    badge: "bg-gradient-blue",
    button: "bg-gradient-blue text-secondary-foreground shadow-cta",
  },
  {
    n: 3,
    title: "Create Campaign",
    copy: "Post your casting brief and start receiving applications.",
    metaIcon: Rocket,
    meta: "Start hiring today",
    cta: "Create Campaign",
    href: "/recruiter/campaigns/new",
    tint: "bg-tint-pink",
    icon: Clapperboard,
    badge: "bg-gradient-pink",
    button: "bg-gradient-pink text-accent-foreground shadow-cta",
  },
];

const progressSteps = [
  { label: "1. Create Account", done: true },
  { label: "2. Complete Profile", done: false },
  { label: "3. Find Talent", done: false },
  { label: "4. Create Campaign", done: false },
];

const prompts = [
  "What kind of talent can I find on Rootin?",
  "How do I create a casting campaign?",
  "Show me top talent in Mumbai",
  "Help me complete my profile",
];

const trust: { icon: LucideIcon; title: string; copy: string; tint: string; color: string }[] = [
  { icon: Users, title: "Verified Talent", copy: "Real people. Real portfolios.", tint: "bg-tint-violet", color: "text-primary" },
  { icon: ShieldCheck, title: "Safe & Secure", copy: "Trusted and verified profiles.", tint: "bg-tint-pink", color: "text-accent" },
  { icon: Zap, title: "Faster Casting", copy: "AI-powered matching.", tint: "bg-tint-green", color: "text-success" },
  { icon: Star, title: "Better Stories", copy: "Connect. Collaborate. Create.", tint: "bg-tint-amber", color: "text-warning" },
];

function displayNameOf(user: { username?: string; email?: string } | null): string {
  const raw = user?.username || user?.email?.split("@")[0] || "there";
  const first = raw.split(" ")[0] || "there";
  return first.charAt(0).toUpperCase() + first.slice(1);
}

export function RecruiterWelcome({ skipGate = false }: { skipGate?: boolean } = {}) {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const hasHydrated = useAuthStore((state) => state.hasHydrated);

  // Show-once gate: visitors who already saw this screen bounce to dashboard.
  // skipGate is for dev/preview routes (e.g. /recruiter/new) — renders always,
  // never redirects, never marks seen.
  const alreadySeen = !skipGate && hasHydrated && hasSeenRecruiterWelcome(user);
  useEffect(() => {
    if (skipGate || !hasHydrated) return;
    if (alreadySeen) {
      router.replace("/recruiter/dashboard");
    } else {
      markRecruiterWelcomeSeen(user);
    }
  }, [skipGate, hasHydrated, alreadySeen, user, router]);

  if (!skipGate && (!hasHydrated || alreadySeen)) return null;

  const firstName = displayNameOf(user);

  return (
    <div className="recruiter-welcome-theme min-h-screen bg-gradient-stage">
      <div className="mx-auto w-full max-w-[480px] px-4 pb-6">
        {/* ── Top poster composition (welcome + hero) ── */}
        <div className="relative -mx-4 overflow-hidden px-4">
          {/* Atmospheric glows — decorative only, page stays predominantly white */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute left-1/2 top-[130px] h-[220px] w-[380px] -translate-x-1/2 rounded-full bg-violet-300/15 blur-[70px]"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute left-1/2 top-[300px] h-[180px] w-[340px] -translate-x-1/2 rounded-full bg-pink-200/20 blur-[60px]"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 bottom-0 h-[210px]"
            style={{
              background:
                "radial-gradient(ellipse 70% 80% at 50% 100%, rgba(139,92,246,0.10), rgba(236,72,153,0.07), transparent 70%)",
            }}
          />

          {/* Handwritten brand note — decorative */}
          <p
            aria-hidden="true"
            className="script absolute right-2 top-4 rotate-[-5deg] text-right text-[15px] italic leading-[1.05] text-[#5934E8] max-[370px]:hidden"
          >
            Right People.
            <br />
            Bigger Stories.
            <svg
              viewBox="0 0 80 10"
              className="ml-auto mt-1 block h-[8px] w-[68px]"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M3 7C20 3 45 2 77 6"
                stroke="#5934E8"
                strokeWidth="2.5"
                strokeLinecap="round"
                opacity="0.65"
              />
            </svg>
          </p>

          {/* Welcome */}
          <section className="relative pt-4">
            <div className="pr-[104px] max-[370px]:pr-0">
              <p className="text-[14px] font-semibold leading-tight">Welcome to Rootin,</p>
              <h1 className="mt-0.5 text-[29px] font-extrabold leading-none tracking-tight">{firstName}! 👋</h1>
              <p className="mt-2 max-w-[350px] text-[12px] leading-[1.28] text-muted-foreground">
                You&apos;re a few steps away from discovering amazing talent and creating great
                opportunities.
              </p>
            </div>
          </section>

          {/* Hero */}
          <section className="relative mt-3 text-center">
            <h2 className="text-[27px] font-black leading-[0.9] tracking-[-0.04em]">
              Your next great
              <br />
              <span className="text-gradient-primary">discovery</span> starts here.
            </h2>
            <p className="mt-2 text-[11.5px] font-medium leading-tight tracking-[-0.01em] text-muted-foreground">
              Find the right talent. Build your projects. Create unforgettable stories.
            </p>
            <ImgWithFallback
              src={HERO_SRC}
              fallback={HERO_FALLBACK}
              alt="Actors, models, singers, dancers and creators around a Rootin director's chair"
              className="-mx-4 -mt-2 block w-[calc(100%+2rem)] max-w-none object-contain object-bottom"
              style={{ height: 185 }}
              loading="eager"
            />
          </section>
        </div>

        {/* Steps */}
        <section className="-mt-2 space-y-2">
          {steps.map((s) => (
            <article
              key={s.n}
              className={`relative rounded-[20px] ${s.tint} px-3 py-2.5 shadow-card`}
            >
              <span
                className={`absolute right-3 top-3 grid size-5 place-items-center rounded-full ${s.badge} text-[10px] font-bold text-primary-foreground`}
              >
                {s.n}
              </span>
              <div className="flex gap-2.5">
                <span className="grid size-[52px] shrink-0 place-items-center rounded-[15px] bg-white/40">
                  <s.icon className="size-7 text-primary" />
                </span>
                <div className="min-w-0 flex-1 pr-7">
                  <h3 className="text-[15px] font-extrabold leading-tight">{s.title}</h3>
                  <p className="mt-0.5 text-[11px] leading-[1.2] text-muted-foreground">{s.copy}</p>
                  <div className="mt-1.5 flex flex-wrap items-center justify-between gap-2">
                    <p className="flex min-w-0 items-center gap-1 text-[10px] font-medium text-muted-foreground">
                      <s.metaIcon className="size-3 shrink-0" />
                      <span className="truncate">{s.meta}</span>
                    </p>
                    <Link
                      href={s.href}
                      className={`flex h-8 shrink-0 items-center justify-center gap-1.5 rounded-lg px-[15px] text-[10.5px] font-bold ${s.button}`}
                    >
                      {s.cta}
                      <ArrowRight className="size-3" />
                    </Link>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </section>

        {/* Progress */}
        <section className="mt-3 rounded-[20px] bg-card p-4 shadow-card">
          <div className="flex items-start justify-between gap-3">
            <h3 className="font-extrabold">Your Setup Progress</h3>
            <p className="max-w-[45%] text-right text-[11px] text-muted-foreground">
              Complete 3 steps to unlock the full power of Rootin.
            </p>
          </div>
          <div className="mt-3 flex items-center gap-3">
            <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-muted">
              <div className="h-full w-1/3 rounded-full bg-gradient-primary" />
            </div>
            <span className="text-sm font-bold">33%</span>
          </div>
          <ul className="mt-3 grid grid-cols-2 gap-y-2">
            {progressSteps.map((p) => (
              <li key={p.label} className="flex items-center gap-2 text-xs">
                {p.done ? (
                  <CircleCheck className="size-4 text-primary" />
                ) : (
                  <Circle className="size-4 text-muted-foreground" />
                )}
                <span className={p.done ? "font-semibold" : "text-muted-foreground"}>{p.label}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* Copilot */}
        <section className="mt-3 rounded-[20px] bg-card p-4 shadow-card">
          <div className="flex items-start gap-3">
            <ImgWithFallback
              src={ROBOT_SRC}
              fallback={ROBOT_FALLBACK}
              alt="Rootin AI casting assistant robot"
              className="w-24 shrink-0 rounded-2xl object-cover"
              loading="lazy"
            />
            <div className="min-w-0 flex-1">
              <h3 className="flex items-center gap-1.5 text-lg font-extrabold">
                <Sparkles className="size-5 text-primary" /> AI Casting Copilot
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Not sure where to start? I&apos;m here to help you set up, find the right talent and
                create your first campaign.
              </p>
            </div>
          </div>
          <Link
            href="/recruiter/find-talent"
            className="mt-3 flex h-12 w-full items-center justify-center gap-2 rounded-full border border-primary/40 bg-card px-6 text-base font-bold text-primary shadow-card transition-colors hover:bg-tint-violet"
          >
            <MessageCircle className="size-5" />
            Ask Me Anything
          </Link>
          <div className="mt-3 rounded-2xl bg-tint-violet p-3">
            <p className="text-sm font-extrabold">Try asking</p>
            <ul className="mt-1.5 space-y-1.5">
              {prompts.map((p) => (
                <li key={p} className="flex items-start gap-2 text-sm text-muted-foreground">
                  <ArrowRight className="mt-0.5 size-4 shrink-0 text-primary" />
                  {p}
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Trust */}
        <section className="mt-4 grid grid-cols-4 gap-2 pb-2 text-center">
          {trust.map((t) => (
            <div key={t.title}>
              <span className={`mx-auto grid size-12 place-items-center rounded-full ${t.tint}`}>
                <t.icon className={`size-6 ${t.color}`} />
              </span>
              <p className="mt-1.5 text-[11px] font-bold leading-tight">{t.title}</p>
              <p className="text-[10px] leading-tight text-muted-foreground">{t.copy}</p>
            </div>
          ))}
        </section>
      </div>
    </div>
  );
}
