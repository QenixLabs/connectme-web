"use client";

import { ArrowLeft } from "lucide-react";
import { UserAvatar } from "./utils";
import { SafetyMenu } from "./safety-menu";
import { VerifiedBadge } from "@/components/ui/verified-badge";
import type { ConversationParticipant } from "@/lib/api/messages";

interface ChatHeroProps {
  otherUser: ConversationParticipant | null;
  otherName: string;
  otherId: string;
  conversationId?: string;
  onBack: () => void;
  onBlocked?: () => void;
}

export function ChatHero({
  otherUser,
  otherName,
  otherId,
  conversationId,
  onBack,
  onBlocked,
}: ChatHeroProps) {
  const initials = otherName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="relative w-full shrink-0 z-10">
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, var(--color-msg-cream) 0%, #f0ede7 40%, var(--color-msg-page) 100%)",
        }}
      />
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E\")",
          backgroundSize: "256px 256px",
        }}
      />

      <div className="relative max-w-3xl mx-auto px-4 pt-4 pb-5 flex items-center gap-4">
        <button
          onClick={onBack}
          className="p-2 rounded-full hover:bg-msg-ink/5 transition-colors shrink-0"
        >
          <ArrowLeft className="w-5 h-5 text-msg-ink" strokeWidth={1.5} />
        </button>

        <div className="relative shrink-0">
          <div
            className="rounded-full p-[2.5px]"
            style={{
              background:
                "linear-gradient(135deg, var(--color-msg-gold) 0%, var(--color-msg-gold-light) 50%, var(--color-msg-gold) 100%)",
            }}
          >
            <UserAvatar
              photo={otherUser?.profile_photo}
              name={otherName}
              className="w-[72px] h-[72px] md:w-[84px] md:h-[84px] bg-msg-cream text-msg-ink-soft text-sm font-semibold"
            />
          </div>
          <span className="absolute bottom-0.5 right-0.5 w-3 h-3 bg-emerald-500 border-[2.5px] border-white rounded-full shadow-sm" />
        </div>

        <div className="min-w-0 flex-1">
          <h1 className="text-lg md:text-xl font-semibold text-msg-ink font-[family-name:var(--font-playfair)] tracking-tight truncate">
            {otherName}
          </h1>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="flex items-center gap-1 text-xs text-msg-ink-muted">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              Active now
            </span>
            {otherUser?.role === "recruiter" && (
              <>
                <span className="w-1 h-1 rounded-full bg-msg-border" />
                <VerifiedBadge label="Verified" size="sm" />
              </>
            )}
          </div>
        </div>

        <SafetyMenu
          otherUserId={otherId}
          otherUserName={otherName}
          conversationId={conversationId}
          onBlocked={onBlocked}
        />
      </div>
    </div>
  );
}
