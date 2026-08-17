"use client";

import { useState } from "react";
import {
  Award,
  Briefcase,
  ChevronDown,
  ChevronRight,
  GraduationCap,
  Lightbulb,
  Pencil,
  Plus,
  Star,
  Trash2,
  User,
} from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import {
  useMyCredits,
  useMyTestimonials,
  useMyAwards,
  useCreateCredit,
  useUpdateCredit,
  useDeleteCredit,
  useCreateTestimonial,
  useUpdateTestimonial,
  useDeleteTestimonial,
  useCreateAward,
  useUpdateAward,
  useDeleteAward,
} from "@/hooks/use-experience";
import type { Credit, Testimonial, Award as AwardType } from "@/lib/api/talent";
import { cn } from "@/lib/utils";

// ── Schemas ────────────────────────────────────────────────
const creditSchema = z.object({
  project_name: z.string().min(1, "Project name is required"),
  role_played: z.string().min(1, "Role is required"),
  platform: z.string().optional(),
  director: z.string().optional(),
  year: z.coerce.number().min(1900, "Invalid year").max(2100, "Invalid year").optional().or(z.nan()),
  credit_url: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  description: z.string().max(500, "Max 500 characters").optional(),
});

const testimonialSchema = z.object({
  author_name: z.string().min(1, "Author name is required"),
  content: z.string().min(1, "Testimonial content is required").max(2000, "Max 2000 characters"),
  author_role: z.string().optional(),
  author_company: z.string().optional(),
  rating: z.coerce.number().min(1, "Minimum 1").max(5, "Maximum 5").optional().or(z.nan()),
});

const awardSchema = z.object({
  title: z.string().min(1, "Award title is required"),
  awarding_body: z.string().min(1, "Awarding body is required"),
  year: z.coerce.number().min(1900, "Invalid year").max(2100, "Invalid year").optional().or(z.nan()),
  description: z.string().max(500, "Max 500 characters").optional(),
});

type CreditForm = z.infer<typeof creditSchema>;
type TestimonialForm = z.infer<typeof testimonialSchema>;
type AwardForm = z.infer<typeof awardSchema>;

// ── Helpers ────────────────────────────────────────────────
function formatYear(year?: number | string): string {
  if (!year) return "";
  const y = typeof year === "string" ? parseInt(year, 10) : year;
  return isNaN(y) ? "" : String(y);
}

function YearSelect({
  value,
  onChange,
  placeholder = "Select year",
}: {
  value?: number;
  onChange: (value?: number) => void;
  placeholder?: string;
}) {
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: currentYear - 1899 }, (_, i) => currentYear - i);
  return (
    <Select
      value={value ? String(value) : ""}
      onValueChange={(val) => onChange(val ? Number(val) : undefined)}
    >
      <SelectTrigger>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {years.map((year) => (
          <SelectItem key={year} value={String(year)}>
            {year}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

function StarRating({ rating }: { rating?: number }) {
  if (!rating) return null;
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={cn(
            "h-3.5 w-3.5",
            i < rating ? "fill-gold text-gold" : "text-muted-foreground/30",
          )}
        />
      ))}
    </div>
  );
}

// ── Loading Skeletons ──────────────────────────────────────
function CreditSkeleton() {
  return (
    <Card className="p-4">
      <div className="flex items-start gap-3">
        <Skeleton className="h-10 w-10 shrink-0 rounded-lg" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
          <Skeleton className="h-3 w-1/3" />
        </div>
      </div>
    </Card>
  );
}

function TestimonialSkeleton() {
  return (
    <Card className="p-4">
      <div className="space-y-3">
        <Skeleton className="h-3 w-1/4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="h-3 w-1/3" />
      </div>
    </Card>
  );
}

function AwardSkeleton() {
  return (
    <Card className="p-4">
      <div className="flex items-start gap-3">
        <Skeleton className="h-10 w-10 shrink-0 rounded-full" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-2/3" />
          <Skeleton className="h-3 w-1/2" />
        </div>
      </div>
    </Card>
  );
}

// ── Empty State ────────────────────────────────────────────
function EmptyState({
  icon: Icon,
  title,
  description,
  ctaLabel,
  onCta,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
  ctaLabel: string;
  onCta: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border py-16 text-center">
      <div className="relative">
        <Icon className="h-16 w-16 text-muted-foreground/40" strokeWidth={1.25} />
        <span className="absolute -right-1 -top-1 text-primary">
          <Star className="h-5 w-5" />
        </span>
      </div>
      <h3 className="mt-4 text-lg font-semibold">{title}</h3>
      <p className="mt-1 max-w-xs text-sm text-muted-foreground">{description}</p>
      <Button variant="outline" className="mt-5" onClick={onCta}>
        <Plus className="mr-2 h-4 w-4" /> {ctaLabel}
      </Button>
    </div>
  );
}

// ── Info Card ──────────────────────────────────────────────
function WhyCreditsCard() {
  return (
    <Card className="flex items-center gap-4 p-4">
      <div className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-primary/10 text-primary">
        <Lightbulb className="h-5 w-5" />
      </div>
      <div className="min-w-0 flex-1">
        <h3 className="text-sm font-semibold">Why add credits?</h3>
        <p className="mt-0.5 text-xs text-muted-foreground">
          Credits help others trust your work and achievements.
        </p>
      </div>
      <ChevronRight className="h-5 w-5 shrink-0 text-muted-foreground" />
    </Card>
  );
}

// ── Credit Card ────────────────────────────────────────────
function CreditCardItem({
  credit,
  onEdit,
  onDelete,
}: {
  credit: Credit;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <Card className="p-4">
      <div className="flex items-start gap-3">
        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-orange/15 text-orange">
          <Briefcase className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h4 className="truncate text-sm font-semibold">{credit.project_name}</h4>
              <p className="mt-0.5 text-xs text-muted-foreground">{credit.role_played}</p>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="shrink-0 rounded-md p-1 text-muted-foreground hover:bg-accent">
                  <ChevronDown className="h-4 w-4" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={onEdit}>
                  <Pencil className="mr-2 h-4 w-4" /> Edit
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onDelete} className="text-destructive">
                  <Trash2 className="mr-2 h-4 w-4" /> Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            {credit.platform && (
              <Badge variant="secondary" className="text-[10px]">
                {credit.platform}
              </Badge>
            )}
            {credit.director && (
              <span className="text-[11px] text-muted-foreground">
                Dir. {credit.director}
              </span>
            )}
            {credit.year && (
              <span className="text-[11px] text-muted-foreground">
                {formatYear(credit.year)}
              </span>
            )}
          </div>
          {credit.description && (
            <p className="mt-2 line-clamp-2 text-xs text-muted-foreground">
              {credit.description}
            </p>
          )}
        </div>
      </div>
    </Card>
  );
}

// ── Testimonial Card ───────────────────────────────────────
function TestimonialCardItem({
  testimonial,
  onEdit,
  onDelete,
}: {
  testimonial: Testimonial;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <Card className="p-4">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <div className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-purple/20 text-purple">
              <User className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">{testimonial.author_name}</p>
              {testimonial.author_role && (
                <p className="truncate text-xs text-muted-foreground">
                  {testimonial.author_role}
                  {testimonial.author_company && ` at ${testimonial.author_company}`}
                </p>
              )}
            </div>
          </div>
          {testimonial.content && (
            <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-foreground/80">
              &ldquo;{testimonial.content}&rdquo;
            </p>
          )}
          <div className="mt-2 flex items-center gap-3">
            <StarRating rating={testimonial.rating} />
            {testimonial.is_video && (
              <Badge variant="secondary" className="text-[10px]">
                Video
              </Badge>
            )}
          </div>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="shrink-0 rounded-md p-1 text-muted-foreground hover:bg-accent">
              <ChevronDown className="h-4 w-4" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={onEdit}>
              <Pencil className="mr-2 h-4 w-4" /> Edit
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onDelete} className="text-destructive">
              <Trash2 className="mr-2 h-4 w-4" /> Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </Card>
  );
}

// ── Award Card ─────────────────────────────────────────────
function AwardCardItem({
  award,
  onEdit,
  onDelete,
}: {
  award: AwardType;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <Card className="p-4">
      <div className="flex items-start gap-3">
        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-gold/15 text-gold">
          <Award className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h4 className="truncate text-sm font-semibold">{award.title}</h4>
              <p className="mt-0.5 text-xs text-muted-foreground">{award.awarding_body}</p>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="shrink-0 rounded-md p-1 text-muted-foreground hover:bg-accent">
                  <ChevronDown className="h-4 w-4" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={onEdit}>
                  <Pencil className="mr-2 h-4 w-4" /> Edit
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onDelete} className="text-destructive">
                  <Trash2 className="mr-2 h-4 w-4" /> Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          {award.year && (
            <span className="mt-1 inline-block text-[11px] text-muted-foreground">
              {formatYear(award.year)}
            </span>
          )}
          {award.description && (
            <p className="mt-2 line-clamp-2 text-xs text-muted-foreground">
              {award.description}
            </p>
          )}
        </div>
      </div>
    </Card>
  );
}

// ── Credit Form Dialog ─────────────────────────────────────
function CreditFormDialog({
  open,
  onOpenChange,
  credit,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  credit?: Credit;
}) {
  const isEditing = !!credit;
  const createMutation = useCreateCredit();
  const updateMutation = useUpdateCredit();

  const form = useForm<CreditForm>({
    resolver: zodResolver(creditSchema),
    defaultValues: {
      project_name: credit?.project_name ?? "",
      role_played: credit?.role_played ?? "",
      platform: credit?.platform ?? "",
      director: credit?.director ?? "",
      year: credit?.year ?? (undefined as unknown as number),
      credit_url: credit?.credit_url ?? "",
      description: credit?.description ?? "",
    },
  });

  const isPending = createMutation.isPending || updateMutation.isPending;

  async function onSubmit(data: CreditForm) {
    try {
      const payload = {
        type: "credit" as const,
        ...data,
        year: data.year || undefined,
        credit_url: data.credit_url || undefined,
        platform: data.platform || undefined,
        director: data.director || undefined,
        description: data.description || undefined,
      };
      if (isEditing) {
        await updateMutation.mutateAsync({ id: credit._id, data: payload });
        toast.success("Credit updated");
      } else {
        await createMutation.mutateAsync(payload);
        toast.success("Credit added");
      }
      onOpenChange(false);
      form.reset();
    } catch {
      toast.error("Something went wrong");
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Credit" : "Add Credit"}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Update your credit details."
              : "Add a project credit to showcase your experience."}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="project_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Project Name *</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. The Last Dance" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="role_played"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Role *</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Lead Actor" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="platform"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Platform</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Netflix" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="director"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Director</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Jane Smith" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="year"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Year</FormLabel>
                  <FormControl>
                    <YearSelect
                      value={field.value}
                      onChange={field.onChange}
                      placeholder="Select year"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="credit_url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Credit URL</FormLabel>
                  <FormControl>
                    <Input placeholder="https://..." {...field} />
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
                    <Textarea
                      placeholder="Brief description of your role..."
                      className="resize-none"
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-end gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isPending}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? "Saving..." : isEditing ? "Save Changes" : "Add Credit"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

// ── Testimonial Form Dialog ────────────────────────────────
function TestimonialFormDialog({
  open,
  onOpenChange,
  testimonial,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  testimonial?: Testimonial;
}) {
  const isEditing = !!testimonial;
  const createMutation = useCreateTestimonial();
  const updateMutation = useUpdateTestimonial();

  const form = useForm<TestimonialForm>({
    resolver: zodResolver(testimonialSchema),
    defaultValues: {
      author_name: testimonial?.author_name ?? "",
      content: testimonial?.content ?? "",
      author_role: testimonial?.author_role ?? "",
      author_company: testimonial?.author_company ?? "",
      rating: testimonial?.rating ?? (undefined as unknown as number),
    },
  });

  const isPending = createMutation.isPending || updateMutation.isPending;

  async function onSubmit(data: TestimonialForm) {
    try {
      const payload = {
        type: "testimonial" as const,
        ...data,
        author_role: data.author_role || undefined,
        author_company: data.author_company || undefined,
        rating: data.rating || undefined,
      };
      if (isEditing) {
        await updateMutation.mutateAsync({ id: testimonial._id, data: payload });
        toast.success("Testimonial updated");
      } else {
        await createMutation.mutateAsync(payload);
        toast.success("Testimonial added");
      }
      onOpenChange(false);
      form.reset();
    } catch {
      toast.error("Something went wrong");
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Testimonial" : "Add Testimonial"}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Update this testimonial."
              : "Add a testimonial from a colleague or client."}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="author_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Author Name *</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. John Doe" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="author_role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Role</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Director" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="author_company"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Company</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Studio Inc" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Testimonial *</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Write the testimonial content..."
                      className="resize-none"
                      rows={4}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="rating"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Rating (1-5)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={1}
                      max={5}
                      placeholder="1-5"
                      {...field}
                      value={field.value ?? ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-end gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isPending}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending
                  ? "Saving..."
                  : isEditing
                    ? "Save Changes"
                    : "Add Testimonial"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

// ── Award Form Dialog ──────────────────────────────────────
function AwardFormDialog({
  open,
  onOpenChange,
  award,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  award?: AwardType;
}) {
  const isEditing = !!award;
  const createMutation = useCreateAward();
  const updateMutation = useUpdateAward();

  const form = useForm<AwardForm>({
    resolver: zodResolver(awardSchema),
    defaultValues: {
      title: award?.title ?? "",
      awarding_body: award?.awarding_body ?? "",
      year: award?.year ?? (undefined as unknown as number),
      description: award?.description ?? "",
    },
  });

  const isPending = createMutation.isPending || updateMutation.isPending;

  async function onSubmit(data: AwardForm) {
    try {
      const payload = {
        type: "award" as const,
        ...data,
        year: data.year || undefined,
        description: data.description || undefined,
      };
      if (isEditing) {
        await updateMutation.mutateAsync({ id: award._id, data: payload });
        toast.success("Award updated");
      } else {
        await createMutation.mutateAsync(payload);
        toast.success("Award added");
      }
      onOpenChange(false);
      form.reset();
    } catch {
      toast.error("Something went wrong");
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Award" : "Add Award"}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Update this award."
              : "Add an award or recognition you've received."}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Award Title *</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Best Actor" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="awarding_body"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Awarding Body *</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Film Federation of India" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="year"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Year</FormLabel>
                  <FormControl>
                    <YearSelect
                      value={field.value}
                      onChange={field.onChange}
                      placeholder="Select year"
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
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Brief description of the award..."
                      className="resize-none"
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-end gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isPending}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? "Saving..." : isEditing ? "Save Changes" : "Add Award"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

// ── Delete Confirmation Dialog ─────────────────────────────
function DeleteConfirmDialog({
  open,
  onOpenChange,
  onConfirm,
  title,
  description,
  isPending,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  title: string;
  description: string;
  isPending: boolean;
}) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={isPending}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isPending ? "Deleting..." : "Delete"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

// ── Main ExperiencePage ────────────────────────────────────
export function ExperiencePage() {
  const [tab, setTab] = useState("credits");

  // Dialog states
  const [creditDialogOpen, setCreditDialogOpen] = useState(false);
  const [testimonialDialogOpen, setTestimonialDialogOpen] = useState(false);
  const [awardDialogOpen, setAwardDialogOpen] = useState(false);

  // Edit states
  const [editingCredit, setEditingCredit] = useState<Credit | undefined>();
  const [editingTestimonial, setEditingTestimonial] = useState<Testimonial | undefined>();
  const [editingAward, setEditingAward] = useState<AwardType | undefined>();

  // Delete states
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteType, setDeleteType] = useState<"credit" | "testimonial" | "award" | null>(null);

  // Queries
  const creditsQuery = useMyCredits();
  const testimonialsQuery = useMyTestimonials();
  const awardsQuery = useMyAwards();

  // Delete mutations
  const deleteCreditMutation = useDeleteCredit();
  const deleteTestimonialMutation = useDeleteTestimonial();
  const deleteAwardMutation = useDeleteAward();

  const isDeleting =
    deleteCreditMutation.isPending ||
    deleteTestimonialMutation.isPending ||
    deleteAwardMutation.isPending;

  function handleEditCredit(credit: Credit) {
    setEditingCredit(credit);
    setCreditDialogOpen(true);
  }

  function handleEditTestimonial(testimonial: Testimonial) {
    setEditingTestimonial(testimonial);
    setTestimonialDialogOpen(true);
  }

  function handleEditAward(award: AwardType) {
    setEditingAward(award);
    setAwardDialogOpen(true);
  }

  function handleDeleteClick(id: string, type: "credit" | "testimonial" | "award") {
    setDeletingId(id);
    setDeleteType(type);
  }

  async function confirmDelete() {
    if (!deletingId || !deleteType) return;
    try {
      if (deleteType === "credit") {
        await deleteCreditMutation.mutateAsync(deletingId);
        toast.success("Credit deleted");
      } else if (deleteType === "testimonial") {
        await deleteTestimonialMutation.mutateAsync(deletingId);
        toast.success("Testimonial deleted");
      } else {
        await deleteAwardMutation.mutateAsync(deletingId);
        toast.success("Award deleted");
      }
    } catch {
      toast.error("Failed to delete");
    } finally {
      setDeletingId(null);
      setDeleteType(null);
    }
  }

  function handleAddClick() {
    if (tab === "credits") {
      setEditingCredit(undefined);
      setCreditDialogOpen(true);
    } else if (tab === "testimonials") {
      setEditingTestimonial(undefined);
      setTestimonialDialogOpen(true);
    } else {
      setEditingAward(undefined);
      setAwardDialogOpen(true);
    }
  }

  const credits = creditsQuery.data ?? [];
  const testimonials = testimonialsQuery.data ?? [];
  const awards = awardsQuery.data ?? [];

  return (
    <div className="mx-auto w-full max-w-4xl overflow-x-hidden">
      <div className="space-y-6 px-4 pb-40 pt-6 lg:px-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Experience &amp; Recognition</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage your credits, testimonials, and awards.
          </p>
        </div>

        {/* Tabs */}
        <Tabs value={tab} onValueChange={setTab}>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <TabsList className="w-full flex-wrap sm:w-fit">
              <TabsTrigger value="credits" className="gap-2">
                <Briefcase className="h-4 w-4" />
                <span className="hidden sm:inline">Credits</span>
                {credits.length > 0 && (
                  <Badge variant="secondary" className="ml-1 hidden h-5 min-w-5 px-1 text-[10px] sm:inline-flex">
                    {credits.length}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="testimonials" className="gap-2">
                <GraduationCap className="h-4 w-4" />
                <span className="hidden sm:inline">Testimonials</span>
                {testimonials.length > 0 && (
                  <Badge variant="secondary" className="ml-1 hidden h-5 min-w-5 px-1 text-[10px] sm:inline-flex">
                    {testimonials.length}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="awards" className="gap-2">
                <Award className="h-4 w-4" />
                <span className="hidden sm:inline">Awards</span>
                {awards.length > 0 && (
                  <Badge variant="secondary" className="ml-1 hidden h-5 min-w-5 px-1 text-[10px] sm:inline-flex">
                    {awards.length}
                  </Badge>
                )}
              </TabsTrigger>
            </TabsList>
            <Button onClick={handleAddClick} className="w-full sm:w-auto">
              <Plus className="mr-2 h-4 w-4" />
              <span className="sm:hidden">Add</span>
              <span className="hidden sm:inline">
                Add{" "}
                {tab === "credits"
                  ? "Credit"
                  : tab === "testimonials"
                    ? "Testimonial"
                    : "Award"}
              </span>
            </Button>
          </div>

          {/* Credits Tab */}
          <TabsContent value="credits" className="mt-4 space-y-4">
            {creditsQuery.isLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <CreditSkeleton key={i} />
                ))}
              </div>
            ) : credits.length === 0 ? (
              <EmptyState
                icon={Briefcase}
                title="No credits added yet"
                description="Add credits to highlight your professional experience and projects."
                ctaLabel="Add your first Credit"
                onCta={handleAddClick}
              />
            ) : (
              <div className="space-y-3">
                {credits.map((credit) => (
                  <CreditCardItem
                    key={credit._id}
                    credit={credit}
                    onEdit={() => handleEditCredit(credit)}
                    onDelete={() => handleDeleteClick(credit._id, "credit")}
                  />
                ))}
              </div>
            )}
            <WhyCreditsCard />
          </TabsContent>

          {/* Testimonials Tab */}
          <TabsContent value="testimonials" className="mt-4 space-y-4">
            {testimonialsQuery.isLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <TestimonialSkeleton key={i} />
                ))}
              </div>
            ) : testimonials.length === 0 ? (
              <EmptyState
                icon={GraduationCap}
                title="No testimonials added yet"
                description="Add testimonials from colleagues and clients to build trust."
                ctaLabel="Add your first Testimonial"
                onCta={handleAddClick}
              />
            ) : (
              <div className="space-y-3">
                {testimonials.map((testimonial) => (
                  <TestimonialCardItem
                    key={testimonial._id}
                    testimonial={testimonial}
                    onEdit={() => handleEditTestimonial(testimonial)}
                    onDelete={() =>
                      handleDeleteClick(testimonial._id, "testimonial")
                    }
                  />
                ))}
              </div>
            )}
          </TabsContent>

          {/* Awards Tab */}
          <TabsContent value="awards" className="mt-4 space-y-4">
            {awardsQuery.isLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <AwardSkeleton key={i} />
                ))}
              </div>
            ) : awards.length === 0 ? (
              <EmptyState
                icon={Award}
                title="No awards added yet"
                description="Add awards and recognitions to showcase your achievements."
                ctaLabel="Add your first Award"
                onCta={handleAddClick}
              />
            ) : (
              <div className="space-y-3">
                {awards.map((award) => (
                  <AwardCardItem
                    key={award._id}
                    award={award}
                    onEdit={() => handleEditAward(award)}
                    onDelete={() => handleDeleteClick(award._id, "award")}
                  />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Credit Form Dialog */}
      <CreditFormDialog
        open={creditDialogOpen}
        onOpenChange={(open) => {
          setCreditDialogOpen(open);
          if (!open) setEditingCredit(undefined);
        }}
        credit={editingCredit}
      />

      {/* Testimonial Form Dialog */}
      <TestimonialFormDialog
        open={testimonialDialogOpen}
        onOpenChange={(open) => {
          setTestimonialDialogOpen(open);
          if (!open) setEditingTestimonial(undefined);
        }}
        testimonial={editingTestimonial}
      />

      {/* Award Form Dialog */}
      <AwardFormDialog
        open={awardDialogOpen}
        onOpenChange={(open) => {
          setAwardDialogOpen(open);
          if (!open) setEditingAward(undefined);
        }}
        award={editingAward}
      />

      {/* Delete Confirmation */}
      <DeleteConfirmDialog
        open={!!deletingId}
        onOpenChange={(open) => {
          if (!open) {
            setDeletingId(null);
            setDeleteType(null);
          }
        }}
        onConfirm={confirmDelete}
        title={`Delete ${deleteType ?? ""}`}
        description={`Are you sure you want to delete this ${deleteType ?? "item"}? This action cannot be undone.`}
        isPending={isDeleting}
      />
    </div>
  );
}
