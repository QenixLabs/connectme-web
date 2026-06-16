"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import {
  CreditCard,
  Loader2,
  Pencil,
  Plus,
  X,
  AlertTriangle,
  Check,
} from "lucide-react";
import { usePopup } from "@/hooks/use-popup";

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
import { plansApi, type PlanConfig, type UpdatePlanInput } from "@/lib/api/plans";
import { queryKeys } from "@/lib/api/query-keys";
import { getApiErrorMessage } from "@/lib/formatters";

const INTERVALS = ["monthly", "yearly"] as const;
const SUBSCRIPTION_TIERS = [
  { value: "none", label: "None" },
  { value: "free", label: "Free" },
  { value: "premium_talent", label: "Premium Talent" },
  { value: "pro_talent", label: "Pro Talent" },
  { value: "premium_recruiter", label: "Premium Recruiter" },
  { value: "enterprise_recruiter", label: "Enterprise Recruiter" },
] as const;

const planSchema = z.object({
  display_name: z.string().min(1, "Display name is required").max(100),
  description: z.string().min(1, "Description is required").max(500),
  price: z.number().min(0, "Price must be at least 0"),
  interval: z.enum(["monthly", "yearly"], {
    message: "Interval must be monthly or yearly",
  }),
  features: z.array(z.string().min(1, "Feature cannot be empty")).max(20),
  is_active: z.boolean(),
  message_quota_limit: z.number().min(0, "Limit must be at least 0").nullable(),
  campaign_quota_limit: z.number().min(0, "Limit must be at least 0").nullable(),
  max_images: z.number().min(0, "Limit must be at least 0").nullable(),
  max_videos: z.number().min(0, "Limit must be at least 0").nullable(),
  subscription_tier: z
    .enum(["none", "free", "premium_talent", "pro_talent", "premium_recruiter", "enterprise_recruiter"])
    .nullable(),
  sort_order: z.number().min(0, "Sort order must be at least 0"),
});

type PlanFormValues = z.infer<typeof planSchema>;

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
      price: plan.price,
      interval: plan.interval ?? "monthly",
      features: plan.features,
      is_active: plan.is_active,
      message_quota_limit: plan.message_quota_limit ?? null,
      campaign_quota_limit: plan.campaign_quota_limit ?? null,
      max_images: plan.max_images ?? null,
      max_videos: plan.max_videos ?? null,
      subscription_tier: plan.subscription_tier ?? "none",
      sort_order: plan.sort_order ?? 0,
    },
  });

  const priceChanged = form.watch("price") !== plan.price;

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
      price: Math.round(values.price),
      interval: values.interval,
      features: values.features.map((f) => f.trim()).filter(Boolean),
      is_active: values.is_active,
      message_quota_limit: values.message_quota_limit ?? undefined,
      campaign_quota_limit: values.campaign_quota_limit ?? undefined,
      max_images: values.max_images ?? undefined,
      max_videos: values.max_videos ?? undefined,
      subscription_tier:
        values.subscription_tier && values.subscription_tier !== "none"
          ? values.subscription_tier
          : undefined,
      sort_order: values.sort_order,
    });
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1">
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
          <form onSubmit={form.handleSubmit(onSubmit)} className="mt-6 space-y-5">
            {priceChanged && (
              <div className="rounded-md bg-amber-50 border border-amber-200 p-3 flex gap-2 items-start">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <p className="text-xs text-amber-800">
                  Changing the price will create a new Razorpay plan. Existing
                  subscribers will not be affected.
                </p>
              </div>
            )}

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
                    <Textarea {...field} className="text-sm min-h-[80px] resize-none" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="price"
              render={({ field }) => (
                <FormItem className="space-y-1.5">
                  <FormLabel className="text-xs">Price (₹)</FormLabel>
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
                  <p className="text-[10px] text-muted-foreground">
                    Stored in paise: {Math.round(field.value)}
                  </p>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="interval"
              render={({ field }) => (
                <FormItem className="space-y-1.5">
                  <FormLabel className="text-xs">Billing Interval</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className="h-9 text-sm w-full">
                        <SelectValue placeholder="Select interval" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {INTERVALS.map((interval) => (
                        <SelectItem key={interval} value={interval} className="text-sm capitalize">
                          {interval}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="subscription_tier"
              render={({ field }) => (
                <FormItem className="space-y-1.5">
                  <FormLabel className="text-xs">Subscription Tier</FormLabel>
                  <Select
                    onValueChange={(value) => field.onChange(value === "none" ? null : value)}
                    value={field.value ?? "none"}
                  >
                    <FormControl>
                      <SelectTrigger className="h-9 text-sm w-full">
                        <SelectValue placeholder="Select tier" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {SUBSCRIPTION_TIERS.map((tier) => (
                        <SelectItem key={tier.value} value={tier.value} className="text-sm">
                          {tier.label}
                        </SelectItem>
                      ))}
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
                        form.setValue("features", current, { shouldValidate: true });
                      }}
                      className="h-8 text-xs flex-1"
                      placeholder="Feature description"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                      onClick={() => handleRemoveFeature(idx)}
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
                        onChange={(e) => field.onChange(numberOrNull(e.target.value))}
                        className="h-9 text-sm"
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
                        onChange={(e) => field.onChange(numberOrNull(e.target.value))}
                        className="h-9 text-sm"
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
                        onChange={(e) => field.onChange(numberOrNull(e.target.value))}
                        className="h-9 text-sm"
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
                        onChange={(e) => field.onChange(numberOrNull(e.target.value))}
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
  const popup = usePopup();
  const [editingPlan, setEditingPlan] = useState<PlanConfig | null>(null);

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
    mutationFn: ({ key, payload }: { key: string; payload: UpdatePlanInput }) =>
      plansApi.updatePlan(key, payload),
    onSuccess: () => {
      popup.show({ title: "Plan updated successfully", variant: "success" });
      queryClient.invalidateQueries({ queryKey: queryKeys.plans.admin() });
      setEditingPlan(null);
    },
    onError: (err: unknown) => {
      popup.show({ title: getApiErrorMessage(err, "Failed to update plan"), variant: "error" });
    },
  });

  const handleSave = (plan: PlanConfig, payload: UpdatePlanInput) => {
    updateMutation.mutate({ key: plan.key, payload });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CreditCard className="w-5 h-5 text-slate-600" strokeWidth={1.5} />
          <h1 className="text-lg font-semibold">Subscription Plans</h1>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      ) : error ? (
        <div className="rounded-md border border-destructive/50 bg-destructive/5 p-4 text-sm text-destructive space-y-2">
          <p>{getApiErrorMessage(error, "Failed to load plans")}</p>
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            Retry
          </Button>
        </div>
      ) : !plans || plans.length === 0 ? (
        <p className="text-sm text-muted-foreground">No plans found.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {plans.map((plan) => (
            <div
              key={plan.key}
              className="rounded-xl border bg-card p-5 flex flex-col gap-4"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="font-[family-name:var(--font-playfair)] text-xl font-semibold">
                    {plan.display_name}
                  </h2>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {plan.description}
                  </p>
                </div>
                <Badge
                  variant={plan.is_active ? "default" : "secondary"}
                  className="text-[10px]"
                >
                  {plan.is_active ? "Active" : "Inactive"}
                </Badge>
              </div>

              <div className="text-2xl font-semibold tracking-tight">
                {plan.price === 0 ? (
                  <span>Free</span>
                ) : (
                  <span>{formatPriceInRupees(plan.price)}/mo</span>
                )}
              </div>

              <ul className="space-y-2 flex-1">
                {plan.features.map((feature, idx) => (
                  <li
                    key={idx}
                    className="flex items-start gap-2 text-sm text-muted-foreground"
                  >
                    <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    <span>{feature}</span>
                  </li>
                ))}
                {plan.features.length === 0 && (
                  <li className="text-sm text-muted-foreground italic">
                    No features listed
                  </li>
                )}
              </ul>

              <PlanEditSheet
                plan={plan}
                onSave={(payload) => handleSave(plan, payload)}
                isSaving={updateMutation.isPending}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
