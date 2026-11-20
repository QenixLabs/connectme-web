"use client";

import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, ChevronLeft, ChevronRight, ExternalLink } from "lucide-react";
import { adminApi, type AdminUser } from "@/lib/api";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { UserOverviewStats } from "@/components/admin/user-overview-stats";

const PAGE_SIZE = 25;

function formatDate(value?: string) {
  if (!value) return "Never";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "—" : date.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

function TalentRow({ user }: { user: AdminUser }) {
  const name = user.display_name || user.username || user.email;
  const location = [user.location?.city, user.location?.country].filter(Boolean).join(", ");
  return (
    <tr className="border-b last:border-0 hover:bg-muted/30">
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          {user.profile_photo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={user.profile_photo} alt="" className="size-10 rounded-full object-cover" />
          ) : <div className="flex size-10 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">{name.slice(0, 1).toUpperCase()}</div>}
          <div className="min-w-0">
            <p className="truncate font-medium">{name}</p>
            <p className="truncate text-xs text-muted-foreground">{user.email}</p>
            {user.username && <p className="text-xs text-muted-foreground">@{user.username}</p>}
          </div>
        </div>
      </td>
      <td className="px-4 py-3">
        <div className="flex max-w-56 flex-wrap gap-1">
          {(user.professions || []).slice(0, 3).map((profession) => <span key={profession} className="rounded-full bg-muted px-2 py-0.5 text-xs">{profession}</span>)}
          {!user.professions?.length && <span className="text-sm text-muted-foreground">—</span>}
        </div>
        {location && <p className="mt-1 text-xs text-muted-foreground">{location}</p>}
      </td>
      <td className="px-4 py-3">
        <span className={`rounded-full px-2 py-1 text-xs capitalize ${user.availability === "available" ? "bg-emerald-100 text-emerald-700" : "bg-muted text-muted-foreground"}`}>
          {(user.availability || "unknown").replaceAll("_", " ")}
        </span>
      </td>
      <td className="px-4 py-3">
        <p className="capitalize">{user.status}</p>
        <p className="text-xs text-muted-foreground">Tier {user.verification_tier} · Trust {user.trust_score}</p>
      </td>
      <td className="px-4 py-3">
        <p>{formatDate(user.last_active_at)}</p>
        <p className="text-xs text-muted-foreground">Joined {formatDate(user.created_at)}</p>
      </td>
      <td className="px-4 py-3">
        <p>{user.analytics?.profile_views_30d ?? 0} views / 30d</p>
        <p className="text-xs text-muted-foreground">{user.analytics?.shortlist_count ?? 0} shortlists · {user.report_count} reports</p>
      </td>
      <td className="px-4 py-3 text-right">
        <div className="flex justify-end gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link href={`/admin/users?userId=${encodeURIComponent(user._id)}`}>Details <ExternalLink className="ml-1 size-3.5" /></Link>
          </Button>
          <Button variant="secondary" size="sm" asChild>
            <Link href={`/admin/users?userId=${encodeURIComponent(user._id)}`}>Manage subscription</Link>
          </Button>
        </div>
      </td>
    </tr>
  );
}

export default function AdminTalentsPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");
  const router = useRouter();
  const { data, isPending: loading, isError: error, refetch } = useQuery({
    queryKey: ["admin-role-overview", "talent", page, query],
    queryFn: () => adminApi.getUsers({
      role: "talent", page, limit: PAGE_SIZE, search: query || undefined,
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
          <h1 className="text-2xl font-semibold tracking-tight">Talent overview</h1>
          <p className="mt-1 text-sm text-muted-foreground">Talent profiles, availability, activity, reach, and account health.</p>
        </div>
        <Button variant="outline" onClick={() => router.push("/admin/users")}>All users</Button>
      </div>

      <UserOverviewStats role="talent" />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search name, email, username…" className="pl-9" />
        </div>
        <p className="text-sm text-muted-foreground">{data ? `${data.total.toLocaleString()} talents` : "Loading talents…"}</p>
      </div>

      <div className="overflow-hidden rounded-xl border bg-card">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1050px] text-left text-sm">
            <thead className="border-b bg-muted/40 text-xs uppercase tracking-wide text-muted-foreground">
              <tr>{["Talent", "Profession / location", "Availability", "Account health", "Activity", "Reach / reports", ""].map((heading, index) => <th key={`${heading}-${index}`} className="px-4 py-3 font-medium">{heading}</th>)}</tr>
            </thead>
            <tbody>
              {loading && <tr><td colSpan={7} className="px-4 py-12 text-center text-muted-foreground">Loading talent profiles…</td></tr>}
              {!loading && error && <tr><td colSpan={7} className="px-4 py-12 text-center text-destructive">Could not load talent users. Please try again. <button className="underline" onClick={() => void refetch()}>Retry</button></td></tr>}
              {!loading && !error && users.map((user) => <TalentRow key={user._id} user={user} />)}
              {!loading && !error && users.length === 0 && <tr><td colSpan={7} className="px-4 py-12 text-center text-muted-foreground">No talent profiles found.</td></tr>}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between border-t px-4 py-3">
          <p className="text-sm text-muted-foreground">Page {data?.page ?? page} of {Math.max(data?.total_pages ?? 1, 1)}</p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled={page <= 1 || loading} onClick={() => setPage((current) => Math.max(current - 1, 1))}><ChevronLeft className="mr-1 size-4" />Previous</Button>
            <Button variant="outline" size="sm" disabled={page >= (data?.total_pages ?? 1) || loading} onClick={() => setPage((current) => current + 1)}>Next<ChevronRight className="ml-1 size-4" /></Button>
          </div>
        </div>
      </div>
    </div>
  );
}
