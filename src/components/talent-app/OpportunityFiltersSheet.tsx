"use client";

import { useMemo, useState } from "react";
import { useSearchParams, usePathname, useRouter } from "next/navigation";
import { X, MapPin, Crosshair } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  open: boolean;
  onClose: () => void;
}

const ROLE_OPTIONS = [
  "All",
  "Casting",
  "Actor",
  "Model",
  "Dancer",
  "Influencer",
  "Musician",
];

const GENDER_OPTIONS = ["Male", "Female", "Non-binary", "Any"];

const LANGUAGE_OPTIONS = [
  "Hindi",
  "English",
  "Marathi",
  "Tamil",
  "Telugu",
  "Kannada",
  "Malayalam",
  "Bengali",
  "Punjabi",
  "Gujarati",
];

const SKILL_OPTIONS = [
  "Acting",
  "Modeling",
  "Dancing",
  "Singing",
  "Voice Over",
  "Influencing",
  "Photography",
  "Makeup",
  "Direction",
  "Writing",
];

function Chip({
  label,
  active,
  onClick,
}: {
  label: string;
  active?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-full border px-3 py-2 text-xs font-semibold transition-colors",
        active
          ? "border-brand bg-brand-soft text-brand"
          : "border-border bg-card text-foreground hover:bg-muted",
      )}
    >
      {label}
    </button>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="px-5 py-4">
      <h3 className="mb-3 text-sm font-extrabold tracking-tight text-foreground">
        {title}
      </h3>
      {children}
    </div>
  );
}

function ToggleGroup<T extends string>({
  options,
  value,
  onChange,
  multi = false,
}: {
  options: T[];
  value: T | T[] | null;
  onChange: (val: T) => void;
  multi?: boolean;
}) {
  const isActive = (opt: T) =>
    multi ? (value as T[] | null)?.includes(opt) : value === opt;

  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => (
        <Chip
          key={opt}
          label={opt}
          active={isActive(opt)}
          onClick={() => onChange(opt)}
        />
      ))}
    </div>
  );
}

export function OpportunityFiltersSheet({ open, onClose }: Props) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();

  const initial = useMemo(
    () => ({
      tab: searchParams?.get("tab") ?? "All",
      location: searchParams?.get("location_city") ?? "",
      gender: searchParams?.get("gender") ?? "",
      languages:
        searchParams?.get("languages")?.split(",").filter(Boolean) ?? [],
      skills: searchParams?.get("skills")?.split(",").filter(Boolean) ?? [],
    }),
    [searchParams],
  );

  const [tab, setTab] = useState(() => initial.tab);
  const [location, setLocation] = useState(() => initial.location);
  const [gender, setGender] = useState(() => initial.gender);
  const [languages, setLanguages] = useState<string[]>(() => initial.languages);
  const [skills, setSkills] = useState<string[]>(() => initial.skills);

  if (!open) return null;

  const toggle = (list: string[], val: string) =>
    list.includes(val) ? list.filter((v) => v !== val) : [...list, val];

  const apply = () => {
    const params = new URLSearchParams(searchParams?.toString() ?? "");
    params.set("tab", tab || "All");

    const city = location.trim();
    if (city) params.set("location_city", city);
    else params.delete("location_city");

    if (gender && gender !== "Any") params.set("gender", gender.toLowerCase());
    else params.delete("gender");

    if (languages.length) params.set("languages", languages.join(","));
    else params.delete("languages");

    if (skills.length) params.set("skills", skills.join(","));
    else params.delete("skills");

    router.push(`${pathname}?${params.toString()}`);
    onClose();
  };

  const clearAll = () => {
    const params = new URLSearchParams();
    params.set("tab", "All");
    router.push(`${pathname}?${params.toString()}`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-background">
      <div className="flex items-center justify-between border-b border-border px-5 py-4">
        <span className="w-6" />
        <h2 className="text-base font-extrabold tracking-tight">Filters</h2>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close filters"
          className="grid size-8 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-muted"
        >
          <X className="size-5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto pb-4">
        <Section title="Role / Opportunity Type">
          <ToggleGroup
            options={ROLE_OPTIONS}
            value={tab}
            onChange={(val) => setTab(val)}
          />
        </Section>

        <Section title="Location">
          <div className="flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-3">
            <MapPin className="size-4 shrink-0 text-muted-foreground" />
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="City, e.g. Mumbai"
              className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
            <button
              type="button"
              aria-label="Use my location"
              className="grid size-8 place-items-center rounded-lg text-brand"
            >
              <Crosshair className="size-4" />
            </button>
          </div>
        </Section>

        <Section title="Gender">
          <ToggleGroup
            options={GENDER_OPTIONS}
            value={gender || "Any"}
            onChange={(val) => setGender(val === "Any" ? "" : val)}
          />
        </Section>

        <Section title="Languages">
          <ToggleGroup
            options={LANGUAGE_OPTIONS}
            value={languages}
            onChange={(val) => setLanguages((prev) => toggle(prev, val))}
            multi
          />
        </Section>

        <Section title="Skills">
          <ToggleGroup
            options={SKILL_OPTIONS}
            value={skills}
            onChange={(val) => setSkills((prev) => toggle(prev, val))}
            multi
          />
        </Section>
      </div>

      <div className="flex items-center gap-3 border-t border-border px-5 py-4">
        <button
          type="button"
          onClick={clearAll}
          className="w-1/3 rounded-xl py-3 text-sm font-semibold text-brand"
        >
          Clear All
        </button>
        <button
          type="button"
          onClick={apply}
          className="flex-1 rounded-xl gradient-brand py-3 text-sm font-bold text-brand-foreground"
        >
          Show Results
        </button>
      </div>
    </div>
  );
}
