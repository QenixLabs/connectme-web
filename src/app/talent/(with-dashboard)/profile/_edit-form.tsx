"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useForm, useFieldArray, Controller, useWatch, Control, UseFormRegister, FieldErrors } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import {
  Plus,
  Trash2,
  Loader2,
  Upload,
  FileText,
  User,
  MapPin,
  Briefcase,
  Zap,
  Languages,
  ScanLine,
  Share2,
  Shield,
  Eye,
  EyeOff,
  Save,
  Sparkles,
  Camera,
  ArrowLeft,
  Palette,
  AtSign,
} from "lucide-react";
import { usePopup } from "@/hooks/use-popup";
import { AxiosError } from "axios";
import { motion } from "motion/react";
import { Switch } from "@/components/ui/switch";

import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { TagInput } from "@/components/ui/tag-input";
import { TalentCard } from "@/components/talent-card";
import { talentApi } from "@/lib/api";
import { getApiErrorMessage } from "@/lib/formatters";
import { cn } from "@/lib/utils";
import { PALETTE_COLORS } from "@/lib/hero-color";
import {
  createTalentProfileSchema,
  type CreateTalentProfileInput,
  type TalentProfile,
} from "@/lib/validations/talent-profile.schema";
import {
  AVAILABILITY_OPTIONS,
  BODY_TYPES,
  COMPLEXIONS,
  EYE_COLORS,
  FLUENCIES,
  GENDER_OPTIONS,
  HAIR_COLORS,
  HAIR_LENGTHS,
  INDUSTRY_SUGGESTIONS,
  PRIVACY_MODE_OPTIONS,
  PROFESSION_SUGGESTIONS,
  PROFICIENCY_OPTIONS,
  VISIBILITIES,
  dynamicOptions,
} from "@/lib/talent-profile/options";
import {
  DEFAULT_VALUES,
  hydrateFromServer,
  buildPayload,
} from "@/lib/talent-profile/form-helpers";

interface EditFormProps {
  mode: "create" | "edit";
  profile: TalentProfile | null;
  onSaved: (profile: TalentProfile) => void;
  onCancel: () => void;
  onConflictLoaded?: (profile: TalentProfile) => void;
}

const SECTION_IDS = [
  "hero_bg",
  "identity",
  "location",
  "career",
  "skills",
  "languages",
  "physical",
  "documents",
  "social",
  "privacy",
];

/* ------------------------------------------------------------------ */
/*  Design tokens - all sourced from CSS variables                     */
/* ------------------------------------------------------------------ */

const T = {
  gold: "var(--color-gold)",
  goldHover: "var(--color-gold-hover)",
  goldSoft: "var(--color-gold-soft)",
  goldInk: "var(--color-gold-ink)",
  goldDark: "var(--color-gold-dark)",
  cream: "var(--color-cream)",
  creamPale: "var(--color-cream-pale)",
  creamDeep: "var(--color-cream-deep)",
  creamHover: "var(--color-cream-hover)",
  ink: "var(--color-ink)",
  inkSoft: "var(--color-ink-soft)",
  inkMuted: "var(--color-ink-muted)",
  border: "var(--color-border)",
  card: "var(--color-card)",
  destructive: "var(--color-destructive)",
  white: "var(--color-white)",
};

/* ------------------------------------------------------------------ */
/*  Hooks                                                              */
/* ------------------------------------------------------------------ */

function useActiveSection(ids: string[]) {
  const [activeId, setActiveId] = useState(ids[0] ?? "");
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        }
      },
      { rootMargin: "-15% 0px -70% 0px" }
    );
    for (const id of ids) {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    }
    return () => observer.disconnect();
  }, [ids]);
  return activeId;
}

/* ------------------------------------------------------------------ */
/*  Sub-components                                                     */
/* ------------------------------------------------------------------ */

function SectionDivider({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3 mt-2">
      <span className="text-[10px] font-bold tracking-[0.14em] uppercase whitespace-nowrap text-gold">
        {label}
      </span>
      <div className="flex-1 h-px bg-border/60" />
    </div>
  );
}

/* ---- Visibility toggle pill ---- */

function VisibilityToggle({ isPublic, onToggle }: { isPublic: boolean; onToggle: () => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={isPublic}
      onClick={onToggle}
      className={cn(
        "group relative inline-flex items-center gap-2 rounded-full pl-3 pr-1.5 py-1.5 border transition-all duration-300",
        isPublic
          ? "bg-gold-soft border-gold/30 text-gold-ink shadow-[0_0_0_4px_var(--color-gold-soft)]"
          : "bg-cream border-border text-ink-muted",
      )}
    >
      <span className="flex items-center gap-1 text-[10.5px] font-semibold uppercase tracking-[0.08em]">
        {isPublic ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
        {isPublic ? "Visible" : "Hidden"}
      </span>
      <span
        className={cn(
          "relative h-5 w-9 rounded-full transition-all duration-300",
          isPublic ? "bg-gold shadow-inner" : "bg-ink-muted/30",
        )}
      >
        <span
          className={cn(
            "absolute top-0.5 h-4 w-4 rounded-full bg-white shadow-sm transition-all duration-300",
            isPublic ? "left-[18px]" : "left-0.5",
          )}
        />
      </span>
    </button>
  );
}

function TopBar({ mode, onSave, isSubmitting, isDirty, username, completionPct }: {
  mode: "create" | "edit";
  onSave: () => void;
  isSubmitting: boolean;
  isDirty: boolean;
  username?: string;
  completionPct?: number;
}) {
  const router = useRouter();
  return (
    <header className="sticky top-0 z-40 backdrop-blur-xl bg-cream-pale/85 border-b border-border/40">
      <div className="flex items-center justify-between px-5 py-3">
        <button
          type="button"
          onClick={() => router.push("/talent/dashboard")}
          className="flex items-center gap-2 text-ink hover:text-gold-ink transition-colors"
        >
          <ArrowLeft className="h-4 w-4 text-gold" strokeWidth={2} />
          <span className="font-serif text-[15px] font-semibold tracking-tight">
            {mode === "create" ? "Create profile" : "Edit profile"}
          </span>
        </button>
        <div className="flex items-center gap-3">
          {mode === "edit" && completionPct !== undefined && (
            <div className="hidden sm:flex items-center gap-2 px-2.5 py-1 rounded-full bg-gold-soft/60 border border-gold/15">
              <div className="w-4 h-4 rounded-full border-2 flex items-center justify-center"
                style={{
                  borderColor: "var(--color-gold)",
                  background: `conic-gradient(var(--color-gold) ${completionPct * 3.6}deg, transparent ${completionPct * 3.6}deg)`,
                }}
              />
              <span className="text-[11px] font-semibold text-gold-ink">{completionPct}%</span>
            </div>
          )}
          {mode === "edit" && username && (
            <button
              type="button"
              onClick={() => router.push(`/talent/${username}`)}
              className="hidden sm:inline-flex items-center gap-1.5 text-[12px] font-medium px-3 py-1.5 rounded-full border border-gold/25 bg-gold-soft text-gold-ink hover:bg-gold-soft/80 transition-colors"
            >
              <Eye className="h-3.5 w-3.5" />
              Preview
            </button>
          )}
          <Button
            type="button"
            onClick={onSave}
            disabled={mode === "edit" && !isDirty && !isSubmitting}
            className={cn(
              "h-9 px-5 rounded-xl text-[13px] font-semibold text-white transition-all duration-200",
              "bg-gradient-to-b from-gold to-gold-dark",
              "hover:from-gold-hover hover:to-gold-dark",
              "shadow-[0_6px_20px_-10px_var(--color-gold-dark)] hover:shadow-[0_8px_24px_-10px_var(--color-gold-dark)]",
              "active:scale-[0.97]",
              "disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:from-gold disabled:hover:to-gold-dark",
            )}
          >
            {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />}
            {mode === "create" ? "Create" : "Save"}
          </Button>
        </div>
      </div>
      {mode === "edit" && username && (
        <div className="sm:hidden px-5 pb-2.5">
          <button
            type="button"
            onClick={() => router.push(`/talent/${username}`)}
            className="w-full inline-flex items-center justify-center gap-1.5 text-[12px] font-medium px-3 py-2 rounded-xl border border-gold/25 bg-gold-soft/60 text-gold-ink active:scale-[0.98] transition-all"
          >
            <Eye className="h-3.5 w-3.5" />
            Preview profile
          </button>
        </div>
      )}
    </header>
  );
}

const NAV_ITEMS: { id: (typeof SECTION_IDS)[number]; label: string; icon: React.ComponentType<{ className?: string; strokeWidth?: number | string }> }[] = [
  { id: "hero_bg", label: "Hero BG", icon: Palette },
  { id: "identity", label: "Identity", icon: User },
  { id: "location", label: "Location", icon: MapPin },
  { id: "career", label: "Career", icon: Briefcase },
  { id: "skills", label: "Skills", icon: Zap },
  { id: "languages", label: "Languages", icon: Languages },
  { id: "physical", label: "Body", icon: ScanLine },
  { id: "documents", label: "Docs", icon: FileText },
  { id: "social", label: "Social", icon: Share2 },
  { id: "privacy", label: "Privacy", icon: Shield },
];

function computeCompletions(values: CreateTalentProfileInput, errors: FieldErrors<CreateTalentProfileInput>) {
  const has = (v: unknown): boolean => {
    if (v === undefined || v === null || v === "") return false;
    if (Array.isArray(v)) return v.length > 0;
    if (typeof v === "object") return Object.values(v as object).some((iv) => has(iv));
    return true;
  };
  const sections = [
    { id: "hero_bg", filled: has(values.hero_background), errorFree: !errors.hero_background },
    { id: "identity", filled: has(values.username) || has(values.full_legal_name) || has(values.headline), errorFree: !errors.username && !errors.full_legal_name && !errors.headline && !errors.about },
    { id: "location", filled: has(values.location?.country) || has(values.location?.city), errorFree: !errors.location },
    { id: "career", filled: has(values.professions) || has(values.industries) || has(values.availability), errorFree: !errors.professions && !errors.industries && !errors.availability },
    { id: "skills", filled: has(values.skills), errorFree: !errors.skills || (Array.isArray(errors.skills) && (errors.skills as unknown[]).length === 0) },
    { id: "languages", filled: has(values.languages) || has(values.accents), errorFree: !errors.languages && !errors.accents },
    { id: "physical", filled: has(values.physical_attributes), errorFree: !errors.physical_attributes },
    { id: "documents", filled: has(values.documents?.resume_url), errorFree: !errors.documents },
    { id: "social", filled: has(values.social_links?.instagram?.url) || has(values.social_links?.youtube?.url) || has(values.social_links?.linkedin?.url), errorFree: !errors.social_links },
    { id: "privacy", filled: has(values.privacy_mode), errorFree: !errors.privacy_mode },
  ];
  const filledCount = sections.filter((s) => s.filled).length;
  return { sections, count: filledCount, total: sections.length, pct: Math.round((filledCount / sections.length) * 100) };
}

function SectionNav({
  activeId,
  onSelect,
  username,
  completions,
}: {
  activeId: string;
  onSelect: (id: string) => void;
  username?: string;
  completions: ReturnType<typeof computeCompletions>;
}) {
  return (
    <aside
      className="hidden lg:block w-[196px] shrink-0 border-r border-border/40"
      style={{ background: "var(--color-cream-pale)" }}
    >
      <div className="sticky top-[57px] pt-4 pb-6">
        <div className="px-4 pb-3.5 mb-2 border-b border-border/30">
          <div className="text-[15px] font-serif font-semibold tracking-tight text-ink">
            Connect<span className="text-gold">Me</span>
          </div>
          {username && (
            <div className="flex items-center gap-1.5 mt-1">
              <AtSign className="w-3 h-3 text-gold" strokeWidth={2} />
              <span className="text-[11px] text-ink-muted font-medium">{username}</span>
            </div>
          )}
        </div>
        <div className="space-y-0.5 px-2">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const active = activeId === item.id;
            const comp = completions.sections.find((s) => s.id === item.id);
            const filled = comp?.filled ?? false;
            const hasError = comp ? !comp.errorFree : false;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelect(item.id)}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-[7px] rounded-lg text-[12.5px] font-medium transition-all duration-200",
                  active
                    ? "bg-gold-soft text-gold-ink shadow-[0_2px_8px_-4px_var(--color-gold-soft)]"
                    : "text-ink-muted hover:text-ink-soft hover:bg-cream/80",
                )}
              >
                <Icon className="w-[16px] h-[16px] shrink-0" strokeWidth={active ? 2 : 1.5} />
                <span className="flex-1 text-left">{item.label}</span>
                {filled && !hasError && <span className="w-[6px] h-[6px] rounded-full bg-gold shrink-0" />}
                {hasError && <span className="w-[6px] h-[6px] rounded-full bg-destructive shrink-0" />}
              </button>
            );
          })}
        </div>
        <div className="mx-3 mt-4 pt-3 border-t border-border/30">
          <div className="flex items-center justify-between mb-1.5 px-1">
            <span className="text-[10px] uppercase tracking-[0.1em] text-ink-muted font-semibold">Complete</span>
            <span className="text-[11px] font-semibold text-gold-ink">{completions.pct}%</span>
          </div>
          <div className="mx-1 h-1.5 rounded-full bg-cream overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-gold to-gold/60"
              initial={{ width: 0 }}
              animate={{ width: `${completions.pct}%` }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            />
          </div>
        </div>
      </div>
    </aside>
  );
}

function MobileNav({
  activeId,
  onSelect,
}: {
  activeId: string;
  onSelect: (id: string) => void;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const mobileItems = [
    { id: "hero_bg", label: "Hero", icon: Palette },
    { id: "identity", label: "Identity", icon: User },
    { id: "location", label: "Location", icon: MapPin },
    { id: "career", label: "Career", icon: Briefcase },
    { id: "skills", label: "Skills", icon: Zap },
    { id: "languages", label: "Lang", icon: Languages },
    { id: "physical", label: "Body", icon: ScanLine },
    { id: "documents", label: "Docs", icon: FileText },
    { id: "social", label: "Social", icon: Share2 },
    { id: "privacy", label: "Privacy", icon: Shield },
  ];

  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;
    const activeBtn = container.querySelector(`[data-nav-id="${activeId}"]`) as HTMLElement | null;
    if (activeBtn) {
      activeBtn.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
    }
  }, [activeId]);

  return (
    <div
      className="lg:hidden sticky top-[53px] z-30 px-3 py-2.5 border-b border-border/30"
      style={{ backdropFilter: "blur(16px)", background: "var(--color-cream-pale)/90" }}
    >
      <div ref={scrollRef} className="flex gap-1.5 overflow-x-auto no-scrollbar">
        {mobileItems.map((item) => {
          const Icon = item.icon;
          const active = activeId === item.id;
          return (
            <button
              key={item.id}
              type="button"
              data-nav-id={item.id}
              onClick={() => onSelect(item.id)}
              className={cn(
                "shrink-0 inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-[11.5px] font-semibold transition-all duration-200 border",
                active
                  ? "bg-gold-soft text-gold-ink border-gold/30 shadow-sm"
                  : "bg-card text-ink-muted border-border/60 hover:border-gold/20 active:scale-[0.97]",
              )}
            >
              <Icon className="w-3.5 h-3.5" strokeWidth={active ? 2 : 1.5} />
              <span className="hidden sm:inline">{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function SkillRow({
  idx,
  register,
  control,
  errors,
  onRemove,
}: {
  idx: number;
  register: UseFormRegister<CreateTalentProfileInput>;
  control: Control<CreateTalentProfileInput>;
  errors: FieldErrors<CreateTalentProfileInput>;
  onRemove: () => void;
}) {
  const hasError = !!errors.skills?.[idx]?.name || !!errors.skills?.[idx]?.proficiency;
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      className={cn(
        "flex items-center gap-3 rounded-xl border px-3 py-2.5 transition-colors duration-200",
        hasError
          ? "border-error/40 bg-error-light/30"
          : "bg-cream-pale/80 border-border hover:border-gold/25 hover:bg-cream",
      )}
    >
      <span className="shrink-0 w-6 h-6 rounded-lg bg-gold-soft/60 border border-gold/15 grid place-items-center text-[11px] font-semibold text-gold-ink select-none">
        {idx + 1}
      </span>
      <input
        placeholder="Skill name"
        {...register(`skills.${idx}.name`)}
        aria-invalid={!!errors.skills?.[idx]?.name}
        className="flex-1 min-w-0 bg-transparent text-[13px] font-medium outline-none placeholder:text-ink-muted/60 text-ink"
      />
      <Controller
        control={control}
        name={`skills.${idx}.proficiency`}
        render={({ field }) => (
          <Select onValueChange={field.onChange} value={field.value || ""}>
            <SelectTrigger className="h-8 w-[120px] text-xs rounded-lg border-border bg-white/60 hover:border-gold/25 transition-colors shadow-none">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PROFICIENCY_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      />
      <button
        type="button"
        onClick={onRemove}
        className="w-7 h-7 flex items-center justify-center rounded-lg border border-border/60 bg-cream hover:bg-error-light hover:border-error/30 hover:text-destructive transition-all duration-200 text-ink-muted"
        aria-label="Remove skill"
      >
        <Trash2 className="w-3.5 h-3.5" strokeWidth={1.5} />
      </button>
    </motion.div>
  );
}

function LanguageRow({
  idx,
  register,
  control,
  errors,
  onRemove,
}: {
  idx: number;
  register: UseFormRegister<CreateTalentProfileInput>;
  control: Control<CreateTalentProfileInput>;
  errors: FieldErrors<CreateTalentProfileInput>;
  onRemove: () => void;
}) {
  const hasError = !!errors.languages?.[idx]?.name || !!errors.languages?.[idx]?.fluency;
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      className={cn(
        "flex items-center gap-3 rounded-xl border px-3 py-2.5 transition-colors duration-200",
        hasError
          ? "border-error/40 bg-error-light/30"
          : "bg-cream-pale/80 border-border hover:border-gold/25 hover:bg-cream",
      )}
    >
      <span className="shrink-0 w-6 h-6 rounded-lg bg-gold-soft/60 border border-gold/15 grid place-items-center text-[11px] font-semibold text-gold-ink select-none">
        {idx + 1}
      </span>
      <input
        placeholder="Language name"
        {...register(`languages.${idx}.name`)}
        aria-invalid={!!errors.languages?.[idx]?.name}
        className="flex-1 min-w-0 bg-transparent text-[13px] font-medium outline-none placeholder:text-ink-muted/60 text-ink"
      />
      <Controller
        control={control}
        name={`languages.${idx}.fluency`}
        render={({ field }) => (
          <Select onValueChange={field.onChange} value={field.value || ""}>
            <SelectTrigger className="h-8 w-[120px] text-xs rounded-lg border-border bg-white/60 hover:border-gold/25 transition-colors shadow-none">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {FLUENCIES.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      />
      <button
        type="button"
        onClick={onRemove}
        className="w-7 h-7 flex items-center justify-center rounded-lg border border-border/60 bg-cream hover:bg-error-light hover:border-error/30 hover:text-destructive transition-all duration-200 text-ink-muted"
        aria-label="Remove language"
      >
        <Trash2 className="w-3.5 h-3.5" strokeWidth={1.5} />
      </button>
    </motion.div>
  );
}

function SocialIcon({ platform }: { platform: "instagram" | "youtube" | "linkedin" }) {
  if (platform === "instagram") {
    return (
      <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: "var(--color-pink-light)" }}>
        <svg viewBox="0 0 24 24" fill="none" stroke="var(--color-pink)" strokeWidth="2" className="w-[18px] h-[18px]">
          <rect x="2" y="2" width="20" height="20" rx="5" />
          <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
          <circle cx="17.5" cy="6.5" r="1" fill="var(--color-pink)" stroke="none" />
        </svg>
      </div>
    );
  }
  if (platform === "youtube") {
    return (
      <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: "var(--color-red-light)" }}>
        <svg viewBox="0 0 24 24" fill="var(--color-red)" className="w-[18px] h-[18px]">
          <path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46a2.78 2.78 0 0 0-1.95 1.96A29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58A2.78 2.78 0 0 0 3.41 19.54C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.95-1.96A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z" />
          <polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02" fill="white" />
        </svg>
      </div>
    );
  }
  return (
    <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: "var(--color-blue-light)" }}>
      <svg viewBox="0 0 24 24" fill="var(--color-blue)" className="w-[18px] h-[18px]">
        <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
        <rect x="2" y="9" width="4" height="12" />
        <circle cx="4" cy="4" r="2" />
      </svg>
    </div>
  );
}

/* ---- Section card ---- */

function SectionCard({
  icon: Icon,
  label,
  description,
  isPublic,
  onToggle,
  alwaysPublic,
  children,
}: {
  icon: React.ComponentType<{ className?: string; strokeWidth?: number | string }>;
  label: string;
  description: string;
  isPublic?: boolean;
  onToggle?: () => void;
  alwaysPublic?: boolean;
  children: React.ReactNode;
}) {
  return (
    <Card className="relative rounded-2xl border-border/50 shadow-luxe overflow-hidden p-0 gap-0 group/card transition-shadow duration-300 hover:shadow-[0_12px_40px_-20px_oklch(0.30_0.05_60/0.30)]">
      <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-gold/40 via-gold/15 to-transparent opacity-0 group-hover/card:opacity-100 transition-opacity duration-500" />
      <CardHeader className="px-5 pt-5 pb-3.5 flex-row items-start gap-3.5">
        <div className="h-10 w-10 rounded-xl bg-gold-soft border border-gold/20 grid place-items-center shrink-0">
          <Icon className="h-[18px] w-[18px] text-gold-ink" strokeWidth={1.5} />
        </div>
        <div className="flex-1 min-w-0 pt-0.5">
          <CardTitle className="font-serif text-[15px] text-ink leading-tight tracking-tight">{label}</CardTitle>
          <CardDescription className="text-[11.5px] text-ink-muted mt-0.5 leading-relaxed">{description}</CardDescription>
        </div>
        {alwaysPublic ? (
          <span className="shrink-0 flex items-center gap-1.5 text-[10.5px] font-semibold uppercase tracking-[0.08em] text-gold-ink bg-gold-soft border border-gold/30 rounded-full pl-2.5 pr-3 py-1.5 select-none">
            <Eye className="h-3 w-3" />
            Always public
          </span>
        ) : (
          <div className="shrink-0">
            <VisibilityToggle isPublic={isPublic!} onToggle={onToggle!} />
          </div>
        )}
      </CardHeader>
      <div className="h-px bg-gradient-to-r from-border/60 via-border/40 to-transparent mx-5" />
      <CardContent className="px-5 pt-4 pb-5">{children}</CardContent>
    </Card>
  );
}

/* ---- Completion banner ---- */

function CompletionBanner({ pct, count, total }: { pct: number; count: number; total: number }) {
  return (
    <div className="px-4 pt-5 pb-1">
      <Card className="relative overflow-hidden rounded-2xl border-border/40 shadow-luxe p-0 gap-0">
        <div
          className="absolute inset-0 opacity-70 pointer-events-none"
          style={{
            background:
              "radial-gradient(140% 90% at 0% 0%, oklch(0.74 0.13 80 / 0.10) 0%, transparent 55%), radial-gradient(140% 90% at 100% 100%, oklch(0.74 0.13 80 / 0.08) 0%, transparent 50%)",
          }}
        />
        <CardContent className="relative px-5 py-4 flex items-center gap-4">
          <div className="h-11 w-11 rounded-2xl bg-gold-soft border border-gold/25 grid place-items-center shrink-0">
            <Sparkles className="h-[20px] w-[20px] text-gold-ink" strokeWidth={1.5} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] uppercase tracking-[0.14em] text-ink-muted font-semibold">Profile completion</p>
            <p className="font-serif text-[15px] text-ink leading-tight mt-0.5">{count} of {total} sections filled</p>
          </div>
          <div className="text-right shrink-0">
            <div className="text-[10px] text-ink-muted font-medium">Score</div>
            <div className="font-serif text-[22px] text-gold leading-none mt-0.5 font-semibold">{pct}%</div>
          </div>
        </CardContent>
        <div className="relative h-[3px] bg-cream-deep/50">
          <motion.div
            className="h-full bg-gradient-to-r from-gold via-gold to-gold/50 rounded-r-full"
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          />
        </div>
      </Card>
    </div>
  );
}

/* ---- Form helper components ---- */

function Field({
  label,
  children,
  compact,
}: {
  label: string;
  children: React.ReactNode;
  compact?: boolean;
}) {
  return (
    <label className={`block ${compact ? "" : "mb-3 last:mb-0"}`}>
      <span className="block text-[10.5px] uppercase tracking-[0.12em] text-ink-muted mb-1.5">{label}</span>
      {children}
    </label>
  );
}

function AddRow({ label, onClick }: { label: string; onClick?: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full flex items-center justify-center gap-2 rounded-xl border border-dashed border-gold/35 bg-gold-soft/30 px-4 py-3 text-[13px] font-medium text-gold-ink hover:bg-gold-soft/60 hover:border-gold/50 active:scale-[0.99] transition-all duration-200"
    >
      <Plus className="w-4 h-4" strokeWidth={2} />
      {label}
    </button>
  );
}

/* ------------------------------------------------------------------ */
/*  Main                                                               */
/* ------------------------------------------------------------------ */

export function EditForm({
  mode,
  profile,
  onSaved,
  onCancel,
  onConflictLoaded,
}: EditFormProps) {
  const router = useRouter();
  const { show } = usePopup();
  const [saveError, setSaveError] = useState<string | null>(null);
  const [swipeStart, setSwipeStart] = useState<{ x: number; y: number } | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);
  const [resumePreview, setResumePreview] = useState<string | null>(null);
  const [resumeName, setResumeName] = useState<string | null>(null);
  const [resumeError, setResumeError] = useState<string | null>(null);
  const [resumeUploading, setResumeUploading] = useState(false);
  const resumeInputRef = useRef<HTMLInputElement>(null);

  const [heroBgPreview, setHeroBgPreview] = useState<string | null>(null);
  const [heroBgError, setHeroBgError] = useState<string | null>(null);
  const [heroBgUploading, setHeroBgUploading] = useState(false);
  const heroBgInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<CreateTalentProfileInput>({
    resolver: zodResolver(createTalentProfileSchema),
    defaultValues:
      mode === "edit" && profile ? hydrateFromServer(profile) : DEFAULT_VALUES,
    mode: "onSubmit",
  });

  const {
    register,
    handleSubmit,
    control,
    setError: setFieldError,
    reset,
    formState: { errors, isSubmitting, isDirty },
  } = form;

  const skillsArray = useFieldArray({ control, name: "skills" });
  const languagesArray = useFieldArray({ control, name: "languages" });

  const watchedUsername = useWatch({ control, name: "username" });
  const watchedValues = useWatch({ control }) as CreateTalentProfileInput;
  const completions = computeCompletions(watchedValues, errors);
  const activeSection = useActiveSection(SECTION_IDS);
  const lastUsernameRef = useRef(profile?.username);

  useEffect(() => {
    if (profile && profile.username !== lastUsernameRef.current) {
      lastUsernameRef.current = profile.username;
      reset(hydrateFromServer(profile));
    }
  }, [profile, reset]);

  useEffect(() => {
    if (!profile) {
      setPhotoPreview(null);
      return;
    }
    const photo = profile.profile_photo;
    if (!photo) {
      setPhotoPreview(null);
      return;
    }
    setPhotoPreview(photo);
    if (photo.includes('/files/access?') && photo.includes('signature=')) {
      try {
        const parsed = new URL(photo);
        const relativePath = parsed.searchParams.get('path');
        if (relativePath) {
          form.setValue('profile_photo', relativePath, { shouldDirty: false });
        }
      } catch {
        /* ignore */
      }
    }
  }, [profile, form]);

  useEffect(() => {
    if (!profile) {
      setResumePreview(null);
      setResumeName(null);
      return;
    }
    const resume = profile.documents?.resume_url;
    if (!resume) {
      setResumePreview(null);
      setResumeName(null);
      return;
    }
    setResumePreview(resume);
    if (resume.includes('/files/access?') && resume.includes('signature=')) {
      try {
        const parsed = new URL(resume);
        const relativePath = parsed.searchParams.get('path');
        if (relativePath) {
          form.setValue('documents.resume_url', relativePath, { shouldDirty: false });
          const base = relativePath.split('/').pop() || 'Resume';
          setResumeName(base.replace(/^\d+-/, ''));
        }
      } catch {
        /* ignore */
      }
    } else {
      const base = resume.split('/').pop() || 'Resume';
      setResumeName(base.replace(/^\d+-/, ''));
    }
  }, [profile, form]);

  useEffect(() => {
    if (!profile) {
      setHeroBgPreview(null);
      return;
    }
    const bg = profile.hero_background;
    if (!bg) {
      setHeroBgPreview(null);
      return;
    }
    if (bg.startsWith("#")) {
      setHeroBgPreview(bg);
    } else {
      setHeroBgPreview(bg);
    }
  }, [profile]);

  const handlePhotoChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      setPhotoError(null);
      if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
        setPhotoError('Only JPEG, PNG, and WEBP images are allowed');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setPhotoError('File size must be less than 5MB');
        return;
      }
      try {
        const { relativePath, signedUrl } = await talentApi.uploadProfilePhoto(file);
        form.setValue('profile_photo', relativePath, { shouldDirty: true });
        setPhotoPreview(signedUrl);
      } catch (err) {
        setPhotoError(getApiErrorMessage(err, 'Failed to upload photo'));
      }
    },
    [form],
  );

  const handlePhotoClear = useCallback(() => {
    form.setValue('profile_photo', '', { shouldDirty: true });
    setPhotoPreview(null);
    setPhotoError(null);
  }, [form]);

  const handleResumeChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      setResumeError(null);
      if (
        ![
          'application/pdf',
          'application/msword',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        ].includes(file.type)
      ) {
        setResumeError('Only PDF, DOC, and DOCX files are allowed');
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        setResumeError('File size must be less than 10MB');
        return;
      }
      setResumeUploading(true);
      try {
        const { relativePath, signedUrl } = await talentApi.uploadDocument(file);
        form.setValue('documents.resume_url', relativePath, { shouldDirty: true });
        setResumePreview(signedUrl);
        setResumeName(file.name);
      } catch (err) {
        setResumeError(getApiErrorMessage(err, 'Failed to upload document'));
      } finally {
        setResumeUploading(false);
      }
    },
    [form],
  );

  const handleResumeClear = useCallback(() => {
    form.setValue('documents.resume_url', '', { shouldDirty: true });
    setResumePreview(null);
    setResumeName(null);
    setResumeError(null);
  }, [form]);

  const handleHeroBgChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      setHeroBgError(null);
      if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
        setHeroBgError('Only JPEG, PNG, and WEBP images are allowed');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setHeroBgError('File size must be less than 5MB');
        return;
      }
      setHeroBgUploading(true);
      try {
        const { relativePath, signedUrl } = await talentApi.uploadProfilePhoto(file);
        form.setValue('hero_background', relativePath, { shouldDirty: true });
        setHeroBgPreview(signedUrl);
      } catch (err) {
        setHeroBgError(getApiErrorMessage(err, 'Failed to upload background'));
      } finally {
        setHeroBgUploading(false);
      }
    },
    [form],
  );

  const handleHeroBgColor = useCallback(
    (color: string) => {
      form.setValue('hero_background', color, { shouldDirty: true });
      setHeroBgPreview(color);
      setHeroBgError(null);
    },
    [form],
  );

  const handleHeroBgClear = useCallback(() => {
    form.setValue('hero_background', '', { shouldDirty: true });
    setHeroBgPreview(null);
    setHeroBgError(null);
  }, [form]);

  const scrollTo = useCallback((id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    const t = e.touches[0];
    setSwipeStart({ x: t.clientX, y: t.clientY });
  }, []);

  const handleTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      if (!swipeStart) return;
      const t = e.changedTouches[0];
      const dx = t.clientX - swipeStart.x;
      const dy = Math.abs(t.clientY - swipeStart.y);
      if (dx > 80 && dy < 40) {
        onCancel();
      }
      setSwipeStart(null);
    },
    [swipeStart, onCancel]
  );

  const onSubmit = handleSubmit(async (values) => {
    setSaveError(null);
    try {
      let saved: TalentProfile;
      if (mode === "create") {
        saved = await talentApi.createProfile(values);
      } else {
        const payload = buildPayload(values);
        delete payload.username;
        saved = await talentApi.updateProfile(payload);
      }
      onSaved(saved);
      show({
        title: "Profile saved",
        description: mode === "create" ? "Your profile has been created." : "Your changes have been saved.",
        variant: "success",
        position: "bottom-center",
        duration: 4000,
      });
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      const axiosErr = err as AxiosError<{ message?: string }>;
      const status = axiosErr.response?.status;
      const message = axiosErr.response?.data?.message ?? "";

      if (mode === "create" && status === 409 && /username/i.test(message)) {
        setFieldError("username", {
          type: "manual",
          message: "Username already taken",
        });
        scrollTo("identity");
        return;
      }
      if (
        mode === "create" &&
        status === 409 &&
        /already exists/i.test(message)
      ) {
        try {
          const existing = await talentApi.getMyProfile();
          if (existing) {
            onConflictLoaded?.(existing);
            setSaveError(
              "A profile already exists — it has been loaded. Please re-apply your changes and save again."
            );
            return;
          }
        } catch {
          /* fall through */
        }
      }
      setSaveError(getApiErrorMessage(err, "Failed to save profile"));
    }
  });

  const triggerSave = () => {
    const formEl = document.getElementById("profile-form") as HTMLFormElement | null;
    if (formEl) formEl.requestSubmit();
  };

  return (
    <div
      className="flex flex-col lg:flex-row lg:min-h-[600px]"
      style={{ background: T.creamPale }}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Top bar + mobile nav inside main content area */}
      <div className="flex-1 min-w-0">
        <TopBar mode={mode} onSave={triggerSave} isSubmitting={isSubmitting} isDirty={isDirty} username={watchedUsername || profile?.username} completionPct={completions.pct} />

        {mode === "edit" && <CompletionBanner pct={completions.pct} count={completions.count} total={completions.total} />}

        <div className="flex">
          <SectionNav activeId={activeSection} onSelect={scrollTo} username={watchedUsername || profile?.username} completions={completions} />

          <div className="flex-1 min-w-0">
            <MobileNav activeId={activeSection} onSelect={scrollTo} />

            <div className="px-4 pt-4 lg:px-8 lg:pt-6 max-w-5xl mx-auto">
              <p
                className="text-sm mb-6"
                style={{ color: T.inkSoft }}
              >
                {mode === "create"
                  ? "Pick a username to get started. You can fill the rest later."
                  : "Keep your profile up to date so recruiters can find you."}
              </p>
            </div>

            {mode === "create" && (
              <div className="px-4 mb-6 lg:px-8 max-w-5xl mx-auto">
                <p className="text-xs sm:text-sm mb-3 px-1" style={{ color: T.inkMuted }}>
                  Preview: how recruiters will see you
                </p>
                <TalentCard sample />
              </div>
            )}

            {saveError && (
              <div className="px-4 mb-4 lg:px-8 max-w-5xl mx-auto">
                <Alert variant="destructive">
                  <AlertDescription>{saveError}</AlertDescription>
                </Alert>
              </div>
            )}

            <Form {...form}>
              <form id="profile-form" onSubmit={onSubmit} className="px-4 lg:px-8 space-y-6 max-w-5xl mx-auto">
                {/* ---------- HERO BACKGROUND ---------- */}
                <div id="hero_bg" className="scroll-mt-[120px] lg:scroll-mt-28">
                  <SectionCard icon={Sparkles} label="Hero background" description="Customize the banner behind your profile photo" alwaysPublic>
                    {/* Upload image */}
                    <Field label="Upload image">
                      <div className="flex items-center gap-4">
                        <button
                          type="button"
                          onClick={() => heroBgInputRef.current?.click()}
                          disabled={heroBgUploading}
                          className="flex items-center gap-2 rounded-xl border border-dashed border-gold/30 bg-gold-soft/30 px-4 py-3 text-[13px] font-medium text-gold-ink hover:bg-gold-soft/60 hover:border-gold/50 transition disabled:opacity-50"
                        >
                          {heroBgUploading ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Upload className="h-4 w-4" />
                          )}
                          {heroBgUploading ? "Uploading..." : "Choose image"}
                        </button>
                        <input
                          type="file"
                          accept="image/jpeg,image/png,image/webp"
                          className="hidden"
                          ref={heroBgInputRef}
                          onChange={handleHeroBgChange}
                        />
                        {heroBgPreview && (
                          <button
                            type="button"
                            onClick={handleHeroBgClear}
                            className="text-[12px] text-destructive"
                          >
                            Remove
                          </button>
                        )}
                        {heroBgError && (
                          <p className="text-[11px] text-destructive">{heroBgError}</p>
                        )}
                      </div>
                    </Field>

                    {/* Color palette */}
                    <Field label="Or pick a solid color">
                      <div className="grid grid-cols-6 gap-2">
                        {PALETTE_COLORS.map((color) => {
                          const isSelected = form.watch("hero_background") === color;
                          return (
                            <button
                              key={color}
                              type="button"
                              onClick={() => handleHeroBgColor(color)}
                              className={cn(
                                "h-10 rounded-xl border-2 transition-all duration-200 hover:scale-110 active:scale-95",
                                isSelected
                                  ? "border-card shadow-[0_0_0_3px_var(--color-gold),0_0_0_5px_var(--color-gold-soft)] scale-110"
                                  : "border-transparent hover:border-gold/30",
                              )}
                              style={{ background: color }}
                              title={color}
                              aria-label={`Hero color ${color}`}
                            />
                          );
                        })}
                      </div>
                    </Field>

                    {/* Custom hex */}
                    <Field label="Custom hex color">
                      <div className="flex items-center gap-3">
                        <input
                          type="color"
                          value={form.watch("hero_background")?.startsWith("#") ? form.watch("hero_background") : "#1a1c2a"}
                          onChange={(e) => handleHeroBgColor(e.target.value)}
                          className="h-10 w-14 rounded-xl border border-border/60 cursor-pointer bg-transparent hover:border-gold/30 transition-colors"
                        />
                        <Input
                          value={form.watch("hero_background")?.startsWith("#") ? form.watch("hero_background") : ""}
                          onChange={(e) => {
                            const v = e.target.value;
                            if (v === "") {
                              handleHeroBgClear();
                            } else if (/^#[0-9a-fA-F]{0,6}$/.test(v)) {
                              form.setValue("hero_background", v, { shouldDirty: true });
                              setHeroBgPreview(v);
                            }
                          }}
                          placeholder="#1a1c2a"
                          className="h-10 text-sm rounded-xl border-border bg-cream-pale/80 focus:border-gold/50 focus:bg-card focus:ring-2 focus:ring-gold/25 transition-all flex-1"
                          maxLength={7}
                        />
                      </div>
                    </Field>

                    {/* Preview */}
                    {heroBgPreview && (
                      <div
                        className="mt-3 h-20 rounded-xl border border-border/60 overflow-hidden shadow-inner"
                        style={{
                          background: heroBgPreview.startsWith("#") ? heroBgPreview : `url(${heroBgPreview}) center/cover`,
                        }}
                      />
                    )}
                    <div className="mt-3 text-[11px] text-ink-muted">
                      Leave empty for a random color (same every time for your profile).
                    </div>
                  </SectionCard>
                </div>

                {/* ---------- BASIC INFO ---------- */}
                <div id="identity" className="scroll-mt-[120px] lg:scroll-mt-28">
                  <SectionCard icon={User} label="Basic info" description="Name, role, location and bio" alwaysPublic>
                    <div className="flex items-center gap-4 mb-5">
                      <div className="relative shrink-0">
                        <div
                          className={cn(
                            "h-[72px] w-[72px] rounded-2xl flex items-center justify-center text-[28px] font-bold text-white",
                            !photoPreview && "bg-gradient-to-br from-gold to-gold-dark",
                          )}
                        >
                          {photoPreview ? (
                            <img src={photoPreview} alt="Profile photo" className="w-full h-full rounded-2xl object-cover" />
                          ) : (
                            <span className="font-serif">
                              {(form.getValues("full_legal_name") || form.getValues("username") || "T")
                                .split(" ")
                                .map((w) => w[0])
                                .slice(0, 2)
                                .join("")
                                .toUpperCase()}
                            </span>
                          )}
                        </div>
                        <input
                          type="file"
                          accept="image/jpeg,image/png,image/webp"
                          className="hidden"
                          ref={photoInputRef}
                          onChange={handlePhotoChange}
                        />
                        <button
                          type="button"
                          onClick={() => photoInputRef.current?.click()}
                          className="absolute -bottom-1.5 -right-1.5 h-[30px] w-[30px] rounded-full bg-gold grid place-items-center shadow-lg ring-[3px] ring-card hover:bg-gold-hover active:scale-95 transition-all duration-200"
                        >
                          <Camera className="h-[15px] w-[15px] text-white" strokeWidth={2} />
                        </button>
                      </div>
                      <div className="flex flex-col gap-1">
                        <span className="text-[12px] text-ink-muted leading-snug">Tap the camera to update your photo.</span>
                        {photoPreview && (
                          <button
                            type="button"
                            onClick={handlePhotoClear}
                            className="text-[11px] text-left text-ink-muted hover:text-destructive transition-colors w-fit"
                          >
                            Remove photo
                          </button>
                        )}
                        {photoError && <p className="text-[11px] text-destructive">{photoError}</p>}
                      </div>
                    </div>

                    <div className="space-y-3">
                      <FormField
                        control={control}
                        name="username"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-[13px] font-medium">Username <span className="text-gold">*</span></FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                disabled={mode === "edit"}
                                placeholder="e.g. john_doe"
                                className="h-10 text-sm rounded-xl border-border bg-cream-pale/80 focus:border-gold/50 focus:bg-card focus:ring-2 focus:ring-gold/25 transition-all"
                              />
                            </FormControl>
                            <FormMessage />
                            {mode === "edit" && (
                              <p className="text-[11px] mt-1 text-ink-muted">
                                Username cannot be changed.
                              </p>
                            )}
                          </FormItem>
                        )}
                      />
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <FormField
                          control={control}
                          name="full_legal_name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-[13px] font-medium">Full legal name</FormLabel>
                              <FormControl>
                                <Input
                                  {...field}
                                  value={field.value ?? ""}
                                  className="h-10 text-sm rounded-xl border-border bg-cream-pale/80 focus:border-gold/50 focus:bg-card focus:ring-2 focus:ring-gold/25 transition-all"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={control}
                          name="date_of_birth"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-[13px] font-medium">Date of birth</FormLabel>
                              <FormControl>
                                <Input
                                  type="date"
                                  {...field}
                                  value={field.value ?? ""}
                                  className="h-10 text-sm rounded-xl border-border bg-cream-pale/80 focus:border-gold/50 focus:bg-card focus:ring-2 focus:ring-gold/25 transition-all"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={control}
                          name="gender"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-[13px] font-medium">Gender</FormLabel>
                              <Select onValueChange={(v) => field.onChange(v || undefined)} value={field.value || ""}>
                                <FormControl>
                                  <SelectTrigger className="h-10 text-sm rounded-xl border-border bg-cream-pale/80 shadow-none">
                                    <SelectValue placeholder="Select…" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {dynamicOptions(field.value, GENDER_OPTIONS).map((opt) => (
                                    <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={control}
                          name="headline"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-[13px] font-medium">Headline</FormLabel>
                              <FormControl>
                                <Input
                                  {...field}
                                  value={field.value ?? ""}
                                  maxLength={120}
                                  placeholder="One line that describes you"
                                  className="h-10 text-sm rounded-xl border-border bg-cream-pale/80 focus:border-gold/50 focus:bg-card focus:ring-2 focus:ring-gold/25 transition-all"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <FormField
                        control={control}
                        name="about"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-[13px] font-medium">About</FormLabel>
                            <FormControl>
                              <Textarea
                                {...field}
                                value={field.value ?? ""}
                                maxLength={500}
                                rows={4}
                                placeholder="A short bio (max 500 characters)"
                                className="text-sm rounded-xl border-border bg-cream-pale/80 focus:border-gold/50 focus:bg-card focus:ring-2 focus:ring-gold/25 transition-all resize-none"
                              />
                            </FormControl>
                            <FormMessage />
                            <div className="mt-1.5 flex justify-between text-[11px] text-ink-muted">
                              <span>Keep it crisp — 1 to 3 sentences.</span>
                              <span>{(field.value ?? "").length}/500</span>
                            </div>
                          </FormItem>
                        )}
                      />
                    </div>
                  </SectionCard>
                </div>

                {/* ---------- LOCATION ---------- */}
                <div id="location" className="scroll-mt-[120px] lg:scroll-mt-28">
                  <SectionCard
                    icon={MapPin}
                    label="Location"
                    description="Where you are based"
                    isPublic={form.watch("section_visibility.location") ?? true}
                    onToggle={() => {
                      const current = form.getValues("section_visibility.location") ?? true;
                      form.setValue("section_visibility.location", !current, { shouldDirty: true });
                    }}
                  >
                    <div className="space-y-3">
                      <FormField
                        control={control}
                        name="location.country"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-[13px] font-medium">Country</FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                value={field.value ?? ""}
                                className="h-10 text-sm rounded-xl border-border bg-cream-pale/80 focus:border-gold/50 focus:bg-card focus:ring-2 focus:ring-gold/25 transition-all"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <div className="grid grid-cols-2 gap-3">
                        <FormField
                          control={control}
                          name="location.state"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-[13px] font-medium">State</FormLabel>
                              <FormControl>
                                <Input
                                  {...field}
                                  value={field.value ?? ""}
                                  className="h-10 text-sm rounded-xl border-border bg-cream-pale/80 focus:border-gold/50 focus:bg-card focus:ring-2 focus:ring-gold/25 transition-all"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={control}
                          name="location.city"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-[13px] font-medium">City</FormLabel>
                              <FormControl>
                                <Input
                                  {...field}
                                  value={field.value ?? ""}
                                  className="h-10 text-sm rounded-xl border-border bg-cream-pale/80 focus:border-gold/50 focus:bg-card focus:ring-2 focus:ring-gold/25 transition-all"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                  </SectionCard>
                </div>

                {/* ---------- CAREER ---------- */}
                <div id="career" className="scroll-mt-[120px] lg:scroll-mt-28">
                  <SectionCard
                    icon={Briefcase}
                    label="Career"
                    description="Professions, industries and availability"
                    isPublic={form.watch("section_visibility.availability") ?? true}
                    onToggle={() => {
                      const current = form.getValues("section_visibility.availability") ?? true;
                      form.setValue("section_visibility.availability", !current, { shouldDirty: true });
                    }}
                  >
                    <div className="space-y-3">
                      <FormField
                        control={control}
                        name="professions"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-[13px] font-medium">Professions</FormLabel>
                            <TagInput
                              value={field.value ?? []}
                              onChange={field.onChange}
                              suggestions={PROFESSION_SUGGESTIONS}
                              placeholder="Add profession…"
                              containerClassName="[&>div]:rounded-xl [&>div]:border-border [&>div]:focus-within:border-gold/50 [&>div]:focus-within:ring-2 [&>div]:focus-within:ring-gold/25 [&>div]:bg-cream-pale/80"
                            />
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={control}
                        name="industries"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-[13px] font-medium">Industries</FormLabel>
                            <TagInput
                              value={field.value ?? []}
                              onChange={field.onChange}
                              suggestions={INDUSTRY_SUGGESTIONS}
                              placeholder="Add industry…"
                              containerClassName="[&>div]:rounded-xl [&>div]:border-border [&>div]:focus-within:border-gold/50 [&>div]:focus-within:ring-2 [&>div]:focus-within:ring-gold/25 [&>div]:bg-cream-pale/80"
                            />
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={control}
                        name="availability"
                        render={({ field }) => (
                          <FormItem className="max-w-xs">
                            <FormLabel className="text-[13px] font-medium">Availability</FormLabel>
                            <Select onValueChange={(v) => field.onChange(v || undefined)} value={field.value || ""}>
                              <FormControl>
                                <SelectTrigger className="h-10 text-sm rounded-xl border-border bg-cream-pale/80 shadow-none">
                                  <SelectValue placeholder="Select…" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {AVAILABILITY_OPTIONS.map((opt) => (
                                  <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </SectionCard>
                </div>

                {/* ---------- SKILLS ---------- */}
                <div id="skills" className="scroll-mt-[120px] lg:scroll-mt-28">
                  <SectionCard
                    icon={Zap}
                    label="Skills"
                    description="Acting craft & specialties"
                    isPublic={form.watch("section_visibility.skills") ?? true}
                    onToggle={() => {
                      const current = form.getValues("section_visibility.skills") ?? true;
                      form.setValue("section_visibility.skills", !current, { shouldDirty: true });
                    }}
                  >
                    <div className="space-y-2">
                      {skillsArray.fields.map((field, idx) => (
                        <SkillRow
                          key={field.id}
                          idx={idx}
                          register={register}
                          control={control}
                          errors={errors}
                          onRemove={() => skillsArray.remove(idx)}
                        />
                      ))}
                      <AddRow
                        label="Add skill"
                        onClick={() => skillsArray.append({ name: "", proficiency: "beginner" })}
                      />
                      {errors.skills && !Array.isArray(errors.skills) && (
                        <p className="text-xs text-destructive">{errors.skills.message}</p>
                      )}
                    </div>
                  </SectionCard>
                </div>

                {/* ---------- LANGUAGES & ACCENTS ---------- */}
                <div id="languages" className="scroll-mt-[120px] lg:scroll-mt-28">
                  <SectionCard
                    icon={Languages}
                    label="Languages"
                    description="Languages and accents"
                    isPublic={form.watch("section_visibility.languages") ?? true}
                    onToggle={() => {
                      const current = form.getValues("section_visibility.languages") ?? true;
                      form.setValue("section_visibility.languages", !current, { shouldDirty: true });
                    }}
                  >
                    <div className="space-y-2">
                      {languagesArray.fields.map((field, idx) => (
                        <LanguageRow
                          key={field.id}
                          idx={idx}
                          register={register}
                          control={control}
                          errors={errors}
                          onRemove={() => languagesArray.remove(idx)}
                        />
                      ))}
                      <AddRow
                        label="Add language"
                        onClick={() => languagesArray.append({ name: "", fluency: "basic" })}
                      />
                      {errors.languages && !Array.isArray(errors.languages) && (
                        <p className="text-xs text-destructive">{errors.languages.message}</p>
                      )}
                    </div>

                    <div className="mt-4 pt-4 border-t border-border/60">
                      <FormField
                        control={control}
                        name="accents"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-[13px] font-medium">Accents</FormLabel>
                            <TagInput
                              value={field.value ?? []}
                              onChange={field.onChange}
                              placeholder="Add accent…"
                              containerClassName="[&>div]:rounded-xl [&>div]:border-border [&>div]:focus-within:border-gold/50 [&>div]:focus-within:ring-2 [&>div]:focus-within:ring-gold/25 [&>div]:bg-cream-pale/80"
                            />
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </SectionCard>
                </div>

                {/* ---------- PHYSICAL ---------- */}
                <div id="physical" className="scroll-mt-[120px] lg:scroll-mt-28">
                  <SectionCard
                    icon={ScanLine}
                    label="Looks"
                    description="Physical attributes"
                    isPublic={form.watch("section_visibility.physical_attributes") ?? true}
                    onToggle={() => {
                      const current = form.getValues("section_visibility.physical_attributes") ?? true;
                      form.setValue("section_visibility.physical_attributes", !current, { shouldDirty: true });
                    }}
                  >
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    <FormField
                      control={control}
                      name="physical_attributes.height_cm"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-[13px] font-medium">Height (cm)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              {...field}
                              value={field.value ?? ""}
                              onChange={(e) => field.onChange(e.target.value === "" ? undefined : Number(e.target.value))}
                              className="h-10 text-sm rounded-xl border-border bg-cream-pale/80 focus:border-gold/50 focus:bg-card focus:ring-2 focus:ring-gold/25 transition-all"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={control}
                      name="physical_attributes.weight_kg"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-[13px] font-medium">Weight (kg)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              {...field}
                              value={field.value ?? ""}
                              onChange={(e) => field.onChange(e.target.value === "" ? undefined : Number(e.target.value))}
                              className="h-10 text-sm rounded-xl border-border bg-cream-pale/80 focus:border-gold/50 focus:bg-card focus:ring-2 focus:ring-gold/25 transition-all"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={control}
                      name="physical_attributes.body_type"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-[13px] font-medium">Body type</FormLabel>
                          <Select onValueChange={(v) => field.onChange(v || undefined)} value={field.value || ""}>
                            <FormControl>
                              <SelectTrigger className="h-10 text-sm rounded-xl border-border bg-cream-pale/80 shadow-none">
                                <SelectValue placeholder="Select…" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {dynamicOptions(field.value, BODY_TYPES).map((opt) => (
                                <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={control}
                      name="physical_attributes.complexion"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-[13px] font-medium">Complexion</FormLabel>
                          <Select onValueChange={(v) => field.onChange(v || undefined)} value={field.value || ""}>
                            <FormControl>
                              <SelectTrigger className="h-10 text-sm rounded-xl border-border bg-cream-pale/80 shadow-none">
                                <SelectValue placeholder="Select…" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {dynamicOptions(field.value, COMPLEXIONS).map((opt) => (
                                <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={control}
                      name="physical_attributes.hair_color"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-[13px] font-medium">Hair color</FormLabel>
                          <Select onValueChange={(v) => field.onChange(v || undefined)} value={field.value || ""}>
                            <FormControl>
                              <SelectTrigger className="h-10 text-sm rounded-xl border-border bg-cream-pale/80 shadow-none">
                                <SelectValue placeholder="Select…" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {dynamicOptions(field.value, HAIR_COLORS).map((opt) => (
                                <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={control}
                      name="physical_attributes.hair_length"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-[13px] font-medium">Hair length</FormLabel>
                          <Select onValueChange={(v) => field.onChange(v || undefined)} value={field.value || ""}>
                            <FormControl>
                              <SelectTrigger className="h-10 text-sm rounded-xl border-border bg-cream-pale/80 shadow-none">
                                <SelectValue placeholder="Select…" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {dynamicOptions(field.value, HAIR_LENGTHS).map((opt) => (
                                <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={control}
                      name="physical_attributes.eye_color"
                      render={({ field }) => (
                        <FormItem className="lg:col-span-2">
                          <FormLabel className="text-[13px] font-medium">Eye color</FormLabel>
                          <Select onValueChange={(v) => field.onChange(v || undefined)} value={field.value || ""}>
                            <FormControl>
                              <SelectTrigger className="h-10 text-sm rounded-xl border-border bg-cream-pale/80 max-w-xs shadow-none">
                                <SelectValue placeholder="Select…" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {dynamicOptions(field.value, EYE_COLORS).map((opt) => (
                                <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={control}
                      name="physical_attributes.distinctive_features"
                      render={({ field }) => (
                        <FormItem className="md:col-span-2 lg:col-span-3">
                          <FormLabel className="text-[13px] font-medium">Distinctive features</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              value={field.value ?? ""}
                              placeholder="e.g. birthmark, scar, tattoo"
                              className="h-10 text-sm rounded-xl border-border bg-cream-pale/80 focus:border-gold/50 focus:bg-card focus:ring-2 focus:ring-gold/25 transition-all"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </SectionCard>
              </div>

              {/* ---------- DOCUMENTS ---------- */}
              <div id="documents" className="scroll-mt-[120px] lg:scroll-mt-28">
                <SectionCard
                  icon={FileText}
                  label="Documents"
                  description="Résumé, portfolio & sheets"
                  isPublic={form.watch("section_visibility.documents") ?? true}
                  onToggle={() => {
                    const current = form.getValues("section_visibility.documents") ?? true;
                    form.setValue("section_visibility.documents", !current, { shouldDirty: true });
                  }}
                >
                    <FormField
                      control={control}
                      name="documents.resume_url"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <div>
                              <input
                                type="file"
                                accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                                className="hidden"
                                ref={resumeInputRef}
                                onChange={handleResumeChange}
                              />
                              <Card className="rounded-[14px] border-dashed border-gold/40 p-0 gap-0">
                                <CardContent className="flex items-center justify-between p-4">
                                <div className="flex items-center gap-3 min-w-0">
                                  <div className="w-10 h-10 rounded-xl flex items-center justify-center border border-gold/30 bg-gold-soft">
                                    <FileText className="w-5 h-5 text-gold" strokeWidth={2} />
                                  </div>
                                  <div className="min-w-0">
                                    <p className="text-[13px] font-medium truncate text-ink">
                                      {resumePreview ? (resumeName || "Resume") : "No resume uploaded"}
                                    </p>
                                    <p className="text-[11px] text-ink-muted">
                                      PDF, DOC, or DOCX. Max 10MB.
                                    </p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2 shrink-0">
                                  <button
                                    type="button"
                                    onClick={() => resumeInputRef.current?.click()}
                                    disabled={resumeUploading}
                                    className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-[7px] rounded-lg border border-border bg-cream text-ink transition-colors"
                                  >
                                    {resumeUploading && <Loader2 className="w-3 h-3 animate-spin" />}
                                    <Upload className="w-3.5 h-3.5" strokeWidth={2} />
                                    {resumePreview ? "Change" : "Upload"}
                                  </button>
                                  {resumePreview && (
                                    <button
                                      type="button"
                                      onClick={handleResumeClear}
                                      disabled={resumeUploading}
                                      className="text-xs text-destructive px-2"
                                    >
                                      Remove
                                    </button>
                                  )}
                                </div>
                                </CardContent>
                              </Card>
                              <input type="hidden" {...field} value={field.value ?? ''} />
                            </div>
                          </FormControl>
                          {resumeError && <p className="text-xs text-destructive mt-1">{resumeError}</p>}
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                </SectionCard>
              </div>

              {/* ---------- SOCIAL ---------- */}
              <div id="social" className="scroll-mt-[120px] lg:scroll-mt-28">
                <SectionCard
                  icon={Share2}
                  label="Social links"
                  description="Instagram, YouTube, LinkedIn"
                  isPublic={form.watch("section_visibility.social_links") ?? true}
                  onToggle={() => {
                    const current = form.getValues("section_visibility.social_links") ?? true;
                    form.setValue("section_visibility.social_links", !current, { shouldDirty: true });
                  }}
                >
                  <div className="overflow-hidden rounded-2xl border border-border/60">
                      {(["instagram", "youtube", "linkedin"] as const).map((platform) => (
                        <div
                          key={platform}
                          className="flex items-center gap-2.5 px-4 py-3 border-b border-border/60 last:border-b-0"
                        >
                          <SocialIcon platform={platform} />
                          <FormField
                            control={control}
                            name={`social_links.${platform}.url`}
                            render={({ field }) => (
                              <FormItem className="flex-1 min-w-0 mb-0">
                                <FormControl>
                                  <input
                                    {...field}
                                    value={field.value ?? ""}
                                    placeholder={`${platform.charAt(0).toUpperCase() + platform.slice(1)} URL`}
                                    className="w-full bg-transparent text-[13px] outline-none placeholder:text-ink-muted text-ink"
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={control}
                            name={`social_links.${platform}.visibility`}
                            render={({ field }) => (
                              <FormItem className="shrink-0 mb-0">
                                <Select onValueChange={(v) => field.onChange(v || undefined)} value={field.value || ""}>
                                  <SelectTrigger className="h-7 w-[110px] text-[11px] rounded-md border-border shadow-none">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {VISIBILITIES.map((opt) => (
                                      <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      ))}
                    </div>
                  </SectionCard>
                </div>

                {/* ---------- PRIVACY ---------- */}
                <div id="privacy" className="scroll-mt-[120px] lg:scroll-mt-28">
                  <SectionCard icon={Shield} label="Privacy" description="Control who sees your profile" alwaysPublic>
                    <div className="max-w-xs">
                      <FormField
                        control={control}
                        name="privacy_mode"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-[13px] font-medium">Profile visibility</FormLabel>
                            <Select onValueChange={(v) => field.onChange(v || undefined)} value={field.value || ""}>
                              <FormControl>
                                <SelectTrigger className="h-10 text-sm rounded-xl border-border bg-cream-pale/80 shadow-none">
                                  <SelectValue placeholder="Select…" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {PRIVACY_MODE_OPTIONS.map((opt) => (
                                  <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </SectionCard>
                </div>
              </form>
            </Form>
          </div>
        </div>
      </div>

      {/* ---------- STICKY SAVE BAR ---------- */}
      <div className="fixed bottom-0 inset-x-0 z-30 px-4 pb-4 pt-3 bg-gradient-to-t from-cream-pale via-cream-pale/95 to-transparent">
        <Card className="max-w-3xl mx-auto rounded-2xl border-border/50 shadow-luxe-lg p-0 gap-0 backdrop-blur-sm">
          <CardContent className="p-2.5 flex items-center gap-2">
          {mode === "edit" && (
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isSubmitting}
              className="h-11 px-4 rounded-xl bg-cream border-border/60 text-ink-soft text-[13px] font-medium hover:bg-cream-hover transition-colors"
            >
              Cancel
            </Button>
          )}
          <Button
            type="submit"
            form="profile-form"
            disabled={mode === "edit" && !isDirty && !isSubmitting}
            className={cn(
              "flex-1 h-11 rounded-xl text-white font-semibold text-[13px] flex items-center justify-center gap-2 transition-all duration-200",
              "bg-gradient-to-b from-gold to-gold-dark",
              "shadow-[0_8px_24px_-10px_var(--color-gold-dark)]",
              "hover:shadow-[0_12px_28px_-10px_var(--color-gold-dark)]",
              "hover:from-gold-hover hover:to-gold-dark",
              "active:scale-[0.98]",
              "disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:from-gold disabled:hover:to-gold-dark",
            )}
          >
            {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
            <Save className="h-4 w-4" strokeWidth={2} />
            {mode === "create" ? "Create profile" : "Save changes"}
          </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
