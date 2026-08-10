"use client";

import { useState } from "react";
import Image from "next/image";
import { BadgeCheck, GraduationCap, Star, Users, X } from "lucide-react";
import type { CollaborationRequest } from "@/lib/api/requests";
import { useAcceptRequest, useRejectRequest } from "@/hooks/use-requests";

type RequestKind = "collaboration" | "mentorship" | "referral";

const kindStyles: Record<RequestKind, string> = {
  collaboration: "text-violet-tag bg-violet-tag/12 border-violet-tag/25",
  mentorship: "text-green-tag bg-green-tag/12 border-green-tag/25",
  referral: "text-amber-tag bg-amber-tag/12 border-amber-tag/25",
};

const kindLabels: Record<RequestKind, string> = {
  collaboration: "Collaboration",
  mentorship: "Mentorship",
  referral: "Referral",
};

function getRelativeTime(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diffMs = now - then;
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return "just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  const diffDay = Math.floor(diffHr / 24);
  return `${diffDay}d ago`;
}

export function RequestCard({
  request,
  currentUserId,
}: {
  request: CollaborationRequest;
  currentUserId: string;
}) {
  const [expanded, setExpanded] = useState(false);
  const acceptMutation = useAcceptRequest();
  const rejectMutation = useRejectRequest();

  const other =
    request.requester_id.role === "recruiter"
      ? request.requester_id
      : request.receiver_id;

  const name = other.full_legal_name || other.username || "Unknown";
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  const reason = request.reason ?? "collaboration";
  const timeAgo = getRelativeTime(request.created_at);
  const isNew = request.status === "pending";
  const message = request.message || "";

  const KindIcon = reason === "mentorship" ? GraduationCap : Users;

  const handleAccept = () => acceptMutation.mutate(request._id);
  const handleReject = () => rejectMutation.mutate(request._id);

  return (
    <article className="card-surface group relative rounded-2xl p-5 transition-colors hover:border-teal/35 sm:p-6">
      <span className="absolute right-4 top-4 rounded-full border px-3 py-1 text-xs font-medium sm:right-6 sm:top-6">
        {isNew ? (
          <span className="text-teal">New</span>
        ) : (
          <span className="text-muted-foreground">{timeAgo}</span>
        )}
      </span>

      <div className="flex gap-4">
        <div className="relative shrink-0">
          {other.profile_photo ? (
            <Image
              src={other.profile_photo}
              alt={`${name} profile photo`}
              width={512}
              height={512}
              className="size-16 rounded-full object-cover ring-2 ring-border sm:size-20"
            />
          ) : (
            <div className="flex size-16 items-center justify-center rounded-full bg-secondary text-xl font-bold text-muted-foreground ring-2 ring-border sm:size-20">
              {initials}
            </div>
          )}
        </div>

        <div className="min-w-0 flex-1 pr-16">
          <h3 className="flex items-center gap-1.5 text-xl font-bold tracking-tight sm:text-2xl">
            <span className="truncate">{name}</span>
            {other.verification_status === "enterprise" && (
              <BadgeCheck className="size-5 shrink-0 fill-teal text-card" aria-label="Verified" />
            )}
          </h3>
          <p className="mt-1 text-sm text-muted-foreground sm:text-base">
            {other.position || other.role}
            {other.company_name ? ` • ${other.company_name}` : ""}
          </p>

          <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-2 text-sm text-muted-foreground">
            <span
              className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium ${kindStyles[reason as RequestKind] ?? kindStyles.collaboration}`}
            >
              <KindIcon className="size-3.5" />
              {kindLabels[reason as RequestKind] ?? "Collaboration"}
            </span>
            <span className="text-muted-foreground/60">•</span>
            <span>{timeAgo}</span>
          </div>
        </div>
      </div>

      {message && (
        <p className="mt-4 text-[15px] leading-relaxed text-foreground/85">
          <span className={expanded || message.length <= 110 ? "" : "line-clamp-2"}>
            {message}
          </span>{" "}
          {message.length > 110 && (
            <button
              onClick={() => setExpanded((v) => !v)}
              className="font-medium text-teal transition-colors hover:text-teal/80"
            >
              {expanded ? "Show less" : "Read more"}
            </button>
          )}
        </p>
      )}

      {request.status === "pending" && (
        <div className="mt-5 flex items-stretch gap-4 border-t border-border pt-4">
          <button
            onClick={handleReject}
            disabled={rejectMutation.isPending}
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl py-3 text-base font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground disabled:opacity-50"
          >
            <X className="size-5" />
            Decline
          </button>
          <span className="w-px bg-border" />
          <button
            onClick={handleAccept}
            disabled={acceptMutation.isPending}
            className="btn-accept inline-flex flex-[1.6] items-center justify-center rounded-xl py-3 text-base font-semibold disabled:opacity-50"
          >
            Accept
          </button>
        </div>
      )}

      {request.status === "accepted" && (
        <div className="mt-5 border-t border-border pt-4">
          <span className="text-sm font-medium text-green">Connected</span>
        </div>
      )}

      {request.status === "rejected" && (
        <div className="mt-5 border-t border-border pt-4">
          <span className="text-sm font-medium text-muted-foreground">Declined</span>
        </div>
      )}
    </article>
  );
}
