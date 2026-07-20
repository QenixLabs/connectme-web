"use client";

import type { ReactNode } from "react";
import type { ComponentType } from "react";
import { Controller } from "react-hook-form";
import type { UseFormRegister, Control, FieldErrors } from "react-hook-form";
import { Eye, EyeOff, Plus, Trash2, Globe, Link } from "lucide-react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { CreateTalentProfileInput } from "@/lib/validations/talent-profile.schema";
import { PROFICIENCY_OPTIONS, FLUENCIES } from "@/lib/talent-profile/options";
import {
  FaInstagram,
  FaYoutube,
  FaLinkedin,
  FaTwitter,
  FaFacebook,
  FaTiktok,
  FaGithub,
  FaBehance,
  FaDribbble,
  FaVimeoV,
  FaSpotify,
  FaSnapchat,
  FaThreads,
} from "react-icons/fa6";

export const T = {
  gold: "var(--color-gold)",
  goldHover: "var(--color-gold-hover)",
  goldSoft: "var(--color-gold-soft)",
  goldInk: "var(--color-gold-ink)",
  goldDark: "var(--color-gold-dark)",
  cream: "var(--color-cream)",
  creamPale: "var(--color-cream-pale)",
  creamDeep: "var(--color-cream-deep)",
  creamHover: "var(--color-cream-hover)",
  ink: "var(--color-ink)",
  inkSoft: "var(--color-ink-soft)",
  inkMuted: "var(--color-ink-muted)",
  border: "var(--color-border)",
  card: "var(--color-card)",
  destructive: "var(--color-destructive)",
  white: "var(--color-white)",
};

export function SectionDivider({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3 mt-2">
      <span className="text-[10px] font-bold tracking-[0.14em] uppercase whitespace-nowrap text-gold">
        {label}
      </span>
      <div className="flex-1 h-px bg-border/60" />
    </div>
  );
}

export function VisibilityToggle({ isPublic, onToggle }: { isPublic: boolean; onToggle: () => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={isPublic}
      onClick={onToggle}
      className={cn(
        "group relative inline-flex items-center gap-2 rounded-full pl-3 pr-1.5 py-1.5 border transition-all duration-300",
        isPublic
          ? "bg-gold-soft border-gold/30 text-gold-ink shadow-[0_0_0_4px_var(--color-gold-soft)]"
          : "bg-cream border-border text-ink-muted",
      )}
    >
      <span className="flex items-center gap-1 text-[10.5px] font-semibold uppercase tracking-[0.08em]">
        {isPublic ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
        {isPublic ? "Visible" : "Hidden"}
      </span>
      <span
        className={cn(
          "relative h-5 w-9 rounded-full transition-all duration-300",
          isPublic ? "bg-gold shadow-inner" : "bg-ink-muted/30",
        )}
      >
        <span
          className={cn(
            "absolute top-0.5 h-4 w-4 rounded-full bg-white shadow-sm transition-all duration-300",
            isPublic ? "left-[18px]" : "left-0.5",
          )}
        />
      </span>
    </button>
  );
}

export function SectionCard({
  icon: Icon,
  label,
  description,
  isPublic,
  onToggle,
  alwaysPublic,
  children,
}: {
  icon: React.ComponentType<{ className?: string; strokeWidth?: number | string }>;
  label: string;
  description: string;
  isPublic?: boolean;
  onToggle?: () => void;
  alwaysPublic?: boolean;
  children: ReactNode;
}) {
  return (
    <Card className="relative rounded-2xl border-border/50 shadow-luxe overflow-hidden p-0 gap-0 group/card transition-shadow duration-300 hover:shadow-[0_12px_40px_-20px_oklch(0.30_0.05_60/0.30)]">
      <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-gold/40 via-gold/15 to-transparent opacity-0 group-hover/card:opacity-100 transition-opacity duration-500" />
      <CardHeader className="px-5 pt-5 pb-3.5 flex flex-row items-center gap-3.5">
        <div className="h-10 w-10 rounded-xl bg-gold-soft border border-gold/20 grid place-items-center shrink-0">
          <Icon className="h-[18px] w-[18px] text-gold-ink" strokeWidth={1.5} />
        </div>
        <div className="flex-1 min-w-0 pt-0.5">
          <CardTitle className="font-serif text-[15px] text-ink leading-tight tracking-tight">{label}</CardTitle>
          <CardDescription className="text-[11.5px] text-ink-muted mt-0.5 leading-relaxed">{description}</CardDescription>
        </div>
        {alwaysPublic ? (
          <span className="shrink-0 flex items-center gap-1.5 text-[10.5px] font-semibold uppercase tracking-[0.08em] text-gold-ink bg-gold-soft border border-gold/30 rounded-full pl-2.5 pr-3 py-1.5 select-none">
            <Eye className="h-3 w-3" />
            Always public
          </span>
        ) : (
          <div className="shrink-0">
            <VisibilityToggle isPublic={isPublic!} onToggle={onToggle!} />
          </div>
        )}
      </CardHeader>
      <div className="h-px bg-gradient-to-r from-border/60 via-border/40 to-transparent mx-5" />
      <CardContent className="px-5 pt-4 pb-5">{children}</CardContent>
    </Card>
  );
}

export function Field({
  label,
  children,
  compact,
}: {
  label: string;
  children: ReactNode;
  compact?: boolean;
}) {
  return (
    <label className={`block ${compact ? "" : "mb-3 last:mb-0"}`}>
      <span className="block text-[10.5px] uppercase tracking-[0.12em] text-ink-muted mb-1.5">{label}</span>
      {children}
    </label>
  );
}

export function AddRow({ label, onClick }: { label: string; onClick?: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full flex items-center justify-center gap-2 rounded-xl border border-dashed border-gold/35 bg-gold-soft/30 px-4 py-3 text-[13px] font-medium text-gold-ink hover:bg-gold-soft/60 hover:border-gold/50 active:scale-[0.99] transition-all duration-200"
    >
      <Plus className="w-4 h-4" strokeWidth={2} />
      {label}
    </button>
  );
}

export function SkillRow({
  idx,
  register,
  control,
  errors,
  onRemove,
}: {
  idx: number;
  register: UseFormRegister<CreateTalentProfileInput>;
  control: Control<CreateTalentProfileInput>;
  errors: FieldErrors<CreateTalentProfileInput>;
  onRemove: () => void;
}) {
  const hasError = !!errors.skills?.[idx]?.name || !!errors.skills?.[idx]?.proficiency;
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      className={cn(
        "flex items-center gap-3 rounded-xl border px-3 py-2.5 transition-colors duration-200",
        hasError
          ? "border-error/40 bg-error-light/30"
          : "bg-cream-pale/80 border-border hover:border-gold/25 hover:bg-cream",
      )}
    >
      <span className="shrink-0 w-6 h-6 rounded-lg bg-gold-soft/60 border border-gold/15 grid place-items-center text-[11px] font-semibold text-gold-ink select-none">
        {idx + 1}
      </span>
      <input
        placeholder="Skill name"
        {...register(`skills.${idx}.name`)}
        aria-invalid={!!errors.skills?.[idx]?.name}
        className="flex-1 min-w-0 bg-transparent text-[13px] font-medium outline-none placeholder:text-ink-muted/60 text-ink"
        onKeyDown={(e) => { if (e.key === "Enter") e.preventDefault(); }}
      />
      <Controller
        control={control}
        name={`skills.${idx}.proficiency`}
        render={({ field }) => (
          <Select onValueChange={field.onChange} value={field.value || ""}>
            <SelectTrigger className="h-8 w-[120px] text-xs rounded-lg border-border bg-white/60 hover:border-gold/25 transition-colors shadow-none">
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
        className="w-7 h-7 flex items-center justify-center rounded-lg border border-border/60 bg-cream hover:bg-error-light hover:border-error/30 hover:text-destructive transition-all duration-200 text-ink-muted"
        aria-label="Remove skill"
      >
        <Trash2 className="w-3.5 h-3.5" strokeWidth={1.5} />
      </button>
    </motion.div>
  );
}

export function LanguageRow({
  idx,
  register,
  control,
  errors,
  onRemove,
}: {
  idx: number;
  register: UseFormRegister<CreateTalentProfileInput>;
  control: Control<CreateTalentProfileInput>;
  errors: FieldErrors<CreateTalentProfileInput>;
  onRemove: () => void;
}) {
  const hasError = !!errors.languages?.[idx]?.name || !!errors.languages?.[idx]?.fluency;
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      className={cn(
        "flex items-center gap-3 rounded-xl border px-3 py-2.5 transition-colors duration-200",
        hasError
          ? "border-error/40 bg-error-light/30"
          : "bg-cream-pale/80 border-border hover:border-gold/25 hover:bg-cream",
      )}
    >
      <span className="shrink-0 w-6 h-6 rounded-lg bg-gold-soft/60 border border-gold/15 grid place-items-center text-[11px] font-semibold text-gold-ink select-none">
        {idx + 1}
      </span>
      <input
        placeholder="Language name"
        {...register(`languages.${idx}.name`)}
        aria-invalid={!!errors.languages?.[idx]?.name}
        className="flex-1 min-w-0 bg-transparent text-[13px] font-medium outline-none placeholder:text-ink-muted/60 text-ink"
        onKeyDown={(e) => { if (e.key === "Enter") e.preventDefault(); }}
      />
      <Controller
        control={control}
        name={`languages.${idx}.fluency`}
        render={({ field }) => (
          <Select onValueChange={field.onChange} value={field.value || ""}>
            <SelectTrigger className="h-8 w-[120px] text-xs rounded-lg border-border bg-white/60 hover:border-gold/25 transition-colors shadow-none">
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
        className="w-7 h-7 flex items-center justify-center rounded-lg border border-border/60 bg-cream hover:bg-error-light hover:border-error/30 hover:text-destructive transition-all duration-200 text-ink-muted"
        aria-label="Remove language"
      >
        <Trash2 className="w-3.5 h-3.5" strokeWidth={1.5} />
      </button>
    </motion.div>
  );
}

const PLATFORM_ICON_MAP: Record<string, ComponentType<{ className?: string }>> = {
  instagram: FaInstagram,
  youtube: FaYoutube,
  linkedin: FaLinkedin,
  twitter: FaTwitter,
  facebook: FaFacebook,
  tiktok: FaTiktok,
  github: FaGithub,
  behance: FaBehance,
  dribbble: FaDribbble,
  vimeo: FaVimeoV,
  spotify: FaSpotify,
  snapchat: FaSnapchat,
  threads: FaThreads,
  website: Globe,
};

const PLATFORM_COLORS: Record<string, { bg: string; fg: string }> = {
  instagram: { bg: "var(--color-pink-light)", fg: "var(--color-pink)" },
  youtube: { bg: "var(--color-red-light)", fg: "var(--color-red)" },
  linkedin: { bg: "var(--color-blue-light)", fg: "var(--color-blue)" },
  twitter: { bg: "var(--color-sky-light, #e0f2fe)", fg: "var(--color-sky, #0ea5e9)" },
  facebook: { bg: "var(--color-blue-light, #dbeafe)", fg: "var(--color-blue, #2563eb)" },
  tiktok: { bg: "var(--color-slate-light, #f1f5f9)", fg: "var(--color-slate, #0f172a)" },
  github: { bg: "var(--color-slate-light, #f1f5f9)", fg: "var(--color-slate, #0f172a)" },
  behance: { bg: "var(--color-blue-light, #dbeafe)", fg: "var(--color-blue, #2563eb)" },
  dribbble: { bg: "var(--color-pink-light)", fg: "var(--color-pink)" },
  vimeo: { bg: "var(--color-sky-light, #e0f2fe)", fg: "var(--color-sky, #0ea5e9)" },
  spotify: { bg: "var(--color-green-light, #dcfce7)", fg: "var(--color-green, #16a34a)" },
  snapchat: { bg: "var(--color-yellow-light, #fef9c3)", fg: "var(--color-yellow, #ca8a04)" },
  threads: { bg: "var(--color-slate-light, #f1f5f9)", fg: "var(--color-slate, #0f172a)" },
  website: { bg: "var(--color-gold-soft, #fef3c7)", fg: "var(--color-gold, #b45309)" },
};

function platformLabel(platform: string): string {
  const map: Record<string, string> = {
    twitter: "Twitter / X",
    website: "Website",
  };
  return map[platform] ?? platform.charAt(0).toUpperCase() + platform.slice(1);
}

export function SocialIcon({ platform }: { platform: string }) {
  const Icon = PLATFORM_ICON_MAP[platform] ?? Link;
  const colors = PLATFORM_COLORS[platform] ?? PLATFORM_COLORS.website;
  return (
    <div
      className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
      style={{ background: colors.bg, color: colors.fg }}
    >
      <Icon className="w-[18px] h-[18px]" />
    </div>
  );
}

export { platformLabel };
