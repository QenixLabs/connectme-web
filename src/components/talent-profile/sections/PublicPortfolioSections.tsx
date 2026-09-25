"use client";

import { Images, Video } from "lucide-react";
import type { PortfolioApiResponse } from "@/lib/api/talent";
import { toPortfolioItems } from "../data";
import { HighlightRow } from "./HighlightRow";
import { ShowreelPlayerCard } from "./ShowreelPlayerCard";

export function PublicPortfolioSections({
  items,
  username,
  onOpenReel,
}: {
  items: PortfolioApiResponse[];
  username: string;
  onOpenReel: (itemId: string) => void;
}) {
  const media = toPortfolioItems(
    items.filter(
      (item) => item.type === "image" || item.type === "video" || item.type === "youtube",
    ),
  );
  const showreel = media.find((item) => item.profileHighlightType === "showreel");
  const videos = media.filter(
    (item) =>
      (item.type === "video" || item.type === "youtube") && item.id !== showreel?.id,
  );
  const images = media.filter((item) => item.type === "image");

  if (!showreel && videos.length === 0 && images.length === 0) return null;

  return (
    <div className="space-y-2.5">
       {showreel && (
         <ShowreelPlayerCard
           items={[showreel]}
           username={username}
           onOpenReel={onOpenReel}
         />
       )}
      <HighlightRow
        icon={Video}
        title="Video Highlights"
         variant="video"
         items={videos}
         username={username}
         onOpenReel={onOpenReel}
      />
      <HighlightRow
        icon={Images}
        title="Image Highlights"
         variant="image"
         items={images}
         username={username}
         onOpenReel={onOpenReel}
      />
    </div>
  );
}
