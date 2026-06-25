import { UserCheck, Clock, CheckCircle, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatsCardProps {
  icon: React.ReactNode;
  label: string;
  value: number | string;
  accent?: "brand" | "success" | "amber" | "muted";
}

function StatsCard({ icon, label, value, accent = "brand" }: StatsCardProps) {
  const accentStyles = {
    brand: "bg-brand/10 text-brand",
    success: "bg-success-light text-success",
    amber: "bg-amber-50 text-amber",
    muted: "bg-muted text-text-muted",
  };

  return (
    <div className="flex items-center gap-3 rounded-xl border border-border bg-card p-3.5">
      <div
        className={cn(
          "flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg",
          accentStyles[accent]
        )}
      >
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-lg font-semibold tabular-nums leading-tight text-text-primary">
          {value}
        </p>
        <p className="text-xs text-text-muted truncate">{label}</p>
      </div>
    </div>
  );
}

interface RequestsStatsBarProps {
  pendingCount: number;
  acceptedCount: number;
  rejectedCount: number;
  sentCount: number;
  sentAcceptedCount: number;
}

export function RequestsStatsBar({
  pendingCount,
  acceptedCount,
  rejectedCount,
  sentCount,
  sentAcceptedCount,
}: RequestsStatsBarProps) {
  return (
    <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
      <StatsCard
        icon={<UserCheck className="h-4 w-4" strokeWidth={1.5} />}
        label="Pending"
        value={pendingCount}
        accent={pendingCount > 0 ? "amber" : "muted"}
      />
      <StatsCard
        icon={<CheckCircle className="h-4 w-4" strokeWidth={1.5} />}
        label="Connected"
        value={acceptedCount + sentAcceptedCount}
        accent="success"
      />
      <StatsCard
        icon={<XCircle className="h-4 w-4" strokeWidth={1.5} />}
        label="Declined"
        value={rejectedCount}
        accent="muted"
      />
      <StatsCard
        icon={<Clock className="h-4 w-4" strokeWidth={1.5} />}
        label="Sent"
        value={sentCount}
        accent="muted"
      />
    </div>
  );
}
