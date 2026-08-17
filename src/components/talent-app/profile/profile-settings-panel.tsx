"use client";

import Link from "next/link";
import {
  KeyRound,
  Phone,
  Shield,
  Eye,
  Lock,
  Settings,
  ChevronRight,
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import type {
  TalentProfile,
  SectionVisibility,
  PrivacyMode,
  Availability,
} from "@/lib/api/talent";
import type { User } from "@/stores/auth-store";

const SECTION_LABELS: Record<keyof SectionVisibility, string> = {
  bio: "About / Bio",
  skills: "Skills",
  experience: "Experience & Credits",
  portfolio: "Portfolio",
  availability: "Availability badge",
  location: "Location",
  physical_attributes: "Physical attributes",
  languages: "Languages",
  accents: "Accents",
  documents: "Documents & media kit",
  social_links: "Social links",
};

const DEFAULT_SECTION_VISIBILITY: Required<SectionVisibility> = {
  bio: true,
  skills: true,
  experience: true,
  portfolio: true,
  availability: true,
  location: true,
  physical_attributes: true,
  languages: true,
  accents: true,
  documents: true,
  social_links: true,
};

interface ProfileSettingsPanelProps {
  profile: TalentProfile;
  user: User | null;
  onFieldUpdate: (field: string, value: unknown) => void;
  onPasswordOpen: () => void;
  onPhoneVerifyOpen: () => void;
}

export function ProfileSettingsPanel({
  profile,
  user,
  onFieldUpdate,
  onPasswordOpen,
  onPhoneVerifyOpen,
}: ProfileSettingsPanelProps) {
  const sectionVisibility = {
    ...DEFAULT_SECTION_VISIBILITY,
    ...profile.section_visibility,
  };

  const handleSectionToggle = (key: keyof SectionVisibility) => {
    onFieldUpdate("section_visibility", {
      ...sectionVisibility,
      [key]: !sectionVisibility[key],
    });
  };

  const privacyOptions: { value: PrivacyMode; label: string; description: string }[] = [
    {
      value: "public",
      label: "Public",
      description: "Anyone can view your profile",
    },
    {
      value: "recruiters_only",
      label: "Recruiters only",
      description: "Only verified recruiters can view",
    },
    {
      value: "private",
      label: "Private",
      description: "Only you can view your profile",
    },
  ];

  const availabilityOptions: { value: Availability; label: string }[] = [
    { value: "available", label: "Available for work" },
    { value: "busy", label: "Busy" },
    { value: "not_available", label: "Not available" },
  ];

  return (
    <div className="space-y-4">
      <Card className="rounded-2xl border border-border bg-card shadow-card">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 font-display text-base">
            <Eye className="size-4 text-primary" />
            Visibility
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Profile visibility</Label>
            <RadioGroup
              value={profile.privacy_mode ?? "public"}
              onValueChange={(v) => onFieldUpdate("privacy_mode", v as PrivacyMode)}
              className="space-y-2"
            >
              {privacyOptions.map((opt) => (
                <label
                  key={opt.value}
                  htmlFor={opt.value}
                  className={cn(
                    "flex cursor-pointer items-start gap-3 rounded-xl border p-3 transition-colors",
                    profile.privacy_mode === opt.value
                      ? "border-primary bg-primary/10"
                      : "border-border bg-surface-raised hover:border-border-hover",
                  )}
                >
                  <RadioGroupItem value={opt.value} id={opt.value} className="mt-0.5" />
                  <div className="min-w-0">
                    <p className="text-sm font-medium">{opt.label}</p>
                    <p className="text-xs text-muted-foreground">{opt.description}</p>
                  </div>
                </label>
              ))}
            </RadioGroup>
          </div>

          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Availability status</Label>
            <div className="grid grid-cols-3 gap-2">
              {availabilityOptions.map((opt) => (
                <Button
                  key={opt.value}
                  type="button"
                  variant={profile.availability === opt.value ? "default" : "outline"}
                  size="sm"
                  onClick={() => onFieldUpdate("availability", opt.value)}
                  className="h-auto py-2 text-xs"
                >
                  {opt.label}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-2xl border border-border bg-card shadow-card">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 font-display text-base">
            <Lock className="size-4 text-warning" />
            Section visibility
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {(Object.keys(SECTION_LABELS) as Array<keyof SectionVisibility>).map((key) => (
            <div
              key={key}
              className="flex items-center justify-between gap-3 rounded-xl border border-border bg-surface-raised p-2.5"
            >
              <span className="text-sm">{SECTION_LABELS[key]}</span>
              <Switch
                checked={sectionVisibility[key]}
                onCheckedChange={() => handleSectionToggle(key)}
                aria-label={`Show ${SECTION_LABELS[key]}`}
              />
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="rounded-2xl border border-border bg-card shadow-card">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 font-display text-base">
            <Shield className="size-4 text-success" />
            Account security
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <button
            onClick={onPasswordOpen}
            className="flex w-full items-center gap-3 rounded-xl border border-border bg-surface-raised p-3 text-left transition-colors hover:border-border-hover"
          >
            <div className="grid size-9 place-items-center rounded-lg icon-teal">
              <KeyRound className="size-4" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium">Change password</p>
              <p className="text-xs text-muted-foreground">Update your password</p>
            </div>
            <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
          </button>

          <button
            onClick={onPhoneVerifyOpen}
            className="flex w-full items-center gap-3 rounded-xl border border-border bg-surface-raised p-3 text-left transition-colors hover:border-border-hover"
          >
            <div className="grid size-9 place-items-center rounded-lg icon-amber">
              <Phone className="size-4" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium">Phone number</p>
              <p className="text-xs text-muted-foreground">
                {user?.is_phone_verified ? "Verified" : "Verify your phone"}
              </p>
            </div>
            {user?.is_phone_verified ? (
              <span className="rounded-full bg-success/15 px-2 py-0.5 text-xs font-medium text-success">
                Verified
              </span>
            ) : (
              <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
            )}
          </button>

          <Link
            href="/talent/settings"
            className="flex w-full items-center gap-3 rounded-xl border border-border bg-surface-raised p-3 text-left transition-colors hover:border-border-hover"
          >
            <div className="grid size-9 place-items-center rounded-lg icon-violet">
              <Settings className="size-4" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium">Account settings</p>
              <p className="text-xs text-muted-foreground">Email, billing & more</p>
            </div>
            <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
