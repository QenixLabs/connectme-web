"use client";

import { useEffect, useState } from "react";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Trash2 } from "lucide-react";
import { AxiosError } from "axios";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TextInput } from "@/components/ui/text-input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { TagInput } from "@/components/ui/tag-input";
import { ErrorBanner } from "@/components/ui/error-banner";
import { SuccessBanner } from "@/components/ui/success-banner";
import { talentApi } from "@/lib/api";
import { getApiErrorMessage } from "@/lib/formatters";
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
import { CompletenessBanner } from "./_completeness-banner";
import { ProfileView } from "./_profile-view";

type Mode = "create" | "edit";

const emptyToUndefined = (v: unknown): unknown =>
  v === "" || v === null || v === undefined ? undefined : v;

const numberOrUndefined = (v: unknown): number | undefined => {
  if (v === "" || v === null || v === undefined) return undefined;
  const n = typeof v === "number" ? v : Number(v);
  return Number.isFinite(n) ? n : undefined;
};

const DEFAULT_VALUES: CreateTalentProfileInput = {
  username: "",
  full_legal_name: "",
  date_of_birth: "",
  gender: "",
  profile_photo: "",
  location: { country: "", state: "", city: "" },
  professions: [],
  industries: [],
  availability: undefined,
  headline: "",
  about: "",
  physical_attributes: {
    height_cm: undefined,
    weight_kg: undefined,
    body_type: "",
    complexion: "",
    hair_color: "",
    hair_length: "",
    eye_color: "",
    distinctive_features: "",
  },
  languages: [],
  accents: [],
  skills: [],
  documents: { resume_url: "", portfolio_pdf_url: "", measurements_sheet_url: "" },
  social_links: {
    instagram: { url: "", visibility: "public" },
    youtube: { url: "", visibility: "public" },
    linkedin: { url: "", visibility: "public" },
  },
  privacy_mode: undefined,
};

function hydrateFromServer(profile: TalentProfile): CreateTalentProfileInput {
  const dob = profile.date_of_birth
    ? typeof profile.date_of_birth === "string"
      ? profile.date_of_birth.slice(0, 10)
      : ""
    : "";

  return {
    username: profile.username ?? "",
    full_legal_name: profile.full_legal_name ?? "",
    date_of_birth: dob,
    gender: profile.gender ?? "",
    profile_photo: profile.profile_photo ?? "",
    location: {
      country: profile.location?.country ?? "",
      state: profile.location?.state ?? "",
      city: profile.location?.city ?? "",
    },
    professions: profile.professions ?? [],
    industries: profile.industries ?? [],
    availability: profile.availability,
    headline: profile.headline ?? "",
    about: profile.about ?? "",
    physical_attributes: {
      height_cm: profile.physical_attributes?.height_cm,
      weight_kg: profile.physical_attributes?.weight_kg,
      body_type: profile.physical_attributes?.body_type ?? "",
      complexion: profile.physical_attributes?.complexion ?? "",
      hair_color: profile.physical_attributes?.hair_color ?? "",
      hair_length: profile.physical_attributes?.hair_length ?? "",
      eye_color: profile.physical_attributes?.eye_color ?? "",
      distinctive_features: profile.physical_attributes?.distinctive_features ?? "",
    },
    languages: (profile.languages ?? []).map((l) => ({
      name: l.name ?? "",
      fluency: l.fluency ?? "",
    })),
    accents: profile.accents ?? [],
    skills: (profile.skills ?? []).map((s) => ({
      name: s.name,
      proficiency: s.proficiency,
      order: s.order,
    })),
    documents: {
      resume_url: profile.documents?.resume_url ?? "",
      portfolio_pdf_url: profile.documents?.portfolio_pdf_url ?? "",
      measurements_sheet_url: profile.documents?.measurements_sheet_url ?? "",
    },
    social_links: {
      instagram: {
        url: profile.social_links?.instagram?.url ?? "",
        visibility: (profile.social_links?.instagram?.visibility as "public" | "recruiters_only" | "private") ?? "public",
      },
      youtube: {
        url: profile.social_links?.youtube?.url ?? "",
        visibility: (profile.social_links?.youtube?.visibility as "public" | "recruiters_only" | "private") ?? "public",
      },
      linkedin: {
        url: profile.social_links?.linkedin?.url ?? "",
        visibility: (profile.social_links?.linkedin?.visibility as "public" | "recruiters_only" | "private") ?? "public",
      },
    },
    privacy_mode: profile.privacy_mode,
  };
}

function isEmptyValue(v: unknown): boolean {
  return v === undefined || v === null || v === "";
}

function stripEmptyObject<T extends Record<string, unknown>>(obj: T): Partial<T> | undefined {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(obj)) {
    if (isEmptyValue(v)) continue;
    if (v && typeof v === "object" && !Array.isArray(v)) {
      const inner = stripEmptyObject(v as Record<string, unknown>);
      if (inner !== undefined) out[k] = inner;
      continue;
    }
    out[k] = v;
  }
  return Object.keys(out).length > 0 ? (out as Partial<T>) : undefined;
}

function buildPayload(values: CreateTalentProfileInput): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [key, val] of Object.entries(values) as [keyof CreateTalentProfileInput, unknown][]) {
    if (val === undefined || val === null) continue;
    if (typeof val === "string") {
      if (val !== "") out[key] = val;
      continue;
    }
    if (Array.isArray(val)) {
      out[key] = val;
      continue;
    }
    if (typeof val === "object") {
      const cleaned = stripEmptyObject(val as Record<string, unknown>);
      if (cleaned !== undefined) out[key] = cleaned;
      continue;
    }
    out[key] = val;
  }
  return out;
}

export default function TalentProfilePage() {
  const [mode, setMode] = useState<Mode>("create");
  const [isEditing, setIsEditing] = useState(true);
  const [profile, setProfile] = useState<TalentProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [completenessVersion, setCompletenessVersion] = useState(0);

  const form = useForm<CreateTalentProfileInput>({
    resolver: zodResolver(createTalentProfileSchema),
    defaultValues: DEFAULT_VALUES,
    mode: "onSubmit",
  });

  const {
    register,
    handleSubmit,
    control,
    reset,
    setError: setFieldError,
    watch,
    formState: { errors, isSubmitting },
  } = form;

  const skillsArray = useFieldArray({ control, name: "skills" });
  const languagesArray = useFieldArray({ control, name: "languages" });

  const watchedUsername = watch("username");

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setLoadError(null);
    talentApi
      .getMyProfile()
      .then((loaded) => {
        if (cancelled) return;
        if (loaded === null) {
          setMode("create");
          setIsEditing(true);
          setProfile(null);
          reset(DEFAULT_VALUES);
        } else {
          setMode("edit");
          setIsEditing(false);
          setProfile(loaded);
          reset(hydrateFromServer(loaded));
        }
      })
      .catch((err) => {
        if (cancelled) return;
        setLoadError(getApiErrorMessage(err, "Failed to load profile"));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [reset]);

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
      setMode("edit");
      setProfile(saved);
      setIsEditing(false);
      reset(hydrateFromServer(saved));
      setSaveSuccess(true);
      setCompletenessVersion((v) => v + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      const axiosErr = err as AxiosError<{ message?: string }>;
      const status = axiosErr.response?.status;
      const message = axiosErr.response?.data?.message ?? "";

      if (mode === "create" && status === 409 && /username/i.test(message)) {
        setFieldError("username", { type: "manual", message: "Username already taken" });
        return;
      }
      if (mode === "create" && status === 409 && /already exists/i.test(message)) {
        try {
          const existing = await talentApi.getMyProfile();
          if (existing) {
            setMode("edit");
            setProfile(existing);
            setIsEditing(true);
            reset(hydrateFromServer(existing));
            setSaveError("A profile already exists for your account — it has been loaded. Please re-apply your changes and save again.");
            return;
          }
        } catch {
          /* fall through */
        }
      }
      setSaveError(getApiErrorMessage(err, "Failed to save profile"));
    }
  });

  if (loading) {
    return (
      <Card className="p-8">
        <p className="text-text-muted text-sm">Loading profile…</p>
      </Card>
    );
  }

  if (loadError) {
    return <ErrorBanner>{loadError}</ErrorBanner>;
  }

  if (mode === "edit" && !isEditing && profile) {
    return (
      <div>
        {saveSuccess && (
          <div className="mb-4">
            <SuccessBanner>Profile saved.</SuccessBanner>
          </div>
        )}
        <CompletenessBanner version={completenessVersion} />
        <ProfileView
          profile={profile}
          onEdit={() => {
            setIsEditing(true);
            setSaveSuccess(false);
            setSaveError(null);
          }}
        />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-text-primary">
          {mode === "create" ? "Create your talent profile" : "Edit your profile"}
        </h1>
        <p className="text-sm text-text-tertiary mt-1">
          {mode === "create"
            ? "Pick a username to get started. You can fill the rest later."
            : "Keep your profile up to date so recruiters can find you."}
        </p>
      </div>

      {mode === "edit" && <CompletenessBanner version={completenessVersion} />}

      {saveError && (
        <div className="mb-4">
          <ErrorBanner>{saveError}</ErrorBanner>
        </div>
      )}
      {saveSuccess && (
        <div className="mb-4">
          <SuccessBanner>Profile saved.</SuccessBanner>
        </div>
      )}

      <form onSubmit={onSubmit} className="space-y-6 pb-32">
        {/* IDENTITY */}
        <Card className="p-6">
          <h2 className="text-base font-semibold text-text-primary mb-4">Identity</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <TextInput
                label="Username *"
                {...register("username")}
                disabled={mode === "edit"}
                error={!!errors.username}
                placeholder="e.g. john_doe"
              />
              {errors.username && (
                <p className="text-xs text-error-text mt-1">{errors.username.message}</p>
              )}
              {mode === "edit" && (
                <p className="text-xs text-text-muted mt-1">Username cannot be changed.</p>
              )}
            </div>
            <TextInput
              label="Full legal name"
              {...register("full_legal_name")}
              error={!!errors.full_legal_name}
            />
            <TextInput
              label="Date of birth"
              type="date"
              {...register("date_of_birth")}
              error={!!errors.date_of_birth}
            />
            <Select
              label="Gender"
              {...register("gender")}
              options={dynamicOptions(watch("gender"), GENDER_OPTIONS)}
              placeholder="Select…"
              error={!!errors.gender}
            />
            <TextInput
              label="Profile photo URL"
              {...register("profile_photo")}
              placeholder="https://…"
              error={!!errors.profile_photo}
              containerClassName="sm:col-span-2"
            />
            <TextInput
              label="Headline"
              {...register("headline")}
              maxLength={120}
              placeholder="One line that describes you"
              error={!!errors.headline}
              containerClassName="sm:col-span-2"
            />
            {errors.headline && (
              <p className="text-xs text-error-text -mt-3 sm:col-span-2">{errors.headline.message}</p>
            )}
            <Textarea
              label="About"
              {...register("about")}
              maxLength={500}
              rows={5}
              placeholder="A short bio (max 500 characters)"
              error={!!errors.about}
              containerClassName="sm:col-span-2"
            />
            {errors.about && (
              <p className="text-xs text-error-text -mt-3 sm:col-span-2">{errors.about.message}</p>
            )}
          </div>
        </Card>

        {/* LOCATION */}
        <Card className="p-6">
          <h2 className="text-base font-semibold text-text-primary mb-4">Location</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <TextInput label="Country" {...register("location.country")} />
            <TextInput label="State" {...register("location.state")} />
            <TextInput label="City" {...register("location.city")} />
          </div>
        </Card>

        {/* CAREER */}
        <Card className="p-6">
          <h2 className="text-base font-semibold text-text-primary mb-4">Career</h2>
          <div className="space-y-4">
            <Controller
              control={control}
              name="professions"
              render={({ field }) => (
                <TagInput
                  label="Professions"
                  value={field.value ?? []}
                  onChange={field.onChange}
                  suggestions={PROFESSION_SUGGESTIONS}
                  placeholder="Add a profession"
                />
              )}
            />
            <Controller
              control={control}
              name="industries"
              render={({ field }) => (
                <TagInput
                  label="Industries"
                  value={field.value ?? []}
                  onChange={field.onChange}
                  suggestions={INDUSTRY_SUGGESTIONS}
                  placeholder="Add an industry"
                />
              )}
            />
            <Select
              label="Availability"
              {...register("availability", { setValueAs: emptyToUndefined })}
              options={AVAILABILITY_OPTIONS}
              placeholder="Select…"
              error={!!errors.availability}
            />
          </div>
        </Card>

        {/* SKILLS */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-text-primary">Skills</h2>
            <button
              type="button"
              onClick={() => skillsArray.append({ name: "", proficiency: "beginner" })}
              className="inline-flex items-center gap-1 text-xs font-medium text-brand-hover hover:text-brand-active"
            >
              <Plus className="w-3.5 h-3.5" strokeWidth={2} /> Add skill
            </button>
          </div>
          {skillsArray.fields.length === 0 ? (
            <p className="text-sm text-text-muted">No skills added yet.</p>
          ) : (
            <div className="space-y-3">
              {skillsArray.fields.map((field, idx) => (
                <div key={field.id} className="grid grid-cols-[1fr_180px_auto] gap-3 items-start">
                  <TextInput
                    placeholder="Skill name"
                    {...register(`skills.${idx}.name`)}
                    error={!!errors.skills?.[idx]?.name}
                  />
                  <Select
                    {...register(`skills.${idx}.proficiency`)}
                    options={PROFICIENCY_OPTIONS}
                    error={!!errors.skills?.[idx]?.proficiency}
                  />
                  <button
                    type="button"
                    onClick={() => skillsArray.remove(idx)}
                    className="h-11 w-11 flex items-center justify-center rounded-lg border border-border text-text-tertiary hover:text-error-text hover:border-error-border-strong"
                    aria-label="Remove skill"
                  >
                    <Trash2 className="w-4 h-4" strokeWidth={1.5} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* LANGUAGES */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-text-primary">Languages</h2>
            <button
              type="button"
              onClick={() => languagesArray.append({ name: "", fluency: "" })}
              className="inline-flex items-center gap-1 text-xs font-medium text-brand-hover hover:text-brand-active"
            >
              <Plus className="w-3.5 h-3.5" strokeWidth={2} /> Add language
            </button>
          </div>
          {languagesArray.fields.length === 0 ? (
            <p className="text-sm text-text-muted">No languages added yet.</p>
          ) : (
            <div className="space-y-3">
              {languagesArray.fields.map((field, idx) => (
                <div key={field.id} className="grid grid-cols-[1fr_180px_auto] gap-3 items-start">
                  <TextInput
                    placeholder="Language name"
                    {...register(`languages.${idx}.name`)}
                    error={!!errors.languages?.[idx]?.name}
                  />
                  <Select
                    {...register(`languages.${idx}.fluency`)}
                    options={FLUENCIES}
                    placeholder="Fluency"
                    error={!!errors.languages?.[idx]?.fluency}
                  />
                  <button
                    type="button"
                    onClick={() => languagesArray.remove(idx)}
                    className="h-11 w-11 flex items-center justify-center rounded-lg border border-border text-text-tertiary hover:text-error-text hover:border-error-border-strong"
                    aria-label="Remove language"
                  >
                    <Trash2 className="w-4 h-4" strokeWidth={1.5} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* ACCENTS */}
        <Card className="p-6">
          <h2 className="text-base font-semibold text-text-primary mb-4">Accents</h2>
          <Controller
            control={control}
            name="accents"
            render={({ field }) => (
              <TagInput
                value={field.value ?? []}
                onChange={field.onChange}
                placeholder="Add an accent (e.g. American, British)"
              />
            )}
          />
        </Card>

        {/* PHYSICAL */}
        <Card className="p-6">
          <h2 className="text-base font-semibold text-text-primary mb-4">Physical attributes</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <TextInput
              label="Height (cm)"
              type="number"
              {...register("physical_attributes.height_cm", { setValueAs: numberOrUndefined })}
              error={!!errors.physical_attributes?.height_cm}
            />
            <TextInput
              label="Weight (kg)"
              type="number"
              {...register("physical_attributes.weight_kg", { setValueAs: numberOrUndefined })}
              error={!!errors.physical_attributes?.weight_kg}
            />
            <Select
              label="Body type"
              {...register("physical_attributes.body_type")}
              options={dynamicOptions(watch("physical_attributes.body_type"), BODY_TYPES)}
              placeholder="Select…"
            />
            <Select
              label="Complexion"
              {...register("physical_attributes.complexion")}
              options={dynamicOptions(watch("physical_attributes.complexion"), COMPLEXIONS)}
              placeholder="Select…"
            />
            <Select
              label="Hair color"
              {...register("physical_attributes.hair_color")}
              options={dynamicOptions(watch("physical_attributes.hair_color"), HAIR_COLORS)}
              placeholder="Select…"
            />
            <Select
              label="Hair length"
              {...register("physical_attributes.hair_length")}
              options={dynamicOptions(watch("physical_attributes.hair_length"), HAIR_LENGTHS)}
              placeholder="Select…"
            />
            <Select
              label="Eye color"
              {...register("physical_attributes.eye_color")}
              options={dynamicOptions(watch("physical_attributes.eye_color"), EYE_COLORS)}
              placeholder="Select…"
            />
            <Textarea
              label="Distinctive features"
              {...register("physical_attributes.distinctive_features")}
              rows={3}
              maxLength={300}
              containerClassName="sm:col-span-2"
              error={!!errors.physical_attributes?.distinctive_features}
            />
          </div>
        </Card>

        {/* DOCUMENTS */}
        <Card className="p-6">
          <h2 className="text-base font-semibold text-text-primary mb-4">Documents</h2>
          <div className="space-y-4">
            <TextInput
              label="Resume URL"
              {...register("documents.resume_url")}
              placeholder="https://…"
            />
            <TextInput
              label="Portfolio PDF URL"
              {...register("documents.portfolio_pdf_url")}
              placeholder="https://…"
            />
            <TextInput
              label="Measurements sheet URL"
              {...register("documents.measurements_sheet_url")}
              placeholder="https://…"
            />
          </div>
        </Card>

        {/* SOCIAL */}
        <Card className="p-6">
          <h2 className="text-base font-semibold text-text-primary mb-4">Social links</h2>
          <div className="space-y-4">
            {(["instagram", "youtube", "linkedin"] as const).map((platform) => (
              <div key={platform} className="grid grid-cols-1 sm:grid-cols-[1fr_180px] gap-3">
                <TextInput
                  label={`${platform.charAt(0).toUpperCase()}${platform.slice(1)} URL`}
                  {...register(`social_links.${platform}.url`)}
                  placeholder="https://…"
                />
                <Select
                  label="Visibility"
                  {...register(`social_links.${platform}.visibility`)}
                  options={VISIBILITIES}
                />
              </div>
            ))}
          </div>
        </Card>

        {/* PRIVACY */}
        <Card className="p-6">
          <h2 className="text-base font-semibold text-text-primary mb-4">Privacy</h2>
          <Select
            label="Profile visibility"
            {...register("privacy_mode", { setValueAs: emptyToUndefined })}
            options={PRIVACY_MODE_OPTIONS}
            placeholder="Select…"
          />
        </Card>

        {/* SUBMIT */}
        <div className="fixed bottom-16 left-0 right-0 bg-card border-t border-border px-4 py-3 z-30">
          <div className="max-w-3xl mx-auto flex items-center justify-between gap-3">
            <p className="text-xs text-text-muted truncate">
              {watchedUsername ? `@${watchedUsername}` : "Username required"}
            </p>
            <div className="flex items-center gap-2">
              {mode === "edit" && profile && (
                <Button
                  type="button"
                  variant="outline"
                  className="px-4"
                  onClick={() => {
                    setIsEditing(false);
                    setSaveError(null);
                    setSaveSuccess(false);
                    reset(hydrateFromServer(profile));
                  }}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
              )}
              <Button type="submit" isLoading={isSubmitting} loadingLabel="Saving…" className="px-6">
                {mode === "create" ? "Create profile" : "Save changes"}
              </Button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
