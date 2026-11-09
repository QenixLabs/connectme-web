"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  AlertCircle,
  ArrowRight,
  BriefcaseBusiness,
  CheckCircle2,
  CirclePause,
  Copy,
  Eye,
  FilePenLine,
  Image as ImageIcon,
  Loader2,
  MoreHorizontal,
  PauseCircle,
  Pencil,
  PlayCircle,
  Plus,
  Search,
  Sparkles,
  Trash2,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { providersApi, servicesApi } from "@/lib/api/marketplace";
import type {
  IndicativePrice,
  MyServicesQuery,
  ServiceListing,
  ServiceListingPayload,
  ServiceStatus,
} from "@/lib/api/marketplace";
import { getApiErrorMessage } from "@/lib/api/client";
import { queryKeys } from "@/lib/api/query-keys";
import { MARKETPLACE_CATEGORIES } from "@/lib/marketplace-categories";
import { formatAmount } from "@/components/marketplace/format";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

const PAGE_SIZE = 12;

type StatusFilter = "all" | ServiceStatus;
type SortOption = NonNullable<MyServicesQuery["sort"]>;

const STATUS_TABS: Array<{ value: StatusFilter; label: string }> = [
  { value: "all", label: "All" },
  { value: "published", label: "Published" },
  { value: "draft", label: "Draft" },
  { value: "unpublished", label: "Paused" },
];

const SORT_OPTIONS: Array<{ value: SortOption; label: string }> = [
  { value: "recent", label: "Recently updated" },
  { value: "newest", label: "Newest first" },
  { value: "oldest", label: "Oldest first" },
];

interface BannerState {
  tone: "success" | "error";
  title: string;
  message: string;
}

export default function ProviderServicesPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [status, setStatus] = useState<StatusFilter>("all");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [sort, setSort] = useState<SortOption>("recent");
  const [page, setPage] = useState(1);
  const [banner, setBanner] = useState<BannerState | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ServiceListing | null>(null);
  const [duplicateTarget, setDuplicateTarget] = useState<ServiceListing | null>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedSearch(search.trim()), 300);
    return () => window.clearTimeout(timer);
  }, [search]);

  const filters = useMemo<MyServicesQuery>(
    () => ({
      status,
      search: debouncedSearch || undefined,
      category: category === "all" ? undefined : category,
      sort,
      page,
      limit: PAGE_SIZE,
    }),
    [status, debouncedSearch, category, sort, page],
  );

  const servicesQuery = useQuery({
    queryKey: queryKeys.services.mine(filters as Record<string, unknown>),
    queryFn: () => servicesApi.getMine(filters),
    placeholderData: (previous) => previous,
  });

  const profileQuery = useQuery({
    queryKey: queryKeys.provider.me(),
    queryFn: providersApi.getMyProfile,
    retry: false,
    staleTime: 5 * 60 * 1000,
  });

  const services = servicesQuery.data?.data ?? [];
  const total = servicesQuery.data?.total ?? 0;
  const summary = servicesQuery.data?.summary;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const profileNeedsOnboarding = Boolean(
    profileQuery.data?.profile && profileQuery.data.profile.onboarding_completed === false,
  );
  const hasActiveFilters =
    Boolean(debouncedSearch) || category !== "all" || status !== "all";

  async function refreshServices() {
    await queryClient.invalidateQueries({ queryKey: ["services", "mine"] });
  }

  function showError(message: string) {
    setBanner({ tone: "error", title: "Something went wrong", message });
    toast.error(message);
  }

  function showSuccess(title: string, message: string) {
    setBanner({ tone: "success", title, message });
    toast.success(title);
  }

  function openCreate() {
    router.push("/provider/services/new");
  }

  function openEdit(service: ServiceListing) {
    router.push(`/provider/services/${encodeURIComponent(service.id)}/edit`);
  }

  function clearFilters() {
    setSearch("");
    setDebouncedSearch("");
    setStatus("all");
    setCategory("all");
    setPage(1);
  }

  const statusMutation = useMutation({
    mutationFn: ({
      id,
      action,
    }: {
      id: string;
      action: "publish" | "unpublish";
    }) =>
      action === "publish" ? servicesApi.publish(id) : servicesApi.unpublish(id),
    onSuccess: async (_, variables) => {
      await refreshServices();
      if (variables.action === "publish") {
        showSuccess("Service published", "Your service is now visible in the marketplace.");
      } else {
        showSuccess("Service paused", "Your service is hidden from the marketplace until you publish it again.");
      }
    },
    onError: (error, variables) => {
      showError(
        getApiErrorMessage(
          error,
          variables.action === "publish"
            ? "Could not publish this service. Complete your provider onboarding and try again."
            : "Could not pause this service.",
        ),
      );
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => servicesApi.remove(id),
    onSuccess: async () => {
      setDeleteTarget(null);
      await refreshServices();
      showSuccess("Service deleted", "The listing has been permanently removed.");
    },
    onError: (error) => {
      showError(getApiErrorMessage(error, "Could not delete this service."));
    },
  });

  const duplicateMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await servicesApi.getMineById(id);
      const source = response.service;
      const payload: ServiceListingPayload = {
        title: `${source.title} (Copy)`.slice(0, 140),
        description: source.description,
        short_description: source.short_description,
        category: source.category,
        subcategory: source.subcategory,
        service_type: source.service_type,
        images: source.images,
        service_areas: source.service_areas,
        delivery_time: source.delivery_time,
        team_size: source.team_size,
        equipment: source.equipment,
        indicative_price: source.indicative_price ?? null,
      };
      return servicesApi.create(payload);
    },
    onSuccess: async () => {
      setDuplicateTarget(null);
      await refreshServices();
      showSuccess(
        "Draft created",
        "A copy of this service was saved as a draft. Review it before publishing.",
      );
    },
    onError: (error) => {
      showError(getApiErrorMessage(error, "Could not duplicate this service."));
    },
  });

  const isStatusPending = statusMutation.isPending;
  const pendingStatusId = statusMutation.isPending ? statusMutation.variables?.id : null;

  return (
    <div className="space-y-4 pb-4 sm:space-y-6">
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#2b0b72] via-[#5b21b6] to-[#7c3aed] p-5 text-white shadow-[0_24px_50px_-32px_rgba(76,29,149,0.85)] sm:p-8">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-16 -top-24 size-56 rounded-full bg-white/10 blur-2xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-24 left-1/3 size-48 rounded-full bg-fuchsia-400/20 blur-3xl"
        />
        <div className="relative flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div className="min-w-0">
            <p className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.2em] text-white/70">
              <Sparkles className="size-3.5" />
              Your business
            </p>
            <h1 className="mt-2 text-2xl font-extrabold tracking-tight sm:text-4xl">My Services</h1>
            <p className="mt-2 max-w-xl text-sm leading-6 text-white/80">
              Create, publish, and manage the services clients can discover.
            </p>
          </div>
          <Button
            onClick={openCreate}
            className="h-11 w-full shrink-0 rounded-xl bg-white px-5 font-semibold text-[#4c1d95] shadow-sm hover:bg-white/90 sm:w-auto"
          >
            <Plus className="mr-2 size-4" />
            Add New Service
          </Button>
        </div>
      </section>

      {profileNeedsOnboarding && (
        <div className="flex flex-col gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-amber-950 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-amber-100 text-amber-700">
              <AlertCircle className="size-4" />
            </span>
            <div>
              <p className="text-sm font-semibold">Finish onboarding before you publish</p>
              <p className="mt-0.5 text-xs leading-5 text-amber-800">
                You can save drafts now. Publishing requires a completed provider profile.
              </p>
            </div>
          </div>
          <Button
            size="sm"
            variant="outline"
            className="w-full border-amber-300 bg-white text-amber-900 hover:bg-amber-100 sm:w-auto"
            asChild
          >
            <Link href="/provider/onboarding">
              Complete onboarding
              <ArrowRight className="ml-2 size-4" />
            </Link>
          </Button>
        </div>
      )}

      {banner && (
        <Alert
          className={cn(
            "relative pr-10",
            banner.tone === "error"
              ? "border-rose-200 bg-rose-50 text-rose-950"
              : "border-emerald-200 bg-emerald-50 text-emerald-950",
          )}
        >
          {banner.tone === "error" ? (
            <AlertCircle className="size-4" />
          ) : (
            <CheckCircle2 className="size-4" />
          )}
          <AlertTitle>{banner.title}</AlertTitle>
          <AlertDescription>{banner.message}</AlertDescription>
          <button
            type="button"
            onClick={() => setBanner(null)}
            aria-label="Dismiss message"
            className="absolute right-3 top-3 rounded-md p-1 text-current/60 transition-colors hover:bg-black/5 hover:text-current"
          >
            <X className="size-4" />
          </button>
        </Alert>
      )}

      <section aria-label="Service totals" className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard
          label="Total services"
          value={summary?.total ?? 0}
          icon={BriefcaseBusiness}
          iconClassName="bg-violet-50 text-violet-600"
        />
        <StatCard
          label="Published"
          value={summary?.published ?? 0}
          icon={CheckCircle2}
          iconClassName="bg-emerald-50 text-emerald-600"
        />
        <StatCard
          label="Drafts"
          value={summary?.draft ?? 0}
          icon={FilePenLine}
          iconClassName="bg-sky-50 text-sky-600"
        />
        <StatCard
          label="Paused"
          value={summary?.paused ?? 0}
          icon={CirclePause}
          iconClassName="bg-amber-50 text-amber-600"
        />
      </section>

      <section className="space-y-3 rounded-2xl border border-[#e8e6f4] bg-white p-3 shadow-[0_14px_36px_-32px_rgba(37,20,89,0.55)] sm:p-4">
        <div className="flex flex-col gap-2.5 lg:flex-row lg:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
            <Input
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setPage(1);
              }}
              placeholder="Search your services"
              aria-label="Search your services"
              className="h-11 rounded-xl border-[#e7e5f2] bg-[#fbfaff] pl-10 text-[#171b45] placeholder:text-slate-400 focus-visible:ring-violet-400"
            />
            {search && (
              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  setPage(1);
                }}
                aria-label="Clear search"
                className="absolute right-2.5 top-1/2 grid size-7 -translate-y-1/2 place-items-center rounded-full text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
              >
                <X className="size-4" />
              </button>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2 sm:flex">
            <Select
              value={category}
              onValueChange={(value) => {
                setCategory(value);
                setPage(1);
              }}
            >
              <SelectTrigger
                aria-label="Filter by category"
                className="h-11 w-full min-w-0 rounded-xl border-[#e7e5f2] bg-[#fbfaff] text-[#171b45] sm:w-[180px]"
              >
                <SelectValue placeholder="All categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All categories</SelectItem>
                {MARKETPLACE_CATEGORIES.map((item) => (
                  <SelectItem key={item} value={item}>
                    {item}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={sort}
              onValueChange={(value) => {
                setSort(value as SortOption);
                setPage(1);
              }}
            >
              <SelectTrigger
                aria-label="Sort services"
                className="h-11 w-full min-w-0 rounded-xl border-[#e7e5f2] bg-[#fbfaff] text-[#171b45] sm:w-[172px]"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SORT_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="-mx-1 overflow-x-auto px-1 pb-0.5">
          <div
            role="tablist"
            aria-label="Filter services by status"
            className="flex min-w-max items-center gap-1.5 rounded-xl bg-[#f7f6fc] p-1.5"
          >
            {STATUS_TABS.map((tab) => {
              const count =
                tab.value === "all"
                  ? summary?.total ?? 0
                  : tab.value === "published"
                    ? summary?.published ?? 0
                    : tab.value === "draft"
                      ? summary?.draft ?? 0
                      : summary?.paused ?? 0;
              const active = status === tab.value;
              return (
                <button
                  key={tab.value}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => {
                    setStatus(tab.value);
                    setPage(1);
                  }}
                  className={cn(
                    "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-all sm:px-4",
                    active
                      ? "bg-white text-[#4c1d95] shadow-sm ring-1 ring-[#ded8fb]"
                      : "text-slate-500 hover:bg-white/60 hover:text-[#4c1d95]",
                  )}
                >
                  {tab.label}
                  <span
                    className={cn(
                      "rounded-full px-1.5 py-0.5 text-[10px] font-bold leading-none",
                      active ? "bg-violet-100 text-violet-700" : "bg-slate-200/70 text-slate-500",
                    )}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {servicesQuery.isLoading ? (
        <div className="grid gap-3 md:grid-cols-2 sm:gap-4">
          {[0, 1, 2, 3].map((item) => (
            <Skeleton key={item} className="h-40 rounded-2xl sm:h-44" />
          ))}
        </div>
      ) : servicesQuery.isError ? (
        <Alert variant="destructive">
          <AlertCircle className="size-4" />
          <AlertTitle>Could not load services</AlertTitle>
          <AlertDescription className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <span>{getApiErrorMessage(servicesQuery.error, "Please try again.")}</span>
            <Button size="sm" variant="outline" onClick={() => servicesQuery.refetch()}>
              Try again
            </Button>
          </AlertDescription>
        </Alert>
      ) : services.length === 0 ? (
        hasActiveFilters ? (
          <EmptyState
            icon={Search}
            title={
              status === "all"
                ? "No matching services"
                : `No ${status === "unpublished" ? "paused" : status} services`
            }
            description="Try a different search, category, or status filter."
            action={
              <Button variant="outline" onClick={clearFilters}>
                Clear filters
              </Button>
            }
          />
        ) : (
          <EmptyState
            icon={BriefcaseBusiness}
            title="No services yet"
            description="Create your first listing, add clear pricing, then publish it to the marketplace."
            action={
              <Button onClick={openCreate}>
                <Plus className="mr-2 size-4" />
                Create a service
              </Button>
            }
          />
        )
      ) : (
        <div className="grid gap-3 md:grid-cols-2 sm:gap-4">
          {services.map((service) => (
            <ServiceCard
              key={service.id}
              service={service}
              statusPending={isStatusPending && pendingStatusId === service.id}
              deletePending={deleteMutation.isPending && deleteMutation.variables === service.id}
              onEdit={() => openEdit(service)}
              onToggleStatus={() =>
                statusMutation.mutate({
                  id: service.id,
                  action: service.status === "published" ? "unpublish" : "publish",
                })
              }
              onDuplicate={() => setDuplicateTarget(service)}
              onDelete={() => setDeleteTarget(service)}
            />
          ))}
        </div>
      )}

      {!servicesQuery.isLoading && !servicesQuery.isError && total > 0 && (
        <div className="flex flex-col gap-3 rounded-2xl border border-[#e8e6f4] bg-white px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-slate-500">
            Showing <span className="font-semibold text-[#171b45]">{services.length}</span> of{" "}
            <span className="font-semibold text-[#171b45]">{total}</span> services
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="rounded-lg"
              disabled={page <= 1}
              onClick={() => setPage((current) => Math.max(1, current - 1))}
            >
              Previous
            </Button>
            <span className="min-w-20 text-center text-xs font-medium text-slate-500">
              Page {page} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              className="rounded-lg"
              disabled={page >= totalPages}
              onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      <Dialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => {
          if (!open && !deleteMutation.isPending) setDeleteTarget(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete service?</DialogTitle>
            <DialogDescription>
              &ldquo;{deleteTarget?.title}&rdquo; will be permanently removed. This action cannot
              be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteTarget(null)}
              disabled={deleteMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (deleteTarget) deleteMutation.mutate(deleteTarget.id);
              }}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? (
                <Loader2 className="mr-2 size-4 animate-spin" />
              ) : (
                <Trash2 className="mr-2 size-4" />
              )}
              Delete service
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={Boolean(duplicateTarget)}
        onOpenChange={(open) => {
          if (!open && !duplicateMutation.isPending) setDuplicateTarget(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Duplicate this service?</DialogTitle>
            <DialogDescription>
              We&apos;ll create a draft copy of &ldquo;{duplicateTarget?.title}&rdquo; with the same
              details, images, and pricing. You can edit it before publishing.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDuplicateTarget(null)}
              disabled={duplicateMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (duplicateTarget) duplicateMutation.mutate(duplicateTarget.id);
              }}
              disabled={duplicateMutation.isPending}
            >
              {duplicateMutation.isPending ? (
                <Loader2 className="mr-2 size-4 animate-spin" />
              ) : (
                <Copy className="mr-2 size-4" />
              )}
              Create draft copy
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function StatCard({
  label,
  value,
  icon: Icon,
  iconClassName,
}: {
  label: string;
  value: number;
  icon: React.ComponentType<{ className?: string }>;
  iconClassName: string;
}) {
  return (
    <Card className="rounded-2xl border-[#e8e6f4] bg-white shadow-[0_10px_28px_-26px_rgba(37,20,89,0.5)]">
      <CardContent className="flex items-center gap-3 p-3.5 sm:p-5">
        <span className={cn("grid size-10 shrink-0 place-items-center rounded-xl", iconClassName)}>
          <Icon className="size-5" />
        </span>
        <div className="min-w-0">
          <p className="text-2xl font-extrabold leading-none text-[#171b45]">{value}</p>
          <p className="mt-1 truncate text-xs font-medium text-slate-500">{label}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function ServiceCard({
  service,
  statusPending,
  deletePending,
  onEdit,
  onToggleStatus,
  onDuplicate,
  onDelete,
}: {
  service: ServiceListing;
  statusPending: boolean;
  deletePending: boolean;
  onEdit: () => void;
  onToggleStatus: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
}) {
  const isPublished = service.status === "published";
  const isBusy = statusPending || deletePending;

  return (
    <Card className="group overflow-hidden rounded-2xl border-[#e8e6f4] bg-white text-[#171b45] shadow-[0_10px_30px_-28px_rgba(37,20,89,0.55)] transition-all duration-200 hover:-translate-y-0.5 hover:border-[#d9d0fb] hover:shadow-[0_20px_40px_-28px_rgba(76,29,149,0.35)]">
      <CardContent className="p-0">
        <div className="flex gap-3 p-3 sm:gap-4 sm:p-4">
          <div className="size-24 shrink-0 overflow-hidden rounded-xl border border-[#efedf7] bg-gradient-to-br from-[#f1ecff] to-[#faf9ff] sm:h-32 sm:w-36">
            {service.image_urls?.[0] ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={service.image_urls[0]}
                alt={service.title}
                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
            ) : (
              <div className="flex h-full flex-col items-center justify-center gap-1 text-[#8b7ae2]">
                <ImageIcon className="size-6" />
                <span className="text-[10px] font-medium">No image</span>
              </div>
            )}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <StatusBadge status={service.status} />
                <h2 className="mt-1.5 line-clamp-2 [overflow-wrap:anywhere] text-[15px] font-bold leading-snug text-[#171b45] sm:text-base">
                  {service.title}
                </h2>
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label={`Actions for ${service.title}`}
                    className="-mr-1 -mt-1 size-8 shrink-0 rounded-lg text-slate-500 hover:bg-violet-50 hover:text-violet-700"
                  >
                    <MoreHorizontal className="size-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-52">
                  <DropdownMenuLabel>Manage service</DropdownMenuLabel>
                  <DropdownMenuItem onSelect={onEdit}>
                    <Pencil className="size-4" />
                    Edit service
                  </DropdownMenuItem>
                  {isPublished && (
                    <DropdownMenuItem asChild>
                      <Link
                        href={`/services/${encodeURIComponent(service.id)}`}
                        target="_blank"
                        rel="noreferrer"
                      >
                        <Eye className="size-4" />
                        View public listing
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem disabled={statusPending} onSelect={onToggleStatus}>
                    {statusPending ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : isPublished ? (
                      <PauseCircle className="size-4" />
                    ) : (
                      <PlayCircle className="size-4" />
                    )}
                    {isPublished ? "Pause service" : "Publish service"}
                  </DropdownMenuItem>
                  <DropdownMenuItem disabled={isBusy} onSelect={onDuplicate}>
                    <Copy className="size-4" />
                    Duplicate as draft
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    variant="destructive"
                    disabled={isBusy}
                    onSelect={onDelete}
                  >
                    <Trash2 className="size-4" />
                    Delete service
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <p className="mt-1 flex items-center gap-1.5 text-xs font-medium text-slate-500">
              <span className="truncate">{service.category}</span>
              {service.service_type && (
                <>
                  <span className="text-slate-300">•</span>
                  <span className="shrink-0 capitalize">{service.service_type.replaceAll("_", " ")}</span>
                </>
              )}
            </p>

            {service.short_description && (
              <p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-500">
                {service.short_description}
              </p>
            )}

            <p className="mt-2 text-sm font-bold text-[#4c1d95]">{formatServicePrice(service.indicative_price)}</p>
            {service.updated_at && (
              <p className="mt-1 text-[11px] text-slate-400">Updated {formatDate(service.updated_at)}</p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 border-t border-[#f0eef8] bg-[#fbfaff] px-3 py-2.5 sm:px-4">
          <Button
            size="sm"
            variant="outline"
            className="h-9 rounded-lg border-[#e4e0f3] bg-white text-[#3f2b7a] hover:bg-violet-50 hover:text-[#4c1d95]"
            onClick={onEdit}
          >
            <Pencil className="mr-2 size-3.5" />
            Edit
          </Button>

          {isPublished ? (
            <Button
              size="sm"
              variant="outline"
              className="h-9 rounded-lg border-[#e4e0f3] bg-white text-[#3f2b7a] hover:bg-violet-50 hover:text-[#4c1d95]"
              onClick={onToggleStatus}
              disabled={statusPending}
            >
              {statusPending ? (
                <Loader2 className="mr-2 size-3.5 animate-spin" />
              ) : (
                <PauseCircle className="mr-2 size-3.5" />
              )}
              Pause
            </Button>
          ) : (
            <Button
              size="sm"
              className="h-9 rounded-lg bg-[#5b21b6] text-white shadow-sm hover:bg-[#4c1d95]"
              onClick={onToggleStatus}
              disabled={statusPending}
            >
              {statusPending ? (
                <Loader2 className="mr-2 size-3.5 animate-spin" />
              ) : (
                <PlayCircle className="mr-2 size-3.5" />
              )}
              Publish
            </Button>
          )}

          {isPublished && (
            <Button
              size="sm"
              variant="ghost"
              className="ml-auto h-9 rounded-lg text-slate-500 hover:bg-white hover:text-[#4c1d95]"
              asChild
            >
              <Link
                href={`/services/${encodeURIComponent(service.id)}`}
                target="_blank"
                rel="noreferrer"
              >
                <Eye className="mr-1.5 size-3.5" />
                View
              </Link>
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function StatusBadge({ status }: { status: ServiceStatus }) {
  const config =
    status === "published"
      ? {
          label: "Published",
          className: "bg-emerald-50 text-emerald-700 ring-emerald-200",
          dotClassName: "bg-emerald-500",
        }
      : status === "unpublished"
        ? {
            label: "Paused",
            className: "bg-amber-50 text-amber-700 ring-amber-200",
            dotClassName: "bg-amber-500",
          }
        : {
            label: "Draft",
            className: "bg-slate-100 text-slate-600 ring-slate-200",
            dotClassName: "bg-slate-400",
          };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ring-1 ring-inset",
        config.className,
      )}
    >
      <span className={cn("size-1.5 rounded-full", config.dotClassName)} aria-hidden />
      {config.label}
    </span>
  );
}

function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  action: React.ReactNode;
}) {
  return (
    <Card className="rounded-3xl border border-dashed border-[#ded8f3] bg-white shadow-sm">
      <CardContent className="flex flex-col items-center px-5 py-12 text-center">
        <span className="grid size-14 place-items-center rounded-2xl bg-violet-50 text-violet-600">
          <Icon className="size-7" />
        </span>
        <h2 className="mt-4 text-lg font-semibold text-[#171b45]">{title}</h2>
        <p className="mt-1 max-w-md text-sm leading-6 text-slate-500">{description}</p>
        <div className="mt-4">{action}</div>
      </CardContent>
    </Card>
  );
}

function formatServicePrice(price?: IndicativePrice | null) {
  if (!price) return "Contact for Pricing";
  return `${formatAmount(price.amount, price.currency)} / ${price.unit ?? "project"}`;
}

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}
