"use client";

import Image from "next/image";
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
    id: "casting-director",
    icon: Megaphone,
    title: "Casting Director",
    text: "Find and cast the perfect talent for projects.",
    image: "/assets/recruiter-signup/role-casting.jpg",
  },
  {
    id: "talent-manager",
    icon: Users,
    title: "Talent Manager",
    text: "Manage and represent talent professionals.",
    image: "/assets/recruiter-signup/role-manager.jpg",
  },
  {
    id: "talent-agency",
    icon: Building2,
    title: "Talent Agency",
    text: "Discover, manage and place talent across industries.",
    image: "/assets/recruiter-signup/role-agency.jpg",
  },
  {
    id: "production-house",
    icon: Clapperboard,
    title: "Production House",
    text: "Create powerful content with amazing talent.",
    image: "/assets/recruiter-signup/role-production.jpg",
  },
  {
    id: "brand",
    icon: Megaphone,
    title: "Brand / Advertiser",
    text: "Collaborate with talent for campaigns and brand stories.",
    image: "/assets/recruiter-signup/role-brand.jpg",
  },
  {
    id: "creative-director",
    icon: Lightbulb,
    title: "Creative Director",
    text: "Bring creative visions to life with the right talent.",
    image: "/assets/recruiter-signup/role-creative.jpg",
  },
  {
    id: "event-company",
    icon: Calendar,
    title: "Event Company",
    text: "Hire talent for events, shows and live experiences.",
    image: "/assets/recruiter-signup/role-event.jpg",
  },
  {
    id: "photographer",
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
      <div className="flex items-start justify-between gap-4">
        <RootInLogo className="w-28 pt-1" />
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

      <div className="grid gap-4 sm:grid-cols-2">
        {roles.map(({ id, icon: Icon, title, text, image }) => {
          const active = selected.includes(id);
          return (
            <button
              key={id}
              type="button"
              aria-pressed={active}
              onClick={() => onToggle(id)}
              className={`relative flex gap-3 rounded-3xl border p-4 text-left shadow-[var(--shadow-card)] transition-colors ${
                active ? "border-primary bg-accent/50" : "border-border bg-card hover:bg-accent/30"
              }`}
            >
              <span className="flex-1">
                <Icon className="size-7 text-primary" />
                <span className="mt-3 block font-bold text-foreground">{title}</span>
                <span className="mt-1 block text-sm text-muted-foreground">{text}</span>
              </span>
              <span className="relative">
                <Image
                  src={image}
                  alt=""
                  loading="lazy"
                  width={512}
                  height={640}
                  className="h-32 w-24 rounded-2xl object-cover"
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
