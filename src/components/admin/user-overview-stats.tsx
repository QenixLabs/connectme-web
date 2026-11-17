"use client";

import { useQuery } from "@tanstack/react-query";
import { Users, UserCheck, Clock3, Eye } from "lucide-react";
import { adminApi } from "@/lib/api";
import { Button } from "@/components/ui/button";

export function UserOverviewStats({ role }: { role: "talent" | "provider" | "recruiter" }) {
  const { data, isError, isFetching, refetch } = useQuery({
    queryKey: ["admin-user-overview", role],
    queryFn: () => adminApi.getUserOverview(role),
  });
  const summary = isError ? undefined : data;

  return (
    <div className="space-y-3">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: `Total ${role === "talent" ? "talent" : `${role}s`}`, value: summary?.total, icon: Users },
          { label: "Active accounts", value: summary?.active, icon: UserCheck },
          { label: "Recently active · 30d", value: summary?.recently_active, icon: Clock3 },
          { label: "Verified / email verified", value: summary?.verified, icon: Eye },
        ].map(({ label, value, icon: Icon }) => (
          <div key={label} className="rounded-xl border bg-card p-4">
            <div className="flex items-center justify-between gap-2 text-sm text-muted-foreground"><span>{label}</span><Icon className="size-4 shrink-0" /></div>
            <p className="mt-2 text-2xl font-semibold">{value?.toLocaleString() ?? "—"}</p>
          </div>
        ))}
      </div>
      {isError ? (
        <div role="alert" className="flex items-center gap-2 text-sm text-destructive">
          Could not load overview totals.
          <Button variant="outline" size="sm" disabled={isFetching} onClick={() => void refetch()}>Retry</Button>
        </div>
      ) : <p className="text-xs text-muted-foreground">Across all {role === "talent" ? "talent" : `${role}s`} accounts, independent of search and pagination.</p>}
    </div>
  );
}
