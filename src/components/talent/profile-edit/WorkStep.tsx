"use client";

import { useFormContext, useFieldArray } from "react-hook-form";
import { useMemo } from "react";
import { Briefcase, Zap, Languages } from "lucide-react";
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
import { TagInput } from "@/components/ui/tag-input";
import type { CreateTalentProfileInput } from "@/lib/validations/talent-profile.schema";
import {
  AVAILABILITY_OPTIONS,
  PROFESSION_SUGGESTIONS,
} from "@/lib/talent-profile/options";
import { getSpecialtiesForProfession } from "@/lib/profession-fields";
import { SectionCard, AddRow, SkillRow, LanguageRow } from "./shared";

export function WorkStep() {
  const {
    control,
    register,
    watch,
    setValue,
    getValues,
    formState: { errors },
  } = useFormContext<CreateTalentProfileInput>();

  const skillsArray = useFieldArray({ control, name: "skills" });
  const languagesArray = useFieldArray({ control, name: "languages" });

  const selectedProfessions = watch("professions") ?? [];

  const specialtySuggestions = useMemo(() => {
    const all = selectedProfessions.flatMap((p) => getSpecialtiesForProfession(p));
    return [...new Set(all)];
  }, [selectedProfessions]);

  return (
    <div className="space-y-6">
      {/* ---------- CAREER ---------- */}
      <SectionCard
        icon={Briefcase}
        label="Career"
        description="Professions, specialty and availability"
        isPublic={watch("section_visibility.availability") ?? true}
        onToggle={() => {
          const current =
            getValues("section_visibility.availability") ?? true;
          setValue("section_visibility.availability", !current, {
            shouldDirty: true,
          });
        }}
      >
        <div className="space-y-3">
          <FormField
            control={control}
            name="professions"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-[13px] font-medium">
                  Professions
                </FormLabel>
                <TagInput
                  value={field.value ?? []}
                  onChange={field.onChange}
                  suggestions={PROFESSION_SUGGESTIONS}
                  normalizeFromSuggestions
                  placeholder="Add profession..."
                  containerClassName="[&>div]:rounded-xl [&>div]:border-border [&>div]:focus-within:border-gold/50 [&>div]:focus-within:ring-2 [&>div]:focus-within:ring-gold/25 [&>div]:bg-cream-pale/80"
                />
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name="specialties"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-[13px] font-medium">
                  Specialties
                </FormLabel>
                <TagInput
                  value={field.value ?? []}
                  onChange={field.onChange}
                  suggestions={specialtySuggestions}
                  placeholder={
                    selectedProfessions.length > 0
                      ? "Add specialty..."
                      : "Select a profession first"
                  }
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
                <FormLabel className="text-[13px] font-medium">
                  Availability
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
                    {AVAILABILITY_OPTIONS.map((opt) => (
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

      {/* ---------- SKILLS ---------- */}
      <SectionCard
        icon={Zap}
        label="Skills"
        description="Acting craft & specialties"
        isPublic={watch("section_visibility.skills") ?? true}
        onToggle={() => {
          const current = getValues("section_visibility.skills") ?? true;
          setValue("section_visibility.skills", !current, {
            shouldDirty: true,
          });
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
            onClick={() =>
              skillsArray.append({ name: "", proficiency: "beginner" })
            }
          />
          {errors.skills && !Array.isArray(errors.skills) && (
            <p className="text-xs text-destructive">
              {errors.skills.message}
            </p>
          )}
        </div>
      </SectionCard>

      {/* ---------- LANGUAGES & ACCENTS ---------- */}
      <SectionCard
        icon={Languages}
        label="Languages"
        description="Languages and accents"
        isPublic={watch("section_visibility.languages") ?? true}
        onToggle={() => {
          const current =
            getValues("section_visibility.languages") ?? true;
          setValue("section_visibility.languages", !current, {
            shouldDirty: true,
          });
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
            onClick={() =>
              languagesArray.append({ name: "", fluency: "basic" })
            }
          />
          {errors.languages && !Array.isArray(errors.languages) && (
            <p className="text-xs text-destructive">
              {errors.languages.message}
            </p>
          )}
        </div>

        <div className="mt-4 pt-4 border-t border-border/60">
          <FormField
            control={control}
            name="accents"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-[13px] font-medium">
                  Accents
                </FormLabel>
                <TagInput
                  value={field.value ?? []}
                  onChange={field.onChange}
                  placeholder="Add accent..."
                  containerClassName="[&>div]:rounded-xl [&>div]:border-border [&>div]:focus-within:border-gold/50 [&>div]:focus-within:ring-2 [&>div]:focus-within:ring-gold/25 [&>div]:bg-cream-pale/80"
                />
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </SectionCard>
    </div>
  );
}
