"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useForm, useFieldArray, Controller, useWatch, Control } from "react-hook-form";
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
} from "lucide-react";
import { usePopup } from "@/hooks/use-popup";
import { Avatar } from "@/components/ui/avatar";
import { Switch } from "@/components/ui/switch";
import { AxiosError } from "axios";

import { Button } from "@/components/ui/button";
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
  "accents",
  "physical",
  "documents",
  "social",
  "privacy",
];

/* ------------------------------------------------------------------ */
/*  Theme helpers                                                      */
/* ------------------------------------------------------------------ */

const gold = {
  primary: "#c8a040",
  primaryHover: "#a8841e",
  accent: "#fdf3dc",
  accentBorder: "#e8c87a",
  border: "#e0d9ce",
  muted: "#ede9e0",
  mutedFg: "#8a7d6b",
  textSecondary: "#5c5145",
  foreground: "#1e1a14",
  background: "#f8f6f2",
  card: "#ffffff",
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
    <div
      className={cn("rounded-[14px] border p-4 flex flex-col gap-3", className)}
      style={{ background: gold.card, borderColor: gold.border }}
    >
      {children}
    </div>
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

function TopBar({ mode, onSave, isSubmitting, isDirty }: {
  mode: "create" | "edit";
  onSave: () => void;
  isSubmitting: boolean;
  isDirty: boolean;
}) {
  const router = useRouter();
  return (
    <div
      className="sticky top-0 z-40 flex items-center justify-between px-4 py-3 border-b"
      style={{ background: gold.background, borderColor: gold.border }}
    >
      <span className="text-[17px] font-semibold" style={{ color: gold.foreground }}>
        {mode === "create" ? "Create profile" : "Edit profile"}
      </span>
      <div className="flex items-center gap-2">
        {mode === "edit" && (
          <button
            type="button"
            onClick={() => router.push("/talent/profile/preview")}
            className="flex items-center gap-1.5 text-[13px] font-medium px-3 py-1.5 rounded-full border transition-colors"
            style={{
              color: gold.primary,
              background: gold.accent,
              borderColor: gold.accentBorder,
            }}
          >
            <Eye className="w-3.5 h-3.5" strokeWidth={2} />
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
    { id: "accents", label: "Accents", icon: Mic },
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
    { id: "accents", label: "Accents" },
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
      style={{ background: "rgba(248,246,242,0.95)", backdropFilter: "blur(8px)", borderColor: gold.border }}
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
  register: any;
  control: Control<CreateTalentProfileInput>;
  errors: any;
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
        className="flex-1 min-w-0 bg-transparent text-sm font-medium outline-none placeholder:text-[#8a7d6b]"
        style={{ color: gold.foreground }}
      />
      <Controller
        control={control}
        name={`skills.${idx}.proficiency`}
        render={({ field }) => (
          <Select onValueChange={field.onChange} value={field.value || ""}>
            <SelectTrigger className="h-8 w-[120px] text-xs rounded-lg border-[#e0d9ce]">
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
  register: any;
  control: Control<CreateTalentProfileInput>;
  errors: any;
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
        className="flex-1 min-w-0 bg-transparent text-sm font-medium outline-none placeholder:text-[#8a7d6b]"
        style={{ color: gold.foreground }}
      />
      <Controller
        control={control}
        name={`languages.${idx}.fluency`}
        render={({ field }) => (
          <Select onValueChange={field.onChange} value={field.value || ""}>
            <SelectTrigger className="h-8 w-[120px] text-xs rounded-lg border-[#e0d9ce]">
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
      <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: "#fce7f3" }}>
        <svg viewBox="0 0 24 24" fill="none" stroke="#db2777" strokeWidth="2" className="w-4 h-4">
          <rect x="2" y="2" width="20" height="20" rx="5" />
          <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
          <circle cx="17.5" cy="6.5" r="1" fill="#db2777" stroke="none" />
        </svg>
      </div>
    );
  }
  if (platform === "youtube") {
    return (
      <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: "#fee2e2" }}>
        <svg viewBox="0 0 24 24" fill="#ef4444" className="w-4 h-4">
          <path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46a2.78 2.78 0 0 0-1.95 1.96A29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58A2.78 2.78 0 0 0 3.41 19.54C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.95-1.96A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z" />
          <polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02" fill="white" />
        </svg>
      </div>
    );
  }
  return (
    <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: "#dbeafe" }}>
      <svg viewBox="0 0 24 24" fill="#2563eb" className="w-4 h-4">
        <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
        <rect x="2" y="9" width="4" height="12" />
        <circle cx="4" cy="4" r="2" />
      </svg>
    </div>
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
        <TopBar mode={mode} onSave={triggerSave} isSubmitting={isSubmitting} isDirty={isDirty} />

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
                {/* ---------- IDENTITY ---------- */}
                <div id="identity" className="scroll-mt-[120px] lg:scroll-mt-28">
                  <SectionDivider label="Identity" />

                  <div className="mt-4 space-y-4">
                    <FormCard>
                      <div className="flex items-center gap-4">
                        <div
                          className="w-[72px] h-[72px] rounded-full flex items-center justify-center text-[26px] font-bold text-white shrink-0 border-[3px]"
                          style={{
                            background: photoPreview ? undefined : "linear-gradient(135deg,#c8a040,#8b6914)",
                            borderColor: gold.accentBorder,
                          }}
                        >
                          {photoPreview ? (
                            <img src={photoPreview} alt="" className="w-full h-full rounded-full object-cover" />
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
                        <div className="flex flex-col gap-1.5">
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
                            className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-[7px] rounded-lg border transition-colors"
                            style={{ background: gold.background, borderColor: gold.border, color: gold.foreground }}
                          >
                            <Upload className="w-3.5 h-3.5" strokeWidth={2} />
                            {photoPreview ? "Change photo" : "Upload photo"}
                          </button>
                          <span className="text-[11px]" style={{ color: gold.mutedFg }}>
                            JPEG, PNG, or WEBP. Max 5MB.
                          </span>
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
                    </FormCard>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <FormField
                        control={control}
                        name="username"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-[13px] font-medium">Username <span style={{ color: gold.primary }}>*</span></FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                disabled={mode === "edit"}
                                placeholder="e.g. john_doe"
                                className="h-10 text-sm rounded-[10px] border-[#e0d9ce] focus:border-[#c8a040] focus:ring-[3px] focus:ring-[rgba(200,160,64,0.12)]"
                              />
                            </FormControl>
                            <FormMessage />
                            {mode === "edit" && (
                              <p className="text-[11px] mt-1" style={{ color: gold.mutedFg }}>
                                Username cannot be changed.
                              </p>
                            )}
                          </FormItem>
                        )}
                      />
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
                                className="h-10 text-sm rounded-[10px] border-[#e0d9ce] focus:border-[#c8a040] focus:ring-[3px] focus:ring-[rgba(200,160,64,0.12)]"
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
                                className="h-10 text-sm rounded-[10px] border-[#e0d9ce] focus:border-[#c8a040] focus:ring-[3px] focus:ring-[rgba(200,160,64,0.12)]"
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
                                <SelectTrigger className="h-10 text-sm rounded-[10px] border-[#e0d9ce]">
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
                          <FormItem className="md:col-span-2">
                            <FormLabel className="text-[13px] font-medium">Headline</FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                value={field.value ?? ""}
                                maxLength={120}
                                placeholder="One line that describes you"
                                className="h-10 text-sm rounded-[10px] border-[#e0d9ce] focus:border-[#c8a040] focus:ring-[3px] focus:ring-[rgba(200,160,64,0.12)]"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={control}
                        name="about"
                        render={({ field }) => (
                          <FormItem className="md:col-span-2">
                            <FormLabel className="text-[13px] font-medium">About</FormLabel>
                            <FormControl>
                              <Textarea
                                {...field}
                                value={field.value ?? ""}
                                maxLength={500}
                                rows={3}
                                placeholder="A short bio (max 500 characters)"
                                className="text-sm rounded-[10px] border-[#e0d9ce] focus:border-[#c8a040] focus:ring-[3px] focus:ring-[rgba(200,160,64,0.12)] resize-y min-h-[90px]"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                </div>

                {/* ---------- LOCATION ---------- */}
                <div id="location" className="scroll-mt-[120px] lg:scroll-mt-28">
                  <SectionDivider label="Location" />
                  <div className="mt-4 space-y-3">
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
                              className="h-10 text-sm rounded-[10px] border-[#e0d9ce] focus:border-[#c8a040] focus:ring-[3px] focus:ring-[rgba(200,160,64,0.12)]"
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
                                className="h-10 text-sm rounded-[10px] border-[#e0d9ce] focus:border-[#c8a040] focus:ring-[3px] focus:ring-[rgba(200,160,64,0.12)]"
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
                                className="h-10 text-sm rounded-[10px] border-[#e0d9ce] focus:border-[#c8a040] focus:ring-[3px] focus:ring-[rgba(200,160,64,0.12)]"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                </div>

                {/* ---------- CAREER ---------- */}
                <div id="career" className="scroll-mt-[120px] lg:scroll-mt-28">
                  <SectionDivider label="Career" />
                  <div className="mt-4 grid grid-cols-1 gap-3">
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
                            containerClassName="[&>div]:rounded-[10px] [&>div]:border-[#e0d9ce] [&>div]:focus-within:border-[#c8a040] [&>div]:focus-within:ring-[3px] [&>div]:focus-within:ring-[rgba(200,160,64,0.12)] [&>div]:bg-white"
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
                            containerClassName="[&>div]:rounded-[10px] [&>div]:border-[#e0d9ce] [&>div]:focus-within:border-[#c8a040] [&>div]:focus-within:ring-[3px] [&>div]:focus-within:ring-[rgba(200,160,64,0.12)] [&>div]:bg-white"
                          />
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={control}
                      name="availability"
                      render={({ field }) => (
                        <FormItem className="md:col-span-2 max-w-xs">
                          <FormLabel className="text-[13px] font-medium">Availability</FormLabel>
                          <Select onValueChange={(v) => field.onChange(v || undefined)} value={field.value || ""}>
                            <FormControl>
                              <SelectTrigger className="h-10 text-sm rounded-[10px] border-[#e0d9ce]">
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
                </div>

                {/* ---------- SKILLS ---------- */}
                <div id="skills" className="scroll-mt-[120px] lg:scroll-mt-28">
                  <SectionDivider label="Skills" />
                  <div className="mt-4 space-y-2">
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
                    <button
                      type="button"
                      onClick={() => skillsArray.append({ name: "", proficiency: "beginner" })}
                      className="inline-flex items-center gap-1.5 text-[13px] font-medium px-3.5 py-[7px] rounded-lg border transition-colors"
                      style={{
                        color: gold.primary,
                        borderColor: gold.primary,
                        background: gold.accent,
                      }}
                    >
                      <Plus className="w-3.5 h-3.5" strokeWidth={2.5} />
                      Add skill
                    </button>
                    {errors.skills && !Array.isArray(errors.skills) && (
                      <p className="text-xs text-destructive">{errors.skills.message}</p>
                    )}
                  </div>
                </div>

                {/* ---------- LANGUAGES ---------- */}
                <div id="languages" className="scroll-mt-[120px] lg:scroll-mt-28">
                  <SectionDivider label="Languages" />
                  <div className="mt-4 space-y-2">
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
                    <button
                      type="button"
                      onClick={() => languagesArray.append({ name: "", fluency: "" })}
                      className="inline-flex items-center gap-1.5 text-[13px] font-medium px-3.5 py-[7px] rounded-lg border transition-colors"
                      style={{
                        color: gold.primary,
                        borderColor: gold.primary,
                        background: gold.accent,
                      }}
                    >
                      <Plus className="w-3.5 h-3.5" strokeWidth={2.5} />
                      Add language
                    </button>
                    {errors.languages && !Array.isArray(errors.languages) && (
                      <p className="text-xs text-destructive">{errors.languages.message}</p>
                    )}
                  </div>
                </div>

                {/* ---------- ACCENTS ---------- */}
                <div id="accents" className="scroll-mt-[120px] lg:scroll-mt-28">
                  <SectionDivider label="Accents" />
                  <div className="mt-4">
                    <FormField
                      control={control}
                      name="accents"
                      render={({ field }) => (
                        <FormItem>
                          <TagInput
                            value={field.value ?? []}
                            onChange={field.onChange}
                            placeholder="Add accent…"
                            containerClassName="[&>div]:rounded-[10px] [&>div]:border-[#e0d9ce] [&>div]:focus-within:border-[#c8a040] [&>div]:focus-within:ring-[3px] [&>div]:focus-within:ring-[rgba(200,160,64,0.12)] [&>div]:bg-white"
                          />
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* ---------- PHYSICAL ---------- */}
                <div id="physical" className="scroll-mt-[120px] lg:scroll-mt-28">
                  <SectionDivider label="Physical Attributes" />
                  <div className="mt-4 grid grid-cols-3 gap-3">
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
                              className="h-10 text-sm rounded-[10px] border-[#e0d9ce] focus:border-[#c8a040] focus:ring-[3px] focus:ring-[rgba(200,160,64,0.12)]"
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
                              className="h-10 text-sm rounded-[10px] border-[#e0d9ce] focus:border-[#c8a040] focus:ring-[3px] focus:ring-[rgba(200,160,64,0.12)]"
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
                              <SelectTrigger className="h-10 text-sm rounded-[10px] border-[#e0d9ce]">
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
                              <SelectTrigger className="h-10 text-sm rounded-[10px] border-[#e0d9ce]">
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
                              <SelectTrigger className="h-10 text-sm rounded-[10px] border-[#e0d9ce]">
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
                              <SelectTrigger className="h-10 text-sm rounded-[10px] border-[#e0d9ce]">
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
                              <SelectTrigger className="h-10 text-sm rounded-[10px] border-[#e0d9ce] max-w-xs">
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
                              className="h-10 text-sm rounded-[10px] border-[#e0d9ce] focus:border-[#c8a040] focus:ring-[3px] focus:ring-[rgba(200,160,64,0.12)]"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* ---------- DOCUMENTS ---------- */}
                <div id="documents" className="scroll-mt-[120px] lg:scroll-mt-28">
                  <SectionDivider label="Documents" />
                  <div className="mt-4">
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
                              <div
                                className="flex items-center justify-between rounded-[14px] border border-dashed p-4"
                                style={{ borderColor: gold.accentBorder, background: gold.card }}
                              >
                                <div className="flex items-center gap-3 min-w-0">
                                  <div
                                    className="w-10 h-10 rounded-[10px] flex items-center justify-center border"
                                    style={{ background: gold.accent, borderColor: gold.accentBorder }}
                                  >
                                    <FileText className="w-5 h-5 text-[#c8a040]" strokeWidth={2} />
                                  </div>
                                  <div className="min-w-0">
                                    <p className="text-[13px] font-medium truncate" style={{ color: gold.foreground }}>
                                      {resumePreview ? (resumeName || "Resume") : "No resume uploaded"}
                                    </p>
                                    <p className="text-[11px]" style={{ color: gold.mutedFg }}>
                                      PDF, DOC, or DOCX. Max 10MB.
                                    </p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2 shrink-0">
                                  <button
                                    type="button"
                                    onClick={() => resumeInputRef.current?.click()}
                                    disabled={resumeUploading}
                                    className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-[7px] rounded-lg border transition-colors"
                                    style={{ background: gold.background, borderColor: gold.border, color: gold.foreground }}
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
                              </div>
                              <input type="hidden" {...field} value={field.value ?? ''} />
                            </div>
                          </FormControl>
                          {resumeError && <p className="text-xs text-destructive mt-1">{resumeError}</p>}
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* ---------- SOCIAL ---------- */}
                <div id="social" className="scroll-mt-[120px] lg:scroll-mt-28">
                  <SectionDivider label="Social Links" />
                  <div className="mt-4">
                    <FormCard className="overflow-hidden p-0">
                      {(["instagram", "youtube", "linkedin"] as const).map((platform) => (
                        <div
                          key={platform}
                          className="flex items-center gap-2.5 px-4 py-3 border-b last:border-b-0"
                          style={{ borderColor: gold.border }}
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
                                    className="w-full bg-transparent text-[13px] outline-none placeholder:text-[#8a7d6b]"
                                    style={{ color: gold.foreground }}
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
                                  <SelectTrigger className="h-7 w-[110px] text-[11px] rounded-md border-[#e0d9ce]">
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
                    </FormCard>
                  </div>
                </div>

                {/* ---------- PRIVACY ---------- */}
                <div id="privacy" className="scroll-mt-[120px] lg:scroll-mt-28">
                  <SectionDivider label="Privacy" />
                  <div className="mt-4 max-w-xs">
                    <FormField
                      control={control}
                      name="privacy_mode"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-[13px] font-medium">Profile visibility</FormLabel>
                          <Select onValueChange={(v) => field.onChange(v || undefined)} value={field.value || ""}>
                            <FormControl>
                              <SelectTrigger className="h-10 text-sm rounded-[10px] border-[#e0d9ce]">
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
                </div>
              </form>
            </Form>
          </div>
        </div>
      </div>

      {/* ---------- STICKY SAVE BAR ---------- */}
      <div
        className="fixed bottom-0 left-0 right-0 border-t z-30 px-4 py-3"
        style={{ background: gold.background, borderColor: gold.border }}
      >
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs truncate" style={{ color: gold.mutedFg }}>
              {watchedUsername ? `@${watchedUsername}` : "Username required"}
            </p>
            {mode === "edit" && isDirty && (
              <p className="text-[10px] font-medium" style={{ color: gold.primary }}>
                Unsaved changes
              </p>
            )}
          </div>
          <div className="flex items-center gap-2">
            {mode === "edit" && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-8 text-xs rounded-lg border-[#e0d9ce]"
                style={{ background: gold.background }}
                onClick={onCancel}
                disabled={isSubmitting}
              >
                <X className="w-4 h-4 sm:mr-1" strokeWidth={1.5} />
                <span className="hidden sm:inline">Cancel</span>
              </Button>
            )}
            <Button
              type="submit"
              form="profile-form"
              size="sm"
              className="h-8 text-xs text-white rounded-xl"
              style={{ background: gold.primary }}
              disabled={mode === "edit" && !isDirty}
            >
              {isSubmitting && <Loader2 className="w-4 h-4 animate-spin mr-1" />}
              <Pencil className="w-4 h-4 sm:mr-1" strokeWidth={1.5} />
              <span className="hidden sm:inline">
                {mode === "create" ? "Create profile" : "Save changes"}
              </span>
              <span className="sm:hidden">
                {mode === "create" ? "Create" : "Save"}
              </span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
