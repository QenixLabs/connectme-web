"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { talentApi } from "@/lib/api";
import { usePopup } from "@/hooks/use-popup";
import { getApiErrorMessage } from "@/lib/formatters";
import { creditFormSchema, type CreditFormValues, type Credit } from "@/lib/validations/credit-testimonial.schema";

interface CreditFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved: () => void;
  edit?: Credit | null;
}

export function CreditFormDialog({ open, onOpenChange, onSaved, edit }: CreditFormDialogProps) {
  const [isSaving, setIsSaving] = useState(false);
  const popup = usePopup();

  const form = useForm<CreditFormValues>({
    resolver: zodResolver(creditFormSchema),
    defaultValues: edit
      ? {
          project_name: edit.project_name || "",
          role_played: edit.role_played || "",
          platform: edit.platform || "",
          year: edit.year ?? undefined,
          director: edit.director || "",
          credit_url: edit.credit_url || "",
        }
      : {
          project_name: "",
          role_played: "",
          platform: "",
          year: undefined,
          director: "",
          credit_url: "",
        },
  });

  const onSubmit = async (values: CreditFormValues) => {
    setIsSaving(true);
    try {
      if (edit?._id) {
        await talentApi.updateCredit(edit._id, values);
      } else {
        await talentApi.createCredit({ ...values, type: "credit" });
      }
      popup.show({ title: edit ? "Credit updated" : "Credit added", variant: "success" });
      onOpenChange(false);
      form.reset();
      onSaved();
    } catch (err) {
      popup.show({
        title: "Failed to save",
        description: getApiErrorMessage(err),
        variant: "error",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{edit ? "Edit Credit" : "Add Credit"}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="project_name"
              render={({ field }) => (
                <FormItem className="space-y-1">
                  <FormLabel className="text-xs">Project / Title</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="e.g. Yaariyan 2" className="h-9 text-sm" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="role_played"
              render={({ field }) => (
                <FormItem className="space-y-1">
                  <FormLabel className="text-xs">Role</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="e.g. Lead Role" className="h-9 text-sm" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-3">
              <FormField
                control={form.control}
                name="platform"
                render={({ field }) => (
                  <FormItem className="space-y-1">
                    <FormLabel className="text-xs">Platform</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="e.g. Netflix" className="h-9 text-sm" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="year"
                render={({ field }) => (
                  <FormItem className="space-y-1">
                    <FormLabel className="text-xs">Year</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        value={field.value ?? ""}
                        onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                        placeholder="2024"
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
              name="director"
              render={({ field }) => (
                <FormItem className="space-y-1">
                  <FormLabel className="text-xs">Director</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="e.g. Mohit Suri" className="h-9 text-sm" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="credit_url"
              render={({ field }) => (
                <FormItem className="space-y-1">
                  <FormLabel className="text-xs">Reference URL</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="https://..." className="h-9 text-sm" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="h-9">
                Cancel
              </Button>
              <Button type="submit" disabled={isSaving} className="h-9">
                {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {edit ? "Save Changes" : "Add Credit"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
