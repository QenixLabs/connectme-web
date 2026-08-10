"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import {
  ArrowLeft,
  ShieldCheck,
  Briefcase,
  Star,
  MapPin,
  ChevronDown,
  Copy,
  Contact,
  Link2,
  Pencil,
  Linkedin,
  Globe,
  Users,
  Tag,
  FileText,
  Check,
  Camera,
  Save,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { useAuthStore } from "@/providers/auth-store-provider";
import {
  useRecruiterProfile,
  useUpdateRecruiterProfile,
  useUploadRecruiterPhoto,
  useCheckSlugAvailability,
} from "@/hooks/use-recruiter-profile";
import type { RecruiterProfile } from "@/lib/api/recruiter";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { TagInput } from "@/components/ui/tag-input";

const SIZE_OPTIONS = [
  "1-10 employees",
  "11-50 employees",
  "51-200 employees",
  "201-500 employees",
  "500+ employees",
];

const SPECIALTY_OPTIONS = [
  "Talent Management",
  "Recruitment",
  "Influencer Marketing",
  "Casting",
  "Brand Partnerships",
  "Digital Media",
  "Events",
  "PR",
  "Marketing",
  "Entertainment",
  "Fashion",
  "Technology",
];

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function getTrustLabel(score: number): string {
  if (score >= 80) return "Excellent";
  if (score >= 60) return "Good";
  if (score >= 40) return "Fair";
  return "Needs improvement";
}

function getVerificationDisplay(
  tier: number,
  status: string,
): { label: string; sublabel: string; verified: boolean } {
  if (status === "enterprise" || status === "trusted_partner") {
    return {
      label: "Fully Verified",
      sublabel: `Tier ${tier}`,
      verified: true,
    };
  }
  if (status === "basic") {
    return {
      label: "Basic Verified",
      sublabel: `Tier ${tier}`,
      verified: true,
    };
  }
  return {
    label: "Verification Pending",
    sublabel: `Tier ${tier}`,
    verified: false,
  };
}

function SectionIcon({ icon: Icon }: { icon: typeof Tag }) {
  return (
    <div className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-teal-500/25 bg-teal-500/10">
      <Icon className="size-4.5 text-teal-400" />
    </div>
  );
}

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
    onSave(draft.trim().slice(0, multiline ? 1000 : 200));
    setEditing(false);
  };

  if (editing) {
    const shared =
      "w-full rounded-lg border border-teal-500/50 bg-slate-900/60 px-3 py-2 text-sm text-white outline-none placeholder:text-slate-500";
    return (
      <div className="w-full">
        {label && (
          <p className="mb-1 text-sm text-slate-500">{label}</p>
        )}
        {multiline ? (
          <textarea
            ref={ref as React.RefObject<HTMLTextAreaElement>}
            rows={5}
            maxLength={1000}
            value={draft}
            placeholder={placeholder}
            onChange={(e) => setDraft(e.target.value)}
            className={shared}
          />
        ) : (
          <input
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
            className={shared}
          />
        )}
        <div className="mt-2 flex gap-2">
          <button
            onClick={commit}
            className="flex h-9 items-center gap-1.5 rounded-lg bg-teal-500 px-3 text-sm font-medium text-[#050b14]"
          >
            <Check className="size-4" /> Save
          </button>
          <button
            onClick={() => setEditing(false)}
            className="flex h-9 items-center gap-1.5 rounded-lg border border-slate-700 px-3 text-sm text-slate-300"
          >
            <X className="size-4" /> Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <button
      onClick={() => setEditing(true)}
      className={`group w-full text-left ${className}`}
      aria-label={`Edit ${label ?? "field"}`}
    >
      {label && <p className="text-sm text-slate-500">{label}</p>}
      <span className="flex items-start gap-2">
        <span
          className={`min-w-0 flex-1 whitespace-pre-line ${
            value ? "text-white" : "text-slate-500"
          }`}
        >
          {value || placeholder || "Add"}
        </span>
        <Pencil className="mt-0.5 size-4 shrink-0 text-slate-600 opacity-70 group-hover:text-teal-400" />
      </span>
    </button>
  );
}

function CopyButton({ label, value }: { label: string; value: string }) {
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      toast.success(`${label} copied`);
    } catch {
      toast.error("Couldn't copy");
    }
  };
  return (
    <button aria-label={`Copy ${label}`} onClick={copy} className="p-1 text-slate-500 hover:text-teal-400">
      <Copy className="size-5" />
    </button>
  );
}

function SkeletonBlock({ className }: { className?: string }) {
  return (
    <div className={`animate-pulse rounded-lg bg-slate-800 ${className ?? ""}`} />
  );
}

export default function RecruiterProfileEditPage() {
  const user = useAuthStore((s) => s.user);
  const { data: profile, isLoading } = useRecruiterProfile();
  const updateProfile = useUpdateRecruiterProfile();
  const uploadPhoto = useUploadRecruiterPhoto();
  const checkSlug = useCheckSlugAvailability();

  const [sheet, setSheet] = useState<null | "size" | "specialties">(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const saved = (label: string) => toast.success(`${label} updated`);

  const handleFieldUpdate = useCallback(
    (field: string, value: string | number | string[] | Record<string, string>) => {
      updateProfile.mutate({ [field]: value } as Parameters<typeof updateProfile.mutate>[0], {
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
          handleFieldUpdate("profile_photo", data.signedUrl);
          toast.success("Photo uploaded");
        },
        onError: () => toast.error("Upload failed"),
      });
      e.target.value = "";
    },
    [uploadPhoto, handleFieldUpdate],
  );

  const handleSlugUpdate = useCallback(
    (newSlug: string) => {
      const sanitized = newSlug
        .toLowerCase()
        .replace(/[^a-z0-9-]/g, "")
        .slice(0, 40);
      if (sanitized === profile?.slug) return;
      if (sanitized.length < 3) {
        toast.error("Slug must be at least 3 characters");
        return;
      }
      checkSlug.mutate(sanitized, {
        onSuccess: (available) => {
          if (!available) {
            toast.error("Slug already taken");
            return;
          }
          handleFieldUpdate("slug", sanitized);
        },
        onError: () => toast.error("Could not check slug"),
      });
    },
    [profile?.slug, checkSlug, handleFieldUpdate],
  );

  if (isLoading) {
    return (
      <div className="mx-auto w-full max-w-2xl px-4 py-6">
        <SkeletonBlock className="mb-6 h-10 w-32" />
        <SkeletonBlock className="mb-4 h-40 w-full" />
        <SkeletonBlock className="mb-4 h-32 w-full" />
        <SkeletonBlock className="mb-4 h-24 w-full" />
        <SkeletonBlock className="mb-4 h-24 w-full" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="mx-auto w-full max-w-2xl px-4 py-6">
        <p className="text-slate-500">Profile not found.</p>
      </div>
    );
  }

  const trustScore = user?.trust_score ?? 0;
  const verificationTier = user?.verification_tier ?? 1;
  const verification = getVerificationDisplay(verificationTier, profile.verification_status);
  const location = profile.location ?? {};
  const locationString = [location.city, location.state, location.country]
    .filter(Boolean)
    .join(", ");

  return (
    <main className="min-h-screen bg-[#050b14] pb-12">
      <div className="mx-auto max-w-2xl border-x border-slate-800/60 bg-[#0a1420] px-4 pt-5">
        {/* Header */}
        <div className="flex items-center gap-3">
          <button
            aria-label="Back"
            onClick={() => window.history.back()}
            className="flex size-11 items-center justify-center rounded-xl border border-slate-800 bg-[#0a1420]"
          >
            <ArrowLeft className="size-5 text-white" />
          </button>
          <h1 className="flex-1 text-2xl font-semibold text-white">Edit Profile</h1>
        </div>

        {/* Identity card */}
        <section className="mt-5 rounded-2xl border border-slate-800 bg-[#0a1420] p-4">
          <div className="flex gap-4">
            {/* Avatar */}
            <button
              onClick={() => fileInputRef.current?.click()}
              aria-label="Upload profile photo"
              className="relative flex size-20 shrink-0 items-center justify-center rounded-2xl border border-teal-500/40 bg-teal-950/40 text-2xl font-bold text-teal-300 shadow-[0_0_20px_rgba(20,184,166,0.15)]"
            >
              {profile.profile_photo ? (
                <img
                  src={profile.profile_photo}
                  alt={profile.company_name}
                  className="size-20 rounded-2xl object-cover"
                />
              ) : (
                getInitials(profile.company_name)
              )}
              <span className="absolute -bottom-1 -right-1 flex size-6 items-center justify-center rounded-full border-2 border-[#0a1420] bg-slate-700">
                <Camera className="size-3 text-white" />
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
              <div className="flex items-start gap-2">
                <div className="min-w-0 flex-1">
                  <InlineField
                    value={profile.company_name}
                    onSave={(v) => handleFieldUpdate("company_name", v)}
                    className="text-2xl font-bold leading-tight text-white"
                  />
                </div>
                {verification.verified && (
                  <span className="mt-1 inline-flex shrink-0 items-center gap-1 rounded-full bg-teal-500/15 px-2.5 py-1 text-xs font-medium text-teal-400">
                    <ShieldCheck className="size-3.5" /> Verified
                  </span>
                )}
              </div>

              {/* Slug */}
              <div className="mt-1">
                <InlineField
                  value={profile.slug}
                  onSave={handleSlugUpdate}
                  placeholder="your-slug"
                  className="text-sm text-slate-500"
                />
              </div>

              <div className="mt-2 flex items-start gap-2 text-sm text-slate-400">
                <Briefcase className="mt-1 size-4 shrink-0" />
                <div className="flex min-w-0 flex-1 flex-col gap-1">
                  <InlineField
                    value={profile.industry ?? ""}
                    onSave={(v) => handleFieldUpdate("industry", v)}
                    placeholder="Add industry"
                  />
                  <InlineField
                    label="Founded"
                    value={profile.founded_year ? String(profile.founded_year) : ""}
                    onSave={(v) => {
                      const year = parseInt(v, 10);
                      if (!isNaN(year) && year >= 1800 && year <= 2100) {
                        handleFieldUpdate("founded_year", year);
                      }
                    }}
                    placeholder="Year"
                  />
                </div>
              </div>

              <p className="mt-2 flex items-center gap-3 text-sm">
                <span className="rounded-md border border-teal-500/40 px-2 py-0.5 text-teal-400">
                  Tier {verificationTier}
                </span>
                <span className="flex items-center gap-1.5 text-slate-500">
                  <Star className="size-4 text-amber-400" /> Trust Score{" "}
                  <span className="font-semibold text-teal-400">{trustScore}%</span>
                </span>
              </p>
            </div>
          </div>

          {/* Headline */}
          <div className="mt-4 border-t border-slate-800 pt-3">
            <InlineField
              label="Headline"
              value={profile.headline ?? ""}
              onSave={(v) => handleFieldUpdate("headline", v)}
              placeholder="What does your company do?"
              className="font-semibold text-white"
            />
          </div>

          {/* Position */}
          <div className="mt-3 border-t border-slate-800 pt-3">
            <InlineField
              label="Your Position"
              value={profile.position ?? ""}
              onSave={(v) => handleFieldUpdate("position", v)}
              placeholder="e.g. Founder, CEO"
              className="text-white"
            />
          </div>
        </section>

        {/* Verification status */}
        <button className="mt-4 flex w-full items-center gap-4 rounded-2xl border border-slate-800 bg-[#0a1420] p-4 text-left">
          <div
            className={`flex size-12 items-center justify-center rounded-xl ${
              verification.verified ? "bg-teal-950/60" : "bg-slate-800"
            }`}
          >
            <ShieldCheck
              className={`size-6 ${verification.verified ? "text-teal-400" : "text-slate-500"}`}
            />
          </div>
          <div className="flex-1">
            <p className="font-semibold text-white">{verification.label}</p>
            <p
              className={`text-sm ${
                verification.verified ? "text-teal-400" : "text-slate-500"
              }`}
            >
              {verification.sublabel}
            </p>
          </div>
        </button>

        {/* Contact info */}
        <section className="mt-4 rounded-2xl border border-slate-800 bg-[#0a1420] p-4">
          <div className="flex items-center gap-3">
            <SectionIcon icon={Contact} />
            <div>
              <p className="font-semibold text-white">Contact Info</p>
              <p className="text-sm text-slate-500">How clients can reach you</p>
            </div>
          </div>
          {(
            [
              { label: "Email", value: user?.email ?? "", type: "email" },
              { label: "Phone", value: user?.phone ?? "", type: "tel" },
            ] as const
          ).map((f) => (
            <div
              key={f.label}
              className="mt-3 flex items-start gap-3 border-t border-slate-800 pt-3"
            >
              <div className="min-w-0 flex-1">
                <p className="text-sm text-slate-500">{f.label}</p>
                <p className="font-medium text-white">{f.value || "Not set"}</p>
              </div>
              {f.value && <CopyButton label={f.label} value={f.value} />}
            </div>
          ))}
          <p className="mt-3 text-xs text-slate-600">
            Contact details are managed in account settings
          </p>
        </section>

        {/* Links & socials */}
        <section className="mt-4 rounded-2xl border border-slate-800 bg-[#0a1420] p-4">
          <div className="flex items-center gap-3">
            <SectionIcon icon={Link2} />
            <p className="flex-1 font-semibold text-white">Links & Socials</p>
          </div>
          <div className="mt-4 flex gap-3">
            {[
              {
                key: "linkedin",
                Icon: Linkedin,
                label: "LinkedIn",
                active: !!profile.linkedin_company_url,
              },
              {
                key: "website",
                Icon: Globe,
                label: "Website",
                active: !!profile.company_website,
              },
            ].map(({ key, Icon, label, active }) => (
              <div
                key={key}
                className={`flex size-11 items-center justify-center rounded-xl border ${
                  active
                    ? "border-teal-500/50 bg-teal-500/10 text-teal-400"
                    : "border-slate-800 bg-slate-900/40 text-slate-600"
                }`}
              >
                <Icon className="size-5" />
              </div>
            ))}
          </div>
          <div className="mt-4 flex items-start gap-3">
            <div className="min-w-0 flex-1">
              <InlineField
                label="Website"
                value={profile.company_website ?? ""}
                inputType="url"
                placeholder="https://example.com"
                onSave={(v) => handleFieldUpdate("company_website", v)}
                className="text-teal-400"
              />
            </div>
            {profile.company_website && (
              <CopyButton label="Website" value={profile.company_website} />
            )}
          </div>
          <div className="mt-3 border-t border-slate-800 pt-3">
            <InlineField
              label="LinkedIn"
              value={profile.linkedin_company_url ?? ""}
              inputType="url"
              placeholder="https://linkedin.com/company/..."
              onSave={(v) => handleFieldUpdate("linkedin_company_url", v)}
              className="text-teal-400"
            />
          </div>
        </section>

        {/* Location */}
        <section className="mt-4 rounded-2xl border border-slate-800 bg-[#0a1420] p-4">
          <div className="flex items-center gap-3">
            <SectionIcon icon={MapPin} />
            <div>
              <p className="font-semibold text-white">Company Location</p>
              <p className="text-sm text-slate-500">Where your company is based</p>
            </div>
          </div>
          <div className="mt-4">
            <InlineField
              value={locationString}
              placeholder="City, State, Country"
              onSave={(v) => {
                const parts = v.split(",").map((s) => s.trim());
                const newLocation: Record<string, string> = { ...location };
                if (parts[0]) newLocation.city = parts[0];
                if (parts[1]) newLocation.state = parts[1];
                if (parts[2]) newLocation.country = parts[2];
                if (!parts[1]) delete newLocation.state;
                if (!parts[2]) delete newLocation.country;
                handleFieldUpdate("location", newLocation);
              }}
              className="font-medium text-white"
            />
          </div>
        </section>

        {/* Company Size */}
        <section className="mt-4 rounded-2xl border border-slate-800 bg-[#0a1420] p-4">
          <div className="flex items-center gap-3">
            <SectionIcon icon={Users} />
            <div>
              <p className="font-semibold text-white">Company Size</p>
              <p className="text-sm text-slate-500">Number of employees</p>
            </div>
          </div>
          <button
            onClick={() => setSheet("size")}
            className="mt-4 flex w-full items-center text-left"
          >
            <span className="flex-1 font-medium text-white">
              {profile.company_size || "Select size"}
            </span>
            <ChevronDown className="size-5 text-slate-500" />
          </button>
        </section>

        {/* Specialties (Tags) */}
        <section className="mt-4 rounded-2xl border border-slate-800 bg-[#0a1420] p-4">
          <div className="flex items-center gap-3">
            <SectionIcon icon={Tag} />
            <div className="flex-1">
              <p className="font-semibold text-white">Specialties</p>
              <p className="text-sm text-slate-500">Select relevant areas</p>
            </div>
            <button
              onClick={() => setSheet("specialties")}
              className="flex h-9 items-center gap-2 rounded-lg border border-slate-700 bg-slate-800 px-3 text-sm text-slate-300"
            >
              <Pencil className="size-3.5" /> Edit
            </button>
          </div>
          <div className="mt-4 flex flex-wrap gap-3">
            {(!profile.specialties || profile.specialties.length === 0) && (
              <p className="text-sm text-slate-500">No specialties selected yet</p>
            )}
            {profile.specialties?.map((t) => (
              <span
                key={t}
                className="rounded-lg border border-teal-500/50 bg-teal-500/5 px-4 py-2 text-sm text-teal-400"
              >
                {t}
              </span>
            ))}
          </div>
        </section>

        {/* About / Bio */}
        <section className="mt-4 rounded-2xl border border-slate-800 bg-[#0a1420] p-4">
          <div className="flex items-center gap-3">
            <SectionIcon icon={FileText} />
            <div>
              <p className="font-semibold text-white">About</p>
              <p className="text-sm text-slate-500">Tell clients about your company</p>
            </div>
          </div>
          <div className="mt-4 leading-relaxed">
            <InlineField
              multiline
              value={profile.about ?? ""}
              placeholder="Add a company description"
              onSave={(v) => handleFieldUpdate("about", v)}
            />
          </div>
        </section>

        {/* Save indicator */}
        <p className="mt-6 flex items-center justify-center gap-2 text-xs text-slate-600">
          Changes save automatically when you tap Save
        </p>
      </div>

      {/* Size Sheet */}
      <Sheet open={sheet === "size"} onOpenChange={(o) => setSheet(o ? "size" : null)}>
        <SheetContent side="bottom" className="rounded-t-2xl border-slate-800 bg-[#0a1420]">
          <SheetHeader className="px-0">
            <SheetTitle className="text-white">Company Size</SheetTitle>
            <SheetDescription>Number of employees</SheetDescription>
          </SheetHeader>
          <div className="flex flex-col gap-2 pb-8">
            {SIZE_OPTIONS.map((o) => (
              <button
                key={o}
                onClick={() => {
                  handleFieldUpdate("company_size", o);
                  setSheet(null);
                }}
                className={`flex items-center rounded-xl border px-4 py-3 text-left ${
                  profile.company_size === o
                    ? "border-teal-500/60 bg-teal-500/10 text-teal-400"
                    : "border-slate-800 text-white"
                }`}
              >
                <span className="flex-1">{o}</span>
                {profile.company_size === o && <Check className="size-4" />}
              </button>
            ))}
          </div>
        </SheetContent>
      </Sheet>

      {/* Specialties Sheet */}
      <Sheet
        open={sheet === "specialties"}
        onOpenChange={(o) => setSheet(o ? "specialties" : null)}
      >
        <SheetContent side="bottom" className="rounded-t-2xl border-slate-800 bg-[#0a1420]">
          <SheetHeader className="px-0">
            <SheetTitle className="text-white">Specialties</SheetTitle>
            <SheetDescription>Select all that apply</SheetDescription>
          </SheetHeader>
          <div className="flex flex-wrap gap-2 pb-8">
            {SPECIALTY_OPTIONS.map((t) => {
              const active = profile.specialties?.includes(t) ?? false;
              return (
                <button
                  key={t}
                  onClick={() => {
                    const current = profile.specialties ?? [];
                    const next = active
                      ? current.filter((s) => s !== t)
                      : [...current, t];
                    handleFieldUpdate("specialties", next);
                  }}
                  className={`rounded-lg border px-4 py-2 text-sm ${
                    active
                      ? "border-teal-500/60 bg-teal-500/10 text-teal-400"
                      : "border-slate-800 text-slate-400"
                  }`}
                >
                  {t}
                </button>
              );
            })}
          </div>
          <div className="border-t border-slate-800 pt-4 pb-4">
            <p className="mb-2 text-sm text-slate-500">Or add a custom specialty:</p>
            <TagInput
              value={profile.specialties ?? []}
              onChange={(tags) => handleFieldUpdate("specialties", tags)}
              placeholder="Type and press Enter"
            />
          </div>
        </SheetContent>
      </Sheet>
    </main>
  );
}
