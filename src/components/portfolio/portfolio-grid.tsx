"use client";

import { useState, useCallback } from "react";
import type { PortfolioItem } from "@/lib/validations/talent-profile.schema";
import { PortfolioItemCard } from "./portfolio-item-card";

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
}

export function PortfolioGrid({
  items,
  onUpdate,
  onDelete,
  onReorder,
}: PortfolioGridProps) {
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);

  /* ---- Desktop DnD ---- */
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

  /* ---- Touch DnD ---- */
  const [touchDraggedId, setTouchDraggedId] = useState<string | null>(null);
  const [touchOverId, setTouchOverId] = useState<string | null>(null);

  const handleTouchStart = useCallback(
    (e: React.TouchEvent, id: string) => {
      const target = e.target as HTMLElement;
      if (!target.closest("[data-drag-handle]")) return;
      setTouchDraggedId(id);
      setTouchOverId(null);
    },
    []
  );

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (!touchDraggedId) return;
      e.preventDefault();
      const touch = e.touches[0];

      // Temporarily disable pointer events on dragged element so elementFromPoint sees through it
      const draggedEl = document.querySelector(
        `[data-grid-item][data-item-id="${touchDraggedId}"]`
      ) as HTMLElement | null;
      if (draggedEl) draggedEl.style.pointerEvents = "none";

      const el = document.elementFromPoint(
        touch.clientX,
        touch.clientY
      ) as HTMLElement | null;

      if (draggedEl) draggedEl.style.pointerEvents = "";

      if (!el) return;
      const wrapper = el.closest("[data-grid-item]") as HTMLElement | null;
      if (wrapper) {
        const overId = wrapper.getAttribute("data-item-id");
        if (overId && overId !== touchDraggedId) setTouchOverId(overId);
      }
    },
    [touchDraggedId]
  );

  const handleTouchEnd = useCallback(() => {
    if (touchDraggedId && touchOverId && touchDraggedId !== touchOverId) {
      const newOrder = [...items];
      const draggedIndex = newOrder.findIndex((i) => i.id === touchDraggedId);
      const targetIndex = newOrder.findIndex((i) => i.id === touchOverId);
      if (draggedIndex !== -1 && targetIndex !== -1) {
        const [removed] = newOrder.splice(draggedIndex, 1);
        newOrder.splice(targetIndex, 0, removed);
        onReorder(newOrder.map((i) => i.id));
      }
    }
    setTouchDraggedId(null);
    setTouchOverId(null);
  }, [touchDraggedId, touchOverId, items, onReorder]);

  if (items.length === 0) {
    return (
      <div className="text-center py-12 text-text-muted text-sm">
        No media yet. Upload your first image or video above.
      </div>
    );
  }

  const activeDraggedId = draggedId || touchDraggedId;
  const activeOverId = dragOverId || touchOverId;

  return (
    <div
      className="grid grid-cols-2 sm:grid-cols-3 gap-3 select-none"
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {items.map((item) => {
        const isDragged = activeDraggedId === item.id;
        const isOver = activeOverId === item.id && !isDragged;

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
            onTouchStart={(e) => handleTouchStart(e, item.id)}
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
            />
          </div>
        );
      })}
    </div>
  );
}
