"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Shield, Lock, FileText, Loader2, AlertTriangle } from "lucide-react";

interface TaskNDAModalProps {
  campaignName: string;
  ndaText: string;
  isAccepting: boolean;
  isDeclining: boolean;
  onAccept: () => void;
  onDecline: () => void;
}

export function TaskNDAModal({
  campaignName,
  ndaText,
  isAccepting,
  isDeclining,
  onAccept,
  onDecline,
}: TaskNDAModalProps) {
  const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false);
  const [acceptEnabled, setAcceptEnabled] = useState(false);
  const viewportRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hasScrolledRef = useRef(false);

  const enableAccept = useCallback(() => {
    timerRef.current = setTimeout(() => {
      setAcceptEnabled(true);
    }, 2000);
  }, []);

  const handleScroll = useCallback(() => {
    const el = viewportRef.current;
    if (!el || hasScrolledRef.current) return;

    const isAtBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 5;
    if (isAtBottom) {
      hasScrolledRef.current = true;
      setHasScrolledToBottom(true);
      enableAccept();
    }
  }, [enableAccept]);

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, []);

  return (
    <div className="rounded-2xl border bg-card shadow-sm flex flex-col">
      <div className="px-6 pt-6 pb-4 shrink-0">
        <div className="flex items-center gap-3 mb-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-soft">
            <Shield className="h-5 w-5 text-amber-foreground" strokeWidth={1.5} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-foreground">
              Non-Disclosure Agreement
            </h2>
            <p className="text-sm text-muted-foreground">
              {campaignName}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 rounded-lg bg-amber-soft/50 px-3 py-2 text-xs text-amber-foreground/80">
          <Lock className="h-3 w-3" />
          Read and accept to view the assigned task
        </div>
      </div>

      <div
        ref={viewportRef}
        onScroll={handleScroll}
        className="h-64 overflow-auto border-y"
      >
        <div className="px-6 py-5">
          <div className="flex items-center gap-2 mb-3 text-xs text-muted-foreground">
            <FileText className="h-3.5 w-3.5" />
            Agreement Terms
          </div>
          <pre className="whitespace-pre-wrap font-sans text-sm text-foreground/85 leading-relaxed select-text">
            {ndaText}
          </pre>
        </div>
      </div>

      {!hasScrolledToBottom && (
        <div className="px-6 py-2 text-center text-xs text-muted-foreground shrink-0">
          Scroll to bottom to continue
        </div>
      )}

      <div className="px-6 pb-6 pt-3 shrink-0 space-y-3">
        <Button
          onClick={onAccept}
          disabled={!acceptEnabled || isAccepting}
          className="w-full h-11 rounded-xl font-semibold"
          variant={acceptEnabled ? "default" : "outline"}
        >
          {isAccepting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Accepting...
            </>
          ) : !acceptEnabled ? (
            <>
              <Lock className="mr-2 h-4 w-4" />
              Scroll to bottom & wait to accept
            </>
          ) : (
            "I Agree"
          )}
        </Button>

        <div className="flex items-start gap-2 rounded-lg bg-destructive/10 border border-destructive/20 px-3 py-2.5 text-xs text-destructive">
          <AlertTriangle className="h-3.5 w-3.5 mt-0.5 shrink-0" />
          <span>
            If you decline, your application will be withdrawn. This cannot be undone.
          </span>
        </div>

        <Button
          onClick={onDecline}
          disabled={isDeclining || isAccepting}
          className="w-full h-10 rounded-xl font-medium"
          variant="outline"
        >
          {isDeclining ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Declining...
            </>
          ) : (
            "Decline NDA"
          )}
        </Button>
      </div>
    </div>
  );
}
