"use client";

import Image from "next/image";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, BadgeCheck, Building2, Check, Loader2, MapPin, Sparkles, Store } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import logoImage from "@/assets/rootin-logo-orange.png";
import { useAuthStore } from "@/providers/auth-store-provider";
import { providersApi } from "@/lib/api/marketplace";
import type { ProviderProfile } from "@/lib/api/marketplace";
import { getApiErrorMessage } from "@/lib/api/client";
import { queryKeys } from "@/lib/api/query-keys";

interface OnboardingForm {
  display_name: string;
  business_name: string;
  city: string;
  categories: string;
  about: string;
}

const EMPTY_FORM: OnboardingForm = {
  display_name: "",
  business_name: "",
  city: "",
  categories: "",
  about: "",
};

function toForm(profile: ProviderProfile): OnboardingForm {
  return {
    display_name: profile.display_name ?? "",
    business_name: profile.business_name ?? "",
    city: profile.location?.city ?? "",
    categories: (profile.categories ?? []).join(", "),
    about: profile.about ?? "",
  };
}

function OnboardingLayout({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow: string;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-background text-foreground">
      <div className="pointer-events-none absolute -left-40 -top-48 size-[34rem] rounded-full bg-primary/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-48 -right-40 size-[34rem] rounded-full bg-blue-500/10 blur-3xl" />

      <header className="relative z-10 mx-auto flex h-[76px] max-w-7xl items-center justify-between px-5 sm:px-8">
        <Link href="/" aria-label="RootIn home" className="inline-flex items-center">
          <Image src={logoImage} alt="RootIn" height={34} className="h-9 w-auto" priority />
        </Link>
        <Link
          href="/services"
          className="rounded-full border border-border/80 bg-card/70 px-4 py-2 text-xs font-semibold text-muted-foreground transition hover:border-primary/40 hover:text-foreground sm:text-sm"
        >
          Explore marketplace
        </Link>
      </header>

      <main className="relative z-10 mx-auto grid max-w-7xl gap-6 px-4 pb-8 sm:px-8 lg:min-h-[calc(100vh-76px)] lg:grid-cols-[0.9fr_1.1fr] lg:items-center lg:gap-10 lg:pb-12">
        <aside className="group relative isolate flex min-h-[360px] flex-col justify-end overflow-hidden rounded-[2rem] border border-white/10 bg-card shadow-2xl shadow-black/30 sm:min-h-[440px] lg:min-h-[640px]">
          <Image
            src="/heroimage.jfif"
            alt=""
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 45vw"
            className="absolute inset-0 -z-20 object-cover object-center transition duration-700 group-hover:scale-[1.02]"
          />
          <div className="absolute inset-0 -z-10 bg-gradient-to-t from-[#00060C] via-[#00060C]/60 to-[#00060C]/5" />
          <div className="absolute inset-0 -z-10 bg-gradient-to-r from-[#00060C]/35 via-transparent to-transparent" />

          <div className="p-6 sm:p-9 lg:p-10">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-black/25 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.16em] text-white/85 backdrop-blur-md">
              <Sparkles className="size-3.5 text-amber-300" />
              Made for the makers
            </span>
            <h2 className="mt-5 max-w-lg text-3xl font-extrabold leading-[1.08] tracking-tight text-white sm:text-4xl lg:text-[2.8rem]">
              Make your work{" "}
              <span className="text-blue-300">impossible to miss.</span>
            </h2>
            <p className="mt-4 max-w-md text-sm leading-6 text-white/75 sm:text-base">
              Build a profile that brings your services to life and helps the right clients find
              you.
            </p>

            <div className="mt-7 grid gap-3 border-t border-white/15 pt-5 sm:grid-cols-3">
              {["Showcase your services", "Meet new clients", "Grow your reputation"].map((item) => (
                <div key={item} className="flex items-center gap-2 text-xs font-medium text-white/85">
                  <span className="grid size-5 shrink-0 place-items-center rounded-full bg-primary/80">
                    <Check className="size-3" strokeWidth={3} />
                  </span>
                  {item}
                </div>
              ))}
            </div>
          </div>
        </aside>

        <section className="rounded-[2rem] border border-border/80 bg-card/90 p-5 shadow-2xl shadow-black/20 backdrop-blur-xl sm:p-8 lg:p-10">
          <div className="mb-7">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/10 px-3 py-1.5 text-xs font-bold tracking-wide text-blue-300">
              <Store className="size-3.5" />
              {eyebrow}
            </div>
            <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">{title}</h1>
            <p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground">{description}</p>
          </div>
          {children}
        </section>
      </main>
    </div>
  );
}

export default function ProviderOnboardingPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const user = useAuthStore((state) => state.user);
  const fetchUser = useAuthStore((state) => state.fetchUser);
  const [form, setForm] = useState<OnboardingForm>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const hasProviderAccess =
    user?.role === "provider" || (user?.account_capabilities ?? []).includes("provider");

  const profileQuery = useQuery({
    queryKey: queryKeys.provider.me(),
    queryFn: providersApi.getMyProfile,
    enabled: hasProviderAccess,
    retry: false,
  });

  const profile = profileQuery.data?.profile;
  const queryStatus = (profileQuery.error as { response?: { status?: number } } | null)
    ?.response?.status;
  const needsActivation = !hasProviderAccess || queryStatus === 404;
  const loading = hasProviderAccess && profileQuery.isLoading;

  /* Render-phase form hydration keyed on the fetched profile version. */
  const [syncedToken, setSyncedToken] = useState<string | null>(null);
  const profileToken = profile ? `${profile.id}:${profile.updated_at ?? ""}` : null;
  if (profile && profileToken !== syncedToken) {
    setSyncedToken(profileToken);
    setForm(toForm(profile));
  }

  const handleActivate = async () => {
    setSaving(true);
    setError("");
    try {
      await providersApi.activate();
      await fetchUser();
      await queryClient.invalidateQueries({ queryKey: queryKeys.provider.me() });
      setMessage("Provider access activated. Complete your profile to continue.");
    } catch (err) {
      setError(getApiErrorMessage(err, "Failed to activate provider access"));
    } finally {
      setSaving(false);
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    setMessage("");
    try {
      const categories = form.categories
        .split(",")
        .map((value) => value.trim())
        .filter(Boolean);
      await providersApi.updateMyProfile({
        display_name: form.display_name.trim(),
        business_name: form.business_name.trim() || undefined,
        city: form.city.trim() || undefined,
        categories: categories.length > 0 ? categories : undefined,
        about: form.about.trim() || undefined,
      });
      const result = await providersApi.completeOnboarding();
      await fetchUser();
      await queryClient.invalidateQueries({ queryKey: queryKeys.provider.me() });
      setMessage("Provider onboarding completed. Taking you to your dashboard…");
      if (result.profile?.slug) {
        queryClient.setQueryData(queryKeys.provider.me(), { profile: result.profile });
      }
      router.push("/provider/dashboard");
      router.refresh();
    } catch (err) {
      setError(getApiErrorMessage(err, "Failed to save provider profile"));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <OnboardingLayout
        eyebrow="Getting things ready"
        title="Your next chapter starts here."
        description="Loading your provider profile."
      >
        <div className="flex items-center gap-3 rounded-2xl border border-border bg-background/50 p-5 text-sm text-muted-foreground">
          <Loader2 className="size-5 animate-spin text-primary" />
          Loading provider onboarding…
        </div>
      </OnboardingLayout>
    );
  }

  if (needsActivation) {
    return (
      <OnboardingLayout
        eyebrow="Your provider journey"
        title="Ready to grow your service business?"
        description="Add provider access to your account to list your services and connect with clients. Your current role, profile and subscription stay exactly as they are."
      >
        <div className="mb-6 flex items-start gap-4 rounded-2xl border border-border bg-background/50 p-4 sm:p-5">
          <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-primary/15 text-primary">
            <Building2 className="size-5" />
          </span>
          <div>
            <p className="text-sm font-bold">One account, more ways to grow</p>
            <p className="mt-1 text-xs leading-5 text-muted-foreground">
              Keep your existing account and add a provider profile whenever you’re ready.
            </p>
          </div>
        </div>
        {error && (
          <p className="mb-4 rounded-xl border border-red-500/25 bg-red-500/10 px-4 py-3 text-sm text-red-300" role="alert">
            {error}
          </p>
        )}
        {message && (
          <p className="mb-4 rounded-xl border border-green-500/25 bg-green-500/10 px-4 py-3 text-sm text-green-300" role="status">
            {message}
          </p>
        )}
        <button
          type="button"
          onClick={handleActivate}
          disabled={saving}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3.5 text-sm font-bold text-primary-foreground shadow-lg shadow-primary/20 transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {saving ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              Activating…
            </>
          ) : (
            <>
              Activate provider access
              <ArrowRight className="size-4" />
            </>
          )}
        </button>
      </OnboardingLayout>
    );
  }

  return (
    <OnboardingLayout
      eyebrow={profile?.onboarding_completed ? "Profile is live" : "Step 1 · Profile basics"}
      title={profile?.onboarding_completed ? "Your provider profile" : "Let’s make it official."}
      description={
        profile?.onboarding_completed
          ? "Your provider profile is complete. Manage your services and enquiries from the provider dashboard."
          : "Start with the essentials. You can add portfolio items and more details whenever you’re ready."
      }
    >
      {profile?.onboarding_completed && (
        <div className="mb-6 rounded-2xl border border-green-500/25 bg-green-500/10 p-4 text-sm text-green-100">
          <div className="flex items-center gap-2 font-bold">
            <BadgeCheck className="size-5 text-green-400" />
            Onboarding complete
          </div>
          <p className="mt-2 text-xs leading-5 text-green-100/75">
            Your public profile is live. Head to the dashboard to publish services.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Link
              href="/provider/dashboard"
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-xs font-bold text-primary-foreground transition hover:bg-primary/90"
            >
              Go to dashboard <ArrowRight className="size-3.5" />
            </Link>
            {profile.slug && (
              <Link
                href={`/providers/${profile.slug}`}
                className="rounded-lg border border-green-400/25 px-4 py-2.5 text-xs font-semibold text-green-100 transition hover:bg-green-500/10"
              >
                View public profile
              </Link>
            )}
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block space-y-2 sm:col-span-2">
            <span className="text-sm font-semibold">Your name <span className="text-primary">*</span></span>
            <input
              type="text"
              value={form.display_name}
              onChange={(event) => setForm({ ...form, display_name: event.target.value })}
              className="w-full rounded-xl border border-border bg-background/70 px-4 py-3 text-sm outline-none transition placeholder:text-muted-foreground/60 focus:border-primary focus:ring-4 focus:ring-primary/10"
              placeholder="The name clients will see"
              maxLength={80}
              autoComplete="name"
              required
            />
          </label>
          <label className="block space-y-2">
            <span className="text-sm font-semibold">Business name <span className="text-xs font-normal text-muted-foreground">Optional</span></span>
            <span className="relative block">
              <Building2 className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                value={form.business_name}
                onChange={(event) => setForm({ ...form, business_name: event.target.value })}
                className="w-full rounded-xl border border-border bg-background/70 py-3 pl-10 pr-4 text-sm outline-none transition placeholder:text-muted-foreground/60 focus:border-primary focus:ring-4 focus:ring-primary/10"
                placeholder="Your studio or company"
                maxLength={120}
                autoComplete="organization"
              />
            </span>
          </label>
          <label className="block space-y-2">
            <span className="text-sm font-semibold">City <span className="text-xs font-normal text-muted-foreground">Optional</span></span>
            <span className="relative block">
              <MapPin className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                value={form.city}
                onChange={(event) => setForm({ ...form, city: event.target.value })}
                className="w-full rounded-xl border border-border bg-background/70 py-3 pl-10 pr-4 text-sm outline-none transition placeholder:text-muted-foreground/60 focus:border-primary focus:ring-4 focus:ring-primary/10"
                placeholder="Where you’re based"
                maxLength={80}
                autoComplete="address-level2"
              />
            </span>
          </label>
          <label className="block space-y-2 sm:col-span-2">
            <span className="text-sm font-semibold">What do you do? <span className="text-xs font-normal text-muted-foreground">Optional</span></span>
            <input
              type="text"
              value={form.categories}
              onChange={(event) => setForm({ ...form, categories: event.target.value })}
              className="w-full rounded-xl border border-border bg-background/70 px-4 py-3 text-sm outline-none transition placeholder:text-muted-foreground/60 focus:border-primary focus:ring-4 focus:ring-primary/10"
              placeholder="Photography, video production, makeup…"
              aria-describedby="categories-hint"
            />
            <span id="categories-hint" className="block text-xs text-muted-foreground">
              Add a few services, separated by commas.
            </span>
          </label>
          <label className="block space-y-2 sm:col-span-2">
            <span className="text-sm font-semibold">A little about your work <span className="text-xs font-normal text-muted-foreground">Optional</span></span>
            <textarea
              value={form.about}
              onChange={(event) => setForm({ ...form, about: event.target.value })}
              className="min-h-28 w-full resize-y rounded-xl border border-border bg-background/70 px-4 py-3 text-sm leading-6 outline-none transition placeholder:text-muted-foreground/60 focus:border-primary focus:ring-4 focus:ring-primary/10"
              placeholder="Tell clients what you do best and what makes your work special…"
              maxLength={2000}
              rows={4}
            />
          </label>
        </div>
        {error && (
          <p className="rounded-xl border border-red-500/25 bg-red-500/10 px-4 py-3 text-sm text-red-300" role="alert">
            {error}
          </p>
        )}
        {message && (
          <p className="rounded-xl border border-green-500/25 bg-green-500/10 px-4 py-3 text-sm text-green-300" role="status">
            {message}
          </p>
        )}
        <div className="flex flex-col gap-3 border-t border-border/70 pt-5 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-muted-foreground">
            <span className="text-primary">*</span> Required · You can update your profile anytime
          </p>
          <div className="flex flex-wrap items-center gap-3">
            {profile?.onboarding_completed && (
              <Link href="/provider/dashboard" className="px-2 py-2 text-sm font-semibold text-muted-foreground transition hover:text-foreground">
                Skip to dashboard
              </Link>
            )}
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-bold text-primary-foreground shadow-lg shadow-primary/20 transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Saving…
                </>
              ) : (
                <>
                  {profile?.onboarding_completed ? "Save profile" : "Save and complete"}
                  <ArrowRight className="size-4" />
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </OnboardingLayout>
  );
}
