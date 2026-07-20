"use client";

import { useMemo, useState } from "react";
import {
  DndContext,
  DragOverlay,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  useDroppable,
  useDraggable,
} from "@dnd-kit/core";
import type { DragStartEvent, DragEndEvent } from "@dnd-kit/core";
import { GripVertical, Check, BookmarkCheck, Bookmark, Star, CheckCircle2, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { EnrichedApplication } from "../campaign-application-card";
import { ApplicantKanbanCard } from "./ApplicantKanbanCard";

interface ColumnDef {
  id: string;
  label: string;
  color: string;
  bgColor: string;
  applications: EnrichedApplication[];
}

interface ApplicantPipelineViewProps {
  columns: ColumnDef[];
  onDragEnd: (appId: string, fromColumn: string, toColumn: string) => void;
  onViewProfile: (app: EnrichedApplication) => void;
  onViewPreview: (app: EnrichedApplication) => void;
  onStatusChange: (appId: string, status: string) => void;
  onToggleShortlist: (appId: string) => void;
  selectable?: boolean;
  selectedIds?: Set<string>;
  onToggleSelect?: (appId: string) => void;
  viewMode?: "grid" | "list";
}

function DroppableColumn({
  id,
  label,
  color,
  bgColor,
  count,
  children,
  viewMode,
}: {
  id: string;
  label: string;
  color: string;
  bgColor: string;
  count: number;
  children: React.ReactNode;
  viewMode: "grid" | "list";
}) {
  const { setNodeRef, isOver } = useDroppable({ id });

  return (
    <div
      ref={setNodeRef}
      className={cn(
        viewMode === "list" ? "flex flex-col w-full min-w-[320px] shrink-0" : "flex flex-col w-[280px] shrink-0",
        "rounded-2xl border shadow-luxe transition-all duration-200 bg-card",
        isOver
          ? "border-brand ring-1 ring-brand/30 scale-[1.02] shadow-luxe-lg"
          : "border-border/60",
      )}
    >
      <div className="shrink-0 px-3 pt-3 pb-2">
        <div className="flex items-center gap-2.5">
          <span
            className="w-1 h-5 rounded-full shrink-0"
            style={{ backgroundColor: color }}
          />
          <span className="text-sm font-semibold text-ink flex-1">
            {label}
          </span>
          <span
            className="text-xs font-bold px-2 py-0.5 rounded-full text-white min-w-[22px] text-center"
            style={{ backgroundColor: color }}
          >
            {count}
          </span>
        </div>
      </div>

      <div
        className="flex flex-col gap-2.5 p-2 flex-1 min-h-[180px]"
        style={count === 0 ? { backgroundColor: bgColor } : undefined}
      >
        {children}
        {count === 0 && (
          <div className="flex-1 flex flex-col items-center justify-center rounded-xl border border-dashed border-border/30 m-1 gap-1.5">
            <span className="text-[10px] font-medium text-ink-muted/40 uppercase tracking-wider">
              Drop here
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

function ApplicantListRow({
  application,
  columnId,
  onViewProfile,
  onViewPreview,
  onStatusChange,
  onToggleShortlist,
  selectable,
  isSelected,
  onToggleSelect,
}: {
  application: EnrichedApplication;
  columnId: string;
  onViewProfile: () => void;
  onViewPreview: () => void;
  onStatusChange: (status: string) => void;
  onToggleShortlist: () => void;
  selectable?: boolean;
  isSelected?: boolean;
  onToggleSelect?: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: application._id,
      data: { application, fromColumn: columnId },
    });

  const style = transform
    ? { transform: `translate(${transform.x}px, ${transform.y}px)` }
    : undefined;

  const talent =
    typeof application.talent_id === "object" && application.talent_id !== null
      ? application.talent_id
      : null;

  const profile = application.talent_profile;
  const displayName = talent?.full_legal_name || talent?.email || "Unknown";
  const profilePhoto = profile?.profile_photo;
  const professions = profile?.professions || [];
  const primaryProfession = professions[0] ?? "";
  const isVerified = profile?.is_verified ?? false;
  const hasNote = application.note && (application.note.note_text || (application.note.rating && application.note.rating > 0));

  function getInitials(name: string): string {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  }

  function getGradient(name: string): string {
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    hash = Math.abs(hash);
    const hues = [
      [25, 45], [35, 55], [200, 220], [150, 170],
      [280, 300], [10, 25], [180, 200], [320, 340],
    ];
    const pair = hues[hash % hues.length];
    const h1 = pair[0] + (hash % 15);
    const h2 = pair[1] + (hash % 15);
    return `linear-gradient(135deg, hsl(${h1}, 35%, 65%), hsl(${h2}, 40%, 45%))`;
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "group flex items-center gap-2 px-2.5 py-2 rounded-lg border bg-card transition-all duration-200 cursor-pointer",
        isDragging
          ? "opacity-50 shadow-lg z-50"
          : "hover:border-border hover:bg-cream-pale/50",
        isSelected && "border-brand ring-1 ring-brand",
      )}
      onClick={() => onViewPreview()}
    >
      <div
        {...attributes}
        {...listeners}
        className={cn(
          "w-5 h-5 flex items-center justify-center rounded transition-opacity cursor-grab shrink-0",
          isDragging ? "opacity-100" : "opacity-0 group-hover:opacity-100",
        )}
      >
        <GripVertical className="w-3 h-3 text-ink-muted" strokeWidth={1.5} />
      </div>

      {selectable && (
        <input
          type="checkbox"
          checked={isSelected}
          onChange={(e) => {
            e.stopPropagation();
            onToggleSelect?.();
          }}
          className="w-3.5 h-3.5 rounded border-border/60 text-brand focus:ring-brand shrink-0"
        />
      )}

      <div
        className="w-8 h-8 rounded-full overflow-hidden shrink-0"
        style={profilePhoto ? undefined : { background: getGradient(displayName) }}
      >
        {profilePhoto ? (
          <img
            src={profilePhoto}
            alt={displayName}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-[10px] font-bold text-white/80">
            {getInitials(displayName)}
          </div>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1">
          <span className="text-xs font-semibold text-text-primary truncate">
            {displayName}
          </span>
          {isVerified && (
            <span className="inline-flex items-center justify-center w-2.5 h-2.5 rounded-full bg-campaign shrink-0">
              <Check className="w-1.5 h-1.5 text-white" strokeWidth={2.5} />
            </span>
          )}
        </div>
        <p className="text-[10px] text-text-muted truncate mt-0.5">
          {primaryProfession}
        </p>
      </div>

      <div className="flex items-center gap-1.5 shrink-0">
        {hasNote && (
          <Star className="w-3 h-3 fill-amber-400 text-amber-400 shrink-0" strokeWidth={0} />
        )}
        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-brand/10 text-brand shrink-0">
          {application.match_score}%
        </span>
        <button
          onClick={(e) => { e.stopPropagation(); onToggleShortlist(); }}
          className={cn(
            "p-1 rounded-md text-[10px] font-medium transition-colors",
            application.is_shortlisted
              ? "text-amber-600 bg-amber-50 hover:bg-amber-100"
              : "text-ink-muted hover:bg-muted-bg",
          )}
        >
          {application.is_shortlisted ? (
            <BookmarkCheck className="w-3.5 h-3.5" strokeWidth={1.5} />
          ) : (
            <Bookmark className="w-3.5 h-3.5" strokeWidth={1.5} />
          )}
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); onViewProfile(); }}
          className="px-2 py-1 rounded-md text-[10px] font-medium text-ink-muted hover:bg-muted-bg transition-colors"
        >
          Profile
        </button>
        {application.status !== "accepted" && (
          <button
            onClick={(e) => { e.stopPropagation(); onStatusChange("accepted"); }}
            className="p-1 rounded-md text-emerald-600 hover:bg-emerald-50 transition-colors"
          >
            <CheckCircle2 className="w-3.5 h-3.5" strokeWidth={1.5} />
          </button>
        )}
        {application.status !== "rejected" && (
          <button
            onClick={(e) => { e.stopPropagation(); onStatusChange("rejected"); }}
            className="p-1 rounded-md text-rose-600 hover:bg-rose-50 transition-colors"
          >
            <XCircle className="w-3.5 h-3.5" strokeWidth={1.5} />
          </button>
        )}
      </div>
    </div>
  );
}

export function ApplicantPipelineView({
  columns,
  onDragEnd,
  onViewProfile,
  onViewPreview,
  onStatusChange,
  onToggleShortlist,
  selectable,
  selectedIds,
  onToggleSelect,
  viewMode = "grid",
}: ApplicantPipelineViewProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    }),
    useSensor(KeyboardSensor),
  );

  const [activeDragApp, setActiveDragApp] = useState<EnrichedApplication | null>(null);

  const columnApps = useMemo(() => {
    const map = new Map<string, EnrichedApplication>();
    columns.forEach((col) => {
      col.applications.forEach((app) => map.set(app._id, app));
    });
    return map;
  }, [columns]);

  const handleDragStart = (event: DragStartEvent) => {
    const app = columnApps.get(event.active.id as string);
    setActiveDragApp(app || null);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveDragApp(null);
    const { active, over } = event;
    if (!over) return;

    const appId = active.id as string;
    const fromColumn = active.data.current?.fromColumn as string;

    let toColumn = over.id as string;

    if (!columns.find((c) => c.id === toColumn)) {
      const app = columnApps.get(toColumn);
      if (app) {
        if (app.is_shortlisted) {
          toColumn = "column-shortlisted";
        } else if (app.status === "accepted") {
          toColumn = "column-accepted";
        } else if (app.status === "rejected") {
          toColumn = "column-rejected";
        } else {
          toColumn = "column-pending";
        }
      }
    }

    if (fromColumn && toColumn && fromColumn !== toColumn) {
      onDragEnd(appId, fromColumn, toColumn);
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-4 pb-4 overflow-x-auto">
        {columns.map((col) => (
          <DroppableColumn
            key={col.id}
            id={col.id}
            label={col.label}
            color={col.color}
            bgColor={col.bgColor}
            count={col.applications.length}
            viewMode={viewMode}
          >
            {col.applications.map((app) =>
                viewMode === "grid" ? (
                  <ApplicantKanbanCard
                    key={app._id}
                    application={app}
                    columnId={col.id}
                    onViewProfile={() => onViewProfile(app)}
                    onViewPreview={() => onViewPreview(app)}
                    onStatusChange={(status) => onStatusChange(app._id, status)}
                    onToggleShortlist={() => onToggleShortlist(app._id)}
                    selectable={selectable}
                    isSelected={selectedIds?.has(app._id)}
                    onToggleSelect={() => onToggleSelect?.(app._id)}
                  />
                ) : (
                  <ApplicantListRow
                    key={app._id}
                    application={app}
                    columnId={col.id}
                    onViewProfile={() => onViewProfile(app)}
                    onViewPreview={() => onViewPreview(app)}
                    onStatusChange={(status) => onStatusChange(app._id, status)}
                    onToggleShortlist={() => onToggleShortlist(app._id)}
                    selectable={selectable}
                    isSelected={selectedIds?.has(app._id)}
                    onToggleSelect={() => onToggleSelect?.(app._id)}
                  />
                ),
            )}
          </DroppableColumn>
        ))}
      </div>

      <DragOverlay>
        {activeDragApp ? (
          viewMode === "grid" ? (
            <div className="w-[260px] rounded-xl overflow-hidden shadow-2xl border-2 border-brand ring-4 ring-brand/20 rotate-2">
              <DragOverlayContent app={activeDragApp} />
            </div>
          ) : (
            <div className="min-w-[320px] px-2.5 py-2 rounded-lg border-2 border-brand bg-card shadow-2xl ring-4 ring-brand/20 rotate-2">
              <DragOverlayListContent app={activeDragApp} />
            </div>
          )
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}

function DragOverlayContent({ app }: { app: EnrichedApplication }) {
  const talent =
    typeof app.talent_id === "object" && app.talent_id !== null
      ? app.talent_id
      : null;
  const displayName = talent?.full_legal_name || talent?.email || "Unknown";
  const profilePhoto = app.talent_profile?.profile_photo;

  return (
    <div className="aspect-[3/4] bg-card flex items-center justify-center overflow-hidden">
      {profilePhoto ? (
        <img
          src={profilePhoto}
          alt={displayName}
          className="w-full h-full object-cover"
        />
      ) : (
        <div className="flex flex-col items-center gap-1">
          <span className="text-sm font-bold text-ink">{displayName}</span>
          <span className="text-xs font-semibold text-brand">
            {app.match_score}%
          </span>
        </div>
      )}
    </div>
  );
}

function DragOverlayListContent({ app }: { app: EnrichedApplication }) {
  const talent =
    typeof app.talent_id === "object" && app.talent_id !== null
      ? app.talent_id
      : null;
  const displayName = talent?.full_legal_name || talent?.email || "Unknown";
  const profile = app.talent_profile;
  const primaryProfession = profile?.professions?.[0] ?? "";

  return (
    <div className="flex items-center gap-2">
      <span className="w-1 h-5 rounded-full bg-brand shrink-0" />
      <span className="text-xs font-semibold text-ink truncate">{displayName}</span>
      <span className="text-[10px] text-ink-muted truncate">{primaryProfession}</span>
      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-brand/20 text-brand shrink-0 ml-auto">
        {app.match_score}%
      </span>
    </div>
  );
}
