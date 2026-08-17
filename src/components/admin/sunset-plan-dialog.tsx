"use client";

import { useState, useEffect } from "react";
import { Loader2, Sun, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Alert,
  AlertDescription,
} from "@/components/ui/alert";
import { Checkbox } from "@/components/ui/checkbox";
import { plansApi, type PlanConfig } from "@/lib/api/plans";
import { adminApi } from "@/lib/api/admin";
import { toast } from "sonner";

const REASON_OPTIONS = [
  "Plan upgrade - better features and higher limits",
  "Plan downgrade - cost optimization",
  "Account review - policy compliance",
  "Custom",
] as const;

function getApiErrorMessage(error: unknown, fallback: string): string {
  const err = error as { response?: { data?: { message?: string } }; message?: string };
  return err.response?.data?.message ?? err.message ?? fallback;
}

interface SunsetPlanDialogProps {
  plan: PlanConfig;
  plans: PlanConfig[];
  onSuccess: () => void;
}

export function SunsetPlanDialog({ plan, plans, onSuccess }: SunsetPlanDialogProps) {
  const [open, setOpen] = useState(false);
  const [sunsetAt, setSunsetAt] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [activeCount, setActiveCount] = useState<number | null>(null);
  const [loadingCount, setLoadingCount] = useState(false);
  const [enableBulkMigration, setEnableBulkMigration] = useState(false);
  const [targetPlanKey, setTargetPlanKey] = useState("");
  const [reason, setReason] = useState("");
  const [customReason, setCustomReason] = useState("");

  const resolvedReason = reason === "Custom" ? customReason : reason;

  useEffect(() => {
    if (!open) return;
    setLoadingCount(true);
    adminApi.getActiveSubscriptionCount(plan.key)
      .then((res) => setActiveCount(res.count))
      .catch(() => setActiveCount(0))
      .finally(() => setLoadingCount(false));
  }, [open, plan.key]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sunsetAt) return;
    if (enableBulkMigration && (!targetPlanKey || !resolvedReason)) return;

    setIsSaving(true);
    try {
      await plansApi.sunsetPlan(plan.key, { sunset_at: new Date(sunsetAt).toISOString() });

      if (enableBulkMigration && activeCount && activeCount > 0) {
        await adminApi.bulkCreateMigrations({
          from_plan_key: plan.key,
          to_plan_key: targetPlanKey,
          effective_at: new Date(sunsetAt).toISOString(),
          reason: resolvedReason,
        });
      }

      toast.success(enableBulkMigration ? "Sunset scheduled with migration" : "Sunset scheduled");
      setOpen(false);
      setSunsetAt("");
      setTargetPlanKey("");
      setReason("");
      setCustomReason("");
      setEnableBulkMigration(false);
      onSuccess();
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Failed to schedule sunset"));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1">
          <Sun className="w-3.5 h-3.5" />
          Sunset
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-[family-name:var(--font-playfair)]">
            Sunset {plan.display_name}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {loadingCount ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="w-4 h-4 animate-spin" />
              Checking active subscribers...
            </div>
          ) : activeCount !== null && activeCount > 0 ? (
            <Alert variant="destructive" className="py-3">
              <AlertTriangle className="w-4 h-4" />
              <AlertDescription>
                {activeCount} active subscriber{activeCount > 1 ? "s" : ""} on this plan.
              </AlertDescription>
            </Alert>
          ) : null}

          <div className="space-y-1.5">
            <Label htmlFor="sunset_at" className="text-xs">Sunset Date</Label>
            <Input
              id="sunset_at"
              type="datetime-local"
              value={sunsetAt}
              onChange={(e) => setSunsetAt(e.target.value)}
              required
              className="h-9 text-sm"
            />
            <p className="text-[10px] text-muted-foreground">
              After this date the plan will stop accepting new subscriptions.
            </p>
          </div>

          {activeCount !== null && activeCount > 0 && (
            <div className="space-y-3 pt-1">
              <div className="flex items-start gap-2">
                <Checkbox
                  id="enableBulkMigration"
                  checked={enableBulkMigration}
                  onCheckedChange={(v) => setEnableBulkMigration(v === true)}
                />
                <Label htmlFor="enableBulkMigration" className="text-xs leading-tight cursor-pointer">
                  Migrate all {activeCount} active user{activeCount > 1 ? "s" : ""} to another plan
                </Label>
              </div>

              {enableBulkMigration && (
                <div className="space-y-3 pl-6 border-l-2 border-muted">
                  <div className="space-y-1.5">
                    <Label className="text-xs">Target Plan</Label>
                    <Select onValueChange={setTargetPlanKey} value={targetPlanKey}>
                      <SelectTrigger className="h-9 text-sm w-full">
                        <SelectValue placeholder="Select target plan" />
                      </SelectTrigger>
                      <SelectContent>
                        {plans
                          .filter((p) => p.key !== plan.key)
                          .filter((p) => {
                            if (plan.target_role === "talent")
                              return p.target_role === "talent" || p.target_role === "both";
                            if (plan.target_role === "recruiter")
                              return p.target_role === "recruiter" || p.target_role === "both";
                            return true;
                          })
                          .map((p) => (
                            <SelectItem key={p.key} value={p.key} className="text-sm">
                              {p.display_name} ({p.key})
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs">Reason</Label>
                    <Select onValueChange={setReason} value={reason}>
                      <SelectTrigger className="h-9 text-sm w-full">
                        <SelectValue placeholder="Select reason" />
                      </SelectTrigger>
                      <SelectContent>
                        {REASON_OPTIONS.map((opt) => (
                          <SelectItem key={opt} value={opt} className="text-sm">
                            {opt}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {reason === "Custom" && (
                      <Input
                        placeholder="Enter custom reason..."
                        value={customReason}
                        onChange={(e) => setCustomReason(e.target.value)}
                        className="h-9 text-sm mt-2"
                        required
                      />
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          <Button
            type="submit"
            className="w-full"
            disabled={isSaving || (enableBulkMigration && (!targetPlanKey || !resolvedReason))}
          >
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                Scheduling...
              </>
            ) : (
              enableBulkMigration ? "Schedule Sunset & Migrate" : "Schedule Sunset"
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
