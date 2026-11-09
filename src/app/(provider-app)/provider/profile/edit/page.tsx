"use client";

import { Suspense, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  AlertCircle,
  BriefcaseBusiness,
  Camera,
  CheckCircle2,
  CircleDollarSign,
  ExternalLink,
  Eye,
  ImagePlus,
  Link2,
  Loader2,
  MapPin,
  Plus,
  Save,
  Sparkles,
  Trash2,
  UserRound,
  type LucideIcon,
} from "lucide-react";
import { toast } from "sonner";
import { providersApi, servicesApi } from "@/lib/api/marketplace";
import type {
  ProviderPortfolioItem,
  ProviderProfile,
  UpdateProviderProfilePayload,
} from "@/lib/api/marketplace";
import { getApiErrorMessage } from "@/lib/api/client";
import { queryKeys } from "@/lib/api/query-keys";
import { MARKETPLACE_CATEGORIES } from "@/lib/marketplace-categories";
import { useAuthStore } from "@/providers/auth-store-provider";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { TagInput } from "@/components/ui/tag-input";
import { ProviderSkillsPicker } from "@/components/provider/provider-skills-picker";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ProfileForm {
  slug: string;
  display_name: string;
  business_name: string;
  provider_type: string;
  tagline: string;
  phone: string;
  city: string;
  state: string;
  country: string;
  about: string;
  categories: string[];
  service_areas: string[];
  skills: string[];
  portfolio: ProviderPortfolioItem[];
  profile_photo?: string;
  profile_photo_url?: string;
  banner_image?: string;
  banner_image_url?: string;
}

const PROVIDER_TYPES = [
  { value: "individual", label: "Individual / Freelancer" },
  { value: "company", label: "Company / Business" },
  { value: "studio", label: "Studio / Venue" },
  { value: "agency", label: "Agency / Service Firm" },
  { value: "equipment", label: "Equipment Provider" },
  { value: "other", label: "Other specialized services" },
];

const PROFILE_STEPS = [
  { title: "Basic info", description: "Name, category and brand" },
  { title: "About", description: "Tell clients what you do" },
  { title: "Media", description: "Photos and portfolio" },
  { title: "Services", description: "What you offer" },
  { title: "Pricing", description: "Set clear expectations" },
  { title: "Review", description: "Check your profile" },
];

const PROFILE_STEP_QUERY: Record<string, number> = {
  basic: 0,
  basics: 0,
  about: 1,
  media: 2,
  portfolio: 2,
  services: 3,
  pricing: 4,
  review: 5,
};

const EMPTY_FORM: ProfileForm = {
  slug: "",
  display_name: "",
  business_name: "",
  provider_type: "",
  tagline: "",
  phone: "",
  city: "",
  state: "",
  country: "",
  about: "",
  categories: [],
  service_areas: [],
  skills: [],
  portfolio: [],
};

function toForm(profile: ProviderProfile): ProfileForm {
  return {
    slug: profile.slug ?? "",
    display_name: profile.display_name ?? "",
    business_name: profile.business_name ?? "",
    provider_type: profile.provider_type ?? "",
    tagline: profile.tagline ?? "",
    phone: profile.phone ?? "",
    city: profile.location?.city ?? "",
    state: profile.location?.state ?? "",
    country: profile.location?.country ?? "",
    about: profile.about ?? "",
    categories: (profile.categories ?? []).filter((category) =>
      MARKETPLACE_CATEGORIES.some((option) => option === category),
    ),
    service_areas: profile.service_areas ?? [],
    skills: profile.skills ?? [],
    portfolio: (profile.portfolio ?? []).map((item) => ({ ...item })),
    profile_photo: profile.profile_photo_path,
    profile_photo_url: profile.profile_photo,
    banner_image: profile.banner_image_path,
    banner_image_url: profile.banner_image,
  };
}

function SectionCard({
  title,
  description,
  icon: Icon,
  action,
  children,
}: {
  title: string;
  description?: string;
  icon: LucideIcon;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <Card className="overflow-hidden rounded-2xl border-[#e7e9f2] bg-white text-[#172554] shadow-[0_10px_30px_-25px_rgba(27,30,74,0.42)]">
      <CardHeader className="flex flex-row items-start justify-between gap-3 space-y-0 border-b border-[#f1f1f6] bg-gradient-to-r from-white to-[#fbfaff] px-5 py-5">
        <div className="min-w-0">
          <CardTitle className="flex items-center gap-2 text-base">
            <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-[#f0ebff] text-[#5b35eb]">
              <Icon className="size-4" />
            </span>
            {title}
          </CardTitle>
          {description && (
            <CardDescription className="mt-1.5">{description}</CardDescription>
          )}
        </div>
        {action}
      </CardHeader>
      <CardContent className="p-5">{children}</CardContent>
    </Card>
  );
}

function ProviderProfileEditForm() {
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const fetchUser = useAuthStore((state) => state.fetchUser);
  const profileQuery = useQuery({
    queryKey: queryKeys.provider.me(),
    queryFn: providersApi.getMyProfile,
    retry: false,
  });
  const servicesQuery = useQuery({
    queryKey: queryKeys.services.mine({ status: "all", limit: 50 }),
    queryFn: () => servicesApi.getMine({ status: "all", limit: 50 }),
    retry: false,
  });
  const [form, setForm] = useState<ProfileForm>(EMPTY_FORM);
  const [activeStep, setActiveStep] = useState(() => {
    const requestedStep = searchParams
      .get("step")
      ?.toLowerCase();
    return requestedStep ? PROFILE_STEP_QUERY[requestedStep] ?? 0 : 0;
  });
  const [originalSlug, setOriginalSlug] = useState("");
  const [saving, setSaving] = useState(false);
  const [activating, setActivating] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [uploadingBanner, setUploadingBanner] = useState(false);
  const [uploadingPortfolio, setUploadingPortfolio] = useState<number | null>(
    null,
  );
  const [error, setError] = useState("");
  const [slugError, setSlugError] = useState("");
  const [slugChecking, setSlugChecking] = useState(false);
  const [checkedSlug, setCheckedSlug] = useState("");
  const [completing, setCompleting] = useState(false);
  const photoInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);
  const portfolioInputRef = useRef<HTMLInputElement>(null);
  const [portfolioTarget, setPortfolioTarget] = useState<number | null>(null);

  /* Render-phase sync: hydrate the form when the fetched profile version
     changes, instead of a setState effect. */
  const [syncedProfileToken, setSyncedProfileToken] = useState<string | null>(
    null,
  );
  const profile = profileQuery.data?.profile;
  const profileToken = profile ? `${profile.id}:${profile.updated_at ?? ""}` : null;
  if (profile && profileToken !== syncedProfileToken) {
    setSyncedProfileToken(profileToken);
    setForm(toForm(profile));
    setOriginalSlug(profile.slug ?? "");
  }

  const status = (profileQuery.error as { response?: { status?: number } } | null)
    ?.response?.status;

  async function handleActivate() {
    setActivating(true);
    setError("");
    try {
      await providersApi.activate();
      await fetchUser();
      await queryClient.invalidateQueries({ queryKey: queryKeys.provider.me() });
      toast.success("Provider access activated");
    } catch (err) {
      setError(getApiErrorMessage(err, "Could not activate provider access"));
    } finally {
      setActivating(false);
    }
  }

  async function handleSlugBlur() {
    const slug = form.slug.trim().toLowerCase();
    setCheckedSlug("");
    if (!slug || slug === originalSlug || slug.length < 3) {
      setSlugError("");
      return;
    }
    setSlugChecking(true);
    try {
      const result = await providersApi.checkSlugAvailability(slug);
      setSlugError(result.available ? "" : "This profile URL is already taken");
      if (result.available) setCheckedSlug(slug);
    } catch {
      setSlugError("");
    } finally {
      setSlugChecking(false);
    }
  }

  async function handlePhotoChange(file: File | undefined) {
    if (!file) return;
    setUploadingPhoto(true);
    try {
      const uploaded = await providersApi.uploadProfilePhoto(file);
      setForm((current) => ({
        ...current,
        profile_photo: uploaded.relativePath,
        profile_photo_url: uploaded.signedUrl,
      }));
      toast.success("Profile photo updated");
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Could not upload profile photo"));
    } finally {
      setUploadingPhoto(false);
    }
  }

  async function handleBannerChange(file: File | undefined) {
    if (!file) return;
    setUploadingBanner(true);
    try {
      const uploaded = await providersApi.uploadBannerImage(file);
      setForm((current) => ({
        ...current,
        banner_image: uploaded.relativePath,
        banner_image_url: uploaded.signedUrl,
      }));
      toast.success("Profile banner updated");
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Could not upload profile banner"));
    } finally {
      setUploadingBanner(false);
    }
  }

  async function handlePortfolioImageChange(file: File | undefined) {
    if (!file || portfolioTarget === null) return;
    setUploadingPortfolio(portfolioTarget);
    try {
      const uploaded = await providersApi.uploadPortfolioImage(file);
      setForm((current) => ({
        ...current,
        portfolio: current.portfolio.map((item, index) =>
          index === portfolioTarget
            ? {
                ...item,
                image_path: uploaded.relativePath,
                image_url: uploaded.signedUrl,
              }
            : item,
        ),
      }));
      toast.success("Portfolio image uploaded");
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Could not upload portfolio image"));
    } finally {
      setUploadingPortfolio(null);
      setPortfolioTarget(null);
    }
  }

  function updatePortfolio(index: number, patch: Partial<ProviderPortfolioItem>) {
    setForm((current) => ({
      ...current,
      portfolio: current.portfolio.map((item, itemIndex) =>
        itemIndex === index ? { ...item, ...patch } : item,
      ),
    }));
  }

  function removePortfolio(index: number) {
    setForm((current) => ({
      ...current,
      portfolio: current.portfolio.filter((_, itemIndex) => itemIndex !== index),
    }));
  }

  async function handleSubmit(event?: React.FormEvent, advance = false) {
    event?.preventDefault();
    setError("");
    if (!form.display_name.trim()) {
      setError("Display name is required");
      setActiveStep(0);
      return;
    }
    if (
      form.slug.trim() &&
      !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(form.slug.trim().toLowerCase())
    ) {
      setError("Enter a valid profile URL using letters, numbers, and single hyphens");
      setActiveStep(0);
      return;
    }
    if (slugError) {
      setError("Choose a different profile URL before saving");
      return;
    }

    const payload: UpdateProviderProfilePayload = {
      slug: form.slug.trim().toLowerCase() || undefined,
      display_name: form.display_name.trim(),
      business_name: form.business_name.trim() || undefined,
      provider_type: form.provider_type.trim() || undefined,
      tagline: form.tagline.trim() || undefined,
      phone: form.phone.trim() || undefined,
      city: form.city.trim() || undefined,
      state: form.state.trim() || undefined,
      country: form.country.trim() || undefined,
      about: form.about.trim() || undefined,
      categories: form.categories,
      service_areas: form.service_areas,
      skills: form.skills,
      portfolio: form.portfolio
        .filter((item) => item.title.trim())
        .map((item) => ({
          title: item.title.trim(),
          description: item.description?.trim() || undefined,
          image_url: item.image_path || item.image_url,
          link_url: item.link_url?.trim() || undefined,
        })),
      profile_photo: form.profile_photo,
    };

    setSaving(true);
    try {
      const result = await providersApi.updateMyProfile(payload);
      setForm(toForm(result.profile));
      setOriginalSlug(result.profile.slug ?? form.slug);
      await queryClient.invalidateQueries({ queryKey: queryKeys.provider.me() });
      toast.success("Profile saved");
      if (advance) {
        setActiveStep((current) => Math.min(current + 1, PROFILE_STEPS.length - 1));
      }
    } catch (err) {
      setError(getApiErrorMessage(err, "Could not save provider profile"));
    } finally {
      setSaving(false);
    }
  }

  async function handleCompleteOnboarding() {
    setCompleting(true);
    setError("");
    try {
      await providersApi.completeOnboarding();
      await fetchUser();
      await queryClient.invalidateQueries({ queryKey: queryKeys.provider.me() });
      toast.success("Provider onboarding completed");
    } catch (err) {
      setError(getApiErrorMessage(err, "Could not complete onboarding"));
    } finally {
      setCompleting(false);
    }
  }

  if (profileQuery.isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-40" />
        <Skeleton className="h-96" />
      </div>
    );
  }

  if (profileQuery.isError && status === 404) {
    return (
      <Card className="mx-auto max-w-lg">
        <CardHeader>
          <CardTitle>Activate provider access</CardTitle>
          <CardDescription>
            Add the provider capability to your existing account. Your current
            profile and subscription stay unchanged.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {error && <p className="text-sm text-destructive">{error}</p>}
          <Button onClick={handleActivate} disabled={activating}>
            {activating && <Loader2 className="mr-2 size-4 animate-spin" />}
            Activate provider access
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (profileQuery.isError) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="size-4" />
        <AlertTitle>Could not load profile</AlertTitle>
        <AlertDescription>
          {getApiErrorMessage(profileQuery.error, "Please try again.")}
        </AlertDescription>
      </Alert>
    );
  }

  const providerTypeOptions =
    form.provider_type &&
    !PROVIDER_TYPES.some((option) => option.value === form.provider_type)
      ? [
          ...PROVIDER_TYPES,
          { value: form.provider_type, label: form.provider_type },
        ]
      : PROVIDER_TYPES;

  const serviceListings = servicesQuery.data?.data ?? [];
  const publishedServices = serviceListings.filter(
    (service) => service.status === "published",
  );
  const pricedServices = serviceListings.filter(
    (service) => service.indicative_price,
  );
  const profileChecklist = [
    { label: "Basic information", complete: Boolean(form.display_name.trim()) },
    {
      label: "About & highlights",
      complete: Boolean(form.about.trim() && form.categories.length > 0),
    },
    {
      label: "Media & portfolio",
      complete: Boolean(
        form.profile_photo_url ||
          form.banner_image_url ||
          form.portfolio.some((item) => item.image_url),
      ),
    },
    { label: "Published services", complete: publishedServices.length > 0 },
    { label: "Clear pricing", complete: pricedServices.length > 0 },
    {
      label: "Service area",
      complete: form.service_areas.length > 0 || Boolean(form.city.trim()),
    },
  ];
  const completionPercent = Math.round(
    (profileChecklist.filter((item) => item.complete).length /
      profileChecklist.length) *
      100,
  );

  return (
    <form onSubmit={handleSubmit} className="mx-auto max-w-5xl space-y-6">
      <div className="sticky top-16 z-20 -mx-4 border-b border-[#e8e9f2] bg-white/90 px-4 py-3 shadow-[0_8px_24px_-22px_rgba(27,30,74,0.4)] backdrop-blur-xl">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#6546dc]">
              Public profile
            </p>
            <h1 className="truncate text-xl font-extrabold tracking-tight text-[#171b45] sm:text-2xl">
              Edit your profile
            </h1>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            {form.slug && (
              <Button type="button" variant="outline" asChild>
                <Link href="/provider/profile/preview">
                  <Eye className="mr-2 size-4" />
                  <span className="hidden sm:inline">Preview</span>
                </Link>
              </Button>
            )}
            <Button
              type="button"
              onClick={() => void handleSubmit()}
              disabled={saving}
            >
              {saving ? (
                <Loader2 className="mr-2 size-4 animate-spin" />
              ) : (
                <Save className="mr-2 size-4" />
              )}
              Save changes
            </Button>
          </div>
        </div>
      </div>

      <nav
        aria-label="Profile editing steps"
        className="overflow-x-auto rounded-2xl border border-[#e7e9f2] bg-white p-3 shadow-sm"
      >
        <ol className="flex min-w-[660px] items-center">
          {PROFILE_STEPS.map((step, index) => {
            const isComplete = index < 5 && profileChecklist[index].complete;
            const isActive = index === activeStep;
            return (
              <li
                key={step.title}
                className="flex flex-1 items-center last:flex-none"
              >
                <button
                  type="button"
                  aria-current={isActive ? "step" : undefined}
                  onClick={() => setActiveStep(index)}
                  className="group flex min-w-0 items-center gap-2 rounded-lg px-2 py-1 text-left"
                >
                  <span
                    className={`grid size-8 shrink-0 place-items-center rounded-full border text-xs font-bold transition ${
                      isActive
                        ? "border-[#6339e8] bg-[#6339e8] text-white"
                        : isComplete
                          ? "border-[#6339e8] bg-white text-[#6339e8]"
                          : "border-[#d7d9e3] bg-white text-[#73778b]"
                    }`}
                  >
                    {isComplete ? <CheckCircle2 className="size-4" /> : index + 1}
                  </span>
                  <span className="min-w-0">
                    <span
                      className={`block truncate text-xs font-semibold ${
                        isActive ? "text-[#302366]" : "text-[#45495b]"
                      }`}
                    >
                      {step.title}
                    </span>
                    <span className="hidden text-[10px] text-muted-foreground xl:block">
                      {step.description}
                    </span>
                  </span>
                </button>
                {index < PROFILE_STEPS.length - 1 && (
                  <span
                    aria-hidden="true"
                    className={`mx-1 h-px flex-1 ${
                      isComplete ? "bg-[#8c70ef]" : "bg-[#e6e7ed]"
                    }`}
                  />
                )}
              </li>
            );
          })}
        </ol>
      </nav>

      <div className="rounded-2xl border border-[#e5defe] bg-gradient-to-r from-[#f3efff] via-[#f9f7ff] to-white px-4 py-4 text-sm">
        <p className="font-semibold text-[#302366]">
          Step {activeStep + 1} of {PROFILE_STEPS.length}:{" "}
          {PROFILE_STEPS[activeStep].title}
        </p>
        <p className="mt-1 text-slate-600">
          {activeStep === 0 &&
            "Start with the business identity clients will see first."}
          {activeStep === 1 &&
            "Explain what makes your service valuable and where you work."}
          {activeStep === 2 &&
            "Add a recognizable profile photo, a banner, and examples of your work."}
          {activeStep === 3 &&
            "Create and publish service listings to help clients find and contact you."}
          {activeStep === 4 &&
            "Add indicative pricing to each service so clients know what to expect."}
          {activeStep === 5 &&
            "Review your profile checklist, save your changes, and preview the public page."}
        </p>
      </div>

      {profile && !profile.onboarding_completed && (
        <Alert className="border-amber-300 bg-amber-50 text-amber-900 dark:bg-amber-950/20 dark:text-amber-100">
          <AlertCircle className="size-4" />
          <AlertTitle>Onboarding not complete</AlertTitle>
          <AlertDescription className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <span>
              You need to complete onboarding before publishing services.
            </span>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={handleCompleteOnboarding}
              disabled={completing || !profile.display_name}
            >
              {completing && <Loader2 className="mr-2 size-4 animate-spin" />}
              Complete onboarding
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="size-4" />
          <AlertTitle>Could not save</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-6">
          <div className={activeStep === 0 ? "space-y-6" : "hidden"}>
          <SectionCard
            icon={UserRound}
            title="Basics"
            description="Your name, type of business, and the headline clients see first."
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="display_name">Display name *</Label>
                <Input
                  id="display_name"
                  value={form.display_name}
                  maxLength={80}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      display_name: event.target.value,
                    }))
                  }
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="business_name">Business name</Label>
                <Input
                  id="business_name"
                  value={form.business_name}
                  maxLength={120}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      business_name: event.target.value,
                    }))
                  }
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="provider_type">Provider type</Label>
                <Select
                  value={form.provider_type || "none"}
                  onValueChange={(value) =>
                    setForm((current) => ({
                      ...current,
                      provider_type: value === "none" ? "" : value,
                    }))
                  }
                >
                  <SelectTrigger id="provider_type">
                    <SelectValue placeholder="Choose a provider type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Not specified</SelectItem>
                    {providerTypeOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="tagline">Tagline</Label>
                <Input
                  id="tagline"
                  value={form.tagline}
                  maxLength={200}
                  placeholder="A short line about what you do"
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      tagline: event.target.value,
                    }))
                  }
                />
                <p className="text-xs text-muted-foreground">
                  {form.tagline.length}/200
                </p>
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="slug">Profile URL</Label>
                <div className="flex items-center gap-0">
                  <span className="flex h-9 items-center rounded-l-md border border-r-0 border-input bg-muted px-3 text-sm text-muted-foreground">
                    /providers/
                  </span>
                  <Input
                    id="slug"
                    value={form.slug}
                    maxLength={60}
                    pattern="[a-z0-9]+(?:-[a-z0-9]+)*"
                    onChange={(event) => {
                      setSlugError("");
                      setCheckedSlug("");
                      setForm((current) => ({
                        ...current,
                        slug: event.target.value
                          .toLowerCase()
                          .replace(/[^a-z0-9-]/g, "-"),
                      }));
                    }}
                    onBlur={handleSlugBlur}
                    className="rounded-l-none"
                    placeholder="your-name"
                  />
                </div>
                {slugChecking && (
                  <p className="text-xs text-muted-foreground">
                    Checking availability…
                  </p>
                )}
                {slugError && <p className="text-xs text-destructive">{slugError}</p>}
                {!slugError &&
                  !slugChecking &&
                  checkedSlug === form.slug.trim().toLowerCase() && (
                  <p className="flex items-center gap-1 text-xs text-emerald-600">
                    <CheckCircle2 className="size-3.5" />
                    Public URL is available
                  </p>
                )}
              </div>
            </div>
          </SectionCard>
          </div>

          <div className={activeStep === 1 ? "space-y-6" : "hidden"}>
          <SectionCard
            icon={Sparkles}
            title="About & skills"
            description="Help clients understand your experience and what you specialize in."
          >
            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="about">About</Label>
                <Textarea
                  id="about"
                  value={form.about}
                  maxLength={2000}
                  rows={5}
                  placeholder="Describe your services, experience, and what clients can expect."
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      about: event.target.value,
                    }))
                  }
                />
                <p className="text-xs text-muted-foreground">
                  {form.about.length}/2000
                </p>
              </div>
              <div className="space-y-1.5">
                <Label>Categories</Label>
                <TagInput
                  value={form.categories}
                  onChange={(categories) =>
                    setForm((current) => ({ ...current, categories }))
                  }
                  suggestions={[...MARKETPLACE_CATEGORIES]}
                  allowCustom={false}
                  placeholder="Choose from the category list"
                  maxTags={20}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Service areas</Label>
                <TagInput
                  value={form.service_areas}
                  onChange={(service_areas) =>
                    setForm((current) => ({ ...current, service_areas }))
                  }
                  placeholder="e.g. Mumbai, Remote"
                  maxTags={30}
                />
              </div>
              <ProviderSkillsPicker
                value={form.skills}
                onChange={(skills) =>
                  setForm((current) => ({ ...current, skills }))
                }
              />
            </div>
          </SectionCard>

          <SectionCard
            icon={MapPin}
            title="Location & contact"
            description="Where you work and how clients can reach you."
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={form.phone}
                  maxLength={30}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      phone: event.target.value,
                    }))
                  }
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  value={form.city}
                  maxLength={80}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      city: event.target.value,
                    }))
                  }
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="state">State</Label>
                <Input
                  id="state"
                  value={form.state}
                  maxLength={80}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      state: event.target.value,
                    }))
                  }
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="country">Country</Label>
                <Input
                  id="country"
                  value={form.country}
                  maxLength={80}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      country: event.target.value,
                    }))
                  }
                />
              </div>
            </div>
          </SectionCard>
          </div>

          <div className={activeStep === 2 ? "space-y-6" : "hidden"}>
          <SectionCard
            icon={ImagePlus}
            title="Portfolio"
            description="Show examples of your best work."
            action={
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() =>
                  setForm((current) => ({
                    ...current,
                    portfolio: [
                      ...current.portfolio,
                      { title: "", description: "" },
                    ],
                  }))
                }
                disabled={form.portfolio.length >= 20}
              >
                <Plus className="mr-2 size-4" />
                Add item
              </Button>
            }
          >
            <div className="space-y-4">
              {form.portfolio.length === 0 ? (
                <div className="rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground">
                  Add a project, case study, or image to build trust with clients.
                </div>
              ) : (
                form.portfolio.map((item, index) => (
                  <div key={index} className="rounded-xl border p-4">
                    <div className="mb-3 flex items-center justify-between">
                      <Badge variant="outline">Item {index + 1}</Badge>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        aria-label="Remove portfolio item"
                        onClick={() => removePortfolio(index)}
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div className="space-y-1.5">
                        <Label>Title *</Label>
                        <Input
                          value={item.title}
                          maxLength={120}
                          onChange={(event) =>
                            updatePortfolio(index, {
                              title: event.target.value,
                            })
                          }
                          placeholder="Brand identity for Acme"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label>Link</Label>
                        <Input
                          value={item.link_url ?? ""}
                          maxLength={500}
                          onChange={(event) =>
                            updatePortfolio(index, {
                              link_url: event.target.value,
                            })
                          }
                          placeholder="https://..."
                        />
                      </div>
                      <div className="space-y-1.5 sm:col-span-2">
                        <Label>Description</Label>
                        <Textarea
                          value={item.description ?? ""}
                          maxLength={500}
                          rows={2}
                          onChange={(event) =>
                            updatePortfolio(index, {
                              description: event.target.value,
                            })
                          }
                        />
                      </div>
                    </div>
                    <div className="mt-3 flex items-center gap-3">
                      {item.image_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={item.image_url}
                          alt={item.title || "Portfolio image"}
                          className="h-16 w-24 rounded-md object-cover"
                        />
                      ) : (
                        <div className="flex h-16 w-24 items-center justify-center rounded-md bg-muted">
                          <ImagePlus className="size-5 text-muted-foreground" />
                        </div>
                      )}
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setPortfolioTarget(index);
                          portfolioInputRef.current?.click();
                        }}
                        disabled={uploadingPortfolio === index}
                      >
                        {uploadingPortfolio === index ? (
                          <Loader2 className="mr-2 size-4 animate-spin" />
                        ) : (
                          <ImagePlus className="mr-2 size-4" />
                        )}
                        {item.image_url ? "Replace image" : "Upload image"}
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </SectionCard>
          </div>

          <div className={activeStep === 3 ? "space-y-6" : "hidden"}>
          <SectionCard
            icon={BriefcaseBusiness}
            title="Services"
            description="Published services appear on your profile and in marketplace search."
          >
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-muted-foreground">
                Create, edit, publish, and unpublish services from the services
                manager.
              </p>
              <Button type="button" variant="outline" asChild>
                <Link
                  href="/provider/services"
                  target="_blank"
                  rel="noreferrer"
                >
                  Manage services
                  <ExternalLink className="ml-2 size-4" />
                </Link>
              </Button>
            </div>
            {servicesQuery.isLoading ? (
              <Skeleton className="mt-5 h-20" />
            ) : servicesQuery.isError ? (
              <Alert variant="destructive" className="mt-4">
                <AlertCircle className="size-4" />
                <AlertTitle>Could not load your services</AlertTitle>
                <AlertDescription>
                  {getApiErrorMessage(
                    servicesQuery.error,
                    "Open the services manager to try again.",
                  )}
                </AlertDescription>
              </Alert>
            ) : (
              <div className="mt-5 grid gap-3 sm:grid-cols-3">
                {[
                  { label: "Total listings", value: serviceListings.length },
                  { label: "Published", value: publishedServices.length },
                  {
                    label: "Draft / hidden",
                    value: serviceListings.length - publishedServices.length,
                  },
                ].map((item) => (
                  <div key={item.label} className="rounded-xl bg-[#f7f5ff] p-4">
                    <p className="text-2xl font-bold text-[#302366]">
                      {item.value}
                    </p>
                    <p className="text-xs text-muted-foreground">{item.label}</p>
                  </div>
                ))}
              </div>
            )}
          </SectionCard>
          </div>

          <div className={activeStep === 4 ? "contents" : "hidden"}>
            <SectionCard
              icon={CircleDollarSign}
              title="Pricing"
              description="Pricing belongs to each service, so clients see the right rate for each offer."
              action={
                <Button type="button" variant="outline" size="sm" asChild>
                  <Link
                    href="/provider/services"
                    target="_blank"
                    rel="noreferrer"
                  >
                    Manage pricing
                    <ExternalLink className="ml-2 size-4" />
                  </Link>
                </Button>
              }
            >
              {servicesQuery.isLoading ? (
                <Skeleton className="h-24" />
              ) : servicesQuery.isError ? (
                <Alert variant="destructive">
                  <AlertCircle className="size-4" />
                  <AlertTitle>Could not load pricing</AlertTitle>
                  <AlertDescription>
                    {getApiErrorMessage(
                      servicesQuery.error,
                      "Open the services manager to try again.",
                    )}
                  </AlertDescription>
                </Alert>
              ) : serviceListings.length === 0 ? (
                <div className="rounded-xl border border-dashed p-6 text-center">
                  <CircleDollarSign className="mx-auto size-8 text-[#704de5]" />
                  <p className="mt-3 font-semibold text-[#302366]">
                    Add a service before setting pricing
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Each service can have its own price, unit, and pricing note.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground">
                    {pricedServices.length} of {serviceListings.length} services
                    have indicative pricing.
                  </p>
                  <div className="divide-y rounded-xl border">
                    {serviceListings.slice(0, 5).map((service) => (
                      <div
                        key={service.id}
                        className="flex items-center justify-between gap-3 p-3"
                      >
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium">
                            {service.title}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {service.status === "published"
                              ? "Published"
                              : "Draft or unpublished"}
                          </p>
                        </div>
                        <p className="shrink-0 text-sm font-semibold text-[#302366]">
                          {service.indicative_price
                            ? `${service.indicative_price.currency ?? "INR"} ${service.indicative_price.amount.toLocaleString()} / ${service.indicative_price.unit ?? "project"}`
                            : "No price set"}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </SectionCard>
          </div>

          <div className={activeStep === 5 ? "contents" : "hidden"}>
            <SectionCard
              icon={CheckCircle2}
              title="Review your profile"
              description="A complete profile gives potential clients more confidence."
            >
              <div className="mb-5 rounded-xl bg-[#f7f5ff] p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-[#302366]">
                      Profile strength
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {profileChecklist.filter((item) => item.complete).length}{" "}
                      of {profileChecklist.length} essentials complete
                    </p>
                  </div>
                  <span className="text-2xl font-extrabold text-[#6339e8]">
                    {completionPercent}%
                  </span>
                </div>
                <div className="mt-3 h-2 overflow-hidden rounded-full bg-white">
                  <div
                    className="h-full rounded-full bg-[#6339e8] transition-all"
                    style={{ width: `${completionPercent}%` }}
                  />
                </div>
              </div>
              <ul className="space-y-2">
                {profileChecklist.map((item, index) => (
                  <li
                    key={item.label}
                    className="flex items-center justify-between gap-3 rounded-lg border px-3 py-2.5"
                  >
                    <span className="flex items-center gap-2 text-sm">
                      <CheckCircle2
                        className={`size-4 ${
                          item.complete
                            ? "text-emerald-600"
                            : "text-muted-foreground/50"
                        }`}
                      />
                      {item.label}
                    </span>
                    {!item.complete && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setActiveStep(index === 5 ? 1 : index)}
                      >
                        Add
                      </Button>
                    )}
                  </li>
                ))}
              </ul>
              <p className="mt-4 text-xs text-muted-foreground">
                Changes are saved to your profile when you select Save changes.
                Services and their prices are managed separately.
              </p>
            </SectionCard>
          </div>
        </div>

        <aside className="space-y-6">
          <Card className={activeStep === 2 || activeStep === 5 ? "hidden" : ""}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between text-base">
                Profile strength
                <span className="text-[#6339e8]">{completionPercent}%</span>
              </CardTitle>
              <CardDescription>
                Complete each step to make your profile easier to trust and find.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-2 overflow-hidden rounded-full bg-[#f0eef6]">
                <div
                  className="h-full rounded-full bg-[#6339e8] transition-all"
                  style={{ width: `${completionPercent}%` }}
                />
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                {profileChecklist.filter((item) => item.complete).length} of{" "}
                {profileChecklist.length} essentials complete
              </p>
            </CardContent>
          </Card>

          <div className={activeStep === 2 ? "space-y-6" : "hidden"}>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Profile banner</CardTitle>
              <CardDescription>
                A wide image shown at the top of your public profile.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="relative aspect-[2.4/1] overflow-hidden rounded-xl border bg-gradient-to-r from-primary/80 via-primary/45 to-secondary">
                {form.banner_image_url && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={form.banner_image_url}
                    alt="Profile banner preview"
                    className="size-full object-cover"
                  />
                )}
              </div>
              <input
                ref={bannerInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={(event) => {
                  void handleBannerChange(event.target.files?.[0]);
                  event.target.value = "";
                }}
              />
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => bannerInputRef.current?.click()}
                disabled={uploadingBanner}
              >
                {uploadingBanner ? (
                  <Loader2 className="mr-2 size-4 animate-spin" />
                ) : (
                  <ImagePlus className="mr-2 size-4" />
                )}
                {form.banner_image_url ? "Replace banner" : "Upload banner"}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Profile photo</CardTitle>
              <CardDescription>Shown on your profile and service cards.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="relative mx-auto flex size-36 items-center justify-center overflow-hidden rounded-full border bg-muted">
                {form.profile_photo_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={form.profile_photo_url}
                    alt="Profile preview"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <Camera className="size-10 text-muted-foreground" />
                )}
              </div>
              <input
                ref={photoInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={(event) => {
                  void handlePhotoChange(event.target.files?.[0]);
                  event.target.value = "";
                }}
              />
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => photoInputRef.current?.click()}
                disabled={uploadingPhoto}
              >
                {uploadingPhoto ? (
                  <Loader2 className="mr-2 size-4 animate-spin" />
                ) : (
                  <Camera className="mr-2 size-4" />
                )}
                Upload photo
              </Button>
            </CardContent>
          </Card>
          </div>

          <div className={activeStep === 5 ? "space-y-6" : "hidden"}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Link2 className="size-4 text-primary" />
                Public profile
              </CardTitle>
              <CardDescription>
                Preview the saved version exactly as visitors see it.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="truncate rounded-lg bg-muted px-3 py-2 text-xs text-muted-foreground">
                {form.slug ? `/providers/${form.slug}` : "Save to claim your URL"}
              </p>
              <div className="grid gap-2">
                <Button type="button" variant="outline" asChild>
                  <Link href="/provider/profile/preview">
                    <Eye className="mr-2 size-4" />
                    Preview saved profile
                  </Link>
                </Button>
                {originalSlug && (
                  <Button type="button" variant="ghost" asChild>
                    <a
                      href={`/providers/${originalSlug}`}
                      target="_blank"
                      rel="noreferrer"
                    >
                      View live page
                      <ExternalLink className="ml-2 size-4" />
                    </a>
                  </Button>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                Preview uses your last saved changes. Save first to see edits.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Sparkles className="size-4 text-primary" />
                Discovery tips
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <p>• Add at least three categories and service areas.</p>
              <p>• Keep your about section specific and client-focused.</p>
              <p>• Publish services with clear indicative pricing.</p>
              <p>• Respond to enquiries from the provider inbox.</p>
            </CardContent>
          </Card>
          </div>
        </aside>
      </div>

      <div className="sticky bottom-16 z-20 -mx-4 flex items-center justify-between gap-3 border-t border-[#e8e9f2] bg-white/95 px-4 py-3 shadow-[0_-8px_24px_-22px_rgba(27,30,74,0.4)] backdrop-blur-xl md:bottom-0">
        <Button
          type="button"
          variant="outline"
          onClick={() => setActiveStep((current) => Math.max(current - 1, 0))}
          disabled={activeStep === 0 || saving}
        >
          Back
        </Button>
        <div className="flex items-center gap-2">
          <span className="hidden text-xs text-muted-foreground sm:inline">
            {activeStep + 1} / {PROFILE_STEPS.length}
          </span>
          {activeStep < PROFILE_STEPS.length - 1 ? (
            <Button
              type="button"
              onClick={() => void handleSubmit(undefined, true)}
              disabled={saving}
            >
              {saving && <Loader2 className="mr-2 size-4 animate-spin" />}
              Save &amp; continue
            </Button>
          ) : (
            <Button
              type="button"
              onClick={() => void handleSubmit()}
              disabled={saving}
            >
              {saving && <Loader2 className="mr-2 size-4 animate-spin" />}
              Save profile
            </Button>
          )}
        </div>
      </div>

      <input
        ref={portfolioInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={(event) => {
          void handlePortfolioImageChange(event.target.files?.[0]);
          event.target.value = "";
        }}
      />
    </form>
  );
}

export default function ProviderProfileEditPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-5xl space-y-6">
          <Skeleton className="h-16 rounded-2xl" />
          <Skeleton className="h-20 rounded-2xl" />
          <Skeleton className="h-96 rounded-2xl" />
        </div>
      }
    >
      <ProviderProfileEditForm />
    </Suspense>
  );
}
