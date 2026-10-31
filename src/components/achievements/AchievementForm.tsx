"use client";

import { useEffect, useState, type ChangeEvent, type FormEvent } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch, type Resolver } from "react-hook-form";
import { z } from "zod";
import { toast } from "sonner";
import { Check, ImagePlus, Loader2, Upload, X } from "lucide-react";
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
} from "./achievement-types";
import { useCreateAchievement, useUpdateAchievement } from "@/hooks/use-experience";

const defaultDraftStorageKey = "rootin-achievement-draft";

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
  proof_url: z.string().optional(),
  verification_status: z.enum(["self_reported", "public_record", "recruiter_cosigned"]).optional(),
  verification_method: z.string().optional(),
});

type AchievementFormValues = z.infer<typeof achievementFormSchema>;

interface AchievementFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  achievement?: Achievement;
  fixedType?: AchievementType;
  mode?: "default" | "credits";
}

function getDefaultValues(
  achievement: Achievement | undefined,
  defaultType: AchievementType,
): AchievementFormValues {
  return {
    type: achievement?.type ?? defaultType,
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
    media_url: achievement?.media_url || achievement?.credit_url || "",
    proof_url: "",
    verification_status: achievement?.verification_status ?? "self_reported",
    verification_method: achievement?.verification_method ?? achievement?.verification_status ?? "self_reported",
  };
}

function getTitleLabel(type: AchievementType) {
  if (type === "credit") return "Project / Credit *";
  return "Title / Name *";
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
  return "Category / Role";
}

function getPayload(
  data: AchievementFormValues,
  mode: "default" | "credits" = "default",
) {
  const isCredit = data.type === "credit";
  const isAwardOrNomination = data.type === "award" || data.type === "nomination";
  const mediaUrl = data.media_url || (data.proof_url ? "" : undefined);

  if (isCredit && mode === "credits") {
    return {
      type: data.type,
      project_name: data.title.trim(),
      role_played: data.role_level?.trim() || undefined,
      platform: data.organization.trim() || undefined,
      director: data.director?.trim() || undefined,
      year: data.year || undefined,
      description: data.description?.trim() || undefined,
      media_url: mediaUrl,
      credit_url: mediaUrl,
      ...(data.proof_url ? { proof_url: data.proof_url } : {}),
      verification_status: data.verification_status || undefined,
      verification_method: data.verification_method || undefined,
    };
  }

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
    media_url: mediaUrl,
    ...(data.proof_url ? { proof_url: data.proof_url } : {}),
    verification_status: data.verification_status || undefined,
    verification_method: data.verification_method || undefined,
    project_name: isCredit ? data.title.trim() : undefined,
    role_played: isCredit ? data.role_level?.trim() || undefined : undefined,
    credit_url: isCredit ? mediaUrl : undefined,
    awarding_body: isAwardOrNomination ? data.organization.trim() : undefined,
  };
}

export function AchievementForm({
  open,
  onOpenChange,
  achievement,
  fixedType,
  mode = "default",
}: AchievementFormProps) {
  const isEditing = Boolean(achievement);
  const createMutation = useCreateAchievement();
  const updateMutation = useUpdateAchievement();
  const [uploadingProof, setUploadingProof] = useState(false);
  const draftStorageKey =
    mode === "default" ? defaultDraftStorageKey : `${defaultDraftStorageKey}-${mode}`;
  const form = useForm<AchievementFormValues>({
    resolver: zodResolver(achievementFormSchema) as unknown as Resolver<AchievementFormValues>,
    mode: "onTouched",
    defaultValues: getDefaultValues(achievement, fixedType ?? "award"),
  });
  const selectedType = useWatch({ control: form.control, name: "type" });
  const description = useWatch({ control: form.control, name: "description" }) || "";
  const uploadedProof = useWatch({ control: form.control, name: "proof_url" });
  const proofName = uploadedProof
    ? "Image ready to save"
    : achievement?.proof_url
      ? "Existing image attached"
      : undefined;
  const isPending = createMutation.isPending || updateMutation.isPending || uploadingProof;

  useEffect(() => {
    if (!open) return;
    if (achievement) {
      form.reset(getDefaultValues(achievement, fixedType ?? "award"));
      return;
    }

    const storedDraft = window.localStorage.getItem(draftStorageKey);
    if (!storedDraft) {
      form.reset(getDefaultValues(undefined, fixedType ?? "award"));
      return;
    }

    try {
      const draft = JSON.parse(storedDraft) as {
        values?: Partial<AchievementFormValues>;
      };
      form.reset({
        ...getDefaultValues(undefined, fixedType ?? "award"),
        ...draft.values,
        ...(fixedType ? { type: fixedType } : {}),
      });
    } catch {
      window.localStorage.removeItem(draftStorageKey);
      form.reset(getDefaultValues(undefined, fixedType ?? "award"));
    }
  }, [achievement, draftStorageKey, fixedType, form, mode, open]);

  async function handleMediaUpload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be under 5 MB");
      return;
    }
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      toast.error("Upload a JPG, PNG or WEBP image");
      return;
    }

    setUploadingProof(true);
    try {
      const response = await talentApi.uploadAchievementProof(file);
      form.setValue("proof_url", response.relativePath, { shouldDirty: true });
      form.setValue("media_url", "", { shouldValidate: true });
      toast.success("Image uploaded");
    } catch {
      toast.error("Image upload failed");
    } finally {
      setUploadingProof(false);
    }
  }

  function saveDraft() {
    window.localStorage.setItem(
      draftStorageKey,
      JSON.stringify({ values: form.getValues() }),
    );
    toast.success("Draft saved on this device");
  }

  async function handleSave(data: AchievementFormValues) {
    const payload = getPayload(data, mode);
    try {
      if (isEditing && achievement) {
        const updateData = { ...payload };
        delete (updateData as { type?: unknown }).type;
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

  function handleFormSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void form.handleSubmit(handleSave)();
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        className="max-h-[94svh] gap-0 overflow-hidden rounded-t-[28px] border-[#e9e5f8] bg-[#fbfaff] p-0 sm:inset-y-0 sm:inset-x-auto sm:right-0 sm:h-full sm:w-full sm:max-w-xl sm:rounded-none sm:border-l sm:border-t-0"
      >
        <SheetHeader className="shrink-0 border-b border-[#ece9f7] bg-white/90 px-5 pb-4 pt-5 text-left backdrop-blur-xl sm:px-7">
          <SheetTitle className="text-[20px] tracking-[-0.04em] text-[#14225b]">
            {isEditing ? "Edit Achievement" : "Add New Achievement"}
          </SheetTitle>
          <SheetDescription className="mt-1 text-[11px] leading-relaxed text-[#777993]">
            Add the details recruiters see on your profile. Title and organisation are required.
          </SheetDescription>
        </SheetHeader>

        <Form {...form}>
          <form onSubmit={handleFormSubmit} className="flex min-h-0 flex-1 flex-col">
            <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-5 py-5 sm:px-7">
              {!fixedType && (
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
                              {ACHIEVEMENT_TYPE_CONFIG[type].label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{getTitleLabel(selectedType)}</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Best Actor (Feature Film)" className="h-12 rounded-2xl border-[#e1def0] bg-white text-xs" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
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
              {selectedType === "credit" && (
                <FormField
                  control={form.control}
                  name="role_level"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{getRoleLabel(selectedType)}</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Lead Actor" className="h-12 rounded-2xl border-[#e1def0] bg-white text-xs" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
              <FormField
                control={form.control}
                name="year"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Year</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        inputMode="numeric"
                        {...field}
                        value={field.value ?? ""}
                        placeholder="2025"
                        className="h-12 rounded-2xl border-[#e1def0] bg-white text-xs"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
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
                      <Textarea {...field} maxLength={500} rows={4} placeholder="Add a short description (optional)" className="resize-none rounded-2xl border-[#e1def0] bg-white text-xs leading-relaxed" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="media_url"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Image or YouTube link</FormLabel>
                    <FormControl>
                      <Input {...field} type="url" placeholder="https://youtu.be/... or an image URL" className="h-12 rounded-2xl border-[#e1def0] bg-white text-xs" />
                    </FormControl>
                    <FormDescription className="text-[10px] text-[#8b8da6]">
                      Add a YouTube video link or a public image URL, or upload an image below.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div>
                <p className="text-sm font-semibold text-[#14225b]">Upload image <span className="font-normal text-[#9294aa]">(Optional)</span></p>
                <label className="mt-2 flex min-h-[112px] cursor-pointer flex-col items-center justify-center rounded-[22px] border border-dashed border-[#cfc7f3] bg-[#f7f4ff] px-5 text-center transition-colors hover:bg-[#f1edff]">
                  <input type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" onChange={handleMediaUpload} disabled={isPending} />
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
                      <span className="grid size-10 place-items-center rounded-full bg-white text-[#6840df] shadow-sm"><ImagePlus className="size-5" /></span>
                      <span className="mt-2 text-xs font-bold text-[#5e34d7]">Choose image</span>
                      <span className="mt-1 text-[10px] text-[#8587a2]">JPG, PNG or WEBP up to 5 MB</span>
                    </>
                  )}
                </label>
                {uploadedProof && (
                  <p className="mt-2 flex items-center gap-1 text-[10px] font-semibold text-[#18805a]"><Upload className="size-3.5" /> Image ready to save</p>
                )}
              </div>
            </div>

            <SheetFooter className="shrink-0 border-t border-[#e9e5f8] bg-white/95 px-5 py-3.5 backdrop-blur-xl sm:px-7">
              <div className="flex w-full items-center gap-2">
                <Button type="button" variant="ghost" onClick={() => onOpenChange(false)} disabled={isPending} className="h-11 flex-1 rounded-full text-xs font-bold text-[#777993] hover:bg-[#f4f2fb]">
                  <X className="size-4" /> Cancel
                </Button>
                {!isEditing && (
                  <Button type="button" variant="outline" onClick={saveDraft} disabled={isPending} className="h-11 flex-1 rounded-full border-[#ded8f5] bg-white text-xs font-bold text-[#5e34d7] hover:bg-[#f8f5ff]">
                    Save Draft
                  </Button>
                )}
                <Button type="submit" disabled={isPending} className="h-11 flex-[1.35] rounded-full bg-gradient-to-r from-[#4d20ed] via-[#7732ed] to-[#c936ed] text-xs font-bold text-white shadow-[0_8px_20px_rgba(111,45,226,0.24)] hover:brightness-105">
                  {isPending && <Loader2 className="size-4 animate-spin" />}
                  {isEditing ? "Save Changes" : "Save Achievement"}
                </Button>
              </div>
            </SheetFooter>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
}
