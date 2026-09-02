"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useUpdatePortfolioItem } from "@/hooks/use-portfolio";
import type { PortfolioApiResponse } from "@/lib/api/talent";

const editSchema = z.object({
  title: z.string().max(100).optional(),
  caption: z.string().max(200).optional(),
  description: z.string().max(500).optional(),
  category: z.enum(["work", "personal", "intro"]).optional(),
});

type EditForm = z.infer<typeof editSchema>;

export function EditItemDialog({
  open,
  onOpenChange,
  item,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: PortfolioApiResponse | null;
}) {
  const updateItem = useUpdatePortfolioItem();

  const form = useForm<EditForm>({
    resolver: zodResolver(editSchema),
    defaultValues: {
      title: item?.title ?? "",
      caption: item?.caption ?? "",
      description: item?.description ?? "",
      category: (item?.category as "work" | "personal" | "intro") ?? "work",
    },
  });

  if (item && form.getValues("title") !== (item.title ?? "")) {
    form.reset({
      title: item.title ?? "",
      caption: item.caption ?? "",
      description: item.description ?? "",
      category: (item.category as "work" | "personal" | "intro") ?? "work",
    });
  }

  const onSubmit = async (data: EditForm) => {
    if (!item) return;
    try {
      await updateItem.mutateAsync({
        itemId: item.id,
        data: {
          title: data.title || undefined,
          caption: data.caption || undefined,
          description: data.description || undefined,
          category: data.category || undefined,
        },
      });
      toast.success("Item updated");
      onOpenChange(false);
    } catch {
      toast.error("Failed to update");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Edit Item</DialogTitle>
          <DialogDescription>Update your portfolio item details.</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Title" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="caption"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Caption</FormLabel>
                  <FormControl>
                    <Input placeholder="Caption" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Description" className="resize-none" rows={3} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="work">Work</SelectItem>
                      <SelectItem value="personal">Personal</SelectItem>
                      <SelectItem value="intro">Intro</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={updateItem.isPending}>
                Cancel
              </Button>
              <Button type="submit" disabled={updateItem.isPending}>
                {updateItem.isPending ? "Saving..." : "Save Changes"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
