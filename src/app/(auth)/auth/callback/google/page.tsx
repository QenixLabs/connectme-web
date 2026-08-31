"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useStore } from "zustand/react";
import { authStore } from "@/stores/auth-store";
import { tokenStorage } from "@/lib/token-storage";

function setCookie(name: string, value: string, days: number) {
  const expires = new Date(Date.now() + days * 86400000).toUTCString();
  const secure = window.location.protocol === "https:" ? "Secure;" : "";
  document.cookie = `${name}=${value};expires=${expires};path=/;SameSite=Strict;${secure}`;
}

export default function GoogleCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setAccessToken, fetchUser } = useStore(authStore);

  useEffect(() => {
    const accessToken = searchParams.get("access_token");
    const error = searchParams.get("google_error");

    if (error) {
      router.replace(`/auth?google_error=${encodeURIComponent(error)}`);
      return;
    }

    if (!accessToken) {
      router.replace("/auth?google_error=no_token");
      return;
    }

    tokenStorage.setToken(accessToken);
    setAccessToken(accessToken);

    fetchUser()
      .then(() => {
        const user = authStore.getState().user;
        if (user) {
          setCookie("auth_session", "1", 7);
          setCookie("user_role", user.role, 7);
          router.replace(user.role === "recruiter" ? "/recruiter/dashboard" : "/talent/dashboard");
        } else {
          router.replace("/auth?google_error=fetch_failed");
        }
      })
      .catch(() => {
        router.replace("/auth?google_error=fetch_failed");
      });
  }, [searchParams, router, setAccessToken, fetchUser]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <div className="mb-4 h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent mx-auto" />
        <p className="text-sm text-muted-foreground">Signing you in with Google...</p>
      </div>
    </div>
  );
}
