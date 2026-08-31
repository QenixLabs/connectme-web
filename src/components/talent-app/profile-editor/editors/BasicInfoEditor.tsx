"use client";

import { useState } from "react";
import { CheckCircle2, Circle } from "lucide-react";
import { EditorShell, SaveAction } from "./EditorShell";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { Profile } from "../profile-types";

interface EditorProps {
  profile: Profile;
  onBack: () => void;
  onUpdate: (patch: Partial<Profile>) => void;
}

export function BasicInfoEditor({ profile, onBack, onUpdate }: EditorProps) {
  const [fullLegalName, setFullLegalName] = useState(profile.fullLegalName);
  const [username, setUsername] = useState(profile.username);
  const [headline, setHeadline] = useState(profile.headline);
  const [gender, setGender] = useState(profile.gender);
  const [dateOfBirth, setDateOfBirth] = useState(profile.dateOfBirth);
  const [location, setLocation] = useState(profile.location);

  const usernameValid = /^[a-z0-9_.]{4,}$/.test(username);

  const save = () => {
    onUpdate({
      fullLegalName,
      username,
      headline,
      gender,
      dateOfBirth,
      location,
    });
    onBack();
  };

  return (
    <EditorShell
      title="Basic Information"
      onBack={onBack}
      action={<SaveAction onClick={save} />}
    >
      <Card>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="fullLegalName">Full Name</Label>
            <Input
              id="fullLegalName"
              value={fullLegalName}
              onChange={(e) => setFullLegalName(e.target.value)}
              placeholder="Your full legal name"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="username">Username</Label>
            <p className="text-xs text-muted-foreground">
              Your profile link:{" "}
              <span className="font-semibold text-primary">
                rootin.com/@{username || "username"}
              </span>
            </p>
            <div className="relative">
              <Input
                id="username"
                value={username}
                onChange={(e) =>
                  setUsername(e.target.value.toLowerCase().replace(/\s/g, ""))
                }
                placeholder="username"
                className={cn(usernameValid ? "pr-10" : "")}
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2">
                {usernameValid ? (
                  <CheckCircle2 className="size-5 text-success" />
                ) : (
                  <Circle className="size-5 text-muted-foreground/50" />
                )}
              </span>
            </div>
          </div>

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
            <Label>Gender</Label>
            <Select value={gender} onValueChange={setGender}>
              <SelectTrigger>
                <SelectValue placeholder="Select gender" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Male">Male</SelectItem>
                <SelectItem value="Female">Female</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="dateOfBirth">Date of Birth</Label>
            <Input
              id="dateOfBirth"
              value={dateOfBirth}
              onChange={(e) => setDateOfBirth(e.target.value)}
              placeholder="e.g. 1995-08-12"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="City, State, Country"
            />
          </div>
        </CardContent>
      </Card>

      <div className="rounded-2xl border bg-muted/40 p-4">
        <p className="text-sm font-medium">Keep your information updated</p>
        <p className="mt-1 text-xs text-muted-foreground">
          This helps clients find the right talent for their projects.
        </p>
      </div>
    </EditorShell>
  );
}
