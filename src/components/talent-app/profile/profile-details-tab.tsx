"use client";

import { MapPin, Eye, Paperclip, Pencil, Plus, Trash2 } from "lucide-react";

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
import {
  BODY_TYPE_OPTIONS,
  COMPLEXION_OPTIONS,
  HAIR_LENGTH_OPTIONS,
  EYE_COLOR_OPTIONS,
} from "./profile-constants";
import type { TalentProfile } from "@/lib/api/talent";

interface ProfileDetailsTabProps {
  profile: TalentProfile;
  onFieldUpdate: (field: string, value: unknown) => void;
  onOpenSkillsAdd: () => void;
  onEditSkill: (idx: number, skill: { name: string; proficiency: string }) => void;
  onDeleteSkill: (idx: number) => void;
}

export function ProfileDetailsTab({
  profile,
  onFieldUpdate,
  onOpenSkillsAdd,
  onEditSkill,
  onDeleteSkill,
}: ProfileDetailsTabProps) {
  const location = profile.location ?? {};
  const physical = profile.physical_attributes ?? {};

  const physicalFields: { label: string; key: keyof NonNullable<TalentProfile["physical_attributes"]> }[] = [
    { label: "Height (cm)", key: "height_cm" },
    { label: "Weight (kg)", key: "weight_kg" },
    { label: "Body type", key: "body_type" },
    { label: "Complexion", key: "complexion" },
    { label: "Hair color", key: "hair_color" },
    { label: "Hair length", key: "hair_length" },
    { label: "Eye color", key: "eye_color" },
    { label: "Distinctive features", key: "distinctive_features" },
  ];

  return (
    <div className="space-y-5 animate-in">
      <SectionCard icon={MapPin} title="Location">
        <div className="grid gap-4 sm:grid-cols-3">
          <InlineField
            label="City"
            value={location.city ?? ""}
            onSave={(v) => onFieldUpdate("location", { ...location, city: v })}
            placeholder="e.g. Mumbai"
          />
          <InlineField
            label="State"
            value={location.state ?? ""}
            onSave={(v) => onFieldUpdate("location", { ...location, state: v })}
            placeholder="e.g. Maharashtra"
          />
          <InlineField
            label="Country"
            value={location.country ?? ""}
            onSave={(v) => onFieldUpdate("location", { ...location, country: v })}
            placeholder="e.g. India"
          />
        </div>
      </SectionCard>

      <SectionCard icon={Eye} title="Physical Attributes">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {physicalFields.map(({ label, key }) => {
            const value = physical[key];
            const stringValue = value != null ? String(value) : "";

            if (
              key === "body_type" ||
              key === "complexion" ||
              key === "hair_length" ||
              key === "eye_color"
            ) {
              const options =
                key === "body_type"
                  ? BODY_TYPE_OPTIONS
                  : key === "complexion"
                    ? COMPLEXION_OPTIONS
                    : key === "hair_length"
                      ? HAIR_LENGTH_OPTIONS
                      : EYE_COLOR_OPTIONS;

              return (
                <div key={key}>
                  <p className="mb-1.5 text-xs font-medium text-muted-foreground">
                    {label}
                  </p>
                  <Select
                    value={stringValue}
                    onValueChange={(v) =>
                      onFieldUpdate("physical_attributes", {
                        ...physical,
                        [key]: v,
                      })
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder={`Select ${label.toLowerCase()}`} />
                    </SelectTrigger>
                    <SelectContent>
                      {options.map((opt) => (
                        <SelectItem key={opt} value={opt}>
                          {opt}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              );
            }

            return (
              <InlineField
                key={key}
                label={label}
                value={stringValue}
                onSave={(v) => {
                  if (key === "height_cm" || key === "weight_kg") {
                    const n = parseInt(v, 10);
                    if (!isNaN(n) && n > 0 && n < 300) {
                      onFieldUpdate("physical_attributes", {
                        ...physical,
                        [key]: n,
                      });
                    }
                  } else {
                    onFieldUpdate("physical_attributes", {
                      ...physical,
                      [key]: v,
                    });
                  }
                }}
                inputType={key === "height_cm" || key === "weight_kg" ? "number" : "text"}
                placeholder={`e.g. ${key === "height_cm" ? "175" : key === "weight_kg" ? "65" : ""}`}
              />
            );
          })}
        </div>
      </SectionCard>

      <SectionCard
        icon={Paperclip}
        title="Skills"
        action={
          <Button
            variant="ghost"
            size="sm"
            className="h-8 gap-1 text-xs"
            onClick={onOpenSkillsAdd}
          >
            <Plus className="size-3" /> Add skill
          </Button>
        }
      >
        {profile.skills && profile.skills.length > 0 ? (
          <div className="space-y-2">
            {profile.skills.map((skill, i) => (
              <div
                key={i}
                className="flex items-center justify-between rounded-xl border border-border bg-surface-raised px-3 py-2"
              >
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">{skill.name}</span>
                  <Badge variant="secondary" className="text-[10px] capitalize">
                    {skill.proficiency}
                  </Badge>
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => onEditSkill(i, skill)}
                    className="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
                    aria-label="Edit skill"
                  >
                    <Pencil className="size-3.5" />
                  </button>
                  <button
                    onClick={() => onDeleteSkill(i)}
                    className="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-destructive"
                    aria-label="Delete skill"
                  >
                    <Trash2 className="size-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyPrompt label="Add a skill" onClick={onOpenSkillsAdd} />
        )}
      </SectionCard>
    </div>
  );
}
