"use client";

import { Check, CheckCheck } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { formatTime } from "./utils";
import type { Message } from "@/lib/api/messages";
import { cn } from "@/lib/utils";

export type ClusterPosition = "single" | "first" | "middle" | "last";

interface MessageBubbleProps {
  message: Message;
  isOwn: boolean;
  currentUserId: string;
  clusterPosition: ClusterPosition;
  showAvatar: boolean;
}

function clusterRadius(isOwn: boolean, position: ClusterPosition): string {
  const own = {
    single: "rounded-2xl rounded-br-md",
    first: "rounded-t-2xl rounded-bl-2xl rounded-br-md",
    middle: "rounded-r-md rounded-l-2xl",
    last: "rounded-b-2xl rounded-tl-2xl rounded-tr-2xl rounded-br-md",
  };
  const other = {
    single: "rounded-2xl rounded-bl-md",
    first: "rounded-t-2xl rounded-br-2xl rounded-bl-md",
    middle: "rounded-l-md rounded-r-2xl",
    last: "rounded-b-2xl rounded-tr-2xl rounded-tl-2xl rounded-bl-md",
  };
  return isOwn ? own[position] : other[position];
}

function clusterMargin(position: ClusterPosition): string {
  switch (position) {
    case "single":
      return "mb-3";
    case "first":
      return "mb-0.5";
    case "middle":
      return "mb-0.5";
    case "last":
      return "mb-3";
  }
}

const MARKDOWN_COMPONENTS = {
  p: ({ children }: { children: React.ReactNode }) => (
    <p className="mb-1 last:mb-0">{children}</p>
  ),
  a: ({ href, children }: { href?: string; children: React.ReactNode }) => {
    const isCampaignLink = href?.startsWith("/talent/opportunities/");
    if (isCampaignLink) {
      return (
        <a
          href={href}
          className="inline-block px-3 py-1.5 bg-white/20 rounded-md text-xs font-medium no-underline hover:opacity-90 transition-opacity"
          target="_blank"
          rel="noopener noreferrer"
        >
          {children}
        </a>
      );
    }
    return (
      <a
        href={href}
        className="underline opacity-90 hover:opacity-100"
        target="_blank"
        rel="noopener noreferrer"
      >
        {children}
      </a>
    );
  },
  strong: ({ children }: { children: React.ReactNode }) => (
    <strong className="font-semibold">{children}</strong>
  ),
  em: ({ children }: { children: React.ReactNode }) => <em>{children}</em>,
  ul: ({ children }: { children: React.ReactNode }) => (
    <ul className="list-disc pl-4 mb-1">{children}</ul>
  ),
  ol: ({ children }: { children: React.ReactNode }) => (
    <ol className="list-decimal pl-4 mb-1">{children}</ol>
  ),
  li: ({ children }: { children: React.ReactNode }) => (
    <li className="mb-0.5">{children}</li>
  ),
  code: ({ children }: { children: React.ReactNode }) => (
    <code className="bg-black/10 rounded px-1 py-0.5 text-xs">{children}</code>
  ),
  pre: ({ children }: { children: React.ReactNode }) => (
    <pre className="bg-black/10 rounded p-2 overflow-x-auto text-xs mb-1">
      {children}
    </pre>
  ),
  blockquote: ({ children }: { children: React.ReactNode }) => (
    <blockquote className="border-l-2 border-current pl-2 opacity-80 italic mb-1">
      {children}
    </blockquote>
  ),
  h1: ({ children }: { children: React.ReactNode }) => (
    <h1 className="text-base font-semibold mb-1">{children}</h1>
  ),
  h2: ({ children }: { children: React.ReactNode }) => (
    <h2 className="text-sm font-semibold mb-1">{children}</h2>
  ),
  h3: ({ children }: { children: React.ReactNode }) => (
    <h3 className="text-sm font-medium mb-1">{children}</h3>
  ),
};

export function MessageBubble({
  message,
  isOwn,
  currentUserId,
  clusterPosition,
  showAvatar,
}: MessageBubbleProps) {
  const hasFailed = message.status === "failed";
  const hasBeenRead =
    isOwn &&
    message.status !== "failed" &&
    message.read_by?.some((id) => id !== currentUserId);

  return (
    <div
      className={cn(
        "flex gap-2 animate-in fade-in slide-in-from-bottom-1 duration-200",
        isOwn ? "flex-row-reverse" : "flex-row",
        clusterMargin(clusterPosition),
      )}
      style={{ animationFillMode: "both" }}
    >
      {!isOwn && (
          <div
            className={cn(
              "w-7 h-7 rounded-full bg-cream border border-border flex items-center justify-center flex-shrink-0 select-none",
              showAvatar ? "opacity-100" : "opacity-0 pointer-events-none",
            )}
            style={{ marginTop: clusterPosition === "last" || clusterPosition === "single" ? 2 : 0 }}
          >
            <span className="text-[9px] font-semibold text-ink-soft">
              {message.sender_id?.email?.[0]?.toUpperCase() || "?"}
            </span>
          </div>
      )}

      <div className={cn("max-w-[72%] md:max-w-[60%]", isOwn && "items-end flex flex-col")}>
          <div
            className={cn(
              "px-3.5 py-2.5 text-[13px] leading-relaxed transition-all duration-150",
              isOwn
                ? "bg-gradient-to-br from-gold to-gold-dark text-white shadow-md shadow-gold/10"
                : "bg-card text-ink border border-border shadow-sm",
              clusterRadius(isOwn, clusterPosition),
              hasFailed && "opacity-70",
            )}
          >
          <ReactMarkdown
            disallowedElements={[
              "img",
              "script",
              "style",
              "iframe",
              "object",
              "embed",
              "form",
              "input",
            ]}
            unwrapDisallowed
            components={MARKDOWN_COMPONENTS as any}
          >
            {message.content}
          </ReactMarkdown>
        </div>

        {(clusterPosition === "single" || clusterPosition === "last") && (
          <div
            className={cn(
              "flex items-center gap-1 mt-1 px-0.5",
              isOwn ? "justify-end" : "justify-start",
            )}
          >
            <span className="text-[10px] text-ink-muted select-none">
              {formatTime(message.created_at)}
            </span>
            {hasFailed && (
              <span className="text-[10px] text-red-500 font-medium select-none">
                Failed
              </span>
            )}
            {isOwn && !hasFailed && (
              <span className="inline-flex items-center">
                {hasBeenRead ? (
                  <CheckCheck className="w-3 h-3 text-emerald-500" strokeWidth={2.5} />
                ) : (
                  <Check className="w-3 h-3 text-ink-muted" strokeWidth={2.5} />
                )}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
