"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, Plus, X, Check, GitBranch, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
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
import { plansApi, type PlanConfig, type CreatePlanInput } from "@/lib/api/plans";
import { toast } from "sonner";

const schema = z.object({
  key: z.string().min(1, "Key is required").max(64).regex(/^[a-z0-9_]+$/, "Lowercase letters, numbers, underscores only"),
  display_name: z.string().min(1, "Display name is required").max(100),
  description: z.string().min(1, "Description is required").max(500),
  monthly_price: z.number().min(0, "Price must be at least 0"),
  yearly_price: z.number().min(0, "Price must be at least 0"),
  features: z.array(z.string().min(1, "Feature cannot be empty")).max(20),
  is_active: z.boolean(),
  target_role: z.enum(["talent", "recruiter", "both"]),
  message_quota_limit: z.number().min(0).nullable(),
  campaign_quota_limit: z.number().min(0).nullable(),
  max_images: z.number().min(0).nullable(),
  max_videos: z.number().min(0).nullable(),
  sort_order: z.number().min(0),
});

type FormValues = z.infer<typeof schema>;

function numberOrNull(value: string): number | null {
  return value === "" ? null : Number(value);
}

function getApiErrorMessage(error: unknown, fallback: string): string {
  const err = error as { response?: { data?: { message?: string } }; message?: string };
  return err.response?.data?.message ?? err.message ?? fallback;
}

function suggestVersionKey(plan: PlanConfig): string {
  const base = plan.family_key ?? plan.key;
  const match = plan.key.match(/_v(\d+)$/);
  const version = match ? parseInt(match[1], 10) + 1 : 2;
  return `${base}_v${version}`;
}

interface CreatePlanVersionSheetProps {
  plan: PlanConfig;
  onSuccess: () => void;
}

export function CreatePlanVersionSheet({ plan, onSuccess }: CreatePlanVersionSheetProps) {
  const [open, setOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      key: suggestVersionKey(plan),
      display_name: plan.display_name,
      description: plan.description,
      monthly_price: plan.monthly_price,
      yearly_price: plan.yearly_price,
      features: plan.features,
      is_active: true,
      target_role: plan.target_role ?? "both",
      message_quota_limit: plan.message_quota_limit ?? null,
      campaign_quota_limit: plan.campaign_quota_limit ?? null,
      max_images: plan.max_images ?? null,
      max_videos: plan.max_videos ?? null,
      sort_order: plan.sort_order ?? 0,
    },
  });

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

  const onSubmit = async (values: FormValues) => {
    setIsSaving(true);
    try {
      const payload: CreatePlanInput = {
        key: values.key.trim().toLowerCase(),
        display_name: values.display_name.trim(),
        description: values.description.trim(),
        monthly_price: Math.round(values.monthly_price),
        yearly_price: Math.round(values.yearly_price),
        features: values.features.map((f) => f.trim()).filter(Boolean),
        is_active: values.is_active,
        target_role: values.target_role,
        message_quota_limit: values.message_quota_limit ?? undefined,
        campaign_quota_limit: values.campaign_quota_limit ?? undefined,
        max_images: values.max_images ?? undefined,
        max_videos: values.max_videos ?? undefined,
        sort_order: values.sort_order,
      };

      await plansApi.createPlanVersion(plan.family_key ?? plan.key, payload);
      toast.success("Plan version created");
      setOpen(false);
      onSuccess();
      form.reset();
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Failed to create version"));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1">
          <GitBranch className="w-3.5 h-3.5" />
          New Version
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-md overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="font-[family-name:var(--font-playfair)]">
            Create version of {plan.display_name}
          </SheetTitle>
        </SheetHeader>
        <div className="mt-4 rounded-md bg-gold/10 border border-gold/20 p-3 flex gap-2 items-start">
          <Info className="w-4 h-4 text-gold shrink-0 mt-0.5" />
          <p className="text-xs text-gold">
            Benefits are shared across the family. Only price, interval, and metadata can change in a new version.
          </p>
        </div>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="mt-6 space-y-5">
            <FormField
              control={form.control}
              name="key"
              render={({ field }) => (
                <FormItem className="space-y-1.5">
                  <FormLabel className="text-xs">Plan Key</FormLabel>
                  <FormControl>
                    <Input {...field} className="h-9 text-sm" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

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

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="monthly_price"
                render={({ field }) => (
                  <FormItem className="space-y-1.5">
                    <FormLabel className="text-xs">Monthly Price (paise)</FormLabel>
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
                    <FormLabel className="text-xs">Yearly Price (paise)</FormLabel>
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
                      <SelectItem value="talent" className="text-sm">Talent Only</SelectItem>
                      <SelectItem value="recruiter" className="text-sm">Recruiter Only</SelectItem>
                      <SelectItem value="both" className="text-sm">Both</SelectItem>
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
                <FormLabel className="text-xs">Features</FormLabel>
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
                        form.setValue("features", current, { shouldValidate: true });
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
                  <p className="text-xs text-muted-foreground italic">No features added.</p>
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
                        onChange={(e) => field.onChange(numberOrNull(e.target.value))}
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
                        onChange={(e) => field.onChange(numberOrNull(e.target.value))}
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
                        onChange={(e) => field.onChange(numberOrNull(e.target.value))}
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
                      New subscribers can pick this version
                    </p>
                  </div>
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full" disabled={isSaving}>
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Creating...
                </>
              ) : (
                "Create Version"
              )}
            </Button>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
}
