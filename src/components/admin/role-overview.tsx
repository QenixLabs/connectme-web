"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Search, ChevronLeft, ChevronRight, ExternalLink } from "lucide-react";
import { adminApi, type AdminUser } from "@/lib/api";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { UserOverviewStats } from "./user-overview-stats";

type OverviewRole = "provider" | "recruiter";
const PAGE_SIZE = 25;
const labels = {
  provider: {
    title: "Provider",
    description: "Provider profiles, services, inquiry availability, activity, and account health.",
    search: "Search business, name, email, phone…",
  },
  recruiter: {
    title: "Recruiter",
    description: "Recruiter profiles, companies, verification, activity, and account health.",
    search: "Search company, email, phone…",
  },
};

function formatDate(value?: string) {
  if (!value) return "Never";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "—" : date.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

function OverviewRow({ user, role }: { user: AdminUser; role: OverviewRole }) {
  const name = user.display_name || user.email;
  const location = [user.location?.city, user.location?.country].filter(Boolean).join(", ");
  const tags = role === "provider" ? user.categories : user.specialties;
  return (
    <tr className="border-b last:border-0 hover:bg-muted/30">
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          {user.profile_photo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={user.profile_photo} alt="" className="size-10 rounded-full object-cover" />
          ) : <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">{name.slice(0, 1).toUpperCase()}</div>}
          <div className="min-w-0">
            <p className="font-medium">{name}</p>
            <p className="text-xs text-muted-foreground">{user.email}</p>
          </div>
        </div>
      </td>
      <td className="px-4 py-3">
        <p className="mb-1 capitalize">{(role === "provider" ? user.provider_type : user.company_size)?.replaceAll("_", " ") || "—"}</p>
        <div className="flex max-w-56 flex-wrap gap-1">
          {(tags || []).slice(0, 3).map((tag) => <span key={tag} className="rounded-full bg-muted px-2 py-0.5 text-xs">{tag}</span>)}
        </div>
        {location && <p className="mt-1 text-xs text-muted-foreground">{location}</p>}
      </td>
      <td className="px-4 py-3">
        {role === "provider" ? <>
          <span className={`rounded-full px-2 py-1 text-xs ${user.accepting_inquiries ? "bg-emerald-100 text-emerald-700" : "bg-muted text-muted-foreground"}`}>
            {user.accepting_inquiries == null ? "Unknown" : user.accepting_inquiries ? "Accepting inquiries" : "Inquiries paused"}
          </span>
          <p className="mt-2 text-xs text-muted-foreground">{user.onboarding_completed == null ? "No provider profile" : user.onboarding_completed ? "Onboarding complete" : "Onboarding incomplete"}</p>
        </> : <span className="rounded-full bg-muted px-2 py-1 text-xs capitalize">{(user.verification_status || "unknown").replaceAll("_", " ")}</span>}
      </td>
      <td className="px-4 py-3">
        <p className="capitalize">{user.status}</p>
        <p className="text-xs text-muted-foreground">Tier {user.verification_tier} · Trust {user.trust_score}</p>
        <p className="text-xs text-muted-foreground">{user.report_count} reports</p>
      </td>
      <td className="px-4 py-3">
        <p>{formatDate(user.last_active_at)}</p>
        <p className="text-xs text-muted-foreground">Joined {formatDate(user.created_at)}</p>
      </td>
      <td className="px-4 py-3 text-right">
        <Button variant="outline" size="sm" asChild>
          <Link href={`/admin/users?userId=${encodeURIComponent(user._id)}`}>Details <ExternalLink className="ml-1 size-3.5" /></Link>
        </Button>
      </td>
    </tr>
  );
}

export function RoleOverview({ role }: { role: OverviewRole }) {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");
  const copy = labels[role];
  const { data, isPending, isError, refetch } = useQuery({
    queryKey: ["admin-role-overview", role, page, query],
    queryFn: () => adminApi.getUsers({
      role, page, limit: PAGE_SIZE, search: query || undefined,
      sort_by: "last_active_at", sort_order: "desc",
    }),
  });

  useEffect(() => {
    const timer = window.setTimeout(() => { setPage(1); setQuery(search.trim()); }, 250);
    return () => window.clearTimeout(timer);
  }, [search]);

  const users = data?.users || [];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-sm text-muted-foreground">Admin / Management</p>
          <h1 className="text-2xl font-semibold tracking-tight">{copy.title} overview</h1>
          <p className="mt-1 text-sm text-muted-foreground">{copy.description}</p>
        </div>
        <Button variant="outline" asChild><Link href="/admin/users">All users</Link></Button>
      </div>

      <UserOverviewStats role={role} />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input aria-label={`Search ${role}s`} value={search} onChange={(event) => setSearch(event.target.value)} placeholder={copy.search} className="pl-9" />
        </div>
        <p className="text-sm text-muted-foreground">{isError ? "Unable to load results" : data ? `${data.total.toLocaleString()} ${role}s` : `Loading ${role}s…`}</p>
      </div>

      <div className="overflow-hidden rounded-xl border bg-card">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1050px] text-left text-sm" aria-label={`${copy.title} overview`}>
            <thead className="border-b bg-muted/40 text-xs uppercase tracking-wide text-muted-foreground">
              <tr>{[copy.title, role === "provider" ? "Type / categories / location" : "Company / specialties / location", role === "provider" ? "Inquiry availability" : "Verification", "Account health", "Activity", ""].map((heading, index) => <th key={`${heading}-${index}`} className="px-4 py-3 font-medium">{heading}</th>)}</tr>
            </thead>
            <tbody>
              {isPending && <tr><td colSpan={6} className="px-4 py-12 text-center text-muted-foreground">Loading {role} profiles…</td></tr>}
              {isError && <tr><td colSpan={6} className="px-4 py-12 text-center text-destructive">Could not load {role} users. <button className="underline" onClick={() => void refetch()}>Retry</button></td></tr>}
              {!isPending && !isError && users.map((user) => <OverviewRow key={user._id} user={user} role={role} />)}
              {!isPending && !isError && users.length === 0 && <tr><td colSpan={6} className="px-4 py-12 text-center text-muted-foreground">No {role} profiles found.</td></tr>}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between border-t px-4 py-3">
          <p className="text-sm text-muted-foreground">Page {data?.page ?? page} of {Math.max(data?.total_pages ?? 1, 1)}</p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled={page <= 1 || isPending} onClick={() => setPage((current) => Math.max(current - 1, 1))}><ChevronLeft className="mr-1 size-4" />Previous</Button>
            <Button variant="outline" size="sm" disabled={page >= (data?.total_pages ?? 1) || isPending || isError} onClick={() => setPage((current) => current + 1)}>Next<ChevronRight className="ml-1 size-4" /></Button>
          </div>
        </div>
      </div>
    </div>
  );
}
