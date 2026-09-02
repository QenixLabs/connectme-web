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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  useUploadPortfolioVideo,
  useAddPortfolioLink,
  getYouTubeVideoId,
} from "@/hooks/use-portfolio";
import { extractVideoThumbnail } from "@/lib/video-thumbnail";

const videoSchema = z.object({
  url: z.string().optional(),
  title: z.string().max(100).optional(),
  caption: z.string().max(200).optional(),
  description: z.string().max(500).optional(),
  category: z.enum(["work", "personal", "intro"]).optional(),
});

type VideoForm = z.infer<typeof videoSchema>;

export function AddVideoDialog({
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
    if (f.size > 50 * 1024 * 1024) {
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
