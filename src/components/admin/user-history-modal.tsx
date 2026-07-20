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
import { getApiErrorMessage } from "@/lib/formatters";

interface UserHistoryModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string | null;
}

const STATUS_COLORS: Record<string, string> = {
  active: "bg-emerald-100 text-emerald-800 border-emerald-200",
  suspended: "bg-amber-100 text-amber-800 border-amber-200",
  banned: "bg-rose-100 text-rose-800 border-rose-200",
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
      .then((res) => {
        if (!cancelled) setHistory(res);
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
      <DialogContent className="sm:max-w-lg max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-base font-semibold">User History</DialogTitle>
          <DialogDescription>
            Past reports and moderation actions for this user
          </DialogDescription>
        </DialogHeader>

        {loading && (
          <div className="flex items-center justify-center py-10">
            <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
          </div>
        )}

        {error && !loading && (
          <Alert variant="destructive">
            <AlertCircle className="w-4 h-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {!loading && !error && history && (
          <div className="space-y-5">
            {/* User summary */}
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
              <div>
                <p className="text-sm font-medium">{history.user.email}</p>
                <p className="text-xs text-muted-foreground capitalize">
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

            {/* Stats */}
            <div className="grid grid-cols-3 gap-3">
              <div className="text-center p-3 rounded-lg border border-border">
                <ShieldAlert className="w-4 h-4 text-amber-500 mx-auto mb-1" />
                <p className="text-lg font-semibold">{history.warning_count}</p>
                <p className="text-[10px] text-muted-foreground">Warnings</p>
              </div>
              <div className="text-center p-3 rounded-lg border border-border">
                <ShieldAlert className="w-4 h-4 text-rose-500 mx-auto mb-1" />
                <p className="text-lg font-semibold">{history.suspension_count}</p>
                <p className="text-[10px] text-muted-foreground">Suspensions</p>
              </div>
              <div className="text-center p-3 rounded-lg border border-border">
                <ShieldCheck className="w-4 h-4 text-emerald-500 mx-auto mb-1" />
                <p className="text-lg font-semibold">
                  {history.reports_against_user.length}
                </p>
                <p className="text-[10px] text-muted-foreground">Reports</p>
              </div>
            </div>

            {/* Moderation actions */}
            {history.moderation_actions.length > 0 && (
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                  Moderation Actions
                </h4>
                <div className="space-y-2">
                  {history.moderation_actions.map((action) => (
                    <div
                      key={action._id}
                      className="p-3 rounded-lg border border-border text-sm"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <Badge variant="outline" className="text-[10px] capitalize">
                          {action.action_type.replace("_", " ")}
                        </Badge>
                        <span className="text-[10px] text-muted-foreground">
                          {new Date(action.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">{action.reason}</p>
                      {action.duration && (
                        <p className="text-[10px] text-muted-foreground mt-1">
                          Duration: {action.duration}h
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Reports */}
            {history.reports_against_user.length > 0 && (
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                  Previous Reports
                </h4>
                <div className="space-y-2">
                  {history.reports_against_user.map((report) => (
                    <div
                      key={report._id}
                      className="p-3 rounded-lg border border-border text-sm"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-medium truncate">
                          {report.reason}
                        </span>
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
