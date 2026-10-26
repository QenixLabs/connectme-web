"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
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
      <div className="min-h-screen flex items-center justify-center p-4">
        <p className="text-muted-foreground">Loading provider onboarding…</p>
      </div>
    );
  }

  if (needsActivation) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-md space-y-4">
          <h1 className="text-2xl font-bold">Become a Service Provider</h1>
          <p className="text-muted-foreground">
            Add provider access to your account. Your current role, profile and subscription stay
            exactly as they are.
          </p>
          {error && <p className="text-red-500">{error}</p>}
          {message && <p className="text-green-600">{message}</p>}
          <button
            type="button"
            onClick={handleActivate}
            disabled={saving}
            className="w-full rounded bg-primary p-2 text-white disabled:opacity-60"
          >
            {saving ? "Activating…" : "Activate Provider Access"}
          </button>
          <Link href="/services" className="block text-sm text-muted-foreground hover:underline">
            Browse the marketplace first
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-2xl space-y-4">
        <div>
          <h1 className="text-2xl font-bold">Provider Onboarding</h1>
          <p className="text-muted-foreground">
            {profile?.onboarding_completed
              ? "Your provider profile is complete. Manage your services and enquiries from the provider dashboard."
              : "Complete your provider profile to get started. You can add portfolio items and more details later."}
          </p>
        </div>

        {profile?.onboarding_completed && (
          <div className="rounded-lg border border-emerald-300 bg-emerald-50 p-4 text-sm text-emerald-900">
            <p className="font-medium">Onboarding complete</p>
            <p className="mt-1">
              Your public profile is live. Head to the dashboard to publish services.
            </p>
            <div className="mt-3 flex flex-wrap gap-3">
              <Link href="/provider/dashboard" className="rounded bg-primary px-4 py-2 text-white">
                Go to dashboard
              </Link>
              {profile.slug && (
                <Link
                  href={`/providers/${profile.slug}`}
                  className="rounded border px-4 py-2 hover:bg-white"
                >
                  View public profile
                </Link>
              )}
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="block space-y-1">
            <span className="text-sm font-medium">Display name</span>
            <input
              type="text"
              value={form.display_name}
              onChange={(event) => setForm({ ...form, display_name: event.target.value })}
              className="w-full rounded border p-2"
              maxLength={80}
              required
            />
          </label>
          <label className="block space-y-1">
            <span className="text-sm font-medium">Business name</span>
            <input
              type="text"
              value={form.business_name}
              onChange={(event) => setForm({ ...form, business_name: event.target.value })}
              className="w-full rounded border p-2"
              maxLength={120}
            />
          </label>
          <label className="block space-y-1">
            <span className="text-sm font-medium">City</span>
            <input
              type="text"
              value={form.city}
              onChange={(event) => setForm({ ...form, city: event.target.value })}
              className="w-full rounded border p-2"
              maxLength={80}
            />
          </label>
          <label className="block space-y-1">
            <span className="text-sm font-medium">Categories (comma separated)</span>
            <input
              type="text"
              value={form.categories}
              onChange={(event) => setForm({ ...form, categories: event.target.value })}
              className="w-full rounded border p-2"
            />
          </label>
          <label className="block space-y-1">
            <span className="text-sm font-medium">About</span>
            <textarea
              value={form.about}
              onChange={(event) => setForm({ ...form, about: event.target.value })}
              className="w-full rounded border p-2"
              maxLength={2000}
              rows={4}
            />
          </label>
          {error && <p className="text-red-500">{error}</p>}
          {message && <p className="text-green-600">{message}</p>}
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="submit"
              disabled={saving}
              className="rounded bg-primary px-4 py-2 text-white disabled:opacity-60"
            >
              {saving
                ? "Saving…"
                : profile?.onboarding_completed
                  ? "Save profile"
                  : "Save and Complete"}
            </button>
            {profile?.onboarding_completed && (
              <Link href="/provider/dashboard" className="text-sm text-muted-foreground hover:underline">
                Skip to dashboard
              </Link>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
