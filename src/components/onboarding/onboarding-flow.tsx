"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  BarChart3,
  Check,
  Search,
  Star,
  UsersRound,
} from "lucide-react";
import { useState } from "react";
import logoImage from "@/assets/rootin-logo-orange.png";

/**
 * Migrated from design-pixel-perfect/src/routes/index.tsx.
 *
 * Drop the three art images into `public/assets/onboarding/`:
 *   - rootin-talent-collage.png     (welcome screen collage)
 *   - rootin-recruiter-banner.png   (recruiter role card art)
 *   - rootin-talent-banner.png      (talent role card art)
 */
const collageImage = "/assets/onboarding/rootin-talent-collage.png";
const recruiterImage = "/assets/onboarding/rootin-recruiter-banner.png";
const talentImage = "/assets/onboarding/rootin-talent-banner.png";

const imageSizes = "(max-width: 520px) 100vw, 430px";

type Role = "recruiter" | "talent";

const benefits = [
  { label: "Verified\nTalent", icon: BadgeCheck, tone: "violet" },
  { label: "Real\nOpportunities", icon: UsersRound, tone: "pink" },
  { label: "Trusted\nNetwork", icon: Star, tone: "blue" },
  { label: "Growth\nTogether", icon: BarChart3, tone: "green" },
] as const;

function RootinLogo() {
  return (
    <Image
      src={logoImage}
      alt="RootIn"
      height={32}
      className="h-10 w-auto"
      priority
    />
  );
}

function WelcomeScreen({ onContinue }: { onContinue: () => void }) {
  return (
    <main className="screen welcome-screen">
      <header className="flex items-start justify-between px-7 pt-7">
        <RootinLogo />
        <button className="skip-button" type="button" onClick={onContinue}>
          Signup
        </button>
      </header>

      <section className="px-7 pt-8">
        <h1 className="max-w-[20rem] text-[2rem] font-extrabold leading-[0.98] text-foreground sm:text-[2.15rem]">
          Find the right <span className="text-primary">talent.</span>
          <br />Create <span className="text-primary">extraordinary</span> work.
        </h1>
        <p className="mt-4 max-w-[21rem] text-[0.78rem] font-medium leading-[1.45] text-muted-foreground">
          Discover verified actors, models, dancers, musicians, creators and entertainment professionals.
        </p>
      </section>

      <section className="mt-5 grid grid-cols-4 px-7" aria-label="Platform benefits">
        {benefits.map(({ label, icon: Icon, tone }) => (
          <div className="benefit-item" key={label}>
            <div className={`benefit-icon benefit-${tone}`}>
              <Icon size={19} strokeWidth={2.6} aria-hidden="true" />
            </div>
            <span>{label.split("\n").map((line) => <span key={line}>{line}<br /></span>)}</span>
          </div>
        ))}
      </section>

      <div className="welcome-art" onClick={onContinue} role="presentation">
        <Image
          src={collageImage}
          alt="Actors, dancers, musicians, and production professionals"
          fill
          sizes={imageSizes}
        />
        <div className="welcome-art-caption">One platform<br />many possibilities</div>
      </div>


    </main>
  );
}

const recruiterTags = ["Casting Directors", "Agencies", "Production Houses", "Brands & Advertisers", "Event Companies"];
const talentTags = ["Actors", "Models", "Dancers", "Musicians", "Creators", "Technicians", "Voice Artists", "and more..."];

function RoleCard({
  role,
  selected,
  onSelect,
}: {
  role: Role;
  selected: boolean;
  onSelect: () => void;
}) {
  const recruiter = role === "recruiter";
  const tags = recruiter ? recruiterTags : talentTags;
  return (
    <button
      type="button"
      className={`role-card ${selected ? "role-card-selected" : ""}`}
      onClick={onSelect}
      aria-pressed={selected}
    >
      <Image
        className="role-art"
        src={recruiter ? recruiterImage : talentImage}
        alt=""
        aria-hidden="true"
        fill
        sizes={imageSizes}
      />
      <span className="role-shade" />
      <span className="relative z-10 block max-w-[48%] text-left">
        <span className="role-eyebrow">For {recruiter ? "recruiters" : "talent"}</span>
        <span className="mt-2 block text-[1.16rem] font-extrabold leading-tight text-foreground">
          I’m a {recruiter ? "Recruiter" : "Talent Professional"}
        </span>
        <span className="mt-2 block text-[0.7rem] font-medium leading-[1.45] text-muted-foreground">
          {recruiter
            ? "Find exceptional talent, create opportunities and bring stories to life."
            : "Showcase your work, get discovered and unlock new opportunities."}
        </span>
      </span>
      {selected && <span className="select-check"><Check size={15} strokeWidth={3} /></span>}
      <span className="role-arrow"><ArrowRight size={17} /></span>
      <span className="role-symbol">{recruiter ? <Search size={17} /> : <UsersRound size={17} />}</span>
      <span className="tag-list">
        {tags.map((tag) => <span className="tag" key={tag}>{tag}</span>)}
      </span>
    </button>
  );
}

function RoleScreen({ onBack }: { onBack: () => void }) {
  const router = useRouter();
  const [selected, setSelected] = useState<Role>("recruiter");

  const handleContinue = () => {
    router.push(`/auth?mode=signup&role=${selected}`);
  };

  return (
    <main className="screen role-screen">
      <header className="role-header">
        <button className="icon-button" type="button" onClick={onBack} aria-label="Go back">
          <ArrowLeft size={24} />
        </button>
        <RootinLogo />
        <span className="h-10 w-10" />
      </header>



      <section className="px-6 pt-6">
        <h1 className="text-[1.65rem] font-extrabold leading-[1.08] text-foreground">
          How do you want to<br />be a part of <span className="text-primary">Rootin?</span>
        </h1>
        <p className="mt-2 text-[0.78rem] font-medium text-muted-foreground">
          Choose your role to get a personalized experience.
        </p>
      </section>

      <section className="mt-5 grid gap-4 px-5">
        <RoleCard role="recruiter" selected={selected === "recruiter"} onSelect={() => setSelected("recruiter")} />
        <RoleCard role="talent" selected={selected === "talent"} onSelect={() => setSelected("talent")} />
      </section>

      <div className="mt-auto px-5 pb-6 pt-5">
        <button className="continue-button" type="button" onClick={handleContinue}>
          <span>Continue as {selected === "recruiter" ? "Recruiter" : "Talent"}</span>
          <ArrowRight size={21} />
        </button>
        <p className="mt-6 text-center text-[0.72rem] font-medium text-muted-foreground">
          Already have an account?{" "}
          <Link className="font-bold text-primary" href="/auth/login">
            Sign In
          </Link>
        </p>
      </div>
    </main>
  );
}

export function OnboardingFlow() {
  const [step, setStep] = useState<"welcome" | "role">("welcome");
  return (
    <div className="app-shell onboarding-theme">
      {step === "welcome" ? (
        <WelcomeScreen onContinue={() => setStep("role")} />
      ) : (
        <RoleScreen onBack={() => setStep("welcome")} />
      )}
    </div>
  );
}
