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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { talentApi } from "@/lib/api";
import { usePopup } from "@/hooks/use-popup";
import { getApiErrorMessage } from "@/lib/formatters";
import { testimonialFormSchema, type TestimonialFormValues, type Testimonial } from "@/lib/validations/credit-testimonial.schema";

interface TestimonialFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved: () => void;
  edit?: Testimonial | null;
}

export function TestimonialFormDialog({ open, onOpenChange, onSaved, edit }: TestimonialFormDialogProps) {
  const [isSaving, setIsSaving] = useState(false);
  const popup = usePopup();

  const form = useForm<TestimonialFormValues>({
    resolver: zodResolver(testimonialFormSchema),
    defaultValues: edit
      ? {
          author_name: edit.author_name || "",
          author_role: edit.author_role || "",
          author_company: edit.author_company || "",
          content: edit.content || "",
          rating: edit.rating ?? undefined,
        }
      : {
          author_name: "",
          author_role: "",
          author_company: "",
          content: "",
          rating: undefined,
        },
  });

  const onSubmit = async (values: TestimonialFormValues) => {
    setIsSaving(true);
    try {
      if (edit?._id) {
        await talentApi.updateTestimonial(edit._id, values);
      } else {
        await talentApi.createTestimonial({ ...values, type: "testimonial" });
      }
      popup.show({ title: edit ? "Testimonial updated" : "Testimonial added", variant: "success" });
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
          <DialogTitle>{edit ? "Edit Testimonial" : "Add Testimonial"}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="author_name"
              render={({ field }) => (
                <FormItem className="space-y-1">
                  <FormLabel className="text-xs">Author Name</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="e.g. Karan Johar" className="h-9 text-sm" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-3">
              <FormField
                control={form.control}
                name="author_role"
                render={({ field }) => (
                  <FormItem className="space-y-1">
                    <FormLabel className="text-xs">Role</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="e.g. Director" className="h-9 text-sm" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="author_company"
                render={({ field }) => (
                  <FormItem className="space-y-1">
                    <FormLabel className="text-xs">Company</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="e.g. Dharma Productions" className="h-9 text-sm" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="rating"
              render={({ field }) => (
                <FormItem className="space-y-1">
                  <FormLabel className="text-xs">Rating</FormLabel>
                  <Select
                    onValueChange={(v) => field.onChange(v ? Number(v) : undefined)}
                    value={field.value?.toString()}
                  >
                    <FormControl>
                      <SelectTrigger className="h-9 text-sm w-full">
                        <SelectValue placeholder="Select rating" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {[5, 4, 3, 2, 1].map((n) => (
                        <SelectItem key={n} value={n.toString()}>
                          {`${n} star${n > 1 ? "s" : ""}`}
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
              name="content"
              render={({ field }) => (
                <FormItem className="space-y-1">
                  <FormLabel className="text-xs">Testimonial</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="Write the testimonial..."
                      rows={4}
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
                {edit ? "Save Changes" : "Add Testimonial"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
