"use client";

import { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Upload, Video, Loader2 } from "lucide-react";

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
import {
  useUploadPortfolioImage,
  useUploadPortfolioVideo,
} from "@/hooks/use-portfolio";
import { extractVideoThumbnail } from "@/lib/video-thumbnail";

const uploadSchema = z.object({
  title: z.string().max(100).optional(),
  caption: z.string().max(200).optional(),
  description: z.string().max(500).optional(),
  category: z.enum(["work", "personal", "intro"]).optional(),
});

type UploadForm = z.infer<typeof uploadSchema>;

export function UploadDialog({
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
