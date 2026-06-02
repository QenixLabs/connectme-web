"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AlertTriangle, Loader2 } from "lucide-react";

export type ModerationActionType =
  | "warning"
  | "suspension"
  | "ban"
  | "remove_verification"
  | "mark_safe";

interface ModerationActionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  actionType: ModerationActionType | null;
  onConfirm: (reason: string, duration?: number) => void;
  isLoading?: boolean;
}

const ACTION_LABELS: Record<ModerationActionType, string> = {
  warning: "Issue Warning",
  suspension: "Suspend User",
  ban: "Ban User",
  remove_verification: "Remove Verification",
  mark_safe: "Mark as Safe",
};

const ACTION_DESCRIPTIONS: Record<ModerationActionType, string> = {
  warning: "Send a formal warning to the user. This is recorded in their history.",
  suspension: "Temporarily suspend the user from accessing the platform.",
  ban: "Permanently ban the user. This cannot be undone without manual intervention.",
  remove_verification: "Reset the user's verification tier to 1.",
  mark_safe: "Close the report with no action taken against the user.",
};

const IS_DESTRUCTIVE: Record<ModerationActionType, boolean> = {
  warning: false,
  suspension: true,
  ban: true,
  remove_verification: true,
  mark_safe: false,
};

export function ModerationActionDialog({
  open,
  onOpenChange,
  actionType,
  onConfirm,
  isLoading,
}: ModerationActionDialogProps) {
  const [reason, setReason] = useState("");
  const [durationValue, setDurationValue] = useState("24");
  const [durationUnit, setDurationUnit] = useState<"hours" | "days">("hours");

  const handleConfirm = () => {
    if (!reason.trim()) return;
    let duration: number | undefined;
    if (actionType === "suspension") {
      const val = parseInt(durationValue, 10);
      if (durationUnit === "days") {
        duration = val * 24;
      } else {
        duration = val;
      }
    }
    onConfirm(reason.trim(), duration);
  };

  const handleClose = () => {
    onOpenChange(false);
    setReason("");
    setDurationValue("24");
    setDurationUnit("hours");
  };

  if (!actionType) return null;

  const isDestructive = IS_DESTRUCTIVE[actionType];

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {isDestructive && (
              <AlertTriangle className="w-4 h-4 text-destructive" />
            )}
            {ACTION_LABELS[actionType]}
          </DialogTitle>
          <DialogDescription>{ACTION_DESCRIPTIONS[actionType]}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {actionType === "suspension" && (
            <div className="space-y-2">
              <Label className="text-xs">Duration</Label>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  min={1}
                  value={durationValue}
                  onChange={(e) => setDurationValue(e.target.value)}
                  className="w-24"
                />
                <Select
                  value={durationUnit}
                  onValueChange={(v) => setDurationUnit(v as "hours" | "days")}
                >
                  <SelectTrigger className="w-28">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="hours">Hours</SelectItem>
                    <SelectItem value="days">Days</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label className="text-xs">Reason</Label>
            <Textarea
              placeholder="Explain why this action is being taken..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            variant={isDestructive ? "destructive" : "default"}
            onClick={handleConfirm}
            disabled={!reason.trim() || isLoading}
          >
            {isLoading && <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />}
            Confirm
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
