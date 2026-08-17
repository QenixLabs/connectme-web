"use client";

import { Heart } from "lucide-react";
import { useStore } from "zustand/react";
import { authStore } from "@/stores/auth-store";
import {
  formatCount,
  usePortfolioItemLikeStatus,
  useLikePortfolioItem,
  useUnlikePortfolioItem,
} from "@/hooks/use-portfolio";

interface LikeButtonProps {
  itemId: string;
  initialLikes: number;
  initialLiked?: boolean;
  size?: "sm" | "md";
  variant?: "default" | "reel";
  className?: string;
}

export function LikeButton({
  itemId,
  initialLikes,
  initialLiked = false,
  size = "md",
  variant = "default",
  className,
}: LikeButtonProps) {
  const isAuthenticated = useStore(authStore, (s) => s.isAuthenticated);
  const { data: status } = usePortfolioItemLikeStatus(itemId);
  const like = useLikePortfolioItem();
  const unlike = useUnlikePortfolioItem();

  const liked = status?.liked ?? initialLiked;
  const count = status?.likes_count ?? initialLikes;
  const isPending = like.isPending || unlike.isPending;

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    if (!isAuthenticated) {
      window.location.href = "/auth/login";
      return;
    }
    if (liked) {
      unlike.mutate(itemId);
    } else {
      like.mutate(itemId);
    }
  };

  const iconSize = size === "sm" ? "size-3.5" : "size-4";
  const textSize = size === "sm" ? "text-xs" : "text-sm";

  const layoutClass =
    variant === "reel" ? "flex-col gap-0.5" : "inline-flex items-center gap-1.5";
  const colorClass = liked
    ? "text-primary"
    : variant === "reel"
      ? "text-white hover:text-white"
      : "text-muted-foreground hover:text-foreground";

  return (
    <button
      onClick={handleClick}
      disabled={isPending}
      className={`${layoutClass} ${colorClass} transition-colors ${textSize} ${className}`}
      aria-label={liked ? "Unlike" : "Like"}
    >
      <Heart
        className={`${iconSize} transition-transform active:scale-90 ${
          liked ? "fill-current" : ""
        }`}
        strokeWidth={liked ? 1.5 : 2}
      />
      {formatCount(count)}
    </button>
  );
}
