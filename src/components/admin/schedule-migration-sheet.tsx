"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Loader2, ArrowRightLeft, User } from "lucide-react";
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
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { adminApi } from "@/lib/api/admin";
import { type PlanConfig } from "@/lib/api/plans";
import { queryKeys } from "@/lib/api/query-keys";
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

interface ScheduleMigrationSheetProps {
  plan: PlanConfig;
  plans: PlanConfig[];
  onSuccess: () => void;
}

export function ScheduleMigrationSheet({ plan, plans, onSuccess }: ScheduleMigrationSheetProps) {
  const [open, setOpen] = useState(false);
  const [subscriptionId, setSubscriptionId] = useState("");
  const [targetPlanKey, setTargetPlanKey] = useState("");
  const [effectiveAt, setEffectiveAt] = useState("");
  const [reason, setReason] = useState("");
  const [customReason, setCustomReason] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const resolvedReason = reason === "Custom" ? customReason : reason;

  const { data, isLoading } = useQuery({
    queryKey: queryKeys.admin.subscriptionsForPlan(plan.key, plan.family_key),
    queryFn: () =>
      adminApi.getSubscriptions({
        plan_key: plan.key,
        plan_family_key: plan.family_key,
        limit: 50,
      }),
    enabled: open,
  });

  const subscriptions = data?.data ?? [];

  const eligibleSubscriptions = subscriptions.filter(
    (s) => ["active", "trialing", "grace_period", "paused"].includes(s.status)
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subscriptionId || !targetPlanKey || !effectiveAt || !resolvedReason) return;

    setIsSaving(true);
    try {
      await adminApi.createMigration({
        subscription_id: subscriptionId,
        to_plan_key: targetPlanKey,
        effective_at: new Date(effectiveAt).toISOString(),
        reason: resolvedReason,
      });
      toast.success("Migration scheduled");
      setOpen(false);
      setSubscriptionId("");
      setTargetPlanKey("");
      setEffectiveAt("");
      setReason("");
      setCustomReason("");
      onSuccess();
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Failed to schedule migration"));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1">
          <ArrowRightLeft className="w-3.5 h-3.5" />
          Migrate
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-md overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="font-[family-name:var(--font-playfair)]">
            Migrate subscribers from {plan.display_name}
          </SheetTitle>
        </SheetHeader>
        <form onSubmit={handleSubmit} className="mt-6 space-y-5">
          <div className="space-y-1.5">
            <Label className="text-xs">Subscription</Label>
            {isLoading ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="w-4 h-4 animate-spin" />
                Loading subscriptions...
              </div>
            ) : eligibleSubscriptions.length === 0 ? (
              <p className="text-sm text-muted-foreground">No active subscriptions on this plan.</p>
            ) : (
              <Select onValueChange={setSubscriptionId} value={subscriptionId}>
                <SelectTrigger className="h-9 text-sm w-full">
                  <SelectValue placeholder="Select subscription" />
                </SelectTrigger>
                <SelectContent>
                  {eligibleSubscriptions.map((sub) => (
                    <SelectItem key={sub._id} value={sub._id} className="text-sm">
                      <div className="flex items-center gap-2">
                        <User className="w-3.5 h-3.5 text-muted-foreground" />
                        <span className="font-medium">
                          {sub.user?.display_name ?? sub.user_id}
                        </span>
                        <span className="text-muted-foreground">·</span>
                        <span className="text-muted-foreground">{sub.status}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

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

          <div className="space-y-1.5">
            <Label htmlFor="effective_at" className="text-xs">Effective Date</Label>
            <Input
              id="effective_at"
              type="datetime-local"
              value={effectiveAt}
              onChange={(e) => setEffectiveAt(e.target.value)}
              required
              className="h-9 text-sm"
            />
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={isSaving || !subscriptionId || !targetPlanKey || !effectiveAt || !resolvedReason}
          >
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                Scheduling...
              </>
            ) : (
              "Schedule Migration"
            )}
          </Button>
        </form>
      </SheetContent>
    </Sheet>
  );
}
