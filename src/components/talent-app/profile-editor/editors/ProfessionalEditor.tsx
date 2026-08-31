"use client";

import { useState } from "react";
import { EditorShell, SaveAction } from "./EditorShell";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { TagInput } from "@/components/ui/tag-input";
import {
  PROFESSION_SUGGESTIONS,
  SPECIALTY_SUGGESTIONS,
} from "../../profile/profile-constants";
import type { Profile } from "../profile-types";

interface EditorProps {
  profile: Profile;
  onBack: () => void;
  onUpdate: (patch: Partial<Profile>) => void;
}

export function ProfessionalEditor({ profile, onBack, onUpdate }: EditorProps) {
  const [headline, setHeadline] = useState(profile.headline);
  const [professions, setProfessions] = useState(profile.professions);
  const [specialties, setSpecialties] = useState(profile.specialties);
  const [years, setYears] = useState(String(profile.yearsOfExperience));

  const save = () => {
    onUpdate({
      headline,
      professions,
      specialties,
      yearsOfExperience: Number(years) || 0,
    });
    onBack();
  };

  return (
    <EditorShell
      title="Professional Profile"
      onBack={onBack}
      action={<SaveAction onClick={save} />}
    >
      <Card>
        <CardContent className="space-y-5">
          <div className="space-y-1.5">
            <Label htmlFor="headline">Headline</Label>
            <Input
              id="headline"
              value={headline}
              onChange={(e) => setHeadline(e.target.value)}
              placeholder="Actor · Model based in Mumbai"
            />
          </div>

          <div className="space-y-1.5">
            <Label>Professions</Label>
            <TagInput
              value={professions}
              onChange={setProfessions}
              suggestions={PROFESSION_SUGGESTIONS}
              placeholder="Type and press Enter"
            />
          </div>

          <div className="space-y-1.5">
            <Label>Specialties</Label>
            <TagInput
              value={specialties}
              onChange={setSpecialties}
              suggestions={SPECIALTY_SUGGESTIONS}
              placeholder="Type and press Enter"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="years">Years of Experience</Label>
            <Input
              id="years"
              value={years}
              onChange={(e) => setYears(e.target.value.replace(/\D/g, ""))}
              placeholder="6"
            />
            <p className="text-xs text-muted-foreground">
              {years || 0} years in the industry
            </p>
          </div>
        </CardContent>
      </Card>
    </EditorShell>
  );
}
