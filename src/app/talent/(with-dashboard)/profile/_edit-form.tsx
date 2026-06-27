"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useForm, useFieldArray, Controller, useWatch, Control, UseFormRegister, FieldErrors } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import {
  Plus,
  Trash2,
  Pencil,
  X,
  Loader2,
  Upload,
  FileText,
  User,
  MapPin,
  Briefcase,
  Zap,
  Languages,
  Mic,
  ScanLine,
  Share2,
  Shield,
  Eye,
  EyeOff,
  Save,
  Sparkles,
  Camera,
  Check,
  ChevronRight,
  ArrowLeft,
} from "lucide-react";
import { usePopup } from "@/hooks/use-popup";
import { Avatar } from "@/components/ui/avatar";
import { Switch } from "@/components/ui/switch";
import { AxiosError } from "axios";

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
/*  Theme helpers                                                      */
/* ------------------------------------------------------------------ */

const gold = {
  primary: "var(--color-gold)",
  primaryHover: "var(--color-gold-hover)",
  accent: "var(--color-gold-soft)",
  accentBorder: "var(--color-gold)",
  border: "var(--color-border)",
  muted: "var(--color-cream)",
  mutedFg: "var(--color-ink-muted)",
  textSecondary: "var(--color-ink-soft)",
  foreground: "var(--color-ink)",
  background: "var(--color-cream-pale)",
  card: "var(--color-card)",
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
      <span
        className="text-[10px] font-bold tracking-[0.12em] uppercase whitespace-nowrap"
        style={{ color: gold.primary }}
      >
        {label}
      </span>
      <div className="flex-1 h-px" style={{ background: gold.border }} />
    </div>
  );
}

function FormCard({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <Card className={cn("rounded-2xl p-4 gap-3 border-border", className)}>
      <CardContent className="p-0 flex flex-col gap-3">
        {children}
      </CardContent>
    </Card>
  );
}

function SectionToggle({
  control,
  sectionKey,
}: {
  control: Control<CreateTalentProfileInput>;
  sectionKey: keyof NonNullable<CreateTalentProfileInput["section_visibility"]>;
}) {
  return (
    <Controller
      control={control}
      name={`section_visibility.${sectionKey}`}
      render={({ field }) => (
        <div className="flex items-center gap-2">
          <span className="text-xs hidden sm:inline" style={{ color: gold.mutedFg }}>
            Show
          </span>
          <Switch checked={field.value ?? true} onCheckedChange={field.onChange} />
        </div>
      )}
    />
  );
}

function TopBar({ mode, onSave, isSubmitting, isDirty, username }: {
  mode: "create" | "edit";
  onSave: () => void;
  isSubmitting: boolean;
  isDirty: boolean;
  username?: string;
}) {
  const router = useRouter();
  return (
    <header className="sticky top-0 z-40 backdrop-blur-xl bg-background/80 border-b border-border/60">
      <div className="flex items-center justify-between px-5 py-3.5">
        <button
          type="button"
          onClick={() => router.push("/talent/dashboard")}
          className="flex items-center gap-2 text-ink"
        >
          <ArrowLeft className="h-4 w-4 text-gold" />
          <span className="font-serif text-[15px] font-semibold tracking-tight">
            {mode === "create" ? "Create profile" : "Edit profile"}
          </span>
        </button>
        <div className="flex items-center gap-2">
          {mode === "edit" && username && (
            <button
              type="button"
              onClick={() => router.push(`/talent/${username}`)}
              className="flex items-center gap-1.5 text-[12px] font-medium px-3 py-1.5 rounded-full border border-gold/30 bg-gold-soft text-gold-ink transition-colors"
            >
              <Eye className="h-3.5 w-3.5" />
              Preview
            </button>
          )}
          <Button
            type="button"
            onClick={onSave}
            disabled={mode === "edit" && !isDirty}
            className="h-8 px-4 text-[13px] text-white rounded-xl"
            style={{ background: gold.primary }}
          >
            {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" />}
            {mode === "create" ? "Create" : "Save"}
          </Button>
        </div>
      </div>
    </header>
  );
}

function SectionNav({
  activeId,
  onSelect,
  username,
}: {
  activeId: string;
  onSelect: (id: string) => void;
  username?: string;
}) {
  const items = [
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

  return (
    <aside
      className="hidden lg:block w-[190px] shrink-0 border-r"
      style={{ borderColor: gold.border }}
    >
      <div className="sticky top-[57px] pt-4 pb-4">
        <div className="px-4 pb-3 border-b mb-2" style={{ borderColor: gold.border }}>
          <div className="text-[15px] font-medium" style={{ color: gold.foreground }}>
            Connect<span style={{ color: gold.primary }}>Me</span>
          </div>
          {username && (
            <div className="text-xs mt-0.5" style={{ color: gold.mutedFg }}>
              @{username}
            </div>
          )}
        </div>
        <div className="space-y-0.5">
          {items.map((item) => {
            const Icon = item.icon;
            const active = activeId === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelect(item.id)}
                className={cn(
                  "w-full flex items-center gap-2.5 px-4 py-[7px] text-[13px] transition-colors border-l-2"
                )}
                style={{
                  color: active ? gold.primary : gold.mutedFg,
                  background: active ? gold.accent : "transparent",
                  borderLeftColor: active ? gold.primary : "transparent",
                }}
              >
                <Icon className="w-[15px] h-[15px]" strokeWidth={1.5} />
                {item.label}
              </button>
            );
          })}
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
  const items = [
    { id: "identity", label: "Identity" },
    { id: "location", label: "Location" },
    { id: "career", label: "Career" },
    { id: "skills", label: "Skills" },
    { id: "languages", label: "Lang" },
    { id: "physical", label: "Body" },
    { id: "documents", label: "Docs" },
    { id: "social", label: "Social" },
    { id: "privacy", label: "Privacy" },
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
      className="lg:hidden sticky top-[53px] z-30 px-4 py-2 border-b"
      style={{ background: "var(--color-cream-pale)/95", backdropFilter: "blur(8px)", borderColor: gold.border }}
    >
      <div
        ref={scrollRef}
        className="flex gap-2 overflow-x-auto pb-0.5"
        style={{ scrollbarWidth: "none" }}
      >
        {items.map((item) => {
          const active = activeId === item.id;
          return (
            <button
              key={item.id}
              type="button"
              data-nav-id={item.id}
              onClick={() => onSelect(item.id)}
              className={cn(
                "shrink-0 px-3 py-1.5 min-h-8 rounded-lg text-xs font-medium transition-colors border inline-flex items-center justify-center"
              )}
              style={{
                background: active ? gold.accent : gold.card,
                color: active ? gold.primary : gold.mutedFg,
                borderColor: active ? gold.accentBorder : gold.border,
              }}
            >
              {item.label}
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
  return (
    <div
      className="flex items-center gap-2.5 rounded-xl border p-3"
      style={{ background: gold.card, borderColor: gold.border }}
    >
      <input
        placeholder="Skill name"
        {...register(`skills.${idx}.name`)}
        aria-invalid={!!errors.skills?.[idx]?.name}
        className="flex-1 min-w-0 bg-transparent text-sm font-medium outline-none placeholder:text-ink-muted"
        style={{ color: gold.foreground }}
      />
      <Controller
        control={control}
        name={`skills.${idx}.proficiency`}
        render={({ field }) => (
          <Select onValueChange={field.onChange} value={field.value || ""}>
            <SelectTrigger className="h-8 w-[120px] text-xs rounded-lg border-border">
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
        className="w-7 h-7 flex items-center justify-center rounded-lg border transition-colors hover:text-destructive"
        style={{ background: gold.background, borderColor: gold.border, color: gold.mutedFg }}
        aria-label="Remove skill"
      >
        <Trash2 className="w-3.5 h-3.5" strokeWidth={1.5} />
      </button>
    </div>
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
  return (
    <div
      className="flex items-center gap-2.5 rounded-xl border p-3"
      style={{ background: gold.card, borderColor: gold.border }}
    >
      <input
        placeholder="Language name"
        {...register(`languages.${idx}.name`)}
        aria-invalid={!!errors.languages?.[idx]?.name}
        className="flex-1 min-w-0 bg-transparent text-sm font-medium outline-none placeholder:text-ink-muted"
        style={{ color: gold.foreground }}
      />
      <Controller
        control={control}
        name={`languages.${idx}.fluency`}
        render={({ field }) => (
          <Select onValueChange={field.onChange} value={field.value || ""}>
            <SelectTrigger className="h-8 w-[120px] text-xs rounded-lg border-border">
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
        className="w-7 h-7 flex items-center justify-center rounded-lg border transition-colors hover:text-destructive"
        style={{ background: gold.background, borderColor: gold.border, color: gold.mutedFg }}
        aria-label="Remove language"
      >
        <Trash2 className="w-3.5 h-3.5" strokeWidth={1.5} />
      </button>
    </div>
  );
}

function SocialIcon({ platform }: { platform: "instagram" | "youtube" | "linkedin" }) {
  if (platform === "instagram") {
    return (
      <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: "var(--color-pink-light)" }}>
        <svg viewBox="0 0 24 24" fill="none" stroke="var(--color-pink)" strokeWidth="2" className="w-4 h-4">
          <rect x="2" y="2" width="20" height="20" rx="5" />
          <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
          <circle cx="17.5" cy="6.5" r="1" fill="var(--color-pink)" stroke="none" />
        </svg>
      </div>
    );
  }
  if (platform === "youtube") {
    return (
      <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: "var(--color-red-light)" }}>
        <svg viewBox="0 0 24 24" fill="var(--color-red)" className="w-4 h-4">
          <path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46a2.78 2.78 0 0 0-1.95 1.96A29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58A2.78 2.78 0 0 0 3.41 19.54C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.95-1.96A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z" />
          <polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02" fill="white" />
        </svg>
      </div>
    );
  }
  return (
    <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: "var(--color-blue-light)" }}>
      <svg viewBox="0 0 24 24" fill="var(--color-blue)" className="w-4 h-4">
        <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
        <rect x="2" y="9" width="4" height="12" />
        <circle cx="4" cy="4" r="2" />
      </svg>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  New design components (match samplefrontend)                       */
/* ------------------------------------------------------------------ */

function CompletionBanner({ control }: { control: Control<CreateTalentProfileInput> }) {
  const sectionVisibility = useWatch({ control, name: "section_visibility" });
  const controllable = [
    "skills",
    "languages",
    "accents",
    "physical_attributes",
    "documents",
    "social_links",
    "location",
    "availability",
  ] as const;
  const publicCount = controllable.filter((k) => sectionVisibility?.[k] ?? true).length;
  const totalCount = controllable.length;
  const pct = Math.round((publicCount / totalCount) * 100);

  return (
    <section className="px-4 pt-5">
      <Card className="relative overflow-hidden rounded-[24px] shadow-luxe border-border/60 p-0 gap-0">
        <div
          className="absolute inset-0 opacity-90"
          style={{
            background:
              "radial-gradient(120% 80% at 0% 0%, oklch(0.74 0.13 80 / 0.12) 0%, transparent 55%), radial-gradient(120% 80% at 100% 100%, oklch(0.74 0.13 80 / 0.10) 0%, transparent 50%)",
          }}
        />
        <CardContent className="relative px-5 py-4 flex items-center gap-4">
          <div className="h-12 w-12 rounded-2xl bg-gold-soft border border-gold/30 grid place-items-center">
            <Sparkles className="h-5 w-5 text-gold-ink" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] uppercase tracking-[0.14em] text-ink-muted">Public profile</p>
            <p className="font-serif text-[16px] text-ink leading-tight mt-0.5">
              {publicCount} of {totalCount} sections visible
            </p>
          </div>
          <div className="text-right">
            <div className="text-[11px] text-ink-muted">Completion</div>
            <div className="font-serif text-[18px] text-gold leading-none mt-0.5">{pct}%</div>
          </div>
        </CardContent>
        <div className="relative h-1.5 bg-cream-deep/60">
          <div
            className="h-full bg-gradient-to-r from-gold to-gold/60 transition-all"
            style={{ width: `${pct}%` }}
          />
        </div>
      </Card>
    </section>
  );
}

function VisibilityToggle({
  isPublic,
  onToggle,
}: {
  isPublic: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={isPublic}
      onClick={onToggle}
      className={`group flex items-center gap-2 rounded-full pl-2.5 pr-1 py-1 border transition-colors ${
        isPublic
          ? "bg-gold-soft border-gold/30 text-gold-ink"
          : "bg-cream border-border text-ink-muted"
      }`}
    >
      <span className="flex items-center gap-1 text-[10.5px] font-medium uppercase tracking-[0.1em]">
        {isPublic ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
        {isPublic ? "Public" : "Hidden"}
      </span>
      <span
        className={`relative h-5 w-9 rounded-full transition-colors ${
          isPublic ? "bg-gold" : "bg-ink-muted/40"
        }`}
      >
        <span
          className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-all ${
            isPublic ? "left-[18px]" : "left-0.5"
          }`}
        />
      </span>
    </button>
  );
}

function SectionCard({
  icon: Icon,
  label,
  description,
  isPublic,
  onToggle,
  alwaysPublic,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  description: string;
  isPublic?: boolean;
  onToggle?: () => void;
  alwaysPublic?: boolean;
  children: React.ReactNode;
}) {
  return (
    <Card className="rounded-2xl border-border/60 shadow-luxe overflow-hidden p-0 gap-0">
      <CardHeader className="px-5 pt-4 pb-3 flex-row items-start gap-3">
        <div className="h-10 w-10 rounded-xl bg-gold-soft border border-gold/20 grid place-items-center shrink-0">
          <Icon className="h-4 w-4 text-gold-ink" />
        </div>
        <div className="flex-1 min-w-0">
          <CardTitle className="font-serif text-[16px] text-ink leading-tight">{label}</CardTitle>
          <CardDescription className="text-[11.5px] text-ink-muted mt-0.5">{description}</CardDescription>
        </div>
        {alwaysPublic ? (
          <span className="flex items-center gap-1.5 text-[10.5px] font-medium uppercase tracking-[0.1em] text-gold-ink bg-gold-soft border border-gold/30 rounded-full pl-2.5 pr-3 py-1">
            <Eye className="h-3 w-3" />
            Always public
          </span>
        ) : (
          <VisibilityToggle isPublic={isPublic!} onToggle={onToggle!} />
        )}
      </CardHeader>
      <div className="h-px bg-border/60 mx-5" />
      <CardContent className="px-5 py-4">{children}</CardContent>
    </Card>
  );
}

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

function Row({
  title,
  meta,
  trailing,
}: {
  title: string;
  meta?: string;
  trailing?: React.ReactNode;
}) {
  return (
    <button type="button" className="w-full flex items-center justify-between rounded-xl bg-cream/60 border border-border/60 px-3.5 py-2.5 text-left active:scale-[0.99] transition">
      <div className="min-w-0">
        <div className="text-[13.5px] text-ink font-medium truncate">{title}</div>
        {meta && <div className="text-[11px] text-gold mt-0.5">{meta}</div>}
      </div>
      {trailing ?? <ChevronRight className="h-4 w-4 text-ink-muted" />}
    </button>
  );
}

function AddRow({ label, onClick }: { label: string; onClick?: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full flex items-center justify-center gap-2 rounded-xl border border-dashed border-gold/40 bg-gold-soft/40 px-3.5 py-2.5 text-[12.5px] font-medium text-gold-ink hover:bg-gold-soft transition"
    >
      + {label}
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
      style={{ background: gold.background }}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Top bar + mobile nav inside main content area */}
      <div className="flex-1 min-w-0">
        <TopBar mode={mode} onSave={triggerSave} isSubmitting={isSubmitting} isDirty={isDirty} username={watchedUsername || profile?.username} />

        {mode === "edit" && <CompletionBanner control={control} />}

        <div className="flex">
          <SectionNav activeId={activeSection} onSelect={scrollTo} username={watchedUsername || profile?.username} />

          <div className="flex-1 min-w-0">
            <MobileNav activeId={activeSection} onSelect={scrollTo} />

            <div className="px-4 pt-4 lg:px-8 lg:pt-6 max-w-5xl mx-auto">
              <p
                className="text-sm mb-6"
                style={{ color: gold.textSecondary }}
              >
                {mode === "create"
                  ? "Pick a username to get started. You can fill the rest later."
                  : "Keep your profile up to date so recruiters can find you."}
              </p>
            </div>

            {mode === "create" && (
              <div className="px-4 mb-6 lg:px-8 max-w-5xl mx-auto">
                <p className="text-xs sm:text-sm mb-3 px-1" style={{ color: gold.mutedFg }}>
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
                {/* ---------- BASIC INFO ---------- */}
                <div id="identity" className="scroll-mt-[120px] lg:scroll-mt-28">
                  <SectionCard icon={User} label="Basic info" description="Name, role, location and bio" alwaysPublic>
                    <div className="flex items-center gap-4 mb-4">
                      <div className="relative">
                        <div
                          className="h-16 w-16 rounded-2xl flex items-center justify-center text-3xl font-bold text-white shrink-0"
                          style={{
                            background: photoPreview ? undefined : "linear-gradient(135deg, var(--color-gold), var(--color-gold-dark))",
                          }}
                        >
                          {photoPreview ? (
                            <img src={photoPreview} alt="" className="w-full h-full rounded-2xl object-cover" />
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
                          className="absolute -bottom-1 -right-1 h-7 w-7 rounded-full bg-gold grid place-items-center shadow-md ring-4 ring-card"
                        >
                          <Camera className="h-3.5 w-3.5 text-white" />
                        </button>
                      </div>
                      <div className="flex flex-col gap-1">
                        <span className="text-[12px] text-ink-muted">Tap the camera to update your photo.</span>
                        {photoPreview && (
                          <button
                            type="button"
                            onClick={handlePhotoClear}
                            className="text-xs text-left text-destructive"
                          >
                            Remove
                          </button>
                        )}
                        {photoError && <p className="text-xs text-destructive">{photoError}</p>}
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
                                className="h-10 text-sm rounded-xl border-border bg-cream/60 focus:border-gold/50 focus:bg-card transition"
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
                                  className="h-10 text-sm rounded-xl border-border bg-cream/60 focus:border-gold/50 focus:bg-card transition"
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
                                  className="h-10 text-sm rounded-xl border-border bg-cream/60 focus:border-gold/50 focus:bg-card transition"
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
                                  <SelectTrigger className="h-10 text-sm rounded-xl border-border bg-cream/60">
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
                                  className="h-10 text-sm rounded-xl border-border bg-cream/60 focus:border-gold/50 focus:bg-card transition"
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
                                className="text-sm rounded-xl border-border bg-cream/60 focus:border-gold/50 focus:bg-card transition resize-none"
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
                                className="h-10 text-sm rounded-xl border-border bg-cream/60 focus:border-gold/50 focus:bg-card transition"
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
                                  className="h-10 text-sm rounded-xl border-border bg-cream/60 focus:border-gold/50 focus:bg-card transition"
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
                                  className="h-10 text-sm rounded-xl border-border bg-cream/60 focus:border-gold/50 focus:bg-card transition"
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
                              containerClassName="[&>div]:rounded-xl [&>div]:border-border [&>div]:focus-within:border-gold/50 [&>div]:bg-cream/60"
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
                              containerClassName="[&>div]:rounded-xl [&>div]:border-border [&>div]:focus-within:border-gold/50 [&>div]:bg-cream/60"
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
                                <SelectTrigger className="h-10 text-sm rounded-xl border-border bg-cream/60">
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
                              containerClassName="[&>div]:rounded-xl [&>div]:border-border [&>div]:focus-within:border-gold/50 [&>div]:bg-cream/60"
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
                              className="h-10 text-sm rounded-xl border-border bg-cream/60 focus:border-gold/50 focus:bg-card transition"
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
                              className="h-10 text-sm rounded-xl border-border bg-cream/60 focus:border-gold/50 focus:bg-card transition"
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
                              <SelectTrigger className="h-10 text-sm rounded-xl border-border bg-cream/60">
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
                              <SelectTrigger className="h-10 text-sm rounded-xl border-border bg-cream/60">
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
                              <SelectTrigger className="h-10 text-sm rounded-xl border-border bg-cream/60">
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
                              <SelectTrigger className="h-10 text-sm rounded-xl border-border bg-cream/60">
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
                              <SelectTrigger className="h-10 text-sm rounded-xl border-border bg-cream/60 max-w-xs">
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
                              className="h-10 text-sm rounded-xl border-border bg-cream/60 focus:border-gold/50 focus:bg-card transition"
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
                                  <SelectTrigger className="h-7 w-[110px] text-[11px] rounded-md border-border">
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
                                <SelectTrigger className="h-10 text-sm rounded-xl border-border bg-cream/60">
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
      <div className="fixed bottom-0 inset-x-0 z-30 px-4 pb-4 pt-3 bg-gradient-to-t from-background via-background/95 to-background/0">
        <Card className="max-w-3xl mx-auto rounded-2xl border-border/60 shadow-luxe-lg p-0 gap-0">
          <CardContent className="p-2.5 flex items-center gap-2">
          {mode === "edit" && (
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isSubmitting}
              className="h-11 px-4 rounded-xl bg-cream border-border text-ink-soft text-[13px] font-medium"
            >
              Cancel
            </Button>
          )}
          <Button
            type="submit"
            form="profile-form"
            disabled={mode === "edit" && !isDirty}
            className="flex-1 h-11 rounded-xl bg-gradient-to-b from-gold to-gold/80 text-white font-medium text-[13px] flex items-center justify-center gap-2 shadow-[0_8px_24px_-10px_oklch(0.74_0.13_80/0.7)]"
          >
            {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
            <Save className="h-4 w-4" />
            {mode === "create" ? "Create profile" : "Save changes"}
          </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
