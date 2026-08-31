"use client";

import { useState } from "react";
import { Plus, Search, Trash2, ChevronUp, ChevronDown } from "lucide-react";
import { EditorShell, SaveAction } from "./EditorShell";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import type { Profile, SkillItem } from "../profile-types";

interface EditorProps {
  profile: Profile;
  onBack: () => void;
  onUpdate: (patch: Partial<Profile>) => void;
}

const SUGGESTED = [
  "Voice Over",
  "Acting",
  "Editing",
  "Direction",
  "Photography",
  "Makeup",
  "Improv",
  "Singing",
  "Dancing",
  "Modelling",
];

export function SkillsEditor({ profile, onBack, onUpdate }: EditorProps) {
  const [skills, setSkills] = useState<SkillItem[]>(profile.skills);
  const [query, setQuery] = useState("");

  const add = (name: string) => {
    const v = name.trim();
    if (!v || skills.some((x) => x.name.toLowerCase() === v.toLowerCase())) return;
    setSkills([
      ...skills,
      { name: v, proficiency: "intermediate", order: skills.length },
    ]);
    setQuery("");
  };

  const move = (index: number, dir: -1 | 1) => {
    const next = [...skills];
    const j = index + dir;
    if (j < 0 || j >= next.length) return;
    [next[index], next[j]] = [next[j]!, next[index]!];
    setSkills(next.map((s, i) => ({ ...s, order: i })));
  };

  const remove = (index: number) => {
    setSkills(skills.filter((_, i) => i !== index).map((s, i) => ({ ...s, order: i })));
  };

  const save = () => {
    onUpdate({ skills });
    onBack();
  };

  const suggested = SUGGESTED.filter(
    (s) =>
      !skills.some((x) => x.name.toLowerCase() === s.toLowerCase()) &&
      s.toLowerCase().includes(query.toLowerCase()),
  );

  return (
    <EditorShell
      title="Skills"
      onBack={onBack}
      action={<SaveAction onClick={save} />}
    >
      <Card>
        <CardContent className="space-y-5">
          <div>
            <p className="font-semibold">Your Skills</p>
            <p className="text-xs text-muted-foreground">
              Add skills that best represent your talent.
            </p>

            {skills.length === 0 ? (
              <p className="mt-4 text-sm text-muted-foreground">
                No skills yet. Add at least 5 skills to strengthen your profile.
              </p>
            ) : (
              <div className="mt-4 flex flex-wrap gap-2">
                {skills.map((skill, i) => (
                  <Badge
                    key={skill.name}
                    variant="secondary"
                    className="gap-1 px-2.5 py-1"
                  >
                    <button
                      onClick={() => move(i, -1)}
                      aria-label={`Move ${skill.name} up`}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      <ChevronUp className="size-3" />
                    </button>
                    <button
                      onClick={() => move(i, 1)}
                      aria-label={`Move ${skill.name} down`}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      <ChevronDown className="size-3" />
                    </button>
                    <span>{skill.name}</span>
                    <button
                      onClick={() => remove(i)}
                      aria-label={`Remove ${skill.name}`}
                      className="text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="size-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <p className="font-semibold">Add New Skill</p>
            <div className="flex gap-2">
              <div className="relative min-w-0 flex-1">
                <Input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search or add a skill"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      add(query);
                    }
                  }}
                  className="pr-9"
                />
                <Search className="absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              </div>
              <Button onClick={() => add(query)} aria-label="Add skill">
                <Plus className="size-4" />
              </Button>
            </div>
          </div>

          {suggested.length > 0 && (
            <div className="space-y-2">
              <p className="font-semibold">Suggested Skills</p>
              <div className="flex flex-wrap gap-2">
                {suggested.map((s) => (
                  <Button
                    key={s}
                    variant="outline"
                    size="sm"
                    onClick={() => add(s)}
                  >
                    <Plus className="mr-1 size-3" /> {s}
                  </Button>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="rounded-2xl border bg-muted/40 p-4">
        <p className="text-sm font-medium">Tips</p>
        <p className="mt-1 text-xs text-muted-foreground">
          Add at least 5 skills to improve your profile strength.
        </p>
      </div>
    </EditorShell>
  );
}
