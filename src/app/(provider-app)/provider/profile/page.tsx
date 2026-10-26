"use client";

import { useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  AlertCircle,
  Camera,
  CheckCircle2,
  ExternalLink,
  ImagePlus,
  Loader2,
  Plus,
  Save,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { providersApi } from "@/lib/api/marketplace";
import type {
  ProviderPortfolioItem,
  ProviderProfile,
  UpdateProviderProfilePayload,
} from "@/lib/api/marketplace";
import { getApiErrorMessage } from "@/lib/api/client";
import { queryKeys } from "@/lib/api/query-keys";
import { useAuthStore } from "@/providers/auth-store-provider";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { TagInput } from "@/components/ui/tag-input";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface ProfileForm {
  slug: string;
  display_name: string;
  business_name: string;
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
}

const EMPTY_FORM: ProfileForm = {
  slug: "",
  display_name: "",
  business_name: "",
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
    phone: profile.phone ?? "",
    city: profile.location?.city ?? "",
    state: profile.location?.state ?? "",
    country: profile.location?.country ?? "",
    about: profile.about ?? "",
    categories: profile.categories ?? [],
    service_areas: profile.service_areas ?? [],
    skills: profile.skills ?? [],
    portfolio: (profile.portfolio ?? []).map((item) => ({ ...item })),
    profile_photo: profile.profile_photo_path,
    profile_photo_url: profile.profile_photo,
  };
}

export default function ProviderProfilePage() {
  const queryClient = useQueryClient();
  const fetchUser = useAuthStore((state) => state.fetchUser);
  const profileQuery = useQuery({
    queryKey: queryKeys.provider.me(),
    queryFn: providersApi.getMyProfile,
    retry: false,
  });
  const [form, setForm] = useState<ProfileForm>(EMPTY_FORM);
  const [originalSlug, setOriginalSlug] = useState("");
  const [saving, setSaving] = useState(false);
  const [activating, setActivating] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [uploadingPortfolio, setUploadingPortfolio] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [slugError, setSlugError] = useState("");
  const [slugChecking, setSlugChecking] = useState(false);
  const [completing, setCompleting] = useState(false);
  const photoInputRef = useRef<HTMLInputElement>(null);
  const portfolioInputRef = useRef<HTMLInputElement>(null);
  const [portfolioTarget, setPortfolioTarget] = useState<number | null>(null);

  /* Render-phase sync: hydrate the form when the fetched profile version
     changes, instead of a setState effect. */
  const [syncedProfileToken, setSyncedProfileToken] = useState<string | null>(null);
  const profile = profileQuery.data?.profile;
  const profileToken = profile ? `${profile.id}:${profile.updated_at ?? ""}` : null;
  if (profile && profileToken !== syncedProfileToken) {
    setSyncedProfileToken(profileToken);
    setForm(toForm(profile));
    setOriginalSlug(profile.slug ?? "");
  }

  const status = (profileQuery.error as { response?: { status?: number } } | null)?.response
    ?.status;

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
    if (!slug || slug === originalSlug || slug.length < 3) {
      setSlugError("");
      return;
    }
    setSlugChecking(true);
    try {
      const result = await providersApi.checkSlugAvailability(slug);
      setSlugError(result.available ? "" : "This profile URL is already taken");
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

  async function handlePortfolioImageChange(file: File | undefined) {
    if (!file || portfolioTarget === null) return;
    setUploadingPortfolio(portfolioTarget);
    try {
      const uploaded = await providersApi.uploadPortfolioImage(file);
      setForm((current) => ({
        ...current,
        portfolio: current.portfolio.map((item, index) =>
          index === portfolioTarget
            ? { ...item, image_path: uploaded.relativePath, image_url: uploaded.signedUrl }
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

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    if (!form.display_name.trim()) {
      setError("Display name is required");
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
            Add the provider capability to your existing account. Your current profile and
            subscription stay unchanged.
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

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium text-primary">Public profile</p>
          <h1 className="text-3xl font-bold tracking-tight">Edit your provider profile</h1>
          <p className="mt-1 text-muted-foreground">
            This information appears on your public marketplace profile.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {profile?.slug && (
            <Button type="button" variant="outline" asChild>
              <a href={`/providers/${profile.slug}`} target="_blank" rel="noreferrer">
                <ExternalLink className="mr-2 size-4" />
                Preview
              </a>
            </Button>
          )}
          <Button type="submit" disabled={saving}>
            {saving ? <Loader2 className="mr-2 size-4 animate-spin" /> : <Save className="mr-2 size-4" />}
            Save changes
          </Button>
        </div>
      </div>

      {profile && !profile.onboarding_completed && (
        <Alert className="border-amber-300 bg-amber-50 text-amber-900 dark:bg-amber-950/20 dark:text-amber-100">
          <AlertCircle className="size-4" />
          <AlertTitle>Onboarding not complete</AlertTitle>
          <AlertDescription className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <span>You need to complete onboarding before publishing services.</span>
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

      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Basic details</CardTitle>
              <CardDescription>Your name and public profile URL.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="display_name">Display name *</Label>
                <Input
                  id="display_name"
                  value={form.display_name}
                  maxLength={80}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, display_name: event.target.value }))
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
                    setForm((current) => ({ ...current, business_name: event.target.value }))
                  }
                />
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
                      setForm((current) => ({
                        ...current,
                        slug: event.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-"),
                      }));
                    }}
                    onBlur={handleSlugBlur}
                    className="rounded-l-none"
                    placeholder="your-name"
                  />
                </div>
                {slugChecking && (
                  <p className="text-xs text-muted-foreground">Checking availability…</p>
                )}
                {slugError && <p className="text-xs text-destructive">{slugError}</p>}
                {!slugError && form.slug && !slugChecking && (
                  <p className="flex items-center gap-1 text-xs text-emerald-600">
                    <CheckCircle2 className="size-3.5" />
                    Public URL is available
                  </p>
                )}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={form.phone}
                  maxLength={30}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, phone: event.target.value }))
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
                    setForm((current) => ({ ...current, city: event.target.value }))
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
                    setForm((current) => ({ ...current, state: event.target.value }))
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
                    setForm((current) => ({ ...current, country: event.target.value }))
                  }
                />
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="about">About</Label>
                <Textarea
                  id="about"
                  value={form.about}
                  maxLength={2000}
                  rows={5}
                  placeholder="Describe your services, experience, and what clients can expect."
                  onChange={(event) =>
                    setForm((current) => ({ ...current, about: event.target.value }))
                  }
                />
                <p className="text-xs text-muted-foreground">{form.about.length}/2000</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Services and skills</CardTitle>
              <CardDescription>Help clients find you in marketplace search.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <Label>Categories</Label>
                <TagInput
                  value={form.categories}
                  onChange={(categories) => setForm((current) => ({ ...current, categories }))}
                  placeholder="e.g. Design, Photography"
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
              <div className="space-y-1.5">
                <Label>Skills</Label>
                <TagInput
                  value={form.skills}
                  onChange={(skills) => setForm((current) => ({ ...current, skills }))}
                  placeholder="e.g. Brand identity, Retouching"
                  maxTags={50}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Portfolio</CardTitle>
                <CardDescription>Show examples of your best work.</CardDescription>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() =>
                  setForm((current) => ({
                    ...current,
                    portfolio: [...current.portfolio, { title: "", description: "" }],
                  }))
                }
                disabled={form.portfolio.length >= 20}
              >
                <Plus className="mr-2 size-4" />
                Add item
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
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
                            updatePortfolio(index, { title: event.target.value })
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
                            updatePortfolio(index, { link_url: event.target.value })
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
                            updatePortfolio(index, { description: event.target.value })
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
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Profile photo</CardTitle>
              <CardDescription>Shown on your profile and cards.</CardDescription>
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

          <Card>
            <CardHeader>
              <CardTitle>Discovery tips</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <p>• Add at least three categories and service areas.</p>
              <p>• Keep your about section specific and client-focused.</p>
              <p>• Publish services with clear indicative pricing.</p>
              <p>• Respond to enquiries from the provider inbox.</p>
            </CardContent>
          </Card>
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
