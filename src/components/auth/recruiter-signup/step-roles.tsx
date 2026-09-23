"use client";

import Image from "next/image";
import Link from "next/link";
import {
  Megaphone,
  Users,
  Building2,
  Clapperboard,
  Lightbulb,
  Calendar,
  Camera,
  Check,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import { RootInLogo } from "@/components/RootInLogo";
import { ScriptNote } from "./brand";

const roles = [
  {
    id: "Casting Director",
    icon: Megaphone,
    title: "Casting Director",
    text: "Find and cast the perfect talent for projects.",
    image: "/assets/recruiter-signup/role-casting.jpg",
  },
  {
    id: "Talent Manager",
    icon: Users,
    title: "Talent Manager",
    text: "Manage and represent talent professionals.",
    image: "/assets/recruiter-signup/role-manager.jpg",
  },
  {
    id: "Talent Agency",
    icon: Building2,
    title: "Talent Agency",
    text: "Discover, manage and place talent across industries.",
    image: "/assets/recruiter-signup/role-agency.jpg",
  },
  {
    id: "Production House",
    icon: Clapperboard,
    title: "Production House",
    text: "Create powerful content with amazing talent.",
    image: "/assets/recruiter-signup/role-production.jpg",
  },
  {
    id: "Brand / Advertiser",
    icon: Megaphone,
    title: "Brand / Advertiser",
    text: "Collaborate with talent for campaigns and brand stories.",
    image: "/assets/recruiter-signup/role-brand.jpg",
  },
  {
    id: "Creative Director",
    icon: Lightbulb,
    title: "Creative Director",
    text: "Bring creative visions to life with the right talent.",
    image: "/assets/recruiter-signup/role-creative.jpg",
  },
  {
    id: "Event Company",
    icon: Calendar,
    title: "Event Company",
    text: "Hire talent for events, shows and live experiences.",
    image: "/assets/recruiter-signup/role-event.jpg",
  },
  {
    id: "Photographer",
    icon: Camera,
    title: "Photographer",
    text: "Work with talent for shoots, portfolios and campaigns.",
    image: "/assets/recruiter-signup/role-photo.jpg",
  },
];

export function StepRoles({
  selected,
  onToggle,
  onContinue,
}: {
  selected: string[];
  onToggle: (id: string) => void;
  onContinue: () => void;
}) {
  return (
    <div className="space-y-6">
      <div
        className="relative -mx-4 w-[calc(100%+2rem)] bg-cover bg-center bg-no-repeat px-4 py-4 sm:-mx-7 sm:w-[calc(100%+3.5rem)] sm:px-7"
        style={{
          backgroundImage: "url('/images/recruiter-hero.png')",
        }}
      >
      <div className="flex items-start justify-between gap-4">
        <Link href="/" aria-label="Go to RootIn homepage">
          <RootInLogo className="w-28 pt-1 pb-4" />
        </Link>
        <ScriptNote lines={["Different", "People", "Bigger", "Stories"]} />
      </div>

      <div>
        <h1 className="text-4xl font-extrabold tracking-tight text-foreground">
          Tell us <span className="text-primary">what you do</span>
        </h1>
        <p className="mt-2 text-base text-muted-foreground">
          Select one or more roles that best describe you. This helps us personalize your
          experience.
        </p>
      </div>
        </div>

      <div className="grid grid-cols-2 gap-2.5 sm:gap-4">
        {roles.map(({ id, icon: Icon, title, text, image }) => {
          const active = selected.includes(id);
          return (
            <button
              key={id}
              type="button"
              aria-pressed={active}
              onClick={() => onToggle(id)}
              className={`relative grid min-h-[10.5rem] grid-cols-[minmax(0,1fr)_5.5rem] gap-2 overflow-hidden rounded-2xl border p-2.5 text-left shadow-[var(--shadow-onboarding-card)] transition-colors sm:min-h-44 sm:grid-cols-[minmax(0,1fr)_6rem] sm:p-3 ${
                active ? "border-primary bg-accent/50" : "border-border bg-card hover:bg-accent/30"
              }`}
            >
              <span className="flex-1">
                <Icon className="size-6 text-primary sm:size-7" />
                <span className="mt-2 block text-[0.72rem] font-bold leading-tight text-foreground sm:text-sm">{title}</span>
                <span className="mt-1 block text-[0.6rem] leading-[1.3] text-muted-foreground sm:text-xs">{text}</span>
              </span>
              <span className="relative my-0.5 mr-0.5 overflow-hidden rounded-xl">
                <Image
                  src={image}
                  alt=""
                  loading="lazy"
                  width={512}
                  height={640}
                  className="h-full min-h-[9.5rem] w-full object-cover sm:min-h-[10.5rem]"
                />
                <span
                  className={`absolute -right-1 -top-1 flex size-7 items-center justify-center rounded-lg border ${
                    active
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-card"
                  }`}
                >
                  {active ? <Check className="size-4" /> : null}
                </span>
              </span>
            </button>
          );
        })}
      </div>

      <div className="flex items-start gap-3 rounded-2xl bg-accent/60 p-4">
        <Sparkles className="size-5 shrink-0 text-primary" />
        <p className="text-sm">
          <span className="block font-semibold text-primary">You can select multiple roles</span>
          <span className="text-muted-foreground">
            Don&apos;t worry, you can always update this later in settings.
          </span>
        </p>
      </div>

      <button
        type="button"
        disabled={selected.length === 0}
        onClick={onContinue}
        className="gradient-cta shadow-button flex w-full items-center justify-center gap-2 rounded-2xl px-6 py-4 text-lg font-semibold text-primary-foreground transition-opacity disabled:opacity-50"
      >
        Continue
        <ChevronRight className="size-5" />
      </button>
    </div>
  );
}
