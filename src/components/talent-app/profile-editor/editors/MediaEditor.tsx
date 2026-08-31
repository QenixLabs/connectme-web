"use client";

import { useState } from "react";
import {
  ChevronUp,
  ChevronDown,
  Clapperboard,
  Film,
  Image as ImageIcon,
  Pencil,
  Plus,
  Star,
  Trash2,
  Upload,
} from "lucide-react";
import { EditorShell, AddAction } from "./EditorShell";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import type { Profile, MediaItem } from "../profile-types";

interface EditorProps {
  profile: Profile;
  onBack: () => void;
  onUpdate: (patch: Partial<Profile>) => void;
}

const uid = () => Math.random().toString(36).slice(2, 9);

const GROUPS: { key: MediaItem["kind"]; label: string; icon: React.ReactNode }[] = [
  { key: "showreel", label: "Showreel", icon: <Clapperboard className="size-4" /> },
  { key: "video", label: "Videos", icon: <Film className="size-4" /> },
  { key: "image", label: "Images", icon: <ImageIcon className="size-4" /> },
];

export function MediaEditor({ profile, onBack, onUpdate }: EditorProps) {
  const [editing, setEditing] = useState<MediaItem | null>(null);

  const startAdd = (kind: MediaItem["kind"]) => {
    setEditing({ id: "", name: "", kind, meta: "", featured: false });
  };

  const save = () => {
    if (!editing || !editing.name.trim()) return;
    const exists = profile.media.some((m) => m.id === editing.id);
    onUpdate({
      media: exists
        ? profile.media.map((m) => (m.id === editing.id ? editing : m))
        : [...profile.media, { ...editing, id: uid() }],
    });
    setEditing(null);
    toast.success(exists ? "Media updated" : "Media uploaded");
  };

  const remove = (id: string) => {
    onUpdate({ media: profile.media.filter((m) => m.id !== id) });
    toast.success("Media removed");
  };

  const move = (item: MediaItem, dir: -1 | 1) => {
    const next = [...profile.media];
    const i = next.findIndex((m) => m.id === item.id);
    const j = i + dir;
    if (j < 0 || j >= next.length) return;
    [next[i], next[j]] = [next[j]!, next[i]!];
    onUpdate({ media: next });
  };

  const toggleFeatured = (id: string) => {
    onUpdate({
      media: profile.media.map((m) =>
        m.id === id ? { ...m, featured: !m.featured } : m,
      ),
    });
  };

  return (
    <EditorShell
      title="Media"
      onBack={onBack}
      action={<AddAction onClick={() => startAdd("video")} label="Upload" />}
    >
      {GROUPS.map((g) => {
        const items = profile.media.filter((m) => m.kind === g.key);
        return (
          <div key={g.key} className="mb-6">
            <p className="mb-2 px-1 text-xs font-extrabold uppercase tracking-wide text-muted-foreground">
              {g.label}
            </p>
            {items.length === 0 ? (
              <div className="flex flex-col items-center rounded-2xl border border-dashed border-muted-foreground/25 px-6 py-8 text-center">
                <span className="grid size-10 place-items-center rounded-xl bg-primary/10 text-primary">
                  {g.icon}
                </span>
                <p className="mt-2 text-sm font-semibold">
                  No {g.label.toLowerCase()} yet
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Upload a file to show clients what you can do.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-3"
                  onClick={() => startAdd(g.key)}
                >
                  Upload {g.label}
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                {items.map((m) => (
                  <Card key={m.id}>
                    <CardContent className="flex items-center gap-3 py-3">
                      <div className="grid size-12 shrink-0 place-items-center rounded-xl bg-muted text-[10px] font-bold text-muted-foreground uppercase">
                        {m.kind === "image" ? "IMG" : "VID"}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-semibold">{m.name}</p>
                        <p className="text-sm text-muted-foreground">{m.meta}</p>
                        {m.featured ? (
                          <Badge variant="secondary" className="mt-1 text-xs">
                            Featured
                          </Badge>
                        ) : null}
                      </div>
                      <div className="flex shrink-0 flex-col items-center gap-0.5">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-7"
                          onClick={() => move(m, -1)}
                          aria-label="Move up"
                        >
                          <ChevronUp className="size-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-7"
                          onClick={() => move(m, 1)}
                          aria-label="Move down"
                        >
                          <ChevronDown className="size-3.5" />
                        </Button>
                      </div>
                      <div className="flex shrink-0 gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-7"
                          onClick={() => toggleFeatured(m.id)}
                          aria-label="Toggle featured"
                        >
                          <Star
                            className="size-3.5"
                            fill={m.featured ? "currentColor" : "none"}
                          />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-7"
                          onClick={() => setEditing({ ...m })}
                          aria-label="Edit"
                        >
                          <Pencil className="size-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-7 text-destructive"
                          onClick={() => remove(m.id)}
                          aria-label="Delete"
                        >
                          <Trash2 className="size-3.5" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        );
      })}

      <Sheet open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <SheetContent side="bottom" className="max-h-[85vh]">
          <SheetHeader>
            <SheetTitle>{editing?.id ? "Replace Media" : "Upload Media"}</SheetTitle>
          </SheetHeader>
          {editing && (
            <div className="space-y-4 px-4 py-4">
              <div className="grid place-items-center rounded-2xl border border-dashed border-primary/40 bg-primary/5 py-8 text-center">
                <Upload className="size-6 text-primary" />
                <p className="mt-2 text-sm font-semibold">Tap to choose a file</p>
                <p className="text-xs text-muted-foreground">
                  MP4, MOV, JPG or PNG up to 200 MB
                </p>
              </div>
              <div className="space-y-1.5">
                <Label>Display name</Label>
                <Input
                  value={editing.name}
                  onChange={(e) =>
                    setEditing({ ...editing, name: e.target.value })
                  }
                  placeholder="Main Showreel 2026"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Details</Label>
                <Input
                  value={editing.meta}
                  onChange={(e) =>
                    setEditing({ ...editing, meta: e.target.value })
                  }
                  placeholder="2:14 · MP4"
                />
              </div>
            </div>
          )}
          <SheetFooter>
            <Button variant="outline" onClick={() => setEditing(null)}>
              Cancel
            </Button>
            <Button onClick={save}>Save</Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </EditorShell>
  );
}
