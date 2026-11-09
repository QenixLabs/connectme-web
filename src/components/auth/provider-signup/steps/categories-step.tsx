"use client";

import { useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Brush,
  Building2,
  Camera,
  Check,
  Clapperboard,
  Ellipsis,
  GraduationCap,
  Headphones,
  Loader2,
  Megaphone,
  MonitorPlay,
  Search,
  Wrench,
  type LucideIcon,
} from "lucide-react";
import type { StepProps } from "../types";
import { SignupHeader } from "../signup-header";
import { Stepper } from "../stepper";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { MARKETPLACE_CATEGORIES } from "@/lib/marketplace-categories";

const CATEGORY_DETAILS: Record<
  (typeof MARKETPLACE_CATEGORIES)[number],
  { icon: LucideIcon; subs: string }
> = {
  "Photography & Video": {
    icon: Camera,
    subs: "Photoshoot, Showreels, Reels, Videography",
  },
  "Makeup & Styling": {
    icon: Brush,
    subs: "Makeup Artist, Hair Stylist, Costume, Fashion Stylist",
  },
  "Studios & Venues": {
    icon: Building2,
    subs: "Photo Studio, Recording Studio, Audition Studio, Event Venue",
  },
  "Equipment Rental": {
    icon: Wrench,
    subs: "Camera, Lighting, Sound, Grip, Drones, Monitors",
  },
  "Post-Production": {
    icon: MonitorPlay,
    subs: "Video Editing, VFX, Color Grading, Animation",
  },
  "Sound & Music": {
    icon: Headphones,
    subs: "Voice Recording, Dubbing, Music Production, Sound Design",
  },
  "Training & Coaching": {
    icon: GraduationCap,
    subs: "Acting, Dance, Voice, Audition Coaching, Fitness",
  },
  "Production Services": {
    icon: Clapperboard,
    subs: "Line Production, Art & Sets, Props, Location, Catering",
  },
  "Marketing & PR": {
    icon: Megaphone,
    subs: "PR, Digital Marketing, Social Media, Branding",
  },
  "Other Specialized": {
    icon: Ellipsis,
    subs: "Logistics, Security, Legal, Travel & Custom Services",
  },
};

const CATEGORIES = MARKETPLACE_CATEGORIES.map((id) => ({
  id,
  ...CATEGORY_DETAILS[id],
}));

export function CategoriesStep({
  data,
  update,
  onBack,
  onNext,
  loading = false,
  error = null,
}: StepProps) {
  const [search, setSearch] = useState("");
  const [validationError, setValidationError] = useState<string | null>(null);

  const selected = data.categories;

  const toggle = (id: string) => {
    setValidationError(null);
    update({
      categories: selected.includes(id)
        ? selected.filter((c) => c !== id)
        : [...selected, id],
    });
  };

  const filteredCategories = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return CATEGORIES;
    return CATEGORIES.filter(
      (c) =>
        c.id.toLowerCase().includes(q) ||
        c.subs.toLowerCase().includes(q),
    );
  }, [search]);

  const handleSubmit = () => {
    if (selected.length === 0) {
      setValidationError("Please select at least one service category to continue.");
      return;
    }
    onNext();
  };

  return (
    <div className="flex flex-col px-4 pb-10 pt-4 sm:px-8 sm:pt-5">
      <SignupHeader onBack={onBack} />

      <div className="mt-5">
        <Stepper current={4} />
      </div>

      <div className="mt-6 flex items-start justify-between gap-3">
        <div className="flex-1">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-[#8738FF]/20 bg-[#F6F1FF] px-3 py-1 text-xs font-bold text-[#8738FF] dark:bg-[#8738FF]/15">
            Step 4 of 4
          </div>
          <h1 className="mt-2 text-2xl sm:text-[26px] font-extrabold leading-tight text-[#101333] dark:text-white">
            Select Your <span className="text-[#8738FF]">Service Categories</span>
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-[#7885A3] dark:text-white/70">
            Choose the categories and services you offer. You can choose multiple categories.
          </p>
        </div>

        <div className="hidden sm:block text-right">
          <p className="text-xs font-bold italic text-[#8738FF] max-w-[130px] leading-tight">
            More Services, More Opportunities
          </p>
        </div>
      </div>

      {/* Global or validation error banner */}
      {(error || validationError) && (
        <div className="mt-4">
          <Alert variant="destructive">
            <AlertDescription>{error || validationError}</AlertDescription>
          </Alert>
        </div>
      )}

      {/* Real-time category search bar */}
      <label className="mt-4 flex min-h-11 cursor-text items-center gap-2 rounded-xl border border-[#E1E7F2] bg-white px-3.5 py-2.5 transition-all focus-within:border-[#8738FF] focus-within:ring-2 focus-within:ring-[#8738FF]/10 dark:border-white/10 dark:bg-white/[0.03]">
        <Search className="size-4 text-[#8A96AC]" />
        <input
          aria-label="Search categories"
          placeholder="Search categories (e.g. Photography, Studio, Makeup, Sound)"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-transparent text-xs sm:text-sm font-medium text-[#101333] outline-none placeholder:text-[#8A96AC] dark:text-white"
        />
      </label>

      {/* Categories grid */}
      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
        {filteredCategories.map((cat) => {
          const isSelected = selected.includes(cat.id);
          const Icon = cat.icon;
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => toggle(cat.id)}
              className={`group relative flex flex-col justify-between rounded-2xl border p-4 text-left transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[#8738FF] ${
                isSelected
                  ? "border-[#8738FF] bg-[#F7F3FF] shadow-sm ring-1 ring-[#8738FF] dark:bg-[#8738FF]/10 dark:border-[#8738FF]"
                  : "border-[#E1E7F2] bg-white hover:border-[#CBD5E1] hover:bg-[#F7F8FC] dark:border-white/10 dark:bg-white/[0.03] dark:hover:bg-white/[0.06]"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <span
                  className={`flex size-11 items-center justify-center rounded-2xl transition-colors ${
                    isSelected
                      ? "bg-[#8738FF] text-white shadow-sm"
                      : "bg-[#F6F1FF] text-[#8738FF] dark:bg-white/10 dark:text-white"
                  }`}
                >
                  <Icon className="size-5.5 stroke-[2.2]" />
                </span>

                <span
                  className={`flex size-5.5 shrink-0 items-center justify-center rounded-md transition-colors ${
                    isSelected
                      ? "bg-[#8738FF] text-white"
                      : "border-2 border-[#CBD5E1] dark:border-white/20"
                  }`}
                >
                  {isSelected ? <Check className="size-3.5 stroke-[3]" /> : null}
                </span>
              </div>

              <div className="mt-3">
                <span className="block text-sm sm:text-base font-extrabold text-[#101333] dark:text-white">
                  {cat.id}
                </span>
                <span className="mt-1 block text-xs leading-snug text-[#7885A3] dark:text-white/70">
                  {cat.subs}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {filteredCategories.length === 0 && (
        <div className="mt-6 rounded-2xl border border-dashed border-[#E1E7F2] p-8 text-center text-xs text-[#8A96AC]">
          No matching categories found for &quot;{search}&quot;. Try a different search term or pick &quot;Other Specialized&quot;.
        </div>
      )}

      {/* Selected categories summary card */}
      <div className="mt-5 flex items-center gap-3 rounded-2xl border border-[#8738FF]/20 bg-[#F6F1FF] p-3.5 dark:bg-[#8738FF]/10">
        <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-[#8738FF] text-white">
          <Check className="size-4.5 stroke-[2.5]" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-xs sm:text-sm font-bold text-[#101333] dark:text-white">
            {selected.length}{" "}
            {selected.length === 1 ? "Category Selected" : "Categories Selected"}
          </p>
          <p className="truncate text-[11px] text-[#7885A3] dark:text-white/70">
            {selected.length > 0 ? selected.join(", ") : "Select at least one category to continue"}
          </p>
        </div>
        {selected.length > 0 && (
          <button
            type="button"
            onClick={() => update({ categories: [] })}
            className="inline-flex min-h-11 min-w-11 shrink-0 items-center justify-center px-2 text-xs font-bold text-[#8738FF] hover:underline"
          >
            Clear
          </button>
        )}
      </div>

      {/* Navigation buttons */}
      <div className="mt-6 grid grid-cols-2 gap-3">
        <button
          type="button"
          disabled={loading}
          onClick={onBack}
          className="flex items-center justify-center gap-2 rounded-xl border border-[#DCD2F5] py-3.5 text-sm font-bold text-[#8738FF] transition-all hover:border-[#C9B8EF] hover:bg-[#F6F1FF] active:scale-[0.99] disabled:opacity-50 dark:hover:bg-[#8738FF]/15"
        >
          <ArrowLeft className="size-4" /> Back
        </button>

        <button
          type="button"
          disabled={loading}
          onClick={handleSubmit}
          className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#8738FF] via-[#7E33F6] to-[#6C2BE8] py-3.5 text-sm font-bold text-white shadow-[0_12px_28px_-10px_rgba(135,56,255,0.65)] transition-all hover:brightness-105 active:scale-[0.99] disabled:opacity-60"
        >
          {loading ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              <span>Creating Account…</span>
            </>
          ) : (
            <>
              <span>Create Account</span>
              <ArrowRight className="size-4" />
            </>
          )}
        </button>
      </div>
    </div>
  );
}
