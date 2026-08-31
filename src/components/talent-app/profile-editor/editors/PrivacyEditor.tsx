"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import { EditorShell, SaveAction } from "./EditorShell";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { Profile, PrivacyMode, SectionVisibility } from "../profile-types";

interface EditorProps {
  profile: Profile;
  onBack: () => void;
  onUpdate: (patch: Partial<Profile>) => void;
}

const MODES: { value: PrivacyMode; title: string; description: string }[] = [
  {
    value: "public",
    title: "Public",
    description: "Anyone on the internet can view your profile.",
  },
  {
    value: "recruiters_only",
    title: "Recruiters only",
    description: "Only signed-in recruiters can view your profile.",
  },
  {
    value: "private",
    title: "Private",
    description: "Hidden from search. Shareable by direct link only.",
  },
];

const SECTIONS: { key: keyof SectionVisibility; label: string }[] = [
  { key: "bio", label: "About Me" },
  { key: "skills", label: "Skills" },
  { key: "portfolio", label: "Portfolio" },
  { key: "experience", label: "Experience" },
  { key: "availability", label: "Availability" },
  { key: "location", label: "Location" },
  { key: "physical_attributes", label: "Physical Attributes" },
  { key: "languages", label: "Languages" },
  { key: "accents", label: "Accents" },
  { key: "documents", label: "Documents" },
  { key: "social_links", label: "Social Links" },
];

export function PrivacyEditor({ profile, onBack, onUpdate }: EditorProps) {
  const [mode, setMode] = useState<PrivacyMode>(profile.privacyMode);
  const [visibility, setVisibility] = useState<SectionVisibility>(
    profile.sectionVisibility,
  );

  const save = () => {
    onUpdate({ privacyMode: mode, sectionVisibility: visibility });
    onBack();
  };

  const toggleSection = (key: keyof SectionVisibility) => {
    setVisibility((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <EditorShell
      title="Privacy & Visibility"
      onBack={onBack}
      action={<SaveAction onClick={save} />}
    >
      <div className="space-y-2">
        {MODES.map((m) => {
          const selected = mode === m.value;
          return (
            <Card
              key={m.value}
              onClick={() => setMode(m.value)}
              className={cn(
                "cursor-pointer p-4 transition-colors",
                selected
                  ? "border-primary bg-primary/5"
                  : "hover:border-primary/40",
              )}
            >
              <div className="flex items-start gap-3">
                <div
                  className={cn(
                    "mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full border",
                    selected
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-muted-foreground/40",
                  )}
                >
                  {selected && <Check className="size-3" />}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold">{m.title}</p>
                  <p className="text-sm text-muted-foreground">
                    {m.description}
                  </p>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardContent className="space-y-3">
          <p className="font-semibold">Section visibility</p>
          {SECTIONS.map((s) => (
            <div
              key={s.key}
              className="flex items-center justify-between gap-3 py-1"
            >
              <Label htmlFor={s.key} className="text-sm font-normal">
                {s.label}
              </Label>
              <Switch
                id={s.key}
                checked={Boolean(visibility[s.key])}
                onCheckedChange={() => toggleSection(s.key)}
              />
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="rounded-2xl border bg-muted/40 p-4">
        <p className="text-sm font-medium">Preview as viewer</p>
        <p className="mt-1 text-xs text-muted-foreground">
          Hidden sections stay saved — they are simply not shown to anyone
          visiting your profile.
        </p>
      </div>
    </EditorShell>
  );
}
