"use client";

import { Plug, Share2, Bookmark } from "lucide-react";
import { motion } from "motion/react";
import { ShareProfileDialog } from "@/components/share-profile-dialog";

interface PortfolioCtaProps {
  username: string;
  displayName?: string;
  profilePhoto?: string;
  onConnect?: () => void;
  onBookmark?: () => void;
  isConnecting?: boolean;
  connectDisabled?: boolean;
}

export function PortfolioCta({
  username,
  displayName,
  profilePhoto,
  onConnect,
  onBookmark,
  isConnecting,
  connectDisabled,
}: PortfolioCtaProps) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.5 }}
      className="px-4 mt-6 mb-10"
    >
      <div className="rounded-2xl bg-card border border-border/60 shadow-luxe p-2.5 flex items-center gap-2">
        <button
          onClick={onConnect}
          disabled={isConnecting || connectDisabled}
          className="flex-1 h-12 rounded-xl bg-gradient-to-b from-[oklch(0.78_0.13_80)] to-[oklch(0.68_0.13_78)] text-white font-medium text-[13px] flex items-center justify-center gap-2 shadow-[0_8px_24px_-10px_oklch(0.74_0.13_80/0.7)] active:scale-[0.99] transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Plug className="h-4 w-4" />
          {isConnecting ? "Connecting..." : "Connect"}
        </button>

        <ShareProfileDialog
          username={username}
          profilePhoto={profilePhoto}
          name={displayName}
        >
          <button className="h-12 px-4 rounded-xl bg-cream border border-border text-ink-soft text-[13px] font-medium flex items-center justify-center gap-2 active:scale-[0.99] transition">
            <Share2 className="h-4 w-4 text-gold" />
            Share
          </button>
        </ShareProfileDialog>

        <button
          onClick={onBookmark}
          className="h-12 w-12 rounded-xl bg-cream border border-border grid place-items-center active:scale-[0.99] transition"
        >
          <Bookmark className="h-4 w-4 text-gold" />
        </button>
      </div>
    </motion.section>
  );
}
