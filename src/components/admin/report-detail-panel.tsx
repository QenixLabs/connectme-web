"use client";

import { useEffect, useState } from "react";
import { X, Loader2, AlertCircle, Shield } from "lucide-react";

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
import { adminApi, type ReportDetail, type MessageSnapshot } from "@/lib/api";
import { getApiErrorMessage } from "@/lib/formatters";

interface ReportDetailPanelProps {
  reportId: string | null;
  onClose: () => void;
  onStatusChange?: (reportId: string, newStatus: string) => void;
}

const STATUS_OPTIONS = ["pending", "reviewed", "resolved", "dismissed"];

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-amber-100 text-amber-800 border-amber-200",
  reviewed: "bg-blue-100 text-blue-800 border-blue-200",
  resolved: "bg-emerald-100 text-emerald-800 border-emerald-200",
  dismissed: "bg-slate-100 text-slate-800 border-slate-200",
};

function getDisplayName(user: ReportDetail["reported_id"]) {
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

function formatMessageTime(dateStr: string) {
  const date = new Date(dateStr);
  const now = new Date();
  const isToday =
    date.getDate() === now.getDate() &&
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear();

  if (isToday) {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }
  return date.toLocaleDateString([], { month: "short", day: "numeric" }) +
    " " +
    date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export function ReportDetailPanel({
  reportId,
  onClose,
  onStatusChange,
}: ReportDetailPanelProps) {
  const [report, setReport] = useState<ReportDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (!reportId) {
      setReport(null);
      setError(null);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    adminApi
      .getReportById(reportId)
      .then((res) => {
        if (!cancelled) setReport(res);
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
    if (!report) return;
    setUpdating(true);
    try {
      await adminApi.updateReportStatus(report._id, newStatus);
      setReport((prev) => (prev ? { ...prev, status: newStatus } : prev));
      onStatusChange?.(report._id, newStatus);
    } catch (err) {
      setError(getApiErrorMessage(err, "Failed to update status"));
    } finally {
      setUpdating(false);
    }
  };

  return (
    <Sheet open={!!reportId} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="sm:max-w-[600px] w-full p-0 overflow-hidden">
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

          {!loading && !error && report && (
            <div className="flex-1 overflow-y-auto">
              {/* Users Row */}
              <div className="p-5 border-b border-border">
                <div className="grid grid-cols-2 gap-4">
                  {/* Reported User */}
                  <div className="space-y-2">
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">
                      Reported User
                    </p>
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center text-xs font-semibold shrink-0">
                        {getInitials(getDisplayName(report.reported_id))}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">
                          {getDisplayName(report.reported_id)}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {report.reported_id.email}
                        </p>
                        <Badge
                          variant="outline"
                          className="text-[10px] px-1 py-0 mt-1 capitalize"
                        >
                          {report.reported_id.role || "Unknown"}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  {/* Reporter */}
                  <div className="space-y-2">
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">
                      Reporter
                    </p>
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-semibold shrink-0">
                        {getInitials(getDisplayName(report.reporter_id))}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">
                          {getDisplayName(report.reporter_id)}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {report.reporter_id.email}
                        </p>
                        <Badge
                          variant="outline"
                          className="text-[10px] px-1 py-0 mt-1 capitalize"
                        >
                          {report.reporter_id.role || "Unknown"}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Report Info */}
              <div className="p-5 border-b border-border space-y-4">
                <div className="flex items-center justify-between">
                  <Badge
                    variant="outline"
                    className={`text-xs px-2 py-0.5 ${STATUS_COLORS[report.status] || ""}`}
                  >
                    {report.status}
                  </Badge>
                  <Select
                    value={report.status}
                    onValueChange={handleStatusChange}
                    disabled={updating}
                  >
                    <SelectTrigger className="w-32 text-xs h-8">
                      <SelectValue placeholder="Update status" />
                    </SelectTrigger>
                    <SelectContent>
                      {STATUS_OPTIONS.map((s) => (
                        <SelectItem key={s} value={s} className="text-xs capitalize">
                          {s}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium mb-1">
                    Reason
                  </p>
                  <p className="text-sm">{report.reason}</p>
                </div>

                {report.details && (
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium mb-1">
                      Details
                    </p>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                      {report.details}
                    </p>
                  </div>
                )}

                <div>
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium mb-1">
                    Reported At
                  </p>
                  <p className="text-sm">
                    {new Date(report.created_at).toLocaleString()}
                  </p>
                </div>
              </div>

              {/* Messages Section */}
              <div className="p-5">
                <div className="flex items-center gap-2 mb-4">
                  <Shield className="w-4 h-4 text-muted-foreground" strokeWidth={1.5} />
                  <h3 className="text-sm font-medium">
                    Last 20 messages before report
                  </h3>
                </div>

                {report.messages.length === 0 ? (
                  <div className="text-center py-8 text-sm text-muted-foreground border border-dashed border-border rounded-lg">
                    No conversation linked to this report
                  </div>
                ) : (
                  <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
                    {report.messages.map((msg) => (
                      <MessageItem
                        key={msg.id}
                        msg={msg}
                        reportedUserId={report.reported_id._id}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}

function MessageItem({
  msg,
  reportedUserId,
}: {
  msg: MessageSnapshot;
  reportedUserId: string;
}) {
  const isReportedUser = msg.sender_id === reportedUserId;

  return (
    <div className="flex items-start gap-3">
      <div
        className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-semibold shrink-0 ${
          isReportedUser
            ? "bg-amber-100 text-amber-700"
            : "bg-slate-100 text-slate-700"
        }`}
      >
        {getInitials(msg.sender_name)}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <span className="text-xs font-semibold truncate">{msg.sender_name}</span>
          <span className="text-[10px] text-muted-foreground">
            {formatMessageTime(msg.created_at)}
          </span>
        </div>
        <div
          className={`inline-block px-3 py-2 rounded-lg text-sm ${
            isReportedUser ? "bg-amber-50" : "bg-white border border-border"
          }`}
        >
          {msg.content}
        </div>
      </div>
    </div>
  );
}
