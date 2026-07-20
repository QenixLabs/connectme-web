"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { CollaborationReason } from "@/components/requests/request-card";
import { CONNECTION_CONFIG } from "@/components/requests/request-card";

interface ConnectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  recipientName: string;
  onConnect: (reason: CollaborationReason) => void;
  isSending?: boolean;
}

const REASONS: CollaborationReason[] = ["collaboration", "mentorship", "referral"];

export function ConnectDialog({
  open,
  onOpenChange,
  recipientName,
  onConnect,
  isSending,
}: ConnectDialogProps) {
  const [reason, setReason] = useState<CollaborationReason | null>(null);

  const handleConnect = () => {
    if (!reason) return;
    onConnect(reason);
    setReason(null);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Connect with {recipientName}</DialogTitle>
          <DialogDescription>
            Select why you'd like to connect with {recipientName}. They can accept
            or reject your request.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-2">
          {REASONS.map((r) => {
            const { icon: Icon, label } = CONNECTION_CONFIG[r];
            const isSelected = reason === r;
            return (
              <button
                key={r}
                type="button"
                onClick={() => setReason(r)}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-3 rounded-xl border text-left transition-all",
                  isSelected
                    ? "border-brand bg-brand/5 text-text-primary ring-1 ring-brand/30"
                    : "border-border bg-card text-text-secondary hover:border-border-warm hover:bg-cream-soft"
                )}
              >
                <Icon className="h-4 w-4 flex-shrink-0" />
                <span className="text-sm font-medium">{label}</span>
              </button>
            );
          })}
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => {
              onOpenChange(false);
              setReason(null);
            }}
            disabled={isSending}
          >
            Cancel
          </Button>
          <Button
            onClick={handleConnect}
            disabled={isSending || !reason}
            className="bg-gradient-to-b from-[oklch(0.78_0.13_80)] to-[oklch(0.68_0.13_78)] text-white"
          >
            {isSending ? "Sending..." : "Send Request"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
