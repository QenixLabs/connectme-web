"use client";

import { useState } from "react";
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
import { toast } from "sonner";

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
import { plansApi, type PlanConfig, type UpdatePlanInput } from "@/lib/api/plans";
import { getApiErrorMessage } from "@/lib/formatters";

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
  const [displayName, setDisplayName] = useState(plan.display_name);
  const [description, setDescription] = useState(plan.description);
  const [priceRs, setPriceRs] = useState(plan.price / 100);
  const [features, setFeatures] = useState<string[]>(plan.features);
  const [isActive, setIsActive] = useState(plan.is_active);

  const priceChanged = priceRs !== plan.price / 100;

  const handleAddFeature = () => {
    setFeatures((prev) => [...prev, ""]);
  };

  const handleRemoveFeature = (index: number) => {
    setFeatures((prev) => prev.filter((_, i) => i !== index));
  };

  const handleFeatureChange = (index: number, value: string) => {
    setFeatures((prev) => prev.map((f, i) => (i === index ? value : f)));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload: UpdatePlanInput = {
      display_name: displayName.trim(),
      description: description.trim(),
      price: Math.round(priceRs * 100),
      features: features.map((f) => f.trim()).filter(Boolean),
      is_active: isActive,
    };
    onSave(payload);
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
        <form onSubmit={handleSubmit} className="mt-6 space-y-5">
          {priceChanged && (
            <div className="rounded-md bg-amber-50 border border-amber-200 p-3 flex gap-2 items-start">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <p className="text-xs text-amber-800">
                Changing the price will create a new Razorpay plan. Existing
                subscribers will not be affected.
              </p>
            </div>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="displayName" className="text-xs">
              Display Name
            </Label>
            <Input
              id="displayName"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="h-9 text-sm"
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="description" className="text-xs">
              Description
            </Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="text-sm min-h-[80px] resize-none"
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="price" className="text-xs">
              Price (₹)
            </Label>
            <Input
              id="price"
              type="number"
              min={0}
              step={1}
              value={priceRs}
              onChange={(e) => setPriceRs(Number(e.target.value))}
              className="h-9 text-sm"
              required
            />
            <p className="text-[10px] text-muted-foreground">
              Stored in paise: {Math.round(priceRs * 100)}
            </p>
          </div>

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
              {features.map((feature, idx) => (
                <div key={idx} className="flex gap-2 items-center">
                  <Check className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                  <Input
                    value={feature}
                    onChange={(e) => handleFeatureChange(idx, e.target.value)}
                    className="h-8 text-xs flex-1"
                    placeholder="Feature description"
                    required
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
              {features.length === 0 && (
                <p className="text-xs text-muted-foreground italic">
                  No features added.
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between rounded-lg border p-3">
            <div className="space-y-0.5">
              <Label htmlFor="isActive" className="text-sm">
                Active
              </Label>
              <p className="text-[10px] text-muted-foreground">
                Inactive plans are hidden from the pricing page
              </p>
            </div>
            <Switch
              id="isActive"
              checked={isActive}
              onCheckedChange={setIsActive}
            />
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={isSaving}
          >
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
      </SheetContent>
    </Sheet>
  );
}

export default function AdminPlansPage() {
  const queryClient = useQueryClient();
  const [editingPlan, setEditingPlan] = useState<PlanConfig | null>(null);

  const {
    data: plans,
    isLoading,
    error,
  } = useQuery<PlanConfig[]>({
    queryKey: ["admin-plans"],
    queryFn: plansApi.getAdminPlans,
  });

  const updateMutation = useMutation({
    mutationFn: ({ key, payload }: { key: string; payload: UpdatePlanInput }) =>
      plansApi.updatePlan(key, payload),
    onSuccess: () => {
      toast.success("Plan updated successfully");
      queryClient.invalidateQueries({ queryKey: ["admin-plans"] });
      setEditingPlan(null);
    },
    onError: (err: unknown) => {
      toast.error(getApiErrorMessage(err, "Failed to update plan"));
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
        <div className="rounded-md border border-destructive/50 bg-destructive/5 p-4 text-sm text-destructive">
          {getApiErrorMessage(error, "Failed to load plans")}
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
