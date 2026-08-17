"use client";

import { useEffect, useState } from "react";
import { Loader2, AlertCircle, ShieldAlert, ShieldCheck } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { adminApi, type UserHistory } from "@/lib/api";

function getApiErrorMessage(error: unknown, fallback: string): string {
  const err = error as { response?: { data?: { message?: string } }; message?: string };
  return err.response?.data?.message ?? err.message ?? fallback;
}

interface UserHistoryModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string | null;
}

const STATUS_COLORS: Record<string, string> = {
  active: "bg-green/10 text-green border-green/20",
  suspended: "bg-gold/10 text-gold border-gold/20",
  banned: "bg-rose/10 text-rose border-rose/20",
};

export function UserHistoryModal({
  open,
  onOpenChange,
  userId,
}: UserHistoryModalProps) {
  const [history, setHistory] = useState<UserHistory | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open || !userId) {
      setHistory(null);
      setError(null);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    adminApi
      .getUserHistory(userId)
      .then((response) => {
        if (!cancelled) setHistory(response);
      })
      .catch((err) => {
        if (!cancelled) setError(getApiErrorMessage(err, "Failed to load user history"));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [open, userId]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[80vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-base font-semibold">User History</DialogTitle>
          <DialogDescription>
            Past reports and moderation actions for this user
          </DialogDescription>
        </DialogHeader>

        {loading && (
          <div className="flex items-center justify-center py-10">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        )}

        {error && !loading && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {!loading && !error && history && (
          <div className="space-y-5">
            <div className="flex items-center justify-between rounded-lg bg-muted/50 p-3">
              <div>
                <p className="text-sm font-medium">{history.user.email}</p>
                <p className="text-xs capitalize text-muted-foreground">
                  {history.user.role}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Badge
                  variant="outline"
                  className={`text-xs ${STATUS_COLORS[history.current_status] || ""}`}
                >
                  {history.current_status}
                </Badge>
                <Badge variant="outline" className="text-xs">
                  Tier {history.verification_tier}
                </Badge>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-lg border border-border p-3 text-center">
                <ShieldAlert className="mx-auto mb-1 h-4 w-4 text-gold" />
                <p className="text-lg font-semibold">{history.warning_count}</p>
                <p className="text-[10px] text-muted-foreground">Warnings</p>
              </div>
              <div className="rounded-lg border border-border p-3 text-center">
                <ShieldAlert className="mx-auto mb-1 h-4 w-4 text-rose" />
                <p className="text-lg font-semibold">{history.suspension_count}</p>
                <p className="text-[10px] text-muted-foreground">Suspensions</p>
              </div>
              <div className="rounded-lg border border-border p-3 text-center">
                <ShieldCheck className="mx-auto mb-1 h-4 w-4 text-green" />
                <p className="text-lg font-semibold">
                  {history.reports_against_user.length}
                </p>
                <p className="text-[10px] text-muted-foreground">Reports</p>
              </div>
            </div>

            {history.moderation_actions.length > 0 && (
              <div>
                <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Moderation Actions
                </h4>
                <div className="space-y-2">
                  {history.moderation_actions.map((action) => (
                    <div
                      key={action._id}
                      className="rounded-lg border border-border p-3 text-sm"
                    >
                      <div className="mb-1 flex items-center justify-between">
                        <Badge variant="outline" className="text-[10px] capitalize">
                          {action.action_type.replace("_", " ")}
                        </Badge>
                        <span className="text-[10px] text-muted-foreground">
                          {new Date(action.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">{action.reason}</p>
                      {action.duration && (
                        <p className="mt-1 text-[10px] text-muted-foreground">
                          Duration: {action.duration}h
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {history.reports_against_user.length > 0 && (
              <div>
                <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Previous Reports
                </h4>
                <div className="space-y-2">
                  {history.reports_against_user.map((report) => (
                    <div
                      key={report._id}
                      className="rounded-lg border border-border p-3 text-sm"
                    >
                      <div className="mb-1 flex items-center justify-between">
                        <span className="truncate text-xs font-medium">{report.reason}</span>
                        <Badge variant="outline" className="text-[10px] capitalize">
                          {report.status}
                        </Badge>
                      </div>
                      <p className="text-[10px] text-muted-foreground">
                        {new Date(report.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
