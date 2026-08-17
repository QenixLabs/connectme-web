"use client";

import { useEffect, useState, useCallback } from "react";
import { format, parseISO } from "date-fns";
import { motion } from "motion/react";
import {
  Clock,
  Play,
  Loader2,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Timer,
  RefreshCw,
  Info,
} from "lucide-react";
import { toast } from "sonner";

import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { adminApi, type CronJobInfo, type CronJobExecution } from "@/lib/api";
import { cn } from "@/lib/utils";

function getApiErrorMessage(error: unknown, fallback = "Something went wrong"): string {
  if (error && typeof error === "object" && "response" in error) {
    const res = (error as { response?: { data?: { message?: string } } }).response;
    if (res?.data?.message) return res.data.message;
  }
  if (error instanceof Error) return error.message;
  return fallback;
}

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } },
};

const item = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0 },
};

const MODULE_COLORS: Record<string, string> = {
  subscriptions: "bg-indigo-500/10 text-indigo-600",
  recommendations: "bg-emerald-500/10 text-emerald-600",
  campaigns: "bg-amber-500/10 text-amber-600",
  unknown: "bg-muted text-muted-foreground",
};

function TableSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 p-4 rounded-lg border">
          <Skeleton className="h-5 w-48" />
          <Skeleton className="h-5 w-24" />
          <Skeleton className="h-5 w-20" />
          <Skeleton className="h-5 w-32 ml-auto" />
        </div>
      ))}
    </div>
  );
}

export default function CronJobsPage() {
  const [jobs, setJobs] = useState<CronJobInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedJob, setSelectedJob] = useState<CronJobInfo | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [triggering, setTriggering] = useState(false);

  const [history, setHistory] = useState<CronJobExecution[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  const fetchJobs = useCallback(async () => {
    try {
      setError(null);
      const data = await adminApi.getCronJobs();
      setJobs(data);
    } catch (err: unknown) {
      setError(getApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  const handleRowClick = async (job: CronJobInfo) => {
    setSelectedJob(job);
    setDetailOpen(true);
    setHistoryLoading(true);
    try {
      const data = await adminApi.getCronJobHistory(job.name);
      setHistory(data);
    } catch {
      setHistory([]);
    } finally {
      setHistoryLoading(false);
    }
  };

  const handleTriggerClick = () => {
    setDetailOpen(false);
    setConfirmOpen(true);
  };

  const handleConfirmTrigger = async () => {
    if (!selectedJob) return;
    setTriggering(true);
    try {
      const result = await adminApi.triggerCronJob(selectedJob.name);
      toast.success(result.message, {
        description: `Completed in ${result.duration_ms}ms`,
      });
      setConfirmOpen(false);
      setSelectedJob(null);
      fetchJobs();
    } catch (err: unknown) {
      toast.error(getApiErrorMessage(err, "Job execution failed"));
    } finally {
      setTriggering(false);
    }
  };

  const formatCronHuman = (expr: string): string => {
    const parts = expr.split(" ");
    if (parts.length !== 5) return expr;
    const [min, hour, dom, , dow] = parts;

    if (min === "0" && hour === "*" && dom === "*" && dow === "*") return "Every hour";
    if (min === "0" && hour === "9" && dom === "*" && dow === "*") return "Daily at 9:00 AM";
    if (min === "0" && hour === "2" && dom === "*" && dow === "*") return "Daily at 2:00 AM";
    if (min === "0" && hour === "3" && dom === "*" && dow === "*") return "Daily at 3:00 AM";
    if (min === "0" && hour === "*") return "Every hour";
    if (min === "0" && dom === "*" && dow === "*") {
      if (hour.includes("*/")) return `Every ${hour.replace("*/", "")} hours`;
      return `At minute 0, every hour`;
    }
    return expr;
  };

  const formatDuration = (ms: number): string => {
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(1)}s`;
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Cron Jobs</h1>
          <p className="text-sm text-muted-foreground mt-1">Loading scheduled jobs...</p>
        </div>
        <TableSkeleton />
      </div>
    );
  }

  return (
    <motion.div className="space-y-6" variants={container} initial="hidden" animate="show">
      <motion.div variants={item}>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Cron Jobs</h1>
            <p className="text-sm text-muted-foreground mt-1">
              {jobs.length} scheduled job{jobs.length !== 1 ? "s" : ""} across the system
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={() => { setLoading(true); fetchJobs(); }}>
            <RefreshCw className="h-4 w-4 mr-1.5" />
            Refresh
          </Button>
        </div>
      </motion.div>

      {error && (
        <motion.div variants={item}>
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </motion.div>
      )}

      <motion.div variants={item}>
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Job Name</TableHead>
                  <TableHead>Schedule</TableHead>
                  <TableHead>Module</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Last Run</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {jobs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                      No cron jobs registered.
                    </TableCell>
                  </TableRow>
                ) : (
                  jobs.map((job) => (
                    <TableRow
                      key={job.name}
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => handleRowClick(job)}
                    >
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-muted-foreground shrink-0" />
                          <span className="font-medium">{job.displayName}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <code className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono">
                          {job.cronExpression}
                        </code>
                        <span className="text-xs text-muted-foreground ml-2 hidden sm:inline">
                          {formatCronHuman(job.cronExpression)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="secondary"
                          className={cn("text-xs font-normal", MODULE_COLORS[job.module] ?? MODULE_COLORS.unknown)}
                        >
                          {job.module}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {job.isRunning ? (
                          <Badge variant="secondary" className="bg-blue-500/10 text-blue-600 gap-1">
                            <Loader2 className="h-3 w-3 animate-spin" />
                            Running
                          </Badge>
                        ) : job.isActive ? (
                          <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-600 gap-1">
                            <CheckCircle2 className="h-3 w-3" />
                            Active
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="gap-1">
                            <XCircle className="h-3 w-3" />
                            Inactive
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right text-sm text-muted-foreground">
                        {job.lastRun
                          ? format(parseISO(job.lastRun), "MMM d, HH:mm:ss")
                          : "Never"}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </motion.div>

      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-muted-foreground" />
              {selectedJob?.displayName}
            </DialogTitle>
            <DialogDescription>{selectedJob?.description}</DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="space-y-1">
              <span className="text-muted-foreground text-xs">Schedule</span>
              <div>
                <code className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono">
                  {selectedJob?.cronExpression}
                </code>
              </div>
              <p className="text-xs text-muted-foreground">
                {selectedJob ? formatCronHuman(selectedJob.cronExpression) : ""}
              </p>
            </div>
            <div className="space-y-1">
              <span className="text-muted-foreground text-xs">Module</span>
              <div>
                <Badge
                  variant="secondary"
                  className={cn(
                    "text-xs font-normal",
                    MODULE_COLORS[selectedJob?.module ?? ""] ?? MODULE_COLORS.unknown
                  )}
                >
                  {selectedJob?.module}
                </Badge>
              </div>
            </div>
            <div className="space-y-1">
              <span className="text-muted-foreground text-xs">Next Run</span>
              <p className="text-sm">
                {selectedJob?.nextRun
                  ? format(parseISO(selectedJob.nextRun), "MMM d, HH:mm:ss")
                  : "N/A"}
              </p>
            </div>
            <div className="space-y-1">
              <span className="text-muted-foreground text-xs">Last Run</span>
              <p className="text-sm">
                {selectedJob?.lastRun
                  ? format(parseISO(selectedJob.lastRun), "MMM d, HH:mm:ss")
                  : "Never"}
              </p>
            </div>
          </div>

          {historyLoading ? (
            <div className="space-y-2 pt-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-16 w-full" />
            </div>
          ) : history.length > 0 ? (
            <div className="space-y-2 pt-2">
              <span className="text-xs font-medium text-muted-foreground">Recent Executions</span>
              <div className="max-h-40 overflow-y-auto space-y-1.5 rounded-md border p-2">
                {history.slice().reverse().map((exec, i) => (
                  <div
                    key={i}
                    className={cn(
                      "flex items-center justify-between text-xs px-2 py-1.5 rounded",
                      exec.status === "success" ? "bg-emerald-500/5" : "bg-red-500/5"
                    )}
                  >
                    <div className="flex items-center gap-1.5">
                      {exec.status === "success" ? (
                        <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                      ) : (
                        <XCircle className="h-3 w-3 text-red-500" />
                      )}
                      <span>{format(parseISO(exec.triggeredAt), "MMM d, HH:mm:ss")}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">{formatDuration(exec.duration_ms)}</span>
                      {exec.error && (
                        <span className="text-red-500 truncate max-w-[120px]" title={exec.error}>
                          {exec.error}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-xs text-muted-foreground pt-2">
              <Info className="h-3.5 w-3.5" />
              No manual executions yet. History is cleared on server restart.
            </div>
          )}

          <DialogFooter>
            <Button
              onClick={handleTriggerClick}
              disabled={selectedJob?.isRunning}
              className="gap-1.5"
            >
              {selectedJob?.isRunning ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Running...
                </>
              ) : (
                <>
                  <Play className="h-4 w-4" />
                  Run Now
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Timer className="h-5 w-5" />
              Confirm Manual Execution
            </AlertDialogTitle>
            <AlertDialogDescription>
              You are about to manually trigger{" "}
              <span className="font-medium text-foreground">{selectedJob?.displayName}</span>.{" "}
              This will execute the job immediately regardless of its schedule.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={triggering}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmTrigger} disabled={triggering}>
              {triggering ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-1.5" />
                  Executing...
                </>
              ) : (
                "Run Job"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </motion.div>
  );
}
