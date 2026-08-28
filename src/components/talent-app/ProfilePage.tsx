"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { FolderKanban, Briefcase, ExternalLink } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TagInput } from "@/components/ui/tag-input";
import {
  useMyProfile,
  useUpdateMyProfile,
  useUploadTalentPhoto,
  useUploadTalentBanner,
  useProfileCompleteness,
} from "@/hooks/use-talent-profile";
import { useAuthStore } from "@/providers/auth-store-provider";
import type { UpdateTalentProfilePayload } from "@/lib/api/talent";

import { ProfileHeader } from "./profile/profile-header";
import { ProfileAnalytics } from "./profile/profile-analytics";
import { ProfileSettingsPanel } from "./profile/profile-settings-panel";
import { ProfileOverviewTab } from "./profile/profile-overview-tab";
import { ProfileDetailsTab } from "./profile/profile-details-tab";
import { ProfileLinksTab } from "./profile/profile-links-tab";
import {
  PROFESSION_SUGGESTIONS,
  SPECIALTY_SUGGESTIONS,
  LANGUAGE_FLUENCY_OPTIONS,
  PROFICIENCY_OPTIONS,
} from "./profile/profile-constants";
import { ChangePasswordDialog } from "./settings/change-password-dialog";
import { VerifyPhoneDialog } from "./settings/verify-phone-dialog";

// ── Loading Skeleton ───────────────────────────────────────

function ProfileSkeleton() {
  return (
    <div className="mx-auto max-w-5xl space-y-6 px-4 pb-28 pt-4 lg:px-6">
      <Skeleton className="h-48 rounded-2xl" />
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-5 lg:col-span-2">
          <Skeleton className="h-10 w-full rounded-full" />
          <Skeleton className="h-48 rounded-2xl" />
          <Skeleton className="h-48 rounded-2xl" />
        </div>
        <div className="space-y-5">
          <Skeleton className="h-64 rounded-2xl" />
          <Skeleton className="h-48 rounded-2xl" />
        </div>
      </div>
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────

export function ProfilePage() {
  const profileQuery = useMyProfile();
  const completenessQuery = useProfileCompleteness();
  const updateProfile = useUpdateMyProfile();
  const uploadPhoto = useUploadTalentPhoto();
  const uploadBanner = useUploadTalentBanner();
  const user = useAuthStore((s) => s.user);

  const [sheet, setSheet] = useState<
    null | "professions" | "specialties" | "languages" | "accents" | "skills"
  >(null);

  const [editingLanguageIdx, setEditingLanguageIdx] = useState<number | null>(null);
  const [languageDraft, setLanguageDraft] = useState({ name: "", fluency: "Fluent" });
  const [editingSkillIdx, setEditingSkillIdx] = useState<number | null>(null);
  const [skillDraft, setSkillDraft] = useState<{
    name: string;
    proficiency: "beginner" | "intermediate" | "expert";
  }>({ name: "", proficiency: "intermediate" });

  const [passwordOpen, setPasswordOpen] = useState(false);
  const [phoneVerifyOpen, setPhoneVerifyOpen] = useState(false);

  const saved = (label: string) => toast.success(`${label} updated`);

  const handleFieldUpdate = useCallback(
    (field: string, value: unknown) => {
      updateProfile.mutate({ [field]: value } as UpdateTalentProfilePayload, {
        onSuccess: () => saved(field.replace(/_/g, " ")),
        onError: () => toast.error("Update failed"),
      });
    },
    [updateProfile],
  );

  const handlePhotoSelect = useCallback(
    (file: File) => {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Photo must be under 5MB");
        return;
      }
      uploadPhoto.mutate(file, {
        onSuccess: (data) => {
          handleFieldUpdate("profile_photo", data.relativePath);
          toast.success("Photo uploaded");
        },
        onError: () => toast.error("Upload failed"),
      });
    },
    [uploadPhoto, handleFieldUpdate],
  );

  const handleBannerSelect = useCallback(
    (file: File) => {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Banner must be under 5MB");
        return;
      }
      uploadBanner.mutate(file, {
        onSuccess: (data) => {
          handleFieldUpdate("hero_background", data.relativePath);
          toast.success("Banner uploaded");
        },
        onError: () => toast.error("Banner upload failed"),
      });
    },
    [uploadBanner, handleFieldUpdate],
  );

  if (profileQuery.isLoading) return <ProfileSkeleton />;

  const profile = profileQuery.data;
  if (!profile) return null;

  return (
    <div className="mx-auto max-w-5xl space-y-6 px-4 pb-28 pt-4 lg:px-6">
      <ProfileHeader
        profile={profile}
        onFieldUpdate={handleFieldUpdate}
        onPhotoSelect={handlePhotoSelect}
        onBannerSelect={handleBannerSelect}
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Tabs defaultValue="overview">
            <TabsList className="w-full rounded-full bg-surface p-1">
              <TabsTrigger
                value="overview"
                className="flex-1 rounded-full data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                Overview
              </TabsTrigger>
              <TabsTrigger
                value="details"
                className="flex-1 rounded-full data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                Details
              </TabsTrigger>
              <TabsTrigger
                value="links"
                className="flex-1 rounded-full data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                Links & Docs
              </TabsTrigger>
              <TabsTrigger
                value="settings"
                className="flex-1 rounded-full data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                Settings
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="mt-5">
              <ProfileOverviewTab
                profile={profile}
                onFieldUpdate={handleFieldUpdate}
                onOpenSheet={(s) => setSheet(s)}
                onAddLanguage={() => {
                  setEditingLanguageIdx(null);
                  setLanguageDraft({ name: "", fluency: "Fluent" });
                  setSheet("languages");
                }}
                onEditLanguage={(idx, lang) => {
                  setEditingLanguageIdx(idx);
                  setLanguageDraft({ ...lang });
                  setSheet("languages");
                }}
                onDeleteLanguage={(idx) => {
                  const next = profile.languages?.filter((_, j) => j !== idx);
                  handleFieldUpdate("languages", next);
                }}
              />
            </TabsContent>

            <TabsContent value="details" className="mt-5">
              <ProfileDetailsTab
                profile={profile}
                onFieldUpdate={handleFieldUpdate}
                onOpenSkillsAdd={() => {
                  setEditingSkillIdx(null);
                  setSkillDraft({ name: "", proficiency: "intermediate" });
                  setSheet("skills");
                }}
                onEditSkill={(idx, skill) => {
                  setEditingSkillIdx(idx);
                  setSkillDraft({
                    name: skill.name,
                    proficiency: skill.proficiency as "beginner" | "intermediate" | "expert",
                  });
                  setSheet("skills");
                }}
                onDeleteSkill={(idx) => {
                  const next = profile.skills?.filter((_, j) => j !== idx);
                  handleFieldUpdate("skills", next);
                }}
              />
            </TabsContent>

            <TabsContent value="links" className="mt-5">
              <ProfileLinksTab profile={profile} onFieldUpdate={handleFieldUpdate} />
            </TabsContent>

            <TabsContent value="settings" className="mt-5">
              <ProfileSettingsPanel
                profile={profile}
                user={user}
                onFieldUpdate={handleFieldUpdate}
                onPasswordOpen={() => setPasswordOpen(true)}
                onPhoneVerifyOpen={() => setPhoneVerifyOpen(true)}
              />
            </TabsContent>
          </Tabs>
        </div>

        <aside className="space-y-6">
          <ProfileAnalytics profile={profile} completeness={completenessQuery.data ?? null} />

          <Card className="rounded-2xl border border-border bg-card shadow-card">
            <CardHeader className="pb-3">
              <CardTitle className="font-display text-base">Quick links</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Link
                href="/talent/portfolio"
                className="flex items-center gap-3 rounded-xl border border-border bg-surface-raised p-3 transition-colors hover:border-border-hover"
              >
                <div className="grid size-9 place-items-center rounded-lg bg-purple/10 text-purple">
                  <FolderKanban className="size-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium">Portfolio</p>
                  <p className="text-xs text-muted-foreground">Manage photos, videos & links</p>
                </div>
                <ExternalLink className="size-4 shrink-0 text-muted-foreground" />
              </Link>

              <Link
                href="/talent/experience"
                className="flex items-center gap-3 rounded-xl border border-border bg-surface-raised p-3 transition-colors hover:border-border-hover"
              >
                <div className="grid size-9 place-items-center rounded-lg bg-orange/10 text-orange">
                  <Briefcase className="size-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium">Experience</p>
                  <p className="text-xs text-muted-foreground">Credits, testimonials & awards</p>
                </div>
                <ExternalLink className="size-4 shrink-0 text-muted-foreground" />
              </Link>
            </CardContent>
          </Card>
        </aside>
      </div>

      <ChangePasswordDialog open={passwordOpen} onOpenChange={setPasswordOpen} />
      <VerifyPhoneDialog
        open={phoneVerifyOpen}
        onOpenChange={setPhoneVerifyOpen}
        phone={user?.phone ?? ""}
      />

      <Sheet open={sheet === "professions"} onOpenChange={(o) => setSheet(o ? "professions" : null)}>
        <SheetContent side="bottom" className="rounded-t-2xl">
          <SheetHeader className="px-0">
            <SheetTitle>Professions</SheetTitle>
            <SheetDescription>Select or add your professions</SheetDescription>
          </SheetHeader>
          <div className="pb-8">
            <TagInput
              value={profile.professions ?? []}
              onChange={(tags) => handleFieldUpdate("professions", tags)}
              suggestions={PROFESSION_SUGGESTIONS}
              placeholder="Type and press Enter"
            />
          </div>
        </SheetContent>
      </Sheet>

      <Sheet open={sheet === "specialties"} onOpenChange={(o) => setSheet(o ? "specialties" : null)}>
        <SheetContent side="bottom" className="rounded-t-2xl">
          <SheetHeader className="px-0">
            <SheetTitle>Specialties</SheetTitle>
            <SheetDescription>Select or add your specialties</SheetDescription>
          </SheetHeader>
          <div className="pb-8">
            <TagInput
              value={profile.specialties ?? []}
              onChange={(tags) => handleFieldUpdate("specialties", tags)}
              suggestions={SPECIALTY_SUGGESTIONS}
              placeholder="Type and press Enter"
            />
          </div>
        </SheetContent>
      </Sheet>

      <Sheet open={sheet === "accents"} onOpenChange={(o) => setSheet(o ? "accents" : null)}>
        <SheetContent side="bottom" className="rounded-t-2xl">
          <SheetHeader className="px-0">
            <SheetTitle>Accents</SheetTitle>
            <SheetDescription>Add any accents you can perform</SheetDescription>
          </SheetHeader>
          <div className="pb-8">
            <TagInput
              value={profile.accents ?? []}
              onChange={(tags) => handleFieldUpdate("accents", tags)}
              placeholder="e.g. British, American, Southern"
            />
          </div>
        </SheetContent>
      </Sheet>

      <Sheet open={sheet === "languages"} onOpenChange={(o) => {
        setSheet(o ? "languages" : null);
        if (!o) setEditingLanguageIdx(null);
      }}>
        <SheetContent side="bottom" className="rounded-t-2xl">
          <SheetHeader className="px-0">
            <SheetTitle>{editingLanguageIdx !== null ? "Edit Language" : "Add Language"}</SheetTitle>
            <SheetDescription>
              {editingLanguageIdx !== null ? "Update language details" : "Add a language you speak"}
            </SheetDescription>
          </SheetHeader>
          <div className="space-y-4 pb-8">
            <div>
              <p className="mb-1.5 text-xs font-medium text-muted-foreground">Language</p>
              <Input
                value={languageDraft.name}
                onChange={(e) => setLanguageDraft((d) => ({ ...d, name: e.target.value }))}
                placeholder="e.g. Hindi, English, Marathi"
              />
            </div>
            <div>
              <p className="mb-1.5 text-xs font-medium text-muted-foreground">Fluency</p>
              <Select
                value={languageDraft.fluency}
                onValueChange={(v) => setLanguageDraft((d) => ({ ...d, fluency: v }))}
              >
                <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {LANGUAGE_FLUENCY_OPTIONS.map((opt) => (
                    <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button
              onClick={() => {
                if (!languageDraft.name.trim()) return;
                const langs = [...(profile.languages ?? [])];
                if (editingLanguageIdx !== null) {
                  langs[editingLanguageIdx] = { ...languageDraft };
                } else {
                  langs.push({ ...languageDraft });
                }
                handleFieldUpdate("languages", langs);
                setSheet(null);
                setEditingLanguageIdx(null);
              }}
              className="w-full"
            >
              {editingLanguageIdx !== null ? "Save Changes" : "Add Language"}
            </Button>
          </div>
        </SheetContent>
      </Sheet>

      <Sheet open={sheet === "skills"} onOpenChange={(o) => {
        setSheet(o ? "skills" : null);
        if (!o) setEditingSkillIdx(null);
      }}>
        <SheetContent side="bottom" className="rounded-t-2xl">
          <SheetHeader className="px-0">
            <SheetTitle>{editingSkillIdx !== null ? "Edit Skill" : "Add Skill"}</SheetTitle>
            <SheetDescription>
              {editingSkillIdx !== null ? "Update skill details" : "Add a professional skill"}
            </SheetDescription>
          </SheetHeader>
          <div className="space-y-4 pb-8">
            <div>
              <p className="mb-1.5 text-xs font-medium text-muted-foreground">Skill Name</p>
              <Input
                value={skillDraft.name}
                onChange={(e) => setSkillDraft((d) => ({ ...d, name: e.target.value }))}
                placeholder="e.g. Classical Dance, Guitar, Swimming"
              />
            </div>
            <div>
              <p className="mb-1.5 text-xs font-medium text-muted-foreground">Proficiency</p>
              <Select
                value={skillDraft.proficiency}
                onValueChange={(v) => setSkillDraft((d) => ({ ...d, proficiency: v as typeof skillDraft.proficiency }))}
              >
                <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {PROFICIENCY_OPTIONS.map((opt) => (
                    <SelectItem key={opt} value={opt}>{opt.charAt(0).toUpperCase() + opt.slice(1)}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button
              onClick={() => {
                if (!skillDraft.name.trim()) return;
                const skills = [...(profile.skills ?? [])];
                const newSkill = { ...skillDraft, order: skills.length };
                if (editingSkillIdx !== null) {
                  skills[editingSkillIdx] = { ...skills[editingSkillIdx], ...newSkill };
                } else {
                  skills.push(newSkill);
                }
                handleFieldUpdate("skills", skills);
                setSheet(null);
                setEditingSkillIdx(null);
              }}
              className="w-full"
            >
              {editingSkillIdx !== null ? "Save Changes" : "Add Skill"}
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
