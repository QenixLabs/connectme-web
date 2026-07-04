"use client";

import { useState, useCallback, useRef } from "react";
import { Upload, Image as ImageIcon, Film, X, Loader2, AlertCircle, Sparkles, Link, Check, Camera } from "lucide-react";
import { cn } from "@/lib/utils";
import { talentApi } from "@/lib/api";
import { getApiErrorMessage } from "@/lib/formatters";
import { usePopup } from "@/hooks/use-popup";
import { useFeatureGuard } from "@/hooks/use-feature-guard";
import { PortfolioLinkInput } from "./portfolio-link-input";
import type { PortfolioItem } from "@/lib/validations/talent-profile.schema";

interface PortfolioUploaderProps {
  imagesUsed: number;
  videosUsed: number;
  maxImages: number;
  maxVideos: number;
  onUpload: () => void;
}

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
const MAX_VIDEO_SIZE = 50 * 1024 * 1024;

type Category = "work" | "personal" | "intro";
type UploadTab = "upload" | "link";

interface PendingFile {
  id: string;
  file: File;
  preview: string;
  caption: string;
  title: string;
  description: string;
  category: Category;
  uploading: boolean;
  error: string | null;
}

function formatSize(bytes: number): string {
  if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  if (bytes >= 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${bytes} B`;
}

function compressImage(file: File, maxWidth = 1920, quality = 0.85): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      let { width, height } = img;

      if (width > maxWidth) {
        height = (height * maxWidth) / width;
        width = maxWidth;
      }

      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("Canvas context not available"));
        return;
      }
      ctx.drawImage(img, 0, 0, width, height);
      canvas.toBlob(
        (blob) => {
          if (blob) resolve(blob);
          else reject(new Error("Compression failed"));
        },
        "image/jpeg",
        quality,
      );
    };
    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
}

const CATEGORIES: { key: Category; label: string }[] = [
  { key: "work", label: "Work" },
  { key: "personal", label: "Personal" },
  { key: "intro", label: "Intro" },
];

export function PortfolioUploader({
  imagesUsed,
  videosUsed,
  maxImages,
  maxVideos,
  onUpload,
}: PortfolioUploaderProps) {
  const [tab, setTab] = useState<UploadTab>("upload");
  const [isDragging, setIsDragging] = useState(false);
  const [fileError, setFileError] = useState<string | null>(null);
  const [pendingFiles, setPendingFiles] = useState<PendingFile[]>([]);
  const [uploadingAll, setUploadingAll] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const { show } = usePopup();
  const { handleFeatureError } = useFeatureGuard();

  const imagesInQueue = pendingFiles.filter((p) => p.file.type.startsWith("image/")).length;
  const videosInQueue = pendingFiles.filter((p) => p.file.type.startsWith("video/")).length;
  const canUploadImage = imagesUsed + imagesInQueue < maxImages;
  const canUploadVideo = videosUsed + videosInQueue < maxVideos;

  const validateFile = (file: File): string | null => {
    const isImage = file.type.startsWith("image/");
    const isVideo = file.type.startsWith("video/");

    if (!isImage && !isVideo) {
      return `Unsupported file type: ${file.name}`;
    }

    if (isImage && file.size > MAX_IMAGE_SIZE) {
      return `${file.name} is ${formatSize(file.size)}. Max image size is ${formatSize(MAX_IMAGE_SIZE)}.`;
    }

    if (isVideo && file.size > MAX_VIDEO_SIZE) {
      return `${file.name} is ${formatSize(file.size)}. Max video size is ${formatSize(MAX_VIDEO_SIZE)}.`;
    }

    if (isImage && !canUploadImage) {
      return "Image upload limit reached.";
    }

    if (isVideo && !canUploadVideo) {
      return "Video upload limit reached.";
    }

    return null;
  };

  const addPendingFile = (file: File) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const isImage = file.type.startsWith("image/");
    const preview = isImage ? URL.createObjectURL(file) : "";

    return {
      id,
      file,
      preview,
      caption: "",
      title: "",
      description: "",
      category: "work" as Category,
      uploading: false,
      error: null,
    };
  };

  const handleFilesAdded = useCallback(
    (files: FileList | null) => {
      if (!files || files.length === 0) return;
      setFileError(null);

      const newPending: PendingFile[] = [];

      for (const file of Array.from(files)) {
        const error = validateFile(file);
        if (error) {
          setFileError(error);
          show({ title: error, variant: "error", position: "bottom-center" });
          continue;
        }

        newPending.push(addPendingFile(file));
      }

      if (newPending.length > 0) {
        setPendingFiles((prev) => [...prev, ...newPending]);
      }
    },
    [canUploadImage, canUploadVideo, show],
  );

  const updatePendingFile = (id: string, update: Partial<Pick<PendingFile, "caption" | "title" | "description" | "category">>) => {
    setPendingFiles((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...update } : p)),
    );
  };

  const removePendingFile = (id: string) => {
    setPendingFiles((prev) => {
      const file = prev.find((p) => p.id === id);
      if (file?.preview) URL.revokeObjectURL(file.preview);
      return prev.filter((p) => p.id !== id);
    });
  };

  const uploadSingleFile = async (pendingId: string) => {
    const pending = pendingFiles.find((p) => p.id === pendingId);
    if (!pending) return;

    setPendingFiles((prev) =>
      prev.map((p) => (p.id === pendingId ? { ...p, uploading: true, error: null } : p)),
    );

    const isImage = pending.file.type.startsWith("image/");
    const dto = {
      caption: pending.caption.trim() || undefined,
      title: pending.title.trim() || undefined,
      description: pending.description.trim() || undefined,
      category: pending.category,
    };

    try {
      let uploadFile = pending.file;

      if (isImage && pending.file.size > 2 * 1024 * 1024) {
        const compressed = await compressImage(pending.file);
        uploadFile = new File([compressed], pending.file.name, { type: "image/jpeg" });
      }

      if (isImage) {
        await talentApi.uploadPortfolioImage(uploadFile, dto);
      } else {
        await talentApi.uploadPortfolioVideo(uploadFile, dto);
      }

      if (pending.preview) URL.revokeObjectURL(pending.preview);
      setPendingFiles((prev) => prev.filter((p) => p.id !== pendingId));
      show({
        title: `${isImage ? "Image" : "Video"} uploaded`,
        variant: "success",
        position: "bottom-center",
      });
      onUpload();
    } catch (err) {
      if (handleFeatureError(err)) {
        removePendingFile(pendingId);
        return;
      }
      const msg = getApiErrorMessage(err, "Upload failed");
      setPendingFiles((prev) =>
        prev.map((p) => (p.id === pendingId ? { ...p, uploading: false, error: msg } : p)),
      );
    }
  };

  const uploadAll = async () => {
    setUploadingAll(true);
    const pending = [...pendingFiles];
    for (const p of pending) {
      if (pendingFiles.find((pf) => pf.id === p.id)) {
        await uploadSingleFile(p.id);
      }
    }
    setUploadingAll(false);
  };

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      setFileError(null);
      handleFilesAdded(e.dataTransfer.files);
    },
    [handleFilesAdded],
  );

  const handleLinkItemAdded = useCallback(
    (_item: PortfolioItem) => {
      onUpload();
    },
    [onUpload],
  );

  const handleLinkError = useCallback(
    (msg: string) => {
      setFileError(msg);
      show({ title: msg, variant: "error", position: "bottom-center" });
    },
    [show],
  );

  const outOfSlots = !canUploadImage && !canUploadVideo;

  return (
    <div className="space-y-2.5">
      {/* Tab toggle */}
      <div className="flex rounded-xl bg-muted p-1 gap-1">
        <button
          type="button"
          onClick={() => { setTab("upload"); setFileError(null); }}
          className={cn(
            "flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-medium rounded-lg transition-colors",
            tab === "upload"
              ? "bg-card text-text-primary shadow-sm"
              : "text-text-muted hover:text-text-secondary",
          )}
        >
          <Upload className="h-3.5 w-3.5" />
          Upload
        </button>
        <button
          type="button"
          onClick={() => { setTab("link"); setFileError(null); }}
          className={cn(
            "flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-medium rounded-lg transition-colors",
            tab === "link"
              ? "bg-card text-text-primary shadow-sm"
              : "text-text-muted hover:text-text-secondary",
          )}
        >
          <Link className="h-3.5 w-3.5" />
          Link
        </button>
      </div>

      {fileError && (
        <div className="flex items-start gap-2 rounded-lg border border-error-border bg-error-surface px-3 py-2.5 text-sm text-error">
          <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" strokeWidth={1.5} />
          <span className="flex-1">{fileError}</span>
          <button
            onClick={() => setFileError(null)}
            className="text-error/70 hover:text-error"
          >
            <X className="w-4 h-4" strokeWidth={1.5} />
          </button>
        </div>
      )}

      {tab === "link" ? (
        <PortfolioLinkInput onItemAdded={handleLinkItemAdded} onError={handleLinkError} />
      ) : (
        <>
          {/* Drop zone */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => !outOfSlots && inputRef.current?.click()}
            className={cn(
              "relative rounded-2xl border-2 border-dashed p-5 flex flex-col items-center justify-center gap-2.5 transition-all duration-200 cursor-pointer",
              isDragging
                ? "border-brand bg-brand/5 shadow-[0_0_0_4px_var(--color-brand-light)]"
                : "border-border hover:border-text-muted hover:bg-cream-soft",
            )}
          >
            <div
              className={cn(
                "flex h-12 w-12 items-center justify-center rounded-xl transition-colors",
                isDragging ? "bg-brand/10" : "bg-cream-soft",
              )}
            >
              {isDragging ? (
                <Sparkles className="w-5 h-5 text-brand" strokeWidth={1.5} />
              ) : (
                <Upload className="w-5 h-5 text-text-muted" strokeWidth={1.5} />
              )}
            </div>

            <div className="text-center">
              <p className="text-sm text-text-primary font-medium">
                {isDragging ? "Drop to add" : "Drag & drop or click to add files"}
              </p>
              <p className="text-xs text-text-muted mt-0.5">
                Images: JPG, PNG, WEBP (max {formatSize(MAX_IMAGE_SIZE)}) · Videos: MP4, MOV, WEBM (max {formatSize(MAX_VIDEO_SIZE)})
              </p>
            </div>

            <div className="flex items-center gap-3 text-[11px] text-text-muted mt-0.5">
              <span className="inline-flex items-center gap-1">
                <ImageIcon className="w-3 h-3" strokeWidth={1.5} />
                {imagesUsed}{imagesInQueue > 0 ? `+${imagesInQueue}` : ""}/{maxImages}
              </span>
              <span className="inline-flex items-center gap-1">
                <Film className="w-3 h-3" strokeWidth={1.5} />
                {videosUsed}{videosInQueue > 0 ? `+${videosInQueue}` : ""}/{maxVideos}
              </span>
            </div>

            <input
              ref={inputRef}
              type="file"
              multiple
              accept="image/jpeg,image/png,image/webp,video/mp4,video/quicktime,video/webm"
              onChange={(e) => {
                setFileError(null);
                handleFilesAdded(e.target.files);
                if (inputRef.current) inputRef.current.value = "";
              }}
              className="hidden"
            />
          </div>

          {/* Pending files */}
          {pendingFiles.length > 0 && (
            <div className="space-y-3">
              {pendingFiles.length > 1 && (
                <div className="flex items-center justify-between px-1">
                  <p className="text-[11px] font-medium text-text-muted uppercase tracking-wider">
                    {pendingFiles.length} file{pendingFiles.length !== 1 ? "s" : ""} pending
                  </p>
                  <button
                    type="button"
                    onClick={uploadAll}
                    disabled={uploadingAll || pendingFiles.some((p) => p.uploading)}
                    className="inline-flex items-center gap-1.5 text-[11px] font-medium text-gold hover:text-gold/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {uploadingAll ? (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    ) : (
                      <Upload className="w-3 h-3" />
                    )}
                    Upload all
                  </button>
                </div>
              )}

              {pendingFiles.map((pending) => {
                const isImage = pending.file.type.startsWith("image/");

                return (
                  <div
                    key={pending.id}
                    className={cn(
                      "flex gap-3 rounded-2xl border bg-card p-3",
                      pending.error
                        ? "border-error-border bg-error-surface/50"
                        : "border-border",
                    )}
                  >
                    {/* Thumbnail */}
                    <div className="relative h-20 w-20 flex-shrink-0 rounded-xl overflow-hidden bg-muted border border-border/60">
                      {isImage && pending.preview ? (
                        <img
                          src={pending.preview}
                          alt={pending.file.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="h-full w-full flex flex-col items-center justify-center gap-1 text-text-muted">
                          {isImage ? (
                            <Camera className="w-5 h-5" strokeWidth={1.5} />
                          ) : (
                            <Film className="w-5 h-5" strokeWidth={1.5} />
                          )}
                          <span className="text-[9px] uppercase tracking-wider font-medium">
                            {isImage ? "Image" : "Video"}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Details */}
                    <div className="flex-1 min-w-0 space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-medium text-text-primary truncate">
                            {pending.file.name}
                          </p>
                          <p className="text-[10px] text-text-muted">
                            {formatSize(pending.file.size)}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => removePendingFile(pending.id)}
                          className="flex-shrink-0 p-1 rounded-lg hover:bg-muted text-text-muted hover:text-error transition-colors"
                        >
                          <X className="w-3.5 h-3.5" strokeWidth={1.5} />
                        </button>
                      </div>

                      {/* Title input */}
                      <input
                        type="text"
                        value={pending.title}
                        onChange={(e) => updatePendingFile(pending.id, { title: e.target.value })}
                        placeholder="Add a title..."
                        maxLength={120}
                        className="w-full text-xs bg-transparent border-0 border-b border-border/60 px-0 py-1 focus:outline-none focus:border-gold text-text-primary placeholder:text-text-muted transition-colors"
                      />

                      {/* Description input */}
                      <input
                        type="text"
                        value={pending.description}
                        onChange={(e) => updatePendingFile(pending.id, { description: e.target.value })}
                        placeholder="Add a short description..."
                        maxLength={200}
                        className="w-full text-xs bg-transparent border-0 border-b border-border/60 px-0 py-1 focus:outline-none focus:border-gold text-text-primary placeholder:text-text-muted transition-colors"
                      />

                      {/* Caption input */}
                      <input
                        type="text"
                        value={pending.caption}
                        onChange={(e) => updatePendingFile(pending.id, { caption: e.target.value })}
                        placeholder="Alt text / caption..."
                        maxLength={200}
                        className="w-full text-xs bg-transparent border-0 border-b border-border/60 px-0 py-1 focus:outline-none focus:border-gold text-text-primary placeholder:text-text-muted transition-colors"
                      />

                      {/* Category + Upload */}
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1">
                          {CATEGORIES.map((cat) => (
                            <button
                              key={cat.key}
                              type="button"
                              onClick={() => updatePendingFile(pending.id, { category: cat.key })}
                              className={cn(
                                "px-2.5 py-1 text-[10px] font-medium rounded-full capitalize transition-colors border",
                                pending.category === cat.key
                                  ? cat.key === "intro"
                                    ? "bg-brand text-white border-brand"
                                    : "bg-foreground text-background border-foreground"
                                  : "bg-card text-text-muted border-border hover:bg-muted",
                              )}
                            >
                              {cat.label}
                            </button>
                          ))}
                        </div>

                        <button
                          type="button"
                          onClick={() => uploadSingleFile(pending.id)}
                          disabled={pending.uploading}
                          className={cn(
                            "inline-flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-medium rounded-lg transition-all",
                            pending.uploading
                              ? "bg-muted text-text-muted cursor-not-allowed"
                              : "bg-gold text-white hover:bg-gold/90 active:scale-[0.97]",
                          )}
                        >
                          {pending.uploading ? (
                            <>
                              <Loader2 className="w-3 h-3 animate-spin" />
                              Uploading
                            </>
                          ) : (
                            <>
                              <Check className="w-3 h-3" />
                              Upload
                            </>
                          )}
                        </button>
                      </div>

                      {pending.error && (
                        <p className="text-[10px] text-error">{pending.error}</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
}
