"use client";

import { useFormContext } from "react-hook-form";
import {
  Upload,
  Loader2,
  User,
  MapPin,
  Camera,
  Palette,
  Sparkles,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
import { cn } from "@/lib/utils";
import { PALETTE_COLORS } from "@/lib/hero-color";
import type { CreateTalentProfileInput } from "@/lib/validations/talent-profile.schema";
import { GENDER_OPTIONS, dynamicOptions } from "@/lib/talent-profile/options";
import { SectionCard, Field, T } from "./shared";

export interface UploadSlot {
  inputRef: React.RefObject<HTMLInputElement | null>;
  preview: string | null;
  error: string | null;
  uploading?: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onClear: () => void;
}

interface IdentityStepProps {
  mode: "create" | "edit";
  photo: UploadSlot;
  heroBg: UploadSlot & { onColor: (color: string) => void };
}

export function IdentityStep({ mode, photo, heroBg }: IdentityStepProps) {
  const { control, watch, setValue, getValues, formState: { errors } } =
    useFormContext<CreateTalentProfileInput>();

  return (
    <div className="space-y-6">
      {/* ---------- HERO BACKGROUND ---------- */}
      <SectionCard
        icon={Sparkles}
        label="Hero background"
        description="Customize the banner behind your profile photo"
        alwaysPublic
      >
        <Field label="Upload image">
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => heroBg.inputRef.current?.click()}
              disabled={heroBg.uploading}
              className="flex items-center gap-2 rounded-xl border border-dashed border-gold/30 bg-gold-soft/30 px-4 py-3 text-[13px] font-medium text-gold-ink hover:bg-gold-soft/60 hover:border-gold/50 transition disabled:opacity-50"
            >
              {heroBg.uploading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Upload className="h-4 w-4" />
              )}
              {heroBg.uploading ? "Uploading..." : "Choose image"}
            </button>
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              ref={heroBg.inputRef}
              onChange={heroBg.onChange}
            />
            {heroBg.preview && (
              <button
                type="button"
                onClick={heroBg.onClear}
                className="text-[12px] text-destructive"
              >
                Remove
              </button>
            )}
            {heroBg.error && (
              <p className="text-[11px] text-destructive">{heroBg.error}</p>
            )}
          </div>
        </Field>

        <Field label="Or pick a solid color">
          <div className="grid grid-cols-6 gap-2">
            {PALETTE_COLORS.map((color) => {
              const isSelected = watch("hero_background") === color;
              return (
                <button
                  key={color}
                  type="button"
                  onClick={() => heroBg.onColor(color)}
                  className={cn(
                    "h-10 rounded-xl border-2 transition-all duration-200 hover:scale-110 active:scale-95",
                    isSelected
                      ? "border-card shadow-[0_0_0_3px_var(--color-gold),0_0_0_5px_var(--color-gold-soft)] scale-110"
                      : "border-transparent hover:border-gold/30",
                  )}
                  style={{ background: color }}
                  title={color}
                  aria-label={`Hero color ${color}`}
                />
              );
            })}
          </div>
        </Field>

        <Field label="Custom hex color">
          <div className="flex items-center gap-3">
            <input
              type="color"
              value={
                watch("hero_background")?.startsWith("#")
                  ? watch("hero_background")
                  : "#1a1c2a"
              }
              onChange={(e) => heroBg.onColor(e.target.value)}
              className="h-10 w-14 rounded-xl border border-border/60 cursor-pointer bg-transparent hover:border-gold/30 transition-colors"
            />
            <Input
              value={
                watch("hero_background")?.startsWith("#")
                  ? watch("hero_background")
                  : ""
              }
              onChange={(e) => {
                const v = e.target.value;
                if (v === "") {
                  setValue("hero_background", "", { shouldDirty: true });
                } else if (/^#[0-9a-fA-F]{0,6}$/.test(v)) {
                  setValue("hero_background", v, { shouldDirty: true });
                }
              }}
              placeholder="#1a1c2a"
              className="h-10 text-sm rounded-xl border-border bg-cream-pale/80 focus:border-gold/50 focus:bg-card focus:ring-2 focus:ring-gold/25 transition-all flex-1"
              maxLength={7}
            />
          </div>
        </Field>

        {heroBg.preview && (
          <div
            className="mt-3 h-20 rounded-xl border border-border/60 overflow-hidden shadow-inner"
            style={{
              background: heroBg.preview.startsWith("#")
                ? heroBg.preview
                : `url(${heroBg.preview}) center/cover`,
            }}
          />
        )}
        <div className="mt-3 text-[11px] text-ink-muted">
          Leave empty for a random color (same every time for your profile).
        </div>
      </SectionCard>

      {/* ---------- BASIC INFO ---------- */}
      <SectionCard
        icon={User}
        label="Basic info"
        description="Name, role and bio"
        alwaysPublic
      >
        <div className="flex items-center gap-4 mb-5">
          <div className="relative shrink-0">
            <div
              className={cn(
                "h-[72px] w-[72px] rounded-2xl flex items-center justify-center text-[28px] font-bold text-white",
                !photo.preview &&
                  "bg-gradient-to-br from-gold to-gold-dark",
              )}
            >
              {photo.preview ? (
                <img
                  src={photo.preview}
                  alt="Profile photo"
                  className="w-full h-full rounded-2xl object-cover"
                />
              ) : (
                <span className="font-serif">
                  {(getValues("full_legal_name") ||
                    getValues("username") ||
                    "T")
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
              ref={photo.inputRef}
              onChange={photo.onChange}
            />
            <button
              type="button"
              onClick={() => photo.inputRef.current?.click()}
              className="absolute -bottom-1.5 -right-1.5 h-[30px] w-[30px] rounded-full bg-gold grid place-items-center shadow-lg ring-[3px] ring-card hover:bg-gold-hover active:scale-95 transition-all duration-200"
            >
              <Camera className="h-[15px] w-[15px] text-white" strokeWidth={2} />
            </button>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-[12px] text-ink-muted leading-snug">
              Tap the camera to update your photo.
            </span>
            {photo.preview && (
              <button
                type="button"
                onClick={photo.onClear}
                className="text-[11px] text-left text-ink-muted hover:text-destructive transition-colors w-fit"
              >
                Remove photo
              </button>
            )}
            {photo.error && (
              <p className="text-[11px] text-destructive">{photo.error}</p>
            )}
          </div>
        </div>

        <div className="space-y-3">
          <FormField
            control={control}
            name="username"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-[13px] font-medium">
                  Username
                  {mode === "create" && (
                    <span className="text-gold">*</span>
                  )}
                </FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    disabled={mode === "edit"}
                    placeholder="e.g. john_doe"
                    className="h-10 text-sm rounded-xl border-border bg-cream-pale/80 focus:border-gold/50 focus:bg-card focus:ring-2 focus:ring-gold/25 transition-all"
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
                  <FormLabel className="text-[13px] font-medium">
                    Full legal name
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      value={field.value ?? ""}
                      className="h-10 text-sm rounded-xl border-border bg-cream-pale/80 focus:border-gold/50 focus:bg-card focus:ring-2 focus:ring-gold/25 transition-all"
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
                  <FormLabel className="text-[13px] font-medium">
                    Date of birth
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="date"
                      {...field}
                      value={field.value ?? ""}
                      className="h-10 text-sm rounded-xl border-border bg-cream-pale/80 focus:border-gold/50 focus:bg-card focus:ring-2 focus:ring-gold/25 transition-all"
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
                  <FormLabel className="text-[13px] font-medium">
                    Gender
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
                      {dynamicOptions(field.value, GENDER_OPTIONS).map(
                        (opt) => (
                          <SelectItem key={opt.value} value={opt.value}>
                            {opt.label}
                          </SelectItem>
                        ),
                      )}
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
                  <FormLabel className="text-[13px] font-medium">
                    Headline
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      value={field.value ?? ""}
                      maxLength={120}
                      placeholder="One line that describes you"
                      className="h-10 text-sm rounded-xl border-border bg-cream-pale/80 focus:border-gold/50 focus:bg-card focus:ring-2 focus:ring-gold/25 transition-all"
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
                    className="text-sm rounded-xl border-border bg-cream-pale/80 focus:border-gold/50 focus:bg-card focus:ring-2 focus:ring-gold/25 transition-all resize-none"
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

      {/* ---------- LOCATION ---------- */}
      <SectionCard
        icon={MapPin}
        label="Location"
        description="Where you are based"
        isPublic={watch("section_visibility.location") ?? true}
        onToggle={() => {
          const current = getValues("section_visibility.location") ?? true;
          setValue("section_visibility.location", !current, {
            shouldDirty: true,
          });
        }}
      >
        <div className="space-y-3">
          <FormField
            control={control}
            name="location.country"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-[13px] font-medium">
                  Country
                </FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    value={field.value ?? ""}
                    className="h-10 text-sm rounded-xl border-border bg-cream-pale/80 focus:border-gold/50 focus:bg-card focus:ring-2 focus:ring-gold/25 transition-all"
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
                  <FormLabel className="text-[13px] font-medium">
                    State
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      value={field.value ?? ""}
                      className="h-10 text-sm rounded-xl border-border bg-cream-pale/80 focus:border-gold/50 focus:bg-card focus:ring-2 focus:ring-gold/25 transition-all"
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
                  <FormLabel className="text-[13px] font-medium">
                    City
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      value={field.value ?? ""}
                      className="h-10 text-sm rounded-xl border-border bg-cream-pale/80 focus:border-gold/50 focus:bg-card focus:ring-2 focus:ring-gold/25 transition-all"
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
  );
}
