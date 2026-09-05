"use client";

import { useState } from "react";
import { CheckCircle2, Circle, CalendarIcon, X } from "lucide-react";
import { format, isValid, parseISO } from "date-fns";
import { EditorShell, SaveAction } from "./EditorShell";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
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

function parseDob(value: string): Date | undefined {
  if (!value) return undefined;
  const date = parseISO(value.slice(0, 10));
  return isValid(date) ? date : undefined;
}

function toDobString(date: Date): string {
  return format(date, "yyyy-MM-dd");
}

function calcAge(date: Date): number {
  const now = new Date();
  let age = now.getFullYear() - date.getFullYear();
  const m = now.getMonth() - date.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < date.getDate())) age--;
  return age;
}

export function BasicInfoEditor({ profile, onBack, onUpdate }: EditorProps) {
  const [fullLegalName, setFullLegalName] = useState(profile.fullLegalName);
  const [username, setUsername] = useState(profile.username);
  const [headline, setHeadline] = useState(profile.headline);
  const [gender, setGender] = useState(profile.gender);
  const [dateOfBirth, setDateOfBirth] = useState(profile.dateOfBirth);
  const [location, setLocation] = useState(profile.location);

  const usernameValid = /^[a-z0-9_.]{4,}$/.test(username);
  const [dobOpen, setDobOpen] = useState(false);
  const dobDate = parseDob(dateOfBirth);
  const today = new Date();
  const earliestDob = new Date(1900, 0, 1);

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
            <Popover open={dobOpen} onOpenChange={setDobOpen}>
              <PopoverTrigger asChild>
                <Button
                  id="dateOfBirth"
                  variant="outline"
                  className={cn(
                    "w-full justify-between font-normal",
                    !dobDate && "text-muted-foreground"
                  )}
                >
                  {dobDate ? (
                    format(dobDate, "d MMM yyyy")
                  ) : (
                    <span>Pick your date of birth</span>
                  )}
                  <span className="flex items-center gap-1">
                    {dobDate ? (
                      <span
                        role="button"
                        tabIndex={-1}
                        aria-label="Clear date of birth"
                        className="rounded-sm p-0.5 hover:bg-accent hover:text-accent-foreground"
                        onClick={(e) => {
                          e.stopPropagation();
                          setDateOfBirth("");
                        }}
                      >
                        <X className="size-4" />
                      </span>
                    ) : null}
                    <CalendarIcon className="size-4" />
                  </span>
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  captionLayout="dropdown-years"
                  selected={dobDate}
                  onSelect={(date) => {
                    if (date) setDateOfBirth(toDobString(date));
                    setDobOpen(false);
                  }}
                  disabled={{ after: today }}
                  startMonth={earliestDob}
                  endMonth={today}
                  defaultMonth={dobDate ?? new Date(2000, 0)}
                  autoFocus
                />
              </PopoverContent>
            </Popover>
            {dobDate ? (
              <p className="text-xs text-muted-foreground">
                Age {calcAge(dobDate)} — shown only to verified recruiters.
              </p>
            ) : null}
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
