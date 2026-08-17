"use client";

/* eslint-disable @next/next/no-img-element */

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
  Trash2,
  SlidersHorizontal,
  Star,
  Crown,
  Pencil,
  Loader2,
} from "lucide-react";
import { extractVideoThumbnail } from "@/lib/video-thumbnail";
import { useState, useRef, useCallback, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
  useUploadPortfolioImage,
  useUploadPortfolioVideo,
  useAddPortfolioLink,
  useUpdatePortfolioItem,
  useDeletePortfolioItem,
  getYouTubeVideoId,
} from "@/hooks/use-portfolio";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/components/ui/tabs";
import { useMyProfile } from "@/hooks/use-talent-profile";
import type { PortfolioApiResponse } from "@/lib/api/talent";

// ── Schemas ────────────────────────────────────────────────

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
    youtube: "link",
    instagram: "link",
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
    linkLabel: api.type === "youtube" || api.type === "instagram" ? (() => { try { return new URL(api.url).hostname.replace("www.", ""); } catch { return ""; } })() : undefined,
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
  onOpen,
}: {
  item: ReturnType<typeof mapApiToItem>;
  onToggleSelect: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onTogglePin: () => void;
  onOpen: () => void;
}) {
  return (
    <article className="overflow-hidden rounded-2xl border border-border bg-card shadow-card">
      <button
        onClick={onOpen}
        className="relative block aspect-[16/10] w-full overflow-hidden text-left"
      >
        <img
          src={item.image}
          alt={item.title}
          width={800}
          height={600}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background/70 to-transparent" />

        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleSelect();
          }}
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
      </button>

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

const uploadSchema = z.object({
  title: z.string().max(100).optional(),
  caption: z.string().max(200).optional(),
  description: z.string().max(500).optional(),
  category: z.enum(["work", "personal", "intro"]).optional(),
});

type UploadForm = z.infer<typeof uploadSchema>;

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
  const [thumbnail, setThumbnail] = useState<File | null>(null);
  const [thumbnailLoading, setThumbnailLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const uploadImage = useUploadPortfolioImage();
  const uploadVideo = useUploadPortfolioVideo();

  const form = useForm<UploadForm>({
    resolver: zodResolver(uploadSchema),
    defaultValues: { title: "", caption: "", description: "", category: "work" },
  });

  const isPending = uploadImage.isPending || uploadVideo.isPending;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const maxSize = type === "video" ? 50 * 1024 * 1024 : 10 * 1024 * 1024;
    if (f.size > maxSize) {
      toast.error(`File must be under ${type === "video" ? "50MB" : "10MB"}`);
      return;
    }
    setFile(f);
    setPreview(URL.createObjectURL(f));
    if (type === "video") {
      setThumbnailLoading(true);
      try {
        const thumb = await extractVideoThumbnail(f);
        setThumbnail(thumb);
      } catch {
        setThumbnail(null);
      } finally {
        setThumbnailLoading(false);
      }
    }
  };

  const onSubmit = async (data: UploadForm) => {
    if (!file) {
      toast.error("Please select a file");
      return;
    }
    try {
      const payload = {
        title: data.title || undefined,
        caption: data.caption || undefined,
        description: data.description || undefined,
        category: data.category || undefined,
      };
      if (type === "image") {
        await uploadImage.mutateAsync({ file, data: payload });
      } else {
        await uploadVideo.mutateAsync({
          file,
          thumbnail: thumbnail ?? undefined,
          data: payload,
        });
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
    setThumbnail(null);
    setThumbnailLoading(false);
    form.reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) handleClose(); }}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Upload {type === "image" ? "Image" : "Video"}</DialogTitle>
          <DialogDescription>
            {type === "image"
              ? "Add a photo to your portfolio. Max 10MB."
              : "Add a video to your portfolio. Max 50MB."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Short description" className="resize-none" rows={3} {...field} />
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
              <Button type="button" variant="outline" onClick={handleClose} disabled={isPending}>
                Cancel
              </Button>
              <Button type="submit" disabled={isPending || !file || thumbnailLoading}>
                {isPending ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Uploading...</>
                ) : thumbnailLoading ? (
                  "Generating thumbnail..."
                ) : (
                  "Upload"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

// ── Add Video Dialog ───────────────────────────────────────

const videoSchema = z.object({
  url: z.string().optional(),
  title: z.string().max(100).optional(),
  caption: z.string().max(200).optional(),
  description: z.string().max(500).optional(),
  category: z.enum(["work", "personal", "intro"]).optional(),
});

type VideoForm = z.infer<typeof videoSchema>;

function AddVideoDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [activeTab, setActiveTab] = useState<"file" | "youtube">("file");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [thumbnail, setThumbnail] = useState<File | null>(null);
  const [thumbnailLoading, setThumbnailLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const uploadVideo = useUploadPortfolioVideo();
  const addLink = useAddPortfolioLink();

  const form = useForm<VideoForm>({
    resolver: zodResolver(videoSchema),
    defaultValues: { url: "", title: "", caption: "", description: "", category: "work" },
  });

  const isPending = uploadVideo.isPending || addLink.isPending;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const maxSize = 50 * 1024 * 1024;
    if (f.size > maxSize) {
      toast.error("Video must be under 50MB");
      return;
    }
    setFile(f);
    setPreview(URL.createObjectURL(f));
    setThumbnailLoading(true);
    try {
      const thumb = await extractVideoThumbnail(f);
      setThumbnail(thumb);
    } catch {
      setThumbnail(null);
    } finally {
      setThumbnailLoading(false);
    }
  };

  const handleClose = () => {
    setFile(null);
    setPreview(null);
    setThumbnail(null);
    setThumbnailLoading(false);
    setActiveTab("file");
    form.reset();
    onOpenChange(false);
  };

  const onSubmit = async (data: VideoForm) => {
    const basePayload = {
      title: data.title || undefined,
      caption: data.caption || undefined,
      description: data.description || undefined,
      category: data.category || undefined,
    };

    try {
      if (activeTab === "file") {
        if (!file) {
          toast.error("Please select a video file");
          return;
        }
        await uploadVideo.mutateAsync({
          file,
          thumbnail: thumbnail ?? undefined,
          data: basePayload,
        });
      } else {
        const url = data.url?.trim();
        if (!url || !getYouTubeVideoId(url)) {
          toast.error("Enter a valid YouTube URL");
          return;
        }
        await addLink.mutateAsync({ url, ...basePayload });
      }
      toast.success("Video added");
      handleClose();
    } catch {
      toast.error("Failed to add video");
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) handleClose(); }}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Add Video</DialogTitle>
          <DialogDescription>
            Upload a video from your device or paste a YouTube link.
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "file" | "youtube")} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="file">Upload File</TabsTrigger>
            <TabsTrigger value="youtube">YouTube Link</TabsTrigger>
          </TabsList>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="mt-4 space-y-4">
              <TabsContent value="file" className="space-y-4">
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-border p-8 text-center transition-colors hover:border-teal/50 hover:bg-teal/5"
                >
                  {preview ? (
                    <div className="relative w-full">
                      <video src={preview} className="max-h-48 w-full rounded-lg" controls />
                      <p className="mt-2 text-sm text-muted-foreground">{file?.name}</p>
                    </div>
                  ) : (
                    <>
                      <Upload className="h-10 w-10 text-muted-foreground/50" />
                      <p className="mt-2 text-sm font-medium">Click to select video</p>
                      <p className="mt-1 text-xs text-muted-foreground">MP4, MOV, WebM up to 50MB</p>
                    </>
                  )}
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="video/*"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </TabsContent>

              <TabsContent value="youtube" className="space-y-4">
                <FormField
                  control={form.control}
                  name="url"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>YouTube URL *</FormLabel>
                      <FormControl>
                        <Input placeholder="https://youtube.com/watch?v=..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </TabsContent>

              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Give your video a title" {...field} />
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
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Short description" className="resize-none" rows={3} {...field} />
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
                <Button type="button" variant="outline" onClick={handleClose} disabled={isPending}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isPending || (activeTab === "file" && (!file || thumbnailLoading))}
                >
                  {isPending ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Adding...</>
                  ) : thumbnailLoading ? (
                    "Generating thumbnail..."
                  ) : (
                    "Add Video"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </Tabs>
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

// ── Lightbox ───────────────────────────────────────────────

function PortfolioLightbox({
  items,
  initialIndex,
  open,
  onOpenChange,
}: {
  items: ReturnType<typeof mapApiToItem>[];
  initialIndex: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [index, setIndex] = useState(initialIndex);
  const [direction, setDirection] = useState<"next" | "prev" | null>(null);
  const touchStartY = useRef<number | null>(null);

  const goNext = useCallback(() => {
    if (items.length <= 1) return;
    setDirection("next");
    setIndex((i) => (i + 1) % items.length);
  }, [items.length]);

  const goPrev = useCallback(() => {
    if (items.length <= 1) return;
    setDirection("prev");
    setIndex((i) => (i - 1 + items.length) % items.length);
  }, [items.length]);

  // Keyboard + wheel navigation
  useEffect(() => {
    if (!open) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onOpenChange(false);
      if (e.key === "ArrowDown" || e.key === "ArrowRight") goNext();
      if (e.key === "ArrowUp" || e.key === "ArrowLeft") goPrev();
    };

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      if (e.deltaY > 30) goNext();
      else if (e.deltaY < -30) goPrev();
    };

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("wheel", onWheel, { passive: false });
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("wheel", onWheel);
    };
  }, [open, goNext, goPrev, onOpenChange]);

  // Touch swipe navigation
  const onTouchStart = (e: React.TouchEvent) => {
    touchStartY.current = e.touches[0]?.clientY ?? null;
  };

  const onTouchEnd = (e: React.TouchEvent) => {
    const startY = touchStartY.current;
    if (startY == null) return;
    const endY = e.changedTouches[0]?.clientY ?? startY;
    const diff = startY - endY;
    if (diff > 50) goNext();
    else if (diff < -50) goPrev();
    touchStartY.current = null;
  };

  if (!open || items.length === 0) return null;

  const item = items[index];
  const youtubeId = item.kind === "link" ? getYouTubeVideoId(item.url) : null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-sm"
      onClick={() => onOpenChange(false)}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      {/* Close button */}
      <button
        onClick={() => onOpenChange(false)}
        className="absolute right-4 top-4 z-50 grid h-10 w-10 place-items-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
        aria-label="Close"
      >
        <X className="h-5 w-5" />
      </button>

      {/* Prev button */}
      {items.length > 1 && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            goPrev();
          }}
          className="absolute left-1/2 top-4 z-50 -translate-x-1/2 grid h-10 w-10 place-items-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
          aria-label="Previous"
        >
          <ChevronUp className="h-5 w-5" />
        </button>
      )}

      {/* Next button */}
      {items.length > 1 && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            goNext();
          }}
          className="absolute bottom-4 left-1/2 z-50 -translate-x-1/2 grid h-10 w-10 place-items-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
          aria-label="Next"
        >
          <ChevronDown className="h-5 w-5" />
        </button>
      )}

      {/* Media */}
      <div
        className="relative flex h-full w-full items-center justify-center p-4 md:p-16"
        onClick={(e) => e.stopPropagation()}
      >
        <div
          key={item.id}
          className={cn(
            "relative max-h-full w-full max-w-5xl transition-all duration-300 ease-out",
            direction === "next" && "animate-in slide-in-from-bottom-8 fade-in",
            direction === "prev" && "animate-in slide-in-from-top-8 fade-in",
          )}
          onAnimationEnd={() => setDirection(null)}
        >
          {item.kind === "image" && (
            <img
              src={item.url || item.image}
              alt={item.title}
              className="max-h-[80vh] w-full rounded-lg object-contain"
            />
          )}

          {item.kind === "video" && (
            <video
              src={item.url}
              controls
              autoPlay
              muted
              playsInline
              className="max-h-[80vh] w-full rounded-lg"
            />
          )}

          {item.kind === "link" && youtubeId && (
            <div className="aspect-video w-full overflow-hidden rounded-lg bg-black">
              <iframe
                src={`https://www.youtube.com/embed/${youtubeId}?autoplay=1&mute=1&rel=0`}
                title={item.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="h-full w-full"
              />
            </div>
          )}

          {item.kind === "link" && !youtubeId && (
            <div className="flex flex-col items-center justify-center gap-4 rounded-2xl bg-card p-10 text-center">
              <ExternalLink className="h-12 w-12 text-muted-foreground" />
              <p className="text-lg font-semibold">External link</p>
              <a
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 rounded-xl bg-gradient-teal px-5 py-2.5 text-sm font-semibold text-accent-foreground hover:opacity-90"
              >
                Open link <ExternalLink className="h-4 w-4" />
              </a>
            </div>
          )}
        </div>
      </div>

      {/* Info footer */}
      <div className="absolute bottom-0 left-0 right-0 z-50 bg-gradient-to-t from-black/80 to-transparent p-6 pt-12 text-white">
        <div className="mx-auto max-w-5xl">
          <h3 className="text-lg font-semibold">{item.title}</h3>
          {item.caption && (
            <p className="mt-1 text-sm text-white/70">{item.caption}</p>
          )}
          <p className="mt-2 text-xs text-white/50">
            {index + 1} / {items.length}
          </p>
        </div>
      </div>
    </div>
  );
}

// ── Main PortfolioPage ─────────────────────────────────────

export function PortfolioPage() {
  const [showBanner, setShowBanner] = useState(true);

  // Dialog states
  const [uploadType, setUploadType] = useState<"image" | "video" | null>(null);
  const [addVideoOpen, setAddVideoOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<PortfolioApiResponse | null>(null);
  const [deletingItem, setDeletingItem] = useState<PortfolioApiResponse | null>(null);
  const [bulkDeleting, setBulkDeleting] = useState(false);

  // Selection state
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Lightbox state
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxItems, setLightboxItems] = useState<ReturnType<typeof mapApiToItem>[]>([]);
  const [lightboxIndex, setLightboxIndex] = useState(0);

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

  const videoItems = items.filter((i) => i.kind === "video" || i.kind === "link");
  const pictureItems = items.filter((i) => i.kind === "image");

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
        if (!item.pinned) {
          const currentlyPinned = items.find((i) => i.pinned && i.id !== item.id);
          if (currentlyPinned) {
            await updateItem.mutateAsync({
              itemId: currentlyPinned.id,
              data: { is_pinned: false },
            });
          }
        }
        await updateItem.mutateAsync({
          itemId: item.id,
          data: { is_pinned: !item.pinned },
        });
        toast.success(item.pinned ? "Unpinned" : "Pinned");
      } catch {
        toast.error("Failed to update pin");
      }
    },
    [updateItem, items],
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
    if (toPin.length > 1) {
      toast.error("Only 1 item can be pinned");
      return;
    }
    try {
      await updateItem.mutateAsync({
        itemId: toPin[0].id,
        data: { is_pinned: true },
      });
      toast.success("Item pinned");
      clearSelection();
    } catch {
      toast.error("Failed to pin item");
    }
  }, [selectedItems, updateItem, clearSelection]);

  const openLightboxFromPictures = useCallback((itemId: string) => {
    const ordered = [...pictureItems, ...videoItems];
    setLightboxItems(ordered);
    setLightboxIndex(Math.max(0, ordered.findIndex((i) => i.id === itemId)));
    setLightboxOpen(true);
  }, [pictureItems, videoItems]);

  const openLightboxFromVideos = useCallback((itemId: string) => {
    const ordered = [...videoItems, ...pictureItems];
    setLightboxItems(ordered);
    setLightboxIndex(Math.max(0, ordered.findIndex((i) => i.id === itemId)));
    setLightboxOpen(true);
  }, [videoItems, pictureItems]);

  const closeLightbox = useCallback(() => {
    setLightboxOpen(false);
  }, []);

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
              <span className="text-foreground">{pinnedCount}/1</span>
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
              onClick={() => setAddVideoOpen(true)}
              className="flex flex-col items-center justify-center rounded-xl border border-border bg-card px-6 py-2.5 hover:bg-accent"
            >
              <span className="flex items-center gap-2 text-sm font-semibold">
                <Video className="h-4 w-4" /> Add Video
              </span>
              <span className="text-[11px] text-muted-foreground sm:hidden">
                Upload or YouTube link
              </span>
            </button>
          </div>

          <div className="no-scrollbar flex items-center gap-2 overflow-x-auto xl:justify-end">
            <button className="ml-auto flex shrink-0 items-center gap-2 rounded-xl border border-border bg-card px-4 py-2 text-sm xl:ml-0">
              <SlidersHorizontal className="h-4 w-4 xl:hidden" />
              Newest <ChevronDown className="h-4 w-4 text-muted-foreground" />
            </button>
            <button className="hidden shrink-0 rounded-xl border border-border bg-card p-2.5 hover:bg-accent xl:block">
              <SlidersHorizontal className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Videos section */}
        {portfolioQuery.isLoading ? (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-72 animate-pulse rounded-2xl border border-border bg-card" />
            ))}
          </div>
        ) : (
          <section className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="grid h-8 w-8 place-items-center rounded-full bg-purple/15">
                <Video className="h-4 w-4 text-purple" />
              </div>
              <h2 className="text-lg font-semibold">Videos</h2>
              <span className="rounded-full bg-card px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
                {videoItems.length}
              </span>
            </div>
            {videoItems.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border py-12 text-center">
                <Video className="mb-3 h-10 w-10 text-muted-foreground/50" />
                <p className="text-sm font-semibold">No videos yet</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Upload videos or add YouTube links to showcase your work.
                </p>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {videoItems.map((item) => (
                  <ItemCard
                    key={item.id}
                    item={item}
                    onToggleSelect={() => toggleSelect(item.id)}
                    onEdit={() => setEditingItem(item)}
                    onDelete={() => setDeletingItem(item)}
                    onTogglePin={() => handleTogglePin(item)}
                    onOpen={() => openLightboxFromVideos(item.id)}
                  />
                ))}
              </div>
            )}
          </section>
        )}

        {/* Pictures section */}
        {!portfolioQuery.isLoading && (
          <section className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="grid h-8 w-8 place-items-center rounded-full bg-green/15">
                <ImageIcon className="h-4 w-4 text-green" />
              </div>
              <h2 className="text-lg font-semibold">Pictures</h2>
              <span className="rounded-full bg-card px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
                {pictureItems.length}
              </span>
            </div>
            {pictureItems.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border py-12 text-center">
                <ImageIcon className="mb-3 h-10 w-10 text-muted-foreground/50" />
                <p className="text-sm font-semibold">No pictures yet</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Upload images to build your portfolio.
                </p>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {pictureItems.map((item) => (
                  <ItemCard
                    key={item.id}
                    item={item}
                    onToggleSelect={() => toggleSelect(item.id)}
                    onEdit={() => setEditingItem(item)}
                    onDelete={() => setDeletingItem(item)}
                    onTogglePin={() => handleTogglePin(item)}
                    onOpen={() => openLightboxFromPictures(item.id)}
                  />
                ))}
              </div>
            )}
          </section>
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

      {/* Lightbox */}
      <PortfolioLightbox
        key={lightboxOpen ? `open-${lightboxIndex}` : `closed-${lightboxIndex}`}
        items={lightboxItems}
        initialIndex={lightboxIndex}
        open={lightboxOpen}
        onOpenChange={closeLightbox}
      />

      {/* ── Dialogs ──────────────────────────────────── */}
      <UploadDialog
        open={uploadType !== null}
        onOpenChange={(o) => { if (!o) setUploadType(null); }}
        type={uploadType ?? "image"}
      />
      <AddVideoDialog open={addVideoOpen} onOpenChange={setAddVideoOpen} />
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
