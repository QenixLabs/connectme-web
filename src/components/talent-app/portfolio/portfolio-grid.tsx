"use client";

import { useMemo, useState } from "react";
import { Video, Image as ImageIcon, Link2, Layers, FileText, Search, SlidersHorizontal } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { PortfolioItemCard } from "./portfolio-item-card";
import { PortfolioEmptyState } from "./portfolio-empty-state";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { PortfolioItem, PortfolioItemKind } from "./types";

const TABS = [
  { value: "all", label: "All", icon: Layers },
  { value: "image", label: "Photos", icon: ImageIcon },
  { value: "video", label: "Videos", icon: Video },
  { value: "link", label: "Links", icon: Link2 },
] as const;

type SortOption = "newest" | "oldest" | "updated" | "profile";

export function PortfolioGrid({
  items,
  onEdit,
  onDelete,
  onTogglePin,
  onSetShowreel,
  onOpen,
  onToggleSelect,
  onAddMedia,
  usage,
}: {
  items: PortfolioItem[];
  onEdit: (item: PortfolioItem) => void;
  onDelete: (item: PortfolioItem) => void;
  onTogglePin: (item: PortfolioItem) => void;
  onSetShowreel: (item: PortfolioItem) => void;
  onOpen: (id: string, kind: PortfolioItemKind) => void;
  onToggleSelect: (id: string) => void;
  onAddMedia: () => void;
  usage: { imagesUsed: number; planMaxImages: number; videosUsed: number; planMaxVideos: number };
}) {
  const [activeTab, setActiveTab] = useState("all");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<SortOption>("newest");
  const [selectionMode, setSelectionMode] = useState(false);
  const [profileOnly, setProfileOnly] = useState(false);

  const filtered = useMemo(() => {
    const result = items.filter((item) => {
      const matchesTab = activeTab === "all"
        ? item.kind !== "document"
        : item.kind === activeTab
          || (activeTab === "video" && item.type === "youtube")
          || (activeTab === "link" && item.kind === "link" && item.type !== "youtube");
      const query = search.trim().toLowerCase();
      return matchesTab && (!profileOnly || item.onProfile) && (!query || `${item.title} ${item.caption || ""} ${item.type} ${item.category || ""}`.toLowerCase().includes(query));
    });
    return [...result].sort((a, b) => {
      if (sort === "profile") return Number(b.onProfile) - Number(a.onProfile);
      const aTime = new Date(sort === "updated" ? (a.updated_at ?? a.created_at ?? 0) : (a.created_at ?? 0)).getTime();
      const bTime = new Date(sort === "updated" ? (b.updated_at ?? b.created_at ?? 0) : (b.created_at ?? 0)).getTime();
      return sort === "oldest" ? aTime - bTime : bTime - aTime;
    });
  }, [activeTab, items, profileOnly, search, sort]);

  const filteredDocuments = useMemo(() => {
    const query = search.trim().toLowerCase();
    const documents = items.filter(
      (item) =>
        item.kind === "document" &&
        (!profileOnly || item.onProfile) &&
        (!query || `${item.title} ${item.caption || ""} ${item.type} ${item.category || ""}`.toLowerCase().includes(query)),
    );
    return [...documents].sort((a, b) => {
      if (sort === "profile") return Number(b.onProfile) - Number(a.onProfile);
      const aTime = new Date(sort === "updated" ? (a.updated_at ?? a.created_at ?? 0) : (a.created_at ?? 0)).getTime();
      const bTime = new Date(sort === "updated" ? (b.updated_at ?? b.created_at ?? 0) : (b.created_at ?? 0)).getTime();
      return sort === "oldest" ? aTime - bTime : bTime - aTime;
    });
  }, [items, profileOnly, search, sort]);

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-3">
      <div className="space-y-3">
        <div className="flex items-end justify-between gap-3">
          <div><p className="text-[10px] font-bold uppercase tracking-[0.18em] text-primary/75">Your collection</p><h2 className="mt-1 text-[18px] font-bold tracking-tight text-[#172653]">Media Library</h2></div>
          <div className="flex items-center gap-3"><span className="text-[11px] text-muted-foreground">{items.length} {items.length === 1 ? "item" : "items"}</span><button type="button" onClick={() => setSelectionMode((current) => !current)} className="text-[11px] font-bold text-primary hover:underline">{selectionMode ? "Done" : "Select"}</button></div>
        </div>
        <TabsList className="no-scrollbar h-auto w-full justify-start gap-1 overflow-x-auto rounded-xl bg-[#f7f6fd] p-1">
          {TABS.map((tab) => {
            const count =
              tab.value === "all"
                ? items.filter((item) => item.kind !== "document").length
                : items.filter((i) => (i.kind === tab.value && !(tab.value === "link" && i.type === "youtube")) || (tab.value === "video" && i.type === "youtube")).length;
            return (
              <TabsTrigger
                key={tab.value}
                value={tab.value}
                className="shrink-0 gap-1 rounded-lg border border-transparent px-3 py-2 text-[11px] font-semibold text-muted-foreground data-[state=active]:border-[#dedcf3] data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm"
              >
                <tab.icon className="h-3.5 w-3.5" />
                {tab.label}
                <span className="ml-0.5 text-[10px] text-muted-foreground">
                  {count}
                </span>
              </TabsTrigger>
            );
          })}
          </TabsList>
        <div className="flex items-center gap-2">
          <div className="relative min-w-0 flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search media, titles or tags..." className="h-10 rounded-xl border-[#e5e4f0] bg-white pl-9 text-xs shadow-sm" />
          </div>
          <select value={sort} onChange={(event) => setSort(event.target.value as SortOption)} aria-label="Sort media" className="h-10 max-w-[112px] rounded-xl border border-[#e5e4f0] bg-white px-2 text-[11px] font-semibold text-foreground shadow-sm outline-none focus:border-primary sm:max-w-none sm:px-3">
            <option value="newest">Newest</option><option value="oldest">Oldest</option><option value="updated">Recently updated</option><option value="profile">On Profile</option>
          </select>
          <Button type="button" variant="outline" size="icon" aria-label={profileOnly ? "Show all media" : "Show profile media only"} aria-pressed={profileOnly} className={`size-10 shrink-0 rounded-xl border-[#e5e4f0] bg-white shadow-sm ${profileOnly ? "border-primary bg-primary/5 text-primary" : "text-muted-foreground"}`} onClick={() => setProfileOnly((current) => !current)}>
            <SlidersHorizontal className="size-4" />
          </Button>
        </div>
        <div className="flex items-center justify-between gap-3 text-[10px] text-muted-foreground">
           <div className="flex gap-3"><span>Photos {usage.imagesUsed} / {usage.planMaxImages}</span><span>Videos {usage.videosUsed} / {usage.planMaxVideos}</span></div>
           {profileOnly && <span className="font-semibold text-primary">Profile media only</span>}
        </div>
       </div>

      <TabsContent value={activeTab} className="mt-0">
        {filtered.length === 0 ? (
          <PortfolioEmptyState
             icon={activeTab === "video" ? Video : activeTab === "image" ? ImageIcon : activeTab === "document" ? FileText : activeTab === "link" ? Link2 : Layers}
            title={
              activeTab === "all"
                ? "No portfolio items yet"
                 : `No ${activeTab === "image" ? "photos" : activeTab === "link" ? "links" : activeTab === "document" ? "documents" : "videos"} yet`
            }
            description={
              activeTab === "all"
                ? "Upload images, videos, or add links to showcase your work."
                : activeTab === "video"
                  ? "Upload videos or add YouTube links to showcase your work."
                   : activeTab === "image"
                     ? "Upload images to build your portfolio."
                     : activeTab === "document"
                       ? "Upload resumes and documents to keep your work in one place."
                       : "Add YouTube or external links to your portfolio."
            }
             action={<Button size="sm" onClick={onAddMedia}>Add Media</Button>}
          />
        ) : (
           <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 xl:grid-cols-4">
            {filtered.map((item) => (
              <PortfolioItemCard
                key={item.id}
                item={item}
                onToggleSelect={() => onToggleSelect(item.id)}
                onEdit={() => onEdit(item)}
                onDelete={() => onDelete(item)}
                onTogglePin={() => onTogglePin(item)}
                onSetShowreel={() => onSetShowreel(item)}
                onOpen={() => onOpen(item.id, item.kind)}
                selectionMode={selectionMode}
              />
            ))}
          </div>
       )}
      </TabsContent>

      {filteredDocuments.length > 0 && (
        <section className="rounded-[16px] border border-border/70 bg-card p-3 shadow-[0_8px_24px_-22px_rgba(35,43,91,0.7)] sm:p-4">
          <div className="mb-3 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="grid size-8 place-items-center rounded-lg bg-[#f8efff] text-[#a04bc0]"><FileText className="size-4" /></span>
              <div><h2 className="text-[15px] font-bold text-foreground">Documents</h2><p className="text-[11px] text-muted-foreground">Resumes and other uploaded documents</p></div>
            </div>
            <span className="text-[11px] font-semibold text-muted-foreground">{filteredDocuments.length}</span>
          </div>
          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 xl:grid-cols-4">
            {filteredDocuments.map((item) => (
              <PortfolioItemCard
                key={item.id}
                item={item}
                onToggleSelect={() => onToggleSelect(item.id)}
                onEdit={() => onEdit(item)}
                onDelete={() => onDelete(item)}
                onTogglePin={() => onTogglePin(item)}
                onSetShowreel={() => onSetShowreel(item)}
                onOpen={() => onOpen(item.id, item.kind)}
                selectionMode={selectionMode}
              />
            ))}
          </div>
        </section>
      )}
    </Tabs>
  );
}
