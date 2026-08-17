"use client";

import { FileText, Star, Languages, Pencil, Plus, Trash2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { InlineField } from "./inline-field";
import { SectionCard, EmptyPrompt } from "./profile-section-card";
import { AVAILABILITY_OPTIONS } from "./profile-constants";
import type { TalentProfile } from "@/lib/api/talent";

interface ProfileOverviewTabProps {
  profile: TalentProfile;
  onFieldUpdate: (field: string, value: unknown) => void;
  onOpenSheet: (sheet: "professions" | "specialties" | "accents") => void;
  onAddLanguage: () => void;
  onEditLanguage: (idx: number, lang: { name: string; fluency: string }) => void;
  onDeleteLanguage: (idx: number) => void;
}

export function ProfileOverviewTab({
  profile,
  onFieldUpdate,
  onOpenSheet,
  onAddLanguage,
  onEditLanguage,
  onDeleteLanguage,
}: ProfileOverviewTabProps) {
  return (
    <div className="space-y-5 animate-in">
      <SectionCard icon={FileText} title="About">
        <InlineField
          value={profile.about ?? ""}
          onSave={(v) => onFieldUpdate("about", v)}
          multiline
          placeholder="Write a short bio about yourself..."
        />
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <InlineField
            label="Years of experience"
            value={
              profile.years_of_experience != null
                ? String(profile.years_of_experience)
                : ""
            }
            onSave={(v) => {
              const n = parseInt(v, 10);
              if (!isNaN(n) && n >= 0 && n <= 100)
                onFieldUpdate("years_of_experience", n);
            }}
            inputType="number"
            placeholder="e.g. 5"
          />
          <div>
            <p className="mb-1.5 text-xs font-medium text-muted-foreground">
              Availability
            </p>
            <Select
              value={profile.availability ?? "available"}
              onValueChange={(v) => onFieldUpdate("availability", v)}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {AVAILABILITY_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </SectionCard>

      <SectionCard
        icon={Star}
        title="Professions & Specialties"
        action={
          <Button
            variant="ghost"
            size="sm"
            className="h-8 gap-1 text-xs"
            onClick={() => onOpenSheet("professions")}
          >
            <Pencil className="size-3" /> Edit
          </Button>
        }
      >
        <div className="space-y-4">
          <div>
            <p className="mb-2 text-xs font-medium text-muted-foreground">Professions</p>
            {profile.professions && profile.professions.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {profile.professions.map((p) => (
                  <Badge key={p} variant="secondary" className="rounded-full">
                    {p}
                  </Badge>
                ))}
              </div>
            ) : (
              <EmptyPrompt
                label="Add professions"
                onClick={() => onOpenSheet("professions")}
              />
            )}
          </div>
          <div>
            <p className="mb-2 text-xs font-medium text-muted-foreground">Specialties</p>
            {profile.specialties && profile.specialties.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {profile.specialties.map((s) => (
                  <Badge key={s} variant="outline" className="rounded-full">
                    {s}
                  </Badge>
                ))}
              </div>
            ) : (
              <EmptyPrompt
                label="Add specialties"
                onClick={() => onOpenSheet("specialties")}
              />
            )}
          </div>
        </div>
      </SectionCard>

      <SectionCard
        icon={Languages}
        title="Languages & Accents"
        action={
          <Button
            variant="ghost"
            size="sm"
            className="h-8 gap-1 text-xs"
            onClick={onAddLanguage}
          >
            <Plus className="size-3" /> Add language
          </Button>
        }
      >
        <div className="space-y-4">
          <div>
            <p className="mb-2 text-xs font-medium text-muted-foreground">Languages</p>
            {profile.languages && profile.languages.length > 0 ? (
              <div className="space-y-2">
                {profile.languages.map((lang, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between rounded-xl border border-border bg-surface-raised px-3 py-2"
                  >
                    <span className="text-sm">
                      {lang.name}{" "}
                      <span className="text-muted-foreground">({lang.fluency})</span>
                    </span>
                    <div className="flex gap-1">
                      <button
                        onClick={() => onEditLanguage(i, lang)}
                        className="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
                        aria-label="Edit language"
                      >
                        <Pencil className="size-3.5" />
                      </button>
                      <button
                        onClick={() => onDeleteLanguage(i)}
                        className="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-destructive"
                        aria-label="Delete language"
                      >
                        <Trash2 className="size-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyPrompt
                label="Add a language"
                onClick={onAddLanguage}
              />
            )}
          </div>
          <div>
            <p className="mb-2 text-xs font-medium text-muted-foreground">Accents</p>
            {profile.accents && profile.accents.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {profile.accents.map((a) => (
                  <Badge key={a} variant="outline" className="rounded-full">
                    {a}
                  </Badge>
                ))}
              </div>
            ) : (
              <EmptyPrompt
                label="Add accents"
                onClick={() => onOpenSheet("accents")}
              />
            )}
          </div>
        </div>
      </SectionCard>
    </div>
  );
}
