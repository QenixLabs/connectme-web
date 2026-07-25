"use client";

import { useFormContext, useFieldArray } from "react-hook-form";
import {
  Upload,
  Loader2,
  FileText,
  Share2,
  Shield,
  ScanLine,
  Plus,
  Trash2,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import {
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
import type { CreateTalentProfileInput } from "@/lib/validations/talent-profile.schema";
import {
  BODY_TYPES,
  COMPLEXIONS,
  HAIR_COLORS,
  HAIR_LENGTHS,
  EYE_COLORS,
  PRIVACY_MODE_OPTIONS,
  VISIBILITIES,
  SOCIAL_PLATFORMS,
  dynamicOptions,
} from "@/lib/talent-profile/options";
import { SectionCard, Field, SocialIcon, platformLabel } from "./shared";

export interface UploadSlot {
  inputRef: React.RefObject<HTMLInputElement | null>;
  preview: string | null;
  error: string | null;
  uploading?: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onClear: () => void;
}

interface ExtrasStepProps {
  resume: UploadSlot & { name: string | null };
}

export function ExtrasStep({ resume }: ExtrasStepProps) {
  const { control, watch, setValue, getValues } =
    useFormContext<CreateTalentProfileInput>();

  const { fields, append, remove } = useFieldArray({
    control,
    name: "social_links",
  });

  const usedPlatforms = new Set(fields.map((f) => f.platform));
  const availablePlatforms = SOCIAL_PLATFORMS.filter(
    (p) => !usedPlatforms.has(p.value),
  );

  const watchedLinks = watch("social_links") ?? [];
  const selectedCount = watchedLinks.filter((l) => l.show_on_profile === true).length;

  return (
    <div className="space-y-6">
      {/* ---------- PHYSICAL ---------- */}
      <SectionCard
        icon={ScanLine}
        label="Looks"
        description="Physical attributes"
        isPublic={watch("section_visibility.physical_attributes") ?? true}
        onToggle={() => {
          const current =
            getValues("section_visibility.physical_attributes") ?? true;
          setValue("section_visibility.physical_attributes", !current, {
            shouldDirty: true,
          });
        }}
      >
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          <FormField
            control={control}
            name="physical_attributes.height_cm"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-[13px] font-medium">
                  Height (cm)
                </FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    {...field}
                    value={field.value ?? ""}
                    onChange={(e) =>
                      field.onChange(
                        e.target.value === ""
                          ? undefined
                          : Number(e.target.value),
                      )
                    }
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
                <FormLabel className="text-[13px] font-medium">
                  Weight (kg)
                </FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    {...field}
                    value={field.value ?? ""}
                    onChange={(e) =>
                      field.onChange(
                        e.target.value === ""
                          ? undefined
                          : Number(e.target.value),
                      )
                    }
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
                <FormLabel className="text-[13px] font-medium">
                  Body type
                </FormLabel>
                <Select
                  onValueChange={(v) => field.onChange(v || undefined)}
                  value={field.value || ""}
                >
                  <FormControl>
                    <SelectTrigger className="h-10 text-sm rounded-xl border-border bg-cream-pale/80 shadow-none">
                      <SelectValue placeholder="Select..." />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {dynamicOptions(field.value, BODY_TYPES).map((opt) => (
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
            name="physical_attributes.complexion"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-[13px] font-medium">
                  Complexion
                </FormLabel>
                <Select
                  onValueChange={(v) => field.onChange(v || undefined)}
                  value={field.value || ""}
                >
                  <FormControl>
                    <SelectTrigger className="h-10 text-sm rounded-xl border-border bg-cream-pale/80 shadow-none">
                      <SelectValue placeholder="Select..." />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {dynamicOptions(field.value, COMPLEXIONS).map((opt) => (
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
            name="physical_attributes.hair_color"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-[13px] font-medium">
                  Hair color
                </FormLabel>
                <Select
                  onValueChange={(v) => field.onChange(v || undefined)}
                  value={field.value || ""}
                >
                  <FormControl>
                    <SelectTrigger className="h-10 text-sm rounded-xl border-border bg-cream-pale/80 shadow-none">
                      <SelectValue placeholder="Select..." />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {dynamicOptions(field.value, HAIR_COLORS).map((opt) => (
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
            name="physical_attributes.hair_length"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-[13px] font-medium">
                  Hair length
                </FormLabel>
                <Select
                  onValueChange={(v) => field.onChange(v || undefined)}
                  value={field.value || ""}
                >
                  <FormControl>
                    <SelectTrigger className="h-10 text-sm rounded-xl border-border bg-cream-pale/80 shadow-none">
                      <SelectValue placeholder="Select..." />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {dynamicOptions(field.value, HAIR_LENGTHS).map((opt) => (
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
            name="physical_attributes.eye_color"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-[13px] font-medium">
                  Eye color
                </FormLabel>
                <Select
                  onValueChange={(v) => field.onChange(v || undefined)}
                  value={field.value || ""}
                >
                  <FormControl>
                    <SelectTrigger className="h-10 text-sm rounded-xl border-border bg-cream-pale/80 shadow-none">
                      <SelectValue placeholder="Select..." />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {dynamicOptions(field.value, EYE_COLORS).map((opt) => (
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
            name="physical_attributes.distinctive_features"
            render={({ field }) => (
              <FormItem className="col-span-2">
                <FormLabel className="text-[13px] font-medium">
                  Distinctive features
                </FormLabel>
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

      {/* ---------- DOCUMENTS ---------- */}
      <SectionCard
        icon={FileText}
        label="Documents"
        description="Resume, portfolio & sheets"
        isPublic={watch("section_visibility.documents") ?? true}
        onToggle={() => {
          const current =
            getValues("section_visibility.documents") ?? true;
          setValue("section_visibility.documents", !current, {
            shouldDirty: true,
          });
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
                    ref={resume.inputRef}
                    onChange={resume.onChange}
                  />
                  <Card className="rounded-[14px] border-dashed border-gold/40 p-0 gap-0">
                    <CardContent className="flex items-center justify-between p-4">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center border border-gold/30 bg-gold-soft">
                          <FileText
                            className="w-5 h-5 text-gold"
                            strokeWidth={2}
                          />
                        </div>
                        <div className="min-w-0">
                          <p className="text-[13px] font-medium truncate text-ink">
                            {resume.preview
                              ? (resume.name || "Resume")
                              : "No resume uploaded"}
                          </p>
                          <p className="text-[11px] text-ink-muted">
                            PDF, DOC, or DOCX. Max 10MB.
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={() =>
                            resume.inputRef.current?.click()
                          }
                          disabled={resume.uploading}
                          className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-[7px] rounded-lg border border-border bg-cream text-ink transition-colors"
                        >
                          {resume.uploading && (
                            <Loader2 className="w-3 h-3 animate-spin" />
                          )}
                          <Upload
                            className="w-3.5 h-3.5"
                            strokeWidth={2}
                          />
                          {resume.preview ? "Change" : "Upload"}
                        </button>
                        {resume.preview && (
                          <button
                            type="button"
                            onClick={resume.onClear}
                            disabled={resume.uploading}
                            className="text-xs text-destructive px-2"
                          >
                            Remove
                          </button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                  <input type="hidden" {...field} value={field.value ?? ""} />
                </div>
              </FormControl>
              {resume.error && (
                <p className="text-xs text-destructive mt-1">
                  {resume.error}
                </p>
              )}
              <FormMessage />
            </FormItem>
          )}
        />
      </SectionCard>

      {/* ---------- SOCIAL ---------- */}
      <SectionCard
        icon={Share2}
        label={
          <span className="flex items-center gap-2">
            Social links
            {fields.length > 0 && (
              <span
                className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${
                  selectedCount > 4
                    ? "bg-destructive/10 text-destructive"
                    : "bg-gold-soft text-gold-ink"
                }`}
              >
                {selectedCount}/4 shown
              </span>
            )}
          </span>
        }
        description="Add your social profiles and website"
        isPublic={watch("section_visibility.social_links") ?? true}
        onToggle={() => {
          const current =
            getValues("section_visibility.social_links") ?? true;
          setValue("section_visibility.social_links", !current, {
            shouldDirty: true,
          });
        }}
      >
        {fields.length > 0 && (
          <div className="overflow-hidden rounded-2xl border border-border/60">
            {fields.map((field, index) => (
              <div
                key={field.id}
                className="flex items-center gap-2.5 px-4 py-3 border-b border-border/60 last:border-b-0"
              >
                <SocialIcon platform={field.platform} />
                <FormField
                  control={control}
                  name={`social_links.${index}.url`}
                  render={({ field: f }) => (
                    <FormItem className="flex-1 min-w-0 mb-0">
                      <FormControl>
                        <input
                          {...f}
                          value={f.value ?? ""}
                          placeholder={`${platformLabel(field.platform)} URL`}
                          className="w-full bg-transparent text-[13px] outline-none placeholder:text-ink-muted text-ink"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={control}
                  name={`social_links.${index}.visibility`}
                  render={({ field: f }) => (
                    <FormItem className="shrink-0 mb-0">
                      <Select
                        onValueChange={(v) =>
                          f.onChange(v || undefined)
                        }
                        value={f.value || ""}
                      >
                        <SelectTrigger className="h-7 w-[110px] text-[11px] rounded-md border-border shadow-none">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {VISIBILITIES.map((opt) => (
                            <SelectItem
                              key={opt.value}
                              value={opt.value}
                            >
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
                  name={`social_links.${index}.show_on_profile`}
                  render={({ field: f }) => {
                    const isAtMax =
                      !f.value && selectedCount >= 4;
                    return (
                      <FormItem className="shrink-0 mb-0 flex items-center">
                        <FormControl>
                          <Switch
                            checked={f.value ?? false}
                             onCheckedChange={(checked) => {
                               if (checked) {
                                 const currentShown =
                                   getValues("social_links")?.filter(
                                     (l) => l.show_on_profile === true,
                                   ).length ?? 0;
                                 if (currentShown >= 4) return;
                               }
                               f.onChange(checked);
                            }}
                            disabled={isAtMax}
                            className="data-[state=checked]:bg-gold"
                          />
                        </FormControl>
                        {isAtMax && (
                          <span className="ml-1 text-[10px] text-ink-muted">
                            Max 4
                          </span>
                        )}
                      </FormItem>
                    );
                  }}
                />
                <button
                  type="button"
                  onClick={() => remove(index)}
                  className="w-7 h-7 flex items-center justify-center rounded-lg border border-border/60 bg-cream hover:bg-error-light hover:border-error/30 hover:text-destructive transition-all duration-200 text-ink-muted shrink-0"
                  aria-label={`Remove ${platformLabel(field.platform)}`}
                >
                  <Trash2 className="w-3.5 h-3.5" strokeWidth={1.5} />
                </button>
              </div>
            ))}
          </div>
        )}

        {availablePlatforms.length > 0 && (
          <div className="mt-3">
            <Select
              value=""
              onValueChange={(platform) => {
                if (platform) {
                  append({ platform, url: "", visibility: "public", show_on_profile: false });
                }
              }}
            >
              <SelectTrigger className="h-9 w-full text-[13px] rounded-xl border-dashed border-border/60 shadow-none">
                <Plus className="w-4 h-4 mr-1.5 text-ink-muted" strokeWidth={1.5} />
                <span className="text-ink-muted">Add platform</span>
              </SelectTrigger>
              <SelectContent>
                {availablePlatforms.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </SectionCard>

      {/* ---------- PRIVACY ---------- */}
      <SectionCard
        icon={Shield}
        label="Privacy"
        description="Control who sees your profile"
        alwaysPublic
      >
        <div className="max-w-xs">
          <FormField
            control={control}
            name="privacy_mode"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-[13px] font-medium">
                  Profile visibility
                </FormLabel>
                <Select
                  onValueChange={(v) => field.onChange(v || undefined)}
                  value={field.value || ""}
                >
                  <FormControl>
                    <SelectTrigger className="h-10 text-sm rounded-xl border-border bg-cream-pale/80 shadow-none">
                      <SelectValue placeholder="Select..." />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {PRIVACY_MODE_OPTIONS.map((opt) => (
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
      </SectionCard>
    </div>
  );
}
