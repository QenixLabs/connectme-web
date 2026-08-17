"use client";

import { ArrowLeft, BadgeCheck, CheckCheck, ExternalLink, MoreVertical } from "lucide-react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { ConversationParticipant } from "@/lib/api/types";

interface ConversationHeaderProps {
  participant?: ConversationParticipant;
  loading?: boolean;
  showBack?: boolean;
  onBack?: () => void;
  onMarkAllRead?: () => void;
  className?: string;
}

export function ConversationHeader({
  participant,
  loading,
  showBack,
  onBack,
  onMarkAllRead,
  className,
}: ConversationHeaderProps) {
  const router = useRouter();
  const name = participant?.full_legal_name || participant?.company_name || "Unknown";
  const avatar = participant?.profile_photo;
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase() || "?";
  const profession = participant?.professions?.[0] || participant?.role || "";
  const city = participant?.location?.city;
  const verified = (participant?.verification_tier ?? 0) >= 2;
  const username = participant?.username;
  const role = participant?.role;

  const canViewProfile = Boolean(username);

  function handleViewProfile() {
    if (!username) return;
    const path = role === "recruiter" ? `/recruiter/${username}` : `/talent/${username}`;
    router.push(path);
  }

  return (
    <header
      className={cn(
        "flex h-16 shrink-0 items-center gap-3 border-b border-border/60 bg-background/80 px-4 backdrop-blur-xl lg:px-5",
        className
      )}
    >
      {showBack && (
        <Button
          variant="ghost"
          size="icon"
          onClick={onBack}
          aria-label="Back"
          className="shrink-0 rounded-full"
        >
          <ArrowLeft className="size-5" />
        </Button>
      )}

      <div className="flex min-w-0 flex-1 items-center gap-3">
        <Avatar className="size-11 ring-2 ring-border">
          <AvatarImage src={avatar} alt={`${name} profile photo`} />
          <AvatarFallback className="bg-muted text-xs font-semibold">{initials}</AvatarFallback>
        </Avatar>

        <div className="min-w-0">
          {loading ? (
            <div className="h-5 w-32 animate-pulse rounded bg-muted" />
          ) : (
            <h2 className="flex items-center gap-1.5 truncate text-base font-bold tracking-tight">
              {name}
              {verified && (
                <BadgeCheck className="size-4 shrink-0 fill-primary text-background" aria-label="Verified" />
              )}
            </h2>
          )}
          <p className="truncate text-xs text-muted-foreground">
            {loading ? (
              <span className="inline-block h-3.5 w-24 animate-pulse rounded bg-muted" />
            ) : (
              <>
                {profession}
                {profession && city && <span className="mx-1.5 opacity-50">·</span>}
                {city}
              </>
            )}
          </p>
        </div>
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            aria-label="Conversation options"
            className="shrink-0 rounded-full"
          >
            <MoreVertical className="size-5" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-52">
          <DropdownMenuItem
            onClick={handleViewProfile}
            disabled={!canViewProfile}
            className="cursor-pointer"
          >
            <ExternalLink className="mr-2 size-4" />
            View profile
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={onMarkAllRead}
            className="cursor-pointer"
          >
            <CheckCheck className="mr-2 size-4" />
            Mark all as read
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
