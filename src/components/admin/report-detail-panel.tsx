"use client";

import { useEffect, useState } from "react";
import { X, Loader2, AlertCircle, Shield, Clock, CheckCircle, History } from "lucide-react";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { adminApi, type ReportDetail, type ReportItem } from "@/lib/api";
import { getApiErrorMessage } from "@/lib/formatters";
import { MessageContextViewer } from "./message-context-viewer";
import { ModerationActionDialog, type ModerationActionType } from "./moderation-action-dialog";
import { UserHistoryModal } from "./user-history-modal";

interface ReportDetailPanelProps {
  reportId: string | null;
  onClose: () => void;
  onStatusChange?: (reportId: string, newStatus: string) => void;
  onActionTaken?: (reportId: string, action: string) => void;
}

const STATUS_OPTIONS = ["pending", "under_review", "resolved", "rejected"];
const PRIORITY_OPTIONS = ["low", "medium", "high"];

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-amber-100 text-amber-800 border-amber-200",
  under_review: "bg-blue-100 text-blue-800 border-blue-200",
  resolved: "bg-emerald-100 text-emerald-800 border-emerald-200",
  rejected: "bg-slate-100 text-slate-800 border-slate-200",
};

const PRIORITY_COLORS: Record<string, string> = {
  low: "bg-slate-100 text-slate-700 border-slate-200",
  medium: "bg-amber-100 text-amber-700 border-amber-200",
  high: "bg-rose-100 text-rose-700 border-rose-200",
};

function getDisplayName(user: ReportItem["reported_id"]) {
  return (
    user?.full_legal_name ||
    user?.company_name ||
    user?.username ||
    user?.email ||
    "Unknown"
  );
}

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function ReportDetailPanel({
  reportId,
  onClose,
  onStatusChange,
  onActionTaken,
}: ReportDetailPanelProps) {
  const [detail, setDetail] = useState<ReportDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [updatingPriority, setUpdatingPriority] = useState(false);
  const [savingNotes, setSavingNotes] = useState(false);
  const [notes, setNotes] = useState("");
  const [actionDialogOpen, setActionDialogOpen] = useState(false);
  const [selectedAction, setSelectedAction] = useState<ModerationActionType | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [historyUserId, setHistoryUserId] = useState<string | null>(null);

  useEffect(() => {
    if (!reportId) {
      setDetail(null);
      setError(null);
      setNotes("");
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    adminApi
      .getReportById(reportId)
      .then((res) => {
        if (!cancelled) {
          setDetail(res);
          setNotes(res.report.admin_notes || "");
        }
      })
      .catch((err) => {
        if (!cancelled) setError(getApiErrorMessage(err, "Failed to load report details"));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [reportId]);

  const handleStatusChange = async (newStatus: string) => {
    if (!detail) return;
    setUpdatingStatus(true);
    try {
      await adminApi.updateReportStatus(detail.report._id, newStatus, notes);
      setDetail((prev) =>
        prev ? { ...prev, report: { ...prev.report, status: newStatus } } : prev
      );
      onStatusChange?.(detail.report._id, newStatus);
    } catch (err) {
      setError(getApiErrorMessage(err, "Failed to update status"));
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handlePriorityChange = async (newPriority: string) => {
    if (!detail) return;
    setUpdatingPriority(true);
    try {
      await adminApi.updateReportPriority(detail.report._id, newPriority);
      setDetail((prev) =>
        prev ? { ...prev, report: { ...prev.report, priority: newPriority } } : prev
      );
    } catch (err) {
      setError(getApiErrorMessage(err, "Failed to update priority"));
    } finally {
      setUpdatingPriority(false);
    }
  };

  const handleSaveNotes = async () => {
    if (!detail) return;
    setSavingNotes(true);
    try {
      await adminApi.updateReportNotes(detail.report._id, notes);
      setDetail((prev) =>
        prev ? { ...prev, report: { ...prev.report, admin_notes: notes } } : prev
      );
    } catch (err) {
      setError(getApiErrorMessage(err, "Failed to save notes"));
    } finally {
      setSavingNotes(false);
    }
  };

  const handleAction = async (reason: string, duration?: number) => {
    if (!detail || !selectedAction) return;
    setActionLoading(true);
    try {
      await adminApi.takeReportAction(
        detail.report._id,
        selectedAction,
        reason,
        duration
      );
      setDetail((prev) =>
        prev
          ? {
              ...prev,
              report: {
                ...prev.report,
                status: selectedAction === "mark_safe" ? "resolved" : prev.report.status,
                action_taken: selectedAction,
                resolved_at:
                  selectedAction === "mark_safe"
                    ? new Date().toISOString()
                    : prev.report.resolved_at,
              },
            }
          : prev
      );
      onActionTaken?.(detail.report._id, selectedAction);
      setActionDialogOpen(false);
      setSelectedAction(null);
    } catch (err) {
      setError(getApiErrorMessage(err, "Failed to take action"));
    } finally {
      setActionLoading(false);
    }
  };

  const openAction = (action: ModerationActionType) => {
    setSelectedAction(action);
    setActionDialogOpen(true);
  };

  const openHistory = (userId: string) => {
    setHistoryUserId(userId);
    setHistoryOpen(true);
  };

  return (
    <>
      <Sheet open={!!reportId} onOpenChange={(open) => !open && onClose()}>
        <SheetContent className="sm:max-w-[720px] w-full p-0 overflow-hidden">
          <SheetHeader className="p-5 border-b border-border">
            <div className="flex items-center justify-between">
              <SheetTitle className="text-base font-semibold">Report Detail</SheetTitle>
              <button
                onClick={onClose}
                className="p-1.5 rounded-md hover:bg-muted transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </SheetHeader>

          <div className="flex flex-col h-[calc(100vh-73px)] overflow-hidden">
            {loading && (
              <div className="flex-1 flex items-center justify-center">
                <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
              </div>
            )}

            {error && !loading && (
              <div className="p-5">
                <Alert variant="destructive">
                  <AlertCircle className="w-4 h-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              </div>
            )}

            {!loading && !error && detail && (
              <>
                <div className="flex-1 overflow-y-auto">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-0 divide-y md:divide-y-0 md:divide-x divide-border">
                    {/* Left column */}
                    <div className="p-5 space-y-5">
                      {/* Users */}
                      <div className="space-y-4">
                        <UserCard
                          label="Reported User"
                          user={detail.report.reported_id}
                          color="rose"
                          onViewHistory={() => openHistory(detail.report.reported_id._id)}
                        />
                        <UserCard
                          label="Reporter"
                          user={detail.report.reporter_id}
                          color="blue"
                          onViewHistory={() => openHistory(detail.report.reporter_id._id)}
                        />
                      </div>

                      {/* Status + Priority */}
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-muted-foreground">Status</span>
                          <Select
                            value={detail.report.status}
                            onValueChange={handleStatusChange}
                            disabled={updatingStatus}
                          >
                            <SelectTrigger className="w-32 text-xs h-8">
                              <Badge
                                variant="outline"
                                className={`text-[10px] px-1.5 py-0 ${STATUS_COLORS[detail.report.status] || ""}`}
                              >
                                {detail.report.status}
                              </Badge>
                            </SelectTrigger>
                            <SelectContent>
                              {STATUS_OPTIONS.map((s) => (
                                <SelectItem key={s} value={s} className="text-xs capitalize">
                                  {s.replace("_", " ")}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="text-xs text-muted-foreground">Priority</span>
                          <Select
                            value={detail.report.priority}
                            onValueChange={handlePriorityChange}
                            disabled={updatingPriority}
                          >
                            <SelectTrigger className="w-32 text-xs h-8">
                              <Badge
                                variant="outline"
                                className={`text-[10px] px-1.5 py-0 ${PRIORITY_COLORS[detail.report.priority] || ""}`}
                              >
                                {detail.report.priority}
                              </Badge>
                            </SelectTrigger>
                            <SelectContent>
                              {PRIORITY_OPTIONS.map((p) => (
                                <SelectItem key={p} value={p} className="text-xs capitalize">
                                  {p}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      {/* Details */}
                      <div className="space-y-3">
                        <div>
                          <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium mb-1">
                            Reason
                          </p>
                          <p className="text-sm">{detail.report.reason}</p>
                        </div>

                        {detail.report.details && (
                          <div>
                            <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium mb-1">
                              Details
                            </p>
                            <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                              {detail.report.details}
                            </p>
                          </div>
                        )}

                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div>
                            <p className="text-[10px] text-muted-foreground">Reported At</p>
                            <p>{new Date(detail.report.created_at).toLocaleString()}</p>
                          </div>
                          {detail.report.reviewed_at && (
                            <div>
                              <p className="text-[10px] text-muted-foreground">Reviewed At</p>
                              <p>{new Date(detail.report.reviewed_at).toLocaleString()}</p>
                            </div>
                          )}
                          {detail.report.resolved_at && (
                            <div>
                              <p className="text-[10px] text-muted-foreground">Resolved At</p>
                              <p>{new Date(detail.report.resolved_at).toLocaleString()}</p>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Admin Notes */}
                      <div className="space-y-2">
                        <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">
                          Admin Notes
                        </p>
                        <Textarea
                          value={notes}
                          onChange={(e) => setNotes(e.target.value)}
                          placeholder="Add internal notes..."
                          rows={3}
                          className="text-sm"
                        />
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={handleSaveNotes}
                          disabled={savingNotes}
                          className="text-xs"
                        >
                          {savingNotes && (
                            <Loader2 className="w-3 h-3 animate-spin mr-1.5" />
                          )}
                          Save Notes
                        </Button>
                      </div>
                    </div>

                    {/* Right column */}
                    <div className="p-5 space-y-4">
                      <div className="flex items-center gap-2">
                        <Shield className="w-4 h-4 text-muted-foreground" strokeWidth={1.5} />
                        <h3 className="text-sm font-medium">Message Context</h3>
                      </div>

                      <MessageContextViewer
                        reportedMessage={detail.reportedMessage}
                        previousMessages={detail.previousMessages}
                        nextMessages={detail.nextMessages}
                        reportedUserId={detail.report.reported_id._id}
                      />
                    </div>
                  </div>
                </div>

                {/* Bottom action bar */}
                <div className="border-t border-border p-4 bg-muted/30">
                  <div className="flex flex-wrap items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => openAction("warning")}
                      className="text-xs"
                    >
                      <AlertCircle className="w-3.5 h-3.5 mr-1.5" />
                      Warn
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => openAction("suspension")}
                      className="text-xs"
                    >
                      <Clock className="w-3.5 h-3.5 mr-1.5" />
                      Suspend
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => openAction("ban")}
                      className="text-xs"
                    >
                      <Shield className="w-3.5 h-3.5 mr-1.5" />
                      Ban
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => openAction("remove_verification")}
                      className="text-xs"
                    >
                      Remove Verification
                    </Button>
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => openAction("mark_safe")}
                      className="text-xs"
                    >
                      <CheckCircle className="w-3.5 h-3.5 mr-1.5" />
                      Mark Safe
                    </Button>
                    <div className="flex-1" />
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleStatusChange("resolved")}
                      disabled={updatingStatus}
                      className="text-xs"
                    >
                      <CheckCircle className="w-3.5 h-3.5 mr-1.5" />
                      Close Report
                    </Button>
                  </div>
                </div>
              </>
            )}
          </div>
        </SheetContent>
      </Sheet>

      <ModerationActionDialog
        open={actionDialogOpen}
        onOpenChange={setActionDialogOpen}
        actionType={selectedAction}
        onConfirm={handleAction}
        isLoading={actionLoading}
      />

      <UserHistoryModal
        open={historyOpen}
        onOpenChange={setHistoryOpen}
        userId={historyUserId}
      />
    </>
  );
}

function UserCard({
  label,
  user,
  color,
  onViewHistory,
}: {
  label: string;
  user: ReportItem["reported_id"];
  color: "rose" | "blue";
  onViewHistory: () => void;
}) {
  const bgColor = color === "rose" ? "bg-rose-100 text-rose-700" : "bg-blue-100 text-blue-700";

  return (
    <div className="space-y-2">
      <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">
        {label}
      </p>
      <div className="flex items-center gap-3">
        <div
          className={`w-9 h-9 rounded-full ${bgColor} flex items-center justify-center text-xs font-semibold shrink-0`}
        >
          {getInitials(getDisplayName(user))}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium truncate">{getDisplayName(user)}</p>
          <p className="text-xs text-muted-foreground truncate">{user.email}</p>
          <div className="flex items-center gap-1.5 mt-0.5">
            <Badge variant="outline" className="text-[10px] px-1 py-0 capitalize">
              {user.role || "Unknown"}
            </Badge>
            <button
              onClick={onViewHistory}
              className="text-[10px] text-muted-foreground hover:text-foreground flex items-center gap-0.5 transition-colors"
            >
              <History className="w-3 h-3" />
              History
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
