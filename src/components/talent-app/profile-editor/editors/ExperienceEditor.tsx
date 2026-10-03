"use client";

import { useState } from "react";
import { Briefcase, Pencil, Trash2 } from "lucide-react";
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
import {
  useCreateCredit,
  useDeleteCredit,
  useUpdateCredit,
} from "@/hooks/use-experience";
import type { Profile, Experience } from "../profile-types";

interface EditorProps {
  profile: Profile;
  onBack: () => void;
  onUpdate: (patch: Partial<Profile>) => void;
}

function getYear(period: string): number | undefined {
  const match = period.match(/\b(?:19|20)\d{2}\b/);
  return match ? Number(match[0]) : undefined;
}

export function ExperienceEditor({ profile, onBack }: EditorProps) {
  const [editing, setEditing] = useState<Experience | null>(null);
  const createCredit = useCreateCredit();
  const updateCredit = useUpdateCredit();
  const deleteCredit = useDeleteCredit();
  const isSaving = createCredit.isPending || updateCredit.isPending;

  const startAdd = () => {
    setEditing({ id: "", title: "", company: "", period: "", description: "" });
  };

  const startEdit = (e: Experience) => {
    setEditing({ ...e });
  };

  const save = async () => {
    if (!editing || !editing.title.trim()) {
      toast.error("Role / title is required");
      return;
    }

    const exists = profile.experience.some((e) => e.id === editing.id);
    const data = {
      project_name: editing.company.trim() || editing.title.trim(),
      role_played: editing.title.trim(),
      year: getYear(editing.period.trim()),
      description: editing.description.trim() || undefined,
    };

    try {
      if (exists) {
        await updateCredit.mutateAsync({ id: editing.id, data });
      } else {
        await createCredit.mutateAsync({ type: "credit", ...data });
      }
      setEditing(null);
      toast.success(exists ? "Experience updated" : "Experience added");
    } catch {
      toast.error("Could not save experience. Please try again.");
    }
  };

  const remove = async (id: string) => {
    try {
      await deleteCredit.mutateAsync(id);
      toast.success("Experience removed");
    } catch {
      toast.error("Could not remove experience. Please try again.");
    }
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
                    disabled={isSaving || deleteCredit.isPending}
                    onClick={() => startEdit(e)}
                  >
                    <Pencil className="mr-1 size-3.5" /> Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={isSaving || deleteCredit.isPending}
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
            <Button onClick={save} disabled={isSaving}>
              {isSaving ? "Saving..." : "Save"}
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </EditorShell>
  );
}
