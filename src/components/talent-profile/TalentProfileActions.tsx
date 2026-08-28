"use client";

import { Send, Star, Share2, MoreHorizontal, Loader2 } from "lucide-react";
import { useStartConversation } from "@/hooks/use-talent-actions";
import type { TalentProfile, TalentProfilePreview } from "@/lib/api/talent";

interface TalentProfileActionsProps {
  profile: TalentProfile | TalentProfilePreview;
  viewerRole: "talent" | "recruiter" | "admin" | null;
}

export function TalentProfileActions({
  profile,
  viewerRole,
}: TalentProfileActionsProps) {
  const username = profile.username ?? "";

  const { start: startConversation, isPending: messagePending } =
    useStartConversation(username, viewerRole ?? undefined);

  return (
    <>
      {/* Primary CTA */}
      <button
        onClick={startConversation}
        disabled={messagePending}
        className="mb-1 flex h-[52px] w-full items-center justify-center gap-2 rounded-2xl text-sm font-semibold text-brand-foreground shadow-[var(--shadow-card)] disabled:opacity-70"
        style={{ background: "var(--gradient-brand)" }}
      >
        {messagePending ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <Send className="size-4" />
        )}
        Message Talent
      </button>

      {/* Secondary buttons */}
      <div className="grid grid-cols-3 gap-2">
        <button className="flex items-center justify-center gap-1.5 rounded-2xl bg-card py-3.5 text-xs font-semibold text-foreground shadow-[var(--shadow-card)] transition-all active:scale-95">
          <Star className="size-4" /> Shortlist
        </button>
        <button className="flex items-center justify-center gap-1.5 rounded-2xl bg-card py-3.5 text-xs font-semibold text-foreground shadow-[var(--shadow-card)] transition-all active:scale-95">
          <Share2 className="size-4" /> Share Profile
        </button>
        <button className="flex items-center justify-center gap-1.5 rounded-2xl bg-card py-3.5 text-xs font-semibold text-foreground shadow-[var(--shadow-card)] transition-all active:scale-95">
          <MoreHorizontal className="size-4" /> More
        </button>
      </div>
    </>
  );
}
