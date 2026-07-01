"use client";

import { X, ExternalLink } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import type { PortfolioItem } from "@/lib/validations/talent-profile.schema";

interface PortfolioLightboxProps {
  item: PortfolioItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PortfolioLightbox({ item, open, onOpenChange }: PortfolioLightboxProps) {
  if (!item) return null;

  const isYoutube = item.type === "youtube";
  const isInstagram = item.type === "instagram";
  const isVideo = item.type === "video";
  const isImage = item.type === "image";

  const youtubeId = isYoutube
    ? item.embed_url?.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|shorts\/)([a-zA-Z0-9_-]{11})/)?.[1]
    : null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="max-w-2xl p-0 overflow-hidden bg-black border-0 rounded-2xl"
      >
        <button
          onClick={() => onOpenChange(false)}
          className="absolute top-3 right-3 z-10 h-8 w-8 rounded-full bg-black/50 backdrop-blur-sm grid place-items-center text-white hover:bg-black/70 transition"
        >
          <X className="h-4 w-4" />
        </button>

        {isImage && item.url && (
          <div className="flex items-center justify-center min-h-[60vh]">
            <img
              src={item.url}
              alt={item.caption || "Portfolio image"}
              className="max-w-full max-h-[80vh] object-contain"
            />
          </div>
        )}

        {isVideo && item.url && (
          <div className="flex items-center justify-center min-h-[60vh]">
            <video
              src={item.url}
              controls
              autoPlay
              className="max-w-full max-h-[80vh]"
              playsInline
            />
          </div>
        )}

        {isYoutube && youtubeId && (
          <div className="relative w-full pt-[56.25%]">
            <iframe
              src={`https://www.youtube-nocookie.com/embed/${youtubeId}?autoplay=1`}
              title={item.caption || "YouTube video"}
              className="absolute inset-0 w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        )}

        {isYoutube && !youtubeId && (
          <div className="flex items-center justify-center min-h-[40vh] bg-neutral-900">
            <p className="text-white/60 text-sm">YouTube video unavailable</p>
          </div>
        )}

        {isInstagram && (
          <div className="flex flex-col items-center justify-center min-h-[40vh] bg-gradient-to-br from-pink-500/20 via-purple-500/20 to-yellow-500/20 p-8 gap-4">
            <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-pink-500 via-purple-500 to-yellow-500 grid place-items-center shadow-lg">
              <span className="text-2xl">📸</span>
            </div>
            <p className="text-white/80 text-sm text-center">
              {item.caption || "Instagram post"}
            </p>
            <a
              href={item.embed_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 border border-white/20 text-white text-sm font-medium hover:bg-white/20 transition"
            >
              View on Instagram
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </div>
        )}

        {(item.caption || item.category) && (
          <div className="absolute bottom-0 inset-x-0 p-4 bg-gradient-to-t from-black/80 via-black/40 to-transparent">
            {item.caption && (
              <p className="text-white text-sm font-medium">{item.caption}</p>
            )}
            <p className="text-white/60 text-xs capitalize mt-0.5">{item.category}</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
