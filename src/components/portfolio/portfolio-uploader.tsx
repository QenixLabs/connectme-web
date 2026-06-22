"use client";

import { useState, useCallback, useRef } from "react";
import { Upload, Image as ImageIcon, Film, X, Loader2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { talentApi } from "@/lib/api";
import { getApiErrorMessage } from "@/lib/formatters";
import { usePopup } from "@/hooks/use-popup";
import { useFeatureGuard } from "@/hooks/use-feature-guard";

interface PortfolioUploaderProps {
  imagesUsed: number;
  videosUsed: number;
  maxImages: number;
  maxVideos: number;
  onUpload: () => void;
}

const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_VIDEO_SIZE = 50 * 1024 * 1024; // 50MB

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
      return "Image upload limit reached. Delete an existing image or upgrade your plan.";
    }

    if (isVideo && !canUploadVideo) {
      return "Video upload limit reached. Delete an existing video or upgrade your plan.";
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
    [canUploadImage, canUploadVideo, onUpload, uploading, handleFeatureError, show, validateFile]
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

  return (
    <div className="space-y-3">
      {/* Limits bar */}
      <div className="flex items-center gap-4 text-xs text-text-muted">
        <div className="flex items-center gap-1.5">
          <ImageIcon className="w-3.5 h-3.5" strokeWidth={1.5} />
          <span>
            {imagesUsed}/{maxImages} images
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <Film className="w-3.5 h-3.5" strokeWidth={1.5} />
          <span>
            {videosUsed}/{maxVideos} videos
          </span>
        </div>
      </div>

      {/* Error banner */}
      {fileError && (
        <div className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2.5 text-sm text-destructive">
          <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" strokeWidth={1.5} />
          <span className="flex-1">{fileError}</span>
          <button
            onClick={() => setFileError(null)}
            className="text-destructive/70 hover:text-destructive"
          >
            <X className="w-4 h-4" strokeWidth={1.5} />
          </button>
        </div>
      )}

      {/* Dropzone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={cn(
          "relative border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center gap-2 cursor-pointer transition-colors",
          isDragging
            ? "border-brand bg-brand/5"
            : fileError
              ? "border-destructive/50 bg-destructive/5 hover:border-destructive/70"
              : "border-border hover:border-text-muted hover:bg-muted/50"
        )}
      >
        {uploading ? (
          <Loader2 className="w-6 h-6 text-brand animate-spin" strokeWidth={1.5} />
        ) : (
          <Upload className="w-6 h-6 text-text-muted" strokeWidth={1.5} />
        )}
        <p className="text-sm text-text-muted text-center">
          {uploading
            ? "Uploading..."
            : "Drag & drop images or videos, or click to browse"}
        </p>
        <p className="text-2xs text-text-muted">
          Images: JPG, PNG, WEBP (max {formatSize(MAX_IMAGE_SIZE)}) · Videos: MP4, MOV, WEBM (max {formatSize(MAX_VIDEO_SIZE)})
        </p>
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
    </div>
  );
}
