"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Users,
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
import { Avatar } from "@/components/ui/avatar";
import { adminApi, type PaginatedUsers } from "@/lib/api";
import { getApiErrorMessage } from "@/lib/formatters";
import { UserDetailPanel } from "@/components/admin/user-detail-panel";

const ROLE_OPTIONS = ["all", "talent", "recruiter", "admin"];
const STATUS_OPTIONS = ["all", "active", "suspended", "banned"];

const STATUS_COLORS: Record<string, string> = {
  active: "bg-emerald-100 text-emerald-800 border-emerald-200",
  suspended: "bg-amber-100 text-amber-800 border-amber-200",
  banned: "bg-rose-100 text-rose-800 border-rose-200",
};

const SUBSCRIPTION_STATUS_COLORS: Record<string, string> = {
  active: "bg-emerald-100 text-emerald-800 border-emerald-200",
  past_due: "bg-amber-100 text-amber-800 border-amber-200",
  cancelled: "bg-slate-100 text-slate-800 border-slate-200",
  expired: "bg-slate-100 text-slate-800 border-slate-200",
  pending: "bg-blue-100 text-blue-800 border-blue-200",
};

export default function AdminUsersPage() {
  const [data, setData] = useState<PaginatedUsers | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("created_at");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  const limit = 20;

  const fetchUsers = useCallback(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    adminApi
      .getUsers({
        page,
        limit,
        role: roleFilter === "all" ? undefined : roleFilter,
        status: statusFilter === "all" ? undefined : statusFilter,
        sort_by: sortBy,
        sort_order: sortOrder,
        search: search.trim() || undefined,
      })
      .then((res) => {
        if (!cancelled) setData(res);
      })
      .catch((err) => {
        if (!cancelled) setError(getApiErrorMessage(err, "Failed to load users"));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [page, roleFilter, statusFilter, sortBy, sortOrder, search]);

  useEffect(() => {
    const cleanup = fetchUsers();
    return cleanup;
  }, [fetchUsers]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-slate-600" strokeWidth={1.5} />
          <h1 className="text-lg font-semibold">Users</h1>
        </div>
        <span className="text-xs text-muted-foreground">
          {data?.total ?? 0} total
        </span>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <Input
            placeholder="Search name, email, phone, username..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="pl-8 text-xs h-8"
          />
        </div>

        <Select value={roleFilter} onValueChange={(v) => { setRoleFilter(v); setPage(1); }}>
          <SelectTrigger className="w-32 text-xs h-8">
            <SelectValue placeholder="Role" />
          </SelectTrigger>
          <SelectContent>
            {ROLE_OPTIONS.map((r) => (
              <SelectItem key={r} value={r} className="text-xs capitalize">
                {r}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(1); }}>
          <SelectTrigger className="w-32 text-xs h-8">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            {STATUS_OPTIONS.map((s) => (
              <SelectItem key={s} value={s} className="text-xs capitalize">
                {s}
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
            <SelectItem value="last_active_at" className="text-xs">Last Active</SelectItem>
            <SelectItem value="trust_score" className="text-xs">Trust Score</SelectItem>
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
              <TableHead className="text-xs">User</TableHead>
              <TableHead className="text-xs">Role</TableHead>
              <TableHead className="text-xs">Subscription</TableHead>
              <TableHead className="text-xs">Status</TableHead>
              <TableHead className="text-xs">Reports</TableHead>
              <TableHead className="text-xs">Trust</TableHead>
              <TableHead className="text-xs">Joined</TableHead>
              <TableHead className="text-xs">Last Active</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8">
                  <Loader2 className="w-5 h-5 animate-spin text-muted-foreground mx-auto" />
                </TableCell>
              </TableRow>
            ) : !data || data.users.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={8}
                  className="text-center py-8 text-sm text-muted-foreground"
                >
                  No users found.
                </TableCell>
              </TableRow>
            ) : (
              data.users.map((user) => (
                <TableRow
                  key={user._id}
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => setSelectedUserId(user._id)}
                >
                  <TableCell className="text-xs">
                    <div className="flex items-center gap-2">
                      <Avatar name={user.display_name} src={user.profile_photo} size="sm" className="w-7 h-7 text-[10px]" />
                      <div>
                        <div className="font-medium">{user.display_name}</div>
                        <div className="text-[10px] text-muted-foreground">{user.email}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-xs capitalize">{user.role}</TableCell>
                  <TableCell className="text-xs">
                    {user.subscription ? (
                      <div className="flex flex-col gap-0.5">
                        <span className="font-medium">{user.subscription.plan_display_name}</span>
                        <Badge
                          variant="outline"
                          className={`text-[10px] px-1.5 py-0 w-fit capitalize ${SUBSCRIPTION_STATUS_COLORS[user.subscription.status] || ""}`}
                        >
                          {user.subscription.status}
                          {user.subscription.cancel_at_period_end && " (ends at period end)"}
                        </Badge>
                      </div>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={`text-[10px] px-1.5 py-0 capitalize ${STATUS_COLORS[user.status] || ""}`}
                    >
                      {user.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs">
                    {user.report_count > 0 ? (
                      <span className="text-rose-600 font-medium">{user.report_count}</span>
                    ) : (
                      <span className="text-muted-foreground">0</span>
                    )}
                  </TableCell>
                  <TableCell className="text-xs">{user.trust_score}</TableCell>
                  <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                    {new Date(user.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                    {user.last_active_at
                      ? new Date(user.last_active_at).toLocaleDateString()
                      : "—"}
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

      <UserDetailPanel
        userId={selectedUserId}
        onClose={() => setSelectedUserId(null)}
        onStatusChange={() => fetchUsers()}
      />
    </div>
  );
}
