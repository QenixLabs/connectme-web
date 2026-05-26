"use client";

import { useSearchParams } from "next/navigation";
import { useAuthStore } from "@/providers/auth-store-provider";
import ChatInterface from "@/components/messaging/chat-interface";

export default function TalentMessagesPage() {
  const user = useAuthStore((state) => state.user);
  const hasHydrated = useAuthStore((state) => state.hasHydrated);
  const searchParams = useSearchParams();
  const conversationId = searchParams.get("conversationId");

  if (!hasHydrated || !user) {
    return (
      <div className="flex h-[calc(100vh-120px)] items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return <ChatInterface currentUserId={user._id} initialConversationId={conversationId} dashboardUrl="/talent/dashboard" />;
}
