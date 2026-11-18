"use client";

import { useState } from "react";
import { useMutation, useQueries, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, Search, Shuffle } from "lucide-react";
import { toast } from "sonner";
import { adminApi, type AdminUpgradeCandidate } from "@/lib/api/admin";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

export default function FreeUpgradesPage() {
  const queryClient = useQueryClient();
  const [role, setRole] = useState<"talent" | "recruiter">("talent");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<AdminUpgradeCandidate | null>(null);
  const [selectedCandidates, setSelectedCandidates] = useState<AdminUpgradeCandidate[]>([]);
  const [plan, setPlan] = useState("");
  const [durationDays, setDurationDays] = useState("30");
  const [reason, setReason] = useState("");
  const [acknowledged, setAcknowledged] = useState(false);
  const [drawCount, setDrawCount] = useState("1");

  const candidates = useQuery({
    queryKey: ["admin-free-upgrade-candidates", role, page, search],
    queryFn: () => adminApi.getFreeUpgradeCandidates({ role, page, limit: 25, search }),
  });
  const subscription = useQuery({
    queryKey: ["admin-user-subscription", selected?._id],
    queryFn: () => adminApi.getUserSubscription(selected!._id),
    enabled: !!selected && selectedCandidates.length === 0,
    staleTime: 0,
  });
  const selectedSubscriptions = useQueries({
    queries: selectedCandidates.map((candidate) => ({
      queryKey: ["admin-user-subscription", candidate._id],
      queryFn: () => adminApi.getUserSubscription(candidate._id),
      staleTime: 0,
    })),
  });
  const isBulkMode = selectedCandidates.length > 0;
  const recipients = isBulkMode ? selectedCandidates : selected ? [selected] : [];
  const recipientDetails = isBulkMode
    ? selectedSubscriptions.map((query) => query.data).filter((detail) => detail !== undefined)
    : subscription.data ? [subscription.data] : [];
  const recipientSubscriptionsLoading = isBulkMode
    ? selectedSubscriptions.some((query) => query.isFetching)
    : subscription.isFetching;
  const recipientSubscriptionsError = isBulkMode
    ? selectedSubscriptions.some((query) => query.isError)
    : subscription.isError;
  const commonPlans = recipientDetails.length === recipients.length && recipientDetails.length > 0
    ? recipientDetails[0].available_plans.filter((item) =>
        item.monthly_price !== 0 &&
        recipientDetails.every((detail) =>
          detail.effective.plan_key !== item.key &&
          detail.available_plans.some((candidatePlan) => candidatePlan.key === item.key && candidatePlan.monthly_price !== 0),
        ),
      )
    : [];
  const selectedPlan = commonPlans.find((item) => item.key === plan);
  const allVisibleSelected = !!candidates.data?.candidates.length &&
    candidates.data.candidates.every((candidate) => selectedCandidates.some((item) => item._id === candidate._id));
  const draw = useMutation({
    mutationFn: () => adminApi.drawFreeUpgradeCandidate(role, Number(drawCount)),
    onSuccess: ({ candidates: drawnCandidates }) => {
      setSelected(null);
      setSelectedCandidates(drawnCandidates);
      setPlan("");
      setAcknowledged(false);
      toast.success(`${drawnCandidates.length} weighted user${drawnCandidates.length === 1 ? "" : "s"} selected`);
    },
    onError: () => toast.error("Could not draw a candidate. Refresh the list and try again."),
  });
  const offer = useMutation({
    mutationFn: () => {
      const targets = recipients.map((candidate, index) => ({
        candidate,
        subscription: isBulkMode ? selectedSubscriptions[index]?.data : subscription.data,
      }));
      if (!targets.length) {
        throw new Error("Select users and load their subscriptions first.");
      }
      return Promise.allSettled(targets.map(({ candidate, subscription: detail }) => {
        if (!detail) throw new Error("Select users and load their subscriptions first.");
        return adminApi.createSubscriptionOffer(candidate._id, {
          plan_key: plan,
          duration_days: Number(durationDays),
          reason: reason.trim(),
          expected_revision: detail.revision,
          billing_acknowledged: true,
        });
      })).then((results) => results.map((result, index) => ({
        id: targets[index].candidate._id,
        status: result.status,
      })));
    },
    onSuccess: async (results) => {
      const successfulIds = results.filter((result) => result.status === "fulfilled").map((result) => result.id);
      const failedIds = results.filter((result) => result.status === "rejected").map((result) => result.id);
      if (successfulIds.length) {
        toast.success(`${successfulIds.length} plan offer${successfulIds.length === 1 ? "" : "s"} sent`);
        setSelectedCandidates((current) => current.filter((candidate) => !successfulIds.includes(candidate._id)));
        setSelected((current) => current && successfulIds.includes(current._id) ? null : current);
        await queryClient.invalidateQueries({ queryKey: ["admin-user-subscription"] });
      }
      if (failedIds.length) {
        const failedNames = recipients
          .filter((candidate) => failedIds.includes(candidate._id))
          .map((candidate) => candidate.display_name);
        toast.error(`Could not send ${failedIds.length} plan offer${failedIds.length === 1 ? "" : "s"}`, {
          description: failedNames.join(", "),
        });
      } else {
        setPlan("");
        setReason("");
        setAcknowledged(false);
      }
    },
    onError: () => toast.error("Could not send this offer. Refresh the subscription and try again."),
  });
  const failedOfferNames = offer.data
    ?.filter((result) => result.status === "rejected")
    .map((result) => recipients.find((candidate) => candidate._id === result.id)?.display_name ?? result.id) ?? [];

  const duration = Number(durationDays);
  const formError = !recipients.length
    ? "Choose a user first."
    : !plan
      ? "Select an eligible plan."
      : !Number.isInteger(duration) || duration < 1 || duration > 3650
        ? "Duration must be between 1 and 3650 days."
        : reason.trim().length < 3 || reason.trim().length > 2000
          ? "Enter a reason of 3–2000 characters."
          : null;

  function choose(candidate: AdminUpgradeCandidate) {
    setSelected(candidate);
    setSelectedCandidates([]);
    setPlan("");
    setAcknowledged(false);
  }

  function toggleVisibleCandidates(checked: boolean) {
    const visibleCandidates = candidates.data?.candidates ?? [];
    setSelected(null);
    setSelectedCandidates((current) => checked
      ? [...current, ...visibleCandidates.filter((candidate) => !current.some((item) => item._id === candidate._id))]
      : current.filter((candidate) => !visibleCandidates.some((item) => item._id === candidate._id)),
    );
    setPlan("");
    setAcknowledged(false);
  }

  function toggleCandidate(candidate: AdminUpgradeCandidate, checked: boolean) {
    setSelected(null);
    setSelectedCandidates((current) => checked
      ? [...current, candidate]
      : current.filter((item) => item._id !== candidate._id),
    );
    setPlan("");
    setAcknowledged(false);
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-4 sm:p-6">
      <header>
        <h1 className="text-2xl font-bold">Free upgrades</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Select one or more users or make a weighted draw. Bulk offers use the same plan and duration, and users must accept before access changes.
        </p>
      </header>

      <Card>
        <CardHeader><CardTitle className="text-base">Eligibility and selection</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
            <div className="space-y-1">
              <Label htmlFor="upgrade-role">Account type</Label>
              <Select value={role} onValueChange={(value: "talent" | "recruiter") => { setRole(value); setPage(1); setSelected(null); setSelectedCandidates([]); setPlan(""); setAcknowledged(false); }}>
                <SelectTrigger id="upgrade-role" className="w-40"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="talent">Talent</SelectItem>
                  <SelectItem value="recruiter">Recruiter</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="relative min-w-0 flex-1">
              <Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
              <Input value={search} onChange={(event) => { setSearch(event.target.value); setPage(1); }} className="pl-9" placeholder="Search eligible users by email" aria-label="Search eligible users by email" />
            </div>
            <div className="space-y-1">
              <Label htmlFor="draw-count">Users to draw</Label>
              <Input id="draw-count" type="number" min={1} max={100} value={drawCount} onChange={(event) => setDrawCount(event.target.value)} className="w-28" />
            </div>
            <Button type="button" variant="outline" onClick={() => draw.mutate()} disabled={draw.isPending || !Number.isInteger(Number(drawCount)) || Number(drawCount) < 1 || Number(drawCount) > 100}>
              {draw.isPending ? <Loader2 className="mr-2 size-4 animate-spin" /> : <Shuffle className="mr-2 size-4" />}
              Draw weighted users
            </Button>
          </div>
          <Alert><AlertDescription>{candidates.data?.scoring ?? "Selection weight is the average of normalized activity recency over the last 30 days and trust score (0–100). The draw is weighted by this score."}</AlertDescription></Alert>
        </CardContent>
      </Card>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.3fr)_minmax(320px,0.7fr)]">
        <Card>
          <CardHeader><CardTitle className="text-base">Eligible users ({candidates.data?.total ?? 0})</CardTitle></CardHeader>
          <CardContent>
            <div className="mb-3 flex items-center justify-between gap-3 text-sm">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  aria-label="Select all visible eligible users"
                  checked={allVisibleSelected}
                  onChange={(event) => toggleVisibleCandidates(event.target.checked)}
                  disabled={!candidates.data?.candidates.length}
                />
                Select all on this page
              </label>
              <span className="text-muted-foreground">
                {selectedCandidates.length ? `${selectedCandidates.length} selected for offers` : "Use checkboxes to select multiple users"}
              </span>
              {selectedCandidates.length > 0 && (
                <Button type="button" size="sm" variant="ghost" onClick={() => { setSelectedCandidates([]); setPlan(""); setAcknowledged(false); }}>
                  Clear selection
                </Button>
              )}
            </div>
            {candidates.isPending ? (
              <div role="status" className="flex items-center gap-2 text-sm text-muted-foreground"><Loader2 className="size-4 animate-spin" /> Loading candidates…</div>
            ) : candidates.isError ? (
              <p role="alert" className="text-sm text-destructive">Could not load eligible users. Refresh to retry.</p>
            ) : candidates.data?.candidates.length ? (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead><tr className="border-b text-xs text-muted-foreground"><th className="py-2 pr-3"><span className="sr-only">Select</span></th><th className="py-2 pr-3">User</th><th className="py-2 pr-3">Trust</th><th className="py-2 pr-3">Activity</th><th className="py-2 pr-3">Weight</th><th className="py-2">Last active</th></tr></thead>
                    <tbody>
                      {candidates.data.candidates.map((candidate) => (
                        <tr key={candidate._id} className={`cursor-pointer border-b last:border-0 ${selected?._id === candidate._id || selectedCandidates.some((item) => item._id === candidate._id) ? "bg-primary/5" : "hover:bg-muted/40"}`} onClick={() => choose(candidate)} onKeyDown={(event) => { if (event.key === "Enter") choose(candidate); }} tabIndex={0}>
                          <td className="py-3 pr-3" onClick={(event) => event.stopPropagation()}>
                            <input
                              type="checkbox"
                              aria-label={`Select ${candidate.display_name} for a plan offer`}
                              checked={selectedCandidates.some((item) => item._id === candidate._id)}
                              onChange={(event) => toggleCandidate(candidate, event.target.checked)}
                            />
                          </td>
                          <td className="py-3 pr-3"><span className="block font-medium">{candidate.display_name}</span><span className="text-xs text-muted-foreground">{candidate.email}</span></td>
                          <td className="py-3 pr-3">{candidate.trust_score}</td>
                          <td className="py-3 pr-3">{Math.round(candidate.activity_score * 100)}%</td>
                          <td className="py-3 pr-3"><Badge variant="outline">{candidate.selection_weight.toFixed(4)}</Badge></td>
                          <td className="py-3 text-xs text-muted-foreground">{new Date(candidate.last_active_at).toLocaleDateString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="mt-4 flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Page {candidates.data.page} of {Math.max(candidates.data.total_pages, 1)}</span>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" disabled={page <= 1} onClick={() => setPage((value) => value - 1)}>Previous</Button>
                    <Button size="sm" variant="outline" disabled={page >= candidates.data.total_pages} onClick={() => setPage((value) => value + 1)}>Next</Button>
                  </div>
                </div>
              </>
            ) : <p className="py-6 text-center text-sm text-muted-foreground">No eligible active users match this search.</p>}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Send plan offer</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            {recipients.length ? (
              <div className="rounded-md border p-3">
                <p className="font-medium">{recipients.length === 1 ? recipients[0].display_name : `${recipients.length} users selected`}</p>
                {recipients.length === 1
                  ? <p className="text-xs text-muted-foreground">{recipients[0].email}</p>
                  : <p className="text-xs text-muted-foreground">{recipients.slice(0, 3).map((candidate) => candidate.display_name).join(", ")}{recipients.length > 3 ? ` and ${recipients.length - 3} more` : ""}</p>}
                {recipientSubscriptionsLoading
                  ? <p className="mt-2 text-xs text-muted-foreground">Loading current subscriptions…</p>
                  : recipientSubscriptionsError
                    ? <p role="alert" className="mt-2 text-xs text-destructive">Could not load one or more subscriptions. Refresh or reselect the users.</p>
                    : isBulkMode
                      ? <p className="mt-2 text-xs text-muted-foreground">The same offer will be sent individually. Users must accept before access changes.</p>
                      : <p className="mt-2 text-xs text-muted-foreground">Current access: {subscription.data?.effective.plan_display_name} · {subscription.data?.effective.status}</p>}
              </div>
            ) : <p className="rounded-md border border-dashed p-4 text-sm text-muted-foreground">Select a user, draw a candidate, or check multiple users to start.</p>}
            <div className="space-y-1">
              <Label htmlFor="upgrade-plan">Plan</Label>
              <Select value={plan} onValueChange={setPlan} disabled={!recipientDetails.length || recipientSubscriptionsLoading || recipientSubscriptionsError}>
                <SelectTrigger id="upgrade-plan"><SelectValue placeholder="Choose a plan" /></SelectTrigger>
                <SelectContent>
                  {commonPlans.map((item) => <SelectItem key={item.key} value={item.key}>{item.display_name}</SelectItem>)}
                </SelectContent>
              </Select>
              {recipients.length > 0 && !recipientSubscriptionsLoading && !recipientSubscriptionsError && commonPlans.length === 0 && <p className="text-xs text-muted-foreground">No eligible plan is available for every selected user.</p>}
              {selectedPlan && <p className="text-xs text-muted-foreground">{isBulkMode ? "This plan is available to every selected user." : `Offer tier: ${selectedPlan.monthly_price > (subscription.data?.available_plans.find((item) => item.key === subscription.data?.effective.plan_key)?.monthly_price ?? 0) ? "upgrade" : "plan change"}.`}</p>}
            </div>
            <div className="space-y-1"><Label htmlFor="upgrade-duration">Access duration after acceptance (days)</Label><Input id="upgrade-duration" type="number" min={1} max={3650} value={durationDays} onChange={(event) => setDurationDays(event.target.value)} /></div>
            <div className="space-y-1"><Label htmlFor="upgrade-reason">Reason</Label><Textarea id="upgrade-reason" maxLength={2000} value={reason} onChange={(event) => setReason(event.target.value)} placeholder="Why is this user receiving the offer?" /></div>
            <label className="flex items-start gap-2 text-xs"><input type="checkbox" checked={acknowledged} onChange={(event) => setAcknowledged(event.target.checked)} /><span>I understand no access changes until the user accepts. The offer expires in 7 days.</span></label>
            {offer.isError && <p role="alert" className="text-sm text-destructive">Offer was not sent. Verify the subscription and try again.</p>}
            {failedOfferNames.length > 0 && <p role="alert" className="text-sm text-destructive">Offer failed for: {failedOfferNames.join(", ")}</p>}
            <Button className="w-full" disabled={!!formError || recipientDetails.length !== recipients.length || recipientSubscriptionsLoading || recipientSubscriptionsError || !acknowledged || offer.isPending} onClick={() => offer.mutate()}>
              {offer.isPending && <Loader2 className="mr-2 size-4 animate-spin" />}{recipients.length > 1 ? `Send offers to ${recipients.length} users` : "Send acceptance-required offer"}
            </Button>
            {formError && <p className="text-xs text-muted-foreground">{formError}</p>}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
