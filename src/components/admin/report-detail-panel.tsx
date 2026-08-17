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
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { adminApi, type ReportDetail, type ReportItem } from "@/lib/api";
import { cn } from "@/lib/utils";
import { MessageContextViewer } from "@/components/admin/message-context-viewer";
import {
  ModerationActionDialog,
  type ModerationActionType,
} from "@/components/admin/moderation-action-dialog";
import { UserHistoryModal } from "@/components/admin/user-history-modal";

function getApiErrorMessage(error: unknown, fallback: string): string {
  const err = error as { response?: { data?: { message?: string } }; message?: string };
  return err.response?.data?.message ?? err.message ?? fallback;
}

interface ReportDetailPanelProps {
  reportId: string | null;
  onClose: () => void;
  onStatusChange?: (reportId: string, newStatus: string) => void;
  onActionTaken?: (reportId: string, action: string) => void;
}

const STATUS_OPTIONS = ["pending", "under_review", "resolved", "rejected"];
const PRIORITY_OPTIONS = ["low", "medium", "high"];

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-gold/10 text-gold border-gold/20",
  under_review: "bg-blue/10 text-blue border-blue/20",
  resolved: "bg-green/10 text-green border-green/20",
  rejected: "bg-muted text-muted-foreground border-border",
};

const PRIORITY_COLORS: Record<string, string> = {
  low: "bg-muted text-muted-foreground border-border",
  medium: "bg-gold/10 text-gold border-gold/20",
  high: "bg-rose/10 text-rose border-rose/20",
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
  const initials = name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return initials || "?";
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
      .then((response) => {
        if (!cancelled) {
          setDetail(response);
          setNotes(response.report.admin_notes || "");
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
      setDetail((previous) =>
        previous
          ? { ...previous, report: { ...previous.report, status: newStatus } }
          : previous
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
      setDetail((previous) =>
        previous
          ? { ...previous, report: { ...previous.report, priority: newPriority } }
          : previous
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
      setDetail((previous) =>
        previous
          ? { ...previous, report: { ...previous.report, admin_notes: notes } }
          : previous
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
      setDetail((previous) =>
        previous
          ? {
              ...previous,
              report: {
                ...previous.report,
                status: selectedAction === "mark_safe" ? "resolved" : previous.report.status,
                action_taken: selectedAction,
                resolved_at:
                  selectedAction === "mark_safe"
                    ? new Date().toISOString()
                    : previous.report.resolved_at,
              },
            }
          : previous
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
      <Sheet open={!!reportId} onOpenChange={(isOpen) => !isOpen && onClose()}>
        <SheetContent className="w-full overflow-hidden p-0 sm:max-w-[720px]">
          <SheetHeader className="border-b border-border p-5">
            <div className="flex items-center justify-between">
              <SheetTitle className="text-base font-semibold">Report Detail</SheetTitle>
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="h-7 w-7"
                aria-label="Close report detail"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </SheetHeader>

          <div className="flex h-[calc(100vh-73px)] flex-col overflow-hidden">
            {loading && (
              <div className="flex flex-1 items-center justify-center">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              </div>
            )}

            {error && !loading && (
              <div className="p-5">
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              </div>
            )}

            {!loading && !error && detail && (
              <>
                <div className="flex-1 overflow-y-auto">
                  <div className="grid grid-cols-1 divide-y divide-border md:grid-cols-2 md:divide-x md:divide-y-0">
                    <div className="space-y-5 p-5">
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

                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-muted-foreground">Status</span>
                          <Select
                            value={detail.report.status}
                            onValueChange={handleStatusChange}
                            disabled={updatingStatus}
                          >
                            <SelectTrigger className="h-8 w-32 text-xs">
                              <Badge
                                variant="outline"
                                className={cn(
                                  "px-1.5 py-0 text-[10px]",
                                  STATUS_COLORS[detail.report.status]
                                )}
                              >
                                {detail.report.status}
                              </Badge>
                            </SelectTrigger>
                            <SelectContent>
                              {STATUS_OPTIONS.map((status) => (
                                <SelectItem
                                  key={status}
                                  value={status}
                                  className="text-xs capitalize"
                                >
                                  {status.replace("_", " ")}
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
                            <SelectTrigger className="h-8 w-32 text-xs">
                              <Badge
                                variant="outline"
                                className={cn(
                                  "px-1.5 py-0 text-[10px]",
                                  PRIORITY_COLORS[detail.report.priority]
                                )}
                              >
                                {detail.report.priority}
                              </Badge>
                            </SelectTrigger>
                            <SelectContent>
                              {PRIORITY_OPTIONS.map((priority) => (
                                <SelectItem
                                  key={priority}
                                  value={priority}
                                  className="text-xs capitalize"
                                >
                                  {priority}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div>
                          <p className="mb-1 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                            Reason
                          </p>
                          <p className="text-sm">{detail.report.reason}</p>
                        </div>

                        {detail.report.details && (
                          <div>
                            <p className="mb-1 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                              Details
                            </p>
                            <p className="whitespace-pre-wrap text-sm text-muted-foreground">
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

                      <div className="space-y-2">
                        <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                          Admin Notes
                        </p>
                        <Textarea
                          value={notes}
                          onChange={(event) => setNotes(event.target.value)}
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
                          {savingNotes && <Loader2 className="mr-1.5 h-3 w-3 animate-spin" />}
                          Save Notes
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-4 p-5">
                      <div className="flex items-center gap-2">
                        <Shield className="h-4 w-4 text-muted-foreground" strokeWidth={1.5} />
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

                <div className="border-t border-border bg-muted/30 p-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => openAction("warning")}
                      className="text-xs"
                    >
                      <AlertCircle className="mr-1.5 h-3.5 w-3.5" />
                      Warn
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => openAction("suspension")}
                      className="text-xs"
                    >
                      <Clock className="mr-1.5 h-3.5 w-3.5" />
                      Suspend
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => openAction("ban")}
                      className="text-xs"
                    >
                      <Shield className="mr-1.5 h-3.5 w-3.5" />
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
                      <CheckCircle className="mr-1.5 h-3.5 w-3.5" />
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
                      <CheckCircle className="mr-1.5 h-3.5 w-3.5" />
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
  const avatarTone = color === "rose" ? "bg-rose/10 text-rose" : "bg-blue/10 text-blue";
  const displayName = getDisplayName(user);

  return (
    <div className="space-y-2">
      <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      <div className="flex items-center gap-3">
        <Avatar className="size-9 shrink-0">
          <AvatarFallback className={cn(avatarTone, "text-xs font-semibold")}>
            {getInitials(displayName)}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium">{displayName}</p>
          <p className="truncate text-xs text-muted-foreground">{user.email}</p>
          <div className="mt-0.5 flex items-center gap-1.5">
            <Badge variant="outline" className="px-1 py-0 text-[10px] capitalize">
              {user.role || "Unknown"}
            </Badge>
            <Button
              variant="ghost"
              size="sm"
              onClick={onViewHistory}
              className="h-auto gap-0.5 p-0 text-[10px] text-muted-foreground hover:text-foreground"
            >
              <History className="h-3 w-3" />
              History
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
