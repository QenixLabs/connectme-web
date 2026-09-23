"use client";

/* eslint-disable @next/next/no-img-element */

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  DndContext,
  PointerSensor,
  TouchSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import { SortableContext, arrayMove, rectSortingStrategy, verticalListSortingStrategy, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { ArrowLeft, Check, ChevronDown, ChevronUp, GripVertical, Image as ImageIcon, Loader2, MoreVertical, Play, Plus, Search, Video } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useMyPortfolioCollection, useUpdateProfileShowcase } from "@/hooks/use-portfolio";
import { useMyProfile } from "@/hooks/use-talent-profile";
import type { PortfolioApiResponse } from "@/lib/api/talent";
import { cn } from "@/lib/utils";

type PickerKind = "showreel" | "video" | "image";

const MAX = { showreel: 1, video: 3, image: 4 } as const;
const VIDEO_SLOT_LABELS = ["Choose first video", "Choose second video", "Choose third video"] as const;
const POSITION_LABEL_CLASS = "rounded bg-black/45 px-1.5 py-0.5 text-[10px] font-bold text-white";

function mediaLabel(item: PortfolioApiResponse) {
  if (item.type === "youtube") return "YouTube";
  if (item.type === "video") return "MP4";
  return item.type.toUpperCase();
}

function fileSize(size?: number) {
  if (!size) return "";
  if (size < 1024 * 1024) return `${Math.max(1, Math.round(size / 1024))} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

function durationLabel(seconds?: number) {
  if (!seconds || seconds <= 0) return "";
  return `${Math.floor(seconds / 60)}:${String(Math.floor(seconds % 60)).padStart(2, "0")}`;
}

function Thumb({ item, className }: { item: PortfolioApiResponse; className?: string }) {
  return (
    <div className={cn("relative overflow-hidden rounded-lg bg-muted", className)}>
      <img src={item.thumbnail_url || item.url} alt="" className="h-full w-full object-cover" />
      {(item.type === "video" || item.type === "youtube") && <span className="absolute inset-0 grid place-items-center"><span className="grid size-8 place-items-center rounded-full bg-foreground/55 text-card"><Play className="size-3.5 fill-current" /></span></span>}
    </div>
  );
}

function SortableMediaRow({
  item,
  index,
  onMove,
  onReplace,
  onRemove,
}: {
  item: PortfolioApiResponse;
  index: number;
  onMove: (direction: "up" | "down") => void;
  onReplace: () => void;
  onRemove: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: item.id });
  return (
    <div ref={setNodeRef} style={{ transform: CSS.Transform.toString(transform), transition }} className={cn("grid min-h-[68px] grid-cols-[auto_auto_52px_minmax(0,1fr)_auto] items-center gap-2 border-b border-border/70 px-1", isDragging && "z-10 rounded-lg bg-card shadow-lg ring-1 ring-primary/20") }>
      <button type="button" className="grid size-8 touch-none place-items-center rounded-md text-muted-foreground hover:bg-accent" aria-label={`Drag ${item.title}`} {...attributes} {...listeners}><GripVertical className="size-5" /></button>
      <span className={cn(POSITION_LABEL_CLASS, "w-7 text-center")}>{String(index + 1).padStart(2, "0")}</span>
      <Thumb item={item} className="aspect-[4/3] w-[52px]" />
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold">{item.title || item.caption || "Untitled work"}</p>
        <p className="mt-0.5 truncate text-xs text-muted-foreground">{mediaLabel(item)}{durationLabel(item.duration) ? ` • ${durationLabel(item.duration)}` : ""}{fileSize(item.file_size) ? ` • ${fileSize(item.file_size)}` : ""}</p>
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild><button className="grid size-8 place-items-center rounded-md text-muted-foreground hover:bg-accent" aria-label="Showcase item actions"><MoreVertical className="size-4" /></button></DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => onMove("up")}><ChevronUp className="size-4" /> Move Up</DropdownMenuItem>
          <DropdownMenuItem onClick={() => onMove("down")}><ChevronDown className="size-4" /> Move Down</DropdownMenuItem>
          <DropdownMenuItem onClick={onReplace}>Replace</DropdownMenuItem>
          <DropdownMenuItem onClick={onRemove}>Remove From Profile</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

function PhotoCard({ item, index, onMove, onReplace, onRemove }: { item: PortfolioApiResponse; index: number; onMove: (direction: "up" | "down") => void; onReplace: () => void; onRemove: () => void }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: item.id });
  return (
    <div ref={setNodeRef} style={{ transform: CSS.Transform.toString(transform), transition }} className={cn("group relative aspect-[4/3] overflow-hidden rounded-lg bg-muted", isDragging && "z-10 scale-[1.02] shadow-lg ring-1 ring-primary/30")}>
      <Thumb item={item} className="aspect-[4/3] w-full rounded-none" />
      <span className={cn("absolute left-2 top-2", POSITION_LABEL_CLASS)}>{String(index + 1).padStart(2, "0")}</span>
      <button type="button" className="absolute bottom-2 left-2 grid size-7 touch-none place-items-center rounded-md bg-black/45 text-white backdrop-blur-sm" aria-label={`Drag ${item.title}`} {...attributes} {...listeners}><GripVertical className="size-3.5" /></button>
      <DropdownMenu>
        <DropdownMenuTrigger asChild><button className="absolute bottom-2 right-2 grid size-7 place-items-center rounded-md bg-black/45 text-white backdrop-blur-sm" aria-label="Photo actions"><MoreVertical className="size-3.5" /></button></DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => onMove("up")}><ChevronUp className="size-4" /> Move Up</DropdownMenuItem>
          <DropdownMenuItem onClick={() => onMove("down")}><ChevronDown className="size-4" /> Move Down</DropdownMenuItem>
          <DropdownMenuItem onClick={onReplace}>Replace</DropdownMenuItem>
          <DropdownMenuItem onClick={onRemove}>Remove From Profile</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

function Picker({
  kind,
  items,
  selectedIds,
  showreelId,
  replaceId,
  onSelect,
  onClose,
}: {
  kind: PickerKind | null;
  items: PortfolioApiResponse[];
  selectedIds: string[];
  showreelId: string | null;
  replaceId: string | null;
  onSelect: (id: string) => void;
  onClose: () => void;
}) {
  const [search, setSearch] = useState("");
  const [pendingId, setPendingId] = useState<string | null>(null);
  const eligible = useMemo(() => items
    .filter((item) => kind === "image" ? item.type === "image" : item.type === "video" || item.type === "youtube")
    .filter((item) => kind !== "video" || item.id !== showreelId)
    .filter((item) => !selectedIds.includes(item.id) || item.id === replaceId)
    .filter((item) => `${item.title} ${item.caption || ""}`.toLowerCase().includes(search.toLowerCase())), [items, kind, search, selectedIds, showreelId, replaceId]);
  return (
    <Sheet open={!!kind} onOpenChange={(open) => !open && onClose()}>
      <SheetContent side="bottom" className="flex max-h-[88dvh] flex-col gap-4 overflow-hidden rounded-t-2xl p-4 sm:inset-y-0 sm:right-0 sm:left-auto sm:bottom-auto sm:h-full sm:w-3/4 sm:max-w-xl sm:rounded-none sm:border-l sm:border-t-0 sm:p-6">
        <SheetHeader className="px-0 text-left"><SheetTitle>Choose {kind === "image" ? "Photo" : kind === "showreel" ? "Showreel" : "Video"} From Library</SheetTitle><SheetDescription>Only eligible media from your library is shown.</SheetDescription></SheetHeader>
        <div className="relative"><Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" /><Input autoFocus value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search your library" className="pl-9" /></div>
         <div className="min-h-0 flex-1 overflow-y-auto">
           <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
           {eligible.map((item) => {
             const selected = selectedIds.includes(item.id);
             return <button type="button" key={item.id} onClick={() => setPendingId(item.id)} className={cn("overflow-hidden rounded-lg border text-left transition-colors hover:border-primary/50", (selected || pendingId === item.id) && "border-primary bg-primary/5 ring-1 ring-primary/20")}>
               <div className="relative"><Thumb item={item} className="aspect-[4/3] w-full rounded-none" />{(selected || pendingId === item.id) && <span className="absolute right-2 top-2 grid size-5 place-items-center rounded-full bg-primary text-primary-foreground"><Check className="size-3" /></span>}</div>
               <span className="block min-w-0 p-2"><span className="block truncate text-xs font-semibold">{item.title || item.caption || "Untitled work"}</span><span className="mt-0.5 block truncate text-[10px] text-muted-foreground">{mediaLabel(item)}{durationLabel(item.duration) ? ` • ${durationLabel(item.duration)}` : ""}{fileSize(item.file_size) ? ` • ${fileSize(item.file_size)}` : ""}</span></span>
             </button>;
            })}
           </div>
            {eligible.length === 0 && <p className="py-10 text-center text-sm text-muted-foreground">No eligible media found.</p>}
         </div>
        <div className="border-t border-border pt-3"><Button type="button" className="w-full" disabled={!pendingId} onClick={() => { if (pendingId) onSelect(pendingId); }}>Confirm Selection</Button></div>
      </SheetContent>
    </Sheet>
  );
}

export function ShowcaseManagerPage() {
  const collection = useMyPortfolioCollection();
  const profileQuery = useMyProfile();
  const saveShowcase = useUpdateProfileShowcase();
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 250, tolerance: 5 } }),
  );
  const [showreel, setShowreel] = useState<string | null>(null);
  const [videos, setVideos] = useState<string[]>([]);
  const [photos, setPhotos] = useState<string[]>([]);
  const [picker, setPicker] = useState<PickerKind | null>(null);
  const [replaceId, setReplaceId] = useState<string | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const [dirty, setDirty] = useState(false);

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    if (!collection.data || hydrated) return;
    const saved = collection.data.profile_highlights;
    setShowreel(saved?.showreel_id || null);
    setVideos(saved?.video_ids || []);
    setPhotos(saved?.image_ids || []);
    setHydrated(true);
  }, [collection.data, hydrated]);
  /* eslint-enable react-hooks/set-state-in-effect */

  const items = useMemo(() => collection.data?.items || [], [collection.data?.items]);
  const byId = useMemo(() => new Map(items.map((item) => [item.id, item])), [items]);
  const selectedCount = (showreel ? 1 : 0) + videos.length + photos.length;

  const updateOrder = (kind: "video" | "image", event: DragEndEvent) => {
    if (!event.over || event.active.id === event.over.id) return;
    const current = kind === "video" ? videos : photos;
    const next = arrayMove(current, current.indexOf(String(event.active.id)), current.indexOf(String(event.over.id)));
    if (kind === "video") setVideos(next);
    else setPhotos(next);
    setDirty(true);
  };

  const openPicker = (kind: PickerKind, target?: string) => {
    setReplaceId(target || null);
    setPicker(kind);
  };

  const persistShowcase = async (
    nextShowreel: string | null,
    nextVideos: string[],
    nextPhotos: string[],
  ) => {
    try {
      await saveShowcase.mutateAsync({
        showreel_id: nextShowreel,
        video_ids: nextVideos,
        image_ids: nextPhotos,
      });
      setDirty(false);
      toast.success("Profile showcase saved");
    } catch (error) {
      setDirty(true);
      const message = (error as { response?: { data?: { message?: string } } }).response?.data?.message;
      toast.error(message || "Could not save your showcase");
    }
  };

  const choose = (id: string) => {
    if (!picker) return;
    if (replaceId) {
      const nextShowreel = picker === "showreel" ? id : showreel;
      const nextVideos = picker === "showreel"
        ? videos.filter((value) => value !== id)
        : picker === "video"
          ? videos.map((value) => value === replaceId ? id : value)
          : videos;
      const nextPhotos = picker === "image" ? photos.map((value) => value === replaceId ? id : value) : photos;
      setShowreel(nextShowreel);
      setVideos(nextVideos);
      setPhotos(nextPhotos);
      setDirty(true);
      setPicker(null);
      setReplaceId(null);
       return;
    }
    if (picker === "showreel") {
      setShowreel(id);
      setDirty(true);
      setPicker(null);
       const nextVideos = videos.filter((value) => value !== id);
       setVideos(nextVideos);
       if (nextVideos.length !== videos.length) toast.info("Showreel removed from Featured Videos");
    } else if (picker === "video" && !videos.includes(id)) {
      if (videos.length >= MAX.video) {
        toast.info("Your 3 featured video slots are full. Use Replace on a selected video.");
        return;
      }
      const nextVideos = [...videos, id];
      setVideos(nextVideos);
      setDirty(true);
      setPicker(null);
    } else if (picker === "image" && !photos.includes(id)) {
      if (photos.length >= MAX.image) {
        toast.info("Your 4 featured photo slots are full. Use Replace on a selected photo.");
        return;
      }
      const nextPhotos = [...photos, id];
      setPhotos(nextPhotos);
      setDirty(true);
      setPicker(null);
    } else {
      setPicker(null);
    }
  };

  const move = (kind: "video" | "image", id: string, direction: "up" | "down") => {
    const current = kind === "video" ? videos : photos;
    const index = current.indexOf(id);
    const nextIndex = direction === "up" ? index - 1 : index + 1;
    if (index < 0 || nextIndex < 0 || nextIndex >= current.length) return;
    const next = arrayMove(current, index, nextIndex);
    if (kind === "video") setVideos(next);
    else setPhotos(next);
    setDirty(true);
  };

  const remove = (kind: "video" | "image", id: string) => {
    if (kind === "video") setVideos((current) => current.filter((value) => value !== id));
    else setPhotos((current) => current.filter((value) => value !== id));
    setDirty(true);
  };

  const save = async () => {
    await persistShowcase(showreel, videos, photos);
  };

  const showreelItem = showreel ? byId.get(showreel) : undefined;
  if (collection.isLoading) return <div className="mx-auto max-w-4xl space-y-4 px-4 py-6"><Skeleton className="h-24 rounded-2xl" /><Skeleton className="h-52 rounded-2xl" /><Skeleton className="h-64 rounded-2xl" /></div>;

  return (
     <div className="mx-auto w-full max-w-4xl px-4 pb-[calc(9rem+env(safe-area-inset-bottom))] pt-4 sm:px-6 lg:pb-12">
       <div className="mb-5 border-b border-border/70 pb-4">
         <div className="flex items-start justify-between gap-4">
           <div><Link href="/talent/portfolio" className="mb-3 inline-flex items-center gap-1 text-xs font-semibold text-muted-foreground hover:text-foreground"><ArrowLeft className="size-3.5" /> Media Library</Link><h1 className="text-[26px] font-bold leading-none tracking-tight">Profile Showcase</h1><p className="mt-2 text-[13px] text-muted-foreground">Arrange what recruiters see first.</p></div>
           <button type="button" onClick={() => setPreviewOpen(true)} className="mt-7 shrink-0 text-xs font-semibold text-primary hover:underline">Preview Profile <span aria-hidden="true">→</span></button>
         </div>
         <div className="mt-4 flex items-center gap-3"><div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted"><div className="h-full rounded-full bg-primary transition-all" style={{ width: `${(selectedCount / 8) * 100}%` }} /></div><span className="shrink-0 text-[11px] font-semibold text-muted-foreground">{selectedCount} of 8 selected</span></div>
       </div>

       <div className="space-y-7">
         <section>
             <div className="mb-2 flex items-center justify-between"><h2 className="text-[13px] font-bold uppercase tracking-[0.12em]">Showreel <span className="ml-1 text-muted-foreground">{showreel ? "1 / 1" : "0 / 1"}</span></h2></div>
              {showreelItem ? <div className="relative aspect-video overflow-hidden rounded-xl border border-border bg-card"><Thumb item={showreelItem} className="h-full w-full rounded-none" /><div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 bg-gradient-to-t from-black/80 via-black/35 to-transparent px-3 pb-3 pt-12 text-white"><div className="min-w-0"><p className="truncate text-sm font-semibold">{showreelItem.title || showreelItem.caption || "Untitled work"}</p><p className="mt-0.5 text-[11px] text-white/75">{durationLabel(showreelItem.duration) || "Showreel"} · {mediaLabel(showreelItem)}</p></div><DropdownMenu><DropdownMenuTrigger asChild><button className="grid size-7 place-items-center rounded-md text-white/85 hover:bg-white/15" aria-label="Showreel actions"><MoreVertical className="size-4" /></button></DropdownMenuTrigger><DropdownMenuContent align="end"><DropdownMenuItem onClick={() => openPicker("showreel", showreelItem.id)}>Replace</DropdownMenuItem><DropdownMenuItem onClick={() => { setShowreel(null); setDirty(true); }}>Remove from Profile</DropdownMenuItem></DropdownMenuContent></DropdownMenu></div></div> : <button type="button" onClick={() => openPicker("showreel")} className="flex min-h-14 w-full items-center justify-center gap-2 rounded-lg border border-dashed border-border text-sm font-semibold text-primary hover:bg-accent"><Plus className="size-4" /> Choose Showreel From Library</button>}
          </section>

         <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={(event) => updateOrder("video", event)}>
              <section><div className="mb-2 flex items-end justify-between"><div><h2 className="text-[13px] font-bold uppercase tracking-[0.12em]">Featured Videos <span className="ml-1 text-muted-foreground">{videos.length} / 3</span></h2><p className="mt-1 text-xs text-muted-foreground">Drag to set public profile order</p></div><Video className="size-4 text-primary" /></div><div><SortableContext items={videos} strategy={verticalListSortingStrategy}>{videos.map((id, index) => { const item = byId.get(id); return item ? <SortableMediaRow key={id} item={item} index={index} onMove={(direction) => move("video", id, direction)} onReplace={() => openPicker("video", id)} onRemove={() => remove("video", id)} /> : null; })}</SortableContext>{(videos.length === 0 ? VIDEO_SLOT_LABELS : VIDEO_SLOT_LABELS.slice(videos.length)).map((label, index) => { const position = videos.length === 0 ? index : videos.length + index; return <button type="button" key={`empty-video-${position}`} onClick={() => openPicker("video")} className="flex min-h-[52px] w-full items-center gap-3 border-b border-border/70 text-left last:border-0 hover:bg-accent/50"><span className={cn(POSITION_LABEL_CLASS, "ml-1 w-7 text-center")}>{String(position + 1).padStart(2, "0")}</span><Plus className="size-3.5 text-muted-foreground" /><span className="text-xs font-semibold text-muted-foreground">{label}</span></button>; })}</div></section>
         </DndContext>

         <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={(event) => updateOrder("image", event)}>
             <section><div className="mb-2 flex items-end justify-between"><div><h2 className="text-[13px] font-bold uppercase tracking-[0.12em]">Featured Photos <span className="ml-1 text-muted-foreground">{photos.length} / 4</span></h2><p className="mt-1 text-xs text-muted-foreground">Drag to arrange public profile order</p></div><ImageIcon className="size-4 text-primary" /></div><div className="grid grid-cols-2 gap-2"><SortableContext items={photos} strategy={rectSortingStrategy}>{photos.map((id, index) => { const item = byId.get(id); return item ? <PhotoCard key={id} item={item} index={index} onMove={(direction) => move("image", id, direction)} onReplace={() => openPicker("image", id)} onRemove={() => remove("image", id)} /> : null; })}{Array.from({ length: MAX.image - photos.length }).map((_, index) => <button type="button" key={`empty-photo-${index}`} onClick={() => openPicker("image")} className="flex aspect-[4/3] flex-col items-center justify-center gap-1 rounded-lg border border-dashed border-border text-xs font-semibold text-primary hover:bg-accent"><span className={POSITION_LABEL_CLASS}>{String(photos.length + index + 1).padStart(2, "0")}</span><Plus className="size-4" /><span>Add Photo</span></button>)}</SortableContext></div></section>
         </DndContext>
      </div>

         {dirty && <div className="fixed inset-x-0 bottom-[calc(4rem+env(safe-area-inset-bottom))] z-40 border-t border-border bg-background/95 p-3 shadow-lg backdrop-blur sm:static sm:mt-5 sm:border-0 sm:bg-transparent sm:p-0"><div className="mx-auto flex max-w-4xl items-center justify-between gap-3"><span className="hidden text-xs text-muted-foreground sm:block">Changes are private until you save.</span><Button onClick={save} disabled={saveShowcase.isPending} className="ml-auto min-h-11 w-full sm:w-auto">{saveShowcase.isPending ? <Loader2 className="size-4 animate-spin" /> : <Check className="size-4" />} Save Showcase</Button></div></div>}
        <Sheet open={previewOpen} onOpenChange={setPreviewOpen}>
          <SheetContent side="bottom" className="max-h-[92dvh] overflow-y-auto rounded-t-2xl p-4 sm:mx-auto sm:max-w-2xl sm:p-6">
            <SheetHeader className="px-0 text-left"><SheetTitle>Portfolio Highlights</SheetTitle><SheetDescription>This is the order visitors will see on your profile.</SheetDescription></SheetHeader>
            <div className="mt-5 space-y-6">
              <section><h3 className="mb-2 text-xs font-bold uppercase tracking-[0.12em]">Showreel</h3>{showreelItem ? <Thumb item={showreelItem} className="aspect-video w-full" /> : <div className="grid aspect-video place-items-center rounded-lg border border-dashed border-border text-xs text-muted-foreground">No showreel selected</div>}</section>
              <section><h3 className="mb-2 text-xs font-bold uppercase tracking-[0.12em]">Featured Videos</h3><div className="grid grid-cols-3 gap-2">{videos.map((id, index) => { const item = byId.get(id); return item ? <div key={id} className="min-w-0"><Thumb item={item} className="aspect-video w-full" /><p className="mt-1 truncate text-[10px] font-semibold">{String(index + 1).padStart(2, "0")} · {item.title || "Untitled"}</p></div> : null; })}</div></section>
              <section><h3 className="mb-2 text-xs font-bold uppercase tracking-[0.12em]">Featured Photos</h3><div className="grid grid-cols-2 gap-2">{photos.map((id, index) => { const item = byId.get(id); return item ? <div key={id} className="relative"><Thumb item={item} className="aspect-[4/3] w-full" /><span className="absolute left-2 top-2 rounded bg-background/85 px-1.5 py-0.5 text-[10px] font-bold">{String(index + 1).padStart(2, "0")}</span></div> : null; })}</div></section>
              <Link href={profileQuery.data?.username ? `/talent/${profileQuery.data.username}` : "/talent/profile"} className="block text-center text-sm font-semibold text-primary hover:underline">View Full Portfolio →</Link>
            </div>
          </SheetContent>
        </Sheet>
        <Picker key={picker ?? "closed"} kind={picker} items={items} selectedIds={[showreel, ...videos, ...photos].filter((id): id is string => !!id)} showreelId={showreel} replaceId={replaceId} onSelect={choose} onClose={() => { setPicker(null); setReplaceId(null); }} />
    </div>
  );
}
