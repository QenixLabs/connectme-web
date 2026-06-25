"use client";

import { MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

interface EmptyListStateProps {
  error?: string | null;
  findPeopleUrl?: string;
}

export function EmptyListState({ error, findPeopleUrl }: EmptyListStateProps) {
  const router = useRouter();

  return (
    <div className="flex flex-col items-center justify-center py-20 px-6">
      <div className="relative mb-6">
        <div className="w-20 h-20 rounded-2xl bg-msg-gold-soft border border-msg-gold/20 flex items-center justify-center">
          <MessageSquare className="w-9 h-9 text-msg-gold" strokeWidth={1.5} />
        </div>
        <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-msg-card border border-msg-border flex items-center justify-center shadow-sm">
          <div className="w-2 h-2 rounded-full bg-msg-gold" />
        </div>
      </div>

      <p className="text-base font-semibold text-msg-ink">
        {error ? "Could not load conversations" : "No conversations yet"}
      </p>
      <p className="text-sm text-msg-ink-muted mt-1.5 text-center max-w-xs leading-relaxed">
        {error ||
          "Messages from recruiters and talent you connect with will appear here."}
      </p>
      {!error && findPeopleUrl && (
        <Button
          size="sm"
          className="mt-5 bg-msg-ink hover:bg-msg-ink-soft text-white text-xs rounded-full px-5 h-9 shadow-sm"
          onClick={() => router.push(findPeopleUrl)}
        >
          Find Talent
        </Button>
      )}
    </div>
  );
}
