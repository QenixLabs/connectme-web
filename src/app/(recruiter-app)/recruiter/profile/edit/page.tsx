"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import type { ButtonHTMLAttributes, ComponentType, ReactNode } from "react";
import {
  ArrowLeft,
  BadgeCheck,
  Building2,
  Briefcase,
  Camera,
  Check,
  ChevronDown,
  Copy,
  Eye,
  FileText,
  Image as ImageIcon,
  Instagram,
  Link2,
  Loader2,
  Mail,
  MapPin,
  Megaphone,
  Pencil,
  Phone,
  Plus,
  ShieldCheck,
  Sparkles,
  X,
  Youtube,
  Globe,
  Linkedin,
  Users,
} from "lucide-react";
import { siX } from "simple-icons/icons";
import { toast } from "sonner";
import { useAuthStore } from "@/providers/auth-store-provider";
import { authApi } from "@/lib/api";
import {
  useRecruiterProfile,
  useUpdateRecruiterProfile,
  useUploadRecruiterPhoto,
  useUploadRecruiterBanner,
  useUploadRecruiterAsset,
  useCheckSlugAvailability,
} from "@/hooks/use-recruiter-profile";
import type {
  PublicRecruiterProfile,
  RecruiterProfile,
  UpdateRecruiterProfilePayload,
} from "@/lib/api/recruiter";
import { RecruiterProfileView } from "@/app/recruiter/[slug]/profile-view";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { TagInput } from "@/components/ui/tag-input";
import { CropImageModal } from "@/components/ui/crop-image-modal";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const LOGO_ASPECT = 1;
const BANNER_ASPECT = 1920 / 600;
const RATIO_TOLERANCE = 0.02;

const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

function getImageDimensions(file: File): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const dims = { width: img.naturalWidth, height: img.naturalHeight };
      URL.revokeObjectURL(url);
      resolve(dims);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Failed to load image"));
    };
    img.src = url;
  });
}

function isRatioMatch(width: number, height: number, target: number): boolean {
  if (!width || !height) return false;
  const ratio = width / height;
  return Math.abs(ratio - target) / target <= RATIO_TOLERANCE;
}

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

const LANGUAGE_OPTIONS = [
  "English",
  "Hindi",
  "Telugu",
  "Tamil",
  "Bengali",
  "Marathi",
  "Kannada",
  "Malayalam",
  "Punjabi",
  "Gujarati",
  "Urdu",
  "French",
];

const MAX_SPECIALTIES = 10;

const MAX_SOCIAL_LINKS = 5;

type SocialPlatformKey = "website" | "linkedin" | "instagram" | "youtube" | "x";

interface SocialPlatform {
  key: SocialPlatformKey;
  label: string;
  field: "company_website" | "linkedin_company_url" | "instagram_url" | "youtube_url" | "x_url";
  Icon: ComponentType<{ className?: string }>;
  placeholder: string;
}

const SOCIAL_CATALOG: SocialPlatform[] = [
  { key: "website", label: "Website", field: "company_website", Icon: Globe, placeholder: "https://example.com" },
  { key: "linkedin", label: "LinkedIn", field: "linkedin_company_url", Icon: Linkedin, placeholder: "https://linkedin.com/company/..." },
  { key: "instagram", label: "Instagram", field: "instagram_url", Icon: Instagram, placeholder: "https://instagram.com/..." },
  { key: "youtube", label: "YouTube", field: "youtube_url", Icon: Youtube, placeholder: "https://youtube.com/@..." },
  { key: "x", label: "X (Twitter)", field: "x_url", Icon: XBrandIcon, placeholder: "https://x.com/..." },
];

function socialPlatform(key: SocialPlatformKey): SocialPlatform {
  return SOCIAL_CATALOG.find((p) => p.key === key) as SocialPlatform;
}

/** Platforms with a saved URL, in catalog order — initial link slots. */
function slotsFromProfile(profile: RecruiterProfile): SocialPlatformKey[] {
  return SOCIAL_CATALOG.filter((p) => {
    const value = profile[p.field];
    return typeof value === "string" && value.trim().length > 0;
  }).map((p) => p.key);
}

type Draft = UpdateRecruiterProfilePayload & {
  company_name: string;
  slug: string;
};

function draftFromProfile(profile: RecruiterProfile): Draft {
  return {
    company_name: profile.company_name ?? "",
    slug: profile.slug ?? "",
    company_website: profile.company_website ?? "",
    linkedin_company_url: profile.linkedin_company_url ?? "",
    instagram_url: profile.instagram_url ?? "",
    youtube_url: profile.youtube_url ?? "",
    x_url: profile.x_url ?? "",
    company_size: profile.company_size ?? "",
    industry: profile.industry ?? "",
    headline: profile.headline ?? "",
    about: profile.about ?? "",
    founded_year: profile.founded_year,
    location: { ...(profile.location ?? {}) },
    specialties: [...(profile.specialties ?? [])],
    languages: [...(profile.languages ?? [])],
    position: profile.position ?? "",
    profile_photo: profile.profile_photo ?? "",
    banner_image_url: profile.banner_image_url ?? "",
    banner_tags: [...(profile.banner_tags ?? [])],
    motto: profile.motto ?? "",
    casting_categories: [...(profile.casting_categories ?? [])],
    team_values: (profile.team_values ?? []).map((v) => ({ ...v })),
    cta_headline: profile.cta_headline ?? "",
    cta_subheadline: profile.cta_subheadline ?? "",
    cta_image_url: profile.cta_image_url ?? "",
  };
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "AG";
  return ((parts[0][0] ?? "A") + (parts[1]?.[0] ?? parts[0][1] ?? "G"))
    .toUpperCase()
    .slice(0, 2);
}

function getVerificationDisplay(
  tier: number,
  status: string,
): { label: string; sublabel: string; verified: boolean } {
  if (status === "enterprise" || status === "trusted_partner") {
    return { label: "Fully Verified", sublabel: `Tier ${tier}`, verified: true };
  }
  if (status === "basic") {
    return { label: "Basic Verified", sublabel: `Tier ${tier}`, verified: true };
  }
  return { label: "Verification Pending", sublabel: `Tier ${tier}`, verified: false };
}

/** Draft → public-profile shape so the preview renders the actual public view. */
function draftToPublicPreview(
  draft: Draft,
  profile: RecruiterProfile,
  trustScore: number,
  verificationTier: number,
): PublicRecruiterProfile {
  const loc = draft.location ?? {};
  const city = loc.city?.trim() ? loc.city : undefined;
  const state = loc.state?.trim() ? loc.state : undefined;
  const country = loc.country?.trim() ? loc.country : undefined;
  const text = (v: string | undefined) => (v?.trim() ? v.trim() : undefined);
  return {
    user_id: profile.user_id,
    slug: draft.slug,
    company_name: draft.company_name.trim() || "Your agency",
    profile_photo: text(draft.profile_photo),
    company_website: text(draft.company_website),
    linkedin_company_url: text(draft.linkedin_company_url),
    instagram_url: text(draft.instagram_url),
    youtube_url: text(draft.youtube_url),
    x_url: text(draft.x_url),
    company_size: text(draft.company_size),
    industry: text(draft.industry),
    headline: text(draft.headline),
    about: text(draft.about),
    founded_year: draft.founded_year,
    location: city || state || country ? { city, state, country } : undefined,
    specialties: draft.specialties ?? [],
    languages: draft.languages ?? [],
    position: text(draft.position),
    banner_image_url: text(draft.banner_image_url),
    banner_tags: draft.banner_tags ?? [],
    motto: text(draft.motto),
    casting_categories: draft.casting_categories ?? [],
    team_values: draft.team_values ?? [],
    cta_headline: text(draft.cta_headline),
    cta_subheadline: text(draft.cta_subheadline),
    cta_image_url: text(draft.cta_image_url),
    verification_status: profile.verification_status,
    trust_score: trustScore,
    verification_tier: verificationTier,
    active_plan: null,
    member_since: null,
    active_campaigns_count: 0,
    completed_campaigns_count: 0,
    total_talents_count: 0,
    average_rating: 0,
    total_reviews_count: 0,
  };
}

function sanitizeSlug(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9-]/g, "").slice(0, 40);
}

/* ---------- demo design primitives (ported from mobile-first-magic) ---------- */

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "outline" | "ghost";
};

function AeButton({ variant = "primary", className = "", ...props }: ButtonProps) {
  const variants = {
    primary: "bg-primary text-primary-foreground shadow-md hover:brightness-110",
    outline: "border border-border bg-card text-foreground hover:bg-muted",
    ghost: "bg-transparent text-muted-foreground hover:bg-muted hover:text-foreground",
  };
  return (
    <button
      {...props}
      className={`inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-md px-4 text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${variants[variant]} ${className}`}
    />
  );
}

function Field({
  label,
  required,
  children,
  className = "",
}: {
  label: string;
  required?: boolean;
  children: ReactNode;
  className?: string;
}) {
  return (
    <label className={`block min-w-0 ${className}`}>
      <span className="mb-2 block text-xs font-semibold text-foreground">
        {label} {required && <span className="text-destructive">*</span>}
      </span>
      {children}
    </label>
  );
}

type AccordionStatus = "complete" | "incomplete" | "optional";

function AccordionStatusBadge({ status }: { status: AccordionStatus }) {
  if (status === "complete") {
    return (
      <span
        aria-label="Section complete"
        className="grid size-6 shrink-0 place-items-center rounded-full bg-success/15"
      >
        <Check className="size-3.5 text-success" strokeWidth={3} />
      </span>
    );
  }
  if (status === "optional") {
    return (
      <span className="shrink-0 rounded-full bg-muted px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
        Optional
      </span>
    );
  }
  return (
    <span
      aria-label="Section incomplete"
      className="size-2 shrink-0 rounded-full bg-amber-400"
    />
  );
}

function AccordionSection({
  id,
  icon: Icon,
  title,
  summary,
  status,
  open,
  onToggle,
  children,
}: {
  id: string;
  icon: ComponentType<{ className?: string }>;
  title: string;
  summary: string;
  status: AccordionStatus;
  open: boolean;
  onToggle: () => void;
  children: ReactNode;
}) {
  return (
    <section aria-label={title}>
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        aria-controls={`panel-${id}`}
        id={`trigger-${id}`}
        className="flex min-h-[60px] w-full cursor-pointer items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-muted/40"
      >
        <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-accent text-accent-foreground">
          <Icon className="size-[18px]" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-semibold text-foreground">
            {title}
          </span>
          <span className="mt-0.5 block truncate text-xs text-muted-foreground">
            {summary}
          </span>
        </span>
        <AccordionStatusBadge status={status} />
        <ChevronDown
          className={`size-4 shrink-0 text-muted-foreground transition-transform duration-200 ease-out ${open ? "rotate-180" : ""}`}
        />
      </button>
      <div
        id={`panel-${id}`}
        role="region"
        aria-labelledby={`trigger-${id}`}
        className={`grid transition-[grid-template-rows,opacity] duration-200 ease-out ${
          open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
        }`}
      >
        <div className="min-h-0 overflow-hidden">
          <div className="border-t border-border/60 px-4 pb-5 pt-4">{children}</div>
        </div>
      </div>
    </section>
  );
}

function XBrandIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d={siX.path} />
    </svg>
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
    <button
      type="button"
      aria-label={`Copy ${label}`}
      onClick={copy}
      className="grid size-9 shrink-0 cursor-pointer place-items-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
    >
      <Copy className="size-4" />
    </button>
  );
}

function SkeletonBlock({ className }: { className?: string }) {
  return <div className={`animate-pulse rounded-lg bg-muted ${className ?? ""}`} />;
}

function VerifyContactDialog({
  type,
  contact,
  open,
  onOpenChange,
  onVerified,
}: {
  type: "email" | "phone";
  contact: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onVerified: () => void;
}) {
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<"send" | "verify">("send");
  const [isSending, setIsSending] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  const reset = useCallback(() => {
    setOtp("");
    setStep("send");
  }, []);

  const handleOpenChange = useCallback(
    (next: boolean) => {
      if (!next) reset();
      onOpenChange(next);
    },
    [onOpenChange, reset],
  );

  const handleSend = useCallback(async () => {
    setIsSending(true);
    try {
      if (type === "email") {
        await authApi.sendEmailOtp();
      } else {
        await authApi.sendPhoneOtp();
      }
      toast.success(type === "email" ? "OTP sent to your email" : "OTP sent to your phone");
      setStep("verify");
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : `Failed to send OTP to ${type}`;
      toast.error(message);
    } finally {
      setIsSending(false);
    }
  }, [type]);

  const handleVerify = useCallback(async () => {
    if (otp.trim().length !== 6) {
      toast.error("Enter the 6-digit code");
      return;
    }
    setIsVerifying(true);
    try {
      if (type === "email") {
        await authApi.verifyEmailOtp(contact, otp.trim());
      } else {
        await authApi.verifyPhoneOtp(contact, otp.trim());
      }
      toast.success(type === "email" ? "Email verified" : "Phone verified");
      onVerified();
      handleOpenChange(false);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Invalid OTP. Please try again.";
      toast.error(message);
    } finally {
      setIsVerifying(false);
    }
  }, [contact, handleOpenChange, onVerified, otp, type]);

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{type === "email" ? "Verify email" : "Verify mobile number"}</DialogTitle>
          <DialogDescription>
            {step === "send"
              ? type === "email"
                ? `We'll send a 6-digit code to ${contact}`
                : `We'll send a 6-digit code to ${contact} via SMS`
              : `Enter the 6-digit code sent to ${contact}`}
          </DialogDescription>
        </DialogHeader>

        {step === "send" ? (
          <DialogFooter>
            <AeButton onClick={handleSend} disabled={isSending} className="w-full">
              {isSending ? (
                <>
                  <Loader2 className="size-4 animate-spin" /> Sending…
                </>
              ) : (
                "Send OTP"
              )}
            </AeButton>
          </DialogFooter>
        ) : (
          <div className="space-y-4">
            <div>
              <label
                htmlFor={`verify-${type}-otp`}
                className="mb-2 block text-xs font-semibold text-foreground"
              >
                Verification code
              </label>
              <input
                id={`verify-${type}-otp`}
                inputMode="numeric"
                autoComplete="one-time-code"
                placeholder="000000"
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, "").slice(0, 6))}
                className="w-full rounded-md border border-input bg-card px-3 py-2.5 text-center text-lg tracking-[0.3em]"
              />
            </div>
            <DialogFooter className="gap-2 sm:gap-2">
              <AeButton
                type="button"
                variant="outline"
                onClick={() => setStep("send")}
                disabled={isVerifying}
                className="flex-1"
              >
                Back
              </AeButton>
              <AeButton
                type="button"
                onClick={handleSend}
                variant="outline"
                disabled={isSending}
                className="flex-1"
              >
                {isSending ? "Resending…" : "Resend"}
              </AeButton>
              <AeButton
                type="button"
                onClick={handleVerify}
                disabled={isVerifying || otp.trim().length !== 6}
                className="flex-1"
              >
                {isVerifying ? (
                  <>
                    <Loader2 className="size-4 animate-spin" /> Verifying…
                  </>
                ) : (
                  "Verify"
                )}
              </AeButton>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

/* ------------------------------- page -------------------------------- */

export default function RecruiterProfileEditPage() {
  const user = useAuthStore((s) => s.user);
  const fetchUser = useAuthStore((s) => s.fetchUser);
  const { data: profile, isLoading } = useRecruiterProfile();
  const updateProfile = useUpdateRecruiterProfile();
  const uploadPhoto = useUploadRecruiterPhoto();
  const uploadBanner = useUploadRecruiterBanner();
  const uploadAsset = useUploadRecruiterAsset();
  const checkSlug = useCheckSlugAvailability();

  const [draft, setDraft] = useState<Draft | null>(null);
  const [isDirty, setIsDirty] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [sheet, setSheet] = useState<null | "size" | "specialties" | "languages">(null);
  // Single-open accordion: null = every section collapsed (default).
  const [openSection, setOpenSection] = useState<string | null>(null);
  const toggleSection = useCallback(
    (id: string) => setOpenSection((prev) => (prev === id ? null : id)),
    [],
  );

  const fileInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);
  const ctaInputRef = useRef<HTMLInputElement>(null);

  const [logoCropSrc, setLogoCropSrc] = useState<string | null>(null);
  const [logoCropOpen, setLogoCropOpen] = useState(false);
  const [bannerCropSrc, setBannerCropSrc] = useState<string | null>(null);
  const [bannerCropOpen, setBannerCropOpen] = useState(false);
  const [verifyTarget, setVerifyTarget] = useState<null | "email" | "phone">(null);

  const handleContactVerified = useCallback(() => {
    setVerifyTarget(null);
    void fetchUser();
  }, [fetchUser]);

  // Sync draft when the server profile version changes (render-phase
  // adjustment — avoids setState-in-effect cascading renders).
  const [syncedAt, setSyncedAt] = useState<string | null>(null);
  if (profile && syncedAt !== profile.updated_at) {
    setSyncedAt(profile.updated_at);
    if (!isDirty) {
      setDraft(draftFromProfile(profile));
    }
  }

  const set = useCallback(<K extends keyof Draft>(field: K, value: Draft[K]) => {
    setDraft((prev) => (prev ? { ...prev, [field]: value } : prev));
    setIsDirty(true);
  }, []);

  // Link slots (platform picker, max 5) — URLs live in draft fields.
  const [linkSlots, setLinkSlots] = useState<SocialPlatformKey[]>([]);
  const [linksSyncedAt, setLinksSyncedAt] = useState<string | null>(null);
  if (profile && linksSyncedAt !== profile.updated_at) {
    setLinksSyncedAt(profile.updated_at);
    if (!isDirty) {
      setLinkSlots(slotsFromProfile(profile));
    }
  }

  const addLinkSlot = useCallback(() => {
    if (linkSlots.length >= MAX_SOCIAL_LINKS) {
      toast.error(`You can add up to ${MAX_SOCIAL_LINKS} links`);
      return;
    }
    const next = SOCIAL_CATALOG.find((p) => !linkSlots.includes(p.key));
    if (!next) return;
    setLinkSlots((prev) => [...prev, next.key]);
  }, [linkSlots]);

  const removeLinkSlot = useCallback(
    (index: number) => {
      const entry = socialPlatform(linkSlots[index]);
      if (entry && ((draft?.[entry.field] ?? "") as string).trim() !== "") {
        set(entry.field, "");
      }
      setLinkSlots((prev) => prev.filter((_, i) => i !== index));
    },
    [linkSlots, draft, set],
  );

  const changeSlotPlatform = useCallback(
    (index: number, nextKey: SocialPlatformKey) => {
      const prevKey = linkSlots[index];
      if (!prevKey || prevKey === nextKey || linkSlots.includes(nextKey)) return;
      const prevEntry = socialPlatform(prevKey);
      const nextEntry = socialPlatform(nextKey);
      const url = ((draft?.[prevEntry.field] ?? "") as string).trim();
      if (url) {
        // Move the entered URL over to the newly chosen platform.
        setDraft((prev) =>
          prev ? { ...prev, [nextEntry.field]: url, [prevEntry.field]: "" } : prev,
        );
        setIsDirty(true);
      }
      setLinkSlots((prev) => prev.map((k, i) => (i === index ? nextKey : k)));
    },
    [linkSlots, draft, setDraft],
  );

  const trustScore = user?.trust_score ?? 0;
  const verificationTier = user?.verification_tier ?? 1;
  const verification = useMemo(
    () => getVerificationDisplay(verificationTier, profile?.verification_status ?? "pending"),
    [verificationTier, profile?.verification_status],
  );

  const previewProfile = useMemo(
    () =>
      draft && profile
        ? draftToPublicPreview(draft, profile, trustScore, verificationTier)
        : null,
    [draft, profile, trustScore, verificationTier],
  );

  const uploadLogoFile = useCallback(
    (file: File) => {
      uploadPhoto.mutate(file, {
        onSuccess: (data) => {
          set("profile_photo", data.relativePath);
          toast.success("Logo uploaded — tap Save profile");
        },
        onError: () => toast.error("Upload failed"),
      });
    },
    [uploadPhoto, set],
  );

  const uploadBannerFile = useCallback(
    (file: File) => {
      uploadBanner.mutate(file, {
        onSuccess: (data) => {
          set("banner_image_url", data.relativePath);
          toast.success("Cover uploaded — tap Save profile");
        },
        onError: () => toast.error("Banner upload failed"),
      });
    },
    [uploadBanner, set],
  );

  const openLogoCrop = useCallback((file: File) => {
    const url = URL.createObjectURL(file);
    setLogoCropSrc(url);
    setLogoCropOpen(true);
  }, []);

  const openBannerCrop = useCallback((file: File) => {
    const url = URL.createObjectURL(file);
    setBannerCropSrc(url);
    setBannerCropOpen(true);
  }, []);

  const handlePhotoUpload = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      e.target.value = "";
      if (!file) return;
      if (!file.type.startsWith("image/") || !ACCEPTED_IMAGE_TYPES.includes(file.type)) {
        toast.error("Only JPEG, PNG, and WEBP images are allowed");
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Photo must be under 5MB");
        return;
      }
      try {
        const { width, height } = await getImageDimensions(file);
        if (isRatioMatch(width, height, LOGO_ASPECT)) {
          uploadLogoFile(file);
        } else {
          openLogoCrop(file);
        }
      } catch {
        openLogoCrop(file);
      }
    },
    [uploadLogoFile, openLogoCrop],
  );

  const handleLogoCropped = useCallback(
    (file: File) => {
      uploadLogoFile(file);
    },
    [uploadLogoFile],
  );

  const handleLogoCropOpenChange = useCallback(
    (open: boolean) => {
      setLogoCropOpen(open);
      if (!open && logoCropSrc) {
        URL.revokeObjectURL(logoCropSrc);
        setLogoCropSrc(null);
      }
    },
    [logoCropSrc],
  );

  const handleBannerUpload = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      e.target.value = "";
      if (!file) return;
      if (!file.type.startsWith("image/") || !ACCEPTED_IMAGE_TYPES.includes(file.type)) {
        toast.error("Only JPEG, PNG, and WEBP images are allowed");
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        toast.error("Banner must be under 10MB");
        return;
      }
      try {
        const { width, height } = await getImageDimensions(file);
        if (isRatioMatch(width, height, BANNER_ASPECT)) {
          uploadBannerFile(file);
        } else {
          openBannerCrop(file);
        }
      } catch {
        openBannerCrop(file);
      }
    },
    [uploadBannerFile, openBannerCrop],
  );

  const handleBannerCropped = useCallback(
    (file: File) => {
      uploadBannerFile(file);
    },
    [uploadBannerFile],
  );

  const handleBannerCropOpenChange = useCallback(
    (open: boolean) => {
      setBannerCropOpen(open);
      if (!open && bannerCropSrc) {
        URL.revokeObjectURL(bannerCropSrc);
        setBannerCropSrc(null);
      }
    },
    [bannerCropSrc],
  );

  const handleCtaImageUpload = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image must be under 5MB");
        return;
      }
      uploadAsset.mutate(file, {
        onSuccess: (data) => {
          set("cta_image_url", data.relativePath);
          toast.success("CTA image uploaded — tap Save profile");
        },
        onError: () => toast.error("CTA image upload failed"),
      });
      e.target.value = "";
    },
    [uploadAsset, set],
  );

  const toggleInList = useCallback(
    (field: "specialties" | "languages", tag: string) => {
      if (!draft) return;
      const current = draft[field] ?? [];
      const next = current.includes(tag)
        ? current.filter((t) => t !== tag)
        : [...current, tag];
      if (field === "specialties" && next.length > MAX_SPECIALTIES) {
        toast.error(`You can select up to ${MAX_SPECIALTIES} specialties`);
        return;
      }
      set(field, next);
    },
    [draft, set],
  );

  const handleSave = useCallback(() => {
    if (!draft || !profile) return;
    const name = draft.company_name.trim();
    if (!name) {
      toast.error("Agency name is required");
      return;
    }
    const slug = sanitizeSlug(draft.slug);
    if (slug.length < 3) {
      toast.error("Profile URL must be at least 3 characters");
      return;
    }
    if ((draft.specialties ?? []).length > MAX_SPECIALTIES) {
      toast.error(`You can select up to ${MAX_SPECIALTIES} specialties`);
      return;
    }

    const persist = (finalSlug: string) => {
      const payload: UpdateRecruiterProfilePayload = {
        ...draft,
        company_name: name,
        slug: finalSlug,
        company_website: draft.company_website?.trim() || "",
        linkedin_company_url: draft.linkedin_company_url?.trim() || "",
        instagram_url: draft.instagram_url?.trim() || "",
        youtube_url: draft.youtube_url?.trim() || "",
        x_url: draft.x_url?.trim() || "",
        industry: draft.industry?.trim() || "",
        headline: draft.headline?.trim() || "",
        about: draft.about?.trim() || "",
        position: draft.position?.trim() || "",
        motto: draft.motto?.trim() || "",
        company_size: draft.company_size || "",
        cta_headline: draft.cta_headline?.trim() || "",
        cta_subheadline: draft.cta_subheadline?.trim() || "",
      };
      updateProfile.mutate(payload, {
        onSuccess: () => {
          toast.success("Profile saved successfully");
          setIsDirty(false);
        },
        onError: () => toast.error("Update failed"),
      });
    };

    if (slug !== profile.slug) {
      checkSlug.mutate(slug, {
        onSuccess: (available) => {
          if (!available) {
            toast.error("Profile URL already taken");
            return;
          }
          persist(slug);
        },
        onError: () => toast.error("Could not check profile URL"),
      });
    } else {
      persist(slug);
    }
  }, [draft, profile, updateProfile, checkSlug]);

  const handleCancel = useCallback(() => {
    if (profile) {
      setDraft(draftFromProfile(profile));
      setLinkSlots(slotsFromProfile(profile));
      setIsDirty(false);
    }
  }, [profile]);

  if (isLoading || !profile || !draft) {
    return (
      <div className="agency-edit-theme min-h-screen bg-background text-foreground">
        <div className="mx-auto w-full max-w-screen-2xl px-4 py-6">
          <SkeletonBlock className="mb-4 h-10 w-64" />
          <SkeletonBlock className="mb-3 h-48 w-full" />
          <SkeletonBlock className="mb-3 h-40 w-full" />
          <SkeletonBlock className="mb-3 h-32 w-full" />
        </div>
      </div>
    );
  }

  const saving = updateProfile.isPending || checkSlug.isPending;
  const aboutLength = (draft.about ?? "").length;

  // ----- Accordion summaries + completion (derived from draft, no model change) -----
  const hasLogo = !!draft.profile_photo?.trim();
  const hasCover = !!draft.banner_image_url?.trim();
  const logoSummary = hasLogo && hasCover
    ? "Logo + cover added"
    : hasLogo
      ? "Logo added · cover missing"
      : hasCover
        ? "Cover added · logo missing"
        : "Add logo and cover";
  const logoStatus: AccordionStatus = hasLogo && hasCover ? "complete" : "incomplete";

  const basicFields = [
    draft.company_name.trim(),
    draft.slug.trim().length >= 3 ? "x" : "",
    draft.industry?.trim() ?? "",
    draft.founded_year ? "x" : "",
    draft.headline?.trim() ?? "",
    draft.position?.trim() ?? "",
  ];
  const basicFilled = basicFields.filter(Boolean).length;
  const basicSummary = draft.company_name.trim()
    ? `${draft.company_name.trim().slice(0, 24)} · ${basicFilled}/6 filled`
    : `${basicFilled}/6 filled`;
  const basicStatus: AccordionStatus = basicFilled === 6 ? "complete" : "incomplete";

  const mottoText = draft.motto?.trim() ?? "";
  const aboutSummary =
    aboutLength > 0
      ? mottoText
        ? `${aboutLength} chars · motto set`
        : `${aboutLength} chars · no motto`
      : "Add your story";
  const aboutStatus: AccordionStatus =
    aboutLength > 0 && mottoText ? "complete" : "incomplete";

  const specialtyCount = draft.specialties?.length ?? 0;
  const specialtiesSummary =
    specialtyCount > 0
      ? `${specialtyCount} ${specialtyCount === 1 ? "specialty" : "specialties"}`
      : "Add specialties";
  const specialtiesStatus: AccordionStatus =
    specialtyCount > 0 ? "complete" : "incomplete";

  const cityText = draft.location?.city?.trim() ?? "";
  const stateText = draft.location?.state?.trim() ?? "";
  const countryText = draft.location?.country?.trim() ?? "";
  const locationSummary =
    cityText && stateText
      ? `${cityText}, ${stateText}`
      : cityText && countryText
        ? `${cityText}, ${countryText}`
        : cityText || stateText || countryText || "Add location";
  const locationStatus: AccordionStatus =
    cityText && countryText ? "complete" : "incomplete";

  const connectedLinks = SOCIAL_CATALOG.filter((p) =>
    ((draft[p.field] ?? "") as string).trim(),
  ).length;
  const linksSummary =
    connectedLinks > 0
      ? `${connectedLinks} ${connectedLinks === 1 ? "link" : "links"} connected`
      : "Add website & socials";
  const linksStatus: AccordionStatus = connectedLinks > 0 ? "complete" : "incomplete";

  const langCount = draft.languages?.length ?? 0;
  const extraTags = (draft.banner_tags?.length ?? 0) + (draft.casting_categories?.length ?? 0);
  const companySummary = draft.company_size
    ? `${draft.company_size.split(" ")[0]} · ${langCount} ${langCount === 1 ? "language" : "languages"}`
    : langCount > 0 || extraTags > 0
      ? `${langCount} ${langCount === 1 ? "language" : "languages"} · ${extraTags} tags`
      : "Add company details";
  const companyStatus: AccordionStatus =
    draft.company_size && langCount > 0 ? "complete" : "incomplete";

  const valuesCount = draft.team_values?.length ?? 0;
  const valuesSummary =
    valuesCount > 0
      ? `${valuesCount} ${valuesCount === 1 ? "value" : "values"}`
      : "Add team values";
  const valuesStatus: AccordionStatus = valuesCount > 0 ? "complete" : "incomplete";

  const ctaHeadline = draft.cta_headline?.trim() ?? "";
  const ctaHasImage = !!draft.cta_image_url?.trim();
  const ctaSummary = ctaHeadline
    ? ctaHasImage
      ? `${ctaHeadline.slice(0, 26)} · image set`
      : ctaHeadline.slice(0, 30)
    : "Optional · encourage reviews";
  const ctaStatus: AccordionStatus =
    ctaHeadline || ctaHasImage ? "complete" : "optional";

  const emailVerified = user?.is_email_verified ?? false;
  const phoneVerified = user?.is_phone_verified ?? false;
  const verifiedCount =
    (emailVerified ? 1 : 0) + (phoneVerified ? 1 : 0) + (verification.verified ? 1 : 0);
  const verificationSummary = `${verifiedCount} of 3 verified`;
  const verificationStatus: AccordionStatus =
    verifiedCount === 3 ? "complete" : "incomplete";

  // CTA banner is optional — it never blocks overall completeness.
  const requiredDone = [
    logoStatus,
    basicStatus,
    aboutStatus,
    specialtiesStatus,
    locationStatus,
    linksStatus,
    companyStatus,
    valuesStatus,
    verificationStatus,
  ].filter((s) => s === "complete").length;
  const requiredTotal = 9;
  const completenessPct = Math.round((requiredDone / requiredTotal) * 100);

  return (
    <div className="agency-edit-theme min-h-screen bg-background text-foreground">
      <main className="mx-auto w-full pb-40 md:pb-10">
        <div className="mx-auto max-w-screen-2xl px-0 py-0 sm:px-4 md:py-6 lg:px-6 xl:px-8">
          {/* Page header (app TopBar comes from recruiter layout) */}
          <div className="flex items-center gap-3 px-4 pb-5 pt-4 sm:px-1 md:pt-0">
            <AeButton
              variant="ghost"
              className="size-10 px-0"
              aria-label="Go back"
              onClick={() => window.history.back()}
            >
              <ArrowLeft className="size-5" />
            </AeButton>
            <div className="min-w-0 flex-1">
              <h1 className="font-display truncate text-lg font-bold md:text-2xl">
                Edit Agency Profile
              </h1>
              <p className="truncate text-xs text-muted-foreground md:text-sm">
                Manage your agency information and how you appear on Rootin.
              </p>
            </div>
            <div className="hidden md:block">
              <AeButton variant="outline" onClick={() => setPreviewOpen(true)}>
                <Eye className="size-4" /> Public preview
              </AeButton>
            </div>
          </div>

          <div className="grid min-w-0 items-start gap-5 xl:grid-cols-[minmax(0,1fr)_390px]">
            <form
              className="min-w-0 sm:px-1"
              onSubmit={(e) => {
                e.preventDefault();
                handleSave();
              }}
            >
              {/* Compact profile-completeness indicator */}
              <div className="mb-3 px-4 sm:px-0">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-xs font-semibold text-foreground">
                    Profile completeness
                  </p>
                  <p className="text-xs font-bold tabular-nums text-primary">
                    {completenessPct}% · {requiredDone}/{requiredTotal}
                  </p>
                </div>
                <div
                  className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted"
                  role="progressbar"
                  aria-valuenow={completenessPct}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-label="Profile completeness"
                >
                  <div
                    className="h-full rounded-full bg-primary transition-all duration-300"
                    style={{ width: `${completenessPct}%` }}
                  />
                </div>
              </div>

              {/* Single-open accordion — all sections collapsed by default */}
              <div className="overflow-hidden border-y border-border/70 bg-card sm:rounded-xl sm:border">
                <div className="divide-y divide-border/60">
              {/* Logo & Cover */}
              <AccordionSection
                id="logo"
                icon={ImageIcon}
                title="Logo & Cover"
                summary={logoSummary}
                status={logoStatus}
                open={openSection === "logo"}
                onToggle={() => toggleSection("logo")}
              >
                <div className="grid grid-cols-[104px_minmax(0,1fr)] gap-3 sm:grid-cols-[132px_minmax(0,1fr)]">
                  <div>
                    <span className="mb-2 block text-xs font-semibold">Agency logo</span>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="ae-logo-mark aspect-square w-full"
                      aria-label="Change agency logo"
                    >
                      {draft.profile_photo ? (
                        <img
                          src={draft.profile_photo}
                          alt="Agency logo"
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <>
                          <span>{getInitials(draft.company_name || "Agency")}</span>
                          <small>{(draft.company_name || "AGENCY").slice(0, 12).toUpperCase()}</small>
                        </>
                      )}
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      className="hidden"
                      onChange={handlePhotoUpload}
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="mt-2 w-full cursor-pointer text-center text-xs font-semibold text-primary"
                    >
                      Change logo
                    </button>
                    <p className="mt-1 text-center text-[11px] text-muted-foreground">
                      Square 1:1 · crops if needed
                    </p>
                  </div>
                  <div className="min-w-0">
                    <span className="mb-2 block text-xs font-semibold">Cover image</span>
                    <div className="ae-cover-art relative flex aspect-[16/8] items-end overflow-hidden rounded-md p-3 sm:aspect-[16/6]">
                      {draft.banner_image_url && (
                        <img
                          src={draft.banner_image_url}
                          alt="Cover"
                          className="absolute inset-0 h-full w-full object-cover"
                        />
                      )}
                      <div className="ae-bg-cover-overlay absolute inset-0" />
                      <p className="relative max-w-32 font-display text-lg font-bold leading-tight text-white">
                        {draft.motto || "Great stories find great people."}
                      </p>
                      <AeButton
                        type="button"
                        variant="outline"
                        className="relative ml-auto min-h-9 bg-card/95 px-3 text-xs"
                        onClick={() => bannerInputRef.current?.click()}
                      >
                        <Camera className="size-4" />
                        <span className="hidden sm:inline">Change cover</span>
                      </AeButton>
                    </div>
                    <input
                      ref={bannerInputRef}
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      className="hidden"
                      onChange={handleBannerUpload}
                    />
                    <p className="mt-2 text-[11px] text-muted-foreground">
                      1920 × 600 px (3.2:1) · crops if needed
                    </p>
                  </div>
                </div>
              </AccordionSection>

              {/* Basic Information */}
              <AccordionSection
                id="basic"
                icon={Briefcase}
                title="Basic Information"
                summary={basicSummary}
                status={basicStatus}
                open={openSection === "basic"}
                onToggle={() => toggleSection("basic")}
              >
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Agency name" required>
                    <input
                      value={draft.company_name}
                      onChange={(e) => set("company_name", e.target.value)}
                      placeholder="Silver Reel Casting"
                    />
                  </Field>
                  <Field label="Profile URL" required>
                    <div className="ae-input-icon">
                      <Link2 />
                      <input
                        value={draft.slug}
                        onChange={(e) => set("slug", sanitizeSlug(e.target.value))}
                        placeholder="your-agency-slug"
                      />
                    </div>
                  </Field>
                  <Field label="Industry">
                    <div className="ae-input-icon">
                      <Briefcase />
                      <input
                        value={draft.industry ?? ""}
                        onChange={(e) => set("industry", e.target.value)}
                        placeholder="e.g. Casting, Entertainment"
                      />
                    </div>
                  </Field>
                  <Field label="Founded year">
                    <input
                      inputMode="numeric"
                      value={draft.founded_year ? String(draft.founded_year) : ""}
                      onChange={(e) => {
                        const digits = e.target.value.replace(/[^0-9]/g, "").slice(0, 4);
                        set("founded_year", digits ? parseInt(digits, 10) : undefined);
                      }}
                      placeholder="e.g. 2016"
                    />
                  </Field>
                  <Field label="Headline" className="sm:col-span-2">
                    <input
                      value={draft.headline ?? ""}
                      onChange={(e) => set("headline", e.target.value)}
                      placeholder="What does your company do?"
                    />
                  </Field>
                  <Field label="Your position" className="sm:col-span-2">
                    <input
                      value={draft.position ?? ""}
                      onChange={(e) => set("position", e.target.value)}
                      placeholder="e.g. Founder, CEO"
                    />
                  </Field>
                </div>
              </AccordionSection>

              {/* About & Motto */}
              <AccordionSection
                id="about"
                icon={FileText}
                title="About & Motto"
                summary={aboutSummary}
                status={aboutStatus}
                open={openSection === "about"}
                onToggle={() => toggleSection("about")}
              >
                <div className="grid gap-4">
                  <Field label="Professional description" required className="sm:col-span-2">
                    <textarea
                      value={draft.about ?? ""}
                      onChange={(e) => set("about", e.target.value.slice(0, 1000))}
                      maxLength={1000}
                      rows={5}
                      placeholder="Tell clients about your company"
                    />
                    <span className="mt-1 block text-right text-[11px] text-muted-foreground">
                      {aboutLength}/1000
                    </span>
                  </Field>
                  <Field label="Motto (tagline)">
                    <input
                      value={draft.motto ?? ""}
                      onChange={(e) => set("motto", e.target.value)}
                      placeholder="Real Talent. Remarkable Stories."
                    />
                  </Field>
                </div>
              </AccordionSection>

              {/* Specialties */}
              <AccordionSection
                id="specialties"
                icon={Sparkles}
                title="Specialties"
                summary={specialtiesSummary}
                status={specialtiesStatus}
                open={openSection === "specialties"}
                onToggle={() => toggleSection("specialties")}
              >
                <p className="mb-3 text-xs text-muted-foreground">
                  {`Select up to ${MAX_SPECIALTIES} specialties`}
                </p>
                <div className="flex flex-wrap gap-2">
                  {(draft.specialties ?? []).length === 0 && (
                    <p className="text-xs text-muted-foreground">No specialties selected yet</p>
                  )}
                  {(draft.specialties ?? []).map((item) => (
                    <span
                      key={item}
                      className="inline-flex min-h-9 items-center gap-1 rounded-full bg-accent px-3 text-xs font-medium text-accent-foreground"
                    >
                      {item}
                      <button
                        type="button"
                        onClick={() => toggleInList("specialties", item)}
                        className="grid size-6 cursor-pointer place-items-center"
                        aria-label={`Remove ${item}`}
                      >
                        <X className="size-3" />
                      </button>
                    </span>
                  ))}
                </div>
                <AeButton
                  type="button"
                  variant="outline"
                  className="mt-3 w-full justify-between font-medium"
                  onClick={() => setSheet("specialties")}
                >
                  <span className="flex items-center gap-2">
                    <Plus className="size-4" /> Add specialty
                  </span>
                  <ChevronDown className="size-4" />
                </AeButton>
              </AccordionSection>

              {/* Location */}
              <AccordionSection
                id="location"
                icon={MapPin}
                title="Location"
                summary={locationSummary}
                status={locationStatus}
                open={openSection === "location"}
                onToggle={() => toggleSection("location")}
              >
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="City">
                    <div className="ae-input-icon">
                      <MapPin />
                      <input
                        value={draft.location?.city ?? ""}
                        onChange={(e) =>
                          set("location", { ...(draft.location ?? {}), city: e.target.value })
                        }
                        placeholder="Mumbai"
                      />
                    </div>
                  </Field>
                  <Field label="State">
                    <input
                      value={draft.location?.state ?? ""}
                      onChange={(e) =>
                        set("location", { ...(draft.location ?? {}), state: e.target.value })
                      }
                      placeholder="Maharashtra"
                    />
                  </Field>
                  <Field label="Country" className="sm:col-span-2">
                    <input
                      value={draft.location?.country ?? ""}
                      onChange={(e) =>
                        set("location", { ...(draft.location ?? {}), country: e.target.value })
                      }
                      placeholder="India"
                    />
                  </Field>
                </div>
              </AccordionSection>

              {/* Links & Socials (platform picker, max 5) */}
              <AccordionSection
                id="links"
                icon={Link2}
                title="Links & Socials"
                summary={linksSummary}
                status={linksStatus}
                open={openSection === "links"}
                onToggle={() => toggleSection("links")}
              >
                <p className="mb-3 text-xs text-muted-foreground">
                  {`Pick a platform from the dropdown and paste the URL — up to ${MAX_SOCIAL_LINKS} links`}
                </p>
                <div className="space-y-3">
                  {linkSlots.length === 0 && (
                    <p className="text-xs text-muted-foreground">
                      No links added yet — add your website and social profiles.
                    </p>
                  )}
                  {linkSlots.map((slotKey, index) => {
                    const entry = socialPlatform(slotKey);
                    const EntryIcon = entry.Icon;
                    const options = SOCIAL_CATALOG.filter(
                      (p) => p.key === slotKey || !linkSlots.includes(p.key),
                    );
                    return (
                      <div
                        key={`${slotKey}-${index}`}
                        className="rounded-md border border-border p-3"
                      >
                        <div className="flex items-center gap-2">
                          <span className="grid size-11 shrink-0 place-items-center rounded-md bg-accent text-accent-foreground">
                            <EntryIcon className="size-4" />
                          </span>
                          <div className="relative min-w-0 flex-1">
                            <select
                              value={slotKey}
                              onChange={(e) =>
                                changeSlotPlatform(index, e.target.value as SocialPlatformKey)
                              }
                              aria-label="Link platform"
                            >
                              {options.map((p) => (
                                <option key={p.key} value={p.key}>
                                  {p.label}
                                </option>
                              ))}
                            </select>
                            <ChevronDown className="pointer-events-none absolute right-3 top-3.5 size-4 text-muted-foreground" />
                          </div>
                          <button
                            type="button"
                            onClick={() => removeLinkSlot(index)}
                            className="grid size-11 shrink-0 cursor-pointer place-items-center rounded-md text-muted-foreground hover:bg-muted hover:text-destructive"
                            aria-label={`Remove ${entry.label} link`}
                          >
                            <X className="size-4" />
                          </button>
                        </div>
                        <div className="ae-input-icon mt-2">
                          <Link2 />
                          <input
                            type="url"
                            value={(draft[entry.field] ?? "") as string}
                            onChange={(e) => set(entry.field, e.target.value)}
                            placeholder={entry.placeholder}
                            aria-label={`${entry.label} URL`}
                          />
                        </div>
                      </div>
                    );
                  })}
                  {linkSlots.length < MAX_SOCIAL_LINKS && (
                    <button
                      type="button"
                      onClick={addLinkSlot}
                      className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-md border border-dashed border-primary/40 py-2.5 text-xs font-semibold text-primary"
                    >
                      <Plus className="size-4" /> Add link ({linkSlots.length}/{MAX_SOCIAL_LINKS})
                    </button>
                  )}
                </div>
              </AccordionSection>

              {/* Company details */}
              <AccordionSection
                id="company"
                icon={Building2}
                title="Company Details"
                summary={companySummary}
                status={companyStatus}
                open={openSection === "company"}
                onToggle={() => toggleSection("company")}
              >
                <div className="grid gap-4">
                  <Field label="Company size">
                    <button
                      type="button"
                      onClick={() => setSheet("size")}
                      className="flex min-h-11 w-full cursor-pointer items-center justify-between rounded-md border border-input bg-card px-3 text-left text-[0.8125rem]"
                    >
                      <span className={draft.company_size ? "" : "text-muted-foreground"}>
                        {draft.company_size || "Select size"}
                      </span>
                      <ChevronDown className="size-4 text-muted-foreground" />
                    </button>
                  </Field>
                  <div>
                    <div className="mb-2 flex items-center justify-between">
                      <span className="text-xs font-semibold">Languages</span>
                      <button
                        type="button"
                        onClick={() => setSheet("languages")}
                        className="flex cursor-pointer items-center gap-1 text-xs font-semibold text-primary"
                      >
                        <Pencil className="size-3.5" /> Edit
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {(draft.languages ?? []).length === 0 && (
                        <p className="text-xs text-muted-foreground">No languages added yet</p>
                      )}
                      {(draft.languages ?? []).map((t) => (
                        <span
                          key={t}
                          className="inline-flex min-h-9 items-center gap-1 rounded-full bg-accent px-3 text-xs font-medium text-accent-foreground"
                        >
                          {t}
                          <button
                            type="button"
                            onClick={() => toggleInList("languages", t)}
                            className="grid size-6 cursor-pointer place-items-center"
                            aria-label={`Remove ${t}`}
                          >
                            <X className="size-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                  <Field label="Banner tags">
                    <TagInput
                      value={draft.banner_tags ?? []}
                      onChange={(tags) => set("banner_tags", tags)}
                      placeholder="e.g. FILM, OTT, TVC"
                    />
                  </Field>
                  <Field label="Casting categories">
                    <TagInput
                      value={draft.casting_categories ?? []}
                      onChange={(tags) => set("casting_categories", tags)}
                      placeholder="e.g. Actors, Models, Dancers"
                    />
                  </Field>
                </div>
              </AccordionSection>

              {/* What We Look For */}
              <AccordionSection
                id="values"
                icon={Users}
                title="What We Look For"
                summary={valuesSummary}
                status={valuesStatus}
                open={openSection === "values"}
                onToggle={() => toggleSection("values")}
              >
                <p className="mb-3 text-xs text-muted-foreground">
                  Values shown on the Team tab
                </p>
                <div className="space-y-3">
                  {(draft.team_values ?? []).map((item, index) => (
                    <div key={index} className="rounded-md border border-border p-3">
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={item.title}
                          placeholder="Title"
                          onChange={(e) => {
                            const next = [...(draft.team_values ?? [])];
                            next[index] = { ...next[index], title: e.target.value };
                            set("team_values", next);
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const next = [...(draft.team_values ?? [])];
                            next.splice(index, 1);
                            set("team_values", next);
                          }}
                          className="grid size-11 shrink-0 cursor-pointer place-items-center rounded-md text-muted-foreground hover:bg-muted"
                          aria-label="Remove value"
                        >
                          <X className="size-4" />
                        </button>
                      </div>
                      <input
                        type="text"
                        value={item.description}
                        placeholder="Description"
                        onChange={(e) => {
                          const next = [...(draft.team_values ?? [])];
                          next[index] = { ...next[index], description: e.target.value };
                          set("team_values", next);
                        }}
                        className="mt-2"
                      />
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() =>
                      set("team_values", [
                        ...(draft.team_values ?? []),
                        { title: "", description: "" },
                      ])
                    }
                    className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-md border border-dashed border-primary/40 py-2.5 text-xs font-semibold text-primary"
                  >
                    <Users className="size-4" /> Add value
                  </button>
                </div>
              </AccordionSection>

              {/* Reviews CTA Banner */}
              <AccordionSection
                id="cta"
                icon={Megaphone}
                title="Reviews CTA Banner"
                summary={ctaSummary}
                status={ctaStatus}
                open={openSection === "cta"}
                onToggle={() => toggleSection("cta")}
              >
                <p className="mb-3 text-xs text-muted-foreground">
                  Banner at the bottom of the Reviews tab
                </p>
                <div className="space-y-3">
                  <button
                    type="button"
                    onClick={() => ctaInputRef.current?.click()}
                    className="relative flex h-24 w-full cursor-pointer items-center justify-center overflow-hidden rounded-md border border-dashed border-border bg-muted text-muted-foreground"
                    aria-label="Upload CTA background image"
                  >
                    {draft.cta_image_url ? (
                      <img
                        src={draft.cta_image_url}
                        alt="CTA background"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <span className="flex flex-col items-center gap-1 text-xs">
                        <ImageIcon className="size-6" /> Upload CTA image
                      </span>
                    )}
                    <span className="absolute right-2 bottom-2 flex size-7 items-center justify-center rounded-full border-2 border-card bg-muted">
                      <Camera className="size-3.5 text-foreground" />
                    </span>
                  </button>
                  <input
                    ref={ctaInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleCtaImageUpload}
                  />
                  <Field label="CTA headline">
                    <input
                      value={draft.cta_headline ?? ""}
                      onChange={(e) => set("cta_headline", e.target.value)}
                      placeholder="Let's Create Great Stories Together"
                    />
                  </Field>
                  <Field label="CTA subheadline">
                    <input
                      value={draft.cta_subheadline ?? ""}
                      onChange={(e) => set("cta_subheadline", e.target.value)}
                      placeholder="Get in touch for collaborations and talent requirements."
                    />
                  </Field>
                </div>
              </AccordionSection>

              {/* Verification & Contact (read-only) */}
              <AccordionSection
                id="verification"
                icon={ShieldCheck}
                title="Verification & Contact"
                summary={verificationSummary}
                status={verificationStatus}
                open={openSection === "verification"}
                onToggle={() => toggleSection("verification")}
              >
                <div className="flex items-center gap-3 rounded-md border border-border p-3">
                  <span
                    className={`grid size-11 shrink-0 place-items-center rounded-md ${verification.verified ? "bg-accent" : "bg-muted"}`}
                  >
                    <ShieldCheck
                      className={`size-5 ${verification.verified ? "text-accent-foreground" : "text-muted-foreground"}`}
                    />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold">{verification.label}</p>
                    <p className="text-[11px] text-muted-foreground">
                      {verification.sublabel} · Trust Score{" "}
                      <span className="font-semibold text-primary">{trustScore}%</span>
                    </p>
                  </div>
                  <span className="shrink-0 rounded-md border border-border px-2 py-0.5 text-[11px] font-semibold text-primary">
                    Tier {verificationTier}
                  </span>
                </div>
                {(
                  [
                    {
                      key: "email" as const,
                      label: "Email",
                      value: user?.email ?? "",
                      verified: user?.is_email_verified ?? false,
                      Icon: Mail,
                    },
                    {
                      key: "phone" as const,
                      label: "Mobile",
                      value: user?.phone ?? "",
                      verified: user?.is_phone_verified ?? false,
                      Icon: Phone,
                    },
                  ]
                ).map((f) => (
                  <div
                    key={f.key}
                    className="mt-3 flex items-center gap-2 border-t border-border pt-3"
                  >
                    <span className="grid size-9 shrink-0 place-items-center rounded-md bg-muted text-muted-foreground">
                      <f.Icon className="size-4" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                        {f.label}
                        {f.value ? (
                          f.verified ? (
                            <span className="inline-flex items-center gap-1 rounded-full bg-success/15 px-2 py-0.5 text-[10px] font-semibold text-success">
                              <BadgeCheck className="size-3" /> Verified
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 rounded-full bg-warning/15 px-2 py-0.5 text-[10px] font-semibold text-warning">
                              Not verified
                            </span>
                          )
                        ) : null}
                      </p>
                      <p className="truncate text-xs font-semibold">{f.value || "Not set"}</p>
                    </div>
                    {f.value && <CopyButton label={f.label} value={f.value} />}
                    {f.value && !f.verified && (
                      <button
                        type="button"
                        onClick={() => setVerifyTarget(f.key)}
                        className="shrink-0 cursor-pointer rounded-md bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground hover:brightness-110"
                      >
                        Verify
                      </button>
                    )}
                  </div>
                ))}
                <p className="mt-3 text-[11px] text-muted-foreground">
                  Contact details are managed in account settings
                </p>
              </AccordionSection>
              </div>
              </div>

              {/* Desktop save row */}
              <div className="hidden justify-between px-4 py-4 sm:px-0 md:flex">
                <AeButton type="button" variant="outline" className="min-w-32" onClick={handleCancel} disabled={!isDirty || saving}>
                  Cancel
                </AeButton>
                <AeButton type="submit" className="min-w-44" disabled={saving}>
                  <Check className="size-4" />
                  {saving ? "Saving…" : isDirty ? "Save profile" : "Saved"}
                </AeButton>
              </div>
            </form>

            {/* Live preview — actual public profile rendering */}
            <aside className="sticky top-24 hidden xl:block">
              <div className="overflow-hidden rounded-lg border border-border bg-card">
                <div className="flex items-center justify-between border-b border-border p-4">
                  <div>
                    <strong className="text-sm text-foreground">Live Profile Preview</strong>
                    <p className="text-[11px] text-muted-foreground">As talent and clients will see it</p>
                  </div>
                  <span className="size-2 rounded-full bg-green-500" />
                </div>
                {previewProfile && <RecruiterProfileView profile={previewProfile} />}
              </div>
            </aside>
          </div>
        </div>
      </main>

      {/* Mobile save bar — sits above app BottomBar */}
      <div className="fixed inset-x-0 bottom-16 z-30 border-t border-border bg-card/95 p-3 backdrop-blur md:hidden">
        <div className="grid grid-cols-[1fr_1.4fr] gap-3">
          <AeButton variant="outline" onClick={() => setPreviewOpen(true)}>
            <Eye className="size-4" /> Preview
          </AeButton>
          <AeButton onClick={handleSave} disabled={saving}>
            {saving ? "Saving…" : "Save profile"}
          </AeButton>
        </div>
      </div>

      {previewOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/60 p-3 sm:grid sm:place-items-center"
          role="dialog"
          aria-modal="true"
          aria-label="Profile preview"
        >
          <div className="mx-auto h-full max-w-md overflow-y-auto rounded-lg bg-background sm:h-[88vh] sm:w-full">
            <div className="sticky top-0 z-10 grid grid-cols-[1fr_auto] items-center border-b border-border bg-card/95 px-4 py-3 backdrop-blur">
              <div>
                <strong className="text-sm">Public profile preview</strong>
                <p className="text-xs text-muted-foreground">This is how your profile appears.</p>
              </div>
              <AeButton
                variant="ghost"
                className="size-11 px-0"
                onClick={() => setPreviewOpen(false)}
                aria-label="Close preview"
              >
                <X className="size-5" />
              </AeButton>
            </div>
            {previewProfile && <RecruiterProfileView profile={previewProfile} />}
          </div>
        </div>
      )}

      {/* Sheets */}
      <Sheet open={sheet === "size"} onOpenChange={(o) => setSheet(o ? "size" : null)}>
        <SheetContent side="bottom" className="rounded-t-2xl">
          <SheetHeader className="px-0 text-left">
            <SheetTitle>Company Size</SheetTitle>
            <SheetDescription>Number of employees</SheetDescription>
          </SheetHeader>
          <div className="flex flex-col gap-2 px-4 pb-8">
            {SIZE_OPTIONS.map((o) => (
              <button
                key={o}
                type="button"
                onClick={() => {
                  set("company_size", o);
                  setSheet(null);
                }}
                className={`flex cursor-pointer items-center rounded-xl border px-4 py-3 text-left text-sm ${
                  draft.company_size === o
                    ? "border-primary bg-accent text-accent-foreground"
                    : "border-border"
                }`}
              >
                <span className="flex-1">{o}</span>
                {draft.company_size === o && <Check className="size-4" />}
              </button>
            ))}
          </div>
        </SheetContent>
      </Sheet>

      <Sheet open={sheet === "specialties"} onOpenChange={(o) => setSheet(o ? "specialties" : null)}>
        <SheetContent side="bottom" className="rounded-t-2xl">
          <SheetHeader className="px-0 text-left">
            <SheetTitle>Specialties</SheetTitle>
            <SheetDescription>Select up to {MAX_SPECIALTIES}</SheetDescription>
          </SheetHeader>
          <div className="flex flex-wrap gap-2 px-4 pb-4">
            {SPECIALTY_OPTIONS.map((t) => {
              const active = draft.specialties?.includes(t) ?? false;
              return (
                <button
                  key={t}
                  type="button"
                  onClick={() => toggleInList("specialties", t)}
                  className={`cursor-pointer rounded-lg border px-4 py-2 text-sm ${
                    active
                      ? "border-primary bg-accent text-accent-foreground"
                      : "border-border text-muted-foreground"
                  }`}
                >
                  {t}
                </button>
              );
            })}
          </div>
          <div className="border-t border-border px-4 pt-4 pb-8">
            <p className="mb-2 text-sm text-muted-foreground">Or add a custom specialty:</p>
            <TagInput
              value={draft.specialties ?? []}
              onChange={(tags) => {
                if (tags.length > MAX_SPECIALTIES) {
                  toast.error(`You can select up to ${MAX_SPECIALTIES} specialties`);
                  return;
                }
                set("specialties", tags);
              }}
              placeholder="Type and press Enter"
            />
          </div>
        </SheetContent>
      </Sheet>

      <Sheet open={sheet === "languages"} onOpenChange={(o) => setSheet(o ? "languages" : null)}>
        <SheetContent side="bottom" className="rounded-t-2xl">
          <SheetHeader className="px-0 text-left">
            <SheetTitle>Languages</SheetTitle>
            <SheetDescription>Select all that apply</SheetDescription>
          </SheetHeader>
          <div className="flex flex-wrap gap-2 px-4 pb-4">
            {LANGUAGE_OPTIONS.map((t) => {
              const active = draft.languages?.includes(t) ?? false;
              return (
                <button
                  key={t}
                  type="button"
                  onClick={() => toggleInList("languages", t)}
                  className={`cursor-pointer rounded-lg border px-4 py-2 text-sm ${
                    active
                      ? "border-primary bg-accent text-accent-foreground"
                      : "border-border text-muted-foreground"
                  }`}
                >
                  {t}
                </button>
              );
            })}
          </div>
          <div className="border-t border-border px-4 pt-4 pb-8">
            <p className="mb-2 text-sm text-muted-foreground">Or add a custom language:</p>
            <TagInput
              value={draft.languages ?? []}
              onChange={(tags) => set("languages", tags)}
              placeholder="Type and press Enter"
            />
          </div>
        </SheetContent>
      </Sheet>

      {logoCropSrc && (
        <CropImageModal
          open={logoCropOpen}
          onOpenChange={handleLogoCropOpenChange}
          imageSrc={logoCropSrc}
          onCropped={handleLogoCropped}
          aspect={LOGO_ASPECT}
          title="Crop agency logo"
          description="Logos use a 1:1 square format. Drag and zoom to choose what will be visible."
        />
      )}

      {bannerCropSrc && (
        <CropImageModal
          open={bannerCropOpen}
          onOpenChange={handleBannerCropOpenChange}
          imageSrc={bannerCropSrc}
          onCropped={handleBannerCropped}
          aspect={BANNER_ASPECT}
          title="Crop cover image"
          description="Cover uses a 1920 × 600 format. Drag and zoom to choose what will be visible."
        />
      )}

      {verifyTarget && (user?.email || user?.phone) && (
        <VerifyContactDialog
          type={verifyTarget}
          contact={verifyTarget === "email" ? (user?.email ?? "") : (user?.phone ?? "")}
          open={verifyTarget !== null}
          onOpenChange={(open) => {
            if (!open) setVerifyTarget(null);
          }}
          onVerified={handleContactVerified}
        />
      )}
    </div>
  );
}




