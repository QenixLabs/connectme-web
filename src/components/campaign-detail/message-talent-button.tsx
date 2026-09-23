"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, MessageSquare } from "lucide-react";
import { toast } from "sonner";

import { conversationsApi } from "@/lib/api";
import { cn } from "@/lib/utils";

export function MessageTalentButton({
  username,
  talentName,
  campaignName,
  variant = "icon",
  className,
}: {
  username?: string | null;
  talentName?: string;
  campaignName?: string;
  variant?: "icon" | "button";
  className?: string;
}) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!username) {
      toast.error("Talent username is unavailable");
      return;
    }
    setPending(true);
    try {
      const { conversation_id } = await conversationsApi.startByUsername(username);
      const params = new URLSearchParams();
      if (talentName) params.set("talent", talentName);
      if (campaignName) params.set("campaign", campaignName);
      const suffix = params.toString() ? `?${params.toString()}` : "";
      router.push(`/recruiter/messages/${conversation_id}${suffix}`);
    } catch {
      toast.error("Could not open conversation");
    } finally {
      setPending(false);
    }
  };

  if (variant === "button") {
    return (
      <button
        type="button"
        onClick={handleClick}
        disabled={pending || !username}
        className={cn(
          "inline-flex h-8 items-center gap-1.5 rounded-lg border border-primary/40 px-2.5 text-xs font-semibold text-primary hover:bg-primary/10 disabled:opacity-50",
          className,
        )}
      >
        {pending ? <Loader2 className="size-3 animate-spin" /> : <MessageSquare className="size-3" />}
        Message
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={pending || !username}
      aria-label={talentName ? `Message ${talentName}` : "Message talent"}
      title={talentName ? `Message ${talentName}` : "Message talent"}
      className={cn(
        "flex-1 py-1 transition-colors hover:text-foreground disabled:opacity-40",
        className,
      )}
    >
      {pending ? (
        <Loader2 className="mx-auto h-4 w-4 animate-spin" />
      ) : (
        <MessageSquare className="mx-auto h-4 w-4" />
      )}
    </button>
  );
}
