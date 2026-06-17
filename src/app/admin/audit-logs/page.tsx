"use client";

import { useEffect, useState } from "react";
import {
  ScrollText,
  Loader2,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  Search,
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
import { adminApi, type AuditLogItem, type PaginatedAuditLogs } from "@/lib/api";
import { getApiErrorMessage } from "@/lib/formatters";

const ACTION_OPTIONS = [
  "all",
  "message_read",
  "attachment_uploaded",
  "user_blocked",
  "user_unblocked",
  "report_submitted",
  "strike_warning_issued",
  "strike_auto_suspension",
  "warn_user",
  "suspend_user",
  "ban_user",
  "update_user_status",
  "update_report_status",
];

const ACTOR_TYPE_COLORS: Record<string, string> = {
  user: "bg-blue-100 text-blue-800 border-blue-200",
  admin: "bg-purple-100 text-purple-800 border-purple-200",
  system: "bg-slate-100 text-slate-800 border-slate-200",
};

function formatAction(action: string) {
  return action.replace(/_/g, " ");
}

function truncate(str: string, len: number) {
  if (!str) return "-";
  return str.length > len ? str.slice(0, len) + "..." : str;
}

export default function AdminAuditLogsPage() {
  const [data, setData] = useState<PaginatedAuditLogs | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionFilter, setActionFilter] = useState("all");
  const [actorTypeFilter, setActorTypeFilter] = useState("all");
  const [targetTypeFilter, setTargetTypeFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const limit = 20;

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    adminApi
      .getAuditLogs({
        page,
        limit,
        action: actionFilter === "all" ? undefined : actionFilter,
        actor_type: actorTypeFilter === "all" ? undefined : actorTypeFilter,
        target_type: targetTypeFilter === "all" ? undefined : targetTypeFilter,
        target_id: search.trim() || undefined,
      })
      .then((res) => {
        if (!cancelled) setData(res);
      })
      .catch((err) => {
        if (!cancelled) setError(getApiErrorMessage(err, "Failed to load audit logs"));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [page, actionFilter, actorTypeFilter, targetTypeFilter, search]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ScrollText className="w-5 h-5 text-brand" strokeWidth={1.5} />
          <h1 className="text-lg font-semibold">Audit Logs</h1>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <Input
            placeholder="Search target ID..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="pl-8 text-xs h-8"
          />
        </div>

        <Select value={actionFilter} onValueChange={(v) => { setActionFilter(v); setPage(1); }}>
          <SelectTrigger className="w-40 text-xs h-8">
            <SelectValue placeholder="Filter action" />
          </SelectTrigger>
          <SelectContent>
            {ACTION_OPTIONS.map((a) => (
              <SelectItem key={a} value={a} className="text-xs capitalize">
                {formatAction(a)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={actorTypeFilter} onValueChange={(v) => { setActorTypeFilter(v); setPage(1); }}>
          <SelectTrigger className="w-32 text-xs h-8">
            <SelectValue placeholder="Actor type" />
          </SelectTrigger>
          <SelectContent>
            {["all", "user", "admin", "system"].map((t) => (
              <SelectItem key={t} value={t} className="text-xs capitalize">
                {t}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={targetTypeFilter} onValueChange={(v) => { setTargetTypeFilter(v); setPage(1); }}>
          <SelectTrigger className="w-32 text-xs h-8">
            <SelectValue placeholder="Target type" />
          </SelectTrigger>
          <SelectContent>
            {["all", "user", "report", "attachment"].map((t) => (
              <SelectItem key={t} value={t} className="text-xs capitalize">
                {t}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
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
              <TableHead className="text-xs">Action</TableHead>
              <TableHead className="text-xs">Actor</TableHead>
              <TableHead className="text-xs">Target</TableHead>
              <TableHead className="text-xs">Target ID</TableHead>
              <TableHead className="text-xs">Metadata</TableHead>
              <TableHead className="text-xs">Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  <Loader2 className="w-5 h-5 animate-spin text-muted-foreground mx-auto" />
                </TableCell>
              </TableRow>
            ) : !data || data.logs.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="text-center py-8 text-sm text-muted-foreground"
                >
                  No audit logs found.
                </TableCell>
              </TableRow>
            ) : (
              data.logs.map((log) => (
                <TableRow key={log._id}>
                  <TableCell className="text-xs font-medium capitalize">
                    {formatAction(log.action)}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={`text-[10px] px-1.5 py-0 capitalize ${ACTOR_TYPE_COLORS[log.actor_type] || ""}`}
                    >
                      {log.actor_type}
                    </Badge>
                    {log.actor_id && (
                      <div className="text-[10px] text-muted-foreground mt-0.5">
                        {truncate(log.actor_id, 16)}
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="text-xs capitalize">
                    {log.target_type}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {truncate(log.target_id, 20)}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground max-w-[200px] truncate">
                    {Object.keys(log.metadata || {}).length > 0
                      ? truncate(JSON.stringify(log.metadata), 60)
                      : "-"}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                    {new Date(log.created_at).toLocaleString()}
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
    </div>
  );
}
