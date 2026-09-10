"use client";

import { useState } from "react";
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
  Loader2,
} from "lucide-react";
import { RootInLogo } from "@/components/RootInLogo";
import { ScriptNote } from "./brand";
import { Field, inputClass } from "./field";

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

export function StepOrganization({
  values,
  onChange,
  onSubmit,
  submitting = false,
  error,
}: {
  values: OrgValues;
  onChange: (values: OrgValues) => void;
  onSubmit: () => void;
  submitting?: boolean;
  error?: string | null;
}) {
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [logoError, setLogoError] = useState<string | null>(null);

  const set = <K extends keyof OrgValues>(key: K, value: OrgValues[K]) =>
    onChange({ ...values, [key]: value });

  const handleLogoChange = (file: File | undefined) => {
    setLogoError(null);
    if (!file) return;
    if (!["image/jpeg", "image/png", "image/svg+xml"].includes(file.type)) {
      setLogoError("Use a PNG, JPG or SVG image.");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setLogoError("Logo must be under 2 MB.");
      return;
    }
    setLogoPreview(URL.createObjectURL(file));
  };

  return (
    <form
      className="space-y-6"
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit();
      }}
    >
      <div className="flex items-start justify-between gap-4">
        <RootInLogo className="w-28 pt-1" />
        <ScriptNote lines={["Great", "People", "Create", "Great Projects"]} />
      </div>

      <div className="grid gap-6 sm:grid-cols-[1.1fr_1fr] sm:items-center">
        <div>
          <h1 className="text-4xl font-extrabold leading-tight tracking-tight text-foreground">
            Tell us about <span className="block text-primary">your organization</span>
          </h1>
          <p className="mt-3 text-base text-muted-foreground">
            This helps talent learn more about you and your work.
          </p>
        </div>
        <Image
          src="/assets/recruiter-signup/hero-org.jpg"
          alt="Director chair on a lit film set"
          loading="lazy"
          width={900}
          height={1024}
          className="h-56 w-full rounded-[2rem] rounded-tl-[5rem] object-cover sm:h-64"
        />
      </div>

      <div className="flex items-center gap-5 rounded-3xl bg-accent/50 p-5">
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
        <Field icon={<Layers className="size-5" />} label="Industry" required>
          <select
            required
            className={inputClass}
            value={values.industry}
            onChange={(e) => set("industry", e.target.value)}
          >
            <option value="">Select your industry</option>
            {industries.map((option) => (
              <option key={option}>{option}</option>
            ))}
          </select>
        </Field>
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
          <Field icon={<BarChart3 className="size-5" />} label="Years in Business">
            <select
              className={inputClass}
              value={values.years}
              onChange={(e) => set("years", e.target.value)}
            >
              <option value="">Select</option>
              {yearOptions.map((option) => (
                <option key={option}>{option}</option>
              ))}
            </select>
          </Field>
          <Field icon={<Users className="size-5" />} label="Team Size">
            <select
              className={inputClass}
              value={values.teamSize}
              onChange={(e) => set("teamSize", e.target.value)}
            >
              <option value="">Select</option>
              {teamOptions.map((option) => (
                <option key={option}>{option}</option>
              ))}
            </select>
          </Field>
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
