"use client";

import { useState, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ImageIcon, Play, Youtube, X, Plus, Loader2, Upload } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import type { PortfolioItemType } from "@/lib/types/portfolio";
import {
  getYouTubeThumbnail,
  getYouTubeVideoId,
} from "@/hooks/use-portfolio";

const formSchema = z
  .object({
    type: z.enum(["image", "video", "youtube"]),
    title: z.string().min(1, "Title is required").max(120, "Too long"),
    description: z.string().max(500, "Too long").optional(),
    url: z.string().optional(),
    isFeatured: z.boolean(),
  })
  .refine(
    (data) => {
      if (data.type !== "youtube") return true;
      return !!getYouTubeVideoId(data.url || "");
    },
    {
      message: "Enter a valid YouTube URL",
      path: ["url"],
    },
  );

type FormValues = z.infer<typeof formSchema>;

interface AddPortfolioModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: {
    type: PortfolioItemType;
    title: string;
    description?: string;
    file?: File;
    url?: string;
    isFeatured: boolean;
  }) => void;
  isSubmitting?: boolean;
}

const typeOptions: {
  type: Exclude<PortfolioItemType, "instagram">;
  icon: React.ReactNode;
  label: string;
  description: string;
}[] = [
  {
    type: "image",
    icon: <ImageIcon className="size-6" />,
    label: "Image",
    description: "Upload a photo or still",
  },
  {
    type: "video",
    icon: <Play className="size-6 fill-current" />,
    label: "Video",
    description: "Upload a reel or clip",
  },
  {
    type: "youtube",
    icon: <Youtube className="size-6" />,
    label: "YouTube",
    description: "Import from YouTube",
  },
];

export function AddPortfolioModal({
  open,
  onClose,
  onSubmit,
  isSubmitting,
}: AddPortfolioModalProps) {
  const [step, setStep] = useState<"type" | "form">("type");
  const [selectedType, setSelectedType] = useState<PortfolioItemType | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [skills, setSkills] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState("");
  const [youtubePreview, setYoutubePreview] = useState<string | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      type: "image",
      title: "",
      description: "",
      url: "",
      isFeatured: false,
    },
  });

  const reset = useCallback(() => {
    setStep("type");
    setSelectedType(null);
    setFile(null);
    setFileError(null);
    setSkills([]);
    setSkillInput("");
    setYoutubePreview(null);
    form.reset({
      type: "image",
      title: "",
      description: "",
      url: "",
      isFeatured: false,
    });
  }, [form]);

  const handleClose = useCallback(() => {
    reset();
    onClose();
  }, [reset, onClose]);

  const selectType = (type: Exclude<PortfolioItemType, "instagram">) => {
    setSelectedType(type);
    form.setValue("type", type);
    setStep("form");
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    setFileError(null);
    if (!f) {
      setFile(null);
      return;
    }
    if (selectedType === "image" && !f.type.startsWith("image/")) {
      setFileError("Please select an image file");
      return;
    }
    if (selectedType === "video" && !f.type.startsWith("video/")) {
      setFileError("Please select a video file");
      return;
    }
    setFile(f);
  };

  const handleImportYouTube = async () => {
    const url = form.getValues("url");
    if (!url || !getYouTubeVideoId(url)) return;
    const thumb = getYouTubeThumbnail(url);
    setYoutubePreview(thumb);
    try {
      const res = await fetch(
        `https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json`,
      );
      if (res.ok) {
        const data = (await res.json()) as { title?: string };
        if (data.title) form.setValue("title", data.title);
      }
    } catch {
      // ignore, user can edit title
    }
  };

  const addSkill = () => {
    const trimmed = skillInput.trim();
    if (!trimmed) return;
    if (!skills.includes(trimmed)) {
      setSkills((s) => [...s, trimmed]);
    }
    setSkillInput("");
  };

  const removeSkill = (skill: string) => {
    setSkills((s) => s.filter((x) => x !== skill));
  };

  const handleFormSubmit = (values: FormValues) => {
    if (values.type !== "youtube" && !file) {
      setFileError("File is required");
      return;
    }
    onSubmit({
      type: values.type,
      title: values.title,
      description: values.description,
      file: file ?? undefined,
      url: values.type === "youtube" ? values.url : undefined,
      isFeatured: values.isFeatured,
    });
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v) handleClose();
      }}
    >
      <DialogContent className="max-h-[95vh] max-w-lg overflow-y-auto border-border bg-card p-0">
        <DialogHeader className="px-5 pt-5 sm:px-6 sm:pt-6">
          <DialogTitle className="text-xl font-semibold">
            {step === "type"
              ? "Add Portfolio Work"
              : `Add ${
                  selectedType === "youtube"
                    ? "YouTube Video"
                    : selectedType === "image"
                      ? "Image"
                      : "Video"
                }`}
          </DialogTitle>
        </DialogHeader>

        {step === "type" ? (
          <div className="grid gap-3 px-5 pb-6 sm:px-6">
            <p className="text-sm text-muted-foreground">
              What are you adding?
            </p>
            {typeOptions.map((opt) => (
              <button
                key={opt.type}
                onClick={() => selectType(opt.type)}
                className="flex items-center gap-4 rounded-xl border border-border bg-surface p-4 text-left transition-colors hover:border-primary/40 hover:bg-primary/5"
              >
                <span className="grid size-11 place-items-center rounded-lg bg-primary/10 text-primary">
                  {opt.icon}
                </span>
                <div>
                  <span className="block font-medium text-foreground">
                    {opt.label}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {opt.description}
                  </span>
                </div>
              </button>
            ))}
          </div>
        ) : (
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleFormSubmit)}
              className="space-y-5 px-5 pb-6 sm:px-6"
            >
              {selectedType === "youtube" ? (
                <div className="space-y-2">
                  <Label htmlFor="youtube-url">YouTube URL</Label>
                  <div className="flex gap-2">
                    <FormField
                      control={form.control}
                      name="url"
                      render={({ field }) => (
                        <FormItem className="flex-1">
                          <FormControl>
                            <Input
                              id="youtube-url"
                              placeholder="https://youtube.com/..."
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleImportYouTube}
                      disabled={!getYouTubeVideoId(form.watch("url") || "")}
                    >
                      Import
                    </Button>
                  </div>
                  {youtubePreview && (
                    <div className="relative aspect-video overflow-hidden rounded-xl border border-border">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={youtubePreview}
                        alt="YouTube preview"
                        className="h-full w-full object-cover"
                      />
                      <span className="absolute inset-0 flex items-center justify-center">
                        <Youtube className="size-10 text-white drop-shadow-lg" />
                      </span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-2">
                  <Label>
                    Upload {selectedType === "image" ? "Image" : "Video"}
                  </Label>
                  <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border bg-surface p-8 transition-colors hover:border-primary/40 hover:bg-primary/5">
                    <Upload className="size-6 text-muted-foreground" />
                    <span className="text-sm font-medium text-foreground">
                      {file ? file.name : "Choose file"}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {selectedType === "image"
                        ? "JPG, PNG, WEBP up to 20MB"
                        : "MP4, MOV up to 200MB"}
                    </span>
                    <input
                      type="file"
                      accept={
                        selectedType === "image" ? "image/*" : "video/*"
                      }
                      className="sr-only"
                      onChange={handleFileChange}
                    />
                  </label>
                  {fileError && (
                    <p className="text-sm text-destructive">{fileError}</p>
                  )}
                </div>
              )}

              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title *</FormLabel>
                    <FormControl>
                      <Input placeholder="Title your work" {...field} />
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
                        placeholder="Describe your work..."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="space-y-2">
                <Label>Skills</Label>
                <div className="flex flex-wrap gap-2">
                  {skills.map((skill) => (
                    <span
                      key={skill}
                      className="inline-flex items-center gap-1 rounded-full border border-border bg-surface px-2.5 py-1 text-xs"
                    >
                      {skill}
                      <button
                        type="button"
                        onClick={() => removeSkill(skill)}
                        className="text-muted-foreground hover:text-foreground"
                      >
                        <X className="size-3" />
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input
                    value={skillInput}
                    onChange={(e) => setSkillInput(e.target.value)}
                    placeholder="Add a skill"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addSkill();
                      }
                    }}
                  />
                  <Button type="button" variant="outline" onClick={addSkill}>
                    <Plus className="size-4" />
                  </Button>
                </div>
              </div>

              <FormField
                control={form.control}
                name="isFeatured"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-xl border border-border bg-surface p-4">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Mark as Featured</FormLabel>
                      <p className="text-xs text-muted-foreground">
                        Show this at the top of your portfolio.
                      </p>
                    </div>
                  </FormItem>
                )}
              />

              <div className="flex gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => setStep("type")}
                >
                  Back
                </Button>
                <Button
                  type="submit"
                  className="flex-1 bg-primary text-primary-foreground shadow-button hover:bg-primary/90"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    "Publish"
                  )}
                </Button>
              </div>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  );
}
