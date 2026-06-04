"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuthStore } from "@/providers/auth-store-provider";
import { ConversationList } from "@/components/messaging/conversation-list";

export default function TalentMessagesPage() {
  const user = useAuthStore((state) => state.user);
  const hasHydrated = useAuthStore((state) => state.hasHydrated);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const router = useRouter();

  useEffect(() => {
    if (hasHydrated && !isAuthenticated) {
      router.push("/auth/login");
    }
  }, [hasHydrated, isAuthenticated, router]);

  if (!hasHydrated || !user) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-msg-ink-muted">Loading...</p>
      </div>
    );
  }

  return (
    <ConversationList
      currentUserId={user._id}
      role="talent"
      dashboardUrl="/talent/dashboard"
    />
  );
}
