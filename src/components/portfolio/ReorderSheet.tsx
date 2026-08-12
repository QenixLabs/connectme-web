"use client";

import { useState, useEffect } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Loader2 } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import type { PortfolioItem } from "@/lib/types/portfolio";

interface ReorderSheetProps {
  items: PortfolioItem[];
  open: boolean;
  onClose: () => void;
  onReorder: (orderedIds: string[]) => void;
  isSubmitting?: boolean;
}

function SortableItem({ item }: { item: PortfolioItem }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : undefined,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-3 rounded-xl border border-border bg-surface p-3 ${
        isDragging ? "opacity-80 shadow-lg" : ""
      }`}
    >
      <button
        type="button"
        className="touch-none text-muted-foreground"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="size-4" />
      </button>
      <span className="line-clamp-1 flex-1 text-sm font-medium text-foreground">
        {item.title}
      </span>
      <span className="text-xs capitalize text-muted-foreground">
        {item.type}
      </span>
    </div>
  );
}

export function ReorderSheet({
  items,
  open,
  onClose,
  onReorder,
  isSubmitting,
}: ReorderSheetProps) {
  const [ordered, setOrdered] = useState<PortfolioItem[]>(items);

  useEffect(() => {
    setOrdered(items);
  }, [items, open]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setOrdered((items) => {
        const oldIndex = items.findIndex((i) => i.id === active.id);
        const newIndex = items.findIndex((i) => i.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const handleSave = () => {
    onReorder(ordered.map((i) => i.id));
  };

  return (
    <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
      <SheetContent side="bottom" className="h-auto rounded-t-3xl border-border bg-card">
        <SheetHeader className="pb-2">
          <SheetTitle>Reorder Portfolio</SheetTitle>
        </SheetHeader>
        <div className="max-h-[60vh] overflow-y-auto py-4">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={ordered.map((i) => i.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-2">
                {ordered.map((item) => (
                  <SortableItem key={item.id} item={item} />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        </div>
        <SheetFooter className="flex-row gap-3">
          <Button variant="outline" className="flex-1" onClick={onClose}>
            Cancel
          </Button>
          <Button
            className="flex-1 bg-primary text-primary-foreground shadow-button hover:bg-primary/90"
            onClick={handleSave}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              "Save Order"
            )}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
