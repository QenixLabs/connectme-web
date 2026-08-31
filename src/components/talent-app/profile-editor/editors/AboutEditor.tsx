"use client";

import { useState } from "react";
import { EditorShell, SaveAction } from "./EditorShell";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import type { Profile } from "../profile-types";

interface EditorProps {
  profile: Profile;
  onBack: () => void;
  onUpdate: (patch: Partial<Profile>) => void;
}

export function AboutEditor({ profile, onBack, onUpdate }: EditorProps) {
  const [about, setAbout] = useState(profile.about);

  const save = () => {
    onUpdate({ about });
    onBack();
  };

  return (
    <EditorShell
      title="About Me"
      onBack={onBack}
      action={<SaveAction onClick={save} />}
    >
      <Card>
        <CardContent className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="about">Your bio and introduction</Label>
            <Textarea
              id="about"
              value={about}
              onChange={(e) => setAbout(e.target.value)}
              rows={10}
              maxLength={800}
              placeholder="Tell clients who you are, what you do best and what you're looking for..."
              className="resize-none"
            />
          </div>
          <p className="text-right text-xs text-muted-foreground">
            {about.length}/800
          </p>
        </CardContent>
      </Card>

      <div className="rounded-2xl border bg-muted/40 p-4">
        <p className="text-sm font-medium">Write for casting directors</p>
        <p className="mt-1 text-xs text-muted-foreground">
          Lead with your craft, then range, then the kind of work you want next.
        </p>
      </div>
    </EditorShell>
  );
}
