"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Flag,
  Loader2,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  Search,
  ArrowUpDown,
} from "lucide-react";

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
import { adminApi, type ReportItem, type PaginatedReports } from "@/lib/api";
import { getApiErrorMessage } from "@/lib/formatters";
import { ReportDetailPanel } from "@/components/admin/report-detail-panel";

const STATUS_OPTIONS = ["all", "pending", "under_review", "resolved", "rejected"];

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
  const router = useRouter();
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
    setLoading(true);
    setError(null);

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
        if (!cancelled) setData(res);
      })
      .catch((err) => {
        if (!cancelled) setError(getApiErrorMessage(err, "Failed to load reports"));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
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
    } catch (err) {
      setError(getApiErrorMessage(err, "Failed to update status"));
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Flag className="w-5 h-5 text-rose-500" strokeWidth={1.5} />
          <h1 className="text-lg font-semibold">Reported Users</h1>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <Input
            placeholder="Search reporter, reported, or reason..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="pl-8 text-xs h-8"
          />
        </div>

        <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(1); }}>
          <SelectTrigger className="w-36 text-xs h-8">
            <SelectValue placeholder="Filter status" />
          </SelectTrigger>
          <SelectContent>
            {STATUS_OPTIONS.map((s) => (
              <SelectItem key={s} value={s} className="text-xs capitalize">
                {s.replace("_", " ")}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={priorityFilter} onValueChange={(v) => { setPriorityFilter(v); setPage(1); }}>
          <SelectTrigger className="w-36 text-xs h-8">
            <SelectValue placeholder="Filter priority" />
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
          <SelectTrigger className="w-32 text-xs h-8">
            <ArrowUpDown className="w-3 h-3 mr-1.5" />
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="created_at" className="text-xs">Date</SelectItem>
            <SelectItem value="priority" className="text-xs">Priority</SelectItem>
            <SelectItem value="status" className="text-xs">Status</SelectItem>
          </SelectContent>
        </Select>

        <button
          onClick={() => setSortOrder((o) => (o === "asc" ? "desc" : "asc"))}
          className="h-8 px-2 rounded-md border border-border text-xs hover:bg-accent transition-colors"
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

      <div className="border border-border rounded-lg overflow-hidden bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-xs">Reported User</TableHead>
              <TableHead className="text-xs">Role</TableHead>
              <TableHead className="text-xs">Reason</TableHead>
              <TableHead className="text-xs">Reporter</TableHead>
              <TableHead className="text-xs">Priority</TableHead>
              <TableHead className="text-xs">Date</TableHead>
              <TableHead className="text-xs">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  <Loader2 className="w-5 h-5 animate-spin text-muted-foreground mx-auto" />
                </TableCell>
              </TableRow>
            ) : !data || data.reports.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="text-center py-8 text-sm text-muted-foreground"
                >
                  No reports found.
                </TableCell>
              </TableRow>
            ) : (
              data.reports.map((report) => (
                <TableRow
                  key={report._id}
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => setSelectedReportId(report._id)}
                >
                  <TableCell className="text-xs font-medium">
                    {getDisplayName(report.reported_id)}
                    <div className="text-[10px] text-muted-foreground">
                      {report.reported_id.email}
                    </div>
                  </TableCell>
                  <TableCell className="text-xs">
                    {getRoleLabel(report.reported_id.role)}
                  </TableCell>
                  <TableCell className="text-xs max-w-[200px] truncate">
                    {report.reason}
                    {report.details && (
                      <div className="text-[10px] text-muted-foreground truncate">
                        {report.details}
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="text-xs">
                    {getDisplayName(report.reporter_id)}
                    <div className="text-[10px] text-muted-foreground">
                      {report.reporter_id.email}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={`text-[10px] px-1.5 py-0 capitalize ${PRIORITY_COLORS[report.priority] || ""}`}
                    >
                      {report.priority}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                    {new Date(report.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <Select
                      value={report.status}
                      onValueChange={(v) => handleStatusChange(report._id, v)}
                      disabled={updatingId === report._id}
                    >
                      <SelectTrigger className="w-28 text-[10px] h-7" size="sm">
                        <Badge
                          variant="outline"
                          className={`text-[10px] px-1.5 py-0 ${STATUS_COLORS[report.status] || ""}`}
                        >
                          {report.status.replace("_", " ")}
                        </Badge>
                      </SelectTrigger>
                      <SelectContent>
                        {STATUS_OPTIONS.filter((s) => s !== "all").map((s) => (
                          <SelectItem key={s} value={s} className="text-xs capitalize">
                            {s.replace("_", " ")}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {data && data.total_pages > 1 && (
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">
            Page {data.page} of {data.total_pages} ({data.total} total)
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="p-1.5 rounded-md border border-border hover:bg-accent disabled:opacity-40 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setPage((p) => Math.min(data.total_pages, p + 1))}
              disabled={page >= data.total_pages}
              className="p-1.5 rounded-md border border-border hover:bg-accent disabled:opacity-40 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
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
        onActionTaken={(id, action) => {
          setData((prev) => {
            if (!prev) return prev;
            return {
              ...prev,
              reports: prev.reports.map((r) =>
                r._id === id ? { ...r, action_taken: action, status: action === "mark_safe" ? "resolved" : r.status } : r
              ),
            };
          });
        }}
      />
    </div>
  );
}
