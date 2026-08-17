"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Flag,
  Loader2,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  Search,
  ArrowUpDown,
  Clock,
  CheckCircle,
  XCircle,
  Eye,
  FileText,
} from "lucide-react";
import { toast } from "sonner";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { adminApi, type ReportItem, type PaginatedReports } from "@/lib/api";
import { ReportDetailPanel } from "@/components/admin/report-detail-panel";
import { format } from "date-fns";

function getApiErrorMessage(error: unknown, fallback: string): string {
  if (
    error &&
    typeof error === "object" &&
    "response" in error &&
    error.response &&
    typeof error.response === "object" &&
    "data" in error.response &&
    error.response.data &&
    typeof error.response.data === "object" &&
    "message" in error.response.data
  ) {
    return String(error.response.data.message);
  }
  if (error instanceof Error) return error.message;
  return fallback;
}

const STATUS_OPTIONS = ["all", "pending", "under_review", "resolved", "rejected"];

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-accent-amber-bg text-accent-amber border-accent-amber/30",
  under_review: "bg-blue/10 text-blue border-blue/30",
  resolved: "bg-success/10 text-success border-success/30",
  rejected: "bg-muted text-muted-foreground border-border",
};

const STATUS_ICONS: Record<string, React.ReactNode> = {
  pending: <Clock className="w-3 h-3" />,
  under_review: <Eye className="w-3 h-3" />,
  resolved: <CheckCircle className="w-3 h-3" />,
  rejected: <XCircle className="w-3 h-3" />,
  all: <FileText className="w-3 h-3" />,
};

const PRIORITY_COLORS: Record<string, string> = {
  low: "bg-muted text-muted-foreground border-border",
  medium: "bg-accent-amber-bg text-accent-amber border-accent-amber/30",
  high: "bg-rose/10 text-rose border-rose/30",
};

function getDisplayName(user: ReportItem["reported_id"]) {
  return (
    user.full_legal_name ||
    user.company_name ||
    user.username ||
    user.email ||
    "Unknown"
  );
}

function getRoleLabel(role?: string) {
  if (!role) return "Unknown";
  return role.charAt(0).toUpperCase() + role.slice(1);
}

export default function AdminReportsPage() {
  const [data, setData] = useState<PaginatedReports | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [sortBy, setSortBy] = useState("created_at");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null);

  const limit = 20;

  useEffect(() => {
    let cancelled = false;

    adminApi
      .getReports({
        page,
        limit,
        status: statusFilter === "all" ? undefined : statusFilter,
        priority: priorityFilter === "all" ? undefined : priorityFilter,
        sortBy,
        sortOrder,
        search: search.trim() || undefined,
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
          const msg = getApiErrorMessage(err, "Failed to load reports");
          setError(msg);
          toast.error(msg);
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [page, statusFilter, priorityFilter, sortBy, sortOrder, search]);

  const handleStatusChange = async (reportId: string, newStatus: string) => {
    setUpdatingId(reportId);
    try {
      await adminApi.updateReportStatus(reportId, newStatus);
      setData((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          reports: prev.reports.map((r) =>
            r._id === reportId ? { ...r, status: newStatus } : r
          ),
        };
      });
      toast.success("Status updated");
    } catch (err) {
      const msg = getApiErrorMessage(err, "Failed to update status");
      setError(msg);
      toast.error(msg);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleReportAction = useCallback(
    (id: string, action: string) => {
      setData((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          reports: prev.reports.map((r) =>
            r._id === id
              ? {
                  ...r,
                  action_taken: action,
                  status: action === "mark_safe" ? "resolved" : r.status,
                }
              : r
          ),
        };
      });
    },
    []
  );

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose/10">
            <Flag className="w-4 h-4 text-rose" strokeWidth={1.5} />
          </div>
          <div>
            <h1 className="text-lg font-semibold">Reported Users</h1>
            <p className="text-xs text-muted-foreground">
              Review and manage user reports
            </p>
          </div>
        </div>
        {data && (
          <span className="text-xs text-muted-foreground bg-muted/50 px-2.5 py-1 rounded-full">
            {data.total.toLocaleString()} total reports
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
            <span className="capitalize">{status.replace("_", " ")}</span>
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <Input
            placeholder="Search reporter, reported, or reason..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="pl-8 text-xs h-8"
          />
        </div>

        <Select
          value={priorityFilter}
          onValueChange={(v) => {
            setPriorityFilter(v);
            setPage(1);
          }}
        >
          <SelectTrigger className="w-32 text-xs h-8">
            <SelectValue placeholder="Priority" />
          </SelectTrigger>
          <SelectContent>
            {["all", "low", "medium", "high"].map((p) => (
              <SelectItem key={p} value={p} className="text-xs capitalize">
                {p}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={sortBy} onValueChange={(v) => setSortBy(v)}>
          <SelectTrigger className="w-28 text-xs h-8">
            <ArrowUpDown className="w-3 h-3 mr-1.5" />
            <SelectValue placeholder="Sort" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="created_at" className="text-xs">
              Date
            </SelectItem>
            <SelectItem value="priority" className="text-xs">
              Priority
            </SelectItem>
            <SelectItem value="status" className="text-xs">
              Status
            </SelectItem>
          </SelectContent>
        </Select>

        <button
          onClick={() =>
            setSortOrder((o) => (o === "asc" ? "desc" : "asc"))
          }
          className="h-8 px-2.5 rounded-md border border-border text-xs hover:bg-accent transition-colors flex items-center gap-1"
        >
          {sortOrder === "asc" ? "Asc ↑" : "Desc ↓"}
        </button>
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
              <TableHead className="text-xs font-semibold">
                Reported User
              </TableHead>
              <TableHead className="text-xs font-semibold">Role</TableHead>
              <TableHead className="text-xs font-semibold">Reason</TableHead>
              <TableHead className="text-xs font-semibold">Reporter</TableHead>
              <TableHead className="text-xs font-semibold">Priority</TableHead>
              <TableHead className="text-xs font-semibold">Date</TableHead>
              <TableHead className="text-xs font-semibold">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-12">
                  <Loader2 className="w-5 h-5 animate-spin text-muted-foreground mx-auto" />
                </TableCell>
              </TableRow>
            ) : !data || data.reports.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="text-center py-12 text-sm text-muted-foreground"
                >
                  No reports found.
                </TableCell>
              </TableRow>
            ) : (
              data.reports.map((report) => (
                <TableRow
                  key={report._id}
                  className="cursor-pointer hover:bg-muted/30 transition-colors"
                  onClick={() => setSelectedReportId(report._id)}
                >
                  <TableCell className="text-xs font-medium">
                    <div>{getDisplayName(report.reported_id)}</div>
                    <div className="text-[10px] text-muted-foreground">
                      {report.reported_id.email}
                    </div>
                  </TableCell>
                  <TableCell className="text-xs">
                    <Badge
                      variant="outline"
                      className="text-[10px] px-1.5 py-0 capitalize font-medium"
                    >
                      {getRoleLabel(report.reported_id.role)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs max-w-[180px]">
                    <div className="truncate font-medium">{report.reason}</div>
                    {report.details && (
                      <div className="text-[10px] text-muted-foreground truncate mt-0.5">
                        {report.details}
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="text-xs">
                    <div>{getDisplayName(report.reporter_id)}</div>
                    <div className="text-[10px] text-muted-foreground">
                      {report.reporter_id.email}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={`text-[10px] px-1.5 py-0 capitalize font-medium ${
                        PRIORITY_COLORS[report.priority] || ""
                      }`}
                    >
                      {report.priority}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                    {format(new Date(report.created_at), "MMM d, yyyy")}
                  </TableCell>
                  <TableCell>
                    <Select
                      value={report.status}
                      onValueChange={(v) =>
                        handleStatusChange(report._id, v)
                      }
                      disabled={updatingId === report._id}
                    >
                      <SelectTrigger className="w-28 h-7 text-[10px]">
                        <Badge
                          variant="outline"
                          className={`text-[10px] px-1.5 py-0 capitalize ${
                            STATUS_COLORS[report.status] || ""
                          }`}
                        >
                          {report.status.replace("_", " ")}
                        </Badge>
                      </SelectTrigger>
                      <SelectContent>
                        {STATUS_OPTIONS.filter((s) => s !== "all").map(
                          (s) => (
                            <SelectItem
                              key={s}
                              value={s}
                              className="text-xs capitalize"
                            >
                              {s.replace("_", " ")}
                            </SelectItem>
                          )
                        )}
                      </SelectContent>
                    </Select>
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

      <ReportDetailPanel
        reportId={selectedReportId}
        onClose={() => setSelectedReportId(null)}
        onStatusChange={(id, newStatus) => {
          setData((prev) => {
            if (!prev) return prev;
            return {
              ...prev,
              reports: prev.reports.map((r) =>
                r._id === id ? { ...r, status: newStatus } : r
              ),
            };
          });
        }}
        onActionTaken={handleReportAction}
      />
    </div>
  );
}
