import type { PortfolioApiResponse } from "@/lib/api/talent";

export type PortfolioItemKind = "image" | "video" | "document" | "link";

export interface PortfolioItem {
  id: string;
  url: string;
  thumbnail_url?: string;
  mime_type?: string;
  file_name?: string;
  file_size?: number;
  duration?: string;
  title: string;
  caption?: string;
  description?: string;
  category?: string;
  type: string;
  created_at?: string;
  updated_at?: string;
  view_count?: number;
  is_pinned?: boolean;
  date: string;
  views: number;
  image: string;
  kind: PortfolioItemKind;
  tag: "WORK" | "PERSONAL" | "INTRO";
  pinned: boolean;
  highlightType?: "showreel" | "video" | "image";
  linkLabel?: string;
  selected: boolean;
  onProfile?: boolean;
}

export function mapApiToItem(api: PortfolioApiResponse): PortfolioItem {
  const kindMap: Record<string, PortfolioItemKind> = {
    image: "image",
    video: "video",
    youtube: "link",
    instagram: "link",
    link: "link",
    document: "document",
  };
  const created = api.created_at
    ? new Date(api.created_at).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "";
  return {
    ...api,
    id: api.id,
    title: api.title || api.caption || "Untitled",
    date: created,
    views: api.view_count ?? 0,
    image: api.thumbnail_url || api.url,
    mime_type: api.mime_type,
    file_name: api.file_name,
    file_size: api.file_size,
    duration: api.duration && api.duration > 0
      ? `${Math.floor(api.duration / 60)}:${String(Math.floor(api.duration % 60)).padStart(2, "0")}`
      : undefined,
    kind: kindMap[api.type] || "image",
    tag: (api.category?.toUpperCase() as "WORK" | "PERSONAL" | "INTRO") || "WORK",
    pinned: api.is_pinned ?? false,
    highlightType: api.profile_highlight_type,
    linkLabel:
      api.type === "youtube" || api.type === "instagram"
        ? (() => {
            try {
              return new URL(api.url).hostname.replace("www.", "");
            } catch {
              return "";
            }
          })()
        : undefined,
    selected: false,
  };
}
