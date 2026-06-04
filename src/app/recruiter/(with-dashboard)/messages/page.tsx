"use client";

import { useAuthStore } from "@/providers/auth-store-provider";
import { ConversationList } from "@/components/messaging/conversation-list";

export default function RecruiterMessagesPage() {
  const user = useAuthStore((state) => state.user);
  const hasHydrated = useAuthStore((state) => state.hasHydrated);

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
      role="recruiter"
      dashboardUrl="/recruiter/dashboard"
      findPeopleUrl="/recruiter/find-talent"
    />
  );
}
