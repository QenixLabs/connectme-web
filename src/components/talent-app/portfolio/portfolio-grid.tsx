"use client";

import { useState } from "react";
import { Video, Image as ImageIcon, Link2, Layers, SlidersHorizontal, ChevronDown } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { PortfolioItemCard } from "./portfolio-item-card";
import { PortfolioEmptyState } from "./portfolio-empty-state";
import { Button } from "@/components/ui/button";
import type { PortfolioItem, PortfolioItemKind } from "./types";

const TABS = [
  { value: "all", label: "All", icon: Layers },
  { value: "video", label: "Videos", icon: Video },
  { value: "image", label: "Pictures", icon: ImageIcon },
  { value: "link", label: "Links", icon: Link2 },
] as const;

export function PortfolioGrid({
  items,
  onEdit,
  onDelete,
  onTogglePin,
  onOpen,
  onToggleSelect,
  onUploadImage,
  onUploadVideo,
}: {
  items: PortfolioItem[];
  onEdit: (item: PortfolioItem) => void;
  onDelete: (item: PortfolioItem) => void;
  onTogglePin: (item: PortfolioItem) => void;
  onOpen: (id: string, kind: PortfolioItemKind) => void;
  onToggleSelect: (id: string) => void;
  onUploadImage: () => void;
  onUploadVideo: () => void;
}) {
  const [activeTab, setActiveTab] = useState("all");

  const filtered =
    activeTab === "all"
      ? items
      : items.filter((i) => i.kind === activeTab);

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
      <div className="flex items-center justify-between">
        <TabsList className="h-auto gap-1 bg-muted/50 p-1">
          {TABS.map((tab) => {
            const count =
              tab.value === "all"
                ? items.length
                : items.filter((i) => i.kind === tab.value).length;
            return (
              <TabsTrigger
                key={tab.value}
                value={tab.value}
                className="gap-1.5 rounded-lg px-3 py-1.5 text-xs data-[state=active]:bg-card data-[state=active]:shadow-sm"
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

        <Button variant="outline" size="sm" className="hidden sm:flex">
          <SlidersHorizontal className="mr-1.5 h-3.5 w-3.5" />
          Newest <ChevronDown className="ml-1 h-3.5 w-3.5" />
        </Button>
      </div>

      <TabsContent value={activeTab} className="mt-0">
        {filtered.length === 0 ? (
          <PortfolioEmptyState
            icon={activeTab === "video" ? Video : activeTab === "image" ? ImageIcon : activeTab === "link" ? Link2 : Layers}
            title={
              activeTab === "all"
                ? "No portfolio items yet"
                : `No ${activeTab === "image" ? "pictures" : activeTab === "link" ? "links" : `${activeTab}s`} yet`
            }
            description={
              activeTab === "all"
                ? "Upload images, videos, or add links to showcase your work."
                : activeTab === "video"
                  ? "Upload videos or add YouTube links to showcase your work."
                  : activeTab === "image"
                    ? "Upload images to build your portfolio."
                    : "Add YouTube or external links to your portfolio."
            }
            action={
              <div className="flex gap-2">
                <Button size="sm" onClick={onUploadImage}>
                  Upload Image
                </Button>
                <Button size="sm" variant="outline" onClick={onUploadVideo}>
                  Add Video
                </Button>
              </div>
            }
          />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {filtered.map((item) => (
              <PortfolioItemCard
                key={item.id}
                item={item}
                onToggleSelect={() => onToggleSelect(item.id)}
                onEdit={() => onEdit(item)}
                onDelete={() => onDelete(item)}
                onTogglePin={() => onTogglePin(item)}
                onOpen={() => onOpen(item.id, item.kind)}
              />
            ))}
          </div>
        )}
      </TabsContent>
    </Tabs>
  );
}
