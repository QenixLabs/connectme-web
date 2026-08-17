"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import {
  Users,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  Search,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  LayoutGrid,
  List,
  UserCheck,
  UserX,
  Flag,
  Clock,
  SlidersHorizontal,
  X,
  ChevronDown,
  Phone,
  ShieldCheck,
  ShieldAlert,
  Mail,
  CheckCircle2,
  XCircle,
  Filter,
  RotateCcw,
  MapPin,
  Building2,
  Briefcase,
  Wrench,
  Globe,
  GraduationCap,
} from "lucide-react";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/admin/empty-state";
import { Separator } from "@/components/ui/separator";
import { adminApi, type PaginatedUsers, type DashboardStats } from "@/lib/api";
import { cn } from "@/lib/utils";
import { UserDetailPanel } from "@/components/admin/user-detail-panel";

function getApiErrorMessage(err: unknown, fallback: string): string {
  if (err instanceof Error && "response" in err) {
    const axErr = err as { response?: { data?: { message?: string } } };
    return axErr.response?.data?.message ?? fallback;
  }
  return fallback;
}

const ROLE_TABS = [
  { value: "all", label: "All Users" },
  { value: "talent", label: "Talent" },
  { value: "recruiter", label: "Recruiters" },
  { value: "admin", label: "Admins" },
] as const;

type RoleTab = (typeof ROLE_TABS)[number]["value"];

const STATUS_OPTIONS = ["all", "active", "suspended", "banned"] as const;
const VERIFICATION_TIER_OPTIONS = ["all", "1", "2", "3"] as const;
const VERIFIED_OPTIONS = ["all", "yes", "no"] as const;
const AUTH_PROVIDER_OPTIONS = [
  "all",
  "credentials",
  "google",
  "linkedin",
] as const;
const AVAILABILITY_OPTIONS = [
  "all",
  "available",
  "busy",
  "not_available",
] as const;
const RECRUITER_VERIFICATION_OPTIONS = [
  "all",
  "pending",
  "basic",
  "enterprise",
  "trusted_partner",
] as const;
const GENDER_OPTIONS = ["all", "Male", "Female", "Other"] as const;
const SORT_OPTIONS = [
  { value: "created_at", label: "Joined" },
  { value: "last_active_at", label: "Last Active" },
  { value: "trust_score", label: "Trust Score" },
  { value: "report_count", label: "Reports" },
] as const;

const LIMIT = 15;

const STATUS_COLORS: Record<string, string> = {
  active: "bg-emerald-100 text-emerald-800 border-emerald-200",
  suspended: "bg-amber-100 text-amber-800 border-amber-200",
  banned: "bg-rose-100 text-rose-800 border-rose-200",
};

const STATUS_DOT_COLORS: Record<string, string> = {
  active: "bg-emerald-500",
  suspended: "bg-amber-500",
  banned: "bg-rose-500",
};

const SUBSCRIPTION_STATUS_COLORS: Record<string, string> = {
  active: "bg-emerald-100 text-emerald-800 border-emerald-200",
  past_due: "bg-amber-100 text-amber-800 border-amber-200",
  cancelled: "bg-muted text-muted-foreground border-border",
  expired: "bg-muted text-muted-foreground border-border",
  pending: "bg-blue-100 text-blue-800 border-blue-200",
};

const TIER_COLORS: Record<string, string> = {
  "1": "bg-muted text-muted-foreground border-border",
  "2": "bg-blue-100 text-blue-700 border-blue-200",
  "3": "bg-emerald-100 text-emerald-700 border-emerald-200",
};

const RECRUITER_VERIFICATION_COLORS: Record<string, string> = {
  pending: "bg-amber-100 text-amber-800 border-amber-200",
  basic: "bg-blue-100 text-blue-800 border-blue-200",
  enterprise: "bg-violet-100 text-violet-800 border-violet-200",
  trusted_partner: "bg-emerald-100 text-emerald-800 border-emerald-200",
};

const AVAILABILITY_COLORS: Record<string, string> = {
  available: "bg-emerald-100 text-emerald-800 border-emerald-200",
  busy: "bg-amber-100 text-amber-800 border-amber-200",
  not_available: "bg-muted text-muted-foreground border-border",
};

const TRUST_COLORS: Record<string, string> = {
  high: "bg-emerald-500",
  medium: "bg-amber-500",
  low: "bg-rose-500",
};

function getTrustColor(score: number): string {
  if (score >= 70) return TRUST_COLORS.high;
  if (score >= 40) return TRUST_COLORS.medium;
  return TRUST_COLORS.low;
}

function formatRelativeTime(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
  return date.toLocaleDateString();
}

function formatPhone(phone: string): string {
  if (!phone) return "\u2014";
  if (phone.length <= 8) return phone;
  const last4 = phone.slice(-4);
  const masked = phone.slice(0, -4).replace(/\d/g, "\u2022");
  return masked + last4;
}

function generatePageNumbers(
  current: number,
  total: number,
  maxVisible = 5,
): (number | "ellipsis")[] {
  if (total <= maxVisible + 2) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }
  const pages: (number | "ellipsis")[] = [1];
  let start = Math.max(2, current - Math.floor(maxVisible / 2));
  let end = Math.min(total - 1, start + maxVisible - 1);
  if (end - start < maxVisible - 1) {
    start = Math.max(2, end - maxVisible + 1);
  }
  if (start > 2) pages.push("ellipsis");
  for (let i = start; i <= end; i++) pages.push(i);
  if (end < total - 1) pages.push("ellipsis");
  pages.push(total);
  return pages;
}

export default function AdminUsersPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [data, setData] = useState<PaginatedUsers | null>(null);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState<RoleTab>("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("created_at");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [page, setPage] = useState(1);

  const [verificationTier, setVerificationTier] = useState("all");
  const [emailVerified, setEmailVerified] = useState("all");
  const [phoneVerified, setPhoneVerified] = useState("all");
  const [authProvider, setAuthProvider] = useState("all");
  const [trustMin, setTrustMin] = useState("");
  const [trustMax, setTrustMax] = useState("");
  const [reportMin, setReportMin] = useState("");
  const [reportMax, setReportMax] = useState("");
  const [signupFrom, setSignupFrom] = useState("");
  const [signupTo, setSignupTo] = useState("");
  const [lastActiveFrom, setLastActiveFrom] = useState("");
  const [lastActiveTo, setLastActiveTo] = useState("");

  const [city, setCity] = useState("");
  const [stateFilter, setStateFilter] = useState("");
  const [country, setCountry] = useState("");

  const [availability, setAvailability] = useState("all");
  const [profession, setProfession] = useState("");
  const [specialtiesFilter, setSpecialtiesFilter] = useState("");
  const [skill, setSkill] = useState("");
  const [language, setLanguage] = useState("");
  const [gender, setGender] = useState("all");

  const [recruiterVerificationStatus, setRecruiterVerificationStatus] =
    useState("all");
  const [companySize, setCompanySize] = useState("");

  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"table" | "cards">("table");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [advancedFiltersOpen, setAdvancedFiltersOpen] = useState(false);

  const hasActiveFilters =
    statusFilter !== "all" ||
    verificationTier !== "all" ||
    emailVerified !== "all" ||
    phoneVerified !== "all" ||
    authProvider !== "all" ||
    trustMin !== "" ||
    trustMax !== "" ||
    reportMin !== "" ||
    reportMax !== "" ||
    signupFrom !== "" ||
    signupTo !== "" ||
    lastActiveFrom !== "" ||
    lastActiveTo !== "" ||
    city !== "" ||
    stateFilter !== "" ||
    country !== "" ||
    availability !== "all" ||
    profession !== "" ||
    skill !== "" ||
    language !== "" ||
    gender !== "all" ||
    recruiterVerificationStatus !== "all" ||
    companySize !== "";

  const isTalentTab = activeTab === "talent";
  const isRecruiterTab = activeTab === "recruiter";

  const fetchStats = useCallback(() => {
    adminApi
      .getDashboardStats()
      .then(setStats)
      .catch(() => {})
      .finally(() => setStatsLoading(false));
  }, []);

  const fetchUsers = useCallback(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    const roleParam = activeTab === "all" ? undefined : activeTab;

    adminApi
      .getUsers({
        page,
        limit: LIMIT,
        role: roleParam,
        status: statusFilter === "all" ? undefined : statusFilter,
        sort_by: sortBy,
        sort_order: sortOrder,
        search: search.trim() || undefined,
        verification_tier:
          verificationTier === "all" ? undefined : Number(verificationTier),
        is_email_verified:
          emailVerified === "all" ? undefined : emailVerified === "yes",
        is_phone_verified:
          phoneVerified === "all" ? undefined : phoneVerified === "yes",
        auth_provider: authProvider === "all" ? undefined : authProvider,
        trust_score_min: trustMin ? Number(trustMin) : undefined,
        trust_score_max: trustMax ? Number(trustMax) : undefined,
        report_count_min: reportMin ? Number(reportMin) : undefined,
        report_count_max: reportMax ? Number(reportMax) : undefined,
        signup_from: signupFrom || undefined,
        signup_to: signupTo || undefined,
        last_active_from: lastActiveFrom || undefined,
        last_active_to: lastActiveTo || undefined,
        city: city.trim() || undefined,
        state: stateFilter.trim() || undefined,
        country: country.trim() || undefined,
        availability: availability === "all" ? undefined : availability,
        profession: profession.trim() || undefined,
        skill: skill.trim() || undefined,
        language: language.trim() || undefined,
        gender: gender === "all" ? undefined : gender,
        recruiter_verification_status:
          recruiterVerificationStatus === "all"
            ? undefined
            : recruiterVerificationStatus,
        company_size: companySize.trim() || undefined,
      })
      .then((res) => {
        if (!cancelled) setData(res);
      })
      .catch((err) => {
        if (!cancelled)
          setError(getApiErrorMessage(err, "Failed to load users"));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [
    page,
    activeTab,
    statusFilter,
    sortBy,
    sortOrder,
    search,
    verificationTier,
    emailVerified,
    phoneVerified,
    authProvider,
    trustMin,
    trustMax,
    reportMin,
    reportMax,
    signupFrom,
    signupTo,
    lastActiveFrom,
    lastActiveTo,
    city,
    stateFilter,
    country,
    availability,
    profession,
    skill,
    language,
    gender,
    recruiterVerificationStatus,
    companySize,
  ]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  useEffect(() => {
    const cleanup = fetchUsers();
    return cleanup;
  }, [fetchUsers]);

  useEffect(() => {
    const userId = searchParams.get("userId");
    if (userId) setSelectedUserId(userId);
  }, [searchParams]);

  const closeUserPanel = () => {
    setSelectedUserId(null);
    if (searchParams.has("userId")) {
      router.replace("/admin/users");
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput);
    setPage(1);
  };

  const clearAllFilters = () => {
    setStatusFilter("all");
    setSearch("");
    setSearchInput("");
    setVerificationTier("all");
    setEmailVerified("all");
    setPhoneVerified("all");
    setAuthProvider("all");
    setTrustMin("");
    setTrustMax("");
    setReportMin("");
    setReportMax("");
    setSignupFrom("");
    setSignupTo("");
    setLastActiveFrom("");
    setLastActiveTo("");
    setCity("");
    setStateFilter("");
    setCountry("");
    setAvailability("all");
    setProfession("");
    setSpecialtiesFilter("");
    setSkill("");
    setLanguage("");
    setGender("all");
    setRecruiterVerificationStatus("all");
    setCompanySize("");
    setPage(1);
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value as RoleTab);
    setPage(1);
  };

  const statCards = useMemo(
    () => [
      {
        label: "Total Users",
        value:
          data?.total ??
          (stats
            ? stats.total_artists + stats.total_brands + stats.total_admins
            : 0),
        icon: Users,
        color: "bg-primary/10 text-primary",
        border: "border-l-primary",
      },
      {
        label: "Talent",
        value: stats?.total_artists ?? "\u2014",
        icon: UserCheck,
        color: "bg-violet-500/10 text-violet-600",
        border: "border-l-violet-500",
      },
      {
        label: "Recruiters",
        value: stats?.total_brands ?? "\u2014",
        icon: LayoutGrid,
        color: "bg-sky-500/10 text-sky-600",
        border: "border-l-sky-500",
      },
      {
        label: "Suspended",
        value: stats?.suspended_users ?? "\u2014",
        icon: ShieldAlert,
        color: "bg-amber-500/10 text-amber-600",
        border: "border-l-amber-500",
      },
    ],
    [data?.total, stats],
  );

  return (
    <div className="space-y-5">
      {/* Page header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
            <Users
              className="h-[18px] w-[18px] text-primary"
              strokeWidth={1.5}
            />
          </div>
          <div>
            <h1 className="text-base font-semibold tracking-tight">Users</h1>
            <p className="text-xs text-muted-foreground">
              Manage and review platform users
            </p>
          </div>
        </div>
        {!loading && data && (
          <span className="text-xs text-muted-foreground tabular-nums">
            {data.total.toLocaleString()} total
          </span>
        )}
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {statCards.map((stat) => (
          <Card
            key={stat.label}
            className={cn("border-l-[3px] rounded-lg py-0", stat.border)}
          >
            <CardContent className="p-3.5 flex items-center gap-3">
              <div
                className={cn(
                  "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg",
                  stat.color,
                )}
              >
                <stat.icon className="h-4 w-4" strokeWidth={1.5} />
              </div>
              <div className="min-w-0">
                {statsLoading ? (
                  <Skeleton className="h-5 w-12 mb-0.5" />
                ) : (
                  <div className="text-lg font-bold tabular-nums leading-tight">
                    {typeof stat.value === "number"
                      ? stat.value.toLocaleString()
                      : stat.value}
                  </div>
                )}
                <div className="text-[11px] text-muted-foreground leading-tight">
                  {stat.label}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Role tabs */}
      <Tabs value={activeTab} onValueChange={handleTabChange}>
        <TabsList className="w-full sm:w-auto">
          {ROLE_TABS.map((tab) => (
            <TabsTrigger
              key={tab.value}
              value={tab.value}
              className="text-xs px-3 flex-1 sm:flex-initial"
            >
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {/* Filter bar */}
      <Card className="p-0">
        <CardContent className="p-3">
          <div className="space-y-3">
            {/* Top row: search + quick filters */}
            <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center">
              <form
                onSubmit={handleSearchSubmit}
                className="relative flex-1 min-w-0"
              >
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  placeholder="Search by name, email, phone, username..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  className="pl-9 pr-8 text-sm h-9"
                />
                {searchInput && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchInput("");
                      setSearch("");
                      setPage(1);
                    }}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </form>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-9 sm:hidden"
                  onClick={() => setFiltersOpen(!filtersOpen)}
                >
                  <SlidersHorizontal className="h-3.5 w-3.5 mr-1.5" />
                  Filters
                  {hasActiveFilters && (
                    <span className="ml-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-medium text-primary-foreground">
                      !
                    </span>
                  )}
                </Button>

                <div
                  className={cn(
                    "flex items-center gap-2 flex-wrap",
                    filtersOpen ? "flex" : "hidden sm:flex",
                  )}
                >
                  <Select
                    value={statusFilter}
                    onValueChange={(v) => {
                      setStatusFilter(v);
                      setPage(1);
                    }}
                  >
                    <SelectTrigger className="w-[115px] text-sm h-9">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      {STATUS_OPTIONS.map((s) => (
                        <SelectItem
                          key={s}
                          value={s}
                          className="text-sm capitalize"
                        >
                          {s === "all" ? "All Status" : s}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select value={sortBy} onValueChange={(v) => setSortBy(v)}>
                    <SelectTrigger className="w-[115px] text-sm h-9">
                      <ArrowUpDown className="h-3 w-3 mr-1.5" />
                      <SelectValue placeholder="Sort" />
                    </SelectTrigger>
                    <SelectContent>
                      {SORT_OPTIONS.map((s) => (
                        <SelectItem
                          key={s.value}
                          value={s.value}
                          className="text-sm"
                        >
                          {s.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-9 w-9 shrink-0"
                        onClick={() =>
                          setSortOrder((o) => (o === "asc" ? "desc" : "asc"))
                        }
                      >
                        {sortOrder === "asc" ? (
                          <ArrowUp className="h-3.5 w-3.5" />
                        ) : (
                          <ArrowDown className="h-3.5 w-3.5" />
                        )}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>{sortOrder === "asc" ? "Ascending" : "Descending"}</TooltipContent>
                  </Tooltip>

                  <div className="hidden sm:flex items-center border border-border rounded-md">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant={viewMode === "table" ? "secondary" : "ghost"}
                          size="icon"
                          className="h-7 w-7 rounded-r-none"
                          onClick={() => setViewMode("table")}
                        >
                          <List className="h-3.5 w-3.5" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Table view</TooltipContent>
                    </Tooltip>
                    <div className="w-px h-4 bg-border" />
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant={viewMode === "cards" ? "secondary" : "ghost"}
                          size="icon"
                          className="h-7 w-7 rounded-l-none"
                          onClick={() => setViewMode("cards")}
                        >
                          <LayoutGrid className="h-3.5 w-3.5" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Card view</TooltipContent>
                    </Tooltip>
                  </div>
                </div>
              </div>
            </div>

            {/* Location filter row */}
            <div className="flex items-center gap-2 flex-wrap">
              <MapPin className="h-3 w-3 text-muted-foreground shrink-0" />
              <Input
                placeholder="City"
                value={city}
                onChange={(e) => {
                  setCity(e.target.value);
                  setPage(1);
                }}
                className="h-7 text-xs w-28"
              />
              <Input
                placeholder="State"
                value={stateFilter}
                onChange={(e) => {
                  setStateFilter(e.target.value);
                  setPage(1);
                }}
                className="h-7 text-xs w-28"
              />
              <Input
                placeholder="Country"
                value={country}
                onChange={(e) => {
                  setCountry(e.target.value);
                  setPage(1);
                }}
                className="h-7 text-xs w-28"
              />
            </div>

            {/* Advanced filters toggle + clear */}
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                className={cn(
                  "h-8 text-xs gap-1.5 transition-colors",
                  advancedFiltersOpen && "bg-accent text-accent-foreground",
                )}
                onClick={() => setAdvancedFiltersOpen(!advancedFiltersOpen)}
              >
                <Filter className="h-3 w-3" />
                More Filters
                <ChevronDown
                  className={cn(
                    "h-3 w-3 transition-transform",
                    advancedFiltersOpen && "rotate-180",
                  )}
                />
                {hasActiveFilters && (
                  <span className="ml-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-medium text-primary-foreground">
                    !
                  </span>
                )}
              </Button>

              {hasActiveFilters && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 text-xs text-muted-foreground ml-auto"
                  onClick={clearAllFilters}
                >
                  <RotateCcw className="h-3 w-3 mr-1" />
                  Reset all
                </Button>
              )}
            </div>

            {/* Advanced filters panel */}
            <AnimatePresence>
              {advancedFiltersOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <Separator className="mb-3" />

                  {/* Role-specific filters */}
                  {isTalentTab && (
                    <div className="mb-3 space-y-2">
                      <div className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                        Talent Filters
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                        <div className="space-y-1">
                          <label className="text-[11px] font-medium text-muted-foreground">
                            Availability
                          </label>
                          <Select
                            value={availability}
                            onValueChange={(v) => {
                              setAvailability(v);
                              setPage(1);
                            }}
                          >
                            <SelectTrigger className="h-8 text-xs">
                              <SelectValue placeholder="Any" />
                            </SelectTrigger>
                            <SelectContent>
                              {AVAILABILITY_OPTIONS.map((a) => (
                                <SelectItem
                                  key={a}
                                  value={a}
                                  className="text-xs capitalize"
                                >
                                  {a === "all" ? "Any" : a.replace("_", " ")}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-1">
                          <label className="text-[11px] font-medium text-muted-foreground">
                            <Briefcase className="h-2.5 w-2.5 inline mr-1" />
                            Profession
                          </label>
                          <Input
                            placeholder="e.g. Actor"
                            value={profession}
                            onChange={(e) => {
                              setProfession(e.target.value);
                              setPage(1);
                            }}
                            className="h-8 text-xs"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[11px] font-medium text-muted-foreground">
                            <Wrench className="h-2.5 w-2.5 inline mr-1" />
                            Skill
                          </label>
                          <Input
                            placeholder="e.g. Dancing"
                            value={skill}
                            onChange={(e) => {
                              setSkill(e.target.value);
                              setPage(1);
                            }}
                            className="h-8 text-xs"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[11px] font-medium text-muted-foreground">
                            <Globe className="h-2.5 w-2.5 inline mr-1" />
                            Language
                          </label>
                          <Input
                            placeholder="e.g. Hindi"
                            value={language}
                            onChange={(e) => {
                              setLanguage(e.target.value);
                              setPage(1);
                            }}
                            className="h-8 text-xs"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[11px] font-medium text-muted-foreground">
                            Gender
                          </label>
                          <Select
                            value={gender}
                            onValueChange={(v) => {
                              setGender(v);
                              setPage(1);
                            }}
                          >
                            <SelectTrigger className="h-8 text-xs">
                              <SelectValue placeholder="Any" />
                            </SelectTrigger>
                            <SelectContent>
                              {GENDER_OPTIONS.map((g) => (
                                <SelectItem
                                  key={g}
                                  value={g}
                                  className="text-xs"
                                >
                                  {g === "all" ? "Any" : g}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <Separator className="mt-2" />
                      </div>
                    </div>
                  )}

                  {isRecruiterTab && (
                    <div className="mb-3 space-y-2">
                      <div className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                        Recruiter Filters
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                        <div className="space-y-1">
                          <label className="text-[11px] font-medium text-muted-foreground">
                            Verification Status
                          </label>
                          <Select
                            value={recruiterVerificationStatus}
                            onValueChange={(v) => {
                              setRecruiterVerificationStatus(v);
                              setPage(1);
                            }}
                          >
                            <SelectTrigger className="h-8 text-xs">
                              <SelectValue placeholder="Any" />
                            </SelectTrigger>
                            <SelectContent>
                              {RECRUITER_VERIFICATION_OPTIONS.map((v) => (
                                <SelectItem
                                  key={v}
                                  value={v}
                                  className="text-xs capitalize"
                                >
                                  {v === "all" ? "Any" : v.replace("_", " ")}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-1">
                          <label className="text-[11px] font-medium text-muted-foreground">
                            Company Size
                          </label>
                          <Input
                            placeholder="e.g. 1-10"
                            value={companySize}
                            onChange={(e) => {
                              setCompanySize(e.target.value);
                              setPage(1);
                            }}
                            className="h-8 text-xs"
                          />
                        </div>
                      </div>
                      <Separator className="mt-2" />
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    {/* Verification Tier */}
                    <div className="space-y-1">
                      <label className="text-[11px] font-medium text-muted-foreground">
                        Verification Tier
                      </label>
                      <Select
                        value={verificationTier}
                        onValueChange={(v) => {
                          setVerificationTier(v);
                          setPage(1);
                        }}
                      >
                        <SelectTrigger className="h-8 text-xs">
                          <SelectValue placeholder="Any tier" />
                        </SelectTrigger>
                        <SelectContent>
                          {VERIFICATION_TIER_OPTIONS.map((t) => (
                            <SelectItem key={t} value={t} className="text-xs">
                              {t === "all" ? "Any tier" : `Tier ${t}`}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Auth Provider */}
                    <div className="space-y-1">
                      <label className="text-[11px] font-medium text-muted-foreground">
                        Auth Provider
                      </label>
                      <Select
                        value={authProvider}
                        onValueChange={(v) => {
                          setAuthProvider(v);
                          setPage(1);
                        }}
                      >
                        <SelectTrigger className="h-8 text-xs">
                          <SelectValue placeholder="Any provider" />
                        </SelectTrigger>
                        <SelectContent>
                          {AUTH_PROVIDER_OPTIONS.map((p) => (
                            <SelectItem
                              key={p}
                              value={p}
                              className="text-xs capitalize"
                            >
                              {p === "all" ? "Any provider" : p}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Email Verified */}
                    <div className="space-y-1">
                      <label className="text-[11px] font-medium text-muted-foreground">
                        Email Verified
                      </label>
                      <Select
                        value={emailVerified}
                        onValueChange={(v) => {
                          setEmailVerified(v);
                          setPage(1);
                        }}
                      >
                        <SelectTrigger className="h-8 text-xs">
                          <SelectValue placeholder="Any" />
                        </SelectTrigger>
                        <SelectContent>
                          {VERIFIED_OPTIONS.map((v) => (
                            <SelectItem
                              key={v}
                              value={v}
                              className="text-xs capitalize"
                            >
                              {v === "all" ? "Any" : v}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Phone Verified */}
                    <div className="space-y-1">
                      <label className="text-[11px] font-medium text-muted-foreground">
                        Phone Verified
                      </label>
                      <Select
                        value={phoneVerified}
                        onValueChange={(v) => {
                          setPhoneVerified(v);
                          setPage(1);
                        }}
                      >
                        <SelectTrigger className="h-8 text-xs">
                          <SelectValue placeholder="Any" />
                        </SelectTrigger>
                        <SelectContent>
                          {VERIFIED_OPTIONS.map((v) => (
                            <SelectItem
                              key={v}
                              value={v}
                              className="text-xs capitalize"
                            >
                              {v === "all" ? "Any" : v}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Trust Score range */}
                    <div className="space-y-1">
                      <label className="text-[11px] font-medium text-muted-foreground">
                        Trust Score
                      </label>
                      <div className="flex items-center gap-1.5">
                        <Input
                          type="number"
                          min={0}
                          max={100}
                          placeholder="Min"
                          value={trustMin}
                          onChange={(e) => {
                            setTrustMin(e.target.value);
                            setPage(1);
                          }}
                          className="h-8 text-xs w-full"
                        />
                        <span className="text-xs text-muted-foreground shrink-0">
                          &ndash;
                        </span>
                        <Input
                          type="number"
                          min={0}
                          max={100}
                          placeholder="Max"
                          value={trustMax}
                          onChange={(e) => {
                            setTrustMax(e.target.value);
                            setPage(1);
                          }}
                          className="h-8 text-xs w-full"
                        />
                      </div>
                    </div>

                    {/* Report Count range */}
                    <div className="space-y-1">
                      <label className="text-[11px] font-medium text-muted-foreground">
                        Report Count
                      </label>
                      <div className="flex items-center gap-1.5">
                        <Input
                          type="number"
                          min={0}
                          placeholder="Min"
                          value={reportMin}
                          onChange={(e) => {
                            setReportMin(e.target.value);
                            setPage(1);
                          }}
                          className="h-8 text-xs w-full"
                        />
                        <span className="text-xs text-muted-foreground shrink-0">
                          &ndash;
                        </span>
                        <Input
                          type="number"
                          min={0}
                          placeholder="Max"
                          value={reportMax}
                          onChange={(e) => {
                            setReportMax(e.target.value);
                            setPage(1);
                          }}
                          className="h-8 text-xs w-full"
                        />
                      </div>
                    </div>

                    {/* Signup date range */}
                    <div className="space-y-1">
                      <label className="text-[11px] font-medium text-muted-foreground">
                        Joined
                      </label>
                      <div className="flex items-center gap-1.5">
                        <Input
                          type="date"
                          value={signupFrom}
                          onChange={(e) => {
                            setSignupFrom(e.target.value);
                            setPage(1);
                          }}
                          className="h-8 text-xs w-full"
                        />
                        <span className="text-xs text-muted-foreground shrink-0">
                          &ndash;
                        </span>
                        <Input
                          type="date"
                          value={signupTo}
                          onChange={(e) => {
                            setSignupTo(e.target.value);
                            setPage(1);
                          }}
                          className="h-8 text-xs w-full"
                        />
                      </div>
                    </div>

                    {/* Last Active date range */}
                    <div className="space-y-1">
                      <label className="text-[11px] font-medium text-muted-foreground">
                        Last Active
                      </label>
                      <div className="flex items-center gap-1.5">
                        <Input
                          type="date"
                          value={lastActiveFrom}
                          onChange={(e) => {
                            setLastActiveFrom(e.target.value);
                            setPage(1);
                          }}
                          className="h-8 text-xs w-full"
                        />
                        <span className="text-xs text-muted-foreground shrink-0">
                          &ndash;
                        </span>
                        <Input
                          type="date"
                          value={lastActiveTo}
                          onChange={(e) => {
                            setLastActiveTo(e.target.value);
                            setPage(1);
                          }}
                          className="h-8 text-xs w-full"
                        />
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </CardContent>
      </Card>

      {/* Error */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Loading skeleton */}
      {loading && (
        <Card className="p-0">
          <CardContent className="p-0">
            <div className="divide-y divide-border">
              <div className="hidden sm:flex items-center gap-3 px-4 py-2.5 bg-muted/30">
                {[25, 10, 12, 14, 10, 12, 10, 12, 10, 12, 12, 10].map(
                  (w, i) => (
                    <Skeleton
                      key={i}
                      className="h-3 rounded shrink-0"
                      style={{ width: `${w}%` }}
                    />
                  ),
                )}
              </div>
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3 px-4 py-3">
                  <Skeleton className="h-8 w-8 rounded-full shrink-0" />
                  <div className="flex-1 min-w-0 space-y-1.5">
                    <Skeleton className="h-3.5 w-28 rounded" />
                    <Skeleton className="h-2.5 w-40 rounded" />
                  </div>
                  <Skeleton className="h-5 w-12 rounded hidden sm:block shrink-0" />
                  <Skeleton className="h-5 w-16 rounded hidden sm:block shrink-0" />
                  <Skeleton className="h-5 w-20 rounded hidden sm:block shrink-0" />
                  <Skeleton className="h-5 w-10 rounded hidden md:block shrink-0" />
                  <Skeleton className="h-5 w-16 rounded hidden md:block shrink-0" />
                  <Skeleton className="h-5 w-24 rounded hidden lg:block shrink-0" />
                  <Skeleton className="h-5 w-14 rounded hidden lg:block shrink-0" />
                  <Skeleton className="h-5 w-16 rounded hidden xl:block shrink-0" />
                  <Skeleton className="h-5 w-16 rounded hidden xl:block shrink-0" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Empty state */}
      {!loading && !error && data && data.users.length === 0 && (
        <EmptyState
          icon={
            <Users
              className="h-6 w-6 text-muted-foreground"
              strokeWidth={1.5}
            />
          }
          title="No users found"
          description={
            hasActiveFilters || search
              ? "Try adjusting your filters or search terms."
              : "No users have signed up yet."
          }
        />
      )}

      {/* Table view */}
      {!loading &&
        !error &&
        data &&
        data.users.length > 0 &&
        viewMode === "table" && (
          <Card className="overflow-hidden p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/30 hover:bg-muted/30">
                    <TableHead className="text-[11px] font-semibold text-muted-foreground whitespace-nowrap sticky left-0 bg-muted/30 z-10">
                      User
                    </TableHead>
                    {activeTab === "all" && (
                      <TableHead className="text-[11px] font-semibold text-muted-foreground whitespace-nowrap">
                        Role
                      </TableHead>
                    )}
                    <TableHead className="text-[11px] font-semibold text-muted-foreground whitespace-nowrap">
                      Status
                    </TableHead>
                    <TableHead className="text-[11px] font-semibold text-muted-foreground whitespace-nowrap hidden sm:table-cell">
                      Plan
                    </TableHead>

                    {/* Talent-specific columns */}
                    {isTalentTab && (
                      <>
                        <TableHead className="text-[11px] font-semibold text-muted-foreground whitespace-nowrap hidden sm:table-cell">
                          Location
                        </TableHead>
                        <TableHead className="text-[11px] font-semibold text-muted-foreground whitespace-nowrap hidden md:table-cell">
                          Availability
                        </TableHead>
                        <TableHead className="text-[11px] font-semibold text-muted-foreground whitespace-nowrap hidden lg:table-cell">
                          Professions
                        </TableHead>
                        <TableHead className="text-[11px] font-semibold text-muted-foreground whitespace-nowrap hidden lg:table-cell">
                          Skills
                        </TableHead>
                        <TableHead className="text-[11px] font-semibold text-muted-foreground whitespace-nowrap hidden xl:table-cell text-center">
                          Views
                        </TableHead>
                        <TableHead className="text-[11px] font-semibold text-muted-foreground whitespace-nowrap hidden xl:table-cell text-center">
                          Listed
                        </TableHead>
                      </>
                    )}

                    {/* Recruiter-specific columns */}
                    {isRecruiterTab && (
                      <>
                        <TableHead className="text-[11px] font-semibold text-muted-foreground whitespace-nowrap hidden sm:table-cell">
                          Company
                        </TableHead>
                        <TableHead className="text-[11px] font-semibold text-muted-foreground whitespace-nowrap hidden md:table-cell">
                          Verification
                        </TableHead>
                        <TableHead className="text-[11px] font-semibold text-muted-foreground whitespace-nowrap hidden lg:table-cell">
                          Specialties
                        </TableHead>
                        <TableHead className="text-[11px] font-semibold text-muted-foreground whitespace-nowrap hidden xl:table-cell">
                          Msg Quota
                        </TableHead>
                        <TableHead className="text-[11px] font-semibold text-muted-foreground whitespace-nowrap hidden xl:table-cell">
                          Campaigns
                        </TableHead>
                      </>
                    )}

                    <TableHead className="text-[11px] font-semibold text-muted-foreground whitespace-nowrap hidden sm:table-cell text-center">
                      Reports
                    </TableHead>
                    <TableHead className="text-[11px] font-semibold text-muted-foreground whitespace-nowrap hidden md:table-cell">
                      Trust
                    </TableHead>
                    <TableHead className="text-[11px] font-semibold text-muted-foreground whitespace-nowrap hidden md:table-cell text-center">
                      Tier
                    </TableHead>
                    <TableHead className="text-[11px] font-semibold text-muted-foreground whitespace-nowrap hidden lg:table-cell">
                      Phone
                    </TableHead>
                    <TableHead className="text-[11px] font-semibold text-muted-foreground whitespace-nowrap hidden lg:table-cell text-center">
                      Email OK
                    </TableHead>
                    <TableHead className="text-[11px] font-semibold text-muted-foreground whitespace-nowrap hidden xl:table-cell">
                      Auth
                    </TableHead>
                    <TableHead className="text-[11px] font-semibold text-muted-foreground whitespace-nowrap hidden xl:table-cell">
                      Joined
                    </TableHead>
                    <TableHead className="text-[11px] font-semibold text-muted-foreground whitespace-nowrap hidden xl:table-cell">
                      Last Active
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <AnimatePresence mode="popLayout">
                    {data.users.map((user, index) => (
                      <motion.tr
                        key={user._id}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{
                          duration: 0.2,
                          delay: Math.min(index * 0.03, 0.3),
                        }}
                        className="cursor-pointer group"
                        onClick={() => setSelectedUserId(user._id)}
                      >
                        {/* User */}
                        <TableCell className="py-2.5 sticky left-0 bg-card group-hover:bg-muted/30 z-10">
                          <div className="flex items-center gap-2.5">
                            <Avatar className="h-7 w-7 shrink-0 ring-2 ring-border group-hover:ring-primary/30 transition-all text-[10px]">
                              <AvatarImage
                                src={user.profile_photo}
                                alt={user.display_name}
                              />
                              <AvatarFallback>
                                {user.display_name?.charAt(0) ?? "?"}
                              </AvatarFallback>
                            </Avatar>
                            <div className="min-w-0">
                              <div className="text-sm font-medium truncate group-hover:text-primary transition-colors">
                                {user.display_name}
                              </div>
                              <div className="text-[11px] text-muted-foreground truncate">
                                {user.email}
                              </div>
                            </div>
                          </div>
                        </TableCell>

                        {/* Role */}
                        {activeTab === "all" && (
                          <TableCell className="text-xs capitalize">
                            {user.role}
                          </TableCell>
                        )}

                        {/* Status */}
                        <TableCell>
                          <div className="flex items-center gap-1.5">
                            <span
                              className={cn(
                                "inline-block h-1.5 w-1.5 rounded-full shrink-0",
                                STATUS_DOT_COLORS[user.status] ||
                                  "bg-muted-foreground",
                              )}
                            />
                            <Badge
                              variant="outline"
                              className={cn(
                                "text-[10px] px-1.5 py-0 capitalize",
                                STATUS_COLORS[user.status] || "",
                              )}
                            >
                              {user.status}
                            </Badge>
                          </div>
                        </TableCell>

                        {/* Plan */}
                        <TableCell className="hidden sm:table-cell">
                          {user.subscription ? (
                            <div className="flex flex-col gap-0.5">
                              <span className="text-xs font-medium">
                                {user.subscription.plan_display_name}
                              </span>
                              <Badge
                                variant="outline"
                                className={cn(
                                  "text-[10px] px-1.5 py-0 w-fit capitalize",
                                  SUBSCRIPTION_STATUS_COLORS[
                                    user.subscription.status
                                  ] || "",
                                )}
                              >
                                {user.subscription.status}
                              </Badge>
                            </div>
                          ) : (
                            <span className="text-xs text-muted-foreground">
                              &mdash;
                            </span>
                          )}
                        </TableCell>

                        {/* Talent: Location */}
                        {isTalentTab && (
                          <TableCell className="hidden sm:table-cell">
                            {user.location ? (
                              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                <MapPin className="h-2.5 w-2.5 shrink-0" />
                                <span className="truncate max-w-[120px]">
                                  {[
                                    user.location.city,
                                    user.location.state,
                                  ]
                                    .filter(Boolean)
                                    .join(", ")}
                                </span>
                              </div>
                            ) : (
                              <span className="text-xs text-muted-foreground">
                                &mdash;
                              </span>
                            )}
                          </TableCell>
                        )}

                        {/* Talent: Availability */}
                        {isTalentTab && (
                          <TableCell className="hidden md:table-cell">
                            {user.availability ? (
                              <Badge
                                variant="outline"
                                className={cn(
                                  "text-[10px] px-1.5 py-0 capitalize",
                                  AVAILABILITY_COLORS[user.availability] || "",
                                )}
                              >
                                {user.availability.replace("_", " ")}
                              </Badge>
                            ) : (
                              <span className="text-xs text-muted-foreground">
                                &mdash;
                              </span>
                            )}
                          </TableCell>
                        )}

                        {/* Talent: Professions */}
                        {isTalentTab && (
                          <TableCell className="hidden lg:table-cell">
                            {user.professions &&
                            user.professions.length > 0 ? (
                              <div className="flex flex-wrap gap-1 max-w-[160px]">
                                {user.professions
                                  .slice(0, 2)
                                  .map((p: string, i: number) => (
                                    <Badge
                                      key={i}
                                      variant="secondary"
                                      className="text-[10px] px-1 py-0"
                                    >
                                      {p}
                                    </Badge>
                                  ))}
                                {user.professions.length > 2 && (
                                  <span className="text-[10px] text-muted-foreground">
                                    +{user.professions.length - 2}
                                  </span>
                                )}
                              </div>
                            ) : (
                              <span className="text-xs text-muted-foreground">
                                &mdash;
                              </span>
                            )}
                          </TableCell>
                        )}

                        {/* Talent: Skills */}
                        {isTalentTab && (
                          <TableCell className="hidden lg:table-cell text-xs text-muted-foreground">
                            {user.skills ? user.skills.length : 0}
                          </TableCell>
                        )}

                        {/* Talent: Profile Views */}
                        {isTalentTab && (
                          <TableCell className="hidden xl:table-cell text-center text-xs tabular-nums">
                            {user.analytics?.profile_views_30d ?? (
                              <span className="text-muted-foreground">
                                &mdash;
                              </span>
                            )}
                          </TableCell>
                        )}

                        {/* Talent: Shortlisted */}
                        {isTalentTab && (
                          <TableCell className="hidden xl:table-cell text-center text-xs tabular-nums">
                            {user.analytics?.shortlist_count ?? (
                              <span className="text-muted-foreground">
                                &mdash;
                              </span>
                            )}
                          </TableCell>
                        )}

                        {/* Recruiter: Company */}
                        {isRecruiterTab && (
                          <TableCell className="hidden sm:table-cell">
                            <div className="flex items-center gap-1.5 text-xs">
                              <Building2 className="h-2.5 w-2.5 shrink-0 text-muted-foreground" />
                              <span className="truncate max-w-[140px] font-medium">
                                {user.company_name || "\u2014"}
                              </span>
                            </div>
                          </TableCell>
                        )}

                        {/* Recruiter: Verification Status */}
                        {isRecruiterTab && (
                          <TableCell className="hidden md:table-cell">
                            {user.verification_status ? (
                              <Badge
                                variant="outline"
                                className={cn(
                                  "text-[10px] px-1.5 py-0 capitalize",
                                  RECRUITER_VERIFICATION_COLORS[
                                    user.verification_status
                                  ] || "",
                                )}
                              >
                                {user.verification_status.replace("_", " ")}
                              </Badge>
                            ) : (
                              <span className="text-xs text-muted-foreground">
                                &mdash;
                              </span>
                            )}
                          </TableCell>
                        )}

                        {/* Recruiter: Specialties */}
                        {isRecruiterTab && (
                          <TableCell className="hidden lg:table-cell text-xs text-muted-foreground">
                            {user.specialties?.join(", ") || "\u2014"}
                          </TableCell>
                        )}

                        {/* Recruiter: Msg Quota */}
                        {isRecruiterTab && (
                          <TableCell className="hidden xl:table-cell text-xs text-muted-foreground">
                            {user.message_quota ? (
                              <span className="tabular-nums">
                                {user.message_quota.used} /{" "}
                                {user.message_quota.limit}
                              </span>
                            ) : (
                              "\u2014"
                            )}
                          </TableCell>
                        )}

                        {/* Recruiter: Campaigns */}
                        {isRecruiterTab && (
                          <TableCell className="hidden xl:table-cell text-xs text-muted-foreground">
                            {user.campaign_quota ? (
                              <span className="tabular-nums">
                                {user.campaign_quota.used} /{" "}
                                {user.campaign_quota.limit}
                              </span>
                            ) : (
                              "\u2014"
                            )}
                          </TableCell>
                        )}

                        {/* Reports */}
                        <TableCell className="hidden sm:table-cell text-center">
                          {user.report_count > 0 ? (
                            <div className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-rose-50 text-rose-700 text-[11px] font-medium">
                              <Flag className="h-2.5 w-2.5" />
                              {user.report_count}
                            </div>
                          ) : (
                            <span className="text-xs text-muted-foreground">
                              0
                            </span>
                          )}
                        </TableCell>

                        {/* Trust */}
                        <TableCell className="hidden md:table-cell">
                          <div className="flex items-center gap-2 max-w-[100px]">
                            <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
                              <div
                                className={cn(
                                  "h-full rounded-full transition-all",
                                  getTrustColor(user.trust_score),
                                )}
                                style={{
                                  width: `${user.trust_score}%`,
                                }}
                              />
                            </div>
                            <span className="text-[11px] font-medium tabular-nums w-6 text-right">
                              {user.trust_score}
                            </span>
                          </div>
                        </TableCell>

                        {/* Verification Tier */}
                        <TableCell className="hidden md:table-cell text-center">
                          <Badge
                            variant="outline"
                            className={cn(
                              "text-[10px] px-1.5 py-0",
                              TIER_COLORS[String(user.verification_tier)] || "",
                            )}
                          >
                            T{user.verification_tier}
                          </Badge>
                        </TableCell>

                        {/* Phone */}
                        <TableCell className="hidden lg:table-cell">
                          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <Phone className="h-2.5 w-2.5 shrink-0" />
                            <span className="font-mono text-[11px] tabular-nums">
                              {formatPhone(user.phone)}
                            </span>
                          </div>
                        </TableCell>

                        {/* Email Verified */}
                        <TableCell className="hidden lg:table-cell text-center">
                          {user.is_email_verified ? (
                            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 mx-auto" />
                          ) : (
                            <XCircle className="h-3.5 w-3.5 text-muted-foreground/40 mx-auto" />
                          )}
                        </TableCell>

                        {/* Auth Provider */}
                        <TableCell className="hidden xl:table-cell">
                          <span className="text-xs capitalize text-muted-foreground">
                            {user.auth_provider || "credentials"}
                          </span>
                        </TableCell>

                        {/* Joined */}
                        <TableCell className="hidden xl:table-cell text-xs text-muted-foreground whitespace-nowrap">
                          {new Date(user.created_at).toLocaleDateString()}
                        </TableCell>

                        {/* Last Active */}
                        <TableCell className="hidden xl:table-cell text-xs text-muted-foreground whitespace-nowrap">
                          {user.last_active_at
                            ? formatRelativeTime(user.last_active_at)
                            : "\u2014"}
                        </TableCell>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </TableBody>
              </Table>
            </div>
          </Card>
        )}

      {/* Card view */}
      {!loading &&
        !error &&
        data &&
        data.users.length > 0 &&
        viewMode === "cards" && (
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            <AnimatePresence mode="popLayout">
              {data.users.map((user, index) => (
                <motion.div
                  key={user._id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.25,
                    delay: Math.min(index * 0.04, 0.4),
                  }}
                >
                  <Card
                    className="cursor-pointer hover:shadow-md transition-shadow py-0"
                    onClick={() => setSelectedUserId(user._id)}
                  >
                    <CardContent className="p-4 space-y-3">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10 shrink-0 ring-2 ring-border text-xs">
                          <AvatarImage
                            src={user.profile_photo}
                            alt={user.display_name}
                          />
                          <AvatarFallback>
                            {user.display_name?.charAt(0) ?? "?"}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0 flex-1">
                          <div className="text-sm font-semibold truncate">
                            {user.display_name}
                          </div>
                          <div className="text-xs text-muted-foreground truncate">
                            {user.email}
                          </div>
                        </div>
                        <Badge
                          variant="outline"
                          className={cn(
                            "text-[10px] px-1.5 py-0 capitalize shrink-0",
                            STATUS_COLORS[user.status] || "",
                          )}
                        >
                          {user.status}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
                        {activeTab === "all" && (
                          <div>
                            <span className="text-muted-foreground">Role</span>
                            <p className="font-medium capitalize">
                              {user.role}
                            </p>
                          </div>
                        )}
                        <div>
                          <span className="text-muted-foreground">Trust</span>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <div className="flex-1 h-1 rounded-full bg-muted overflow-hidden max-w-[50px]">
                              <div
                                className={cn(
                                  "h-full rounded-full",
                                  getTrustColor(user.trust_score),
                                )}
                                style={{
                                  width: `${user.trust_score}%`,
                                }}
                              />
                            </div>
                            <span className="font-medium tabular-nums">
                              {user.trust_score}
                            </span>
                          </div>
                        </div>
                        <div>
                          <span className="text-muted-foreground">
                            Verification
                          </span>
                          <p className="font-medium">
                            Tier {user.verification_tier}
                          </p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Auth</span>
                          <p className="font-medium capitalize">
                            {user.auth_provider || "credentials"}
                          </p>
                        </div>

                        {/* Talent card fields */}
                        {isTalentTab && user.location && (
                          <div>
                            <span className="text-muted-foreground">
                              Location
                            </span>
                            <p className="font-medium">
                              {[user.location.city, user.location.state]
                                .filter(Boolean)
                                .join(", ") || "\u2014"}
                            </p>
                          </div>
                        )}
                        {isTalentTab && user.availability && (
                          <div>
                            <span className="text-muted-foreground">
                              Availability
                            </span>
                            <p className="font-medium capitalize">
                              {user.availability.replace("_", " ")}
                            </p>
                          </div>
                        )}
                        {isTalentTab &&
                          user.professions &&
                          user.professions.length > 0 && (
                            <div>
                              <span className="text-muted-foreground">
                                Professions
                              </span>
                              <p className="font-medium">
                                {user.professions.slice(0, 2).join(", ")}
                                {user.professions.length > 2 &&
                                  ` +${user.professions.length - 2}`}
                              </p>
                            </div>
                          )}

                        {/* Recruiter card fields */}
                        {isRecruiterTab && (
                          <div>
                            <span className="text-muted-foreground">
                              Company
                            </span>
                            <p className="font-medium">
                              {user.company_name || "\u2014"}
                            </p>
                          </div>
                        )}
                        {isRecruiterTab && user.verification_status && (
                          <div>
                            <span className="text-muted-foreground">
                              Verification
                            </span>
                            <p className="font-medium capitalize">
                              {user.verification_status.replace("_", " ")}
                            </p>
                          </div>
                        )}
                        {isRecruiterTab && (user.specialties?.length ?? 0) > 0 && (
                          <div>
                            <span className="text-muted-foreground">
                              Specialties
                            </span>
                            <p className="font-medium">{user.specialties?.join(", ")}</p>
                          </div>
                        )}

                        {user.subscription && (
                          <div>
                            <span className="text-muted-foreground">Plan</span>
                            <p className="font-medium">
                              {user.subscription.plan_display_name}
                            </p>
                          </div>
                        )}
                        <div>
                          <span className="text-muted-foreground">
                            Reports
                          </span>
                          <p
                            className={cn(
                              "font-medium",
                              user.report_count > 0 && "text-rose-600",
                            )}
                          >
                            {user.report_count}
                          </p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Email</span>
                          <p className="font-medium">
                            {user.is_email_verified ? "Verified" : "Pending"}
                          </p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Phone</span>
                          <p className="font-medium">
                            {user.is_phone_verified
                              ? "Verified"
                              : user.phone
                                ? formatPhone(user.phone)
                                : "\u2014"}
                          </p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Joined</span>
                          <p className="font-medium">
                            {new Date(user.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        {user.last_active_at && (
                          <div>
                            <span className="text-muted-foreground">
                              Last Active
                            </span>
                            <p className="font-medium">
                              {formatRelativeTime(user.last_active_at)}
                            </p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}

      {/* Pagination */}
      {!loading && data && data.total_pages > 1 && (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <span className="text-xs text-muted-foreground text-center sm:text-left">
            Showing{" "}
            <span className="font-medium text-foreground">
              {(data.page - 1) * LIMIT + 1}
            </span>
            {" \u2013 "}
            <span className="font-medium text-foreground">
              {Math.min(data.page * LIMIT, data.total)}
            </span>{" "}
            of{" "}
            <span className="font-medium text-foreground">
              {data.total.toLocaleString()}
            </span>{" "}
            users
          </span>

          <div className="flex items-center justify-center gap-1">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            {generatePageNumbers(data.page, data.total_pages).map((p, i) =>
              p === "ellipsis" ? (
                <span
                  key={`ellipsis-${i}`}
                  className="flex h-8 w-8 items-center justify-center text-xs text-muted-foreground"
                >
                  &hellip;
                </span>
              ) : (
                <Button
                  key={p}
                  variant={p === data.page ? "default" : "outline"}
                  size="icon"
                  className="h-8 w-8 text-xs font-medium"
                  onClick={() => setPage(p)}
                >
                  {p}
                </Button>
              ),
            )}

            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() =>
                setPage((p) => Math.min(data.total_pages, p + 1))
              }
              disabled={page >= data.total_pages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      <UserDetailPanel
        userId={selectedUserId}
        onClose={closeUserPanel}
        onStatusChange={() => {
          fetchUsers();
          fetchStats();
        }}
      />
    </div>
  );
}
