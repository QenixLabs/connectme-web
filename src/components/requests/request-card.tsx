"use client";

import { useState } from "react";
import { Handshake, GraduationCap, MessageCircle, ShieldCheck, ChevronRight, Clock } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { formatDistanceToNow } from "date-fns";
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
  reason?: "collaboration" | "mentorship" | "referral";
}

const CONNECTION_CONFIG = {
  collaboration: { icon: Handshake, label: "Collaboration" },
  mentorship: { icon: GraduationCap, label: "Mentorship" },
  referral: { icon: MessageCircle, label: "Referral" },
} as const;

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function getDisplayName(requester: RequesterProfile): string {
  return requester.full_legal_name || requester.username || requester.email || "Unknown";
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

  const reason = request.reason || "collaboration";
  const { icon: ConnIcon, label: connLabel } =
    CONNECTION_CONFIG[reason] || CONNECTION_CONFIG.collaboration;

  const subtitle = [requester.position, requester.company_name || requester.industry]
    .filter(Boolean)
    .join(" • ");
  const role =
    requester.role === "recruiter"
      ? "Recruiter"
      : requester.role === "talent"
        ? "Talent"
        : null;
  const displaySubtitle = subtitle || role || null;

  const isPending = request.status === "pending";
  const isAccepted = request.status === "accepted";
  const isRejected = request.status === "rejected";
  const isSent = mode === "sent";
  const isHistory = mode === "history";

  const handleAccept = () => {
    setIsLeaving(true);
    setTimeout(() => onAccept(request._id), 250);
  };

  const handleReject = () => {
    setIsLeaving(true);
    setTimeout(() => onReject(request._id), 250);
  };

  return (
    <AnimatePresence>
      {!isLeaving && (
        <motion.div
          exit={{ opacity: 0, height: 0, overflow: "hidden" }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className="overflow-hidden"
        >
          <div className={cn("px-4 py-4", isLeaving && "opacity-0")}>
            <div className="flex items-start gap-4">
              {/* Avatar */}
              <div className="relative flex-shrink-0">
                <div
                  className={cn(
                    "w-[56px] h-[56px] rounded-xl overflow-hidden bg-surface-light",
                    "ring-1 ring-border"
                  )}
                >
                  {requester.profile_photo ? (
                    <img
                      src={requester.profile_photo}
                      alt={name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="text-ink-pale text-base font-semibold">
                        {getInitials(name)}
                      </span>
                    </div>
                  )}
                </div>
                {isVerified && (
                  <div className="absolute -bottom-0.5 -right-0.5 w-[18px] h-[18px] rounded-full bg-brand flex items-center justify-center ring-2 ring-background">
                    <ShieldCheck className="w-2.5 h-2.5 text-white" strokeWidth={3} />
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[15px] font-semibold text-text-primary truncate">
                        {name}
                      </span>
                      {isVerified && (
                        <ShieldCheck
                          className="w-[14px] h-[14px] text-success flex-shrink-0"
                          strokeWidth={2.5}
                        />
                      )}
                    </div>
                    {displaySubtitle && (
                      <p className="text-xs text-text-secondary mt-0.5 truncate">
                        {displaySubtitle}
                      </p>
                    )}
                  </div>
                  <span className="text-[11px] text-text-muted whitespace-nowrap flex-shrink-0 mt-0.5">
                    {formatDistanceToNow(new Date(request.created_at), {
                      addSuffix: true,
                    })}
                  </span>
                </div>

                {/* Reason tag */}
                {isPending && !isHistory && !isSent && (
                  <div className="flex items-center gap-1.5 mt-2">
                    <ConnIcon className="w-3 h-3 text-brand" strokeWidth={1.5} />
                    <span className="text-[11px] text-text-secondary">{connLabel}</span>
                  </div>
                )}

                {/* Message preview */}
                {request.message && (
                  <div className="mt-2.5 px-3 py-2 rounded-lg bg-cream-soft border border-border-warm">
                    <p className="text-xs text-text-secondary leading-relaxed italic">
                      &ldquo;{request.message}&rdquo;
                    </p>
                  </div>
                )}

                {/* Action buttons — received pending */}
                {isPending && !isSent && !isHistory && (
                  <div className="flex gap-2.5 mt-3">
                    <button
                      onClick={handleReject}
                      disabled={isProcessing}
                      className={cn(
                        "flex-1 h-10 rounded-lg text-sm font-medium transition-all active:scale-[0.98]",
                        "border border-border bg-card text-text-secondary",
                        "hover:bg-error-light hover:text-error hover:border-error-border",
                        "disabled:opacity-40 disabled:cursor-not-allowed",
                        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
                      )}
                    >
                      {isProcessing ? "..." : "Decline"}
                    </button>
                    <button
                      onClick={handleAccept}
                      disabled={isProcessing}
                      className={cn(
                        "flex-1 h-10 rounded-lg text-sm font-medium transition-all active:scale-[0.98]",
                        "bg-foreground text-background",
                        "hover:bg-text-primary",
                        "disabled:opacity-40 disabled:cursor-not-allowed",
                        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
                      )}
                    >
                      {isProcessing ? "..." : "Accept"}
                    </button>
                  </div>
                )}

                {/* Accepted state */}
                {isAccepted && !isHistory && (
                  <div className="flex items-center justify-between mt-2.5">
                    <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-success-text">
                      <span className="w-1.5 h-1.5 rounded-full bg-success" />
                      Connected
                    </span>
                    <button
                      onClick={() => onViewProfile(requester)}
                      className="flex items-center gap-1 text-xs text-text-muted hover:text-text-secondary transition-colors"
                    >
                      View profile
                      <ChevronRight className="w-3 h-3" strokeWidth={1.5} />
                    </button>
                  </div>
                )}

                {/* Rejected state */}
                {isRejected && (
                  <span className="inline-flex items-center gap-1.5 mt-2.5 text-[11px] font-medium text-text-muted">
                    <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/40" />
                    Declined
                  </span>
                )}

                {/* Sent — pending */}
                {isSent && isPending && (
                  <div className="flex items-center gap-1.5 mt-2.5">
                    <Clock className="w-3 h-3 text-text-muted" strokeWidth={1.5} />
                    <span className="text-[11px] text-text-muted">Awaiting response</span>
                  </div>
                )}

                {/* Sent — accepted */}
                {isSent && isAccepted && (
                  <div className="flex items-center justify-between mt-2.5">
                    <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-success-text">
                      <span className="w-1.5 h-1.5 rounded-full bg-success" />
                      Accepted
                    </span>
                  </div>
                )}

                {/* History states */}
                {isHistory && (
                  <div className="mt-2.5">
                    {isAccepted && (
                      <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-success-text">
                        <span className="w-1.5 h-1.5 rounded-full bg-success" />
                        Connected
                      </span>
                    )}
                    {isRejected && (
                      <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-text-muted">
                        <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/40" />
                        Declined
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
