"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { AlertTriangle, Ban, Clock3, Flag, Gavel, Search, ShieldCheck, Users } from "lucide-react";
import { adminApi, type AdminUser, type DashboardStats, type PaginatedUsers } from "@/lib/api";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const PAGE_SIZE = 25;

export default function BulkModerationPage() {
  const [result, setResult] = useState<PaginatedUsers | null>(null);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [selected, setSelected] = useState<string[]>([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [sort, setSort] = useState("report_count");
  const [page, setPage] = useState(1);
  const [action, setAction] = useState("suspend");
  const [duration, setDuration] = useState("7");
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const load = useCallback(async () => {
    try {
      const [users, dashboard] = await Promise.all([
        adminApi.getUsers({ page, limit: PAGE_SIZE, search: search || undefined, status: status === "all" ? undefined : status, sort_by: sort, sort_order: "desc" }),
        adminApi.getDashboardStats(),
      ]);
      setResult(users);
      setStats(dashboard);
      setError("");
    } catch {
      setError("Could not load moderation data. Check your connection and try again.");
    }
  }, [page, search, status, sort]);

  useEffect(() => {
    let cancelled = false;
    void Promise.resolve().then(() => {
      if (!cancelled) return load();
    });
    return () => { cancelled = true; };
  }, [load]);

  const toggle = (id: string) => setSelected((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);
  const runAction = async () => {
    if (!selected.length || !reason.trim()) { setError("Select users and enter a moderation reason."); return; }
    const verb = action === "ban" ? "permanently ban" : action === "suspend" ? `suspend for ${duration} days` : "restore";
    if (!window.confirm(`${verb} ${selected.length} selected account(s)? This action will be recorded.`)) return;
    setBusy(true); setError(""); setNotice("");
    let completed = 0;
    let failed = 0;
    for (const id of selected) {
      try {
        if (action === "ban") await adminApi.banUser(id, reason.trim());
        else if (action === "suspend") await adminApi.suspendUser(id, reason.trim(), duration);
        else await adminApi.unrestrictUser(id, reason.trim());
        completed++;
      } catch {
        failed++;
      }
    }
    setBusy(false); setSelected([]);
    const actionLabel = action === "restore" ? "restored" : action === "ban" ? "banned" : "suspended";
    setNotice(`${completed} of ${selected.length} accounts ${actionLabel}.${failed ? ` ${failed} failed; review the account status and retry if needed.` : ""}`);
    if (completed) {
      toast.success("Moderation action complete", {
        description: `${completed} of ${selected.length} selected account${selected.length === 1 ? "" : "s"} were processed.`,
      });
    }
    if (failed) {
      toast.error("Some moderation actions failed", {
        description: `${failed} selected account${failed === 1 ? "" : "s"} could not be processed.`,
      });
    }
    await load();
  };

  const users: AdminUser[] = result?.users ?? [];
  const metrics = [
    { label: "Total reports", value: stats?.pending_reports ?? "—", icon: Flag, style: "text-amber-600" },
    { label: "Suspended users", value: stats?.suspended_users ?? "—", icon: Clock3, style: "text-orange-600" },
    { label: "High-priority reports", value: stats?.high_priority_reports ?? "—", icon: AlertTriangle, style: "text-rose-600" },
    { label: "Users matched", value: result?.total ?? "—", icon: Users, style: "text-primary" },
  ];

  return <div className="space-y-6 p-6">
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div><div className="flex items-center gap-2"><Gavel className="h-5 w-5 text-primary" /><h1 className="text-2xl font-semibold">Bulk moderation</h1></div><p className="mt-1 text-sm text-muted-foreground">Find risky accounts, review report history, and apply accountable actions.</p></div>
      <Badge variant="outline" className="gap-1"><ShieldCheck className="h-3.5 w-3.5" /> Actions are audited</Badge>
    </div>
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">{metrics.map((metric) => <Card key={metric.label}><CardContent className="flex items-center justify-between p-4"><div><p className="text-sm text-muted-foreground">{metric.label}</p><p className="mt-1 text-2xl font-semibold">{metric.value}</p></div><metric.icon className={`h-5 w-5 ${metric.style}`} /></CardContent></Card>)}</div>
    {error && <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>}
    {notice && <Alert><AlertDescription>{notice}</AlertDescription></Alert>}
    <Card><CardContent className="space-y-4 p-4">
      <div className="grid gap-3 md:grid-cols-[1fr_180px_180px]">
        <div className="relative"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><Input className="pl-9" placeholder="Search name, username, or email" value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} /></div>
        <Select value={status} onValueChange={(v) => { setStatus(v); setPage(1); }}><SelectTrigger><SelectValue placeholder="Account status" /></SelectTrigger><SelectContent><SelectItem value="all">All actions</SelectItem><SelectItem value="active">Active</SelectItem><SelectItem value="warning">Has warnings</SelectItem><SelectItem value="suspended">Suspended</SelectItem><SelectItem value="banned">Banned</SelectItem></SelectContent></Select>
        <Select value={sort} onValueChange={setSort}><SelectTrigger><SelectValue placeholder="Sort users" /></SelectTrigger><SelectContent><SelectItem value="report_count">Most reports</SelectItem><SelectItem value="created_at">Newest joined</SelectItem><SelectItem value="last_active_at">Recently active</SelectItem><SelectItem value="trust_score">Lowest trust score</SelectItem></SelectContent></Select>
      </div>
      <div className="overflow-x-auto rounded-md border"><Table><TableHeader><TableRow><TableHead><input aria-label="Select all visible users" type="checkbox" checked={users.length > 0 && users.every((u) => selected.includes(u._id))} onChange={(e) => setSelected(e.target.checked ? [...new Set([...selected, ...users.map((u) => u._id)])] : selected.filter((id) => !users.some((u) => u._id === id)))} /></TableHead><TableHead>User</TableHead><TableHead>Role</TableHead><TableHead>Status</TableHead><TableHead>Reports</TableHead><TableHead>Trust</TableHead><TableHead>Joined</TableHead></TableRow></TableHeader>
      <TableBody>{users.map((user) => <TableRow key={user._id}><TableCell><input aria-label={`Select ${user.display_name}`} type="checkbox" checked={selected.includes(user._id)} onChange={() => toggle(user._id)} /></TableCell><TableCell><div className="font-medium">{user.display_name || user.username || user.email}</div><div className="text-xs text-muted-foreground">{user.email}</div></TableCell><TableCell className="capitalize">{user.role}</TableCell><TableCell><Badge variant="outline" className="capitalize">{user.status}</Badge></TableCell><TableCell className={user.report_count > 0 ? "font-semibold text-rose-600" : ""}>{user.report_count}</TableCell><TableCell>{user.trust_score}</TableCell><TableCell>{new Date(user.created_at).toLocaleDateString()}</TableCell></TableRow>)}{users.length === 0 && <TableRow><TableCell colSpan={7} className="py-10 text-center text-muted-foreground">No matching users.</TableCell></TableRow>}</TableBody></Table></div>
      <div className="flex items-center justify-between text-sm text-muted-foreground"><span>{selected.length} selected · {result?.total ?? 0} matching users</span><div className="flex items-center gap-2"><Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>Previous</Button><span>Page {page} of {Math.max(1, result?.total_pages ?? 1)}</span><Button variant="outline" size="sm" disabled={page >= (result?.total_pages ?? 1)} onClick={() => setPage(page + 1)}>Next</Button></div></div>
    </CardContent></Card>
    <Card><CardContent className="flex flex-col gap-3 p-4 lg:flex-row lg:items-end">
      <div className="min-w-40"><label className="mb-1 block text-sm font-medium">Action</label><Select value={action} onValueChange={setAction}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="suspend">Suspend accounts</SelectItem><SelectItem value="ban">Permanently ban</SelectItem><SelectItem value="restore">Restore access</SelectItem></SelectContent></Select></div>
      {action === "suspend" && <div className="w-40"><label className="mb-1 block text-sm font-medium">Duration</label><Select value={duration} onValueChange={setDuration}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="1">1 day</SelectItem><SelectItem value="7">7 days</SelectItem><SelectItem value="30">30 days</SelectItem><SelectItem value="90">90 days</SelectItem></SelectContent></Select></div>}
      <div className="min-w-60 flex-1"><label className="mb-1 block text-sm font-medium">Reason (required)</label><Input value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Policy violation, investigation reference…" /></div>
      <Button variant={action === "ban" ? "destructive" : "default"} disabled={busy || !selected.length} onClick={runAction}>{action === "ban" ? <Ban className="mr-2 h-4 w-4" /> : null}{busy ? "Applying…" : `${action === "restore" ? "Restore" : action === "ban" ? "Ban" : "Suspend"} ${selected.length || ""} users`}</Button>
    </CardContent></Card>
  </div>;
}
