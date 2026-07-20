"use client";

import { useState, useCallback } from "react";
import { Link, Loader2, Camera } from "lucide-react";
import { cn } from "@/lib/utils";
import { talentApi } from "@/lib/api";
import type { PortfolioItem } from "@/lib/validations/talent-profile.schema";

interface PortfolioLinkInputProps {
  onItemAdded: (item: PortfolioItem) => void;
  onError?: (msg: string) => void;
}

type DetectedPlatform = "youtube" | "instagram" | null;

function detectPlatform(url: string): DetectedPlatform {
  if (/(?:youtube\.com\/(?:watch\?v=|shorts\/)|youtu\.be\/)/i.test(url)) return "youtube";
  if (/instagram\.com\/(p|reel|tv)\//i.test(url)) return "instagram";
  return null;
}

function extractYoutubeId(url: string): string | null {
  const m = url.match(/(?:youtube\.com\/(?:watch\?v=|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  return m ? m[1] : null;
}

export function PortfolioLinkInput({ onItemAdded, onError }: PortfolioLinkInputProps) {
  const [url, setUrl] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [caption, setCaption] = useState("");
  const [category, setCategory] = useState<"work" | "personal" | "intro">("work");
  const [isPinned, setIsPinned] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [platform, setPlatform] = useState<DetectedPlatform>(null);
  const [youtubeId, setYoutubeId] = useState<string | null>(null);

  const handleUrlChange = useCallback((value: string) => {
    setUrl(value);
    const p = detectPlatform(value);
    setPlatform(p);
    if (p === "youtube") setYoutubeId(extractYoutubeId(value));
    else setYoutubeId(null);
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!url.trim() || !platform) return;
    setSubmitting(true);
    try {
      const { item } = await talentApi.addPortfolioLink(url.trim(), {
        caption: caption.trim() || undefined,
        title: title.trim() || undefined,
        description: description.trim() || undefined,
        category,
        is_pinned: isPinned,
      });
      onItemAdded(item);
      setUrl("");
      setTitle("");
      setDescription("");
      setCaption("");
      setPlatform(null);
      setYoutubeId(null);
      setIsPinned(false);
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        "Failed to add link";
      onError?.(msg);
    } finally {
      setSubmitting(false);
    }
  }, [url, platform, caption, category, isPinned, onItemAdded, onError]);

  const PlatformIcon = platform ? Link : Link;

  return (
    <div className="space-y-4">
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <PlatformIcon
            className={cn(
              "h-4 w-4",
              platform ? "text-brand" : "text-text-muted"
            )}
          />
        </div>
        <input
          type="url"
          value={url}
          onChange={(e) => handleUrlChange(e.target.value)}
          placeholder="Paste YouTube or Instagram link..."
          className="w-full pl-9 pr-3 py-2.5 text-sm rounded-xl border border-border bg-card text-text-primary placeholder:text-text-muted focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand/20 transition"
        />
      </div>

      {youtubeId && (
        <div className="rounded-xl overflow-hidden border border-border/60 bg-black">
          <img
            src={`https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg`}
            alt="YouTube thumbnail"
            className="w-full aspect-video object-cover opacity-90"
          />
        </div>
      )}

      {platform === "instagram" && url && (
        <div className="rounded-xl border border-border/60 p-4 bg-gradient-to-br from-pink-500/10 via-purple-500/10 to-yellow-500/10">
          <p className="text-xs text-text-muted flex items-center gap-1.5">
            <Camera className="h-3.5 w-3.5 text-pink-500" />
            Instagram {url.includes("/reel/") ? "Reel" : "Post"}
          </p>
          <p className="text-xs text-text-secondary mt-1 truncate">{url}</p>
        </div>
      )}

      {platform && (
        <>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Add a title..."
            maxLength={120}
            className="w-full text-sm bg-transparent border-0 border-b border-border px-0 py-1.5 focus:outline-none focus:border-brand text-text-primary placeholder:text-text-muted"
          />
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Add a description..."
            maxLength={200}
            className="w-full text-sm bg-transparent border-0 border-b border-border px-0 py-1.5 focus:outline-none focus:border-brand text-text-primary placeholder:text-text-muted"
          />
          <input
            type="text"
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            placeholder="Alt text / caption..."
            className="w-full text-sm bg-transparent border-0 border-b border-border px-0 py-1.5 focus:outline-none focus:border-brand text-text-primary placeholder:text-text-muted"
          />

          <div>
            <label className="text-[11px] font-medium text-text-muted uppercase tracking-wider block mb-1.5">
              Category
            </label>
            <div className="flex gap-2">
              {(["work", "personal", "intro"] as const).map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategory(cat)}
                  className={cn(
                    "px-3 py-1.5 text-xs font-medium rounded-full capitalize transition-colors border",
                    category === cat
                      ? cat === "intro"
                        ? "bg-brand text-white border-brand"
                        : "bg-foreground text-background border-foreground"
                      : "bg-card text-text-secondary border-border hover:bg-muted"
                  )}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsPinned(!isPinned)}
              className={cn(
                "px-3 py-1.5 text-xs font-medium rounded-full transition-colors border",
                isPinned
                  ? "bg-brand text-white border-brand"
                  : "bg-card text-text-secondary border-border hover:bg-muted"
              )}
            >
              {isPinned ? "Pinned" : "Pin to top"}
            </button>
          </div>

          <button
            onClick={handleSubmit}
            disabled={submitting || !url.trim()}
            className="w-full py-2.5 rounded-xl bg-brand text-white text-sm font-medium hover:bg-brand/90 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {submitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Link className="h-4 w-4" />
            )}
            {submitting ? "Adding..." : "Add Link"}
          </button>
        </>
      )}
    </div>
  );
}
