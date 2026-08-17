"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import {
  ScrollText,
  Loader2,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  Search,
  Copy,
  Check,
  User,
  ArrowUpDown,
  Calendar,
  Info,
  X,
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
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { UserDetailPanel } from "@/components/admin/user-detail-panel";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import { ScrollArea } from "@/components/ui/scroll-area";
import { adminApi, type AuditLogItem, type PaginatedAuditLogs } from "@/lib/api";
import { toast } from "sonner";
import { format } from "date-fns";

function getApiErrorMessage(error: unknown, fallback: string): string {
  if (
    error &&
    typeof error === "object" &&
    "response" in error &&
    (error as { response?: { data?: { message?: string } } }).response?.data
      ?.message
  ) {
    return (
      (error as { response: { data: { message: string } } }).response.data
        .message || fallback
    );
  }
  if (error instanceof Error) return error.message;
  return fallback;
}

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
  user: "bg-primary/10 text-primary border-primary/20",
  admin: "bg-violet-100 text-violet-800 border-violet-200",
  system: "bg-muted text-muted-foreground border-border",
};

const ACTOR_TYPE_ICONS: Record<string, string> = {
  user: "bg-primary",
  admin: "bg-violet-500",
  system: "bg-muted-foreground",
};

const ACTION_COLORS: Record<string, string> = {
  warn_user: "bg-amber-100 text-amber-800",
  suspend_user: "bg-orange-100 text-orange-800",
  ban_user: "bg-rose-100 text-rose-800",
  user_blocked: "bg-rose-100 text-rose-800",
  user_unblocked: "bg-emerald-100 text-emerald-800",
  update_user_status: "bg-violet-100 text-violet-800",
  report_submitted: "bg-cyan-100 text-cyan-800",
  update_report_status: "bg-cyan-100 text-cyan-800",
};

function formatAction(action: string) {
  return action.replace(/_/g, " ");
}

function MetadataCell({ metadata }: { metadata: Record<string, unknown> }) {
  const [expanded, setExpanded] = useState(false);

  const keys = Object.keys(metadata);
  if (keys.length === 0) {
    return (
      <span className="text-xs text-muted-foreground">&mdash;</span>
    );
  }

  const fullText = JSON.stringify(metadata, null, 2);
  const preview =
    fullText.length > 60 ? fullText.slice(0, 60) + "..." : fullText;

  if (expanded) {
    return (
      <div className="relative">
        <ScrollArea className="max-w-[300px] max-h-[200px]">
          <pre className="text-[11px] font-mono text-muted-foreground whitespace-pre-wrap break-all bg-muted/50 rounded-md p-2">
            {fullText}
          </pre>
        </ScrollArea>
        <button
          onClick={() => setExpanded(false)}
          className="absolute top-1 right-1 p-0.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
        >
          <X className="w-3 h-3" />
        </button>
      </div>
    );
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          onClick={() => setExpanded(true)}
          className="text-xs text-muted-foreground hover:text-foreground transition-colors text-left max-w-[180px] truncate block font-mono cursor-pointer group"
        >
          <span className="group-hover:underline decoration-dotted underline-offset-2">
            {preview}
          </span>
        </button>
      </TooltipTrigger>
      <TooltipContent>Click to expand</TooltipContent>
    </Tooltip>
  );
}

function IdCell({
  id,
  onViewUser,
}: {
  id: string;
  onViewUser: (id: string) => void;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(id).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  };

  return (
    <div className="flex items-center gap-1 group/id">
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onViewUser(id);
            }}
            className="flex items-center gap-1 text-xs font-mono text-muted-foreground hover:text-foreground hover:underline underline-offset-2 transition-colors cursor-pointer"
          >
            <User className="w-3 h-3 shrink-0 opacity-60 group-hover/id:opacity-100" />
            <span className="truncate max-w-[140px]">{id}</span>
          </button>
        </TooltipTrigger>
        <TooltipContent>View user details</TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            onClick={handleCopy}
            className="shrink-0 p-0.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground opacity-0 group-hover/id:opacity-100 transition-all"
          >
            {copied ? (
              <Check className="w-3 h-3 text-emerald-600" />
            ) : (
              <Copy className="w-3 h-3" />
            )}
          </button>
        </TooltipTrigger>
        <TooltipContent>Copy ID</TooltipContent>
      </Tooltip>
    </div>
  );
}

function AuditLogDetailSheet({
  log,
  onClose,
  onViewUser,
}: {
  log: AuditLogItem | null;
  onClose: () => void;
  onViewUser: (id: string) => void;
}) {
  if (!log) return null;

  return (
    <Sheet open={!!log} onOpenChange={(v) => !v && onClose()}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="text-base flex items-center gap-2">
            <ScrollText className="w-4 h-4 text-muted-foreground" />
            Audit Log Detail
          </SheetTitle>
        </SheetHeader>

        <div className="mt-6 space-y-5">
          <div className="flex items-center justify-between">
            <Badge
              variant="outline"
              className={`text-xs px-2 py-0.5 capitalize ${
                ACTION_COLORS[log.action] || "bg-muted text-muted-foreground"
              }`}
            >
              {formatAction(log.action)}
            </Badge>
            <Badge
              variant="outline"
              className={`text-xs px-2 py-0.5 capitalize ${
                ACTOR_TYPE_COLORS[log.actor_type] || ""
              }`}
            >
              {log.actor_type}
            </Badge>
          </div>

          <div className="grid gap-4">
            <div className="rounded-lg border bg-card p-4 space-y-3">
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Action Details
              </h4>
              <div className="grid grid-cols-[100px_1fr] gap-y-2 text-xs">
                <span className="text-muted-foreground">Action</span>
                <span className="font-medium capitalize">
                  {formatAction(log.action)}
                </span>

                <span className="text-muted-foreground">Actor Type</span>
                <span className="capitalize">{log.actor_type}</span>

                <span className="text-muted-foreground">Actor ID</span>
                {log.actor_id ? (
                  <button
                    onClick={() => onViewUser(log.actor_id!)}
                    className="font-mono text-primary hover:underline text-left cursor-pointer truncate"
                  >
                    {log.actor_id}
                  </button>
                ) : (
                  <span className="text-muted-foreground">&mdash;</span>
                )}

                <span className="text-muted-foreground">Target Type</span>
                <span className="capitalize">{log.target_type}</span>

                <span className="text-muted-foreground">Target ID</span>
                <span className="font-mono break-all">{log.target_id}</span>

                <span className="text-muted-foreground">Date</span>
                <span>{format(new Date(log.created_at), "PPP p")}</span>
              </div>
            </div>

            <div className="rounded-lg border bg-card p-4 space-y-3">
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Metadata
              </h4>
              {Object.keys(log.metadata || {}).length === 0 ? (
                <p className="text-xs text-muted-foreground italic">
                  No metadata
                </p>
              ) : (
                <ScrollArea className="max-h-[300px]">
                  <pre className="text-[11px] font-mono text-muted-foreground whitespace-pre-wrap break-all bg-muted/50 rounded-md p-3">
                    {JSON.stringify(log.metadata, null, 2)}
                  </pre>
                </ScrollArea>
              )}
            </div>

            {(log.ip_address || log.user_agent) && (
              <div className="rounded-lg border bg-card p-4 space-y-3">
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Request Info
                </h4>
                <div className="grid grid-cols-[100px_1fr] gap-y-2 text-xs">
                  {log.ip_address && (
                    <>
                      <span className="text-muted-foreground">
                        IP Address
                      </span>
                      <span className="font-mono">{log.ip_address}</span>
                    </>
                  )}
                  {log.user_agent && (
                    <>
                      <span className="text-muted-foreground">
                        User Agent
                      </span>
                      <span className="font-mono break-all text-[11px]">
                        {log.user_agent}
                      </span>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>

          {log.actor_id && (
            <div className="pt-2">
              <Button
                variant="outline"
                size="sm"
                className="text-xs w-full"
                onClick={() => onViewUser(log.actor_id!)}
              >
                <User className="w-3.5 h-3.5 mr-1.5" />
                View Actor User Details
              </Button>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
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
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [selectedLog, setSelectedLog] = useState<AuditLogItem | null>(null);
  const [viewingUserId, setViewingUserId] = useState<string | null>(null);

  const limit = 20;

  useEffect(() => {
    let cancelled = false;

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
        if (!cancelled) {
          setData(res);
          setLoading(false);
          setError(null);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          const msg = getApiErrorMessage(err, "Failed to load audit logs");
          setError(msg);
          toast.error(msg);
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [page, actionFilter, actorTypeFilter, targetTypeFilter, search, sortOrder]);

  const actionCounts = useMemo(() => {
    if (!data) return {};
    const counts: Record<string, number> = {};
    for (const log of data.logs) {
      counts[log.action] = (counts[log.action] || 0) + 1;
    }
    return counts;
  }, [data]);

  const hasActiveFilters =
    actionFilter !== "all" ||
    actorTypeFilter !== "all" ||
    targetTypeFilter !== "all" ||
    search.trim() !== "";

  const clearFilters = () => {
    setActionFilter("all");
    setActorTypeFilter("all");
    setTargetTypeFilter("all");
    setSearch("");
    setPage(1);
  };

  const handleViewUser = useCallback((userId: string) => {
    setViewingUserId(userId);
  }, []);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted">
            <ScrollText
              className="w-4 h-4 text-muted-foreground"
              strokeWidth={1.5}
            />
          </div>
          <div>
            <h1 className="text-lg font-semibold">Audit Logs</h1>
            <p className="text-xs text-muted-foreground">
              Track all admin and system actions
            </p>
          </div>
        </div>
        {data && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Calendar className="w-3.5 h-3.5" />
            <span>{data.total.toLocaleString()} total entries</span>
          </div>
        )}
      </div>

      {data && !loading && data.logs.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          {Object.entries(actionCounts)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 5)
            .map(([action, count]) => (
              <Badge
                key={action}
                variant="outline"
                className={`text-[10px] px-2 py-0.5 capitalize ${
                  ACTION_COLORS[action] ||
                  "bg-muted text-muted-foreground border-border"
                }`}
              >
                {formatAction(action)}: {count}
              </Badge>
            ))}
        </div>
      )}

      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <Input
            placeholder="Search target ID..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="pl-8 text-xs h-8"
          />
        </div>

        <Select
          value={actionFilter}
          onValueChange={(v) => {
            setActionFilter(v);
            setPage(1);
          }}
        >
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

        <Select
          value={actorTypeFilter}
          onValueChange={(v) => {
            setActorTypeFilter(v);
            setPage(1);
          }}
        >
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

        <Select
          value={targetTypeFilter}
          onValueChange={(v) => {
            setTargetTypeFilter(v);
            setPage(1);
          }}
        >
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

        <button
          onClick={() =>
            setSortOrder((o) => (o === "asc" ? "desc" : "asc"))
          }
          className="h-8 px-2 rounded-md border border-border text-xs hover:bg-accent transition-colors flex items-center gap-1"
        >
          <ArrowUpDown className="w-3 h-3" />
          {sortOrder === "asc" ? "Oldest" : "Newest"}
        </button>

        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="text-xs h-8 gap-1"
          >
            <X className="w-3 h-3" />
            Clear
          </Button>
        )}
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="w-4 h-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="border border-border rounded-xl overflow-hidden bg-card shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/30">
              <TableHead className="text-xs font-semibold">Action</TableHead>
              <TableHead className="text-xs font-semibold">Actor</TableHead>
              <TableHead className="text-xs font-semibold">Target</TableHead>
              <TableHead className="text-xs font-semibold">
                Target ID
              </TableHead>
              <TableHead className="text-xs font-semibold">
                Metadata
              </TableHead>
              <TableHead className="text-xs font-semibold">Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-12">
                  <Loader2 className="w-5 h-5 animate-spin text-muted-foreground mx-auto" />
                </TableCell>
              </TableRow>
            ) : !data || data.logs.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="text-center py-12 text-sm text-muted-foreground"
                >
                  <div className="flex flex-col items-center gap-2">
                    <Info className="w-5 h-5 text-muted-foreground/50" />
                    <span>No audit logs found</span>
                    {hasActiveFilters && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={clearFilters}
                        className="text-xs"
                      >
                        Clear filters
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              data.logs.map((log) => (
                <TableRow
                  key={log._id}
                  className="cursor-pointer hover:bg-muted/30 transition-colors"
                  onClick={() => setSelectedLog(log)}
                >
                  <TableCell className="text-xs">
                    <Badge
                      variant="outline"
                      className={`text-[10px] px-1.5 py-0 capitalize font-medium ${
                        ACTION_COLORS[log.action] ||
                        "bg-muted text-muted-foreground"
                      }`}
                    >
                      {formatAction(log.action)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1.5">
                      <div
                        className={`h-1.5 w-1.5 rounded-full ${
                          ACTOR_TYPE_ICONS[log.actor_type] ||
                          "bg-muted-foreground"
                        }`}
                      />
                      <Badge
                        variant="outline"
                        className={`text-[10px] px-1.5 py-0 capitalize ${
                          ACTOR_TYPE_COLORS[log.actor_type] || ""
                        }`}
                      >
                        {log.actor_type}
                      </Badge>
                      {log.actor_id && (
                        <IdCell
                          id={log.actor_id}
                          onViewUser={handleViewUser}
                        />
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-xs capitalize">
                    {log.target_type}
                  </TableCell>
                  <TableCell>
                    <IdCell
                      id={log.target_id}
                      onViewUser={handleViewUser}
                    />
                  </TableCell>
                  <TableCell>
                    <MetadataCell metadata={log.metadata || {}} />
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                    {format(new Date(log.created_at), "MMM d, HH:mm")}
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
            Showing page {data.page} of {data.total_pages} (
            {data.total.toLocaleString()} total)
          </span>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="h-8 text-xs"
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Previous
            </Button>
            <span className="text-xs text-muted-foreground px-2 tabular-nums">
              {data.page} / {data.total_pages}
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
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </div>
      )}

      <AuditLogDetailSheet
        log={selectedLog}
        onClose={() => setSelectedLog(null)}
        onViewUser={handleViewUser}
      />

      <UserDetailPanel
        userId={viewingUserId}
        onClose={() => setViewingUserId(null)}
        onStatusChange={() => {}}
      />
    </div>
  );
}
