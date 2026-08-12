"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import {
  ArrowLeft,
  Camera,
  Check,
  ChevronDown,
  Eye,
  Globe,
  MapPin,
  Pencil,
  Plus,
  Save,
  Trash2,
  User,
  X,
  Link2,
  FileText,
  Languages,
  Paperclip,
  Shield,
  Star,
  Lock,
} from "lucide-react";
import { toast } from "sonner";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { TagInput } from "@/components/ui/tag-input";
import { cn } from "@/lib/utils";
import { useMyProfile, useUpdateMyProfile, useUploadTalentPhoto } from "@/hooks/use-talent-profile";
import type { TalentProfile, UpdateTalentProfilePayload } from "@/lib/api/talent";

// ── Constants ──────────────────────────────────────────────

const AVAILABILITY_OPTIONS = [
  { value: "available", label: "Available" },
  { value: "busy", label: "Busy" },
  { value: "not_available", label: "Not Available" },
] as const;

const PRIVACY_OPTIONS = [
  { value: "public", label: "Public", desc: "Anyone can view your profile" },
  { value: "recruiters_only", label: "Recruiters Only", desc: "Only verified recruiters can view" },
  { value: "private", label: "Private", desc: "Only you can view your profile" },
] as const;

const PROFICIENCY_OPTIONS = ["beginner", "intermediate", "expert"] as const;

const BODY_TYPE_OPTIONS = ["Slim", "Athletic", "Average", "Muscular", "Curvy", "Plus Size", "Other"];
const HAIR_LENGTH_OPTIONS = ["Buzz Cut", "Short", "Medium", "Long", "Very Long", "Bald"];
const EYE_COLOR_OPTIONS = ["Brown", "Blue", "Green", "Hazel", "Gray", "Amber", "Black", "Other"];
const COMPLEXION_OPTIONS = ["Fair", "Light", "Medium", "Olive", "Tan", "Dark", "Deep"];

const LANGUAGE_FLUENCY_OPTIONS = ["Native", "Fluent", "Intermediate", "Beginner"];

const PROFESSION_SUGGESTIONS = [
  "Actor", "Model", "Dancer", "Singer", "Musician", "Influencer",
  "Content Creator", "Photographer", "Filmmaker", "Voice Artist",
  "Choreographer", "Stylist", "Makeup Artist", "Writer",
];

const SPECIALTY_SUGGESTIONS = [
  "Film", "Television", "Commercial", "Fashion", "Music Video",
  "Theatre", "Digital Content", "Brand Campaign", "Voice Over",
  "Motion Capture", "Stunt Work", "Host/Emcee",
];

// ── InlineField ────────────────────────────────────────────

function InlineField({
  label,
  value,
  onSave,
  multiline,
  placeholder,
  inputType = "text",
  className = "",
}: {
  label?: string;
  value: string;
  onSave: (value: string) => void;
  multiline?: boolean;
  placeholder?: string;
  inputType?: string;
  className?: string;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const ref = useRef<HTMLInputElement | HTMLTextAreaElement>(null);

  useEffect(() => {
    if (!editing) setDraft(value);
  }, [value, editing]);

  useEffect(() => {
    if (editing) ref.current?.focus();
  }, [editing]);

  const commit = () => {
    onSave(draft.trim().slice(0, multiline ? 2000 : 200));
    setEditing(false);
  };

  if (editing) {
    return (
      <div className="w-full">
        {label && <p className="mb-1 text-xs text-muted-foreground">{label}</p>}
        {multiline ? (
          <Textarea
            ref={ref as React.RefObject<HTMLTextAreaElement>}
            rows={4}
            maxLength={2000}
            value={draft}
            placeholder={placeholder}
            onChange={(e) => setDraft(e.target.value)}
            className="resize-none"
          />
        ) : (
          <Input
            ref={ref as React.RefObject<HTMLInputElement>}
            type={inputType}
            maxLength={200}
            value={draft}
            placeholder={placeholder}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") commit();
              if (e.key === "Escape") setEditing(false);
            }}
          />
        )}
        <div className="mt-2 flex gap-2">
          <Button size="sm" onClick={commit} className="h-8 gap-1.5">
            <Check className="size-3.5" /> Save
          </Button>
          <Button size="sm" variant="outline" onClick={() => setEditing(false)} className="h-8 gap-1.5">
            <X className="size-3.5" /> Cancel
          </Button>
        </div>
      </div>
    );
  }

  return (
    <button
      onClick={() => setEditing(true)}
      className={cn("group w-full text-left", className)}
      aria-label={`Edit ${label ?? "field"}`}
    >
      {label && <p className="text-xs text-muted-foreground">{label}</p>}
      <span className="flex items-start gap-2">
        <span
          className={cn(
            "min-w-0 flex-1 whitespace-pre-line",
            value ? "text-foreground" : "text-muted-foreground",
          )}
        >
          {value || placeholder || "Add"}
        </span>
        <Pencil className="mt-0.5 size-3.5 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
      </span>
    </button>
  );
}

// ── Section Wrapper ────────────────────────────────────────

function EditSection({
  icon: Icon,
  title,
  description,
  children,
}: {
  icon: React.ElementType;
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <Card className="gap-0 rounded-2xl p-5 shadow-card">
      <div className="flex items-center gap-3">
        <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-teal/15 text-teal">
          <Icon className="size-5" />
        </div>
        <div>
          <h3 className="font-display text-[15px] font-bold">{title}</h3>
          {description && (
            <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
          )}
        </div>
      </div>
      <div className="mt-4 space-y-4 border-t border-border/60 pt-4">
        {children}
      </div>
    </Card>
  );
}

// ── Profile Preview (view mode) ─────────────────────────

const AVAILABILITY_LABEL: Record<string, string> = {
  available: "Available",
  busy: "Busy",
  not_available: "Not Available",
};

const AVAILABILITY_COLOR: Record<string, string> = {
  available: "bg-emerald-100 text-emerald-700",
  busy: "bg-amber-100 text-amber-700",
  not_available: "bg-red-100 text-red-700",
};

const PRIVACY_LABEL: Record<string, string> = {
  public: "Public",
  recruiters_only: "Recruiters Only",
  private: "Private",
};

function ProfilePreview({ profile }: { profile: TalentProfile }) {
  const location = profile.location ?? {};
  const locationString = [location.city, location.state, location.country]
    .filter(Boolean)
    .join(", ");

  const socialLinks = profile.social_links ?? {};
  const socialPlatforms = ["instagram", "youtube", "linkedin", "twitter", "tiktok", "website"];

  return (
    <div className="mx-auto w-full max-w-[520px] lg:max-w-2xl">
      <div className="space-y-4 px-4 pb-10 pt-5 lg:px-6">
        {/* Header */}
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">My Profile</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Preview how recruiters see your profile
          </p>
        </div>

        {/* ── Avatar & Identity ────────────────────────── */}
        <Card className="rounded-2xl p-5 shadow-card">
          <div className="flex items-center gap-4">
            <Avatar className="size-20 border-2 border-teal/30">
              <AvatarImage src={profile.profile_photo} alt="Profile" />
              <AvatarFallback className="text-lg">
                {(profile.full_legal_name || profile.username || "?")[0]?.toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <p className="text-lg font-semibold">{profile.full_legal_name || "Add your name"}</p>
              <p className="text-sm text-muted-foreground">@{profile.username}</p>
              {profile.headline && (
                <p className="mt-1 text-sm text-muted-foreground">{profile.headline}</p>
              )}
            </div>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {profile.availability && (
              <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${AVAILABILITY_COLOR[profile.availability] ?? "bg-muted text-muted-foreground"}`}>
                {AVAILABILITY_LABEL[profile.availability] ?? profile.availability}
              </span>
            )}
            {profile.privacy_mode && (
              <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
                <Shield className="size-3" /> {PRIVACY_LABEL[profile.privacy_mode] ?? profile.privacy_mode}
              </span>
            )}
          </div>
        </Card>

        {/* ── About ────────────────────────────────────── */}
        <Card className="rounded-2xl p-5 shadow-card">
          <div className="flex items-center gap-2">
            <div className="grid size-8 shrink-0 place-items-center rounded-lg bg-teal/15 text-teal">
              <FileText className="size-4" />
            </div>
            <h3 className="font-display text-sm font-bold">About</h3>
          </div>
          <div className="mt-3 space-y-3 border-t border-border/60 pt-3">
            <p className="text-sm leading-relaxed text-foreground/80">
              {profile.about || "No bio added yet."}
            </p>
            {profile.years_of_experience != null && (
              <p className="text-xs text-muted-foreground">
                <span className="font-medium text-foreground/70">Experience:</span> {profile.years_of_experience} years
              </p>
            )}
          </div>
        </Card>

        {/* ── Professions & Specialties ────────────────── */}
        <Card className="rounded-2xl p-5 shadow-card">
          <div className="flex items-center gap-2">
            <div className="grid size-8 shrink-0 place-items-center rounded-lg bg-teal/15 text-teal">
              <Star className="size-4" />
            </div>
            <h3 className="font-display text-sm font-bold">Professions & Specialties</h3>
          </div>
          <div className="mt-3 space-y-3 border-t border-border/60 pt-3">
            {profile.professions && profile.professions.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {profile.professions.map((p) => (
                  <Badge key={p} variant="secondary" className="rounded-full">{p}</Badge>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No professions added</p>
            )}
            {profile.specialties && profile.specialties.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {profile.specialties.map((s) => (
                  <Badge key={s} variant="outline" className="rounded-full">{s}</Badge>
                ))}
              </div>
            )}
          </div>
        </Card>

        {/* ── Location ─────────────────────────────────── */}
        {locationString && (
          <Card className="rounded-2xl p-5 shadow-card">
            <div className="flex items-center gap-2">
              <div className="grid size-8 shrink-0 place-items-center rounded-lg bg-teal/15 text-teal">
                <MapPin className="size-4" />
              </div>
              <h3 className="font-display text-sm font-bold">Location</h3>
            </div>
            <div className="mt-3 border-t border-border/60 pt-3">
              <p className="text-sm text-foreground/80">{locationString}</p>
            </div>
          </Card>
        )}

        {/* ── Physical Attributes ──────────────────────── */}
        <Card className="rounded-2xl p-5 shadow-card">
          <div className="flex items-center gap-2">
            <div className="grid size-8 shrink-0 place-items-center rounded-lg bg-teal/15 text-teal">
              <Eye className="size-4" />
            </div>
            <h3 className="font-display text-sm font-bold">Physical Attributes</h3>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-2 border-t border-border/60 pt-3">
            {([
              profile.physical_attributes?.height_cm ? ["Height", `${profile.physical_attributes.height_cm} cm`] : null,
              profile.physical_attributes?.weight_kg ? ["Weight", `${profile.physical_attributes.weight_kg} kg`] : null,
              profile.physical_attributes?.body_type ? ["Body Type", profile.physical_attributes.body_type] : null,
              profile.physical_attributes?.complexion ? ["Complexion", profile.physical_attributes.complexion] : null,
              profile.physical_attributes?.hair_color ? ["Hair Color", profile.physical_attributes.hair_color] : null,
              profile.physical_attributes?.hair_length ? ["Hair Length", profile.physical_attributes.hair_length] : null,
              profile.physical_attributes?.eye_color ? ["Eye Color", profile.physical_attributes.eye_color] : null,
              profile.physical_attributes?.distinctive_features ? ["Distinctive Features", profile.physical_attributes.distinctive_features] : null,
            ] as [string, string][])
              .filter((attr): attr is [string, string] => attr !== null)
              .map(([label, value]) => (
                <div key={label} className="rounded-xl border border-border/60 bg-muted/30 px-3 py-2">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60">{label}</p>
                  <p className="text-sm font-medium text-foreground/80">{value}</p>
                </div>
              ))}
            {(!profile.physical_attributes ||
              Object.values(profile.physical_attributes).every((v) => v == null)) && (
              <p className="col-span-2 text-sm text-muted-foreground">No physical attributes added</p>
            )}
          </div>
        </Card>

        {/* ── Languages & Accents ──────────────────────── */}
        <Card className="rounded-2xl p-5 shadow-card">
          <div className="flex items-center gap-2">
            <div className="grid size-8 shrink-0 place-items-center rounded-lg bg-teal/15 text-teal">
              <Languages className="size-4" />
            </div>
            <h3 className="font-display text-sm font-bold">Languages & Accents</h3>
          </div>
          <div className="mt-3 space-y-3 border-t border-border/60 pt-3">
            {profile.languages && profile.languages.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {profile.languages.map((l, i) => (
                  <Badge key={i} variant="secondary" className="rounded-full">
                    {l.name} <span className="ml-1 text-muted-foreground">({l.fluency})</span>
                  </Badge>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No languages added</p>
            )}
            {profile.accents && profile.accents.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {profile.accents.map((a) => (
                  <Badge key={a} variant="outline" className="rounded-full">{a}</Badge>
                ))}
              </div>
            )}
          </div>
        </Card>

        {/* ── Skills ───────────────────────────────────── */}
        <Card className="rounded-2xl p-5 shadow-card">
          <div className="flex items-center gap-2">
            <div className="grid size-8 shrink-0 place-items-center rounded-lg bg-teal/15 text-teal">
              <Paperclip className="size-4" />
            </div>
            <h3 className="font-display text-sm font-bold">Skills</h3>
          </div>
          <div className="mt-3 space-y-3 border-t border-border/60 pt-3">
            {profile.skills && profile.skills.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {profile.skills.map((skill, i) => (
                  <Badge key={i} variant="secondary" className="rounded-full">
                    {skill.name}
                    <span className="ml-1 text-muted-foreground capitalize">({skill.proficiency})</span>
                  </Badge>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No skills added</p>
            )}
          </div>
        </Card>

        {/* ── Social Links ─────────────────────────────── */}
        <Card className="rounded-2xl p-5 shadow-card">
          <div className="flex items-center gap-2">
            <div className="grid size-8 shrink-0 place-items-center rounded-lg bg-teal/15 text-teal">
              <Link2 className="size-4" />
            </div>
            <h3 className="font-display text-sm font-bold">Social Links</h3>
          </div>
          <div className="mt-3 space-y-2 border-t border-border/60 pt-3">
            {socialPlatforms.map((platform) => {
              const link = socialLinks[platform];
              if (!link?.url) return null;
              return (
                <a
                  key={platform}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-teal hover:underline"
                >
                  <Globe className="size-3.5" />
                  <span className="capitalize">{platform}</span>
                </a>
              );
            })}
            {socialPlatforms.every((p) => !socialLinks[p]?.url) && (
              <p className="text-sm text-muted-foreground">No social links added</p>
            )}
          </div>
        </Card>

        {/* ── Documents ────────────────────────────────── */}
        {(profile.documents?.resume_url || profile.documents?.portfolio_pdf_url || profile.documents?.measurements_sheet_url) && (
          <Card className="rounded-2xl p-5 shadow-card">
            <div className="flex items-center gap-2">
              <div className="grid size-8 shrink-0 place-items-center rounded-lg bg-teal/15 text-teal">
                <FileText className="size-4" />
              </div>
              <h3 className="font-display text-sm font-bold">Documents</h3>
            </div>
            <div className="mt-3 space-y-2 border-t border-border/60 pt-3">
              {profile.documents?.resume_url && (
                <a href={profile.documents.resume_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-teal hover:underline">
                  <FileText className="size-3.5" /> Resume
                </a>
              )}
              {profile.documents?.portfolio_pdf_url && (
                <a href={profile.documents.portfolio_pdf_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-teal hover:underline">
                  <FileText className="size-3.5" /> Portfolio PDF
                </a>
              )}
              {profile.documents?.measurements_sheet_url && (
                <a href={profile.documents.measurements_sheet_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-teal hover:underline">
                  <FileText className="size-3.5" /> Measurements Sheet
                </a>
              )}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────

export function ProfilePage() {
  const profileQuery = useMyProfile();
  const updateProfile = useUpdateMyProfile();
  const uploadPhoto = useUploadTalentPhoto();
  const [isEditing, setIsEditing] = useState(false);

  const [sheet, setSheet] = useState<
    null | "professions" | "specialties" | "languages" | "accents" | "skills" | "physical"
  >(null);

  // Sheet-specific state
  const [editingLanguageIdx, setEditingLanguageIdx] = useState<number | null>(null);
  const [languageDraft, setLanguageDraft] = useState({ name: "", fluency: "Fluent" });
  const [editingSkillIdx, setEditingSkillIdx] = useState<number | null>(null);
  const [skillDraft, setSkillDraft] = useState({ name: "", proficiency: "intermediate" as "beginner" | "intermediate" | "expert" });

  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handlePhotoUpload = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
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
      e.target.value = "";
    },
    [uploadPhoto, handleFieldUpdate],
  );

  // ── Loading state ──────────────────────────────────────

  if (profileQuery.isLoading) {
    return (
      <div className="mx-auto w-full max-w-[520px] lg:max-w-2xl">
        <div className="space-y-4 px-4 pb-10 pt-5 lg:px-6">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-64" />
          <Skeleton className="h-[120px] rounded-2xl" />
          <Skeleton className="h-[200px] rounded-2xl" />
          <Skeleton className="h-[160px] rounded-2xl" />
          <Skeleton className="h-[160px] rounded-2xl" />
        </div>
      </div>
    );
  }

  const profile = profileQuery.data;
  if (!profile) return null;

  const location = profile.location ?? {};
  const locationString = [location.city, location.state, location.country]
    .filter(Boolean)
    .join(", ");

  const socialLinks = profile.social_links ?? {};
  const socialPlatforms = ["instagram", "youtube", "linkedin", "twitter", "tiktok", "website"];

  if (!isEditing) {
    return (
      <>
        <ProfilePreview profile={profile} />
        <button
          onClick={() => setIsEditing(true)}
          className="fixed bottom-6 right-6 z-50 grid size-14 place-items-center rounded-full bg-teal text-white shadow-lg transition-all hover:bg-teal/90 hover:shadow-xl lg:bottom-8 lg:right-8"
          aria-label="Edit profile"
        >
          <Pencil className="size-5" />
        </button>
      </>
    );
  }

  return (
    <>
    <div className="mx-auto w-full max-w-[520px] lg:max-w-2xl">
      <div className="space-y-4 px-4 pb-28 pt-5 lg:px-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-2xl font-bold text-foreground">
              Edit Profile
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Update your profile information visible to recruiters
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsEditing(false)}
            className="gap-1.5"
          >
            <Eye className="size-4" /> Preview
          </Button>
        </div>

        {/* ── Identity ──────────────────────────────────── */}
        <EditSection icon={User} title="Identity" description="Your basic profile info">
          {/* Photo */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="relative shrink-0"
            >
              <Avatar className="size-20 border-2 border-teal/30">
                <AvatarImage src={profile.profile_photo} alt="Profile" />
                <AvatarFallback className="text-lg">
                  {(profile.full_legal_name || profile.username || "?")[0]?.toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <span className="absolute bottom-0 right-0 flex size-6 items-center justify-center rounded-full border-2 border-card bg-muted">
                <Camera className="size-3" />
              </span>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handlePhotoUpload}
            />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold">{profile.full_legal_name || profile.username}</p>
              <p className="text-xs text-muted-foreground">@{profile.username}</p>
            </div>
          </div>

          <InlineField
            label="Full Name"
            value={profile.full_legal_name ?? ""}
            onSave={(v) => handleFieldUpdate("full_legal_name", v)}
            placeholder="Your full legal name"
          />
          <InlineField
            label="Username"
            value={profile.username ?? ""}
            onSave={(v) => handleFieldUpdate("username", v)}
            placeholder="your-username"
          />
          <InlineField
            label="Headline"
            value={profile.headline ?? ""}
            onSave={(v) => handleFieldUpdate("headline", v)}
            placeholder="e.g. Actor & Model based in Mumbai"
          />
        </EditSection>

        {/* ── About ─────────────────────────────────────── */}
        <EditSection icon={FileText} title="About" description="Tell recruiters about yourself">
          <InlineField
            value={profile.about ?? ""}
            onSave={(v) => handleFieldUpdate("about", v)}
            multiline
            placeholder="Write a short bio about yourself..."
          />
          <div>
            <p className="mb-1.5 text-xs text-muted-foreground">Availability</p>
            <Select
              value={profile.availability ?? "available"}
              onValueChange={(v) => handleFieldUpdate("availability", v)}
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
          <InlineField
            label="Years of Experience"
            value={profile.years_of_experience != null ? String(profile.years_of_experience) : ""}
            onSave={(v) => {
              const n = parseInt(v, 10);
              if (!isNaN(n) && n >= 0 && n <= 100) handleFieldUpdate("years_of_experience", n);
            }}
            inputType="number"
            placeholder="e.g. 5"
          />
        </EditSection>

        {/* ── Professions & Specialties ─────────────────── */}
        <EditSection icon={Star} title="Professions & Specialties" description="What you do">
          <div>
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">Professions</p>
              <Button variant="ghost" size="sm" className="h-7 gap-1 text-xs" onClick={() => setSheet("professions")}>
                <Pencil className="size-3" /> Edit
              </Button>
            </div>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {(!profile.professions || profile.professions.length === 0) ? (
                <p className="text-sm text-muted-foreground">No professions added</p>
              ) : (
                profile.professions.map((p) => (
                  <Badge key={p} variant="secondary" className="rounded-full">{p}</Badge>
                ))
              )}
            </div>
          </div>
          <div>
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">Specialties</p>
              <Button variant="ghost" size="sm" className="h-7 gap-1 text-xs" onClick={() => setSheet("specialties")}>
                <Pencil className="size-3" /> Edit
              </Button>
            </div>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {(!profile.specialties || profile.specialties.length === 0) ? (
                <p className="text-sm text-muted-foreground">No specialties added</p>
              ) : (
                profile.specialties.map((s) => (
                  <Badge key={s} variant="secondary" className="rounded-full">{s}</Badge>
                ))
              )}
            </div>
          </div>
        </EditSection>

        {/* ── Location ──────────────────────────────────── */}
        <EditSection icon={MapPin} title="Location" description="Where you're based">
          <InlineField
            label="City"
            value={location.city ?? ""}
            onSave={(v) => handleFieldUpdate("location", { ...location, city: v })}
            placeholder="e.g. Mumbai"
          />
          <InlineField
            label="State"
            value={location.state ?? ""}
            onSave={(v) => handleFieldUpdate("location", { ...location, state: v })}
            placeholder="e.g. Maharashtra"
          />
          <InlineField
            label="Country"
            value={location.country ?? ""}
            onSave={(v) => handleFieldUpdate("location", { ...location, country: v })}
            placeholder="e.g. India"
          />
        </EditSection>

        {/* ── Physical Attributes ───────────────────────── */}
        <EditSection icon={Eye} title="Physical Attributes" description="Help recruiters find the right fit">
          <InlineField
            label="Height (cm)"
            value={profile.physical_attributes?.height_cm != null ? String(profile.physical_attributes.height_cm) : ""}
            onSave={(v) => {
              const n = parseInt(v, 10);
              if (!isNaN(n) && n > 0 && n < 300) {
                handleFieldUpdate("physical_attributes", {
                  ...profile.physical_attributes,
                  height_cm: n,
                });
              }
            }}
            inputType="number"
            placeholder="e.g. 175"
          />
          <InlineField
            label="Weight (kg)"
            value={profile.physical_attributes?.weight_kg != null ? String(profile.physical_attributes.weight_kg) : ""}
            onSave={(v) => {
              const n = parseInt(v, 10);
              if (!isNaN(n) && n > 0 && n < 300) {
                handleFieldUpdate("physical_attributes", {
                  ...profile.physical_attributes,
                  weight_kg: n,
                });
              }
            }}
            inputType="number"
            placeholder="e.g. 65"
          />
          <div>
            <p className="mb-1.5 text-xs text-muted-foreground">Body Type</p>
            <Select
              value={profile.physical_attributes?.body_type ?? ""}
              onValueChange={(v) =>
                handleFieldUpdate("physical_attributes", {
                  ...profile.physical_attributes,
                  body_type: v,
                })
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select body type" />
              </SelectTrigger>
              <SelectContent>
                {BODY_TYPE_OPTIONS.map((opt) => (
                  <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <p className="mb-1.5 text-xs text-muted-foreground">Complexion</p>
            <Select
              value={profile.physical_attributes?.complexion ?? ""}
              onValueChange={(v) =>
                handleFieldUpdate("physical_attributes", {
                  ...profile.physical_attributes,
                  complexion: v,
                })
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select complexion" />
              </SelectTrigger>
              <SelectContent>
                {COMPLEXION_OPTIONS.map((opt) => (
                  <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <InlineField
            label="Hair Color"
            value={profile.physical_attributes?.hair_color ?? ""}
            onSave={(v) =>
              handleFieldUpdate("physical_attributes", {
                ...profile.physical_attributes,
                hair_color: v,
              })
            }
            placeholder="e.g. Black"
          />
          <div>
            <p className="mb-1.5 text-xs text-muted-foreground">Hair Length</p>
            <Select
              value={profile.physical_attributes?.hair_length ?? ""}
              onValueChange={(v) =>
                handleFieldUpdate("physical_attributes", {
                  ...profile.physical_attributes,
                  hair_length: v,
                })
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select hair length" />
              </SelectTrigger>
              <SelectContent>
                {HAIR_LENGTH_OPTIONS.map((opt) => (
                  <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <p className="mb-1.5 text-xs text-muted-foreground">Eye Color</p>
            <Select
              value={profile.physical_attributes?.eye_color ?? ""}
              onValueChange={(v) =>
                handleFieldUpdate("physical_attributes", {
                  ...profile.physical_attributes,
                  eye_color: v,
                })
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select eye color" />
              </SelectTrigger>
              <SelectContent>
                {EYE_COLOR_OPTIONS.map((opt) => (
                  <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <InlineField
            label="Distinctive Features"
            value={profile.physical_attributes?.distinctive_features ?? ""}
            onSave={(v) =>
              handleFieldUpdate("physical_attributes", {
                ...profile.physical_attributes,
                distinctive_features: v,
              })
            }
            placeholder="e.g. Dimples, Mole on left cheek"
          />
        </EditSection>

        {/* ── Languages & Accents ───────────────────────── */}
        <EditSection icon={Languages} title="Languages & Accents" description="Languages you speak">
          <div>
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">Languages</p>
              <Button variant="ghost" size="sm" className="h-7 gap-1 text-xs" onClick={() => {
                setEditingLanguageIdx(null);
                setLanguageDraft({ name: "", fluency: "Fluent" });
                setSheet("languages");
              }}>
                <Plus className="size-3" /> Add
              </Button>
            </div>
            <div className="mt-2 space-y-1.5">
              {(!profile.languages || profile.languages.length === 0) ? (
                <p className="text-sm text-muted-foreground">No languages added</p>
              ) : (
                profile.languages.map((lang, i) => (
                  <div key={i} className="flex items-center justify-between rounded-lg border border-border/60 px-3 py-2">
                    <span className="text-sm">
                      {lang.name} <span className="text-muted-foreground">({lang.fluency})</span>
                    </span>
                    <div className="flex gap-1">
                      <button
                        onClick={() => {
                          setEditingLanguageIdx(i);
                          setLanguageDraft({ ...lang });
                          setSheet("languages");
                        }}
                        className="p-1 text-muted-foreground hover:text-foreground"
                      >
                        <Pencil className="size-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          const next = profile.languages!.filter((_, j) => j !== i);
                          handleFieldUpdate("languages", next);
                        }}
                        className="p-1 text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="size-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
          <div>
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">Accents</p>
              <Button variant="ghost" size="sm" className="h-7 gap-1 text-xs" onClick={() => setSheet("accents")}>
                <Pencil className="size-3" /> Edit
              </Button>
            </div>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {(!profile.accents || profile.accents.length === 0) ? (
                <p className="text-sm text-muted-foreground">No accents added</p>
              ) : (
                profile.accents.map((a) => (
                  <Badge key={a} variant="outline" className="rounded-full">{a}</Badge>
                ))
              )}
            </div>
          </div>
        </EditSection>

        {/* ── Skills ────────────────────────────────────── */}
        <EditSection icon={Paperclip} title="Skills" description="Your professional skills">
          <div>
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">Skills</p>
              <Button variant="ghost" size="sm" className="h-7 gap-1 text-xs" onClick={() => {
                setEditingSkillIdx(null);
                setSkillDraft({ name: "", proficiency: "intermediate" });
                setSheet("skills");
              }}>
                <Plus className="size-3" /> Add
              </Button>
            </div>
            <div className="mt-2 space-y-1.5">
              {(!profile.skills || profile.skills.length === 0) ? (
                <p className="text-sm text-muted-foreground">No skills added</p>
              ) : (
                profile.skills.map((skill, i) => (
                  <div key={i} className="flex items-center justify-between rounded-lg border border-border/60 px-3 py-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{skill.name}</span>
                      <Badge variant="secondary" className="text-[10px] capitalize">{skill.proficiency}</Badge>
                    </div>
                    <div className="flex gap-1">
                      <button
                        onClick={() => {
                          setEditingSkillIdx(i);
                          setSkillDraft({ name: skill.name, proficiency: skill.proficiency as typeof skillDraft.proficiency });
                          setSheet("skills");
                        }}
                        className="p-1 text-muted-foreground hover:text-foreground"
                      >
                        <Pencil className="size-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          const next = profile.skills!.filter((_, j) => j !== i);
                          handleFieldUpdate("skills", next);
                        }}
                        className="p-1 text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="size-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </EditSection>

        {/* ── Social Links ──────────────────────────────── */}
        <EditSection icon={Link2} title="Social Links" description="Your online presence">
          {socialPlatforms.map((platform) => {
            const link = socialLinks[platform];
            return (
              <InlineField
                key={platform}
                label={platform.charAt(0).toUpperCase() + platform.slice(1)}
                value={link?.url ?? ""}
                onSave={(v) => {
                  const next = { ...socialLinks };
                  if (v) {
                    next[platform] = { ...next[platform], url: v, visibility: "public", show_on_profile: true };
                  } else {
                    delete next[platform];
                  }
                  handleFieldUpdate("social_links", next);
                }}
                inputType="url"
                placeholder={`https://${platform}.com/...`}
              />
            );
          })}
        </EditSection>

        {/* ── Documents ─────────────────────────────────── */}
        <EditSection icon={FileText} title="Documents" description="Resume, portfolio & measurements">
          <InlineField
            label="Resume URL"
            value={profile.documents?.resume_url ?? ""}
            onSave={(v) => handleFieldUpdate("documents", { ...profile.documents, resume_url: v })}
            inputType="url"
            placeholder="https://..."
          />
          <InlineField
            label="Portfolio PDF URL"
            value={profile.documents?.portfolio_pdf_url ?? ""}
            onSave={(v) => handleFieldUpdate("documents", { ...profile.documents, portfolio_pdf_url: v })}
            inputType="url"
            placeholder="https://..."
          />
          <InlineField
            label="Measurements Sheet URL"
            value={profile.documents?.measurements_sheet_url ?? ""}
            onSave={(v) => handleFieldUpdate("documents", { ...profile.documents, measurements_sheet_url: v })}
            inputType="url"
            placeholder="https://..."
          />
        </EditSection>

        {/* ── Privacy ───────────────────────────────────── */}
        <EditSection icon={Lock} title="Privacy" description="Control who sees your profile">
          <div>
            <p className="mb-1.5 text-xs text-muted-foreground">Profile Visibility</p>
            <Select
              value={profile.privacy_mode ?? "public"}
              onValueChange={(v) => handleFieldUpdate("privacy_mode", v)}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PRIVACY_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    <div>
                      <p className="text-sm">{opt.label}</p>
                      <p className="text-xs text-muted-foreground">{opt.desc}</p>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </EditSection>

        <p className="pt-1 text-center text-[11px] text-muted-foreground/60">
          Changes save automatically when you tap Save
        </p>
      </div>

      {/* ── Professions Sheet ──────────────────────────── */}
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

      {/* ── Specialties Sheet ──────────────────────────── */}
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

      {/* ── Languages Sheet ────────────────────────────── */}
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
              <p className="mb-1.5 text-xs text-muted-foreground">Language</p>
              <Input
                value={languageDraft.name}
                onChange={(e) => setLanguageDraft((d) => ({ ...d, name: e.target.value }))}
                placeholder="e.g. Hindi, English, Marathi"
              />
            </div>
            <div>
              <p className="mb-1.5 text-xs text-muted-foreground">Fluency</p>
              <Select
                value={languageDraft.fluency}
                onValueChange={(v) => setLanguageDraft((d) => ({ ...d, fluency: v }))}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
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

      {/* ── Accents Sheet ──────────────────────────────── */}
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

      {/* ── Skills Sheet ───────────────────────────────── */}
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
              <p className="mb-1.5 text-xs text-muted-foreground">Skill Name</p>
              <Input
                value={skillDraft.name}
                onChange={(e) => setSkillDraft((d) => ({ ...d, name: e.target.value }))}
                placeholder="e.g. Classical Dance, Guitar, Swimming"
              />
            </div>
            <div>
              <p className="mb-1.5 text-xs text-muted-foreground">Proficiency</p>
              <Select
                value={skillDraft.proficiency}
                onValueChange={(v) => setSkillDraft((d) => ({ ...d, proficiency: v as typeof skillDraft.proficiency }))}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
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
    </>
  );
}
