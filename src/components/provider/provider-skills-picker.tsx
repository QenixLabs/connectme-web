"use client";

import { createElement, useState } from "react";
import { Search, Sparkles, X } from "lucide-react";
import { PROVIDER_SKILLS, findProviderSkill, searchProviderSkills } from "@/data/provider-skills";
import { SKILL_TONE_STYLES } from "@/data/skills";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface ProviderSkillsPickerProps {
  value: string[];
  onChange: (skills: string[]) => void;
}

export function ProviderSkillsPicker({
  value,
  onChange,
}: ProviderSkillsPickerProps) {
  const [query, setQuery] = useState("");
  const selectedSkills = new Set(
    value.map((name) => findProviderSkill(name)?.name.toLowerCase() ?? name.toLowerCase()),
  );
  const suggestions = (query.trim()
    ? searchProviderSkills(query)
    : PROVIDER_SKILLS
  )
    .filter((skill) => !selectedSkills.has(skill.name.toLowerCase()))
    .slice(0, query.trim() ? 8 : 12);

  function addSkill(name: string) {
    if (value.length >= 50) return;
    onChange([...value, name]);
    setQuery("");
  }

  function removeSkill(name: string) {
    onChange(value.filter((skill) => skill !== name));
  }

  return (
    <div className="space-y-3">
      <label htmlFor="provider-skill-search" className="text-sm font-medium">
        Skills
      </label>
      <div className="relative">
        <Search
          className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden="true"
        />
        <Input
          id="provider-skill-search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search the skill library"
          className="pl-9"
          aria-describedby="provider-skill-help"
        />
      </div>
      <p id="provider-skill-help" className="text-xs text-muted-foreground">
        Choose from curated skills. Your selected skills appear on your public profile.
      </p>

      {value.length > 0 && (
        <div className="flex flex-wrap gap-2" aria-label="Selected skills">
          {value.map((name) => {
            const skill = findProviderSkill(name);
            const Icon = skill?.icon ?? Sparkles;
            const tone = SKILL_TONE_STYLES[skill?.tone ?? "violet"];
            return (
              <span
                key={name}
                className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-xs font-medium shadow-sm"
                style={{
                  backgroundColor: tone.background,
                  color: tone.foreground,
                }}
              >
                {createElement(Icon, {
                  className: "size-3.5",
                  "aria-hidden": true,
                })}
                {name}
                <button
                  type="button"
                  aria-label={`Remove ${name}`}
                  onClick={() => removeSkill(name)}
                  className="ml-0.5 rounded-full p-0.5 transition-colors hover:bg-white/60"
                >
                  <X className="size-3" aria-hidden="true" />
                </button>
              </span>
            );
          })}
        </div>
      )}

      <div className="grid gap-2 sm:grid-cols-2" aria-label="Skill library">
        {suggestions.map((skill) => {
          const Icon = skill.icon;
          const tone = SKILL_TONE_STYLES[skill.tone];
          return (
            <Button
              key={skill.name}
              type="button"
              variant="outline"
              onClick={() => addSkill(skill.name)}
              disabled={value.length >= 50}
              className="h-auto min-h-11 justify-start gap-2.5 rounded-xl border-provider-border bg-provider-surface px-3 py-2 text-left text-provider-foreground hover:border-provider-primary/30 hover:bg-provider-tint"
            >
              <span
                className="grid size-8 shrink-0 place-items-center rounded-lg"
                style={{
                  backgroundColor: tone.background,
                  color: tone.foreground,
                }}
              >
                {createElement(Icon, {
                  className: "size-4",
                  "aria-hidden": true,
                })}
              </span>
              <span className="min-w-0 flex-1 truncate">{skill.name}</span>
              <span
                className="text-lg leading-none text-provider-primary"
                aria-hidden="true"
              >
                +
              </span>
            </Button>
          );
        })}
      </div>
      {suggestions.length === 0 && (
        <p className="rounded-xl bg-provider-canvas px-3 py-3 text-center text-xs text-provider-muted">
          {query.trim()
            ? "No matching skills. Try another search."
            : value.length >= 50
            ? "You've reached the 50-skill limit."
            : "You've selected all available skills."}
        </p>
      )}
    </div>
  );
}
