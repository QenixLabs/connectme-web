"use client";

import { Check } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { formatTime } from "./utils";
import type { Message } from "@/lib/api/messages";
import { cn } from "@/lib/utils";

interface MessageBubbleProps {
  message: Message;
  isOwn: boolean;
  currentUserId: string;
}

export function MessageBubble({
  message,
  isOwn,
  currentUserId,
}: MessageBubbleProps) {
  return (
    <div
      className={cn(
        "flex items-end gap-1.5 mb-1.5 animate-in fade-in slide-in-from-bottom-2 duration-200",
        isOwn ? "justify-end" : "justify-start",
      )}
    >
      <div className="max-w-[78%]">
        <div
          className={cn(
            "px-3.5 py-2.5 text-[13px] leading-relaxed shadow-sm",
            isOwn
              ? "bg-gradient-to-br from-msg-gold to-[#b08d38] text-white"
              : "bg-msg-card text-msg-ink border border-msg-border",
          )}
          style={{
            borderRadius: isOwn
              ? "16px 16px 4px 16px"
              : "16px 16px 16px 4px",
          }}
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
            components={{
              p: ({ children }) => (
                <p className="mb-1 last:mb-0">{children}</p>
              ),
              a: ({ href, children }) => {
                const isCampaignLink = href?.startsWith("/talent/opportunities/");
                if (isCampaignLink) {
                  return (
                    <a
                      href={href}
                      className="inline-block px-3 py-1.5 bg-white/20 text-white rounded-md text-xs font-medium no-underline hover:opacity-90 transition-opacity"
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
              strong: ({ children }) => (
                <strong className="font-semibold">{children}</strong>
              ),
              em: ({ children }) => <em>{children}</em>,
              ul: ({ children }) => (
                <ul className="list-disc pl-4 mb-1">{children}</ul>
              ),
              ol: ({ children }) => (
                <ol className="list-decimal pl-4 mb-1">{children}</ol>
              ),
              li: ({ children }) => <li className="mb-0.5">{children}</li>,
              code: ({ children }) => (
                <code className="bg-black/10 rounded px-1 py-0.5 text-xs">
                  {children}
                </code>
              ),
              pre: ({ children }) => (
                <pre className="bg-black/10 rounded p-2 overflow-x-auto text-xs mb-1">
                  {children}
                </pre>
              ),
              blockquote: ({ children }) => (
                <blockquote className="border-l-2 border-current pl-2 opacity-80 italic mb-1">
                  {children}
                </blockquote>
              ),
              h1: ({ children }) => (
                <h1 className="text-base font-semibold mb-1">{children}</h1>
              ),
              h2: ({ children }) => (
                <h2 className="text-sm font-semibold mb-1">{children}</h2>
              ),
              h3: ({ children }) => (
                <h3 className="text-sm font-medium mb-1">{children}</h3>
              ),
            }}
          >
            {message.content}
          </ReactMarkdown>
        </div>
        <div
          className={cn(
            "text-2xs text-msg-ink-muted mt-0.5 flex items-center gap-1",
            isOwn ? "justify-end" : "justify-start",
          )}
        >
          {formatTime(message.created_at)}
          {isOwn && message.status === "failed" && (
            <span className="text-red-500 text-2xs">Failed</span>
          )}
          {isOwn && message.status !== "failed" && (
            <span className="inline-flex items-center">
              {message.read_by?.some((id) => id !== currentUserId) ? (
                <span className="inline-flex items-center text-emerald-600">
                  <Check className="w-2.5 h-2.5" strokeWidth={3} />
                  <Check className="w-2.5 h-2.5 -ml-1.5" strokeWidth={3} />
                </span>
              ) : (
                <Check
                  className="w-2.5 h-2.5 text-msg-ink-muted"
                  strokeWidth={3}
                />
              )}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
