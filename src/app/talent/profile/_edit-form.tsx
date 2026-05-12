"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useForm, useFieldArray, Controller, useWatch, Control } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Trash2, ChevronDown, Pencil, X, Loader2 } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { AxiosError } from "axios";

import { Card } from "@/components/ui/card";
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
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "@/components/ui/collapsible";
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

function FormSection({
  id,
  title,
  children,
  defaultOpen = true,
  rightAction,
}: {
  id: string;
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
  rightAction?: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div id={id} className="scroll-mt-28">
      <Card className="p-5 sm:p-6">
        <Collapsible open={open} onOpenChange={setOpen}>
          <div className="flex items-center justify-between gap-3">
            <CollapsibleTrigger asChild>
              <button
                type="button"
                className="flex-1 flex items-center justify-between"
              >
                <h2 className="text-base font-semibold text-text-primary">{title}</h2>
                <ChevronDown
                  className={cn(
                    "w-4 h-4 text-text-tertiary transition-transform duration-200",
                    open && "rotate-180"
                  )}
                />
              </button>
            </CollapsibleTrigger>
            {rightAction && (
              <div className="shrink-0 flex items-center">{rightAction}</div>
            )}
          </div>
          <CollapsibleContent>
            <div className="pt-4">{children}</div>
          </CollapsibleContent>
        </Collapsible>
      </Card>
    </div>
  );
}

function SectionToggle({
  control,
  sectionKey,
}: {
  control: Control<CreateTalentProfileInput>;
  sectionKey: keyof CreateTalentProfileInput["section_visibility"];
}) {
  return (
    <Controller
      control={control}
      name={`section_visibility.${sectionKey}`}
      render={({ field }) => (
        <div className="flex items-center gap-2">
          <span className="text-xs text-text-muted hidden sm:inline">Show</span>
          <Switch
            checked={field.value ?? true}
            onCheckedChange={field.onChange}
          />
        </div>
      )}
    />
  );
}

function SectionNav({
  activeId,
  onSelect,
}: {
  activeId: string;
  onSelect: (id: string) => void;
}) {
  const items = [
    { id: "identity", label: "Identity" },
    { id: "location", label: "Location" },
    { id: "career", label: "Career" },
    { id: "skills", label: "Skills" },
    { id: "languages", label: "Languages" },
    { id: "accents", label: "Accents" },
    { id: "physical", label: "Physical" },
    { id: "documents", label: "Docs" },
    { id: "social", label: "Social" },
    { id: "privacy", label: "Privacy" },
  ];
  return (
    <aside className="hidden lg:block w-36 shrink-0">
      <div className="sticky top-20 space-y-1">
        {items.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => onSelect(item.id)}
            className={cn(
              "w-full text-left px-3 py-1.5 rounded-lg text-sm font-medium transition-colors",
              activeId === item.id
                ? "bg-brand/10 text-brand"
                : "text-text-secondary hover:bg-muted-bg hover:text-text-primary"
            )}
          >
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
}: {
  activeId: string;
  onSelect: (id: string) => void;
}) {
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
  return (
    <div className="lg:hidden sticky top-[53px] z-30 bg-page/95 backdrop-blur border-b border-border -mx-4 px-4 py-2">
      <div
        className="flex gap-1.5 overflow-x-auto pb-0.5"
        style={{ scrollbarWidth: "none" }}
      >
        {items.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => onSelect(item.id)}
            className={cn(
              "shrink-0 px-2.5 py-1 rounded-full text-xs font-medium transition-colors border",
              activeId === item.id
                ? "bg-brand text-white border-brand"
                : "bg-card text-text-secondary border-border"
            )}
          >
            {item.label}
          </button>
        ))}
      </div>
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
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [swipeStart, setSwipeStart] = useState<{ x: number; y: number } | null>(null);

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
    setSaveSuccess(false);
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
      setSaveSuccess(true);
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

  return (
    <div
      className="flex gap-6"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <SectionNav activeId={activeSection} onSelect={scrollTo} />
      <div className="flex-1 min-w-0">
        <MobileNav activeId={activeSection} onSelect={scrollTo} />

        <div className="mb-6">
          <h1 className="text-xl font-bold text-text-primary">
            {mode === "create"
              ? "Create your talent profile"
              : "Edit your profile"}
          </h1>
          <p className="text-sm text-text-tertiary mt-1">
            {mode === "create"
              ? "Pick a username to get started. You can fill the rest later."
              : "Keep your profile up to date so recruiters can find you."}
          </p>
        </div>

        {mode === "create" && (
          <div className="mb-6">
            <p className="text-xs sm:text-sm text-text-muted mb-3 px-1">
              Preview: how recruiters will see you
            </p>
            <TalentCard sample />
          </div>
        )}

        {saveError && (
          <div className="mb-4">
            <Alert variant="destructive">
              <AlertDescription>{saveError}</AlertDescription>
            </Alert>
          </div>
        )}
        {saveSuccess && (
          <div className="mb-4">
            <Alert>
              <AlertDescription>Profile saved.</AlertDescription>
            </Alert>
          </div>
        )}

        <Form {...form}>
          <form onSubmit={onSubmit} className="space-y-5 pb-10">
            {/* IDENTITY */}
            <FormSection id="identity" title="Identity">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField
                  control={control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Username *</FormLabel>
                      <FormControl>
                        <Input {...field} disabled={mode === "edit"} placeholder="e.g. john_doe" />
                      </FormControl>
                      <FormMessage />
                      {mode === "edit" && (
                        <p className="text-xs text-text-muted mt-1">Username cannot be changed.</p>
                      )}
                    </FormItem>
                  )}
                />
                <FormField
                  control={control}
                  name="full_legal_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full legal name</FormLabel>
                      <FormControl>
                        <Input {...field} value={field.value ?? ""} />
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
                      <FormLabel>Date of birth</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} value={field.value ?? ""} />
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
                      <FormLabel>Gender</FormLabel>
                      <Select onValueChange={(v) => field.onChange(v || undefined)} value={field.value || ""}>
                        <FormControl>
                          <SelectTrigger><SelectValue placeholder="Select…" /></SelectTrigger>
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
                  name="profile_photo"
                  render={({ field }) => (
                    <FormItem className="sm:col-span-2">
                      <FormLabel>Profile photo URL</FormLabel>
                      <FormControl>
                        <Input {...field} value={field.value ?? ""} placeholder="https://…" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={control}
                  name="headline"
                  render={({ field }) => (
                    <FormItem className="sm:col-span-2">
                      <FormLabel>Headline</FormLabel>
                      <FormControl>
                        <Input {...field} value={field.value ?? ""} maxLength={120} placeholder="One line that describes you" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={control}
                  name="about"
                  render={({ field }) => (
                    <FormItem className="sm:col-span-2">
                      <FormLabel>About</FormLabel>
                      <FormControl>
                        <Textarea {...field} value={field.value ?? ""} maxLength={500} rows={5} placeholder="A short bio (max 500 characters)" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </FormSection>

            {/* LOCATION */}
            <FormSection
              id="location"
              title="Location"
              rightAction={<SectionToggle control={control} sectionKey="location" />}
            >
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <FormField
                  control={control}
                  name="location.country"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Country</FormLabel>
                      <FormControl>
                        <Input {...field} value={field.value ?? ""} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={control}
                  name="location.state"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>State</FormLabel>
                      <FormControl>
                        <Input {...field} value={field.value ?? ""} />
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
                      <FormLabel>City</FormLabel>
                      <FormControl>
                        <Input {...field} value={field.value ?? ""} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </FormSection>

            {/* CAREER */}
            <FormSection
              id="career"
              title="Career"
              rightAction={<SectionToggle control={control} sectionKey="experience" />}
            >
              <div className="space-y-4">
                <FormField
                  control={control}
                  name="professions"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Professions</FormLabel>
                      <TagInput
                        value={field.value ?? []}
                        onChange={field.onChange}
                        suggestions={PROFESSION_SUGGESTIONS}
                        placeholder="Add a profession"
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
                      <FormLabel>Industries</FormLabel>
                      <TagInput
                        value={field.value ?? []}
                        onChange={field.onChange}
                        suggestions={INDUSTRY_SUGGESTIONS}
                        placeholder="Add an industry"
                      />
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={control}
                  name="availability"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Availability</FormLabel>
                      <Select onValueChange={(v) => field.onChange(v || undefined)} value={field.value || ""}>
                        <FormControl>
                          <SelectTrigger><SelectValue placeholder="Select…" /></SelectTrigger>
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
            </FormSection>

            {/* SKILLS */}
            <FormSection
              id="skills"
              title="Skills"
              rightAction={<SectionToggle control={control} sectionKey="skills" />}
            >
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm text-text-muted">
                  {skillsArray.fields.length === 0
                    ? "No skills added yet."
                    : `${skillsArray.fields.length} skill${skillsArray.fields.length === 1 ? "" : "s"}`}
                </p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => skillsArray.append({ name: "", proficiency: "beginner" })}
                >
                  <Plus className="w-3.5 h-3.5 mr-1" strokeWidth={2} /> Add skill
                </Button>
              </div>
              {skillsArray.fields.length > 0 && (
                <div className="space-y-3">
                  {skillsArray.fields.map((field, idx) => (
                    <div
                      key={field.id}
                      className="grid grid-cols-[1fr_140px_auto] sm:grid-cols-[1fr_180px_auto] gap-3 items-start"
                    >
                      <Input
                        placeholder="Skill name"
                        {...register(`skills.${idx}.name`)}
                        aria-invalid={!!errors.skills?.[idx]?.name}
                      />
                      <Controller
                        control={control}
                        name={`skills.${idx}.proficiency`}
                        render={({ field }) => (
                          <Select onValueChange={field.onChange} value={field.value || ""}>
                            <SelectTrigger aria-invalid={!!errors.skills?.[idx]?.proficiency}><SelectValue /></SelectTrigger>
                            <SelectContent>
                              {PROFICIENCY_OPTIONS.map((opt) => (
                                <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => skillsArray.remove(idx)}
                        aria-label="Remove skill"
                      >
                        <Trash2 className="w-4 h-4" strokeWidth={1.5} />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </FormSection>

            {/* LANGUAGES */}
            <FormSection
              id="languages"
              title="Languages"
              rightAction={<SectionToggle control={control} sectionKey="languages" />}
            >
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm text-text-muted">
                  {languagesArray.fields.length === 0
                    ? "No languages added yet."
                    : `${languagesArray.fields.length} language${languagesArray.fields.length === 1 ? "" : "s"}`}
                </p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => languagesArray.append({ name: "", fluency: "" })}
                >
                  <Plus className="w-3.5 h-3.5 mr-1" strokeWidth={2} /> Add language
                </Button>
              </div>
              {languagesArray.fields.length > 0 && (
                <div className="space-y-3">
                  {languagesArray.fields.map((field, idx) => (
                    <div
                      key={field.id}
                      className="grid grid-cols-[1fr_140px_auto] sm:grid-cols-[1fr_180px_auto] gap-3 items-start"
                    >
                      <Input
                        placeholder="Language name"
                        {...register(`languages.${idx}.name`)}
                        aria-invalid={!!errors.languages?.[idx]?.name}
                      />
                      <Controller
                        control={control}
                        name={`languages.${idx}.fluency`}
                        render={({ field }) => (
                          <Select onValueChange={field.onChange} value={field.value || ""}>
                            <SelectTrigger aria-invalid={!!errors.languages?.[idx]?.fluency}><SelectValue placeholder="Fluency" /></SelectTrigger>
                            <SelectContent>
                              {FLUENCIES.map((opt) => (
                                <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => languagesArray.remove(idx)}
                        aria-label="Remove language"
                      >
                        <Trash2 className="w-4 h-4" strokeWidth={1.5} />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </FormSection>

            {/* ACCENTS */}
            <FormSection
              id="accents"
              title="Accents"
              rightAction={<SectionToggle control={control} sectionKey="accents" />}
            >
              <FormField
                control={control}
                name="accents"
                render={({ field }) => (
                  <FormItem>
                    <TagInput
                      value={field.value ?? []}
                      onChange={field.onChange}
                      placeholder="Add an accent (e.g. American, British)"
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />
            </FormSection>

            {/* PHYSICAL */}
            <FormSection
              id="physical"
              title="Physical attributes"
              rightAction={<SectionToggle control={control} sectionKey="physical_attributes" />}
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField
                  control={control}
                  name="physical_attributes.height_cm"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Height (cm)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          {...field}
                          value={field.value ?? ""}
                          onChange={(e) => field.onChange(e.target.value === "" ? undefined : Number(e.target.value))}
                          aria-invalid={!!errors.physical_attributes?.height_cm}
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
                      <FormLabel>Weight (kg)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          {...field}
                          value={field.value ?? ""}
                          onChange={(e) => field.onChange(e.target.value === "" ? undefined : Number(e.target.value))}
                          aria-invalid={!!errors.physical_attributes?.weight_kg}
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
                      <FormLabel>Body type</FormLabel>
                      <Select onValueChange={(v) => field.onChange(v || undefined)} value={field.value || ""}>
                        <FormControl>
                          <SelectTrigger><SelectValue placeholder="Select…" /></SelectTrigger>
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
                      <FormLabel>Complexion</FormLabel>
                      <Select onValueChange={(v) => field.onChange(v || undefined)} value={field.value || ""}>
                        <FormControl>
                          <SelectTrigger><SelectValue placeholder="Select…" /></SelectTrigger>
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
                      <FormLabel>Hair color</FormLabel>
                      <Select onValueChange={(v) => field.onChange(v || undefined)} value={field.value || ""}>
                        <FormControl>
                          <SelectTrigger><SelectValue placeholder="Select…" /></SelectTrigger>
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
                      <FormLabel>Hair length</FormLabel>
                      <Select onValueChange={(v) => field.onChange(v || undefined)} value={field.value || ""}>
                        <FormControl>
                          <SelectTrigger><SelectValue placeholder="Select…" /></SelectTrigger>
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
                    <FormItem>
                      <FormLabel>Eye color</FormLabel>
                      <Select onValueChange={(v) => field.onChange(v || undefined)} value={field.value || ""}>
                        <FormControl>
                          <SelectTrigger><SelectValue placeholder="Select…" /></SelectTrigger>
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
                    <FormItem className="sm:col-span-2">
                      <FormLabel>Distinctive features</FormLabel>
                      <FormControl>
                        <Textarea {...field} value={field.value ?? ""} rows={3} maxLength={300} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </FormSection>

            {/* DOCUMENTS */}
            <FormSection
              id="documents"
              title="Documents"
              rightAction={<SectionToggle control={control} sectionKey="documents" />}
            >
              <div className="space-y-4">
                <FormField
                  control={control}
                  name="documents.resume_url"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Resume URL</FormLabel>
                      <FormControl>
                        <Input {...field} value={field.value ?? ""} placeholder="https://…" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={control}
                  name="documents.portfolio_pdf_url"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Portfolio PDF URL</FormLabel>
                      <FormControl>
                        <Input {...field} value={field.value ?? ""} placeholder="https://…" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={control}
                  name="documents.measurements_sheet_url"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Measurements sheet URL</FormLabel>
                      <FormControl>
                        <Input {...field} value={field.value ?? ""} placeholder="https://…" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </FormSection>

            {/* SOCIAL */}
            <FormSection
              id="social"
              title="Social links"
              rightAction={<SectionToggle control={control} sectionKey="social_links" />}
            >
              <div className="space-y-4">
                {(["instagram", "youtube", "linkedin"] as const).map((platform) => (
                  <div
                    key={platform}
                    className="grid grid-cols-1 sm:grid-cols-[1fr_180px] gap-3"
                  >
                    <FormField
                      control={control}
                      name={`social_links.${platform}.url`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{`${platform.charAt(0).toUpperCase()}${platform.slice(1)} URL`}</FormLabel>
                          <FormControl>
                            <Input {...field} value={field.value ?? ""} placeholder="https://…" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={control}
                      name={`social_links.${platform}.visibility`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Visibility</FormLabel>
                          <Select onValueChange={(v) => field.onChange(v || undefined)} value={field.value || ""}>
                            <FormControl>
                              <SelectTrigger><SelectValue /></SelectTrigger>
                            </FormControl>
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
            </FormSection>

            {/* PRIVACY */}
            <FormSection id="privacy" title="Privacy">
              <FormField
                control={control}
                name="privacy_mode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Profile visibility</FormLabel>
                    <Select onValueChange={(v) => field.onChange(v || undefined)} value={field.value || ""}>
                      <FormControl>
                        <SelectTrigger><SelectValue placeholder="Select…" /></SelectTrigger>
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
            </FormSection>

            {/* FLOATING SUBMIT BAR */}
            <div className="fixed bottom-16 left-0 right-0 bg-card border-t border-border px-4 py-3 z-30">
              <div className="max-w-3xl mx-auto flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-xs text-text-muted truncate">
                    {watchedUsername ? `@${watchedUsername}` : "Username required"}
                  </p>
                  {mode === "edit" && isDirty && (
                    <p className="text-2xs text-brand font-medium">
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
                      onClick={onCancel}
                      disabled={isSubmitting}
                    >
                      <X className="w-4 h-4 sm:mr-1" strokeWidth={1.5} />
                      <span className="hidden sm:inline">Cancel</span>
                    </Button>
                  )}
                  <Button
                    type="submit"
                    size="sm"
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
          </form>
        </Form>
      </div>
    </div>
  );
}
