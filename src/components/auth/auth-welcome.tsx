import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  BriefcaseBusiness,
  Check,
  Clapperboard,
  MessageCircle,
  Search,
  Sparkles,
  Users,
} from "lucide-react";
import { RootInLogo } from "@/components/RootInLogo";

const disciplines = ["Film", "OTT", "TV", "Fashion", "Music", "Digital"];

const recruiterBenefits = [
  { icon: Search, label: "Search verified talent" },
  { icon: Users, label: "Shortlist with confidence" },
  { icon: MessageCircle, label: "Keep every conversation moving" },
];

const avatars = [
  { src: "/images/talent-avatar.jpg", alt: "Verified talent profile" },
  { src: "/images/portfolio/p5.jpg", alt: "Creative professional profile" },
  { src: "/avatars/avatar-2.jpg", alt: "RootIn community member" },
];

export function AuthWelcome() {
  return (
    <main className="relative min-h-dvh overflow-hidden bg-background text-foreground">
      <div className="pointer-events-none absolute -left-40 top-24 size-[26rem] rounded-full bg-primary/10 blur-3xl" />
      <div className="pointer-events-none absolute -right-40 bottom-0 size-[28rem] rounded-full bg-cyan/10 blur-3xl" />

      <div className="relative mx-auto flex min-h-dvh w-full max-w-[1380px] flex-col px-5 py-5 sm:px-8 sm:py-7 lg:px-12">
        <header className="flex items-center justify-between">
          <Link href="/" aria-label="RootIn home" className="w-28 sm:w-32">
            <RootInLogo />
          </Link>

          <div className="flex items-center gap-3 text-sm">
            <span className="hidden text-muted-foreground sm:inline">Already part of the network?</span>
            <Link
              href="/auth/login"
              className="rounded-full border border-border bg-card/70 px-4 py-2 font-medium text-foreground transition-colors hover:border-primary/50 hover:text-primary"
            >
              Sign in
            </Link>
          </div>
        </header>

        <section className="grid flex-1 items-center gap-12 py-12 lg:grid-cols-[minmax(0,0.92fr)_minmax(480px,1.08fr)] lg:gap-16 lg:py-16">
          <div className="max-w-2xl">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">
              <Sparkles className="size-3.5" />
              The creative talent network
            </div>

            <h1 className="max-w-xl text-4xl font-bold leading-[1.08] tracking-[-0.04em] sm:text-5xl lg:text-[4.2rem]">
              Find the people who make your{" "}
              <span className="bg-gradient-to-r from-blue via-primary to-cyan bg-clip-text text-transparent">
                vision real.
              </span>
            </h1>

            <p className="mt-6 max-w-lg text-base leading-7 text-muted-foreground sm:text-lg">
              RootIn brings recruiters, production teams and verified creative professionals
              together to turn a great brief into extraordinary work.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/auth/recruiter/signup"
                className="group inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#2563EB] to-[#4C8DF0] px-5 py-3.5 text-sm font-semibold text-white shadow-button transition-all hover:-translate-y-0.5 hover:shadow-button-hover"
              >
                Start hiring on RootIn
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
              <Link
                href="/auth/talent/signup"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-card/60 px-5 py-3.5 text-sm font-semibold text-foreground transition-colors hover:border-primary/40 hover:bg-primary/5"
              >
                Join as talent
              </Link>
            </div>

            <div className="mt-9 flex items-center gap-3">
              <div className="flex -space-x-2">
                {avatars.map((avatar) => (
                  <Image
                    key={avatar.src}
                    src={avatar.src}
                    alt={avatar.alt}
                    width={34}
                    height={34}
                    className="size-8 rounded-full border-2 border-background object-cover"
                  />
                ))}
              </div>
              <p className="text-xs leading-5 text-muted-foreground">
                <span className="font-semibold text-foreground">Verified people.</span> Real
                opportunities. One trusted network.
              </p>
            </div>

            <div className="mt-12 flex flex-wrap gap-2">
              {disciplines.map((discipline) => (
                <span
                  key={discipline}
                  className="rounded-full border border-border/80 bg-card/50 px-3 py-1.5 text-xs font-medium text-muted-foreground"
                >
                  {discipline}
                </span>
              ))}
              <span className="rounded-full border border-primary/20 bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary">
                And more
              </span>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-[620px] lg:ml-auto">
            <div className="absolute -inset-5 rounded-[2rem] bg-primary/10 blur-2xl" />
            <div className="relative min-h-[490px] overflow-hidden rounded-[2rem] border border-white/10 bg-[#07111B] shadow-card-lift sm:min-h-[570px]">
              <Image
                src="/hero-bg.png"
                alt="A cinematic RootIn production set"
                fill
                priority
                sizes="(min-width: 1024px) 50vw, 100vw"
                className="object-cover object-center opacity-80"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#00060C] via-[#00060C]/20 to-[#00060C]/10" />
              <div className="absolute inset-x-6 top-6 flex items-center justify-between rounded-xl border border-white/10 bg-[#07111B]/70 px-4 py-3 backdrop-blur-md">
                <div className="flex items-center gap-2.5">
                  <span className="grid size-8 place-items-center rounded-lg bg-primary/20 text-blue-300">
                    <BriefcaseBusiness className="size-4" />
                  </span>
                  <div>
                    <p className="text-xs font-semibold text-white">Recruiter workspace</p>
                    <p className="text-[10px] text-white/50">Everything for your next brief</p>
                  </div>
                </div>
                <span className="flex items-center gap-1.5 text-[10px] font-medium text-emerald-300">
                  <span className="size-1.5 rounded-full bg-emerald-400" /> Live
                </span>
              </div>

              <div className="absolute bottom-7 left-6 right-6">
                <p className="font-display text-sm font-medium uppercase tracking-[0.28em] text-white/60">
                  Talent moves the world
                </p>
                <h2 className="mt-2 max-w-sm text-3xl font-bold leading-tight tracking-tight text-white sm:text-4xl">
                  Your next shortlist is closer than you think.
                </h2>
                <div className="mt-6 grid gap-2.5 sm:grid-cols-3">
                  {recruiterBenefits.map(({ icon: Icon, label }) => (
                    <div
                      key={label}
                      className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.07] px-3 py-2.5 backdrop-blur-md"
                    >
                      <Icon className="size-3.5 shrink-0 text-blue-300" />
                      <span className="text-[10px] leading-4 text-white/75">{label}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="absolute -right-2 top-32 hidden w-44 rounded-xl border border-border/70 bg-card/95 p-3 shadow-card sm:block">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-semibold text-foreground">Shortlist ready</span>
                  <BadgeCheck className="size-4 text-primary" />
                </div>
                <div className="mt-3 flex items-center gap-2">
                  <div className="flex -space-x-2">
                    {avatars.slice(0, 2).map((avatar) => (
                      <Image
                        key={`shortlist-${avatar.src}`}
                        src={avatar.src}
                        alt=""
                        width={24}
                        height={24}
                        className="size-6 rounded-full border-2 border-card object-cover"
                      />
                    ))}
                  </div>
                  <span className="text-[10px] text-muted-foreground">24 matches</span>
                </div>
              </div>

              <div className="absolute -bottom-3 -left-3 hidden w-48 rounded-xl border border-border/70 bg-card/95 p-3 shadow-card sm:block">
                <div className="flex items-center gap-2 text-[10px] font-semibold text-foreground">
                  <Clapperboard className="size-4 text-orange" />
                  Open campaign
                </div>
                <p className="mt-2 text-xs font-semibold text-foreground">Lead role · Mumbai</p>
                <div className="mt-2 flex items-center gap-1.5 text-[10px] text-emerald-400">
                  <Check className="size-3" /> Brief published today
                </div>
              </div>
            </div>
          </div>
        </section>

        <footer className="flex flex-col gap-3 border-t border-border/60 pt-5 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <span>More people. More possibilities.</span>
          <span className="flex items-center gap-1.5">
            <BadgeCheck className="size-3.5 text-primary" /> Built for the creative industry
          </span>
        </footer>
      </div>
    </main>
  );
}
