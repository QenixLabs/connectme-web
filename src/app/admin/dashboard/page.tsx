"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Users,
  ShieldCheck,
  FolderKanban,
  Flag,
  CheckCircle,
  FileText,
  UserX,
  Loader2,
  AlertTriangle,
  Clock,
  BarChart3,
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { adminApi, type DashboardStats } from "@/lib/api";
import { getApiErrorMessage } from "@/lib/formatters";

export default function AdminDashboardPage() {
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    adminApi
      .getDashboardStats()
      .then((data) => {
        if (!cancelled) setStats(data);
      })
      .catch((err) => {
        if (!cancelled) setError(getApiErrorMessage(err, "Failed to load stats"));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const primaryStats = stats
    ? [
        {
          label: "Total Artists",
          value: stats.total_artists,
          icon: Users,
          iconBg: "bg-blue-50",
          iconColor: "text-blue-500",
        },
        {
          label: "Verified Brands",
          value: stats.total_brands,
          icon: ShieldCheck,
          iconBg: "bg-amber-50",
          iconColor: "text-amber-500",
        },
        {
          label: "Active Projects",
          value: stats.active_campaigns,
          icon: FolderKanban,
          iconBg: "bg-emerald-50",
          iconColor: "text-emerald-500",
        },
        {
          label: "Pending Verifications",
          value: stats.pending_verifications,
          icon: Flag,
          iconBg: "bg-rose-50",
          iconColor: "text-rose-500",
        },
      ]
    : [];

  const moderationStats = stats
    ? [
        {
          label: "Pending Reports",
          value: stats.pending_reports,
          icon: AlertTriangle,
          iconBg: "bg-amber-50",
          iconColor: "text-amber-500",
        },
        {
          label: "Resolved Today",
          value: stats.resolved_today,
          icon: CheckCircle,
          iconBg: "bg-emerald-50",
          iconColor: "text-emerald-500",
        },
        {
          label: "Suspended Users",
          value: stats.suspended_users,
          icon: UserX,
          iconBg: "bg-rose-50",
          iconColor: "text-rose-500",
        },
        {
          label: "High Priority",
          value: stats.high_priority_reports,
          icon: Flag,
          iconBg: "bg-red-50",
          iconColor: "text-red-500",
        },
        {
          label: "Avg Resolution Time",
          value: stats.avg_resolution_hours,
          suffix: "h",
          icon: Clock,
          iconBg: "bg-slate-50",
          iconColor: "text-slate-500",
        },
      ]
    : [];

  const actionCards = [
    {
      label: "Verify User",
      icon: CheckCircle,
      iconBg: "bg-amber-50",
      iconColor: "text-amber-500",
      onClick: () => router.push("/admin/verifications"),
    },
    {
      label: "Review Reports",
      icon: FileText,
      iconBg: "bg-rose-50",
      iconColor: "text-rose-500",
      onClick: () => router.push("/admin/reports"),
    },
    {
      label: "View Analytics",
      icon: BarChart3,
      iconBg: "bg-blue-50",
      iconColor: "text-blue-500",
      onClick: () => {},
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Primary stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {primaryStats.map((card) => (
          <Card key={card.label} className="border-border-subtle">
            <CardContent className="p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className={`p-1.5 rounded-md ${card.iconBg}`}>
                  <card.icon className={`w-4 h-4 ${card.iconColor}`} strokeWidth={1.5} />
                </div>
                <span className="text-xs text-muted-foreground">{card.label}</span>
              </div>
              <p className="text-2xl font-semibold">{card.value.toLocaleString()}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Moderation stats */}
      <div>
        <h2 className="text-sm font-semibold mb-3">Moderation Overview</h2>
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          {moderationStats.map((card) => (
            <Card key={card.label} className="border-border-subtle">
              <CardContent className="p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className={`p-1.5 rounded-md ${card.iconBg}`}>
                    <card.icon className={`w-4 h-4 ${card.iconColor}`} strokeWidth={1.5} />
                  </div>
                  <span className="text-xs text-muted-foreground">{card.label}</span>
                </div>
                <p className="text-2xl font-semibold">
                  {card.value.toLocaleString()}
                  {card.suffix && <span className="text-sm text-muted-foreground ml-0.5">{card.suffix}</span>}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="border-border-subtle">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Daily Activity</CardTitle>
            <p className="text-2xl font-semibold">78</p>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="h-32 flex items-end gap-1">
              {[35, 45, 30, 55, 40, 60, 50].map((h, i) => (
                <div
                  key={i}
                  className="flex-1 bg-blue-100 rounded-sm"
                  style={{ height: `${h}%` }}
                />
              ))}
            </div>
            <div className="flex justify-between mt-2 text-[10px] text-muted-foreground">
              {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
                <span key={d}>{d}</span>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border-border-subtle">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Growth Trends</CardTitle>
            <p className="text-2xl font-semibold">7.2%</p>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="h-32 flex items-end gap-1">
              {[20, 25, 30, 28, 40, 55, 70].map((h, i) => (
                <div
                  key={i}
                  className="flex-1 bg-amber-100 rounded-sm"
                  style={{ height: `${h}%` }}
                />
              ))}
            </div>
            <div className="flex justify-between mt-2 text-[10px] text-muted-foreground">
              {["Apr", "-27", "-20", "-12", "-13", "-6"].map((d) => (
                <span key={d}>{d}</span>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Action cards row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {actionCards.map((card) => (
          <button
            key={card.label}
            onClick={card.onClick}
            className="flex items-center gap-3 p-4 rounded-lg border border-border bg-card hover:bg-accent/50 transition-colors text-left"
          >
            <div className={`p-2 rounded-md ${card.iconBg}`}>
              <card.icon className={`w-5 h-5 ${card.iconColor}`} strokeWidth={1.5} />
            </div>
            <span className="text-sm font-medium">{card.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
