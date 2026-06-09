"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ChevronDown,
  Pencil,
  X,
  ArrowLeft,
  Check,
  Eye,
  Building2,
  PieChart,
  Briefcase,
  Camera,
} from "lucide-react";
import { usePopup } from "@/hooks/use-popup";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from "@/components/ui/collapsible";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { RecruiterCard } from "@/components/recruiter-card";
import { recruiterApi } from "@/lib/api";
import { getApiErrorMessage } from "@/lib/formatters";
import { cn } from "@/lib/utils";
import {
  updateRecruiterProfileSchema,
  type UpdateRecruiterProfileInput,
  type RecruiterProfile,
} from "@/lib/validations/recruiter-profile.schema";
import {
  COMPANY_SIZE_OPTIONS,
  INDUSTRY_OPTIONS,
  POSITION_OPTIONS,
  dynamicOptions,
} from "@/lib/recruiter-profile/options";
import {
  DEFAULT_VALUES,
  hydrateFromServer,
  buildPayload,
} from "@/lib/recruiter-profile/form-helpers";

interface EditFormProps {
  profile: RecruiterProfile | null;
  onSaved: (profile: RecruiterProfile) => void;
  onCancel: () => void;
}

const SECTION_IDS = ["company", "details", "role"];

const SECTION_CONFIG = [
  {
    id: "company",
    label: "Company",
    title: "Company info",
    subtitle: "Name, website, LinkedIn",
    icon: Building2,
  },
  {
    id: "details",
    label: "Details",
    title: "Company details",
    subtitle: "Size, industry",
    icon: PieChart,
  },
  {
    id: "role",
    label: "Your role",
    title: "Your role",
    subtitle: "Position at this company",
    icon: Briefcase,
  },
];

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

function ProgressBar({ value }: { value: number }) {
  const pct = Math.min(100, Math.max(0, value));
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-xs text-text-secondary">Profile completeness</span>
        <span className="text-xs font-medium text-brand">{pct}%</span>
      </div>
      <div className="h-1 bg-muted-bg rounded-full overflow-hidden">
        <div
          className="h-full bg-brand rounded-full transition-all duration-300"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

function FormSection({
  id,
  title,
  subtitle,
  icon: Icon,
  children,
  defaultOpen = true,
}: {
  id: string;
  title: string;
  subtitle: string;
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div id={id} className="scroll-mt-28">
      <Card className="overflow-hidden">
        <Collapsible open={open} onOpenChange={setOpen}>
          <CollapsibleTrigger asChild>
            <button
              type="button"
              className="w-full flex items-center justify-between p-4 sm:p-5"
            >
              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    "w-7 h-7 rounded-lg flex items-center justify-center shrink-0",
                    open ? "bg-brand/10" : "bg-muted-bg"
                  )}
                >
                  <Icon
                    className={cn(
                      "w-4 h-4",
                      open ? "text-brand" : "text-text-secondary"
                    )}
                    strokeWidth={1.5}
                  />
                </div>
                <div className="text-left">
                  <h2 className="text-sm font-semibold text-text-primary">
                    {title}
                  </h2>
                  <p className="text-[11px] text-text-tertiary">{subtitle}</p>
                </div>
              </div>
              <ChevronDown
                className={cn(
                  "w-4 h-4 text-text-tertiary transition-transform duration-200 shrink-0",
                  open && "rotate-180"
                )}
              />
            </button>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="px-4 sm:px-5 pb-4 sm:pb-5 pt-0 border-t border-border-subtle">
              {children}
            </div>
          </CollapsibleContent>
        </Collapsible>
      </Card>
    </div>
  );
}

function SectionNav({
  activeId,
  onSelect,
  checks,
}: {
  activeId: string;
  onSelect: (id: string) => void;
  checks: Record<string, boolean>;
}) {
  return (
    <aside className="hidden lg:block w-36 shrink-0">
      <div className="sticky top-20 space-y-1">
        {SECTION_CONFIG.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => onSelect(item.id)}
            className={cn(
              "w-full text-left px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-2",
              activeId === item.id
                ? "bg-brand/10 text-brand"
                : "text-text-secondary hover:bg-muted-bg hover:text-text-primary"
            )}
          >
            {checks[item.id] && (
              <span className="w-4 h-4 rounded-full bg-brand flex items-center justify-center shrink-0">
                <Check className="w-2.5 h-2.5 text-white" strokeWidth={2.5} />
              </span>
            )}
            {item.label}
          </button>
        ))}
      </div>
    </aside>
  );
}

function MobileNav({
  activeId,
  onSelect,
  checks,
}: {
  activeId: string;
  onSelect: (id: string) => void;
  checks: Record<string, boolean>;
}) {
  return (
    <div
      className="flex gap-1.5 overflow-x-auto pb-0.5"
      style={{ scrollbarWidth: "none" }}
    >
      {SECTION_CONFIG.map((item) => {
        const done = checks[item.id];
        const Icon = item.icon;
        return (
          <button
            key={item.id}
            type="button"
            onClick={() => onSelect(item.id)}
            className={cn(
              "shrink-0 px-2.5 py-1 rounded-full text-xs font-medium transition-colors border flex items-center gap-1",
              activeId === item.id
                ? "bg-brand text-white border-brand"
                : "bg-card text-text-secondary border-border"
            )}
          >
            {done ? (
              <span className="w-3.5 h-3.5 rounded-full bg-brand flex items-center justify-center">
                <Check className="w-2 h-2 text-white" strokeWidth={3} />
              </span>
            ) : (
              <Icon className="w-3 h-3" strokeWidth={1.5} />
            )}
            {item.label}
          </button>
        );
      })}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main                                                               */
/* ------------------------------------------------------------------ */

export function EditForm({ profile, onSaved, onCancel }: EditFormProps) {
  const { show } = usePopup();
  const [saveError, setSaveError] = useState<string | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<UpdateRecruiterProfileInput>({
    resolver: zodResolver(updateRecruiterProfileSchema),
    defaultValues: profile ? hydrateFromServer(profile) : DEFAULT_VALUES,
    mode: "onSubmit",
  });

  const {
    handleSubmit,
    control,
    reset,
    watch,
    formState: { isSubmitting, isDirty },
  } = form;

  const activeSection = useActiveSection(SECTION_IDS);

  useEffect(() => {
    if (profile) {
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
        const { relativePath, signedUrl } = await recruiterApi.uploadProfilePhoto(file);
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

  const scrollTo = useCallback((id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  const onSubmit = handleSubmit(async (values) => {
    setSaveError(null);
    try {
      const payload = buildPayload(values);
      const saved = await recruiterApi.updateProfile(payload);
      onSaved(saved as RecruiterProfile);
      show({
        title: "Profile saved",
        description: "Your changes have been saved.",
        variant: "success",
        position: "bottom-center",
        duration: 4000,
      });
    } catch (err) {
      setSaveError(getApiErrorMessage(err, "Failed to save profile"));
    }
  });

  const watched = watch();
  const companyDone = !!watched.company_name;
  const detailsDone = !!watched.company_size && !!watched.industry;
  const roleDone = !!watched.position;

  const checks = {
    company: companyDone,
    details: detailsDone,
    role: roleDone,
  };

  const totalFields = 7;
  let filledFields = 0;
  if (watched.company_name) filledFields++;
  if (watched.company_website) filledFields++;
  if (watched.linkedin_company_url) filledFields++;
  if (watched.company_size) filledFields++;
  if (watched.industry) filledFields++;
  if (watched.position) filledFields++;
  if (watched.profile_photo) filledFields++;
  const completeness = Math.round((filledFields / totalFields) * 100);

  return (
    <div className="flex gap-6">
      <SectionNav activeId={activeSection} onSelect={scrollTo} checks={checks} />
      <div className="flex-1 min-w-0">
        {/* TOP BAR */}
        <div className="px-4 py-2.5 flex items-center gap-3 border-b border-border">
          <button
            type="button"
            onClick={onCancel}
            className="w-8 h-8 rounded-lg border border-border bg-card flex items-center justify-center shrink-0"
          >
            <ArrowLeft
              className="w-4 h-4 text-text-secondary"
              strokeWidth={1.5}
            />
          </button>
          <h1 className="flex-1 text-[15px] font-medium text-text-primary">
            Edit profile
          </h1>
          <button
            type="button"
            onClick={() => {
              void onSubmit();
            }}
            disabled={!isDirty || isSubmitting}
            className={cn(
              "px-3.5 py-1.5 rounded-full text-[13px] font-medium flex items-center gap-1 transition-colors",
              isDirty
                ? "bg-brand text-white"
                : "bg-muted-bg text-text-tertiary cursor-not-allowed"
            )}
          >
            <Check className="w-3.5 h-3.5" strokeWidth={2} />
            {isDirty ? "Save changes" : "Saved"}
          </button>
        </div>

        {/* PROGRESS BAR */}
        <div className="px-4 py-2.5 bg-card border-b border-border">
          <ProgressBar value={completeness} />
        </div>

        {/* MOBILE SECTION CHIPS */}
        <div className="lg:hidden sticky top-[53px] z-30 bg-page/95 backdrop-blur border-b border-border px-4 py-2">
          <MobileNav
            activeId={activeSection}
            onSelect={scrollTo}
            checks={checks}
          />
        </div>

        {/* CONTENT */}
        <div className="px-4 pt-4 space-y-3">
          {/* LIVE PREVIEW */}
          <div>
            <p className="text-[11px] font-medium text-text-tertiary uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
              <Eye className="w-3.5 h-3.5" strokeWidth={1.5} />
              How talent sees you
            </p>
            <RecruiterCard
              profile={
                (profile
                  ? { ...profile, ...form.watch() }
                  : form.watch()) as RecruiterProfile
              }
              sample={!profile}
            />
          </div>

          {saveError && (
            <Alert variant="destructive">
              <AlertDescription>{saveError}</AlertDescription>
            </Alert>
          )}

          <Form {...form}>
            <form onSubmit={onSubmit} className="space-y-3">
              {/* PROFILE PHOTO */}
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="w-16 h-16 rounded-xl bg-surface-secondary flex items-center justify-center text-xl font-bold text-text-muted border border-border shrink-0 overflow-hidden">
                    {photoPreview ? (
                      <img src={photoPreview} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <span>
                        {(form.getValues("company_name") || "C")
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
                    className="absolute -bottom-1 -right-1 h-7 w-7 rounded-full bg-brand grid place-items-center shadow-md ring-4 ring-card"
                  >
                    <Camera className="h-3.5 w-3.5 text-white" />
                  </button>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-xs text-text-secondary">Tap the camera to update your photo.</span>
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

              {/* COMPANY INFO */}
              <FormSection
                id="company"
                title="Company info"
                subtitle="Name, website, LinkedIn"
                icon={Building2}
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField
                    control={control}
                    name="company_name"
                    render={({ field }) => (
                      <FormItem className="sm:col-span-2">
                        <FormLabel>Company Name</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            value={field.value ?? ""}
                            placeholder="e.g. Starlight Productions"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={control}
                    name="company_website"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Website</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            value={field.value ?? ""}
                            placeholder="example.com"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={control}
                    name="linkedin_company_url"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>LinkedIn Company URL</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            value={field.value ?? ""}
                            placeholder="https://linkedin.com/company/..."
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </FormSection>

              {/* COMPANY DETAILS */}
              <FormSection
                id="details"
                title="Company details"
                subtitle="Size, industry"
                icon={PieChart}
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField
                    control={control}
                    name="company_size"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Company Size</FormLabel>
                        <Select
                          onValueChange={(v) => field.onChange(v || undefined)}
                          value={field.value || ""}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select…" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {dynamicOptions(
                              field.value,
                              COMPANY_SIZE_OPTIONS
                            ).map((opt) => (
                              <SelectItem key={opt.value} value={opt.value}>
                                {opt.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={control}
                    name="industry"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Industry</FormLabel>
                        <Select
                          onValueChange={(v) => field.onChange(v || undefined)}
                          value={field.value || ""}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select…" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {dynamicOptions(
                              field.value,
                              INDUSTRY_OPTIONS
                            ).map((opt) => (
                              <SelectItem key={opt.value} value={opt.value}>
                                {opt.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </FormSection>

              {/* YOUR ROLE */}
              <FormSection
                id="role"
                title="Your role"
                subtitle="Position at this company"
                icon={Briefcase}
              >
                <FormField
                  control={control}
                  name="position"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Your Position</FormLabel>
                      <Select
                        onValueChange={(v) => field.onChange(v || undefined)}
                        value={field.value || ""}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select…" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {dynamicOptions(field.value, POSITION_OPTIONS).map(
                            (opt) => (
                              <SelectItem key={opt.value} value={opt.value}>
                                {opt.label}
                              </SelectItem>
                            )
                          )}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </FormSection>
            </form>
          </Form>
        </div>

        {/* FLOATING SUBMIT BAR */}
        <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-border px-4 py-3 z-30">
          <div className="max-w-3xl mx-auto flex items-center justify-between gap-3">
            <div className="min-w-0">
              {isDirty && (
                <p className="text-xs text-brand font-medium flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-brand" />
                  Unsaved changes
                </p>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onCancel}
                disabled={isSubmitting}
              >
                <X className="w-4 h-4 sm:mr-1" strokeWidth={1.5} />
                <span className="hidden sm:inline">Cancel</span>
              </Button>
              <Button
                type="button"
                size="sm"
                disabled={!isDirty}
                isLoading={isSubmitting}
                onClick={() => {
                  void onSubmit();
                }}
              >
                <Pencil className="w-4 h-4 sm:mr-1" strokeWidth={1.5} />
                <span className="hidden sm:inline">Save changes</span>
                <span className="sm:hidden">Save</span>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
