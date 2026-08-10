"use client";

import {
  Image as ImageIcon,
  ChevronDown,
  Eye,
  Pin,
  Layers,
  Video,
  Link2,
  Upload,
  Info,
  X,
  ChevronUp,
  Play,
  ExternalLink,
  Tag as TagIcon,
  Trash2,
  SlidersHorizontal,
  GripVertical,
  Star,
  LayoutGrid,
  Crown,
  Pencil,
  Check,
  Loader2,
} from "lucide-react";
import { useState, useRef, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
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
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { cn } from "@/lib/utils";
import {
  useMyPortfolio,
  usePortfolioStats,
  useUploadPortfolioImage,
  useUploadPortfolioVideo,
  useAddPortfolioLink,
  useUpdatePortfolioItem,
  useDeletePortfolioItem,
} from "@/hooks/use-portfolio";
import { useMyProfile } from "@/hooks/use-talent-profile";
import type { PortfolioApiResponse } from "@/lib/api/talent";

// ── Schemas ────────────────────────────────────────────────

const linkSchema = z.object({
  url: z.string().url("Must be a valid URL"),
  title: z.string().max(100).optional(),
  caption: z.string().max(200).optional(),
  description: z.string().max(500).optional(),
  category: z.enum(["work", "personal", "intro"]).optional(),
});

type LinkForm = z.infer<typeof linkSchema>;

const editSchema = z.object({
  title: z.string().max(100).optional(),
  caption: z.string().max(200).optional(),
  description: z.string().max(500).optional(),
  category: z.enum(["work", "personal", "intro"]).optional(),
});

type EditForm = z.infer<typeof editSchema>;

// ── Helpers ────────────────────────────────────────────────

function mapApiToItem(api: PortfolioApiResponse) {
  const kindMap: Record<string, "image" | "video" | "link"> = {
    image: "image",
    video: "video",
    link: "link",
  };
  const created = api.created_at
    ? new Date(api.created_at).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "";
  return {
    ...api,
    id: api.id,
    title: api.title || api.caption || "Untitled",
    date: created,
    views: api.view_count ?? 0,
    image: api.thumbnail_url || api.url,
    kind: kindMap[api.type] || "image",
    tag: (api.category?.toUpperCase() as "WORK" | "PERSONAL") || "WORK",
    pinned: api.is_pinned,
    linkLabel: api.type === "link" ? (() => { try { return new URL(api.url).hostname.replace("www.", ""); } catch { return ""; } })() : undefined,
    selected: false,
  };
}

const iconBg: Record<string, string> = {
  teal: "bg-teal/15 text-teal",
  green: "bg-green/20 text-green",
  purple: "bg-purple/25 text-purple",
  orange: "bg-orange/20 text-orange",
  blue: "bg-blue/20 text-blue",
};

// ── Stat Cards ─────────────────────────────────────────────

function StatCards({
  totalItems,
  imagesUsed,
  planMaxImages,
  videosUsed,
  planMaxVideos,
  linksCount,
  totalViews,
}: {
  totalItems: number;
  imagesUsed: number;
  planMaxImages: number;
  videosUsed: number;
  planMaxVideos: number;
  linksCount: number;
  totalViews: number;
}) {
  const stats = [
    { value: String(totalItems), label: "Items", sub: "All portfolio items", icon: Layers, color: "teal" },
    { value: String(imagesUsed), label: "Images", sub: `of ${planMaxImages} allowed`, icon: ImageIcon, color: "green" },
    { value: String(videosUsed), label: "Videos", sub: `of ${planMaxVideos} allowed`, icon: Video, color: "purple" },
    { value: String(linksCount), label: "Links", sub: "YouTube, Vimeo, etc.", icon: Link2, color: "orange" },
    { value: String(totalViews), label: "Views", sub: "Total portfolio views", icon: Eye, color: "blue" },
  ] as const;

  return (
    <div className="no-scrollbar -mx-4 flex snap-x gap-3 overflow-x-auto px-4 lg:mx-0 lg:grid lg:grid-cols-5 lg:px-0">
      {stats.map((s) => (
        <div
          key={s.label}
          className="flex min-w-[150px] snap-start items-center gap-3 rounded-2xl border border-border bg-card p-4 shadow-card"
        >
          <div className={cn("grid h-11 w-11 shrink-0 place-items-center rounded-full", iconBg[s.color])}>
            <s.icon className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <p className="text-xl font-bold leading-tight">{s.value}</p>
            <p className="truncate text-sm text-foreground/90">{s.label}</p>
            <p className="hidden truncate text-xs text-muted-foreground xl:block">{s.sub}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Usage Row ──────────────────────────────────────────────

function UsageRow({
  icon: Icon,
  label,
  current,
  total,
  percent,
  max,
  color,
  note,
}: {
  icon: React.ElementType;
  label: string;
  current: number;
  total: number;
  percent?: string;
  max?: boolean;
  color: string;
  note?: string;
}) {
  return (
    <div className="flex-1 px-4 py-4 lg:px-6">
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
        <div className="flex min-w-0 items-center gap-2">
          <Icon className={cn("h-5 w-5 shrink-0", color)} />
          <span className="truncate font-semibold">{label}</span>
        </div>
        <div className="flex shrink-0 items-center gap-3 text-sm">
          <span>
            <span className="font-bold">{current}</span>
            <span className="text-muted-foreground"> / {total}</span>
          </span>
          {max ? (
            <span className="rounded-md bg-teal px-2 py-0.5 text-[11px] font-bold text-accent-foreground">
              MAX
            </span>
          ) : (
            <span className="text-muted-foreground">{percent}</span>
          )}
        </div>
      </div>
      <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-surface-2">
        <div
          className="h-full rounded-full bg-gradient-teal"
          style={{ width: max ? "100%" : percent }}
        />
      </div>
      {note && (
        <p className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
          {note} <Info className="h-3.5 w-3.5" />
        </p>
      )}
    </div>
  );
}

// ── Item Card ──────────────────────────────────────────────

function ItemCard({
  item,
  onToggleSelect,
  onEdit,
  onDelete,
  onTogglePin,
}: {
  item: ReturnType<typeof mapApiToItem>;
  onToggleSelect: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onTogglePin: () => void;
}) {
  return (
    <article className="overflow-hidden rounded-2xl border border-border bg-card shadow-card">
      <div className="relative aspect-[16/10] w-full overflow-hidden">
        <img
          src={item.image}
          alt={item.title}
          width={800}
          height={600}
          loading="lazy"
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background/70 to-transparent" />

        <button
          onClick={onToggleSelect}
          className={cn(
            "absolute left-3 top-3 grid h-6 w-6 place-items-center rounded-md border-2 transition-colors",
            item.selected
              ? "border-teal bg-teal/25"
              : "border-foreground/50 bg-background/50",
          )}
          aria-label="Select item"
        >
          {item.selected && <div className="h-2.5 w-2.5 rounded-sm bg-teal" />}
        </button>

        <div className="absolute right-3 top-3 flex items-center gap-2">
          {item.pinned && (
            <span className="rounded-md bg-background/80 px-2 py-1 text-[10px] font-bold tracking-wide">
              PINNED
            </span>
          )}
          <span
            className={cn(
              "rounded-md px-2 py-1 text-[10px] font-bold tracking-wide text-foreground",
              item.tag === "WORK" ? "bg-orange/90" : "bg-purple/90",
            )}
          >
            {item.tag}
          </span>
        </div>

        {item.kind === "video" && (
          <>
            <div className="absolute inset-0 grid place-items-center">
              <span className="grid h-12 w-12 place-items-center rounded-full bg-background/60 backdrop-blur">
                <Play className="h-5 w-5 fill-foreground" />
              </span>
            </div>
          </>
        )}

        {item.kind === "link" && (
          <span className="absolute bottom-3 right-3 grid h-8 w-8 place-items-center rounded-lg bg-background/85">
            <ExternalLink className="h-4 w-4" />
          </span>
        )}

        {item.kind === "image" && (
          <span className="absolute bottom-3 left-3 grid h-8 w-8 place-items-center rounded-lg bg-background/85">
            <ImageIcon className="h-4 w-4" />
          </span>
        )}
      </div>

      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2 px-4 py-3">
        <div className="min-w-0">
          <h3 className="truncate text-sm font-semibold">{item.title}</h3>
          <p className="mt-1 flex items-center gap-2 truncate text-xs text-muted-foreground">
            {item.linkLabel && (
              <span className="font-medium text-foreground/80">{item.linkLabel} ·</span>
            )}
            {item.date}
            <span className="flex items-center gap-1">
              <Eye className="h-3.5 w-3.5" /> {item.views} views
            </span>
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          <button
            onClick={onTogglePin}
            className={cn(
              "rounded-md p-1.5 transition-colors",
              item.pinned ? "text-teal bg-teal/15" : "text-muted-foreground hover:bg-accent",
            )}
            title={item.pinned ? "Unpin" : "Pin"}
          >
            <Pin className="h-4 w-4" />
          </button>
          <button
            onClick={onEdit}
            className="rounded-md p-1.5 text-muted-foreground hover:bg-accent"
            title="Edit"
          >
            <Pencil className="h-4 w-4" />
          </button>
          <button
            onClick={onDelete}
            className="rounded-md p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
            title="Delete"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    </article>
  );
}

// ── Upload Dialog ──────────────────────────────────────────

function UploadDialog({
  open,
  onOpenChange,
  type,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  type: "image" | "video";
}) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const uploadImage = useUploadPortfolioImage();
  const uploadVideo = useUploadPortfolioVideo();

  const form = useForm<LinkForm>({
    resolver: zodResolver(
      z.object({
        url: z.string(),
        title: z.string().max(100).optional(),
        caption: z.string().max(200).optional(),
        description: z.string().max(500).optional(),
        category: z.enum(["work", "personal", "intro"]).optional(),
      }),
    ),
    defaultValues: { title: "", caption: "", description: "", category: "work" },
  });

  const isPending = uploadImage.isPending || uploadVideo.isPending;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const maxSize = type === "video" ? 50 * 1024 * 1024 : 10 * 1024 * 1024;
    if (f.size > maxSize) {
      toast.error(`File must be under ${type === "video" ? "50MB" : "10MB"}`);
      return;
    }
    setFile(f);
    setPreview(URL.createObjectURL(f));
  };

  const onSubmit = async () => {
    if (!file) {
      toast.error("Please select a file");
      return;
    }
    try {
      const data = {
        title: form.getValues("title") || undefined,
        caption: form.getValues("caption") || undefined,
        description: form.getValues("description") || undefined,
        category: form.getValues("category") || undefined,
      };
      if (type === "image") {
        await uploadImage.mutateAsync({ file, data });
      } else {
        await uploadVideo.mutateAsync({ file, data });
      }
      toast.success(`${type === "image" ? "Image" : "Video"} uploaded`);
      handleClose();
    } catch {
      toast.error("Upload failed");
    }
  };

  const handleClose = () => {
    setFile(null);
    setPreview(null);
    form.reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Upload {type === "image" ? "Image" : "Video"}</DialogTitle>
          <DialogDescription>
            {type === "image"
              ? "Add a photo to your portfolio. Max 10MB."
              : "Add a video to your portfolio. Max 50MB."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* File picker */}
          <div
            onClick={() => fileInputRef.current?.click()}
            className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-border p-8 text-center transition-colors hover:border-teal/50 hover:bg-teal/5"
          >
            {preview ? (
              <div className="relative w-full">
                {type === "image" ? (
                  <img src={preview} alt="Preview" className="max-h-48 w-full rounded-lg object-cover" />
                ) : (
                  <div className="flex h-32 items-center justify-center rounded-lg bg-muted">
                    <Video className="h-8 w-8 text-muted-foreground" />
                  </div>
                )}
                <p className="mt-2 text-sm text-muted-foreground">{file?.name}</p>
              </div>
            ) : (
              <>
                <Upload className="h-10 w-10 text-muted-foreground/50" />
                <p className="mt-2 text-sm font-medium">Click to select file</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {type === "image" ? "JPG, PNG, WebP" : "MP4, MOV, WebM"}
                </p>
              </>
            )}
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept={type === "image" ? "image/*" : "video/*"}
            className="hidden"
            onChange={handleFileChange}
          />

          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Title</FormLabel>
                <FormControl>
                  <Input placeholder="Give your work a title" {...field} />
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
                  <Input placeholder="Short caption" {...field} />
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
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isPending}>
            Cancel
          </Button>
          <Button onClick={onSubmit} disabled={isPending || !file}>
            {isPending ? (
              <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Uploading...</>
            ) : (
              "Upload"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ── Add Link Dialog ────────────────────────────────────────

function AddLinkDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const addLink = useAddPortfolioLink();

  const form = useForm<LinkForm>({
    resolver: zodResolver(linkSchema),
    defaultValues: { url: "", title: "", caption: "", description: "", category: "work" },
  });

  const onSubmit = async (data: LinkForm) => {
    try {
      await addLink.mutateAsync({
        url: data.url,
        title: data.title || undefined,
        caption: data.caption || undefined,
        description: data.description || undefined,
        category: data.category || undefined,
      });
      toast.success("Link added");
      form.reset();
      onOpenChange(false);
    } catch {
      toast.error("Failed to add link");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Add Link</DialogTitle>
          <DialogDescription>
            Add a YouTube or Instagram link to your portfolio.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>URL *</FormLabel>
                  <FormControl>
                    <Input placeholder="https://youtube.com/watch?v=..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Give your link a title" {...field} />
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
                    <Input placeholder="Short caption" {...field} />
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
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={addLink.isPending}>
                Cancel
              </Button>
              <Button type="submit" disabled={addLink.isPending}>
                {addLink.isPending ? "Adding..." : "Add Link"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

// ── Edit Item Dialog ───────────────────────────────────────

function EditItemDialog({
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

  // Reset form when item changes
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

// ── Delete Confirmation ────────────────────────────────────

function DeleteConfirmDialog({
  open,
  onOpenChange,
  onConfirm,
  title,
  isPending,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  title: string;
  isPending: boolean;
}) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete {title}?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. The item will be permanently removed from your portfolio.
          </AlertDialogDescription>
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

// ── Filters ────────────────────────────────────────────────

const filters = [
  { label: "All", icon: LayoutGrid },
  { label: "Images", icon: ImageIcon },
  { label: "Videos", icon: Video },
  { label: "Links", icon: Link2 },
];

// ── Main PortfolioPage ─────────────────────────────────────

export function PortfolioPage() {
  const [filter, setFilter] = useState("All");
  const [showBanner, setShowBanner] = useState(true);

  // Dialog states
  const [uploadType, setUploadType] = useState<"image" | "video" | null>(null);
  const [addLinkOpen, setAddLinkOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<PortfolioApiResponse | null>(null);
  const [deletingItem, setDeletingItem] = useState<PortfolioApiResponse | null>(null);
  const [bulkDeleting, setBulkDeleting] = useState(false);

  // Selection state
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Queries
  const portfolioQuery = useMyPortfolio();
  const profileQuery = useMyProfile();

  // Mutations
  const updateItem = useUpdatePortfolioItem();
  const deleteItem = useDeletePortfolioItem();

  const rawItems = portfolioQuery.data ?? [];
  const items = rawItems.map(mapApiToItem);
  const ml = profileQuery.data?.media_limits;
  const imagesUsed = ml?.images_used ?? 0;
  const planMaxImages = ml?.plan_max_images ?? 5;
  const videosUsed = ml?.videos_used ?? 0;
  const planMaxVideos = ml?.plan_max_videos ?? 1;
  const linksCount = items.filter((i) => i.kind === "link").length;
  const totalViews = items.reduce((sum, i) => sum + i.views, 0);
  const pinnedCount = items.filter((i) => i.pinned).length;

  const filteredItems =
    filter === "All" ? items : items.filter((i) => i.kind === filter.toLowerCase());

  const selectedItems = items.filter((i) => selectedIds.has(i.id));

  // ── Handlers ───────────────────────────────────────────

  const toggleSelect = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedIds(new Set());
  }, []);

  const handleTogglePin = useCallback(
    async (item: ReturnType<typeof mapApiToItem>) => {
      try {
        await updateItem.mutateAsync({
          itemId: item.id,
          data: { is_pinned: !item.pinned },
        });
        toast.success(item.pinned ? "Unpinned" : "Pinned");
      } catch {
        toast.error("Failed to update pin");
      }
    },
    [updateItem],
  );

  const handleDelete = useCallback(async () => {
    if (!deletingItem) return;
    try {
      await deleteItem.mutateAsync(deletingItem.id);
      toast.success("Deleted");
      setDeletingItem(null);
    } catch {
      toast.error("Failed to delete");
    }
  }, [deletingItem, deleteItem]);

  const handleBulkDelete = useCallback(async () => {
    setBulkDeleting(true);
    try {
      await Promise.all(
        selectedItems.map((item) => deleteItem.mutateAsync(item.id)),
      );
      toast.success(`${selectedItems.length} items deleted`);
      clearSelection();
    } catch {
      toast.error("Failed to delete some items");
    } finally {
      setBulkDeleting(false);
    }
  }, [selectedItems, deleteItem, clearSelection]);

  const handleBulkPin = useCallback(async () => {
    const toPin = selectedItems.filter((i) => !i.pinned);
    if (toPin.length === 0) {
      toast.info("Selected items already pinned");
      return;
    }
    try {
      await Promise.all(
        toPin.map((item) =>
          updateItem.mutateAsync({ itemId: item.id, data: { is_pinned: true } }),
        ),
      );
      toast.success(`${toPin.length} items pinned`);
      clearSelection();
    } catch {
      toast.error("Failed to pin some items");
    }
  }, [selectedItems, updateItem, clearSelection]);

  return (
    <div className="mx-auto w-full max-w-7xl">
      <div className="space-y-4 px-4 pb-40 pt-5 lg:px-6">
        {/* Title row */}
        <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_auto] md:items-start">
          <div className="min-w-0">
            <h1 className="text-3xl font-bold tracking-tight">My Portfolio</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Showcase your best work to get noticed by top recruiters &amp; clients.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setUploadType("image")}
              className="flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-medium hover:bg-accent"
            >
              <Eye className="h-4 w-4" /> Preview
              <span className="hidden sm:inline">Portfolio</span>
            </button>
            <button className="flex items-center gap-2 rounded-xl border border-teal/50 bg-card px-4 py-2.5 text-sm font-medium text-teal hover:bg-teal/10">
              <Pin className="h-4 w-4" /> Pinned{" "}
              <span className="text-foreground">{pinnedCount}/3</span>
            </button>
            <button className="hidden items-center gap-2 rounded-xl bg-gradient-teal px-5 py-2.5 text-sm font-semibold text-accent-foreground hover:opacity-90 lg:flex">
              <Crown className="h-4 w-4" /> Upgrade
            </button>
          </div>
        </div>

        <StatCards
          totalItems={items.length}
          imagesUsed={imagesUsed}
          planMaxImages={planMaxImages}
          videosUsed={videosUsed}
          planMaxVideos={planMaxVideos}
          linksCount={linksCount}
          totalViews={totalViews}
        />

        {/* Usage */}
        <div className="flex flex-col divide-y divide-border rounded-2xl border border-border bg-card lg:flex-row lg:divide-x lg:divide-y-0">
          <UsageRow
            icon={ImageIcon}
            label="Images"
            current={imagesUsed}
            total={planMaxImages}
            percent={`${Math.round((imagesUsed / planMaxImages) * 100)}%`}
            color="text-green"
            note={`${planMaxImages - imagesUsed} more uploads available`}
          />
          <UsageRow
            icon={Video}
            label="Videos"
            current={videosUsed}
            total={planMaxVideos}
            max={videosUsed >= planMaxVideos}
            color="text-purple"
          />
        </div>

        {/* Upgrade banner */}
        {showBanner && (
          <div className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 rounded-2xl border border-gold/40 bg-gold/[0.06] px-4 py-3">
            <Crown className="h-5 w-5 shrink-0 text-gold" />
            <p className="min-w-0 text-sm">
              <span className="font-semibold text-gold">Upgrade to Pro</span>{" "}
              <span className="text-muted-foreground">
                for more uploads, advanced analytics, custom branding and priority
                support.
              </span>
            </p>
            <div className="flex shrink-0 items-center gap-3">
              <button className="hidden items-center gap-1 text-sm font-medium text-teal sm:flex">
                Learn more <ChevronUp className="h-4 w-4" />
              </button>
              <button
                onClick={() => setShowBanner(false)}
                aria-label="Dismiss"
                className="rounded-md p-1 text-muted-foreground hover:bg-accent"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="grid gap-3 xl:grid-cols-[auto_minmax(0,1fr)] xl:items-center">
          <div className="grid grid-cols-2 gap-3 sm:flex">
            <button
              onClick={() => setUploadType("image")}
              className="flex items-center justify-center gap-2 rounded-xl bg-gradient-teal px-6 py-3 text-sm font-semibold text-accent-foreground hover:opacity-90"
            >
              <Upload className="h-4 w-4" /> Upload
            </button>
            <button
              onClick={() => setAddLinkOpen(true)}
              className="flex flex-col items-center justify-center rounded-xl border border-border bg-card px-6 py-2.5 hover:bg-accent"
            >
              <span className="flex items-center gap-2 text-sm font-semibold">
                <Link2 className="h-4 w-4" /> Add Link
              </span>
              <span className="text-[11px] text-muted-foreground sm:hidden">
                YouTube, Vimeo, etc.
              </span>
            </button>
          </div>

          <div className="no-scrollbar flex items-center gap-2 overflow-x-auto xl:justify-end">
            <span className="hidden shrink-0 text-sm text-muted-foreground xl:block">
              Filter:
            </span>
            {filters.map((f) => (
              <button
                key={f.label}
                onClick={() => setFilter(f.label)}
                className={cn(
                  "flex shrink-0 items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-colors xl:rounded-lg",
                  filter === f.label
                    ? "border-transparent bg-gradient-teal text-accent-foreground"
                    : "border-border bg-card text-foreground hover:bg-accent",
                )}
              >
                <f.icon className="h-4 w-4" /> {f.label}
              </button>
            ))}
            <span className="ml-2 hidden shrink-0 text-sm text-muted-foreground xl:block">
              Sort by:
            </span>
            <button className="ml-auto flex shrink-0 items-center gap-2 rounded-xl border border-border bg-card px-4 py-2 text-sm xl:ml-0">
              <SlidersHorizontal className="h-4 w-4 xl:hidden" />
              Newest <ChevronDown className="h-4 w-4 text-muted-foreground" />
            </button>
            <button className="hidden shrink-0 rounded-xl border border-border bg-card p-2.5 hover:bg-accent xl:block">
              <SlidersHorizontal className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Grid */}
        {portfolioQuery.isLoading ? (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-72 animate-pulse rounded-2xl border border-border bg-card" />
            ))}
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border py-16 text-center">
            <Layers className="mb-3 h-10 w-10 text-muted-foreground/50" />
            <p className="text-sm font-semibold">No portfolio items yet</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Upload images, videos, or add links to build your portfolio.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {filteredItems.map((item) => (
              <ItemCard
                key={item.id}
                item={item}
                onToggleSelect={() => toggleSelect(item.id)}
                onEdit={() => setEditingItem(item)}
                onDelete={() => setDeletingItem(item)}
                onTogglePin={() => handleTogglePin(item)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Selection bar */}
      {selectedIds.size > 0 && (
        <div className="fixed inset-x-0 bottom-[68px] z-40 mx-3 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 rounded-2xl border border-border bg-card p-3 shadow-card lg:bottom-4 lg:left-6 lg:right-6 lg:mx-0">
          <div className="flex min-w-0 items-center gap-3">
            <span className="grid h-5 w-5 shrink-0 place-items-center rounded-md bg-teal">
              <Star className="h-3 w-3 fill-accent-foreground text-accent-foreground" />
            </span>
            <span className="truncate text-sm font-medium">
              {selectedIds.size} items selected
            </span>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <button
              onClick={handleBulkPin}
              className="flex items-center gap-2 rounded-xl border border-border px-3 py-2 text-sm hover:bg-accent"
            >
              <Pin className="h-4 w-4" /> Pin
            </button>
            <button
              onClick={handleBulkDelete}
              disabled={bulkDeleting}
              className="flex items-center gap-2 rounded-xl border border-destructive/50 px-3 py-2 text-sm text-destructive hover:bg-destructive/10"
            >
              {bulkDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />} Delete
            </button>
            <button
              onClick={clearSelection}
              className="text-sm font-medium text-teal"
            >
              Clear selection
            </button>
          </div>
        </div>
      )}

      {/* ── Dialogs ──────────────────────────────────── */}
      <UploadDialog
        open={uploadType !== null}
        onOpenChange={(o) => { if (!o) setUploadType(null); }}
        type={uploadType ?? "image"}
      />
      <AddLinkDialog open={addLinkOpen} onOpenChange={setAddLinkOpen} />
      <EditItemDialog
        open={editingItem !== null}
        onOpenChange={(o) => { if (!o) setEditingItem(null); }}
        item={editingItem}
      />
      <DeleteConfirmDialog
        open={deletingItem !== null}
        onOpenChange={(o) => { if (!o) setDeletingItem(null); }}
        onConfirm={handleDelete}
        title={deletingItem?.title ?? ""}
        isPending={deleteItem.isPending}
      />
    </div>
  );
}
