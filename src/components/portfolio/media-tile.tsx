"use client";

import { Pin, Play, Camera, Film } from "lucide-react";
import type { PortfolioItem } from "@/lib/validations/talent-profile.schema";

interface MediaTileProps {
  item: PortfolioItem;
  pinned?: boolean;
  large?: boolean;
  onPin?: () => void;
}

const HUES: Record<string, string> = {
  work: "oklch(0.42 0.06 60)",
  personal: "oklch(0.55 0.08 70)",
  intro: "oklch(0.35 0.04 50)",
};

export function MediaTile({ item, pinned, large, onPin }: MediaTileProps) {
  const isVideo = item.type === "video";
  const hue = HUES[item.category] || HUES.work;
  const spanClass = large
    ? "aspect-[16/10]"
    : "aspect-square";

  return (
    <div
      className={`relative overflow-hidden rounded-2xl border border-border/60 shadow-luxe ${spanClass}`}
      style={{
        background: `radial-gradient(120% 80% at 20% 0%, ${hue} 0%, transparent 60%), linear-gradient(160deg, oklch(0.28 0.03 55), oklch(0.18 0.03 50))`,
      }}
    >
      {/* gold grain */}
      <div
        className="absolute inset-0 opacity-[0.16] mix-blend-screen"
        style={{
          backgroundImage:
            "radial-gradient(circle at 70% 30%, oklch(0.74 0.13 80 / 0.5), transparent 40%)",
        }}
      />

      {/* type chip */}
      <div className="absolute top-2.5 left-2.5 flex items-center gap-1 rounded-full bg-black/40 backdrop-blur-md border border-white/10 px-2 py-0.5">
        {isVideo ? (
          <Film className="h-2.5 w-2.5 text-gold" />
        ) : (
          <Camera className="h-2.5 w-2.5 text-gold" />
        )}
        <span className="text-[9px] font-medium uppercase tracking-[0.12em] text-white">
          {item.type}
        </span>
      </div>

      {/* pin toggle */}
      {onPin && (
        <button
          onClick={onPin}
          className={`absolute top-2.5 right-2.5 h-7 w-7 rounded-full grid place-items-center backdrop-blur-md border transition ${
            pinned
              ? "bg-gold border-gold/60 text-white"
              : "bg-black/35 border-white/10 text-white/80 hover:bg-black/50"
          }`}
          aria-label={pinned ? "Pinned" : "Pin this"}
        >
          <Pin className="h-3.5 w-3.5" fill={pinned ? "currentColor" : "none"} />
        </button>
      )}

      {/* play overlay for video */}
      {isVideo && (
        <div className="absolute inset-0 grid place-items-center">
          <div className="h-14 w-14 rounded-full bg-white/10 backdrop-blur-md border border-white/20 grid place-items-center shadow-lg">
            <Play className="h-5 w-5 text-white ml-0.5" fill="white" />
          </div>
        </div>
      )}

      {/* actual media */}
      {item.url && !isVideo && (
        <img
          src={item.thumbnail_url || item.url}
          alt={item.caption || "Portfolio item"}
          className="absolute inset-0 w-full h-full object-cover opacity-80"
          loading="lazy"
        />
      )}
      {item.url && isVideo && (
        <video
          src={item.url}
          className="absolute inset-0 w-full h-full object-cover opacity-70"
          preload="metadata"
          muted
          playsInline
        />
      )}

      {/* caption */}
      <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/70 via-black/30 to-transparent">
        <div className="font-serif text-[14px] font-semibold text-white leading-tight">
          {item.caption || (isVideo ? "Showreel" : "Portfolio")}
        </div>
        <div className="text-[10.5px] text-white/70 mt-0.5 capitalize">{item.category}</div>
      </div>
    </div>
  );
}
