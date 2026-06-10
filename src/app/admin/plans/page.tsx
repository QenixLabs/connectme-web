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

const planSchema = z.object({
  display_name: z.string().min(1, "Display name is required").max(100),
  description: z.string().min(1, "Description is required").max(500),
  price: z.number().min(0, "Price must be at least 0"),
  features: z.array(z.string().min(1, "Feature cannot be empty")).max(20),
  is_active: z.boolean(),
});

type PlanFormValues = z.infer<typeof planSchema>;

function formatPriceInRupees(paise: number): string {
  return `₹${(paise / 100).toLocaleString("en-IN")}`;
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
      features: plan.features,
      is_active: plan.is_active,
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
      features: values.features.map((f) => f.trim()).filter(Boolean),
      is_active: values.is_active,
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
