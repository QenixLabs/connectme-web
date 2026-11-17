"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Check, ExternalLink, FileText, Loader2, RefreshCw, Search } from "lucide-react";
import { adminApi, type VerificationOverviewQuery, type VerificationOverviewUser } from "@/lib/api/admin";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const documentLabels: Record<string, string> = {
  not_started: "Not started",
  pending: "Draft / not submitted",
  manual_review: "Under review",
  approved: "Approved",
  auto_approved: "Auto-approved",
  rejected: "Rejected",
};
const roleLabels: Record<string, string> = { talent: "Talent", recruiter: "Recruiter", provider: "Provider" };
const number = (value: number) => value.toLocaleString();
const date = (value?: string) => value ? new Date(value).toLocaleString() : "Not recorded";

function Status({ complete, label }: { complete: boolean; label?: string }) {
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium ${complete ? "bg-success-soft text-success" : "bg-muted text-muted-foreground"}`}>
      {complete && <Check className="size-3" />}
      {label ?? (complete ? "Verified" : "Not verified")}
    </span>
  );
}

function Filter({ label, value, options, onChange }: {
  label: string; value: string; options: Record<string, string>; onChange: (value: string) => void;
}) {
  return (
    <div className="space-y-1.5">
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger aria-label={label} className="w-full"><SelectValue /></SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All {label.toLowerCase()}</SelectItem>
          {Object.entries(options).map(([key, text]) => <SelectItem key={key} value={key}>{text}</SelectItem>)}
        </SelectContent>
      </Select>
    </div>
  );
}

export function VerificationOverview() {
  const [filters, setFilters] = useState<VerificationOverviewQuery>({ page: 1, limit: 20 });
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<VerificationOverviewUser | null>(null);
  const { data, isPending, isFetching, isError, refetch } = useQuery({
    queryKey: ["admin-verification-overview", filters],
    queryFn: () => adminApi.getVerificationOverview(filters),
  });
  const updateFilters = (next: Partial<VerificationOverviewQuery>) => setFilters((current) => ({ ...current, ...next, page: 1 }));
  const summary = data?.summary;
  const cards = [
    { label: "Total users", value: summary?.total, hint: "Talent, recruiter and provider accounts", filter: {} },
    { label: "Verified users", value: summary?.verified, hint: "Current account tier 3", filter: { verification: "verified" } },
    { label: "Not verified", value: summary?.unverified, hint: "Current account tier 1 or 2", filter: { verification: "unverified" } },
    { label: "Under review", value: summary?.manual_review, hint: "Latest documents awaiting review", filter: { document_status: "manual_review" } },
    { label: "Drafts", value: summary?.pending, hint: "Started, but not submitted for review", filter: { document_status: "pending" } },
    { label: "Rejected", value: summary?.rejected, hint: "Latest document review rejected", filter: { document_status: "rejected" } },
  ];

  return (
    <section className="space-y-6" aria-label="Verification overview">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">User verification</h1>
          <p className="mt-1 text-sm text-muted-foreground">Account verification, contact checks and document reviews in one place.</p>
        </div>
        <Button variant="outline" onClick={() => void refetch()} disabled={isFetching}>
          <RefreshCw className={`mr-2 size-4 ${isFetching ? "animate-spin" : ""}`} />Refresh overview
        </Button>
      </div>

      {isError ? (
        <Alert variant="destructive"><AlertDescription>Could not load verification data. <button className="underline" onClick={() => void refetch()}>Try again</button></AlertDescription></Alert>
      ) : (
        <>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
            {cards.map((card) => (
              <button key={card.label} className="rounded-xl border bg-card p-4 text-left transition-colors hover:bg-muted/50 focus-visible:outline-2 focus-visible:outline-ring"
                onClick={() => { setSearch(""); setFilters({ page: 1, limit: filters.limit, ...card.filter }); }}>
                <p className="text-sm font-medium text-muted-foreground">{card.label}</p>
                <p className="my-2 text-3xl font-semibold tabular-nums">{card.value === undefined ? "—" : number(card.value)}</p>
                <p className="text-xs text-muted-foreground">{card.hint}</p>
              </button>
            ))}
          </div>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Verification by role</CardTitle>
              <p className="text-sm text-muted-foreground">
                Global totals · one count per user · primary account role · deleted accounts and admins excluded.
              </p>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[850px] text-sm">
                  <thead className="border-b text-muted-foreground">
                    <tr>{["Role", "Total", "Verified", "Not verified", "Verified %", "Under review", "Draft", "Rejected", "Not started", "Email verified", "Phone verified"].map((heading) => <th key={heading} className="px-3 py-3 text-left font-medium">{heading}</th>)}</tr>
                  </thead>
                  <tbody className="divide-y">
                    {data?.by_role.map((row) => (
                      <tr key={row.role}>
                        <td className="px-3 py-3"><button className="font-medium text-primary hover:underline" onClick={() => { setSearch(""); setFilters({ page: 1, limit: filters.limit, role: row.role }); }}>{roleLabels[row.role]}</button></td>
                        {[row.total, row.verified, row.unverified].map((value, index) => <td key={index} className="px-3 py-3 tabular-nums">{number(value)}</td>)}
                        <td className="px-3 py-3 tabular-nums">{row.total ? `${Math.round(row.verified / row.total * 100)}%` : "—"}</td>
                        {[row.manual_review, row.pending, row.rejected, row.not_started, row.email_verified, row.phone_verified].map((value, index) => <td key={index} className="px-3 py-3 tabular-nums">{number(value)}</td>)}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="text-xs leading-relaxed text-muted-foreground">
                Verified means current account tier 3. Tier 1 is the basic account level; tier 2 is the contact-verification level.
                Email and phone columns show actual checks separately. Document counts use the latest submission and overlap with account totals; they are not extra users.
              </p>
            </CardContent>
          </Card>
        </>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">All users & verification details</CardTitle>
          <p className="text-sm text-muted-foreground">Includes users who have never started document verification. Review submitted documents in the queue below.</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <form className="flex gap-2" onSubmit={(event) => { event.preventDefault(); updateFilters({ search: search.trim() || undefined }); }}>
            <Input aria-label="Search users" placeholder="Search name, email, phone or username" value={search} onChange={(event) => setSearch(event.target.value)} />
            <Button type="submit" variant="outline"><Search className="mr-2 size-4" />Search</Button>
          </form>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Filter label="Roles" value={filters.role ?? "all"} options={roleLabels} onChange={(value) => updateFilters({ role: value === "all" ? undefined : value })} />
            <Filter label="Verification statuses" value={filters.verification ?? "all"} options={{ verified: "Verified", unverified: "Not verified" }} onChange={(value) => updateFilters({ verification: value === "all" ? undefined : value })} />
            <Filter label="Document statuses" value={filters.document_status ?? "all"} options={documentLabels} onChange={(value) => updateFilters({ document_status: value === "all" ? undefined : value })} />
            <Filter label="Tiers" value={filters.tier?.toString() ?? "all"} options={{ "1": "Tier 1 · Basic", "2": "Tier 2 · Contact", "3": "Tier 3 · Verified" }} onChange={(value) => updateFilters({ tier: value === "all" ? undefined : Number(value) })} />
          </div>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm text-muted-foreground" aria-live="polite">{isPending ? "Loading users…" : isError ? "Data unavailable" : `${number(data?.total ?? 0)} matching users`}</p>
            <Button variant="ghost" size="sm" onClick={() => { setSearch(""); setFilters({ page: 1, limit: 20 }); }}>Clear filters</Button>
          </div>
          {isPending ? <div className="flex justify-center py-10"><Loader2 className="size-6 animate-spin" aria-label="Loading verification data" /></div> : isError ? null : data?.users.length === 0 ? (
            <p className="py-10 text-center text-sm text-muted-foreground">No users match these filters.</p>
          ) : (
            <div className="overflow-x-auto rounded-lg border">
              <table className="w-full min-w-[1050px] text-sm">
                <thead className="bg-muted text-muted-foreground"><tr>{["User / role", "Account", "Email", "Phone", "Latest documents", "Joined", "Details"].map((heading) => <th key={heading} className="px-4 py-3 text-left font-medium">{heading}</th>)}</tr></thead>
                <tbody className="divide-y">
                  {data?.users.map((user) => (
                    <tr key={user._id} className="hover:bg-muted/30">
                      <td className="max-w-64 px-4 py-3"><p className="truncate font-medium">{user.name || user.email}</p><p className="truncate text-xs text-muted-foreground">{user.email}</p><p className="mt-1 text-xs text-muted-foreground">{roleLabels[user.role]} · <span className="capitalize">{user.status}</span></p></td>
                      <td className="px-4 py-3"><Status complete={user.is_verified} /><p className="mt-1 text-xs text-muted-foreground">Tier {user.verification_tier}</p></td>
                      <td className="px-4 py-3"><Status complete={user.is_email_verified} /></td>
                      <td className="px-4 py-3"><Status complete={user.is_phone_verified} /><p className="mt-1 text-xs text-muted-foreground">{user.phone || "No phone added"}</p></td>
                      <td className="px-4 py-3"><p className={user.document_status === "rejected" ? "text-destructive" : user.document_status === "manual_review" ? "text-warning" : ""}>{documentLabels[user.document_status] ?? user.document_status}</p><p className="mt-1 text-xs text-muted-foreground">{user.document_count} document{user.document_count === 1 ? "" : "s"}</p></td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">{date(user.created_at)}</td>
                      <td className="px-4 py-3"><Button variant="outline" size="sm" onClick={() => setSelected(user)}>View details</Button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {data && !isError && data.total > 0 && (
            <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
              <span className="text-muted-foreground">Showing {number((data.page - 1) * data.limit + 1)}–{number(Math.min(data.page * data.limit, data.total))} of {number(data.total)}</span>
              <div className="flex items-center gap-3">
                <Button variant="outline" size="sm" disabled={isFetching || data.page <= 1} onClick={() => setFilters((current) => ({ ...current, page: data.page - 1 }))}>Previous</Button>
                <span>Page {data.page} of {data.total_pages}</span>
                <Button variant="outline" size="sm" disabled={isFetching || data.page >= data.total_pages} onClick={() => setFilters((current) => ({ ...current, page: data.page + 1 }))}>Next</Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!selected} onOpenChange={(open) => { if (!open) setSelected(null); }}>
        <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader><DialogTitle>Verification details</DialogTitle><DialogDescription>{selected?.name || selected?.email} · {selected ? roleLabels[selected.role] : ""}</DialogDescription></DialogHeader>
          {selected && (
            <div className="space-y-5">
              <div className="flex flex-wrap items-center gap-2"><Status complete={selected.is_verified} /><span className="text-sm">Tier {selected.verification_tier}</span><span className="text-sm text-muted-foreground">Account: {selected.status}</span></div>
              <dl className="grid gap-4 text-sm sm:grid-cols-2">
                {[
                  ["User ID", selected._id], ["Email", selected.email],
                  ["Email check", selected.is_email_verified ? "Verified" : "Not verified"],
                  ["Phone", selected.phone || "Not added"],
                  ["Phone check", selected.is_phone_verified ? "Verified" : "Not verified"],
                  ["Account created", date(selected.created_at)],
                  ["Document status", documentLabels[selected.document_status] ?? selected.document_status],
                  ["Verification type", selected.verification?.type.replaceAll("_", " ") || "Not started"],
                  ["Verification started", date(selected.verification?.created_at)],
                  ["Last document update", date(selected.verification?.updated_at)],
                  ["Reviewer ID", selected.verification?.reviewed_by || "No manual reviewer recorded"],
                ].map(([label, value]) => <div key={label}><dt className="text-xs text-muted-foreground">{label}</dt><dd className="mt-1 break-words">{value}</dd></div>)}
              </dl>
              <div><h3 className="text-sm font-medium">Review notes / rejection reason</h3><p className="mt-1 whitespace-pre-wrap break-words text-sm text-muted-foreground">{selected.verification?.review_notes || "No review notes recorded."}</p></div>
              <div className="space-y-2">
                <h3 className="text-sm font-medium">Latest documents ({selected.document_count})</h3>
                {!selected.verification?.docs.length && <p className="text-sm text-muted-foreground">No documents uploaded.</p>}
                {selected.verification?.docs.map((doc, index) => (
                  <a key={index} href={doc.download_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 rounded-md border p-3 text-sm hover:bg-muted">
                    <FileText className="size-4" /><span className="flex-1">{doc.type.replaceAll("_", " ")}</span><ExternalLink className="size-4" />
                  </a>
                ))}
              </div>
              {selected.document_status === "manual_review" && <p className="rounded-md bg-muted p-3 text-sm">Documents await review. Use the Verification Review Queue below to approve or reject.</p>}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
}
