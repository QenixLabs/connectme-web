"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useStore } from "zustand/react";
import { authStore } from "@/stores/auth-store";

const GOOGLE_ERROR_MESSAGES: Record<string, string> = {
  GOOGLE_STATE_EXPIRED: "Your Google sign-in session expired. Please try again.",
  GOOGLE_EMAIL_NOT_VERIFIED: "Your Google email is not verified.",
  ACCOUNT_LINK_FAILED: "Could not link your Google account. Please try again.",
  ROLE_INVALID: "Invalid signup role requested.",
  SLUG_GENERATION_FAILED: "Could not set up your profile. Please try again.",
  GOOGLE_TOKEN_EXCHANGE_FAILED: "Google sign-in failed. Please try again.",
};

function setCookie(name: string, value: string, days: number) {
  const expires = new Date(Date.now() + days * 86400000).toUTCString();
  const secure = window.location.protocol === "https:" ? "Secure;" : "";
  document.cookie = `${name}=${value};expires=${expires};path=/;SameSite=Strict;${secure}`;
}

function GoogleCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { fetchUser } = useStore(authStore);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const googleError = searchParams.get("google_error");
    if (googleError) {
      const friendly = GOOGLE_ERROR_MESSAGES[googleError] ?? decodeURIComponent(googleError);
      setError(friendly);
      return;
    }

    // OAuth callback sets a fresh HTTP-only cookie. Do not let a persisted
    // bearer token from a previous role win when fetching the authenticated user.
    authStore.getState().setAccessToken(null);

    fetchUser()
      .then(() => {
        const user = authStore.getState().user;
        if (!user) {
          router.replace("/auth?mode=signin&google_error=GOOGLE_TOKEN_EXCHANGE_FAILED");
          return;
        }
        setCookie("auth_session", "1", 7);
        setCookie("user_role", user.role, 7);
        setCookie(
          "onboarding_completed",
          user.onboarding_completed || user.onboarding_exempted ? "1" : "0",
          7,
        );

        const done = user.onboarding_completed || user.onboarding_exempted;
        if (user.role === "recruiter") {
          router.replace(done ? "/recruiter/dashboard" : "/auth/recruiter/signup?resume=1");
        } else if (user.role === "talent") {
          router.replace(done ? "/talent/dashboard" : "/auth/talent/signup?resume=1");
        } else {
          router.replace("/auth?mode=signin&google_error=GOOGLE_TOKEN_EXCHANGE_FAILED");
        }
      })
      .catch(() => {
        router.replace("/auth?mode=signin&google_error=GOOGLE_TOKEN_EXCHANGE_FAILED");
      });
  }, [searchParams, router, fetchUser]);

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <div className="w-full max-w-md rounded-2xl border bg-card p-6 text-center shadow-sm">
          <h1 className="text-lg font-bold">Google sign-in failed</h1>
          <p className="mt-2 text-sm text-muted-foreground">{error}</p>
          <button
            type="button"
            onClick={() => router.replace("/auth?mode=signin")}
            className="mt-4 inline-flex h-10 items-center justify-center rounded-xl bg-primary px-5 text-sm font-semibold text-primary-foreground"
          >
            Back to Sign In
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <div className="mb-4 h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent mx-auto" />
        <p className="text-sm text-muted-foreground">Signing you in with Google...</p>
      </div>
    </div>
  );
}

export default function GoogleCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <div className="text-center">
            <div className="mb-4 h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent mx-auto" />
            <p className="text-sm text-muted-foreground">Signing you in with Google...</p>
          </div>
        </div>
      }
    >
      <GoogleCallbackContent />
    </Suspense>
  );
}
