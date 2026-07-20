"use client";

import { Calendar, MessageSquareText, HelpCircle } from "lucide-react";
import type { EnrichedApplication } from "../campaign-application-card";

interface ApplicationDetailTabProps {
  application: EnrichedApplication;
}

export function ApplicationDetailTab({ application }: ApplicationDetailTabProps) {
  return (
    <div className="space-y-5 py-1">
      {/* Applied date */}
      <div className="flex items-center gap-2.5 text-sm">
        <Calendar className="w-4 h-4 text-ink-muted shrink-0" strokeWidth={1.5} />
        <span className="text-ink-soft">
          Applied on{" "}
          {new Date(application.created_at).toLocaleDateString("en-US", {
            month: "long",
            day: "numeric",
            year: "numeric",
          })}
        </span>
      </div>

      {/* Status */}
      <div className="flex items-center gap-2.5 text-sm">
        <span
          className="w-2.5 h-2.5 rounded-full shrink-0"
          style={{
            backgroundColor:
              application.status === "pending"
                ? "#f59e0b"
                : application.status === "accepted"
                  ? "#10b981"
                  : "#ef4444",
          }}
        />
        <span className="text-ink-soft capitalize font-medium">{application.status}</span>
      </div>

      {/* Application message */}
      {application.message && (
        <div className="space-y-2">
          <label className="text-[11px] font-semibold uppercase tracking-[0.08em] text-ink-muted flex items-center gap-1.5">
            <MessageSquareText className="w-3 h-3" strokeWidth={1.5} />
            Cover Message
          </label>
          <div className="rounded-xl border border-border/60 bg-muted-bg/30 p-4 text-sm text-ink-soft leading-relaxed whitespace-pre-wrap">
            {application.message}
          </div>
        </div>
      )}

      {/* Screening answers */}
      {application.answers && application.answers.length > 0 && (
        <div className="space-y-3">
          <label className="text-[11px] font-semibold uppercase tracking-[0.08em] text-ink-muted flex items-center gap-1.5">
            <HelpCircle className="w-3 h-3" strokeWidth={1.5} />
            Screening Questions
          </label>
          {application.answers.map((answer, i) => (
            <div
              key={answer.question_id || i}
              className="rounded-xl border border-border/60 bg-muted-bg/30 p-4"
            >
              <p className="text-xs font-semibold text-ink mb-2">
                {answer.question_text}
              </p>
              <p className="text-sm text-ink-soft leading-relaxed whitespace-pre-wrap">
                {answer.answer}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Empty state */}
      {!application.message && (!application.answers || application.answers.length === 0) && (
        <div className="text-center py-8">
          <MessageSquareText className="w-10 h-10 text-ink-muted/30 mx-auto mb-3" strokeWidth={1.5} />
          <p className="text-sm text-ink-muted">No application message or screening answers.</p>
        </div>
      )}
    </div>
  );
}
