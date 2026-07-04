"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  ArrowLeft,
  Eye,
  Save,
  Loader2,
  Check,
  User,
  Briefcase,
  SlidersHorizontal,
} from "lucide-react";
import { motion } from "motion/react";
import { AxiosError } from "axios";
import { usePopup } from "@/hooks/use-popup";
import { cn } from "@/lib/utils";
import { getApiErrorMessage } from "@/lib/formatters";
import { TalentCard } from "@/components/talent-card";
import { talentApi } from "@/lib/api";
import {
  getProfileSchema,
  createTalentProfileSchema,
  updateTalentProfileSchema,
  type CreateTalentProfileInput,
  type TalentProfile,
} from "@/lib/validations/talent-profile.schema";
import {
  DEFAULT_VALUES,
  hydrateFromServer,
  buildPayload,
} from "@/lib/talent-profile/form-helpers";
import { T } from "./shared";
import type { UploadSlot } from "./IdentityStep";
import { IdentityStep } from "./IdentityStep";
import { WorkStep } from "./WorkStep";
import { ExtrasStep } from "./ExtrasStep";

interface EditFormProps {
  mode: "create" | "edit";
  profile: TalentProfile | null;
  onSaved: (profile: TalentProfile) => void;
  onCancel: () => void;
  onConflictLoaded?: (profile: TalentProfile) => void;
}

const STEPS = [
  { label: "Identity", number: 1, icon: User },
  { label: "Work", number: 2, icon: Briefcase },
  { label: "Extras", number: 3, icon: SlidersHorizontal },
];

function getStepFields(step: number): (keyof CreateTalentProfileInput)[] {
  switch (step) {
    case 1:
      return [
        "hero_background",
        "username",
        "full_legal_name",
        "date_of_birth",
        "gender",
        "profile_photo",
        "headline",
        "about",
        "location",
      ] as (keyof CreateTalentProfileInput)[];
    case 2:
      return [
        "professions",
        "industries",
        "availability",
        "skills",
        "languages",
        "accents",
      ] as (keyof CreateTalentProfileInput)[];
    case 3:
      return [
        "physical_attributes",
        "documents",
        "social_links",
        "privacy_mode",
      ] as (keyof CreateTalentProfileInput)[];
    default:
      return [];
  }
}

export function ProfileEditWizard({
  mode,
  profile,
  onSaved,
  onCancel,
  onConflictLoaded,
}: EditFormProps) {
  const router = useRouter();
  const { show } = usePopup();
  const [step, setStep] = useState(1);
  const [isNavigating, setIsNavigating] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

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

  const schema =
    mode === "create" ? createTalentProfileSchema : updateTalentProfileSchema;

  const form = useForm<CreateTalentProfileInput>({
    resolver: zodResolver(schema) as any,
    defaultValues:
      mode === "edit" && profile ? hydrateFromServer(profile) : DEFAULT_VALUES,
    mode: "onChange",
  });

  const {
    formState: { errors, isSubmitting, isDirty },
    reset,
  } = form;

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
    if (photo.includes("/files/access?") && photo.includes("signature=")) {
      try {
        const parsed = new URL(photo);
        const relativePath = parsed.searchParams.get("path");
        if (relativePath) {
          form.setValue("profile_photo", relativePath, { shouldDirty: false });
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
    if (resume.includes("/files/access?") && resume.includes("signature=")) {
      try {
        const parsed = new URL(resume);
        const relativePath = parsed.searchParams.get("path");
        if (relativePath) {
          form.setValue("documents.resume_url", relativePath, {
            shouldDirty: false,
          });
          const base = relativePath.split("/").pop() || "Resume";
          setResumeName(base.replace(/^\d+-/, ""));
        }
      } catch {
        /* ignore */
      }
    } else {
      const base = resume.split("/").pop() || "Resume";
      setResumeName(base.replace(/^\d+-/, ""));
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
    setHeroBgPreview(bg);
  }, [profile]);

  const handlePhotoChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      setPhotoError(null);
      if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
        setPhotoError("Only JPEG, PNG, and WEBP images are allowed");
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setPhotoError("File size must be less than 5MB");
        return;
      }
      try {
        const { relativePath, signedUrl } =
          await talentApi.uploadProfilePhoto(file);
        form.setValue("profile_photo", relativePath, { shouldDirty: true });
        setPhotoPreview(signedUrl);
      } catch (err) {
        setPhotoError(getApiErrorMessage(err, "Failed to upload photo"));
      }
    },
    [form],
  );

  const handlePhotoClear = useCallback(() => {
    form.setValue("profile_photo", "", { shouldDirty: true });
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
          "application/pdf",
          "application/msword",
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        ].includes(file.type)
      ) {
        setResumeError("Only PDF, DOC, and DOCX files are allowed");
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        setResumeError("File size must be less than 10MB");
        return;
      }
      setResumeUploading(true);
      try {
        const { relativePath, signedUrl } =
          await talentApi.uploadDocument(file);
        form.setValue("documents.resume_url", relativePath, {
          shouldDirty: true,
        });
        setResumePreview(signedUrl);
        setResumeName(file.name);
      } catch (err) {
        setResumeError(getApiErrorMessage(err, "Failed to upload document"));
      } finally {
        setResumeUploading(false);
      }
    },
    [form],
  );

  const handleResumeClear = useCallback(() => {
    form.setValue("documents.resume_url", "", { shouldDirty: true });
    setResumePreview(null);
    setResumeName(null);
    setResumeError(null);
  }, [form]);

  const handleHeroBgChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      setHeroBgError(null);
      if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
        setHeroBgError("Only JPEG, PNG, and WEBP images are allowed");
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setHeroBgError("File size must be less than 5MB");
        return;
      }
      setHeroBgUploading(true);
      try {
        const { relativePath, signedUrl } =
          await talentApi.uploadProfilePhoto(file);
        form.setValue("hero_background", relativePath, { shouldDirty: true });
        setHeroBgPreview(signedUrl);
      } catch (err) {
        setHeroBgError(
          getApiErrorMessage(err, "Failed to upload background"),
        );
      } finally {
        setHeroBgUploading(false);
      }
    },
    [form],
  );

  const handleHeroBgColor = useCallback(
    (color: string) => {
      form.setValue("hero_background", color, { shouldDirty: true });
      setHeroBgPreview(color);
      setHeroBgError(null);
    },
    [form],
  );

  const handleHeroBgClear = useCallback(() => {
    form.setValue("hero_background", "", { shouldDirty: true });
    setHeroBgPreview(null);
    setHeroBgError(null);
  }, [form]);

  const onNext = async () => {
    setServerError(null);
    const fields = getStepFields(step);
    const valid = await form.trigger(fields as Parameters<typeof form.trigger>[0]);
    if (valid) {
      setIsNavigating(true);
      setStep((s) => Math.min(s + 1, 3));
      window.scrollTo({ top: 0, behavior: "smooth" });
      setTimeout(() => setIsNavigating(false), 100);
    }
  };

  const onBack = () => {
    setServerError(null);
    setStep((s) => Math.max(s - 1, 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const goToStep = (n: number) => {
    if (n >= step) return;
    setServerError(null);
    setStep(n);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const onSubmit = form.handleSubmit(async (values) => {
    setServerError(null);
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
        description:
          mode === "create"
            ? "Your profile has been created."
            : "Your changes have been saved.",
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
        form.setError("username", {
          type: "manual",
          message: "Username already taken",
        });
        setStep(1);
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
            return;
          }
        } catch {
          /* ignore */
        }
      }
      setServerError(
        getApiErrorMessage(
          err,
          mode === "create"
            ? "Failed to create profile"
            : "Failed to update profile",
        ),
      );
    }
  });

  const photoSlot: UploadSlot = {
    inputRef: photoInputRef,
    preview: photoPreview,
    error: photoError,
    onChange: handlePhotoChange,
    onClear: handlePhotoClear,
  };

  const heroBgSlot: UploadSlot & { onColor: (color: string) => void } = {
    inputRef: heroBgInputRef,
    preview: heroBgPreview,
    error: heroBgError,
    uploading: heroBgUploading,
    onChange: handleHeroBgChange,
    onClear: handleHeroBgClear,
    onColor: handleHeroBgColor,
  };

  const resumeSlot = {
    inputRef: resumeInputRef,
    preview: resumePreview,
    error: resumeError,
    uploading: resumeUploading,
    onChange: handleResumeChange,
    onClear: handleResumeClear,
    name: resumeName,
  };

  const displayUsername = form.watch("username") || profile?.username;
  const isLastStep = step === 3;

  return (
    <div
      className="min-h-screen"
      style={{ background: "var(--color-cream-pale)" }}
    >
      {/* TopBar */}
      <header
        className="sticky top-0 z-40 backdrop-blur-xl border-b border-border/40"
        style={{ background: "var(--color-cream-pale)/85" }}
      >
        <div className="flex items-center justify-between px-5 py-3">
          <button
            type="button"
            onClick={() => router.push("/talent/dashboard")}
            className="flex items-center gap-2 text-ink hover:text-gold-ink transition-colors"
          >
            <ArrowLeft
              className="h-4 w-4 text-gold"
              strokeWidth={2}
            />
            <span className="font-serif text-[15px] font-semibold tracking-tight">
              {mode === "create" ? "Create profile" : "Edit profile"}
            </span>
          </button>
          <div className="flex items-center gap-3">
            {mode === "edit" && displayUsername && (
              <button
                type="button"
                onClick={() => router.push(`/talent/${displayUsername}`)}
                className="hidden sm:inline-flex items-center gap-1.5 text-[12px] font-medium px-3 py-1.5 rounded-full border border-gold/25 bg-gold-soft text-gold-ink hover:bg-gold-soft/80 transition-colors"
              >
                <Eye className="h-3.5 w-3.5" />
                Preview
              </button>
            )}
            <Button
              type="button"
              onClick={(onSubmit)}
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
              {isSubmitting && (
                <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />
              )}
              {mode === "create" ? "Create" : "Save"}
            </Button>
          </div>
        </div>
        {mode === "edit" && displayUsername && (
          <div className="sm:hidden px-5 pb-2.5">
            <button
              type="button"
              onClick={() => router.push(`/talent/${displayUsername}`)}
              className="w-full inline-flex items-center justify-center gap-1.5 text-[12px] font-medium px-3 py-2 rounded-xl border border-gold/25 bg-gold-soft/60 text-gold-ink active:scale-[0.98] transition-all"
            >
              <Eye className="h-3.5 w-3.5" />
              Preview profile
            </button>
          </div>
        )}
      </header>

      <div className="flex">
        {/* Main content */}
        <div className="flex-1 min-w-0">
          <Form {...form}>
            <form
              id="profile-form"
              onSubmit={onSubmit}
              className="px-4 lg:px-8 space-y-6 max-w-5xl mx-auto pt-6 pb-24"
            >
              {/* TalentCard preview */}
              <div className="px-4 mb-6 lg:px-8 max-w-5xl mx-auto">
                <p
                  className="text-xs sm:text-sm mb-3 px-1"
                  style={{ color: T.inkMuted }}
                >
                  Preview: how recruiters will see you
                </p>
                <TalentCard sample heroBackground={heroBgPreview} />
              </div>

              {serverError && (
                <Alert variant="destructive" className="mx-auto max-w-3xl">
                  <AlertDescription>{serverError}</AlertDescription>
                </Alert>
              )}

              {/* Step indicator */}
              <div className="mx-auto max-w-3xl">
                <div className="flex items-center gap-1 mb-5">
                  {STEPS.map((s, idx) => {
                    const isActive = step === s.number;
                    const isDone = step > s.number;
                    const StepIcon = s.icon;
                    return (
                      <div
                        key={s.number}
                        className="flex items-center flex-1 last:flex-none"
                      >
                        <button
                          type="button"
                          onClick={() => goToStep(s.number)}
                          className={cn(
                            "flex items-center gap-2 px-3 py-2 rounded-xl transition-all duration-200",
                            isActive
                              ? "bg-ink text-white shadow-sm"
                              : isDone
                                ? "bg-emerald-50 text-emerald-700"
                                : "text-ink-muted hover:bg-muted-bg",
                          )}
                        >
                          <span
                            className={cn(
                              "w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0 transition-all",
                              isActive
                                ? "bg-white/20"
                                : isDone
                                  ? "bg-emerald-100"
                                  : "bg-muted-bg",
                            )}
                          >
                            {isDone ? (
                              <Check
                                className="w-3 h-3"
                                strokeWidth={2.5}
                              />
                            ) : (
                              <StepIcon
                                className="w-3 h-3"
                                strokeWidth={isActive ? 2 : 1.5}
                              />
                            )}
                          </span>
                          <span
                            className={cn(
                              "text-xs font-semibold hidden sm:inline",
                              isDone && "text-emerald-700",
                            )}
                          >
                            {s.label}
                          </span>
                        </button>
                        {idx < STEPS.length - 1 && (
                          <div className="flex-1 h-px bg-border mx-1" />
                        )}
                      </div>
                    );
                  })}
                </div>

                <div className="h-1 bg-muted-bg rounded-full overflow-hidden mb-2">
                  <div
                    className="h-full bg-gradient-to-r from-gold to-gold-hover rounded-full transition-all duration-500 ease-out"
                    style={{ width: `${(step / 3) * 100}%` }}
                  />
                </div>
              </div>

              {/* Step content */}
              <div
                className={cn(
                  "transition-all duration-300",
                  step === 1 ? "block opacity-100" : "hidden opacity-0",
                )}
              >
                <div className="mx-auto max-w-3xl">
                  <h2 className="text-lg font-serif font-semibold text-ink mb-1">
                    Basic Profile
                  </h2>
                  <p className="text-sm text-ink-muted mb-6">
                    Set up your identity — photo, name, headline, and
                    location.
                  </p>
                </div>
                <div className="mx-auto max-w-3xl">
                  <IdentityStep
                    mode={mode}
                    photo={photoSlot}
                    heroBg={heroBgSlot}
                  />
                </div>
              </div>

              <div
                className={cn(
                  "transition-all duration-300",
                  step === 2 ? "block opacity-100" : "hidden opacity-0",
                )}
              >
                <div className="mx-auto max-w-3xl">
                  <h2 className="text-lg font-serif font-semibold text-ink mb-1">
                    Work & Skills
                  </h2>
                  <p className="text-sm text-ink-muted mb-6">
                    Add your professions, availability, skills, and languages.
                  </p>
                </div>
                <div className="mx-auto max-w-3xl">
                  <WorkStep />
                </div>
              </div>

              <div
                className={cn(
                  "transition-all duration-300",
                  step === 3 ? "block opacity-100" : "hidden opacity-0",
                )}
              >
                <div className="mx-auto max-w-3xl">
                  <h2 className="text-lg font-serif font-semibold text-ink mb-1">
                    Details & Privacy
                  </h2>
                  <p className="text-sm text-ink-muted mb-6">
                    Physical attributes, resume, social links, and privacy
                    settings.
                  </p>
                </div>
                <div className="mx-auto max-w-3xl">
                  <ExtrasStep resume={resumeSlot} />
                </div>
              </div>

              {/* Step navigation */}
              <div className="mx-auto max-w-3xl flex items-center gap-3 pt-2">
                {step > 1 && (
                  <button
                    type="button"
                    onClick={onBack}
                    className="px-4 py-2.5 rounded-xl text-sm font-medium border border-border/60 bg-card text-ink-soft hover:text-ink hover:bg-cream-soft transition-all shrink-0"
                  >
                    Back
                  </button>
                )}
                {!isLastStep ? (
                  <button
                    type="button"
                    onClick={onNext}
                    disabled={isNavigating}
                    className="px-5 py-2.5 rounded-xl text-sm font-semibold bg-gradient-to-br from-gold to-gold-hover text-white hover:from-gold-bright hover:to-gold shadow-[0_4px_14px_-4px_oklch(0.74_0.13_80/0.45)] transition-all active:scale-[0.98] disabled:opacity-50 ml-auto flex items-center gap-1.5"
                  >
                    Next
                    <svg
                      className="w-3.5 h-3.5"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                  </button>
                ) : (
                  <button
                    type="submit"
                    form="profile-form"
                    disabled={isSubmitting || (mode === "edit" && !isDirty)}
                    className={cn(
                      "px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-all active:scale-[0.98] disabled:opacity-50 ml-auto flex items-center gap-1.5 shadow-md",
                      "bg-gradient-to-b from-gold to-gold-dark",
                      "hover:from-gold-hover hover:to-gold-dark",
                      "shadow-[0_6px_20px_-10px_var(--color-gold-dark)]",
                    )}
                  >
                    {isSubmitting && (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    )}
                    <Save className="h-4 w-4" strokeWidth={2} />
                    {mode === "create" ? "Create profile" : "Save changes"}
                  </button>
                )}
              </div>
            </form>
          </Form>
        </div>
      </div>

      {/* Mobile sticky save */}
      <div className="fixed bottom-0 inset-x-0 z-30 px-4 pb-4 pt-3 bg-gradient-to-t from-cream-pale via-cream-pale/95 to-transparent lg:hidden">
        <div className="max-w-3xl mx-auto rounded-2xl border border-border/50 bg-card shadow-luxe-lg p-2.5 flex items-center gap-2">
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
            disabled={isSubmitting || (mode === "edit" && !isDirty)}
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
        </div>
      </div>
    </div>
  );
}
