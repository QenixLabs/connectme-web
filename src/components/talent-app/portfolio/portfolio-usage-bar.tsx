"use client";

import { Image as ImageIcon, Video, Info } from "lucide-react";
import { cn } from "@/lib/utils";

export function PortfolioUsageBar({
  imagesUsed,
  planMaxImages,
  videosUsed,
  planMaxVideos,
}: {
  imagesUsed: number;
  planMaxImages: number;
  videosUsed: number;
  planMaxVideos: number;
}) {
  const imagePercent = Math.round((imagesUsed / planMaxImages) * 100);
  const videoMaxed = videosUsed >= planMaxVideos;

  return (
    <div className="flex flex-col divide-y divide-border rounded-2xl border border-border bg-card sm:flex-row sm:divide-x sm:divide-y-0">
      {/* Images */}
      <div className="flex-1 px-4 py-3">
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2">
          <div className="flex min-w-0 items-center gap-2">
            <ImageIcon className="h-4 w-4 shrink-0 text-green" />
            <span className="truncate text-sm font-medium">Images</span>
          </div>
          <span className="shrink-0 text-sm">
            <span className="font-bold">{imagesUsed}</span>
            <span className="text-muted-foreground"> / {planMaxImages}</span>
          </span>
        </div>
        <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-surface-2">
          <div
            className="h-full rounded-full bg-gradient-teal transition-all duration-500"
            style={{ width: `${imagePercent}%` }}
          />
        </div>
        {planMaxImages - imagesUsed > 0 && (
          <p className="mt-1.5 flex items-center gap-1 text-[11px] text-muted-foreground">
            {planMaxImages - imagesUsed} uploads remaining{" "}
            <Info className="h-3 w-3" />
          </p>
        )}
      </div>

      {/* Videos */}
      <div className="flex-1 px-4 py-3">
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2">
          <div className="flex min-w-0 items-center gap-2">
            <Video className="h-4 w-4 shrink-0 text-purple" />
            <span className="truncate text-sm font-medium">Videos</span>
          </div>
          <div className="flex shrink-0 items-center gap-2 text-sm">
            <span>
              <span className="font-bold">{videosUsed}</span>
              <span className="text-muted-foreground"> / {planMaxVideos}</span>
            </span>
            {videoMaxed && (
              <span className="rounded-md bg-teal px-1.5 py-0.5 text-[10px] font-bold text-accent-foreground">
                MAX
              </span>
            )}
          </div>
        </div>
        <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-surface-2">
          <div
            className="h-full rounded-full bg-gradient-teal transition-all duration-500"
            style={{ width: videoMaxed ? "100%" : `${(videosUsed / planMaxVideos) * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
}
