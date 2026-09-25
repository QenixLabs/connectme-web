"use client";

import { useState } from "react";
import { GripVertical, Plus, Search, X, ChevronUp, ChevronDown } from "lucide-react";
import { EditorShell, SaveAction } from "./EditorShell";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { getSkillIcon } from "@/components/talent-profile/sections/SkillsSection";
import type { Profile, SkillItem } from "../profile-types";

interface EditorProps {
  profile: Profile;
  onBack: () => void;
  onUpdate: (patch: Partial<Profile>) => void;
}

const SUGGESTED = [
  "Acting",
  "Voice Over",
  "Dancing",
  "Photography",
  "Video Editing",
  "Singing",
  "Modeling",
  "Improv",
  "Public Speaking",
  "Choreography",
];

function sameSkill(left: string, right: string) {
  return left.trim().toLowerCase() === right.trim().toLowerCase();
}

export function SkillsEditor({ profile, onBack, onUpdate }: EditorProps) {
  const [skills, setSkills] = useState<SkillItem[]>(profile.skills);
  const [query, setQuery] = useState("");
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const selected = (name: string) => skills.some((skill) => sameSkill(skill.name, name));

  const add = (name: string) => {
    const value = name.trim();
    if (!value || selected(value)) return;
    setSkills((current) => [...current, { name: value, order: current.length }]);
    setQuery("");
  };

  const move = (index: number, dir: -1 | 1) => {
    setSkills((current) => {
      const next = [...current];
      const target = index + dir;
      if (target < 0 || target >= next.length) return current;
      [next[index], next[target]] = [next[target]!, next[index]!];
      return next.map((skill, order) => ({ ...skill, order }));
    });
  };

  const drop = (targetIndex: number) => {
    if (draggedIndex === null || draggedIndex === targetIndex) return;
    setSkills((current) => {
      const next = [...current];
      const [moved] = next.splice(draggedIndex, 1);
      if (!moved) return current;
      next.splice(targetIndex, 0, moved);
      return next.map((skill, order) => ({ ...skill, order }));
    });
    setDraggedIndex(null);
  };

  const remove = (name: string) => {
    setSkills((current) =>
      current.filter((skill) => !sameSkill(skill.name, name)).map((skill, order) => ({ ...skill, order })),
    );
  };

  const save = () => {
    onUpdate({ skills: skills.map((skill, order) => ({ ...skill, order })) });
    onBack();
  };

  const suggestions = SUGGESTED.filter(
    (skill) => !selected(skill) && skill.toLowerCase().includes(query.trim().toLowerCase()),
  );

  return (
    <EditorShell title="Skills" onBack={onBack} action={<SaveAction onClick={save} />}>
      <Card className="overflow-hidden border-brand/10 shadow-sm">
        <CardContent className="space-y-5 p-4 sm:p-5">
          <div>
            <div className="flex items-end justify-between gap-3">
              <div>
                <p className="text-lg font-semibold tracking-tight">Your Skills</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {skills.length} {skills.length === 1 ? "skill" : "skills"} selected
                </p>
              </div>
              <span className="rounded-full bg-brand-soft px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-brand">
                Primary skills
              </span>
            </div>
            <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
              Drag to reorder. Your top skills are showcased first on your public profile.
            </p>

            {skills.length === 0 ? (
              <div className="mt-4 rounded-xl border border-dashed border-brand/20 bg-brand-soft/30 px-4 py-6 text-center text-sm text-muted-foreground">
                Add the skills that best represent your talent.
              </div>
            ) : (
              <div className="mt-4 space-y-2">
                {skills.map((skill, index) => {
                  const { icon: Icon, iconClass, backgroundClass } = getSkillIcon(skill.name);
                  return (
                    <div
                      key={skill.name}
                      draggable
                      onDragStart={() => setDraggedIndex(index)}
                      onDragOver={(event) => event.preventDefault()}
                      onDrop={() => drop(index)}
                      onDragEnd={() => setDraggedIndex(null)}
                      className={cn(
                        "flex items-center gap-2 rounded-xl border border-border/70 bg-background px-2.5 py-2 transition-colors",
                        draggedIndex === index && "border-brand/40 bg-brand-soft/40 opacity-60",
                      )}
                    >
                      <GripVertical
                        className="size-4 shrink-0 cursor-grab text-muted-foreground/60 active:cursor-grabbing"
                        aria-label={`Drag ${skill.name} to reorder`}
                      />
                      <span className={cn("grid size-8 shrink-0 place-items-center rounded-lg", backgroundClass)}>
                        <Icon className={cn("size-4", iconClass)} strokeWidth={2} />
                      </span>
                      <span className="min-w-0 flex-1 truncate text-sm font-semibold text-foreground">
                        {skill.name}
                      </span>
                      <div className="hidden items-center gap-0.5 sm:flex">
                        <button
                          type="button"
                          onClick={() => move(index, -1)}
                          disabled={index === 0}
                          aria-label={`Move ${skill.name} up`}
                          className="rounded p-1 text-muted-foreground hover:bg-muted disabled:opacity-30"
                        >
                          <ChevronUp className="size-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => move(index, 1)}
                          disabled={index === skills.length - 1}
                          aria-label={`Move ${skill.name} down`}
                          className="rounded p-1 text-muted-foreground hover:bg-muted disabled:opacity-30"
                        >
                          <ChevronDown className="size-3.5" />
                        </button>
                      </div>
                      <button
                        type="button"
                        onClick={() => remove(skill.name)}
                        aria-label={`Remove ${skill.name}`}
                        className="rounded-full p-1 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                      >
                        <X className="size-4" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="space-y-3 border-t border-border/70 pt-5">
            <div>
              <p className="font-semibold">Add a Skill</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Choose a suggested skill or search for your own.
              </p>
            </div>
            <div className="flex gap-2">
              <div className="relative min-w-0 flex-1">
                <Input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search or add a skill"
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      event.preventDefault();
                      add(query);
                    }
                  }}
                  className="h-11 rounded-xl border-border bg-muted/30 pr-10 text-sm focus-visible:ring-brand/30"
                />
                <Search className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              </div>
              <Button
                type="button"
                onClick={() => add(query)}
                disabled={!query.trim() || selected(query)}
                className="h-11 rounded-xl bg-brand px-4 text-white hover:bg-brand/90"
                aria-label="Add skill"
              >
                <Plus className="size-4" />
              </Button>
            </div>

          </div>

          {suggestions.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                Suggested Skills
              </p>
              <div className="grid grid-cols-2 gap-2">
                {suggestions.map((skill) => {
                  const { icon: Icon, iconClass, backgroundClass } = getSkillIcon(skill);
                  return (
                    <button
                      type="button"
                      key={skill}
                      onClick={() => add(skill)}
                      className="flex min-w-0 items-center gap-2 rounded-xl border border-border/70 bg-background px-2.5 py-2 text-left transition-colors hover:border-brand/40 hover:bg-brand-soft/50"
                    >
                      <span className={cn("grid size-7 shrink-0 place-items-center rounded-lg", backgroundClass)}>
                        <Icon className={cn("size-3.5", iconClass)} strokeWidth={2} />
                      </span>
                      <span className="truncate text-xs font-semibold">{skill}</span>
                      <Plus className="ml-auto size-3.5 shrink-0 text-muted-foreground" />
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </EditorShell>
  );
}
