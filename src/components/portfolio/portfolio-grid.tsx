"use client";

import { useState, useCallback } from "react";
import type { PortfolioItem } from "@/lib/validations/talent-profile.schema";
import { PortfolioItemCard } from "./portfolio-item-card";

interface PortfolioGridProps {
  items: PortfolioItem[];
  onUpdate: (id: string, dto: { caption?: string; category?: "work" | "personal" | "intro"; is_pinned?: boolean }) => void;
  onDelete: (id: string) => void;
  onReorder: (itemIds: string[]) => void;
}

export function PortfolioGrid({ items, onUpdate, onDelete, onReorder }: PortfolioGridProps) {
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);

  const handleDragStart = useCallback((id: string) => {
    setDraggedId(id);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent, id: string) => {
    e.preventDefault();
    if (id !== draggedId) {
      setDragOverId(id);
    }
  }, [draggedId]);

  const handleDrop = useCallback((e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    setDragOverId(null);

    if (!draggedId || draggedId === targetId) {
      setDraggedId(null);
      return;
    }

    const newOrder = [...items];
    const draggedIndex = newOrder.findIndex((i) => i.id === draggedId);
    const targetIndex = newOrder.findIndex((i) => i.id === targetId);

    if (draggedIndex === -1 || targetIndex === -1) {
      setDraggedId(null);
      return;
    }

    const [removed] = newOrder.splice(draggedIndex, 1);
    newOrder.splice(targetIndex, 0, removed);

    onReorder(newOrder.map((i) => i.id));
    setDraggedId(null);
  }, [draggedId, items, onReorder]);

  const handleDragEnd = useCallback(() => {
    setDraggedId(null);
    setDragOverId(null);
  }, []);

  if (items.length === 0) {
    return (
      <div className="text-center py-12 text-text-muted text-sm">
        No media yet. Upload your first image or video above.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
      {items.map((item, index) => (
        <div
          key={item.id || `item-${index}`}
          draggable
          onDragStart={() => handleDragStart(item.id)}
          onDragOver={(e) => handleDragOver(e, item.id)}
          onDrop={(e) => handleDrop(e, item.id)}
          onDragEnd={handleDragEnd}
          className={dragOverId === item.id && draggedId !== item.id ? "opacity-50 w-full" : "w-full"}
        >
          <PortfolioItemCard
            item={item}
            onUpdate={onUpdate}
            onDelete={onDelete}
            dragHandleProps={{
              onMouseDown: (e) => e.stopPropagation(),
            }}
          />
        </div>
      ))}
    </div>
  );
}
