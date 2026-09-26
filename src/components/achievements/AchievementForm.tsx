"use client";

import { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { toast } from "sonner";
import { Check, FileCheck2, Loader2, Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
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
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import type { Achievement, AchievementType } from "@/lib/api/talent";
import { talentApi } from "@/lib/api/talent";
import {
  ACHIEVEMENT_TYPE_CONFIG,
  ACHIEVEMENT_TYPE_VALUES,
  getAchievementOrganization,
  getAchievementTitle,
  VERIFICATION_OPTIONS,
} from "./achievement-types";
import { useCreateAchievement, useUpdateAchievement } from "@/hooks/use-experience";

const draftStorageKey = "rootin-achievement-draft";

const optionalYear = z.preprocess(
  (value) => (value === "" || value === null || value === undefined ? undefined : Number(value)),
  z.number().int().min(1900, "Enter a valid year").max(2100, "Enter a valid year").optional(),
);

const achievementFormSchema = z.object({
  type: z.enum(ACHIEVEMENT_TYPE_VALUES as [AchievementType, ...AchievementType[]]),
  title: z.string().trim().min(1, "Title / name is required").max(200, "Max 200 characters"),
  category: z.string().max(120, "Max 120 characters").optional(),
  role_level: z.string().max(200, "Max 200 characters").optional(),
  organization: z.string().trim().min(1, "Organisation is required").max(200, "Max 200 characters"),
  institution: z.string().max(200, "Max 200 characters").optional(),
  trainer: z.string().max(200, "Max 200 characters").optional(),
  director: z.string().max(200, "Max 200 characters").optional(),
  platform: z.string().max(200, "Max 200 characters").optional(),
  year: optionalYear,
  start_date: z.string().optional(),
  end_date: z.string().optional(),
  description: z.string().max(500, "Max 500 characters").optional(),
  media_url: z.string().url("Enter a valid URL").or(z.literal("")),
  verification_status: z.enum(["self_reported", "public_record", "recruiter_cosigned"]).optional(),
  verification_method: z.string().optional(),
  proof_url: z.string().optional(),
});

type AchievementFormValues = z.infer<typeof achievementFormSchema>;

interface AchievementFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  achievement?: Achievement;
}

function getDefaultValues(achievement?: Achievement): AchievementFormValues {
  return {
    type: achievement?.type ?? "award",
    title: achievement ? getAchievementTitle(achievement) : "",
    category: achievement?.category ?? "",
    role_level: achievement?.role_level ?? achievement?.role_played ?? "",
    organization: achievement ? getAchievementOrganization(achievement) : "",
    institution: achievement?.institution ?? "",
    trainer: achievement?.trainer ?? achievement?.director ?? "",
    director: achievement?.director ?? "",
    platform: achievement?.platform ?? "",
    year: achievement?.year,
    start_date: achievement?.start_date ?? "",
    end_date: achievement?.end_date ?? "",
    description: achievement?.description ?? "",
    media_url: achievement?.media_url ?? achievement?.credit_url ?? "",
    verification_status: achievement?.verification_status ?? "self_reported",
    verification_method: achievement?.verification_method ?? achievement?.verification_status ?? "self_reported",
    proof_url: achievement?.proof_url ?? "",
  };
}

function getTypeLabel(type: AchievementType) {
  return ACHIEVEMENT_TYPE_CONFIG[type].label;
}

function getOrganizationLabel(type: AchievementType) {
  if (type === "credit") return "Production Company *";
  if (type === "training" || type === "workshop" || type === "certification" || type === "institution") {
    return "Institution / Organisation *";
  }
  return "Organisation / Event *";
}

function getRoleLabel(type: AchievementType) {
  if (type === "credit") return "Role";
  if (type === "training" || type === "workshop" || type === "certification") return "Role / Level";
  return "Category / Role";
}

function getPayload(data: AchievementFormValues, proofPath?: string) {
  const isCredit = data.type === "credit";
  const isAwardOrNomination = data.type === "award" || data.type === "nomination";
  return {
    type: data.type,
    title: data.title.trim(),
    organization: data.organization.trim(),
    category: data.category?.trim() || undefined,
    role_level: data.role_level?.trim() || undefined,
    institution: data.institution?.trim() || undefined,
    trainer: data.trainer?.trim() || undefined,
    director: data.director?.trim() || undefined,
    platform: data.platform?.trim() || undefined,
    year: data.year || undefined,
    start_date: data.start_date || undefined,
    end_date: data.end_date || undefined,
    description: data.description?.trim() || undefined,
    media_url: data.media_url || undefined,
    ...(proofPath ? { proof_url: proofPath } : {}),
    verification_status: data.verification_status || undefined,
    verification_method: data.verification_method || undefined,
    project_name: isCredit ? data.title.trim() : undefined,
    role_played: isCredit ? data.role_level?.trim() || undefined : undefined,
    credit_url: isCredit ? data.media_url || undefined : undefined,
    awarding_body: isAwardOrNomination ? data.organization.trim() : undefined,
  };
}

export function AchievementForm({ open, onOpenChange, achievement }: AchievementFormProps) {
  const isEditing = Boolean(achievement);
  const createMutation = useCreateAchievement();
  const updateMutation = useUpdateAchievement();
  const [step, setStep] = useState(0);
  const [proofPath, setProofPath] = useState<string | undefined>();
  const [proofName, setProofName] = useState<string | undefined>();
  const [uploadingProof, setUploadingProof] = useState(false);
  const form = useForm<AchievementFormValues>({
    resolver: zodResolver(achievementFormSchema),
    mode: "onTouched",
    defaultValues: getDefaultValues(achievement),
  });
  const selectedType = form.watch("type");
  const description = form.watch("description") || "";
  const isPending = createMutation.isPending || updateMutation.isPending || uploadingProof;

  useEffect(() => {
    if (!open) return;
    setStep(0);
    setProofPath(undefined);
    setProofName(achievement?.proof_url ? "Existing proof attached" : undefined);
    if (achievement) {
      form.reset(getDefaultValues(achievement));
      return;
    }

    const storedDraft = window.localStorage.getItem(draftStorageKey);
    if (!storedDraft) {
      form.reset(getDefaultValues());
      return;
    }

    try {
      const draft = JSON.parse(storedDraft) as {
        values?: Partial<AchievementFormValues>;
        proofPath?: string;
        proofName?: string;
      };
      form.reset({ ...getDefaultValues(), ...draft.values });
      setProofPath(draft.proofPath);
      setProofName(draft.proofName);
    } catch {
      window.localStorage.removeItem(draftStorageKey);
      form.reset(getDefaultValues());
    }
  }, [achievement, form, open]);

  async function validateStep() {
    if (step === 0) return form.trigger(["type", "title"]);
    if (step === 1) {
      const valid = await form.trigger(["organization"]);
      if (!form.getValues("year")) {
        form.setError("year", { message: "Year is required" });
        return false;
      }
      return valid;
    }
    return true;
  }

  async function handleNext() {
    if (!(await validateStep())) return;
    setStep((current) => Math.min(current + 1, 3));
  }

  async function handleProofUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Proof must be under 5 MB");
      return;
    }
    if (![
      "image/jpeg",
      "image/png",
      "image/webp",
      "application/pdf",
    ].includes(file.type)) {
      toast.error("Upload a JPG, PNG, WEBP or PDF file");
      return;
    }

    setUploadingProof(true);
    try {
      const response = await talentApi.uploadAchievementProof(file);
      setProofPath(response.relativePath);
      setProofName(file.name);
      toast.success("Proof uploaded");
    } catch {
      toast.error("Proof upload failed");
    } finally {
      setUploadingProof(false);
    }
  }

  function saveDraft() {
    window.localStorage.setItem(
      draftStorageKey,
      JSON.stringify({ values: form.getValues(), proofPath, proofName }),
    );
    toast.success("Draft saved on this device");
  }

  async function handleSave(data: AchievementFormValues) {
    if (!data.year) {
      setStep(1);
      form.setError("year", { message: "Year is required" });
      return;
    }

    const payload = getPayload(data, proofPath);
    try {
      if (isEditing && achievement) {
        const { type: _type, ...updateData } = payload;
        await updateMutation.mutateAsync({ id: achievement._id, data: updateData });
        toast.success("Achievement updated");
      } else {
        await createMutation.mutateAsync(payload);
        toast.success("Achievement added");
      }
      window.localStorage.removeItem(draftStorageKey);
      onOpenChange(false);
    } catch {
      toast.error("Could not save achievement");
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        className="max-h-[94svh] gap-0 overflow-hidden rounded-t-[28px] border-[#e9e5f8] bg-[#fbfaff] p-0 sm:inset-y-0 sm:inset-x-auto sm:right-0 sm:h-full sm:w-full sm:max-w-xl sm:rounded-none sm:border-l sm:border-t-0"
      >
        <SheetHeader className="shrink-0 border-b border-[#ece9f7] bg-white/90 px-5 pb-4 pt-5 text-left backdrop-blur-xl sm:px-7">
          <div className="flex items-start justify-between gap-3 pr-6">
            <div>
              <SheetTitle className="text-[20px] tracking-[-0.04em] text-[#14225b]">
                {isEditing ? "Edit Achievement" : "Add New Achievement"}
              </SheetTitle>
              <SheetDescription className="mt-1 text-[11px] leading-relaxed text-[#777993]">
                Keep your milestone story clear, visual and easy to trust.
              </SheetDescription>
            </div>
            <span className="rounded-full bg-[#f1edff] px-2.5 py-1 text-[10px] font-extrabold text-[#5e34d7]">
              Step {step + 1} of 4
            </span>
          </div>
          <div className="mt-4 grid grid-cols-4 gap-1.5" aria-label="Achievement form progress">
            {["Basic Details", "Organisation", "Description", "Media & Proof"].map((label, index) => (
              <Button
                key={label}
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => index < step && setStep(index)}
                className="min-w-0 text-left disabled:cursor-default"
                disabled={index >= step}
              >
                <span className={`mb-1 block h-1 rounded-full ${index <= step ? "bg-[#6840df]" : "bg-[#e7e4f4]"}`} />
                <span className={`block truncate text-[9px] font-bold ${index <= step ? "text-[#5e34d7]" : "text-[#a0a1b5]"}`}>
                  {label}
                </span>
              </Button>
            ))}
          </div>
        </SheetHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSave)} className="flex min-h-0 flex-1 flex-col">
            <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5 sm:px-7">
              {step === 0 && (
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Achievement Type *</FormLabel>
                        <Select value={field.value} onValueChange={field.onChange} disabled={isEditing}>
                          <FormControl>
                            <SelectTrigger className="h-12 rounded-2xl border-[#e1def0] bg-white text-xs">
                              <SelectValue placeholder="Choose a type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {ACHIEVEMENT_TYPE_VALUES.map((type) => (
                              <SelectItem key={type} value={type}>
                                {getTypeLabel(type)}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Title / Name *</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Best Actor (Feature Film)" className="h-12 rounded-2xl border-[#e1def0] bg-white text-xs" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="grid gap-4 sm:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="category"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Category</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Feature film, voice, screen" className="h-12 rounded-2xl border-[#e1def0] bg-white text-xs" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="role_level"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{getRoleLabel(selectedType)}</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder={selectedType === "credit" ? "Lead Actor" : "Advanced Acting"} className="h-12 rounded-2xl border-[#e1def0] bg-white text-xs" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              )}

              {step === 1 && (
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="organization"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{getOrganizationLabel(selectedType)}</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder={selectedType === "credit" ? "Skyline Pictures" : "Mumbai Film Awards"} className="h-12 rounded-2xl border-[#e1def0] bg-white text-xs" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  {(selectedType === "training" || selectedType === "workshop" || selectedType === "certification" || selectedType === "institution") && (
                    <FormField
                      control={form.control}
                      name="institution"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Institution / Production Company</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="The Actor's Studio" className="h-12 rounded-2xl border-[#e1def0] bg-white text-xs" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
                  {(selectedType === "credit" || selectedType === "training" || selectedType === "workshop") && (
                    <FormField
                      control={form.control}
                      name={selectedType === "credit" ? "director" : "trainer"}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{selectedType === "credit" ? "Director" : "Trainer"}</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder={selectedType === "credit" ? "Jane Smith" : "Anupam Kher"} className="h-12 rounded-2xl border-[#e1def0] bg-white text-xs" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
                  <div className="grid gap-4 sm:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="year"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Year *</FormLabel>
                          <FormControl>
                            <Input type="number" inputMode="numeric" {...field} value={field.value ?? ""} placeholder="2024" className="h-12 rounded-2xl border-[#e1def0] bg-white text-xs" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    {selectedType === "credit" && (
                      <FormField
                        control={form.control}
                        name="platform"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Platform</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="Netflix, theatre, YouTube" className="h-12 rounded-2xl border-[#e1def0] bg-white text-xs" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}
                  </div>
                  {(selectedType === "training" || selectedType === "workshop") && (
                    <div className="grid gap-4 sm:grid-cols-2">
                      <FormField
                        control={form.control}
                        name="start_date"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Start date</FormLabel>
                            <FormControl>
                              <Input type="date" {...field} className="h-12 rounded-2xl border-[#e1def0] bg-white text-xs" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="end_date"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>End date</FormLabel>
                            <FormControl>
                              <Input type="date" {...field} className="h-12 rounded-2xl border-[#e1def0] bg-white text-xs" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  )}
                </div>
              )}

              {step === 2 && (
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <div className="flex items-center justify-between gap-3">
                          <FormLabel>Description</FormLabel>
                          <span className="text-[10px] font-semibold text-[#9a9bb0]">{description.length}/500</span>
                        </div>
                        <FormControl>
                          <Textarea
                            {...field}
                            maxLength={500}
                            rows={8}
                            placeholder="Share a short description, highlights or what this achievement means to you..."
                            className="resize-none rounded-2xl border-[#e1def0] bg-white text-xs leading-relaxed"
                          />
                        </FormControl>
                        <FormDescription className="text-[10px] text-[#8b8da6]">
                          Optional. A clear detail helps recruiters understand the milestone.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}

              {step === 3 && (
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="media_url"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Media Link</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="YouTube, IMDb, article, portfolio link..." className="h-12 rounded-2xl border-[#e1def0] bg-white text-xs" />
                        </FormControl>
                        <FormDescription className="text-[10px] text-[#8b8da6]">Optional external link for this achievement.</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="verification_method"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Verification Method</FormLabel>
                        <Select
                          value={field.value || "self_reported"}
                          onValueChange={(value) => {
                            field.onChange(value);
                            form.setValue("verification_status", value as AchievementFormValues["verification_status"]);
                          }}
                        >
                          <FormControl>
                            <SelectTrigger className="h-12 rounded-2xl border-[#e1def0] bg-white text-xs">
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {VERIFICATION_OPTIONS.map((option) => (
                              <SelectItem key={option.value} value={option.value}>
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div>
                    <p className="text-sm font-semibold text-[#14225b]">Upload Proof <span className="font-normal text-[#9294aa]">(Optional)</span></p>
                    <label className="mt-2 flex min-h-[128px] cursor-pointer flex-col items-center justify-center rounded-[22px] border border-dashed border-[#cfc7f3] bg-[#f7f4ff] px-5 text-center transition-colors hover:bg-[#f1edff]">
                      <input type="file" accept="image/jpeg,image/png,image/webp,application/pdf" className="sr-only" onChange={handleProofUpload} disabled={isPending} />
                      {uploadingProof ? (
                        <Loader2 className="size-7 animate-spin text-[#6840df]" />
                      ) : proofName ? (
                        <>
                          <span className="grid size-10 place-items-center rounded-full bg-[#e8e1ff] text-[#6840df]"><Check className="size-5" /></span>
                          <span className="mt-2 max-w-full truncate text-xs font-bold text-[#5e34d7]">{proofName}</span>
                          <span className="mt-1 text-[10px] text-[#8587a2]">Tap to replace</span>
                        </>
                      ) : (
                        <>
                          <span className="grid size-10 place-items-center rounded-full bg-white text-[#6840df] shadow-sm"><Upload className="size-5" /></span>
                          <span className="mt-2 text-xs font-bold text-[#5e34d7]">Upload Proof</span>
                          <span className="mt-1 text-[10px] text-[#8587a2]">JPG, PNG, WEBP or PDF up to 5 MB</span>
                        </>
                      )}
                    </label>
                    {proofPath && (
                      <p className="mt-2 flex items-center gap-1 text-[10px] font-semibold text-[#18805a]"><FileCheck2 className="size-3.5" /> Proof ready to save</p>
                    )}
                  </div>
                </div>
              )}
            </div>

            <SheetFooter className="shrink-0 border-t border-[#e9e5f8] bg-white/95 px-5 py-3.5 backdrop-blur-xl sm:px-7">
              <div className="flex w-full items-center gap-2">
                <Button type="button" variant="ghost" onClick={() => onOpenChange(false)} disabled={isPending} className="h-11 flex-1 rounded-full text-xs font-bold text-[#777993] hover:bg-[#f4f2fb]">
                  <X className="size-4" /> Cancel
                </Button>
                <Button type="button" variant="outline" onClick={saveDraft} disabled={isPending} className="h-11 flex-1 rounded-full border-[#ded8f5] bg-white text-xs font-bold text-[#5e34d7] hover:bg-[#f8f5ff]">
                  Save Draft
                </Button>
                {step < 3 ? (
                  <Button type="button" onClick={handleNext} disabled={isPending} className="h-11 flex-[1.35] rounded-full bg-gradient-to-r from-[#4d20ed] via-[#7732ed] to-[#c936ed] text-xs font-bold text-white shadow-[0_8px_20px_rgba(111,45,226,0.24)] hover:brightness-105">
                    Continue
                  </Button>
                ) : (
                  <Button type="submit" disabled={isPending} className="h-11 flex-[1.35] rounded-full bg-gradient-to-r from-[#4d20ed] via-[#7732ed] to-[#c936ed] text-xs font-bold text-white shadow-[0_8px_20px_rgba(111,45,226,0.24)] hover:brightness-105">
                    {isPending && <Loader2 className="size-4 animate-spin" />}
                    {isEditing ? "Save Changes" : "Save Achievement"}
                  </Button>
                )}
              </div>
            </SheetFooter>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
}
