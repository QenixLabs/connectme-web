"use client";

import { useState } from "react";
import { Clock, Building2, Briefcase, ShieldCheck, ShieldAlert, ChevronRight } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface RequesterProfile {
  _id: string;
  email: string;
  role?: string;
  full_legal_name?: string;
  username?: string;
  company_name?: string;
  company_website?: string;
  company_size?: string;
  industry?: string;
  position?: string;
  profile_photo?: string;
  verification_status?: string;
}

export interface RequestItem {
  _id: string;
  requester_id: RequesterProfile;
  status: "pending" | "accepted" | "rejected";
  message?: string;
  created_at: string;
}

const AVATAR_COLORS = [
  { bg: "bg-violet-100", text: "text-violet-700", border: "border-violet-200" },
  { bg: "bg-emerald-100", text: "text-emerald-700", border: "border-emerald-200" },
  { bg: "bg-rose-100", text: "text-rose-700", border: "border-rose-200" },
  { bg: "bg-amber-100", text: "text-amber-700", border: "border-amber-200" },
  { bg: "bg-sky-100", text: "text-sky-700", border: "border-sky-200" },
  { bg: "bg-indigo-100", text: "text-indigo-700", border: "border-indigo-200" },
];

function getAvatarColor(name: string) {
  const idx = name.charCodeAt(0) % AVATAR_COLORS.length;
  return AVATAR_COLORS[idx];
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function getDisplayName(requester: RequesterProfile): string {
  return (
    requester.full_legal_name ||
    requester.username ||
    requester.email ||
    "Unknown"
  );
}

function RequesterAvatar({
  requester,
  size = "md",
}: {
  requester: RequesterProfile;
  size?: "sm" | "md";
}) {
  const name = getDisplayName(requester);
  const color = getAvatarColor(name);
  const sizeClass = size === "md" ? "w-11 h-11 text-sm" : "w-9 h-9 text-xs";

  if (requester.profile_photo) {
    return (
      <div
        className={cn(
          "rounded-full overflow-hidden flex-shrink-0 border-2 border-border",
          sizeClass
        )}
      >
        <img
          src={requester.profile_photo}
          alt={name}
          className="w-full h-full object-cover"
        />
      </div>
    );
  }

  return (
    <div
      className={cn(
        "rounded-full flex items-center justify-center font-semibold flex-shrink-0 border-2",
        sizeClass,
        color.bg,
        color.text,
        color.border
      )}
    >
      {getInitials(name)}
    </div>
  );
}

interface RequestCardProps {
  request: RequestItem;
  isProcessing: boolean;
  onAccept: (id: string) => void;
  onReject: (id: string) => void;
  onViewProfile: (requester: RequesterProfile) => void;
  mode?: "received" | "sent" | "history";
}

export function RequestCard({
  request,
  isProcessing,
  onAccept,
  onReject,
  onViewProfile,
  mode = "received",
}: RequestCardProps) {
  const [isLeaving, setIsLeaving] = useState(false);
  const requester = request.requester_id;
  const name = getDisplayName(requester);
  const isVerified =
    requester.verification_status === "approved" ||
    requester.verification_status === "trusted_partner" ||
    requester.verification_status === "enterprise";

  const handleAccept = () => {
    setIsLeaving(true);
    setTimeout(() => onAccept(request._id), 200);
  };

  const handleReject = () => {
    setIsLeaving(true);
    setTimeout(() => onReject(request._id), 200);
  };

  const isAccepted = request.status === "accepted";
  const isRejected = request.status === "rejected";
  const isPending = request.status === "pending";
  const isSent = mode === "sent";

  return (
    <div
      className={cn(
        "rounded-2xl border border-border bg-card overflow-hidden transition-all duration-300",
        isLeaving && "opacity-0 scale-95 -translate-y-1",
        isPending && "border-l-2 border-l-amber",
        isAccepted && "border-l-2 border-l-success",
        isRejected && "border-l-2 border-l-muted-foreground/30 opacity-80",
        "hover:shadow-md"
      )}
    >
      <div className="p-4 space-y-3">
        <div className="flex items-start gap-3">
          <RequesterAvatar requester={requester} />

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <p className="text-sm font-semibold text-text-primary truncate">
                {name}
              </p>
              {isVerified && (
                <ShieldCheck className="w-3.5 h-3.5 text-success flex-shrink-0" strokeWidth={2} />
              )}
              {!isVerified && requester.verification_status === "pending" && (
                <ShieldAlert className="w-3.5 h-3.5 text-text-muted flex-shrink-0" strokeWidth={2} />
              )}
            </div>

            {requester.position && (
              <div className="flex items-center gap-1 mt-0.5">
                <Briefcase className="w-3 h-3 text-text-muted flex-shrink-0" strokeWidth={1.5} />
                <p className="text-xs text-text-secondary truncate">
                  {requester.position}
                  {requester.company_name && (
                    <span className="text-text-muted">
                      {" "}at {requester.company_name}
                    </span>
                  )}
                </p>
              </div>
            )}

            {!requester.position && requester.company_name && (
              <div className="flex items-center gap-1 mt-0.5">
                <Building2 className="w-3 h-3 text-text-muted flex-shrink-0" strokeWidth={1.5} />
                <p className="text-xs text-text-secondary truncate">
                  {requester.company_name}
                </p>
              </div>
            )}
          </div>

          <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
            <span className="text-[11px] text-text-muted whitespace-nowrap">
              {formatDistanceToNow(new Date(request.created_at), { addSuffix: true })}
            </span>
            {requester.industry && (
              <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                {requester.industry}
              </Badge>
            )}
          </div>
        </div>

        {/* Company size info row */}
        {(requester.company_size || requester.company_website) && (
          <div className="flex items-center gap-3 text-[11px] text-text-muted">
            {requester.company_size && (
              <span className="capitalize">{requester.company_size} company</span>
            )}
            {requester.company_website && (
              <span className="truncate">{requester.company_website}</span>
            )}
          </div>
        )}

        {request.message && (
          <div className="relative bg-cream-soft rounded-xl px-3.5 py-2.5 border border-border-warm">
            <div className="absolute left-0 top-3 bottom-3 w-0.5 rounded-full bg-brand/30" />
            <p className="text-xs text-text-secondary leading-relaxed italic pl-2">
              &ldquo;{request.message}&rdquo;
            </p>
          </div>
        )}

        {isPending && !isSent && (
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="flex-1 h-9 text-xs font-medium border-border bg-card hover:bg-error-light hover:text-error hover:border-error-border transition-colors"
              onClick={handleReject}
              disabled={isProcessing}
            >
              {isProcessing ? "..." : "Decline"}
            </Button>
            <Button
              size="sm"
              className="flex-1 h-9 text-xs font-medium bg-foreground text-background hover:bg-text-primary transition-colors"
              onClick={handleAccept}
              disabled={isProcessing}
            >
              {isProcessing ? "..." : "Accept"}
            </Button>
          </div>
        )}

        {isAccepted && (
          <div className="flex items-center justify-between">
            <Badge className="bg-success-light text-success-text border-success-soft text-[11px]">
              Connected
            </Badge>
            <button
              onClick={() => onViewProfile(requester)}
              className="flex items-center gap-1 text-xs text-text-muted hover:text-text-secondary transition-colors"
            >
              View profile
              <ChevronRight className="w-3 h-3" strokeWidth={1.5} />
            </button>
          </div>
        )}

        {isRejected && (
          <Badge
            variant="secondary"
            className="text-[11px]"
          >
            Declined
          </Badge>
        )}

        {isSent && isPending && (
          <Badge variant="secondary" className="text-[11px]">
            Awaiting response
          </Badge>
        )}
      </div>
    </div>
  );
}
