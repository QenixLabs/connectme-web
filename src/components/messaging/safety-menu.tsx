"use client";

import { useState } from "react";
import {
  Shield,
  AlertTriangle,
  Ban,
  Mail,
  ChevronRight,
} from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { messagesApi } from "@/lib/api/messages";
import { usePopup } from "@/hooks/use-popup";

interface SafetyMenuProps {
  otherUserId: string;
  otherUserName: string;
  conversationId?: string;
  onBlocked?: () => void;
}

const REPORT_REASONS = [
  "Harassment or bullying",
  "Spam or scam",
  "Inappropriate content",
  "Impersonation",
  "Other",
];

export function SafetyMenu({
  otherUserId,
  otherUserName,
  conversationId,
  onBlocked,
}: SafetyMenuProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [blockOpen, setBlockOpen] = useState(false);
  const [reportReason, setReportReason] = useState("");
  const [reportDetails, setReportDetails] = useState("");
  const [consentChecked, setConsentChecked] = useState(false);
  const [showConsentHint, setShowConsentHint] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { show } = usePopup();

  const handleReport = async () => {
    if (!reportReason) return;
    if (!consentChecked) {
      setShowConsentHint(true);
      setTimeout(() => setShowConsentHint(false), 2000);
      return;
    }
    setIsSubmitting(true);
    try {
      await messagesApi.reportUser({
        reported_id: otherUserId,
        reason: reportReason,
        details: reportDetails,
        conversation_id: conversationId,
      });
      show({ title: "Report submitted", variant: "success", position: "top-right" });
      setReportOpen(false);
      setReportReason("");
      setReportDetails("");
      setConsentChecked(false);
    } catch {
      show({ title: "Failed to submit report", variant: "error", position: "top-right" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBlock = async () => {
    setIsSubmitting(true);
    try {
      await messagesApi.blockUser(otherUserId);
      show({ title: `${otherUserName} blocked`, variant: "success", position: "top-right" });
      setBlockOpen(false);
      onBlocked?.();
    } catch {
      show({ title: "Failed to block user", variant: "error", position: "top-right" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {/* Trigger button */}
      <button
        onClick={() => setMenuOpen(true)}
        className="p-1.5 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
      >
        <Shield className="w-4 h-4" strokeWidth={1.5} />
      </button>

      {/* Safety Menu Dialog */}
      <Dialog open={menuOpen} onOpenChange={setMenuOpen}>
        <DialogContent className="sm:max-w-sm p-0 overflow-hidden">
          <DialogHeader className="p-5 pb-3">
            <DialogTitle className="text-base font-semibold text-center">
              Safety &amp; Reporting
            </DialogTitle>
          </DialogHeader>

          <div className="px-5 pb-5 space-y-2">
            <div className="flex items-center gap-3 p-3 rounded-xl bg-[#f5f3ef] border border-[#e0d9ce]">
              <Shield className="w-5 h-5 text-[#c8a040] shrink-0" strokeWidth={1.5} />
              <span className="text-sm text-[#5c5145]">
                Your safety and privacy are our priority.
              </span>
            </div>

            <button
              onClick={() => {
                setMenuOpen(false);
                setReportOpen(true);
              }}
              className="w-full flex items-center justify-between p-3 rounded-xl bg-card border border-border hover:bg-muted transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-red-50 flex items-center justify-center">
                  <AlertTriangle className="w-4 h-4 text-red-500" strokeWidth={1.5} />
                </div>
                <span className="text-sm font-medium">Report User</span>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground" strokeWidth={1.5} />
            </button>

            <button
              onClick={() => {
                setMenuOpen(false);
                setBlockOpen(true);
              }}
              className="w-full flex items-center justify-between p-3 rounded-xl bg-card border border-border hover:bg-muted transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-red-50 flex items-center justify-center">
                  <Ban className="w-4 h-4 text-red-500" strokeWidth={1.5} />
                </div>
                <span className="text-sm font-medium">Block User</span>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground" strokeWidth={1.5} />
            </button>

            <button
              onClick={() => {
                setMenuOpen(false);
                window.location.href = "mailto:support@connectme.com";
              }}
              className="w-full flex items-center justify-between p-3 rounded-xl bg-card border border-border hover:bg-muted transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-amber-50 flex items-center justify-center">
                  <Mail className="w-4 h-4 text-amber-500" strokeWidth={1.5} />
                </div>
                <span className="text-sm font-medium">Contact Support</span>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground" strokeWidth={1.5} />
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Report Dialog */}
      <Dialog open={reportOpen} onOpenChange={(open) => {
        setReportOpen(open);
        if (!open) {
          setReportReason("");
          setReportDetails("");
          setConsentChecked(false);
        }
      }}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-base font-semibold">Report {otherUserName}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            {conversationId && (
              <div className="flex items-start gap-2.5 p-3 rounded-lg bg-amber-50 border border-amber-200">
                <Shield className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" strokeWidth={1.5} />
                <p className="text-xs text-amber-800 leading-relaxed">
                  The last 20 messages from this conversation will be shared with our moderation team for review.
                </p>
              </div>
            )}
            <div className="space-y-2">
              {REPORT_REASONS.map((reason) => (
                <button
                  key={reason}
                  onClick={() => setReportReason(reason)}
                  className={`w-full text-left px-3 py-2.5 rounded-lg text-sm border transition-colors ${
                    reportReason === reason
                      ? "border-[#c8a040] bg-[#fdf3dc] text-[#1e1a14]"
                      : "border-border hover:bg-muted"
                  }`}
                >
                  {reason}
                </button>
              ))}
            </div>
            <Textarea
              placeholder="Add details (optional)"
              value={reportDetails}
              onChange={(e) => setReportDetails(e.target.value)}
              className="text-sm min-h-[80px]"
            />
            <div className={`flex items-start gap-2.5 rounded-md transition-all ${showConsentHint ? 'bg-red-50 ring-2 ring-red-400 ring-offset-1 p-1.5 -m-1' : ''}`}>
              <Checkbox
                id="report-consent"
                checked={consentChecked}
                onCheckedChange={(checked) => {
                  setConsentChecked(checked === true);
                  if (checked) setShowConsentHint(false);
                }}
                className="mt-0.5"
              />
              <label htmlFor="report-consent" className={`text-xs leading-relaxed cursor-pointer ${showConsentHint ? 'text-red-700 font-medium' : 'text-muted-foreground'}`}>
                I understand and consent to sharing these messages
              </label>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setReportOpen(false)}
              >
                Cancel
              </Button>
              <Button
                className="flex-1 bg-[#1e1a14] hover:bg-[#2a2520]"
                onClick={handleReport}
                disabled={!reportReason || isSubmitting}
                isLoading={isSubmitting}
              >
                Submit
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Block Dialog */}
      <Dialog open={blockOpen} onOpenChange={setBlockOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-base font-semibold">Block {otherUserName}?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            They won&apos;t be able to message you and you won&apos;t see their messages. You can unblock them later.
          </p>
          <div className="flex gap-2 mt-4">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setBlockOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              className="flex-1"
              onClick={handleBlock}
              disabled={isSubmitting}
              isLoading={isSubmitting}
            >
              Block
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
