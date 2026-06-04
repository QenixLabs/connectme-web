"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Loader2,
  AlertCircle,
  CheckCircle,
  XCircle,
  MessageSquareWarning,
  ChevronLeft,
  ChevronRight,
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
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { adminApi, type AppealItem, type PaginatedAppeals } from "@/lib/api";
import { getApiErrorMessage } from "@/lib/formatters";

const STATUS_COLORS: Record<string, string> = {
  open: "bg-amber-100 text-amber-800 border-amber-200",
  resolved: "bg-emerald-100 text-emerald-800 border-emerald-200",
  rejected: "bg-rose-100 text-rose-800 border-rose-200",
};

const STATUS_OPTIONS = ["all", "open", "resolved", "rejected"];

export default function AdminAppealsPage() {
  const router = useRouter();
  const [data, setData] = useState<PaginatedAppeals | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [selectedAppeal, setSelectedAppeal] = useState<AppealItem | null>(null);
  const [adminResponse, setAdminResponse] = useState("");
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const limit = 20;

  const fetchAppeals = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await adminApi.getAppeals({
        status: statusFilter === "all" ? undefined : statusFilter,
        page,
        limit,
      });
      setData(res);
    } catch (err) {
      setError(getApiErrorMessage(err, "Failed to load appeals"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppeals();
  }, [page, statusFilter]);

  const handleStatusUpdate = async (status: string) => {
    if (!selectedAppeal) return;
    setActionLoading(status);
    try {
      await adminApi.updateAppealStatus(selectedAppeal._id, status, adminResponse.trim() || undefined);
      setSelectedAppeal(null);
      setAdminResponse("");
      fetchAppeals();
    } catch (err) {
      setError(getApiErrorMessage(err, `Failed to ${status} appeal`));
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MessageSquareWarning className="w-5 h-5 text-slate-600" strokeWidth={1.5} />
          <h1 className="text-lg font-semibold">Appeals</h1>
        </div>
        <span className="text-xs text-muted-foreground">{data?.total ?? 0} total</span>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(1); }}>
          <SelectTrigger className="w-32 text-xs h-8">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            {STATUS_OPTIONS.map((s) => (
              <SelectItem key={s} value={s} className="text-xs capitalize">{s}</SelectItem>
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
              <TableHead className="text-xs">User</TableHead>
              <TableHead className="text-xs">Type</TableHead>
              <TableHead className="text-xs">Reason</TableHead>
              <TableHead className="text-xs">Status</TableHead>
              <TableHead className="text-xs">Submitted</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8">
                  <Loader2 className="w-5 h-5 animate-spin text-muted-foreground mx-auto" />
                </TableCell>
              </TableRow>
            ) : !data || data.appeals.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-sm text-muted-foreground">
                  No appeals found.
                </TableCell>
              </TableRow>
            ) : (
              data.appeals.map((appeal) => (
                <TableRow
                  key={appeal._id}
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => {
                    setSelectedAppeal(appeal);
                    setAdminResponse(appeal.admin_response || "");
                  }}
                >
                  <TableCell className="text-xs">
                    <div>{appeal.user_id?.email || "Unknown"}</div>
                    <div className="text-[10px] text-muted-foreground capitalize">{appeal.user_id?.role}</div>
                  </TableCell>
                  <TableCell className="text-xs capitalize">{appeal.type}</TableCell>
                  <TableCell className="text-xs max-w-[200px] truncate">{appeal.reason}</TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={`text-[10px] px-1.5 py-0 capitalize ${STATUS_COLORS[appeal.status] || ""}`}
                    >
                      {appeal.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                    {new Date(appeal.created_at).toLocaleDateString()}
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

      <Sheet open={!!selectedAppeal} onOpenChange={(v) => !v && setSelectedAppeal(null)}>
        <SheetContent className="w-full sm:max-w-xl overflow-y-auto">
          <SheetHeader>
            <SheetTitle className="text-base">Appeal Details</SheetTitle>
          </SheetHeader>

          {selectedAppeal && (
            <div className="mt-4 space-y-4">
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="text-muted-foreground">User</div>
                <div>{selectedAppeal.user_id?.email || "Unknown"}</div>
                <div className="text-muted-foreground">Role</div>
                <div className="capitalize">{selectedAppeal.user_id?.role}</div>
                <div className="text-muted-foreground">User Status</div>
                <div className="capitalize">{selectedAppeal.user_id?.status}</div>
                <div className="text-muted-foreground">Type</div>
                <div className="capitalize">{selectedAppeal.type}</div>
                <div className="text-muted-foreground">Status</div>
                <div className="capitalize">{selectedAppeal.status}</div>
                <div className="text-muted-foreground">Submitted</div>
                <div>{new Date(selectedAppeal.created_at).toLocaleString()}</div>
              </div>

              <div className="border-t pt-3">
                <div className="text-xs font-medium mb-1">Appeal Reason</div>
                <div className="text-xs bg-muted rounded-md p-2">{selectedAppeal.reason}</div>
              </div>

              {selectedAppeal.status !== "open" && (
                <div className="border-t pt-3">
                  <div className="text-xs font-medium mb-1">Admin Response</div>
                  <div className="text-xs bg-muted rounded-md p-2">{selectedAppeal.admin_response || "—"}</div>
                  {selectedAppeal.reviewed_by && (
                    <div className="text-[10px] text-muted-foreground mt-1">
                      By: {selectedAppeal.reviewed_by?.email || "Admin"} on{" "}
                      {selectedAppeal.reviewed_at
                        ? new Date(selectedAppeal.reviewed_at).toLocaleString()
                        : "—"}
                    </div>
                  )}
                </div>
              )}

              {selectedAppeal.status === "open" && (
                <div className="border-t pt-3 space-y-3">
                  <div className="space-y-1">
                    <div className="text-xs font-medium">Admin Response</div>
                    <Textarea
                      placeholder="Enter your response..."
                      value={adminResponse}
                      onChange={(e) => setAdminResponse(e.target.value)}
                      className="text-xs min-h-[80px]"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      className="text-xs h-8"
                      onClick={() => handleStatusUpdate("resolved")}
                      disabled={actionLoading === "resolved"}
                    >
                      {actionLoading === "resolved" ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <>
                          <CheckCircle className="w-3.5 h-3.5 mr-1" />
                          Resolve
                        </>
                      )}
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      className="text-xs h-8"
                      onClick={() => handleStatusUpdate("rejected")}
                      disabled={actionLoading === "rejected"}
                    >
                      {actionLoading === "rejected" ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <>
                          <XCircle className="w-3.5 h-3.5 mr-1" />
                          Reject
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
