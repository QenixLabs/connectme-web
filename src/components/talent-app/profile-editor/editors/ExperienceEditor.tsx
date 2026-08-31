"use client";

import { useState } from "react";
import { Briefcase, Pencil, Plus, Trash2 } from "lucide-react";
import { EditorShell, AddAction } from "./EditorShell";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet";
import { toast } from "sonner";
import type { Profile, Experience } from "../profile-types";

interface EditorProps {
  profile: Profile;
  onBack: () => void;
  onUpdate: (patch: Partial<Profile>) => void;
}

const uid = () => Math.random().toString(36).slice(2, 9);

export function ExperienceEditor({ profile, onBack, onUpdate }: EditorProps) {
  const [editing, setEditing] = useState<Experience | null>(null);

  const startAdd = () => {
    setEditing({ id: "", title: "", company: "", period: "", description: "" });
  };

  const startEdit = (e: Experience) => {
    setEditing({ ...e });
  };

  const save = () => {
    if (!editing || !editing.title.trim()) return;
    const exists = profile.experience.some((e) => e.id === editing.id);
    onUpdate({
      experience: exists
        ? profile.experience.map((e) => (e.id === editing.id ? editing : e))
        : [...profile.experience, { ...editing, id: uid() }],
    });
    setEditing(null);
    toast.success(exists ? "Experience updated" : "Experience added");
  };

  const remove = (id: string) => {
    onUpdate({ experience: profile.experience.filter((e) => e.id !== id) });
    toast.success("Experience removed");
  };

  return (
    <EditorShell
      title="Work Experience"
      onBack={onBack}
      action={<AddAction onClick={startAdd} />}
    >
      {profile.experience.length === 0 ? (
        <div className="flex flex-col items-center rounded-2xl border border-dashed border-muted-foreground/25 px-6 py-12 text-center">
          <div className="grid size-12 place-items-center rounded-xl bg-primary/10 text-primary">
            <Briefcase className="size-5" />
          </div>
          <p className="mt-3 font-semibold">No experience yet</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Add the roles and studios you have worked with to build
            credibility.
          </p>
          <Button onClick={startAdd} className="mt-4">
            Add Experience
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {profile.experience.map((e) => (
            <Card key={e.id}>
              <CardContent className="py-4">
                <div className="flex items-start gap-3">
                  <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
                    <Briefcase className="size-[18px]" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold">{e.title}</p>
                    <p className="text-sm text-muted-foreground">{e.company}</p>
                    <p className="text-xs text-muted-foreground">{e.period}</p>
                    {e.description ? (
                      <p className="mt-2 text-sm leading-snug text-muted-foreground">
                        {e.description}
                      </p>
                    ) : null}
                  </div>
                </div>
                <div className="mt-3 flex justify-end gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => startEdit(e)}
                  >
                    <Pencil className="mr-1 size-3.5" /> Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-destructive hover:text-destructive"
                    onClick={() => remove(e.id)}
                  >
                    <Trash2 className="mr-1 size-3.5" /> Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <div className="rounded-2xl border bg-muted/40 p-4">
        <p className="text-sm font-medium">Keep it recent</p>
        <p className="mt-1 text-xs text-muted-foreground">
          List your most relevant six to eight roles. Casting teams scan the
          first three.
        </p>
      </div>

      <Sheet open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <SheetContent side="bottom" className="max-h-[85vh]">
          <SheetHeader>
            <SheetTitle>
              {editing?.id && profile.experience.some((e) => e.id === editing.id)
                ? "Edit Experience"
                : "Add Experience"}
            </SheetTitle>
          </SheetHeader>
          {editing && (
            <div className="space-y-4 px-4 py-4">
              <div className="space-y-1.5">
                <Label>Role / title</Label>
                <Input
                  value={editing.title}
                  onChange={(e) =>
                    setEditing({ ...editing, title: e.target.value })
                  }
                  placeholder="Freelance Voice Artist"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Company / studio</Label>
                <Input
                  value={editing.company}
                  onChange={(e) =>
                    setEditing({ ...editing, company: e.target.value })
                  }
                  placeholder="Self employed"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Period</Label>
                <Input
                  value={editing.period}
                  onChange={(e) =>
                    setEditing({ ...editing, period: e.target.value })
                  }
                  placeholder="2021 — Present"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Description</Label>
                <Textarea
                  rows={4}
                  maxLength={280}
                  value={editing.description}
                  onChange={(e) =>
                    setEditing({ ...editing, description: e.target.value })
                  }
                  placeholder="What did you work on?"
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
