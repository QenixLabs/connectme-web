"use client";

import { useState, useCallback, useRef } from "react";
import { Upload, Image as ImageIcon, Film, X, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { talentApi } from "@/lib/api";
import { getApiErrorMessage } from "@/lib/formatters";
import { toast } from "sonner";

interface PortfolioUploaderProps {
  imagesUsed: number;
  videosUsed: number;
  maxImages: number;
  maxVideos: number;
  onUpload: () => void;
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
  const inputRef = useRef<HTMLInputElement>(null);

  const canUploadImage = imagesUsed < maxImages;
  const canUploadVideo = videosUsed < maxVideos;

  const handleFiles = useCallback(
    async (files: FileList | null) => {
      if (!files || files.length === 0) return;

      for (const file of Array.from(files)) {
        if (uploading) break;

        const isImage = file.type.startsWith("image/");
        const isVideo = file.type.startsWith("video/");

        if (!isImage && !isVideo) {
          toast.error(`Unsupported file type: ${file.name}`);
          continue;
        }

        if (isImage && !canUploadImage) {
          toast.error("Image limit reached");
          continue;
        }

        if (isVideo && !canUploadVideo) {
          toast.error("Video limit reached");
          continue;
        }

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

          toast.success(`${isImage ? "Image" : "Video"} uploaded`);
          onUpload();
        } catch (err) {
          toast.error(getApiErrorMessage(err, "Upload failed"));
        } finally {
          setUploading(false);
        }
      }
    },
    [canUploadImage, canUploadVideo, onUpload, uploading]
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
          Images: JPG, PNG, WEBP (max 5MB) · Videos: MP4, MOV, WEBM (max 50MB)
        </p>
        <input
          ref={inputRef}
          type="file"
          multiple
          accept="image/jpeg,image/png,image/webp,video/mp4,video/quicktime,video/webm"
          onChange={(e) => handleFiles(e.target.files)}
          className="hidden"
        />
      </div>
    </div>
  );
}
