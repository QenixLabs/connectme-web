"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Loader2,
  AlertCircle,
  CheckCircle,
  XCircle,
  MessageSquareWarning,
  ChevronLeft,
  ChevronRight,
  Clock,
  User,
  FileText,
} from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { UserDetailPanel } from "@/components/admin/user-detail-panel";
import { adminApi, type AppealItem, type PaginatedAppeals } from "@/lib/api";

function getApiErrorMessage(error: unknown, fallback: string): string {
  const err = error as { response?: { data?: { message?: string } }; message?: string };
  return err.response?.data?.message ?? err.message ?? fallback;
}

const STATUS_COLORS: Record<string, string> = {
  open: "bg-amber-100 text-amber-800 border-amber-200",
  resolved: "bg-emerald-100 text-emerald-800 border-emerald-200",
  rejected: "bg-rose-100 text-rose-800 border-rose-200",
};

const STATUS_ICONS: Record<string, React.ReactNode> = {
  open: <Clock className="w-3 h-3" />,
  resolved: <CheckCircle className="w-3 h-3" />,
  rejected: <XCircle className="w-3 h-3" />,
  all: <FileText className="w-3 h-3" />,
};

const STATUS_OPTIONS = ["all", "open", "resolved", "rejected"];

export default function AdminAppealsPage() {
  const [data, setData] = useState<PaginatedAppeals | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [selectedAppeal, setSelectedAppeal] = useState<AppealItem | null>(null);
  const [adminResponse, setAdminResponse] = useState("");
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [viewingUserId, setViewingUserId] = useState<string | null>(null);
  const [refresh, setRefresh] = useState(0);

  const limit = 20;

  useEffect(() => {
    let cancelled = false;

    adminApi
      .getAppeals({
        status: statusFilter === "all" ? undefined : statusFilter,
        page,
        limit,
      })
      .then((res) => {
        if (!cancelled) {
          setData(res);
          setLoading(false);
          setError(null);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          const msg = getApiErrorMessage(err, "Failed to load appeals");
          setError(msg);
          toast.error(msg);
          setLoading(false);
        }
      });

    return () => { cancelled = true; };
  }, [page, statusFilter, limit, refresh]);

  const handleStatusUpdate = async (status: string) => {
    if (!selectedAppeal) return;
    setActionLoading(status);
    try {
      await adminApi.updateAppealStatus(
        selectedAppeal._id,
        status,
        adminResponse.trim() || undefined
      );
      toast.success(`Appeal ${status}`);
      setSelectedAppeal(null);
      setAdminResponse("");
      setRefresh((r) => r + 1);
    } catch (err) {
      const msg = getApiErrorMessage(err, `Failed to ${status} appeal`);
      setError(msg);
      toast.error(msg);
    } finally {
      setActionLoading(null);
    }
  };

  const handleViewUser = useCallback((userId: string) => {
    setViewingUserId(userId);
  }, []);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted">
            <MessageSquareWarning
              className="w-4 h-4 text-muted-foreground"
              strokeWidth={1.5}
            />
          </div>
          <div>
            <h1 className="text-lg font-semibold">Appeals</h1>
            <p className="text-xs text-muted-foreground">
              Review user appeals against moderation actions
            </p>
          </div>
        </div>
        {data && (
          <span className="text-xs text-muted-foreground bg-muted/50 px-2.5 py-1 rounded-full">
            {data.total.toLocaleString()} total appeals
          </span>
        )}
      </div>

      {/* Status Tabs */}
      <div className="flex flex-wrap items-center gap-1.5 p-1 bg-muted/50 rounded-lg">
        {STATUS_OPTIONS.map((status) => (
          <button
            key={status}
            onClick={() => {
              setStatusFilter(status);
              setPage(1);
            }}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-150 ${
              statusFilter === status
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground hover:bg-background/50"
            }`}
          >
            {STATUS_ICONS[status]}
            <span className="capitalize">{status}</span>
          </button>
        ))}
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="w-4 h-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Table */}
      <div className="border border-border rounded-xl overflow-hidden bg-card shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/30">
              <TableHead className="text-xs font-semibold">User</TableHead>
              <TableHead className="text-xs font-semibold">Type</TableHead>
              <TableHead className="text-xs font-semibold">Reason</TableHead>
              <TableHead className="text-xs font-semibold">Status</TableHead>
              <TableHead className="text-xs font-semibold">Submitted</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-12">
                  <Loader2 className="w-5 h-5 animate-spin text-muted-foreground mx-auto" />
                </TableCell>
              </TableRow>
            ) : !data || data.appeals.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="text-center py-12 text-sm text-muted-foreground"
                >
                  No appeals found.
                </TableCell>
              </TableRow>
            ) : (
              data.appeals.map((appeal) => (
                <TableRow
                  key={appeal._id}
                  className="cursor-pointer hover:bg-muted/30 transition-colors"
                  onClick={() => {
                    setSelectedAppeal(appeal);
                    setAdminResponse(appeal.admin_response || "");
                  }}
                >
                  <TableCell className="text-xs">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleViewUser(appeal.user_id._id);
                      }}
                      className="text-left hover:text-primary hover:underline underline-offset-2 transition-colors"
                      title="View user details"
                    >
                      <div className="font-medium">
                        {appeal.user_id?.email || "Unknown"}
                      </div>
                      <div className="text-[10px] text-muted-foreground capitalize flex items-center gap-1">
                        <User className="w-2.5 h-2.5" />
                        {appeal.user_id?.role}
                      </div>
                    </button>
                  </TableCell>
                  <TableCell className="text-xs">
                    <Badge
                      variant="outline"
                      className="text-[10px] px-1.5 py-0 capitalize font-medium"
                    >
                      {appeal.type}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs max-w-[220px]">
                    <span className="line-clamp-2">{appeal.reason}</span>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={`text-[10px] px-1.5 py-0 capitalize font-medium ${
                        STATUS_COLORS[appeal.status] || ""
                      }`}
                    >
                      {appeal.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                    {format(new Date(appeal.created_at), "MMM d, yyyy")}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {data && data.total_pages > 1 && (
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">
            Page {data.page} of {data.total_pages} ({data.total.toLocaleString()}{" "}
            total)
          </span>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="h-8 text-xs"
            >
              <ChevronLeft className="w-3.5 h-3.5 mr-1" />
              Previous
            </Button>
            <span className="text-xs text-muted-foreground tabular-nums px-1">
              {data.page}/{data.total_pages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                setPage((p) => Math.min(data.total_pages, p + 1))
              }
              disabled={page >= data.total_pages}
              className="h-8 text-xs"
            >
              Next
              <ChevronRight className="w-3.5 h-3.5 ml-1" />
            </Button>
          </div>
        </div>
      )}

      {/* Appeal Detail Sheet */}
      <Sheet
        open={!!selectedAppeal}
        onOpenChange={(v) => !v && setSelectedAppeal(null)}
      >
        <SheetContent className="w-full sm:max-w-xl overflow-y-auto">
          <SheetHeader>
            <SheetTitle className="text-base flex items-center gap-2">
              <MessageSquareWarning className="w-4 h-4 text-muted-foreground" />
              Appeal Details
            </SheetTitle>
          </SheetHeader>

          {selectedAppeal && (
            <div className="mt-6 space-y-5">
              <div className="flex items-center gap-2">
                <Badge
                  variant="outline"
                  className={`text-xs px-2 py-0.5 capitalize font-medium ${
                    STATUS_COLORS[selectedAppeal.status] || ""
                  }`}
                >
                  {selectedAppeal.status}
                </Badge>
                <Badge
                  variant="outline"
                  className="text-xs px-2 py-0.5 capitalize"
                >
                  {selectedAppeal.type}
                </Badge>
              </div>

              <div className="rounded-lg border bg-card p-4 space-y-3">
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  User Information
                </h4>
                <div className="grid grid-cols-[100px_1fr] gap-y-2 text-xs">
                  <span className="text-muted-foreground">Email</span>
                  <button
                    onClick={() =>
                      handleViewUser(selectedAppeal.user_id._id)
                    }
                    className="text-primary hover:underline text-left font-medium"
                  >
                    {selectedAppeal.user_id?.email || "Unknown"}
                  </button>

                  <span className="text-muted-foreground">Role</span>
                  <span className="capitalize">
                    {selectedAppeal.user_id?.role}
                  </span>

                  <span className="text-muted-foreground">Status</span>
                  <Badge
                    variant="outline"
                    className={`text-[10px] px-1.5 py-0 capitalize ${
                      selectedAppeal.user_id?.status === "active"
                        ? "bg-emerald-100 text-emerald-800 border-emerald-200"
                        : selectedAppeal.user_id?.status === "suspended"
                        ? "bg-amber-100 text-amber-800 border-amber-200"
                        : selectedAppeal.user_id?.status === "banned"
                        ? "bg-rose-100 text-rose-800 border-rose-200"
                        : "bg-muted text-muted-foreground border-border"
                    }`}
                  >
                    {selectedAppeal.user_id?.status}
                  </Badge>

                  <span className="text-muted-foreground">Submitted</span>
                  <span>
                    {format(
                      new Date(selectedAppeal.created_at),
                      "PPP p"
                    )}
                  </span>
                </div>

                <div className="pt-1">
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs w-full"
                    onClick={() =>
                      handleViewUser(selectedAppeal.user_id._id)
                    }
                  >
                    <User className="w-3.5 h-3.5 mr-1.5" />
                    View Full User Details
                  </Button>
                </div>
              </div>

              <div className="rounded-lg border bg-card p-4 space-y-3">
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Appeal Content
                </h4>
                <p className="text-sm leading-relaxed">
                  {selectedAppeal.reason}
                </p>
              </div>

              {selectedAppeal.status !== "open" && (
                <div className="rounded-lg border bg-card p-4 space-y-3">
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Resolution
                  </h4>
                  <div className="text-sm bg-muted/50 rounded-md p-3">
                    {selectedAppeal.admin_response || (
                      <span className="text-muted-foreground italic">
                        No response provided
                      </span>
                    )}
                  </div>
                  {selectedAppeal.reviewed_by && (
                    <div className="text-[11px] text-muted-foreground flex items-center gap-1">
                      <User className="w-3 h-3" />
                      <span className="font-medium">
                        {selectedAppeal.reviewed_by?.email || "Admin"}
                      </span>
                      <span className="mx-1">·</span>
                      <span>
                        {selectedAppeal.reviewed_at
                          ? format(
                              new Date(selectedAppeal.reviewed_at),
                              "MMM d, yyyy HH:mm"
                            )
                          : "—"}
                      </span>
                    </div>
                  )}
                </div>
              )}

              {selectedAppeal.status === "open" && (
                <div className="rounded-lg border bg-card p-4 space-y-4">
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Your Response
                  </h4>
                  <Textarea
                    placeholder="Enter your response to this appeal..."
                    value={adminResponse}
                    onChange={(e) => setAdminResponse(e.target.value)}
                    className="text-sm min-h-[100px] resize-none"
                  />
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      className="text-xs"
                      onClick={() => handleStatusUpdate("resolved")}
                      disabled={actionLoading === "resolved"}
                    >
                      {actionLoading === "resolved" ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />
                      ) : (
                        <CheckCircle className="w-3.5 h-3.5 mr-1.5" />
                      )}
                      Resolve
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      className="text-xs"
                      onClick={() => handleStatusUpdate("rejected")}
                      disabled={actionLoading === "rejected"}
                    >
                      {actionLoading === "rejected" ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />
                      ) : (
                        <XCircle className="w-3.5 h-3.5 mr-1.5" />
                      )}
                      Reject
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </SheetContent>
      </Sheet>

      <UserDetailPanel
        userId={viewingUserId}
        onClose={() => setViewingUserId(null)}
        onStatusChange={() => {}}
      />
    </div>
  );
}
