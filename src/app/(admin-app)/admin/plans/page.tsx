"use client";

import { useState, useMemo, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { toast } from "sonner";
import {
  CreditCard,
  Loader2,
  Pencil,
  Plus,
  X,
  AlertTriangle,
  Check,
  Info,
  ChevronDown,
  ChevronUp,
  Star,
  Search,
  ArrowUpDown,
  RotateCcw,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { plansApi, type PlanConfig, type UpdatePlanInput } from "@/lib/api/plans";
import { queryKeys } from "@/lib/api/query-keys";
import { CreatePlanVersionSheet } from "@/components/admin/create-plan-version-sheet";
import { SunsetPlanDialog } from "@/components/admin/sunset-plan-dialog";
import { ScheduleMigrationSheet } from "@/components/admin/schedule-migration-sheet";
import { EditFamilyBenefitsSheet } from "@/components/admin/edit-family-benefits-sheet";
import { CreatePlanSheet } from "@/components/admin/create-plan-sheet";

function getApiErrorMessage(err: unknown, fallback: string): string {
  if (err instanceof Error) return err.message;
  if (typeof err === "object" && err !== null) {
    const e = err as Record<string, unknown>;
    if (e.response) {
      const resp = e.response as Record<string, unknown>;
      if (typeof resp.data === "object" && resp.data !== null) {
        const data = resp.data as Record<string, unknown>;
        if (typeof data.message === "string") return data.message;
      }
    }
  }
  return fallback;
}

const planSchema = z.object({
  display_name: z.string().min(1, "Display name is required").max(100),
  description: z.string().min(1, "Description is required").max(500),
  monthly_price: z.number().min(0, "Price must be at least 0"),
  yearly_price: z.number().min(0, "Price must be at least 0"),
  features: z.array(z.string().min(1, "Feature cannot be empty")).max(20),
  is_active: z.boolean(),
  is_popular: z.boolean(),
  target_role: z.enum(["talent", "recruiter", "provider", "both"]),
  message_quota_limit: z.number().min(0, "Limit must be at least 0").nullable(),
  campaign_quota_limit: z.number().min(0, "Limit must be at least 0").nullable(),
  max_images: z.number().min(0, "Limit must be at least 0").nullable(),
  max_videos: z.number().min(0, "Limit must be at least 0").nullable(),
  sort_order: z.number().min(0, "Sort order must be at least 0"),
});

type PlanFormValues = z.infer<typeof planSchema>;
type PlanRoleFilter = "all" | "talent" | "recruiter" | "provider" | "both";
type PlanStatusFilter = "all" | "active" | "inactive" | "sunsetting";
type PlanSort = "sort_order" | "name" | "price_asc" | "price_desc";

function formatPriceInRupees(paise: number): string {
  return `₹${(paise / 100).toLocaleString("en-IN")}`;
}

function numberOrNull(value: string): number | null {
  return value === "" ? null : Number(value);
}

function PlanEditSheet({
  plan,
  onSave,
  isSaving,
}: {
  plan: PlanConfig;
  onSave: (payload: UpdatePlanInput) => void;
  isSaving: boolean;
}) {
  const [open, setOpen] = useState(false);

  const form = useForm<PlanFormValues>({
    resolver: zodResolver(planSchema),
    defaultValues: {
      display_name: plan.display_name,
      description: plan.description,
      monthly_price: plan.monthly_price,
      yearly_price: plan.yearly_price,
      features: plan.features,
      is_active: plan.is_active,
      is_popular: plan.is_popular ?? false,
      target_role: plan.target_role ?? "both",
      message_quota_limit: plan.message_quota_limit ?? null,
      campaign_quota_limit: plan.campaign_quota_limit ?? null,
      max_images: plan.max_images ?? null,
      max_videos: plan.max_videos ?? null,
      sort_order: plan.sort_order ?? 0,
    },
  });

  const priceChanged =
    form.watch("monthly_price") !== plan.monthly_price ||
    form.watch("yearly_price") !== plan.yearly_price;

  const handleAddFeature = () => {
    const current = form.getValues("features");
    form.setValue("features", [...current, ""], { shouldValidate: true });
  };

  const handleRemoveFeature = (index: number) => {
    const current = form.getValues("features");
    form.setValue(
      "features",
      current.filter((_, i) => i !== index),
      { shouldValidate: true }
    );
  };

  const onSubmit = (values: PlanFormValues) => {
    onSave({
      display_name: values.display_name.trim(),
      description: values.description.trim(),
      monthly_price: Math.round(values.monthly_price),
      yearly_price: Math.round(values.yearly_price),
      features: values.features.map((f) => f.trim()).filter(Boolean),
      is_active: values.is_active,
      is_popular: values.is_popular,
      target_role: values.target_role,
      message_quota_limit: values.message_quota_limit ?? undefined,
      campaign_quota_limit: values.campaign_quota_limit ?? undefined,
      max_images: values.max_images ?? undefined,
      max_videos: values.max_videos ?? undefined,
      sort_order: values.sort_order,
    });
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1.5">
          <Pencil className="w-3.5 h-3.5" />
          Edit
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-md overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="font-[family-name:var(--font-playfair)]">
            Edit {plan.display_name}
          </SheetTitle>
        </SheetHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="mt-6 space-y-5"
          >
            {priceChanged && (
              <div className="rounded-md bg-amber-50 border border-amber-200 p-3 flex gap-2 items-start">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <p className="text-xs text-amber-800">
                  Changing the price will create a new Razorpay plan. Existing
                  subscribers will not be affected.
                </p>
              </div>
            )}

            <div className="rounded-md bg-muted border border-border p-3 flex gap-2 items-start">
              <Info className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
              <p className="text-xs text-muted-foreground">
                Benefits are shared across the family. Edit them with the Family
                Benefits action.
              </p>
            </div>

            <FormField
              control={form.control}
              name="display_name"
              render={({ field }) => (
                <FormItem className="space-y-1.5">
                  <FormLabel className="text-xs">Display Name</FormLabel>
                  <FormControl>
                    <Input {...field} className="h-9 text-sm" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem className="space-y-1.5">
                  <FormLabel className="text-xs">Description</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      className="text-sm min-h-[80px] resize-none"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="monthly_price"
                render={({ field }) => (
                  <FormItem className="space-y-1.5">
                    <FormLabel className="text-xs">
                      Monthly Price (paise)
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={0}
                        step={1}
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                        className="h-9 text-sm"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="yearly_price"
                render={({ field }) => (
                  <FormItem className="space-y-1.5">
                    <FormLabel className="text-xs">
                      Yearly Price (paise)
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={0}
                        step={1}
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                        className="h-9 text-sm"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="target_role"
              render={({ field }) => (
                <FormItem className="space-y-1.5">
                  <FormLabel className="text-xs">Target Role</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className="h-9 text-sm w-full">
                        <SelectValue placeholder="Select role" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="talent" className="text-sm">
                        Talent Only
                      </SelectItem>
                      <SelectItem value="recruiter" className="text-sm">
                        Recruiter Only
                      </SelectItem>
                      <SelectItem value="provider" className="text-sm">
                        Provider Only
                      </SelectItem>
                      <SelectItem value="both" className="text-sm">
                        Both
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="sort_order"
              render={({ field }) => (
                <FormItem className="space-y-1.5">
                  <FormLabel className="text-xs">Sort Order</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={0}
                      step={1}
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                      className="h-9 text-sm"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-xs">Features</Label>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-7 text-xs gap-1"
                  onClick={handleAddFeature}
                  disabled
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add
                </Button>
              </div>
              <div className="space-y-2">
                {form.watch("features").map((feature, idx) => (
                  <div key={idx} className="flex gap-2 items-center">
                    <Check className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                    <Input
                      value={feature}
                      onChange={(e) => {
                        const current = form.getValues("features");
                        current[idx] = e.target.value;
                        form.setValue("features", current, {
                          shouldValidate: true,
                        });
                      }}
                      className="h-8 text-xs flex-1"
                      placeholder="Feature description"
                      disabled
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                      onClick={() => handleRemoveFeature(idx)}
                      disabled
                    >
                      <X className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                ))}
                {form.watch("features").length === 0 && (
                  <p className="text-xs text-muted-foreground italic">
                    No features added.
                  </p>
                )}
              </div>
              {form.formState.errors.features && (
                <p className="text-xs text-destructive">
                  {form.formState.errors.features.message}
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="message_quota_limit"
                render={({ field }) => (
                  <FormItem className="space-y-1.5">
                    <FormLabel className="text-xs">Message Quota</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={0}
                        step={1}
                        value={field.value ?? ""}
                        onChange={(e) =>
                          field.onChange(numberOrNull(e.target.value))
                        }
                        className="h-9 text-sm"
                        disabled
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="campaign_quota_limit"
                render={({ field }) => (
                  <FormItem className="space-y-1.5">
                    <FormLabel className="text-xs">Campaign Quota</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={0}
                        step={1}
                        value={field.value ?? ""}
                        onChange={(e) =>
                          field.onChange(numberOrNull(e.target.value))
                        }
                        className="h-9 text-sm"
                        disabled
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="max_images"
                render={({ field }) => (
                  <FormItem className="space-y-1.5">
                    <FormLabel className="text-xs">Max Images</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={0}
                        step={1}
                        value={field.value ?? ""}
                        onChange={(e) =>
                          field.onChange(numberOrNull(e.target.value))
                        }
                        className="h-9 text-sm"
                        disabled
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="max_videos"
                render={({ field }) => (
                  <FormItem className="space-y-1.5">
                    <FormLabel className="text-xs">Max Videos</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={0}
                        step={1}
                        value={field.value ?? ""}
                        onChange={(e) =>
                          field.onChange(numberOrNull(e.target.value))
                        }
                        className="h-9 text-sm"
                        disabled
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="is_active"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between rounded-lg border p-3">
                  <div className="space-y-0.5">
                    <FormLabel className="text-sm">Active</FormLabel>
                    <p className="text-[10px] text-muted-foreground">
                      Inactive plans are hidden from the pricing page
                    </p>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="is_popular"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between rounded-lg border p-3">
                  <div className="space-y-0.5">
                    <FormLabel className="text-sm">Most Popular</FormLabel>
                    <p className="text-[10px] text-muted-foreground">
                      Badge shown on the pricing card. Only one plan per role
                      can be popular.
                    </p>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full" disabled={isSaving}>
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
}

export default function AdminPlansPage() {
  const queryClient = useQueryClient();

  const {
    data: plans,
    isLoading,
    error,
    refetch,
  } = useQuery<PlanConfig[]>({
    queryKey: queryKeys.plans.admin(),
    queryFn: plansApi.getAdminPlans,
  });

  const updateMutation = useMutation({
    mutationFn: ({
      key,
      payload,
    }: {
      key: string;
      payload: UpdatePlanInput;
    }) => plansApi.updatePlan(key, payload),
    onSuccess: () => {
      toast.success("Plan updated successfully");
      queryClient.invalidateQueries({ queryKey: queryKeys.plans.admin() });
      queryClient.invalidateQueries({ queryKey: queryKeys.plans.public() });
    },
    onError: (err: unknown) => {
      toast.error(getApiErrorMessage(err, "Failed to update plan"));
    },
  });

  const handlePlanChange = () => {
    refetch();
    queryClient.invalidateQueries({ queryKey: queryKeys.plans.public() });
  };

  const handleSave = useCallback(
    (plan: PlanConfig, payload: UpdatePlanInput) => {
      updateMutation.mutate({ key: plan.key, payload });
    },
    [updateMutation]
  );

  const familyGroups = useMemo(() => {
    const groups = new Map<string, PlanConfig[]>();
    for (const plan of plans ?? []) {
      const key = plan.family_key;
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key)!.push(plan);
    }
    for (const [, versions] of groups) {
      versions.sort((a, b) => (b.version ?? 1) - (a.version ?? 1));
    }
    return groups;
  }, [plans]);

  const [expandedFamilies, setExpandedFamilies] = useState<Set<string>>(
    new Set()
  );
  const [roleFilter, setRoleFilter] = useState<PlanRoleFilter>("all");
  const [statusFilter, setStatusFilter] = useState<PlanStatusFilter>("all");
  const [sortBy, setSortBy] = useState<PlanSort>("sort_order");
  const [search, setSearch] = useState("");

  const toggleFamily = useCallback((familyKey: string) => {
    setExpandedFamilies((prev) => {
      const next = new Set(prev);
      if (next.has(familyKey)) {
        next.delete(familyKey);
      } else {
        next.add(familyKey);
      }
      return next;
    });
  }, []);

  const activeCount = plans?.filter((p) => p.is_active).length ?? 0;
  const totalPlans = plans?.length ?? 0;
  const visibleFamilies = useMemo(() => {
    const normalizedSearch = search.trim().toLocaleLowerCase();
    const entries = Array.from(familyGroups.entries()).filter(
      ([familyKey, versions]) => {
        const latest = versions[0];
        if (roleFilter !== "all" && latest.target_role !== roleFilter) {
          return false;
        }
        if (statusFilter === "active" && !latest.is_active) return false;
        if (statusFilter === "inactive" && latest.is_active) return false;
        if (
          statusFilter === "sunsetting" &&
          !latest.sunset_at &&
          latest.accepts_new_subscriptions !== false
        ) {
          return false;
        }
        if (!normalizedSearch) return true;

        return [
          familyKey,
          ...versions.flatMap((plan) => [
            plan.key,
            plan.family_key,
            plan.display_name,
            plan.description,
            ...plan.features,
          ]),
        ].some(
          (value) =>
            typeof value === "string" &&
            value.toLocaleLowerCase().includes(normalizedSearch)
        );
      }
    );

    return entries.sort(([, versionsA], [, versionsB]) => {
      const a = versionsA[0];
      const b = versionsB[0];
      if (sortBy === "name") {
        return a.display_name.localeCompare(b.display_name);
      }
      if (sortBy === "price_asc") {
        return (
          a.monthly_price - b.monthly_price ||
          a.display_name.localeCompare(b.display_name)
        );
      }
      if (sortBy === "price_desc") {
        return (
          b.monthly_price - a.monthly_price ||
          a.display_name.localeCompare(b.display_name)
        );
      }
      return (
        (a.sort_order ?? 0) - (b.sort_order ?? 0) ||
        a.display_name.localeCompare(b.display_name)
      );
    });
  }, [familyGroups, roleFilter, search, sortBy, statusFilter]);
  const roleCounts = useMemo(() => {
    const counts: Record<PlanRoleFilter, number> = {
      all: familyGroups.size,
      talent: 0,
      recruiter: 0,
      provider: 0,
      both: 0,
    };
    for (const versions of familyGroups.values()) {
      counts[versions[0].target_role ?? "both"] += 1;
    }
    return counts;
  }, [familyGroups]);
  const expandableFamilies = visibleFamilies.filter(
    ([, versions]) => versions.length > 1
  );
  const allVisibleExpanded =
    expandableFamilies.length > 0 &&
    expandableFamilies.every(([familyKey]) => expandedFamilies.has(familyKey));

  const resetFilters = () => {
    setRoleFilter("all");
    setStatusFilter("all");
    setSortBy("sort_order");
    setSearch("");
  };

  const toggleVisibleFamilies = () => {
    setExpandedFamilies((current) => {
      const next = new Set(current);
      for (const [familyKey, versions] of visibleFamilies) {
        if (versions.length < 2) continue;
        if (allVisibleExpanded) next.delete(familyKey);
        else next.add(familyKey);
      }
      return next;
    });
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
            <CreditCard className="w-4 h-4 text-primary" strokeWidth={1.5} />
          </div>
          <div>
            <h1 className="text-lg font-semibold">Subscription Plans</h1>
            <p className="text-xs text-muted-foreground">
              Manage plan families, versions, and pricing
            </p>
          </div>
        </div>
        <CreatePlanSheet onSuccess={handlePlanChange} />
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      ) : error ? (
        <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-6 text-sm text-destructive space-y-3">
          <p>{getApiErrorMessage(error, "Failed to load plans")}</p>
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            Retry
          </Button>
        </div>
      ) : !plans || plans.length === 0 ? (
        <div className="rounded-xl border border-border bg-card p-12 text-center space-y-3">
          <CreditCard className="w-8 h-8 text-muted-foreground/40 mx-auto" />
          <p className="text-sm text-muted-foreground">No plans found.</p>
          <CreatePlanSheet onSuccess={handlePlanChange} />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              { label: "Plan families", value: familyGroups.size },
              { label: "Active versions", value: activeCount },
              {
                label: "Sunsetting",
                value:
                  plans?.filter(
                    (plan) =>
                      plan.sunset_at ||
                      plan.accepts_new_subscriptions === false
                  ).length ?? 0,
              },
              { label: "Total versions", value: totalPlans },
            ].map((stat) => (
              <div
                key={stat.label}
                className="rounded-xl border bg-card px-4 py-3"
              >
                <p className="text-xs text-muted-foreground">{stat.label}</p>
                <p className="mt-1 text-xl font-semibold">{stat.value}</p>
              </div>
            ))}
          </div>

          <section
            aria-label="Filter subscription plans"
            className="space-y-3 rounded-xl border bg-card p-4"
          >
            <Tabs
              value={roleFilter}
              onValueChange={(value) =>
                setRoleFilter(value as PlanRoleFilter)
              }
            >
              <TabsList className="h-auto w-full flex-wrap justify-start">
                {([
                  ["all", "All plans"],
                  ["talent", "Talent"],
                  ["recruiter", "Recruiter"],
                  ["provider", "Provider"],
                  ["both", "Shared"],
                ] as const).map(([value, label]) => (
                  <TabsTrigger key={value} value={value} className="gap-1.5">
                    {label}
                    <span className="text-[10px] text-muted-foreground">
                      {roleCounts[value]}
                    </span>
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
            <div className="flex flex-col gap-2 lg:flex-row lg:items-center">
              <div className="relative min-w-0 flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search plan name, key, description, or feature"
                  aria-label="Search subscription plans"
                  className="pl-9"
                />
              </div>
              <Select
                value={statusFilter}
                onValueChange={(value) =>
                  setStatusFilter(value as PlanStatusFilter)
                }
              >
                <SelectTrigger
                  aria-label="Filter by plan status"
                  className="w-full lg:w-40"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All statuses</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="sunsetting">Sunsetting</SelectItem>
                </SelectContent>
              </Select>
              <Select
                value={sortBy}
                onValueChange={(value) => setSortBy(value as PlanSort)}
              >
                <SelectTrigger
                  aria-label="Sort plans"
                  className="w-full lg:w-48"
                >
                  <ArrowUpDown className="size-4" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sort_order">Configured order</SelectItem>
                  <SelectItem value="name">Name: A to Z</SelectItem>
                  <SelectItem value="price_asc">Price: low to high</SelectItem>
                  <SelectItem value="price_desc">Price: high to low</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
              <span>
                Showing {visibleFamilies.length} of {familyGroups.size} plan families
              </span>
              <div className="flex items-center gap-3">
                {(search ||
                  roleFilter !== "all" ||
                  statusFilter !== "all" ||
                  sortBy !== "sort_order") && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 gap-1 px-2"
                    onClick={resetFilters}
                  >
                    <RotateCcw className="size-3.5" />
                    Reset filters
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 px-2"
                  onClick={toggleVisibleFamilies}
                  disabled={expandableFamilies.length === 0}
                >
                  {allVisibleExpanded ? "Collapse versions" : "Expand versions"}
                </Button>
              </div>
            </div>
          </section>

          {visibleFamilies.length === 0 ? (
            <div className="rounded-xl border border-dashed bg-card p-10 text-center">
              <Search className="mx-auto size-7 text-muted-foreground/50" />
              <p className="mt-3 text-sm font-medium">No plans match these filters</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Try another role, status, or search term.
              </p>
              <Button
                variant="outline"
                size="sm"
                className="mt-4"
                onClick={resetFilters}
              >
                Clear filters
              </Button>
            </div>
          ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {visibleFamilies.map(
              ([familyKey, versions]) => {
                const latest = versions[0];
                const older = versions.slice(1);
                const isExpanded = expandedFamilies.has(familyKey);
                const isFree =
                  latest.monthly_price === 0 && latest.yearly_price === 0;

                return (
                  <div
                    key={familyKey}
                    className={`rounded-2xl border bg-card flex flex-col overflow-hidden transition-shadow hover:shadow-md ${
                      latest.is_popular
                        ? "ring-2 ring-brand/30 shadow-[0_0_20px_-5px_rgba(245,158,11,0.15)]"
                        : "shadow-sm"
                    }`}
                  >
                    {/* Card Header */}
                    <div className="p-5 pb-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 mb-1.5">
                            {latest.is_popular && (
                              <Badge className="text-[10px] px-1.5 py-0 gap-1 bg-brand text-primary-foreground">
                                <Star className="w-2.5 h-2.5 fill-current" />
                                Popular
                              </Badge>
                            )}
                            <h2 className="text-base font-semibold tracking-tight truncate">
                              {latest.display_name}
                            </h2>
                          </div>
                          <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
                            {latest.description}
                          </p>
                        </div>
                        <Badge
                          variant={
                            latest.is_active ? "default" : "secondary"
                          }
                          className="text-[10px] shrink-0"
                        >
                          {latest.is_active ? "Active" : "Inactive"}
                        </Badge>
                      </div>

                      {/* Badges row */}
                      <div className="flex flex-wrap gap-1.5 mt-3">
                        <Badge
                          variant="outline"
                          className="text-[10px]"
                        >
                          v{latest.version ?? 1}
                        </Badge>
                        <Badge variant="outline" className="text-[10px]">
                          Order {latest.sort_order ?? 0}
                        </Badge>
                        <Badge
                          variant="outline"
                          className={`text-[10px] capitalize ${
                            latest.target_role === "talent"
                              ? "bg-blue-50 text-blue-700 border-blue-200"
                              : latest.target_role === "recruiter"
                              ? "bg-sky-50 text-sky-700 border-sky-200"
                              : latest.target_role === "provider"
                              ? "bg-violet-50 text-violet-700 border-violet-200"
                              : "bg-muted text-muted-foreground border-border"
                          }`}
                        >
                          {latest.target_role}
                        </Badge>
                        {latest.family_key &&
                          latest.family_key !== latest.key && (
                            <Badge
                              variant="outline"
                              className="text-[10px] font-mono"
                            >
                              {latest.family_key}
                            </Badge>
                          )}
                        {latest.sunset_at && (
                          <Badge
                            variant="destructive"
                            className="text-[10px]"
                          >
                            Sunsets{" "}
                            {new Date(
                              latest.sunset_at
                            ).toLocaleDateString()}
                          </Badge>
                        )}
                        {latest.accepts_new_subscriptions ===
                          false && (
                          <Badge
                            variant="secondary"
                            className="text-[10px]"
                          >
                            no new subs
                          </Badge>
                        )}
                      </div>
                    </div>

                    {/* Price */}
                    <div className="px-5 pb-1">
                      {isFree ? (
                        <div className="flex items-baseline gap-1">
                          <span className="text-3xl font-bold tracking-tight">
                            Free
                          </span>
                        </div>
                      ) : (
                        <div className="flex items-baseline gap-2">
                          <span className="text-3xl font-bold tracking-tight">
                            {formatPriceInRupees(latest.monthly_price)}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            /month
                          </span>
                          {latest.yearly_price > 0 && (
                            <span className="text-sm text-muted-foreground">
                              · {formatPriceInRupees(latest.yearly_price)}
                              /yr
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    <Separator className="mt-4" />

                    {/* Features */}
                    <div className="px-5 py-4 flex-1">
                      <ul className="space-y-2.5">
                        {latest.features.map((feature, idx) => (
                          <li
                            key={idx}
                            className="flex items-start gap-2.5 text-sm text-muted-foreground"
                          >
                            <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                            <span>{feature}</span>
                          </li>
                        ))}
                        {latest.features.length === 0 && (
                          <li className="text-sm text-muted-foreground italic">
                            No features listed
                          </li>
                        )}
                      </ul>
                    </div>

                    {/* Actions */}
                    <div className="px-4 pb-4">
                      <div className="flex flex-wrap items-center gap-2 pt-3 border-t">
                        <PlanEditSheet
                          plan={latest}
                          onSave={(payload) =>
                            handleSave(latest, payload)
                          }
                          isSaving={updateMutation.isPending}
                        />
                        <CreatePlanVersionSheet
                          plan={latest}
                          onSuccess={handlePlanChange}
                        />
                        <EditFamilyBenefitsSheet
                          plan={latest}
                          onSuccess={handlePlanChange}
                        />
                        <SunsetPlanDialog
                          plan={latest}
                          plans={plans ?? []}
                          onSuccess={handlePlanChange}
                        />
                        <ScheduleMigrationSheet
                          plan={latest}
                          plans={plans ?? []}
                          onSuccess={handlePlanChange}
                        />
                      </div>
                    </div>

                    {/* Older versions */}
                    {older.length > 0 && (
                      <>
                        <button
                          type="button"
                          onClick={() => toggleFamily(familyKey)}
                          className="flex items-center justify-center gap-1.5 py-2.5 text-xs text-muted-foreground hover:text-foreground transition-colors border-t bg-muted/20"
                        >
                          {isExpanded ? (
                            <ChevronUp className="w-3.5 h-3.5" />
                          ) : (
                            <ChevronDown className="w-3.5 h-3.5" />
                          )}
                          {isExpanded
                            ? "Hide versions"
                            : `${older.length} older version${older.length !== 1 ? "s" : ""}`}
                        </button>

                        {isExpanded && (
                          <div className="px-4 pb-4 space-y-2.5 bg-muted/10 pt-3 border-t">
                            {older.map((v) => (
                              <div
                                key={v.key}
                                className="rounded-lg border bg-card p-3 space-y-2.5"
                              >
                                <div className="flex items-start justify-between gap-2">
                                  <div className="flex flex-wrap items-center gap-1.5 min-w-0">
                                    <Badge
                                      variant="outline"
                                      className="text-[10px] shrink-0"
                                    >
                                      v{v.version ?? 1}
                                    </Badge>
                                    <span className="text-[11px] font-mono text-muted-foreground truncate">
                                      {v.key}
                                    </span>
                                    {v.sunset_at && (
                                      <Badge
                                        variant="destructive"
                                        className="text-[10px]"
                                      >
                                        sunsets{" "}
                                        {new Date(
                                          v.sunset_at
                                        ).toLocaleDateString()}
                                      </Badge>
                                    )}
                                    {v.accepts_new_subscriptions ===
                                      false && (
                                      <Badge
                                        variant="secondary"
                                        className="text-[10px]"
                                      >
                                        no new subs
                                      </Badge>
                                    )}
                                  </div>
                                  <Badge
                                    variant={
                                      v.is_active
                                        ? "default"
                                        : "secondary"
                                    }
                                    className="text-[10px] shrink-0"
                                  >
                                    {v.is_active ? "Active" : "Inactive"}
                                  </Badge>
                                </div>

                                <div className="text-sm font-medium">
                                  {v.monthly_price === 0 &&
                                  v.yearly_price === 0 ? (
                                    "Free"
                                  ) : (
                                    <span>
                                      {formatPriceInRupees(
                                        v.monthly_price
                                      )}
                                      /mo
                                      {v.yearly_price > 0 && (
                                        <span className="text-xs text-muted-foreground ml-1">
                                          ·{" "}
                                          {formatPriceInRupees(
                                            v.yearly_price
                                          )}
                                          /yr
                                        </span>
                                      )}
                                    </span>
                                  )}
                                </div>

                                <div className="flex flex-wrap items-center gap-1.5">
                                  <PlanEditSheet
                                    plan={v}
                                    onSave={(payload) =>
                                      handleSave(v, payload)
                                    }
                                    isSaving={updateMutation.isPending}
                                  />
                                  <SunsetPlanDialog
                                    plan={v}
                                    plans={plans ?? []}
                                    onSuccess={handlePlanChange}
                                  />
                                  <ScheduleMigrationSheet
                                    plan={v}
                                    plans={plans ?? []}
                                    onSuccess={handlePlanChange}
                                  />
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                );
              }
            )}
          </div>
          )}
        </>
      )}
    </div>
  );
}
