"use client";
import { RootInLogo } from "@/components/RootInLogo";
import Link from "next/link";

import { useState, type ReactNode } from "react";
import Image from "next/image";
import {
  Building2,
  Layers,
  MapPin,
  Globe,
  BarChart3,
  Users,
  Camera,
  Check,
  ChevronDown,
  Loader2,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScriptNote } from "./brand";
import { Field, inputClass } from "./field";
import { cn } from "@/lib/utils";

export type OrgValues = {
  name: string;
  industry: string;
  city: string;
  website: string;
  years: string;
  teamSize: string;
  independent: boolean;
};

const industries = ["Film", "Television", "OTT / Digital", "Advertising", "Events", "Music"];
const yearOptions = ["Less than 1", "1 - 3", "3 - 5", "5 - 10", "10+"];
const teamOptions = ["Just me", "2 - 10", "11 - 50", "51 - 200", "200+"];

function OrgDropdown({
  icon,
  label,
  required,
  value,
  placeholder,
  options,
  onSelect,
}: {
  icon: ReactNode;
  label: string;
  required?: boolean;
  value: string;
  placeholder: string;
  options: string[];
  onSelect: (value: string) => void;
}) {
  return (
    <div className="flex min-h-[52px] items-center gap-3 rounded-[13px] border border-border bg-card px-3 py-2 shadow-[0_2px_8px_rgba(55,33,110,0.04)] transition-colors focus-within:border-primary">
      <span className="shrink-0 text-muted-foreground [&>svg]:size-[18px]">{icon}</span>
      <span className="min-w-0 flex-1">
        <span className="block text-[10px] leading-3 text-muted-foreground">
          {label}
          {required ? <span className="ml-0.5 text-destructive">*</span> : null}
        </span>
        <DropdownMenu>
          <DropdownMenuTrigger
            type="button"
            aria-label={label}
            className={cn(
              inputClass,
              "flex w-full cursor-pointer items-center justify-between gap-2 text-left",
            )}
          >
            <span
              className={cn(
                "truncate",
                !value && "font-normal text-muted-foreground/70",
              )}
            >
              {value || placeholder}
            </span>
            <ChevronDown className="size-4 shrink-0 text-muted-foreground" />
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="start"
            className="max-h-72 w-[var(--radix-dropdown-menu-trigger-width)] overflow-auto"
          >
            {options.map((option) => (
              <DropdownMenuItem
                key={option}
                onSelect={() => onSelect(option)}
                className="flex items-center justify-between gap-2"
              >
                <span className="truncate">{option}</span>
                {value === option ? <Check className="size-4 shrink-0" /> : null}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </span>
    </div>
  );
}

export function StepOrganization({
  values,
  onChange,
  onLogoChange,
  onSubmit,
  submitting = false,
  error,
}: {
  values: OrgValues;
  onChange: (values: OrgValues) => void;
  onLogoChange?: (file: File | null) => void;
  onSubmit: () => void;
  submitting?: boolean;
  error?: string | null;
}) {
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [logoError, setLogoError] = useState<string | null>(null);
  const [industryError, setIndustryError] = useState<string | null>(null);

  const set = <K extends keyof OrgValues>(key: K, value: OrgValues[K]) => {
    onChange({ ...values, [key]: value });
    if (key === "industry") setIndustryError(null);
  };

  const handleLogoChange = (file: File | undefined) => {
    setLogoError(null);
    if (!file) {
      onLogoChange?.(null);
      return;
    }
    if (!["image/jpeg", "image/png", "image/svg+xml"].includes(file.type)) {
      setLogoError("Use a PNG, JPG or SVG image.");
      onLogoChange?.(null);
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setLogoError("Logo must be under 2 MB.");
      onLogoChange?.(null);
      return;
    }
    setLogoPreview(URL.createObjectURL(file));
    onLogoChange?.(file);
  };

  return (
    <form
      className="space-y-6"
      onSubmit={(event) => {
        event.preventDefault();
        if (!values.industry) {
          setIndustryError("Please select your industry");
          return;
        }
        onSubmit();
      }}
    >
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
         <h1 className=" mt-2 text-[clamp(26px,5vw,35px)] font-bold leading-[1.05] text-[#080B2B]">
           Tell us about
           <br />
           <span className="text-[#5B32FF]">your organization</span>
         </h1>

         <p className="mt-3 max-w-[200px] text-[clamp(10px,2.5vw,15px)] leading-[1.4] text-[#555C7A]">
           This help talents learn more about you and your work
         </p>
         
       </div>
     </section>

      <div className="mt-5 flex items-center gap-4 rounded-3xl bg-accent/50 p-4">
        <label className="flex size-28 shrink-0 cursor-pointer flex-col items-center justify-center gap-2 overflow-hidden rounded-2xl border-2 border-dashed border-primary/60 text-primary transition-colors hover:bg-accent/60">
          {logoPreview ? (
            <Image
              src={logoPreview}
              alt="Organization logo preview"
              width={112}
              height={112}
              className="size-full object-cover"
            />
          ) : (
            <>
              <Camera className="size-7" />
              <span className="text-xs font-medium">Upload Logo</span>
            </>
          )}
          <input
            type="file"
            accept="image/png,image/jpeg,image/svg+xml"
            className="sr-only"
            onChange={(e) => handleLogoChange(e.target.files?.[0])}
          />
        </label>
        <div>
          <p className="font-bold text-foreground">Add your organization logo</p>
          <p className="text-sm text-muted-foreground">
            Recommended size 512 × 512 px (PNG, JPG or SVG)
          </p>
          {logoError ? <p className="mt-1 text-sm text-destructive">{logoError}</p> : null}
        </div>
      </div>

      <div className="space-y-3">
        <Field icon={<Building2 className="size-5" />} label="Organization Name" required>
          <input
            required={!values.independent}
            disabled={values.independent}
            className={inputClass}
            placeholder="e.g. R1 Casting Agency"
            value={values.name}
            onChange={(e) => set("name", e.target.value)}
          />
        </Field>
        <OrgDropdown
          icon={<Layers className="size-5" />}
          label="Industry"
          required
          value={values.industry}
          placeholder="Select your industry"
          options={industries}
          onSelect={(value) => set("industry", value)}
        />
        {industryError ? (
          <p className="-mt-2 px-1 text-[11px] text-destructive">{industryError}</p>
        ) : null}
        <Field icon={<MapPin className="size-5" />} label="City / Location" required>
          <input
            required
            className={inputClass}
            placeholder="e.g. Mumbai, India"
            value={values.city}
            onChange={(e) => set("city", e.target.value)}
          />
        </Field>
        <Field icon={<Globe className="size-5" />} label="Website" hint="(Optional)">
          <input
            className={inputClass}
            placeholder="https://www.yourwebsite.com"
            value={values.website}
            onChange={(e) => set("website", e.target.value)}
          />
        </Field>
        <div className="grid gap-3 sm:grid-cols-2">
          <OrgDropdown
            icon={<BarChart3 className="size-5" />}
            label="Years in Business"
            value={values.years}
            placeholder="Select"
            options={yearOptions}
            onSelect={(value) => set("years", value)}
          />
          <OrgDropdown
            icon={<Users className="size-5" />}
            label="Team Size"
            value={values.teamSize}
            placeholder="Select"
            options={teamOptions}
            onSelect={(value) => set("teamSize", value)}
          />
        </div>
      </div>

      <button
        type="button"
        onClick={() => set("independent", !values.independent)}
        aria-pressed={values.independent}
        className="flex w-full items-center gap-4 rounded-2xl bg-accent/60 p-4 text-left"
      >
        <span
          className={`flex h-7 w-12 shrink-0 items-center rounded-full p-1 transition-colors ${
            values.independent ? "bg-primary" : "bg-muted-foreground/40"
          }`}
        >
          <span
            className={`size-5 rounded-full bg-card transition-transform ${
              values.independent ? "translate-x-5" : ""
            }`}
          />
        </span>
        <span>
          <span className="block font-bold text-foreground">I work independently</span>
          <span className="block text-sm text-muted-foreground">
            I don&apos;t represent an organization.
          </span>
        </span>
      </button>

      {error ? (
        <p className="rounded-2xl bg-destructive/10 px-4 py-3 text-sm font-medium text-destructive">
          {error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={submitting}
        className="gradient-cta shadow-button flex w-full items-center justify-center gap-2 rounded-2xl px-6 py-4 text-lg font-semibold text-primary-foreground transition-opacity disabled:opacity-60"
      >
        {submitting ? (
          <>
            <Loader2 className="size-5 animate-spin" />
            Creating your account...
          </>
        ) : (
          <>
            Finish Setup
            <Check className="size-5" />
          </>
        )}
      </button>
    </form>
  );
}
