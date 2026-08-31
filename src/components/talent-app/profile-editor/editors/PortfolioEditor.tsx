"use client";

import { useState } from "react";
import {
  ChevronUp,
  ChevronDown,
  GripVertical,
  Pencil,
  Plus,
  Star,
  Trash2,
} from "lucide-react";
import { EditorShell, SaveAction, AddAction } from "./EditorShell";
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
import type { Profile, PortfolioProject } from "../profile-types";

interface EditorProps {
  profile: Profile;
  onBack: () => void;
  onUpdate: (patch: Partial<Profile>) => void;
}

const uid = () => Math.random().toString(36).slice(2, 9);

export function PortfolioEditor({ profile, onBack, onUpdate }: EditorProps) {
  const [editing, setEditing] = useState<PortfolioProject | null>(null);

  const startAdd = () => {
    setEditing({ id: "", title: "", subtitle: "", date: "", featured: false });
  };

  const startEdit = (p: PortfolioProject) => {
    setEditing({ ...p });
  };

  const save = () => {
    if (!editing || !editing.title.trim()) return;
    const exists = profile.portfolio.some((p) => p.id === editing.id);
    onUpdate({
      portfolio: exists
        ? profile.portfolio.map((p) => (p.id === editing.id ? editing : p))
        : [...profile.portfolio, { ...editing, id: uid() }],
    });
    setEditing(null);
    toast.success(exists ? "Project updated" : "Project added");
  };

  const remove = (id: string) => {
    onUpdate({ portfolio: profile.portfolio.filter((p) => p.id !== id) });
    toast.success("Project removed");
  };

  const move = (i: number, dir: -1 | 1) => {
    const next = [...profile.portfolio];
    const j = i + dir;
    if (j < 0 || j >= next.length) return;
    [next[i], next[j]] = [next[j]!, next[i]!];
    onUpdate({ portfolio: next });
  };

  const toggleFeatured = (id: string) => {
    onUpdate({
      portfolio: profile.portfolio.map((p) =>
        p.id === id ? { ...p, featured: !p.featured } : p,
      ),
    });
  };

  return (
    <EditorShell
      title="Portfolio"
      onBack={onBack}
      action={<AddAction onClick={startAdd} />}
    >
      {profile.portfolio.length === 0 ? (
        <div className="flex flex-col items-center rounded-2xl border border-dashed border-muted-foreground/25 px-6 py-12 text-center">
          <div className="grid size-12 place-items-center rounded-xl bg-primary/10 text-primary">
            <Plus className="size-5" />
          </div>
          <p className="mt-3 font-semibold">No projects yet</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Add showreels, campaigns and film work so clients can see your
            range.
          </p>
          <Button onClick={startAdd} className="mt-4">
            Add Project
          </Button>
        </div>
      ) : (
        <div className="space-y-2">
          {profile.portfolio.map((p, i) => (
            <Card key={p.id}>
              <CardContent className="flex items-center gap-3 py-3">
                <div className="flex shrink-0 flex-col items-center gap-0.5 text-muted-foreground/60">
                  <button
                    onClick={() => move(i, -1)}
                    aria-label="Move up"
                    disabled={i === 0}
                    className="disabled:opacity-30"
                  >
                    <ChevronUp className="size-3.5" />
                  </button>
                  <button
                    onClick={() => move(i, 1)}
                    aria-label="Move down"
                    disabled={i === profile.portfolio.length - 1}
                    className="disabled:opacity-30"
                  >
                    <ChevronDown className="size-3.5" />
                  </button>
                </div>

                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold">{p.title}</p>
                  <p className="truncate text-sm text-muted-foreground">
                    {p.subtitle}
                  </p>
                  <p className="text-xs text-muted-foreground/80">{p.date}</p>
                </div>

                {p.featured ? (
                  <Badge variant="secondary" className="shrink-0 text-xs">
                    <Star className="mr-1 size-3 fill-current" /> Featured
                  </Badge>
                ) : null}

                <div className="flex shrink-0 gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-8"
                    onClick={() => toggleFeatured(p.id)}
                    aria-label="Toggle featured"
                  >
                    <Star
                      className="size-4"
                      fill={p.featured ? "currentColor" : "none"}
                    />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-8"
                    onClick={() => startEdit(p)}
                    aria-label="Edit"
                  >
                    <Pencil className="size-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-8 text-destructive"
                    onClick={() => remove(p.id)}
                    aria-label="Delete"
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <div className="rounded-2xl border bg-muted/40 p-4">
        <p className="text-sm font-medium">Reorder projects</p>
        <p className="mt-1 text-xs text-muted-foreground">
          Use the arrows to change the order of projects on your profile.
        </p>
      </div>

      <Sheet open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <SheetContent side="bottom" className="max-h-[85vh]">
          <SheetHeader>
            <SheetTitle>{editing?.id ? "Edit Project" : "Add Project"}</SheetTitle>
          </SheetHeader>
          {editing && (
            <div className="space-y-4 px-4 py-4">
              <div className="space-y-1.5">
                <Label>Title</Label>
                <Input
                  value={editing.title}
                  onChange={(e) =>
                    setEditing({ ...editing, title: e.target.value })
                  }
                  placeholder="Demo Reel 1"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Type / Role</Label>
                <Input
                  value={editing.subtitle}
                  onChange={(e) =>
                    setEditing({ ...editing, subtitle: e.target.value })
                  }
                  placeholder="Showreel"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Date</Label>
                <Input
                  value={editing.date}
                  onChange={(e) =>
                    setEditing({ ...editing, date: e.target.value })
                  }
                  placeholder="Feb 2025"
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
