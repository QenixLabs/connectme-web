"use client";

import { useEffect, useState, type MouseEvent } from "react";
import { KeyRound, ShieldCheck, UserPlus, Save, Loader2, Check, Info } from "lucide-react";
import { adminApi, type AdminAccount, type AuditLogItem } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { format } from "date-fns";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";

type Permission = { value: string; label: string; description: string; allows: string[] };
type PermissionGroup = { name: string; description: string; permissions: Permission[] };

const GROUPS: PermissionGroup[] = [
  { name: "Overview", description: "Read-only operational summaries.", permissions: [
    { value: "dashboard.view", label: "View dashboard", description: "See admin dashboard totals and activity charts.", allows: ["View platform health, user counts, and recent admin activity", "Filter dashboard activity by time period"] },
  ]},
  { name: "Users", description: "Give access to one user-management action at a time.", permissions: [
    { value: "users.view", label: "View users", description: "Open the user directory and individual user profiles.", allows: ["Search and filter users", "View profile, account, role, and verification details"] },
    { value: "users.export", label: "Export users", description: "Download the user directory as an Excel file.", allows: ["Export the currently filtered user list", "Download user data for operational reporting"] },
    { value: "users.view_activity", label: "View user activity", description: "Read a user’s activity timeline.", allows: ["Open activity history on a user profile", "Inspect recorded account events"] },
    { value: "users.view_history", label: "View user history", description: "Read moderation history and staff notes.", allows: ["View past moderation actions", "Read existing internal notes"] },
    { value: "users.manage_status", label: "Change user status", description: "Change account status without granting moderation actions.", allows: ["Update account status", "Apply the status change recorded by the admin API"] },
    { value: "users.delete", label: "Delete users", description: "Permanently delete a user account.", allows: ["Delete a user from the admin profile"] },
    { value: "users.manage_notes", label: "Manage user notes", description: "Create internal notes on user profiles.", allows: ["Add staff-only notes", "Preserve the author and timestamp"] },
    { value: "users.manage_password", label: "Reset user passwords", description: "Set a new password for a user account.", allows: ["Change the password from the user profile", "Does not grant access to the current password"] },
  ]},
  { name: "Moderation", description: "Each high-impact moderation action is independent.", permissions: [
    { value: "moderation.warn", label: "Warn users", description: "Send a formal warning to a user.", allows: ["Record a warning with a reason"] },
    { value: "moderation.suspend", label: "Suspend users", description: "Temporarily restrict a user account.", allows: ["Suspend a user for a selected duration", "Record the suspension reason"] },
    { value: "moderation.ban", label: "Ban users", description: "Permanently restrict a user account.", allows: ["Ban a user", "Record the ban reason"] },
    { value: "moderation.unrestrict", label: "Remove restrictions", description: "Lift an existing user restriction.", allows: ["Unrestrict a user", "Record why the restriction was removed"] },
    { value: "moderation.mark_safe", label: "Mark users safe", description: "Mark a user as reviewed and safe.", allows: ["Mark a user safe after review", "Record the review reason"] },
  ]},
  { name: "Verifications", description: "Separate viewing the queue from deciding its outcome.", permissions: [
    { value: "verifications.view", label: "View verifications", description: "Read verification queues and submissions.", allows: ["View pending requests", "Open verification details"] },
    { value: "verifications.review", label: "Review verifications", description: "Approve or reject verification requests.", allows: ["Approve a verification", "Reject with review notes"] },
  ]},
  { name: "Reports", description: "Split report review from each type of change.", permissions: [
    { value: "reports.view", label: "View reports", description: "Read reports and related conversation context.", allows: ["List and open reports", "Read evidence and message context"] },
    { value: "reports.update_status", label: "Update report status", description: "Move reports through their workflow.", allows: ["Change a report’s status"] },
    { value: "reports.manage_notes", label: "Manage report notes", description: "Add or edit internal report notes.", allows: ["Write internal notes on reports"] },
    { value: "reports.manage_priority", label: "Manage report priority", description: "Set the priority of a report.", allows: ["Change report priority"] },
    { value: "reports.take_action", label: "Take report action", description: "Apply the chosen action from a report.", allows: ["Execute the report action in the review flow"] },
  ]},
  { name: "Subscriptions", description: "Keep subscription visibility separate from overrides.", permissions: [
    { value: "subscriptions.view", label: "View subscriptions", description: "Read a user’s subscription overview.", allows: ["Open subscription details for a user"] },
    { value: "subscriptions.manage", label: "Manage subscriptions", description: "Apply subscription overrides and offers.", allows: ["Change subscription access", "Create a subscription upgrade offer"] },
  ]},
  { name: "Administration", description: "Access to platform records and staff access.", permissions: [
    { value: "audit_logs.view", label: "View audit logs", description: "Read the record of administrative actions.", allows: ["Search and inspect audit events"] },
    { value: "admins.manage", label: "Manage admin access", description: "Create and edit staff admin accounts and permissions.", allows: ["Create staff admin accounts", "Change staff permissions or passwords"] },
    { value: "portfolio.view", label: "View portfolio queue", description: "Read portfolio items awaiting review.", allows: ["View talent portfolios and pending items"] },
    { value: "portfolio.review", label: "Review portfolio items", description: "Approve or reject portfolio items.", allows: ["Approve items", "Reject items with a reason"] },
  ]},
];

export default function AdminAccessPage() {
  const [accounts, setAccounts] = useState<AdminAccount[]>([]);
  const [selected, setSelected] = useState<AdminAccount | null>(null);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [permissions, setPermissions] = useState<string[]>(["users.view"]);
  const [auditAccount, setAuditAccount] = useState<AdminAccount | null>(null);
  const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>([]);
  const [auditBusy, setAuditBusy] = useState(false);
  const [busy, setBusy] = useState(false);
  const load = async () => setAccounts(await adminApi.getAdminAccounts());
  useEffect(() => { const timer = window.setTimeout(() => { load().catch(() => toast.error("Could not load admin accounts")); }, 0); return () => window.clearTimeout(timer); }, []);
  const toggle = (permission: string) => setPermissions((current) => current.includes(permission) ? current.filter((p) => p !== permission) : [...current, permission]);
  const resetForm = () => { setSelected(null); setUsername(""); setPassword(""); setPermissions(["users.view"]); };
  const save = async () => {
    setBusy(true);
    try {
      if (selected) await adminApi.updateAdminAccount(selected._id, { permissions, ...(password ? { password } : {}) });
      else await adminApi.createAdminAccount({ username, password, permissions });
      toast.success(selected ? "Admin access updated" : "Admin account created"); resetForm(); await load();
    } catch (error: unknown) {
      const message = typeof error === "object" && error !== null && "response" in error
        ? (error as { response?: { data?: { message?: string } } }).response?.data?.message
        : undefined;
      toast.error(message || "Could not save admin account");
    }
    finally { setBusy(false); }
  };
  const edit = (account: AdminAccount) => { setSelected(account); setUsername(account.username || ""); setPassword(""); setPermissions(account.admin_permissions || []); };
  const showAuditLogs = async (account: AdminAccount) => {
    setAuditAccount(account);
    setAuditLogs([]);
    setAuditBusy(true);
    try {
      const result = await adminApi.getAuditLogs({ actor_id: account._id, limit: 10, page: 1 });
      setAuditLogs(result.logs);
    } catch {
      toast.error("Could not load this admin's audit logs");
    } finally {
      setAuditBusy(false);
    }
  };
  const accountName = (account: AdminAccount) => account.username || account.email;
  const handleAccountListClick = (event: MouseEvent<HTMLDivElement>) => {
    const target = event.target as HTMLElement;
    const row = Array.from(event.currentTarget.children).find((child) => child.contains(target));
    const account = row ? accounts[Array.from(event.currentTarget.children).indexOf(row)] : undefined;
    if (account && !(target.closest("button"))) showAuditLogs(account);
  };
  return <div className="space-y-6">
    <div><h1 className="text-2xl font-semibold tracking-tight">Admin access</h1><p className="mt-1 max-w-3xl text-sm text-muted-foreground">Create staff accounts with least-privilege access. Every permission below controls one focused capability, and the explanation shows exactly what it can do.</p></div>
    <div className="grid gap-6 lg:grid-cols-[1fr_420px]">
      <Card><CardHeader><CardTitle className="flex items-center gap-2"><ShieldCheck className="h-5 w-5 text-primary" /> Admin accounts</CardTitle><CardDescription>The head admin has full control and cannot be edited here.</CardDescription></CardHeader><CardContent className="space-y-3" onClick={handleAccountListClick}>
        {accounts.map((account) => <div key={account._id} className="flex items-center justify-between rounded-lg border p-4"><div className="flex items-center gap-3"><div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary"><KeyRound className="h-4 w-4" /></div><div><p className="font-medium">{account.username || account.email}</p><p className="text-xs text-muted-foreground">{account.admin_level === "super_admin" ? "Head admin · Full control" : `${account.admin_permissions?.length || 0} focused permissions`}</p></div></div><div className="flex items-center gap-2"><Badge variant={account.status === "active" ? "secondary" : "destructive"}>{account.status}</Badge>{account.admin_level !== "super_admin" && <Button size="sm" variant="outline" onClick={() => edit(account)}>Edit</Button>}</div></div>)}
      </CardContent></Card>
      <Card><CardHeader><CardTitle className="flex items-center gap-2"><UserPlus className="h-5 w-5" /> {selected ? "Edit admin" : "Create admin"}</CardTitle><CardDescription>{selected ? "Update permissions or set a new password." : "Choose only the capabilities this staff member needs."}</CardDescription></CardHeader><CardContent className="space-y-4">
        <Input placeholder="Username (e.g. admin1)" value={username} disabled={!!selected} onChange={(e) => setUsername(e.target.value)} />
        <Input type="password" placeholder={selected ? "New password (optional)" : "Password (8+ characters)"} value={password} onChange={(e) => setPassword(e.target.value)} />
        <div className="rounded-lg border bg-muted/30 p-3 text-xs text-muted-foreground"><Info className="mr-1 inline h-3.5 w-3.5" />Selected permissions are enforced by the API on each admin request.</div>
        <div className="space-y-5"><div className="flex items-center justify-between"><p className="text-sm font-medium">Focused permissions</p><Badge variant="outline">{permissions.length} selected</Badge></div>{GROUPS.map((group) => <div key={group.name} className="space-y-2"><div><p className="text-sm font-semibold">{group.name}</p><p className="text-xs text-muted-foreground">{group.description}</p></div>{group.permissions.map((permission) => <label key={permission.value} className="flex cursor-pointer gap-3 rounded-lg border p-3 transition-colors hover:bg-muted/40"><Checkbox checked={permissions.includes(permission.value)} onCheckedChange={() => toggle(permission.value)} /><span className="min-w-0 space-y-1"><span className="block text-sm font-medium">{permission.label}</span><span className="block text-xs text-muted-foreground">{permission.description}</span><span className="block text-xs text-foreground/80"><Check className="mr-1 inline h-3 w-3 text-primary" />{permission.allows.join(" · ")}</span></span></label>)}</div>)}</div>
        <div className="flex gap-2"><Button className="flex-1" onClick={save} disabled={busy || (!password && !selected) || !username}>{busy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}{selected ? "Save changes" : "Create account"}</Button>{selected && <Button variant="ghost" onClick={resetForm}>Cancel</Button>}</div>
      </CardContent></Card>
    </div>
    <Sheet open={!!auditAccount} onOpenChange={(open) => { if (!open) setAuditAccount(null); }}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Latest audit logs</SheetTitle>
          <SheetDescription>{auditAccount ? `Recent activity by ${accountName(auditAccount)}.` : ""}</SheetDescription>
        </SheetHeader>
        <div className="space-y-3 overflow-y-auto px-4 pb-6">
          {auditBusy ? <div className="flex items-center gap-2 py-6 text-sm text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" /> Loading audit logs…</div> : auditLogs.length === 0 ? <p className="py-6 text-sm text-muted-foreground">No audit logs found for this admin.</p> : auditLogs.map((log) => <div key={log._id} className="rounded-lg border p-3"><p className="text-sm font-medium">{log.action.replace(/[._]/g, " ")}</p><p className="mt-1 text-xs text-muted-foreground">{log.target_type} · {format(new Date(log.created_at), "PP p")}</p></div>)}
        </div>
      </SheetContent>
    </Sheet>
  </div>;
}
