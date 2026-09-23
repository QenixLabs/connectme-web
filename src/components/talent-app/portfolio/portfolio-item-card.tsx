"use client";

/* eslint-disable @next/next/no-img-element */

import {
  Play,
  Star,
  Clapperboard,
  ExternalLink,
  Trash2,
  Pencil,
  FileText,
  MoreVertical,
  Check,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { PortfolioItem } from "./types";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

export function PortfolioItemCard({
  item,
  onToggleSelect,
  onEdit,
  onDelete,
  onTogglePin,
  onSetShowreel,
  onOpen,
  selectionMode,
}: {
  item: PortfolioItem;
  onToggleSelect: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onTogglePin: () => void;
  onSetShowreel: () => void;
  onOpen: () => void;
  selectionMode: boolean;
}) {
  const mediaType = item.kind === "image"
    ? (item.mime_type?.split("/")[1]?.toUpperCase() || "PHOTO")
      : item.kind === "video" || item.type === "youtube"
        ? "VIDEO"
      : item.kind === "document"
        ? "DOCUMENT"
        : "EXTERNAL LINK";
  const size = item.file_size
    ? item.file_size < 1024 * 1024
      ? `${Math.max(1, Math.round(item.file_size / 1024))} KB`
      : `${(item.file_size / (1024 * 1024)).toFixed(1)} MB`
      : null;
  const isOnProfile = item.onProfile === true;

  return (
    <article className="group overflow-hidden rounded-[14px] border border-[#e8e7f2] bg-card shadow-[0_10px_28px_-25px_rgba(36,42,94,0.7)] transition-all hover:-translate-y-0.5 hover:border-primary/35 hover:shadow-md">
      <div
        onClick={onOpen}
        role="button"
        tabIndex={0}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") onOpen();
        }}
         className="relative block aspect-[4/3] w-full overflow-hidden bg-[#f1f1f8] text-left"
      >
         {item.kind === "document" ? (
           <div className="grid h-full w-full place-items-center bg-secondary/60"><FileText className="size-9 text-primary/70" /><span className="absolute bottom-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Document</span></div>
         ) : item.kind === "link" && item.type !== "youtube" ? (
           <div className="grid h-full w-full place-items-center bg-secondary/60"><ExternalLink className="size-9 text-primary/70" /><span className="absolute bottom-3 max-w-[80%] truncate text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{item.linkLabel || "External link"}</span></div>
         ) : (
            <img src={item.image} alt={item.title} width={800} height={600} loading="lazy" className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" />
         )}
          {item.kind !== "document" && item.kind !== "link" && <div className="absolute inset-0 bg-gradient-to-t from-background/35 to-transparent" />}

          {isOnProfile && (
            <span className="absolute left-2 top-2 flex items-center gap-1 rounded-full bg-white/90 px-2 py-1 text-[9px] font-bold text-primary shadow-sm backdrop-blur-sm">
              <Star className="size-2.5 fill-current" /> On Profile
            </span>
          )}

          {(selectionMode || item.selected) && <button
           onClick={(e) => {
             e.stopPropagation();
             onToggleSelect();
          }}
           className={cn(
              "absolute right-2 top-2 grid size-5 place-items-center rounded-full border transition-colors",
              item.selected
                ? "border-primary bg-primary text-primary-foreground"
                : "border-foreground/25 bg-background/75 opacity-90 sm:opacity-0 sm:group-hover:opacity-100",
           )}
           aria-label="Select item for bulk actions"
         >
            {item.selected && <Check className="size-3" />}
         </button>}

          <div className="absolute right-2 top-2">
           <span className="sr-only">{item.tag}</span>
          <span
            className={cn(
              "hidden rounded-md px-2 py-1 text-[10px] font-bold tracking-wide text-foreground",
              item.tag === "WORK" ? "bg-orange/90" : item.tag === "PERSONAL" ? "bg-purple/90" : "bg-teal/90",
            )}
          >
            {item.tag}
          </span>
        </div>

          {(item.kind === "video" || item.type === "youtube") && (
          <div className="absolute inset-0 grid place-items-center">
              <span className="grid size-10 place-items-center rounded-full bg-background/70 backdrop-blur">
               <Play className="size-4 fill-foreground" />
            </span>
          </div>
        )}

        {item.kind === "link" && item.type !== "youtube" && (
            <span className="absolute bottom-2 right-2 grid size-7 place-items-center rounded-lg bg-background/85">
            <ExternalLink className="h-4 w-4" />
          </span>
        )}

      </div>

      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2 px-2.5 py-2">
        <div className="min-w-0">
            <h3 className="truncate text-xs font-semibold">{item.title}</h3>
           <p className="mt-0.5 truncate text-[11px] text-muted-foreground">
              {mediaType}{item.duration ? ` · ${item.duration}` : size ? ` · ${size}` : ""}
           </p>
        </div>
        <div className="flex shrink-0 items-center gap-1">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button onClick={(event) => event.stopPropagation()} className="rounded-md p-1.5 text-muted-foreground hover:bg-accent" aria-label="More actions"><MoreVertical className="size-4" /></button>
             </DropdownMenuTrigger>
             <DropdownMenuContent align="end">
               {(item.kind === "image" || item.kind === "video" || item.type === "youtube") && <DropdownMenuItem onClick={onTogglePin}><Star className="size-4" /> {item.highlightType ? "Remove From Profile" : "Show on Profile"}</DropdownMenuItem>}
               {(item.kind === "video" || item.type === "youtube") && <DropdownMenuItem onClick={onSetShowreel}><Clapperboard className="size-4" /> {item.highlightType === "showreel" ? "Remove Showreel" : "Set as Showreel"}</DropdownMenuItem>}
               <DropdownMenuItem onClick={onEdit}><Pencil className="size-4" /> Edit details</DropdownMenuItem>
               <DropdownMenuItem onClick={onDelete} variant="destructive"><Trash2 className="size-4" /> Delete</DropdownMenuItem>
             </DropdownMenuContent>
           </DropdownMenu>
        </div>
      </div>
    </article>
  );
}
