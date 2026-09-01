"use client";

import { useMemo, useState } from "react";
import { Search, SlidersHorizontal } from "lucide-react";
import { RequestCard } from "@/components/talent-app/RequestCard";
import { RequestFiltersSheet } from "@/components/talent-app/request-filters-sheet";
import { useMyRequests } from "@/hooks/use-requests";
import type { CollaborationRequest } from "@/lib/api/requests";
import { Skeleton } from "@/components/ui/skeleton";

const toneClass: Record<string, string> = {
  teal: "text-teal",
  green: "text-green-tag",
  violet: "text-violet-tag",
  red: "text-destructive",
};

export default function TalentRequestsPage() {
  const [active, setActive] = useState("Received");
  const [query, setQuery] = useState("");
  const [filterSheetOpen, setFilterSheetOpen] = useState(false);
  const [filters, setFilters] = useState({ status: "All Status", type: "All Types" });

  const { data, isLoading } = useMyRequests();

  const received = data?.received ?? [];
  const sent = data?.sent ?? [];

  const allRequests = useMemo(() => [...received, ...sent], [received, sent]);

  const historyRequests = useMemo(
    () =>
      allRequests.filter(
        (r) => r.status === "accepted" || r.status === "rejected",
      ),
    [allRequests],
  );

  const activeRequests: CollaborationRequest[] = useMemo(() => {
    switch (active) {
      case "Sent":
        return sent;
      case "History":
        return historyRequests;
      default:
        return received;
    }
  }, [active, sent, received, historyRequests]);

  const filtered = useMemo(() => {
    let result = activeRequests;

    if (filters.status !== "All Status") {
      const statusMap: Record<string, string> = {
        Pending: "pending",
        Accepted: "accepted",
        Rejected: "rejected",
      };
      result = result.filter((r) => r.status === statusMap[filters.status]);
    }

    if (filters.type !== "All Types") {
      const typeMap: Record<string, string> = {
        Recruiter: "recruiter",
        Mentor: "mentor",
        Collaborator: "collaborator",
      };
      result = result.filter((r) => {
        const role = r.requester_id.role;
        return role === typeMap[filters.type];
      });
    }

    if (query) {
      const q = query.toLowerCase();
      result = result.filter((r) => {
        const other =
          r.requester_id.role === "recruiter" ? r.requester_id : r.receiver_id;
        const name = other.full_legal_name || other.username || "";
        const company = other.company_name || "";
        const reason = r.reason || "";
        return `${name} ${company} ${reason}`.toLowerCase().includes(q);
      });
    }

    return result;
  }, [activeRequests, query, filters]);

  const stats = useMemo(() => {
    const pending = received.filter((r) => r.status === "pending").length;
    const connected = allRequests.filter(
      (r) => r.status === "accepted",
    ).length;
    const sentCount = sent.length;
    const declined = allRequests.filter(
      (r) => r.status === "rejected",
    ).length;
    return [
      { label: "Pending", value: pending, tone: "teal" as const },
      { label: "Connected", value: connected, tone: "green" as const },
      { label: "Sent", value: sentCount, tone: "violet" as const },
      { label: "Declined", value: declined, tone: "red" as const },
    ];
  }, [received, sent, allRequests]);

  const tabs = [
    { label: "Received", count: received.length },
    { label: "Sent", count: sent.length },
    { label: "History", count: null as number | null },
  ];

  if (isLoading) {
    return (
      <div className="page-gradient min-h-screen">
        <main className="mx-auto max-w-7xl px-5 pb-28 pt-8 lg:px-8 lg:pb-16">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="mt-2 h-5 w-96" />
          <div className="mt-6 flex gap-8">
            <Skeleton className="h-8 w-24" />
            <Skeleton className="h-8 w-24" />
            <Skeleton className="h-8 w-24" />
          </div>
          <div className="mt-6 grid gap-5 xl:grid-cols-2">
            <Skeleton className="h-64 rounded-2xl" />
            <Skeleton className="h-64 rounded-2xl" />
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="page-gradient min-h-screen">

      <main className="mx-auto max-w-7xl px-5 pb-28 pt-8 lg:px-8 lg:pb-16">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight lg:text-4xl">
              Connection Requests
            </h1>
            <p className="mt-2 text-muted-foreground">
              Manage requests from recruiters, mentors and collaborators.
            </p>
          </div>
        </div>

        <div className="mt-6 flex gap-8 border-b border-border">
          {tabs.map((tab) => (
            <button
              key={tab.label}
              onClick={() => setActive(tab.label)}
              className={`-mb-px flex items-center gap-2 border-b-2 pb-3 text-base font-medium transition-colors ${
                active === tab.label
                  ? "border-teal text-teal"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab.label}
              {tab.count !== null && (
                <span
                  className={`rounded-full px-2 py-0.5 text-xs ${
                    active === tab.label ? "bg-teal/15 text-teal" : "bg-secondary"
                  }`}
                >
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        <div className="mt-6 grid gap-8 lg:grid-cols-[1fr_20rem] lg:items-start">
          <div>
            <div className="flex gap-3">
              <label className="card-surface flex flex-1 items-center gap-3 rounded-xl px-4 py-3 focus-within:border-teal/50">
                <Search className="size-5 text-muted-foreground" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search by name, company or keyword..."
                  className="w-full bg-transparent text-base outline-none placeholder:text-muted-foreground"
                />
              </label>
              <button
                onClick={() => setFilterSheetOpen(true)}
                className="card-surface inline-flex items-center gap-2 rounded-xl px-5 text-base font-medium transition-colors hover:border-teal/40"
              >
                <SlidersHorizontal className="size-5 text-teal" />
                <span className="hidden sm:inline">Filters</span>
              </button>
            </div>

            <div className="mt-5 grid gap-5 xl:grid-cols-2">
              {filtered.map((request) => (
                <RequestCard
                  key={request._id}
                  request={request}
                  currentUserId=""
                />
              ))}
            </div>

            {filtered.length === 0 && (
              <p className="mt-16 text-center text-muted-foreground">
                {query ? `No requests match "${query}".` : "No requests to show."}
              </p>
            )}
          </div>

          <aside className="hidden lg:block lg:sticky lg:top-24 lg:space-y-5">
            <div className="card-surface rounded-2xl p-5">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                Overview
              </h2>
              <dl className="mt-4 grid grid-cols-2 gap-4">
                {stats.map((s) => (
                  <div key={s.label} className="rounded-xl bg-secondary/50 p-4">
                    <dt className="text-xs text-muted-foreground">{s.label}</dt>
                    <dd className={`mt-1 text-2xl font-bold ${toneClass[s.tone]}`}>{s.value}</dd>
                  </div>
                ))}
              </dl>
            </div>

          </aside>
        </div>
      </main>

      {/* Mobile stats bar + FAB */}
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-background/90 px-5 py-3 backdrop-blur-xl lg:hidden">
        <div className="card-surface flex items-center gap-2 overflow-x-auto rounded-xl px-4 py-3 text-sm">
          {stats.map((s, i) => (
            <span key={s.label} className="flex shrink-0 items-center gap-2">
              {i > 0 && <span className="text-muted-foreground/50">•</span>}
              <span className={`font-bold ${toneClass[s.tone]}`}>{s.value}</span>
              <span className="text-muted-foreground">{s.label}</span>
            </span>
          ))}
        </div>
      </div>

      <button
        aria-label="Filters"
        onClick={() => setFilterSheetOpen(true)}
        className="btn-accept fixed bottom-24 right-5 z-30 grid size-14 place-items-center rounded-full lg:hidden"
      >
        <SlidersHorizontal className="size-6" />
      </button>

      <RequestFiltersSheet
        open={filterSheetOpen}
        onOpenChange={setFilterSheetOpen}
        onApply={setFilters}
      />
    </div>
  );
}
