"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/providers/auth-store-provider";

export default function NotificationsRedirectPage() {
  const router = useRouter();
  const { user, hasHydrated } = useAuthStore();

  useEffect(() => {
    if (!hasHydrated) return;

    if (!user) {
      router.replace("/auth/login");
      return;
    }

    router.replace(
      user.role === "admin" ? "/admin/notifications" : `/${user.role}/notifications`,
    );
  }, [hasHydrated, router, user]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-background">
      <p className="text-sm text-muted-foreground">Loading notifications...</p>
    </main>
  );
}
