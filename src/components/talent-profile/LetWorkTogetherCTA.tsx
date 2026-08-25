"use client";

import { Send, Loader2 } from "lucide-react";
import { GlassCard } from "./primitives";
import { useStartConversation } from "@/hooks/use-talent-actions";

export function LetWorkTogetherCTA({
  username,
  displayName,
  viewerRole,
}: {
  username: string;
  displayName: string;
  viewerRole: "talent" | "recruiter" | "admin" | null;
}) {
  const { start, isPending } = useStartConversation(username, viewerRole ?? undefined);
  const firstName = displayName.split(" ")[0] || displayName;

  return (
    <GlassCard hover={false} className="border-rootin/15 bg-rootin/[0.03] text-center">
      <h2 className="text-sm font-bold uppercase tracking-[0.16em] text-foreground">
        Let&rsquo;s Work Together
      </h2>
      <p className="mx-auto mt-2 max-w-xs text-sm leading-6 text-muted-foreground">
        Interested in collaborating or hiring this talent? Send a message to start
        the conversation.
      </p>
      <button
        onClick={start}
        disabled={isPending}
        className="mt-4 inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-rootin px-6 text-sm font-semibold text-white shadow-[0_4px_14px_-6px_var(--rootin-blue)] transition-all hover:bg-rootin/90 active:scale-[0.98] disabled:opacity-70"
      >
        {isPending ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <Send className="size-4" />
        )}
        Message {firstName}
      </button>
    </GlassCard>
  );
}
