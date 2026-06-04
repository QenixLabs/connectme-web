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
  return (
    <div
      className="relative w-full shrink-0"
      style={{
        background:
          "linear-gradient(180deg, #f5f3ef 0%, #e8e2d8 50%, #faf9f7 100%)",
      }}
    >
      <div className="max-w-3xl mx-auto px-4 pt-4 pb-5 flex items-center gap-4 animate-in fade-in duration-300"
        style={{ animationFillMode: "both" }}
      >
        <button
          onClick={onBack}
          className="p-2 rounded-full hover:bg-msg-ink/5 transition-colors shrink-0"
        >
          <ArrowLeft className="w-5 h-5 text-msg-ink" strokeWidth={1.5} />
        </button>

        <div className="relative">
          <div
            className="rounded-full p-[3px]"
            style={{
              background:
                "linear-gradient(135deg, #c8a040 0%, #e8c86a 50%, #c8a040 100%)",
            }}
          >
            <UserAvatar
              photo={otherUser?.profile_photo}
              name={otherName}
              className="w-[72px] h-[72px] md:w-24 md:h-24 bg-msg-cream text-msg-ink-soft text-sm font-semibold"
            />
          </div>
          <span className="absolute bottom-0.5 right-0.5 w-3.5 h-3.5 bg-emerald-500 border-[2.5px] border-msg-card rounded-full" />
        </div>

        <div className="min-w-0">
          <h1 className="text-lg md:text-xl font-semibold text-msg-ink font-[family-name:var(--font-playfair)] tracking-tight">
            {otherName}
          </h1>
          {otherUser?.role === "recruiter" && (
            <div className="mt-1">
              <VerifiedBadge label="Verified recruiter" size="sm" />
            </div>
          )}
        </div>

        <div className="ml-auto">
          <SafetyMenu
            otherUserId={otherId}
            otherUserName={otherName}
            conversationId={conversationId}
            onBlocked={onBlocked}
          />
        </div>
      </div>
    </div>
  );
}
