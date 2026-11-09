"use client";

import {
  ArrowLeft,
  ArrowRight,
  Briefcase,
  Building2,
  Camera,
  Check,
  Ellipsis,
  Info,
  Lightbulb,
  TrendingUp,
  User,
  Wrench,
  Sparkles,
} from "lucide-react";
import type { StepProps } from "../types";
import { SignupHeader } from "../signup-header";
import { Stepper } from "../stepper";
import { ImagePlaceholder } from "../image-placeholder";

const PROVIDER_TYPES = [
  {
    id: "individual",
    title: "Individual / Freelancer",
    desc: "I provide services as an independent professional.",
    chips: ["Photographer", "Makeup Artist", "Editor", "Coach", "etc."],
    icon: User,
  },
  {
    id: "company",
    title: "Company / Business",
    desc: "I represent a registered company or business entity.",
    chips: ["Production", "Post-Production", "Equipment", "Event", "etc."],
    icon: Building2,
  },
  {
    id: "studio",
    title: "Studio / Venue",
    desc: "I own or manage a studio, shooting space, or venue.",
    chips: ["Photo Studio", "Recording Studio", "Audition Studio", "Event Venue"],
    icon: Camera,
  },
  {
    id: "agency",
    title: "Agency / Service Firm",
    desc: "I operate an agency offering specialized talent or services.",
    chips: ["Casting Agency", "PR Agency", "Marketing", "Management"],
    icon: Briefcase,
  },
  {
    id: "equipment",
    title: "Equipment Provider",
    desc: "I rent or supply camera, lighting, sound or grip equipment.",
    chips: ["Camera", "Lighting", "Sound", "Grip", "Drones"],
    icon: Wrench,
  },
  {
    id: "other",
    title: "Other Specialized Services",
    desc: "Transport, catering, legal, or other entertainment support.",
    chips: ["Transport", "Catering", "Costume", "Legal", "Travel"],
    icon: Ellipsis,
  },
];

export function ProviderTypeStep({ data, update, onBack, onNext }: StepProps) {
  return (
    <div className="flex flex-col px-4 pb-10 pt-4 sm:px-8 sm:pt-5">
      <SignupHeader onBack={onBack} />

      <div className="mt-5">
        <Stepper current={2} />
      </div>

      <div className="mt-6 flex items-start justify-between gap-3">
        <div className="flex-1">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-[#8738FF]/20 bg-[#F6F1FF] px-3 py-1 text-xs font-bold text-[#8738FF] dark:bg-[#8738FF]/15">
            Step 2 of 4
          </div>
          <h1 className="mt-2 text-2xl sm:text-[26px] font-extrabold leading-tight text-[#101333] dark:text-white">
            What Type of{" "}
            <span className="text-[#8738FF]">Service Provider</span> Are You?
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-[#7885A3] dark:text-white/70">
            Choose the option that best describes you. You can update this later in profile settings.
          </p>
        </div>

        <div className="hidden sm:block text-right">
          <p className="text-xs font-bold italic text-[#8738FF] max-w-[140px] leading-tight">
            Different Skills, Same Passion, Bigger Reach
          </p>
        </div>
      </div>

      {/* Visual pill header */}
      <div className="mt-4 flex items-center justify-between gap-3 rounded-2xl border border-[#8738FF]/20 bg-gradient-to-r from-[#F6F1FF] to-white p-3 dark:from-[#8738FF]/10 dark:to-transparent">
        <div className="flex items-center gap-2">
          <span className="grid size-8 place-items-center rounded-xl bg-[#8738FF] text-white">
            <Sparkles className="size-4" />
          </span>
          <span className="text-xs font-bold text-[#101333] dark:text-white">
            Your Skills Power the Entertainment Industry
          </span>
        </div>
        <ImagePlaceholder
          label="Creative Studio"
          className="hidden xs:flex h-9 w-28 text-[9px]"
        />
      </div>

      {/* Grid of provider types */}
      <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-3">
        {PROVIDER_TYPES.map((type) => {
          const selected = data.providerType === type.id;
          const Icon = type.icon;
          return (
            <button
              key={type.id}
              type="button"
              onClick={() => {
                update({
                  providerType: type.id,
                  // Auto-switch identityTab if selecting company / studio / agency
                  identityTab:
                    type.id === "company" || type.id === "agency" || type.id === "studio"
                      ? "company"
                      : "individual",
                });
              }}
              className={`relative flex flex-col justify-between rounded-2xl border p-4 text-left transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[#8738FF] ${
                selected
                  ? "border-[#8738FF] bg-[#F7F3FF] shadow-sm ring-1 ring-[#8738FF] dark:bg-[#8738FF]/10 dark:border-[#8738FF]"
                  : "border-[#E1E7F2] bg-white hover:border-[#CBD5E1] hover:bg-[#F7F8FC] dark:border-white/10 dark:bg-white/[0.03] dark:hover:bg-white/[0.06]"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <span
                  className={`flex size-11 items-center justify-center rounded-2xl transition-colors ${
                    selected
                      ? "bg-[#8738FF] text-white shadow-sm"
                      : "bg-[#F6F1FF] text-[#8738FF] dark:bg-white/10 dark:text-white"
                  }`}
                >
                  <Icon className="size-5.5 stroke-[2.2]" />
                </span>

                <span
                  className={`flex size-5.5 shrink-0 items-center justify-center rounded-full transition-colors ${
                    selected
                      ? "bg-[#8738FF] text-white"
                      : "border-2 border-[#CBD5E1] dark:border-white/20"
                  }`}
                >
                  {selected ? <Check className="size-3.5 stroke-[3]" /> : null}
                </span>
              </div>

              <div className="mt-3">
                <span className="block text-sm sm:text-base font-extrabold text-[#101333] dark:text-white">
                  {type.title}
                </span>
                <span className="mt-1 block text-xs leading-snug text-[#7885A3] dark:text-white/70">
                  {type.desc}
                </span>
              </div>

              <div className="mt-3 flex flex-wrap gap-1">
                {type.chips.map((chip) => (
                  <span
                    key={chip}
                    className="rounded-full bg-[#F7F8FC] px-2 py-0.5 text-[9px] font-semibold text-[#4E5971] dark:bg-white/10 dark:text-white/70"
                  >
                    {chip}
                  </span>
                ))}
              </div>
            </button>
          );
        })}
      </div>

      {/* Opportunity tip */}
      <div className="mt-5 flex items-start gap-3 rounded-2xl bg-[#F6F1FF] p-4 text-xs text-[#4E5971] dark:bg-[#8738FF]/10 dark:text-white/80">
        <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-[#8738FF]/15 text-[#8738FF]">
          <Lightbulb className="size-4.5" />
        </span>
        <div className="flex-1 min-w-0">
          <p className="font-bold text-[#101333] dark:text-white">
            More Visibility. Targeted Opportunities.
          </p>
          <p className="mt-0.5 leading-snug">
            The right category and business type helps clients search, discover, and hire you faster.
          </p>
        </div>
        <TrendingUp className="size-4 shrink-0 text-[#8738FF]" />
      </div>

      {/* Buttons */}
      <div className="mt-6 grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center justify-center gap-2 rounded-xl border border-[#DCD2F5] py-3.5 text-sm font-bold text-[#8738FF] transition-all hover:border-[#C9B8EF] hover:bg-[#F6F1FF] active:scale-[0.99] dark:hover:bg-[#8738FF]/15"
        >
          <ArrowLeft className="size-4" /> Back
        </button>
        <button
          type="button"
          onClick={onNext}
          className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#8738FF] via-[#7E33F6] to-[#6C2BE8] py-3.5 text-sm font-bold text-white shadow-[0_12px_28px_-10px_rgba(135,56,255,0.65)] transition-all hover:brightness-105 active:scale-[0.99]"
        >
          <span>Continue</span>
          <ArrowRight className="size-4" />
        </button>
      </div>

      <p className="mt-4 flex items-center justify-center gap-1.5 text-center text-[11px] text-[#8A96AC]">
        <Info className="size-3.5 shrink-0" />
        You can always update your provider category and details later from settings.
      </p>
    </div>
  );
}
