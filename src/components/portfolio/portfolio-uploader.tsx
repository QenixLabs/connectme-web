"use client";

import { useState, useCallback, useRef } from "react";
import { Upload, Image as ImageIcon, Film, X, Loader2, AlertCircle, Sparkles, Link } from "lucide-react";
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

type UploadTab = "upload" | "link";

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
        quality
      );
    };
    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
}

export function PortfolioUploader({
  imagesUsed,
  videosUsed,
  maxImages,
  maxVideos,
  onUpload,
}: PortfolioUploaderProps) {
  const [tab, setTab] = useState<UploadTab>("upload");
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [fileError, setFileError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { show } = usePopup();
  const { handleFeatureError } = useFeatureGuard();

  const canUploadImage = imagesUsed < maxImages;
  const canUploadVideo = videosUsed < maxVideos;

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

  const handleFiles = useCallback(
    async (files: FileList | null) => {
      if (!files || files.length === 0) return;
      setFileError(null);

      for (const file of Array.from(files)) {
        if (uploading) break;

        const error = validateFile(file);
        if (error) {
          setFileError(error);
          show({ title: error, variant: "error", position: "bottom-center" });
          continue;
        }

        const isImage = file.type.startsWith("image/");
        setUploading(true);
        try {
          let uploadFile = file;

          if (isImage && file.size > 2 * 1024 * 1024) {
            const compressed = await compressImage(file);
            uploadFile = new File([compressed], file.name, { type: "image/jpeg" });
          }

          if (isImage) {
            await talentApi.uploadPortfolioImage(uploadFile, { category: "work" });
          } else {
            await talentApi.uploadPortfolioVideo(uploadFile, { category: "work" });
          }

          show({ title: `${isImage ? "Image" : "Video"} uploaded`, variant: "success", position: "bottom-center" });
          onUpload();
        } catch (err) {
          if (handleFeatureError(err)) {
            setFileError(null);
            return;
          }
          const msg = getApiErrorMessage(err, "Upload failed");
          setFileError(msg);
          show({ title: msg, variant: "error", position: "bottom-center" });
        } finally {
          setUploading(false);
        }
      }
    },
    [canUploadImage, canUploadVideo, onUpload, uploading, handleFeatureError, show]
  );

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
      handleFiles(e.dataTransfer.files);
    },
    [handleFiles]
  );

  const handleLinkItemAdded = useCallback((_item: PortfolioItem) => {
    onUpload();
  }, [onUpload]);

  const handleLinkError = useCallback((msg: string) => {
    setFileError(msg);
    show({ title: msg, variant: "error", position: "bottom-center" });
  }, [show]);

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
              : "text-text-muted hover:text-text-secondary"
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
              : "text-text-muted hover:text-text-secondary"
          )}
        >
          <Link className="h-3.5 w-3.5" />
          Link
        </button>
      </div>

      {fileError && tab === "link" && (
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

          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => !outOfSlots && inputRef.current?.click()}
            className={cn(
              "relative rounded-2xl border-2 border-dashed p-5 flex flex-col items-center justify-center gap-2.5 transition-all duration-200",
              outOfSlots
                ? "border-border bg-muted/50 cursor-default"
                : "cursor-pointer",
              isDragging
                ? "border-brand bg-brand/5 shadow-[0_0_0_4px_var(--color-brand-light)]"
                : fileError
                  ? "border-error-border bg-error-surface"
                  : "border-border hover:border-text-muted hover:bg-cream-soft"
            )}
          >
            <div
              className={cn(
                "flex h-12 w-12 items-center justify-center rounded-xl transition-colors",
                uploading
                  ? "bg-brand/10"
                  : isDragging
                    ? "bg-brand/10"
                    : "bg-cream-soft"
              )}
            >
              {uploading ? (
                <Loader2 className="w-5 h-5 text-brand animate-spin" strokeWidth={1.5} />
              ) : isDragging ? (
                <Sparkles className="w-5 h-5 text-brand" strokeWidth={1.5} />
              ) : (
                <Upload className="w-5 h-5 text-text-muted" strokeWidth={1.5} />
              )}
            </div>

            <div className="text-center">
              <p className="text-sm text-text-primary font-medium">
                {uploading
                  ? "Uploading..."
                  : outOfSlots
                    ? "Upload slots full"
                    : isDragging
                      ? "Drop to upload"
                      : "Drag & drop or click to upload"}
              </p>
              <p className="text-xs text-text-muted mt-0.5">
                {outOfSlots
                  ? "Delete items or upgrade your plan"
                  : `Images: JPG, PNG, WEBP (max ${formatSize(MAX_IMAGE_SIZE)}) · Videos: MP4, MOV, WEBM (max ${formatSize(MAX_VIDEO_SIZE)})`}
              </p>
            </div>

            {!outOfSlots && (
              <div className="flex items-center gap-3 text-[11px] text-text-muted mt-0.5">
                <span className="inline-flex items-center gap-1">
                  <ImageIcon className="w-3 h-3" strokeWidth={1.5} />
                  {imagesUsed}/{maxImages}
                </span>
                <span className="inline-flex items-center gap-1">
                  <Film className="w-3 h-3" strokeWidth={1.5} />
                  {videosUsed}/{maxVideos}
                </span>
              </div>
            )}

            <input
              ref={inputRef}
              type="file"
              multiple
              accept="image/jpeg,image/png,image/webp,video/mp4,video/quicktime,video/webm"
              onChange={(e) => {
                setFileError(null);
                handleFiles(e.target.files);
              }}
              className="hidden"
            />
          </div>
        </>
      )}
    </div>
  );
}
