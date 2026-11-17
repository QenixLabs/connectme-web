"use client";

import { useState } from "react";
import { Flag } from "lucide-react";
import { toast } from "sonner";
import { conversationsApi } from "@/lib/api";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export function ReportProfileButton({
  userId,
  name,
  className,
  asMenuItem = false,
}: {
  userId: string;
  name: string;
  className?: string;
  asMenuItem?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [details, setDetails] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function submit() {
    if (!reason.trim() || submitting) return;
    setSubmitting(true);
    try {
      await conversationsApi.reportUser({
        reported_id: userId,
        reason: reason.trim(),
        details: details.trim() || undefined,
      });
      toast.success("Report submitted for review");
      setOpen(false);
      setReason("");
      setDetails("");
    } catch {
      toast.error("Could not submit report. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      {asMenuItem ? (
        <DropdownMenuItem
          onSelect={(event) => {
            event.preventDefault();
            setOpen(true);
          }}
          className="cursor-pointer text-destructive"
        >
          <Flag className="mr-2 size-4" />
          Report
        </DropdownMenuItem>
      ) : (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className={className}
          onClick={() => setOpen(true)}
          aria-label={`Report ${name}`}
        >
          <Flag className="mr-1.5 size-4" />
          Report
        </Button>
      )}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Report {name}</DialogTitle>
            <DialogDescription>
              Our team will review your report and take appropriate action.
            </DialogDescription>
          </DialogHeader>
          <Textarea
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            placeholder="Reason for report"
            maxLength={500}
            aria-label="Report reason"
          />
          <Textarea
            value={details}
            onChange={(event) => setDetails(event.target.value)}
            placeholder="Additional details (optional)"
            maxLength={2000}
            aria-label="Additional details"
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={submit} disabled={!reason.trim() || submitting}>
              {submitting ? "Submitting…" : "Submit report"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
