"use client";

import { useState } from "react";
import { Clapperboard, Pencil, Trash2 } from "lucide-react";
import { EditorShell, AddAction } from "./EditorShell";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
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
import type { Profile, Credit } from "../profile-types";

interface EditorProps {
  profile: Profile;
  onBack: () => void;
  onUpdate: (patch: Partial<Profile>) => void;
}

export function CreditsEditor({ profile, onBack }: EditorProps) {
  const [editing, setEditing] = useState<Credit | null>(null);
  const createCredit = useCreateCredit();
  const updateCredit = useUpdateCredit();
  const deleteCredit = useDeleteCredit();
  const isSaving = createCredit.isPending || updateCredit.isPending;

  const startAdd = () => {
    setEditing({
      id: "",
      project: "",
      role: "",
      production: "",
      year: "",
      description: "",
    });
  };

  const startEdit = (c: Credit) => {
    setEditing({ ...c });
  };

  const save = async () => {
    if (!editing || !editing.project.trim()) {
      toast.error("Project name is required");
      return;
    }

    const exists = profile.credits.some((c) => c.id === editing.id);
    const year = Number(editing.year.trim());
    const data = {
      project_name: editing.project.trim(),
      role_played: editing.role.trim() || undefined,
      platform: editing.production.trim() || undefined,
      year: editing.year.trim() && Number.isFinite(year) ? year : undefined,
      description: editing.description.trim() || undefined,
    };

    try {
      if (exists) {
        await updateCredit.mutateAsync({ id: editing.id, data });
      } else {
        await createCredit.mutateAsync({ type: "credit", ...data, role_played: data.role_played ?? "" });
      }
      setEditing(null);
      toast.success(exists ? "Credit updated" : "Credit added");
    } catch {
      toast.error("Could not save credit. Please try again.");
    }
  };

  const remove = async (id: string) => {
    try {
      await deleteCredit.mutateAsync(id);
      toast.success("Credit removed");
    } catch {
      toast.error("Could not remove credit. Please try again.");
    }
  };

  return (
    <EditorShell
      title="Credits"
      onBack={onBack}
      action={<AddAction onClick={startAdd} />}
    >
      {profile.credits.length === 0 ? (
        <div className="flex flex-col items-center rounded-2xl border border-dashed border-muted-foreground/25 px-6 py-12 text-center">
          <div className="grid size-12 place-items-center rounded-xl bg-primary/10 text-primary">
            <Clapperboard className="size-5" />
          </div>
          <p className="mt-3 font-semibold">No credits yet</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Add films, ads, shows and campaigns you have been part of.
          </p>
          <Button onClick={startAdd} className="mt-4">
            Add Credit
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {profile.credits.map((c) => (
            <Card key={c.id}>
              <CardContent className="py-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-semibold">{c.project}</p>
                    <p className="text-sm font-medium text-primary">{c.role}</p>
                    <p className="text-xs text-muted-foreground">
                      {c.production} · {c.year}
                    </p>
                  </div>
                  {c.year ? (
                    <Badge variant="secondary" className="shrink-0">
                      {c.year}
                    </Badge>
                  ) : null}
                </div>
                {c.description ? (
                  <p className="mt-2 text-sm leading-snug text-muted-foreground">
                    {c.description}
                  </p>
                ) : null}
                <div className="mt-3 flex justify-end gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={isSaving || deleteCredit.isPending}
                    onClick={() => startEdit(c)}
                  >
                    <Pencil className="mr-1 size-3.5" /> Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={isSaving || deleteCredit.isPending}
                    className="text-destructive hover:text-destructive"
                    onClick={() => remove(c.id)}
                  >
                    <Trash2 className="mr-1 size-3.5" /> Delete
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
            <SheetTitle>Credit Details</SheetTitle>
          </SheetHeader>
          {editing && (
            <div className="space-y-4 px-4 py-4">
              <div className="space-y-1.5">
                <Label>Project</Label>
                <Input
                  value={editing.project}
                  onChange={(e) =>
                    setEditing({ ...editing, project: e.target.value })
                  }
                  placeholder="Shadow"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Role</Label>
                <Input
                  value={editing.role}
                  onChange={(e) =>
                    setEditing({ ...editing, role: e.target.value })
                  }
                  placeholder="Supporting Role"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Production house</Label>
                <Input
                  value={editing.production}
                  onChange={(e) =>
                    setEditing({ ...editing, production: e.target.value })
                  }
                  placeholder="Bluebird Films"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Year</Label>
                <Input
                  value={editing.year}
                  onChange={(e) =>
                    setEditing({ ...editing, year: e.target.value })
                  }
                  placeholder="2024"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Description</Label>
                <Textarea
                  rows={3}
                  maxLength={220}
                  value={editing.description}
                  onChange={(e) =>
                    setEditing({ ...editing, description: e.target.value })
                  }
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
