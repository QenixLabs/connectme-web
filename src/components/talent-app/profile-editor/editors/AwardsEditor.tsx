"use client";

import { useState } from "react";
import { Pencil, Plus, Trash2, Trophy } from "lucide-react";
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
  useCreateAward,
  useUpdateAward,
  useDeleteAward,
} from "@/hooks/use-experience";
import type { Profile, Award } from "../profile-types";

interface EditorProps {
  profile: Profile;
  onBack: () => void;
  onUpdate: (patch: Partial<Profile>) => void;
}

export function AwardsEditor({ profile, onBack }: EditorProps) {
  const [editing, setEditing] = useState<Award | null>(null);
  const createAward = useCreateAward();
  const updateAward = useUpdateAward();
  const deleteAward = useDeleteAward();
  const isSaving = createAward.isPending || updateAward.isPending;

  const startAdd = () => {
    setEditing({ id: "", name: "", organization: "", year: "", description: "" });
  };

  const startEdit = (a: Award) => {
    setEditing({ ...a });
  };

  const save = () => {
    if (!editing) return;
    if (!editing.name.trim() || !editing.organization.trim()) {
      toast.error("Award name and organization are required");
      return;
    }
    const yearNum = Number(editing.year.trim());
    const data = {
      title: editing.name.trim(),
      awarding_body: editing.organization.trim(),
      year: editing.year.trim() && Number.isFinite(yearNum) ? yearNum : undefined,
      description: editing.description.trim() || undefined,
    };
    const exists = profile.awards.some((a) => a.id === editing.id);
    const onSuccess = () => toast.success(exists ? "Award updated" : "Award added");
    const onError = () => toast.error("Save failed. Please try again.");
    if (exists) {
      updateAward.mutate({ id: editing.id, data }, { onSuccess, onError });
    } else {
      createAward.mutate({ type: "award", ...data }, { onSuccess, onError });
    }
    setEditing(null);
  };

  const remove = (id: string) => {
    deleteAward.mutate(id, {
      onSuccess: () => toast.success("Award removed"),
      onError: () => toast.error("Delete failed. Please try again."),
    });
  };

  return (
    <EditorShell
      title="Awards"
      onBack={onBack}
      action={<AddAction onClick={startAdd} />}
    >
      {profile.awards.length === 0 ? (
        <div className="flex flex-col items-center rounded-2xl border border-dashed border-muted-foreground/25 px-6 py-12 text-center">
          <div className="grid size-12 place-items-center rounded-xl bg-primary/10 text-primary">
            <Trophy className="size-5" />
          </div>
          <p className="mt-3 font-semibold">No awards yet</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Recognitions, festival selections and nominations all count.
          </p>
          <Button onClick={startAdd} className="mt-4">
            Add Award
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {profile.awards.map((a) => (
            <Card key={a.id}>
              <CardContent className="flex items-start gap-3 py-4">
                <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
                  <Trophy className="size-[18px]" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold">{a.name}</p>
                  <p className="text-sm text-primary">{a.organization}</p>
                  <p className="text-xs text-muted-foreground">{a.year}</p>
                  {a.description ? (
                    <p className="mt-1.5 text-sm leading-snug text-muted-foreground">
                      {a.description}
                    </p>
                  ) : null}
                </div>
                <div className="flex shrink-0 gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-8"
                    onClick={() => startEdit(a)}
                    aria-label="Edit"
                  >
                    <Pencil className="size-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-8 text-destructive"
                    onClick={() => remove(a.id)}
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

      <Sheet open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <SheetContent side="bottom" className="max-h-[85vh]">
          <SheetHeader>
            <SheetTitle>{editing?.id ? "Edit Award" : "Add Award"}</SheetTitle>
          </SheetHeader>
          {editing && (
            <div className="space-y-4 px-4 py-4">
              <div className="space-y-1.5">
                <Label>Award name</Label>
                <Input
                  value={editing.name}
                  onChange={(e) =>
                    setEditing({ ...editing, name: e.target.value })
                  }
                  placeholder="Best Voice Performance"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Organization</Label>
                <Input
                  value={editing.organization}
                  onChange={(e) =>
                    setEditing({ ...editing, organization: e.target.value })
                  }
                  placeholder="Indie Audio Awards"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Year</Label>
                <Input
                  value={editing.year}
                  onChange={(e) =>
                    setEditing({ ...editing, year: e.target.value })
                  }
                  placeholder="2025"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Description</Label>
                <Textarea
                  rows={4}
                  value={editing.description}
                  onChange={(e) =>
                    setEditing({ ...editing, description: e.target.value })
                  }
                  placeholder="What was this award for?"
                />
              </div>
            </div>
          )}
          <SheetFooter>
            <Button variant="outline" onClick={() => setEditing(null)}>
              Cancel
            </Button>
            <Button onClick={save} disabled={isSaving}>
              {isSaving ? "Saving…" : "Save"}
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </EditorShell>
  );
}
