"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, Plus, X, Check, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { plansApi, type PlanConfig, type UpdateFamilyBenefitsInput } from "@/lib/api/plans";
import { toast } from "sonner";
import { PermissionSelector } from "@/components/admin/permission-selector";

const schema = z.object({
  features: z.array(z.string().min(1, "Feature cannot be empty")).max(20),
  permissions: z.array(z.string().min(1, "Permission cannot be empty")).max(50),
  message_quota_limit: z.number().min(0, "Limit must be at least 0").nullable(),
  campaign_quota_limit: z.number().min(0, "Limit must be at least 0").nullable(),
  max_images: z.number().min(0, "Limit must be at least 0").nullable(),
  max_videos: z.number().min(0, "Limit must be at least 0").nullable(),
});

type FormValues = z.infer<typeof schema>;

function numberOrNull(value: string): number | null {
  return value === "" ? null : Number(value);
}

function getApiErrorMessage(error: unknown, fallback: string): string {
  const err = error as { response?: { data?: { message?: string } }; message?: string };
  return err.response?.data?.message ?? err.message ?? fallback;
}

interface EditFamilyBenefitsSheetProps {
  plan: PlanConfig;
  onSuccess: () => void;
}

export function EditFamilyBenefitsSheet({ plan, onSuccess }: EditFamilyBenefitsSheetProps) {
  const [open, setOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      features: plan.features,
      permissions: plan.permissions ?? [],
      message_quota_limit: plan.message_quota_limit ?? null,
      campaign_quota_limit: plan.campaign_quota_limit ?? null,
      max_images: plan.max_images ?? null,
      max_videos: plan.max_videos ?? null,
    },
  });

  const handleAddFeature = () => {
    const current = form.getValues("features");
    form.setValue("features", [...current, ""], { shouldValidate: true });
  };

  const handleRemoveFeature = (index: number) => {
    const current = form.getValues("features");
    form.setValue("features", current.filter((_, i) => i !== index), { shouldValidate: true });
  };

  const onSubmit = async (values: FormValues) => {
    setIsSaving(true);
    try {
      const payload: UpdateFamilyBenefitsInput = {
        features: values.features.map((f) => f.trim()).filter(Boolean),
        permissions: values.permissions.map((p) => p.trim()).filter(Boolean),
        message_quota_limit: values.message_quota_limit ?? undefined,
        campaign_quota_limit: values.campaign_quota_limit ?? undefined,
        max_images: values.max_images ?? undefined,
        max_videos: values.max_videos ?? undefined,
      };

      await plansApi.updateFamilyBenefits(plan.family_key ?? plan.key, payload);
      toast.success("Family benefits updated");
      setOpen(false);
      onSuccess();
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Failed to update family benefits"));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1">
          <Users className="w-3.5 h-3.5" />
          Family Benefits
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-md overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="font-[family-name:var(--font-playfair)]">
            Edit {plan.display_name} family benefits
          </SheetTitle>
        </SheetHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="mt-6 space-y-5">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <FormLabel className="text-xs">Features</FormLabel>
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
                  <p className="text-xs text-muted-foreground italic">No features added.</p>
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
              name="permissions"
              render={({ field }) => (
                <FormItem className="space-y-1.5">
                  <FormLabel className="text-xs">Feature Permissions</FormLabel>
                  <FormControl>
                    <PermissionSelector value={field.value ?? []} onChange={field.onChange} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

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

            <Button type="submit" className="w-full" disabled={isSaving}>
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Saving...
                </>
              ) : (
                "Update Family Benefits"
              )}
            </Button>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
}
