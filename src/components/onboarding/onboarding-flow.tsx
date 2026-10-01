"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Check,
  Search,
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
const recruiterImage = "/assets/onboarding/rootin-recruiter-banner.png";
const talentImage = "/assets/onboarding/rootin-talent-banner.png";

const imageSizes = "(max-width: 520px) 100vw, 430px";

export type OnboardingRole = "recruiter" | "talent";

type Role = OnboardingRole;

function RootinLogo() {
  return (
    <Link href="/" aria-label="RootIn home">
      <Image
        src={logoImage}
        alt="RootIn"
        height={32}
        className="h-10 w-auto"
        priority
      />
    </Link>
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
      <span className="role-symbol">{recruiter ? <Search size={17} /> : <UsersRound size={17} />}</span>
      <span className="tag-list">
        {tags.map((tag) => <span className="tag" key={tag}>{tag}</span>)}
      </span>
    </button>
  );
}

export function RoleScreen({
  initialRole = "recruiter",
  onContinue,
}: {
  initialRole?: OnboardingRole;
  onContinue?: (role: OnboardingRole) => void;
} = {}) {
  const router = useRouter();
  const [selected, setSelected] = useState<Role>(initialRole);

  const handleContinue = () => {
    if (onContinue) {
      onContinue(selected);
      return;
    }
    router.push(selected === "talent" ? "/auth/talent/signup" : "/auth/recruiter/signup");
  };

  return (
    <main className="screen role-screen">
      <header className="role-header flex items-center">
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
  return (
    <div className="app-shell onboarding-theme">
      <RoleScreen />
    </div>
  );
}
