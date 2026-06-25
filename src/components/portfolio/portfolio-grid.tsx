"use client";

import { useState, useCallback } from "react";
import { Image as ImageIcon } from "lucide-react";
import type { PortfolioItem } from "@/lib/validations/talent-profile.schema";
import { PortfolioItemCard } from "./portfolio-item-card";
import { EmptyState } from "@/components/ui/empty-state";

interface PortfolioGridProps {
  items: PortfolioItem[];
  onUpdate: (
    id: string,
    dto: {
      caption?: string;
      category?: "work" | "personal" | "intro";
      is_pinned?: boolean;
    }
  ) => void;
  onDelete: (id: string) => void;
  onReorder: (itemIds: string[]) => void;
  onSelectItem: (item: PortfolioItem) => void;
}

export function PortfolioGrid({
  items,
  onUpdate,
  onDelete,
  onReorder,
  onSelectItem,
}: PortfolioGridProps) {
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);

  const handleDragStart = useCallback(
    (e: React.DragEvent, id: string) => {
      setDraggedId(id);
      e.dataTransfer.effectAllowed = "move";
      e.dataTransfer.setData("text/plain", id);
      const el = e.currentTarget as HTMLElement;
      if (el) el.style.opacity = "0.4";
    },
    []
  );

  const handleDragOver = useCallback(
    (e: React.DragEvent, id: string) => {
      e.preventDefault();
      if (id !== draggedId) setDragOverId(id);
    },
    [draggedId]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent, targetId: string) => {
      e.preventDefault();
      setDragOverId(null);
      const sourceId = e.dataTransfer.getData("text/plain") || draggedId;
      if (!sourceId || sourceId === targetId) {
        setDraggedId(null);
        return;
      }
      const newOrder = [...items];
      const draggedIndex = newOrder.findIndex((i) => i.id === sourceId);
      const targetIndex = newOrder.findIndex((i) => i.id === targetId);
      if (draggedIndex === -1 || targetIndex === -1) {
        setDraggedId(null);
        return;
      }
      const [removed] = newOrder.splice(draggedIndex, 1);
      newOrder.splice(targetIndex, 0, removed);
      onReorder(newOrder.map((i) => i.id));
      setDraggedId(null);
    },
    [draggedId, items, onReorder]
  );

  const handleDragEnd = useCallback((e: React.DragEvent) => {
    setDraggedId(null);
    setDragOverId(null);
    const el = e.currentTarget as HTMLElement;
    if (el) el.style.opacity = "1";
  }, []);

  if (items.length === 0) {
    return (
      <EmptyState
        icon={<ImageIcon className="w-6 h-6 text-text-muted" strokeWidth={1.5} />}
        title="No media yet"
        description="Upload your first image or video to showcase your work."
      />
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
      {items.map((item) => {
        const isDragged = draggedId === item.id;
        const isOver = dragOverId === item.id && !isDragged;

        return (
          <div
            key={item.id}
            data-grid-item
            data-item-id={item.id}
            draggable
            onDragStart={(e) => handleDragStart(e, item.id)}
            onDragOver={(e) => handleDragOver(e, item.id)}
            onDrop={(e) => handleDrop(e, item.id)}
            onDragEnd={handleDragEnd}
            className={
              isDragged
                ? "w-full scale-105 shadow-xl opacity-80 z-10 transition-transform"
                : isOver
                  ? "opacity-60 scale-[1.02] transition-all w-full"
                  : "w-full"
            }
          >
            <PortfolioItemCard
              item={item}
              onUpdate={onUpdate}
              onDelete={onDelete}
              onSelect={onSelectItem}
            />
          </div>
        );
      })}
    </div>
  );
}
