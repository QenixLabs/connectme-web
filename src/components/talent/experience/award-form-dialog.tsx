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
import { Textarea } from "@/components/ui/textarea";
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
import { awardFormSchema, type AwardFormValues, type Award } from "@/lib/validations/credit-testimonial.schema";

interface AwardFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved: () => void;
  edit?: Award | null;
}

export function AwardFormDialog({ open, onOpenChange, onSaved, edit }: AwardFormDialogProps) {
  const [isSaving, setIsSaving] = useState(false);
  const popup = usePopup();

  const form = useForm<AwardFormValues>({
    resolver: zodResolver(awardFormSchema),
    defaultValues: edit
      ? {
          title: edit.title || "",
          awarding_body: edit.awarding_body || "",
          year: edit.year ?? undefined,
          description: edit.description || "",
        }
      : {
          title: "",
          awarding_body: "",
          year: undefined,
          description: "",
        },
  });

  const onSubmit = async (values: AwardFormValues) => {
    setIsSaving(true);
    try {
      if (edit?._id) {
        await talentApi.updateAward(edit._id, values);
      } else {
        await talentApi.createAward({ ...values, type: "award" });
      }
      popup.show({ title: edit ? "Award updated" : "Award added", variant: "success" });
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
          <DialogTitle>{edit ? "Edit Award" : "Add Award"}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem className="space-y-1">
                  <FormLabel className="text-xs">Award Title</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="e.g. Best Debut Actress" className="h-9 text-sm" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="awarding_body"
              render={({ field }) => (
                <FormItem className="space-y-1">
                  <FormLabel className="text-xs">Awarding Body</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="e.g. IIFA Awards 2022" className="h-9 text-sm" />
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
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem className="space-y-1">
                  <FormLabel className="text-xs">Description (optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="Brief description of the award..."
                      rows={2}
                      className="text-sm resize-none"
                    />
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
                {edit ? "Save Changes" : "Add Award"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
