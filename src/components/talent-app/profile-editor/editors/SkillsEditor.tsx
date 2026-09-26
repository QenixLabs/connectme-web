"use client";

import Image from "next/image";
import { useState } from "react";
import { ArrowRight, Check, Eye, Search, Sparkles, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  findSkillByName,
  getSkillById,
  SKILL_CATEGORIES,
  SKILL_CATEGORY_DEFINITIONS,
  SKILL_TONE_STYLES,
  SKILLS,
  skillMatchesQuery,
  type SkillCategory,
  type SkillDefinition,
} from "@/data/skills";
import { EditorShell } from "./EditorShell";
import type { Profile } from "../profile-types";

interface EditorProps {
  profile: Profile;
  onBack: () => void;
  onUpdate: (patch: Partial<Profile>) => void;
}

const FILTER_CATEGORIES = ["All", ...SKILL_CATEGORIES] as const;
type FilterCategory = (typeof FILTER_CATEGORIES)[number];

export function SkillsEditor({ profile, onBack, onUpdate }: EditorProps) {
  const [selectedIds, setSelectedIds] = useState<string[]>(() => getInitialSkillIds(profile));
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<FilterCategory>("All");

  const selectedSkills = selectedIds
    .map((id) => getSkillById(id))
    .filter((skill): skill is SkillDefinition => Boolean(skill));
  const selectedIdSet = new Set(selectedIds);
  const visibleGroups = getVisibleGroups(activeCategory, query);

  const toggleSkill = (id: string) => {
    setSelectedIds((current) =>
      current.includes(id) ? current.filter((selectedId) => selectedId !== id) : [...current, id],
    );
  };

  const save = () => {
    onUpdate({
      skills: selectedSkills.map((skill, order) => ({
        name: skill.name,
        order,
      })),
    });
    onBack();
  };

  return (
    <EditorShell title="Skills" onBack={onBack}>
      <Card className="gap-0 overflow-hidden rounded-[26px] border-[#e8e3fb] bg-white shadow-[0_14px_34px_rgba(75,61,157,0.11)]">
        <div className="relative min-h-[210px] overflow-hidden bg-[linear-gradient(118deg,#ffffff_0%,#f7f4ff_52%,#ebe8ff_100%)] sm:min-h-[224px]">
          <div className="pointer-events-none absolute inset-0 z-[1] bg-[linear-gradient(90deg,#ffffff_0%,rgba(255,255,255,0.97)_30%,rgba(255,255,255,0.42)_58%,transparent_83%)]" />
          <div className="relative z-10 flex max-w-[61%] flex-col px-5 py-6 sm:px-6 sm:py-7">
            <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-white/80 px-2.5 py-1 text-[9px] font-extrabold uppercase tracking-[0.16em] text-[#6543d8] shadow-sm ring-1 ring-[#8f7bea]/15">
              <Sparkles className="size-3" />
              Curated library
            </span>
            <h1 className="mt-4 font-display text-[25px] font-bold leading-[1.02] tracking-[-0.045em] text-[#17245b] sm:text-[29px]">
              <span className="block">Skills &amp;</span>
              <span className="block text-[#5632e8]">Expertise</span>
            </h1>
            <p className="mt-3 max-w-[14rem] text-[11.5px] leading-[1.45] text-[#5d6380] sm:text-xs">
              Choose the skills that best represent your talent and abilities.
            </p>
          </div>
          <div className="absolute inset-y-0 right-0 z-0 w-[55%]">
            <Image
              src="/assets/talent-edit/profile-skill-hero.png"
              alt=""
              fill
              priority
              sizes="(max-width: 430px) 55vw, 235px"
              className="object-contain object-right"
              aria-hidden="true"
            />
          </div>
        </div>
      </Card>

      <Card className="gap-0 rounded-[24px] border-[#e8e3fb] bg-white shadow-[0_10px_28px_rgba(75,61,157,0.08)]">
        <CardHeader className="flex flex-row items-start justify-between gap-3 px-5 pb-0 pt-5">
          <div className="min-w-0">
            <CardTitle className="text-[17px] tracking-[-0.02em] text-[#17245b]">
              Your Skills <span className="font-medium text-[#7d7897]">({selectedSkills.length})</span>
            </CardTitle>
            <CardDescription className="mt-1 text-[11px] leading-relaxed text-[#777993]">
              These skills will appear on your public profile.
            </CardDescription>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setSelectedIds([])}
            disabled={selectedSkills.length === 0}
            className="h-7 shrink-0 rounded-full px-2.5 text-[11px] font-bold text-[#5b35df] hover:bg-[#f1edff] hover:text-[#4e2bd4]"
          >
            Clear All
          </Button>
        </CardHeader>
        <CardContent className="px-5 pb-5 pt-4">
          {selectedSkills.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {selectedSkills.map((skill) => {
                const tone = SKILL_TONE_STYLES[skill.tone];
                const Icon = skill.icon;

                return (
                  <span
                    key={skill.id}
                    className="inline-flex max-w-full items-center gap-1.5 rounded-full px-2 py-1.5 text-[11px] font-bold shadow-sm ring-1"
                    style={{
                      backgroundColor: tone.background,
                      color: tone.foreground,
                      // A shared low-alpha ring keeps chips soft without losing their color identity.
                      boxShadow: `inset 0 0 0 1px ${tone.ring}`,
                    }}
                  >
                    <span className="grid size-6 shrink-0 place-items-center rounded-full bg-white/70">
                      <Icon className="size-3.5" strokeWidth={2.2} aria-hidden="true" />
                    </span>
                    <span className="truncate">{skill.name}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-xs"
                      onClick={() => toggleSkill(skill.id)}
                      aria-label={`Remove ${skill.name}`}
                      className="size-7 shrink-0 rounded-full px-0 text-current/70 hover:bg-white/70 hover:text-current focus-visible:ring-current/40"
                    >
                      <X className="size-3" strokeWidth={2.5} />
                    </Button>
                  </span>
                );
              })}
            </div>
          ) : (
            <div className="rounded-2xl bg-[#f8f6ff] px-4 py-5 text-center text-[11px] leading-relaxed text-[#777993]">
              No skills selected yet. Pick the abilities that make your profile memorable.
            </div>
          )}
        </CardContent>
      </Card>

      <section className="space-y-3" aria-label="Skill library controls">
        <div className="space-y-1.5">
          <label htmlFor="skill-search" className="text-[13px] font-bold text-[#17245b]">
            Search skills
          </label>
          <div className="relative">
            <Search className="pointer-events-none absolute left-4 top-1/2 size-[17px] -translate-y-1/2 text-[#817ba4]" />
            <Input
              id="skill-search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search skills (e.g. Acting, Dance, Singing...)"
              className="h-12 rounded-2xl border-[#e4def7] bg-white pl-11 pr-10 text-xs text-[#17245b] shadow-[0_7px_20px_rgba(75,61,157,0.06)] placeholder:text-[#9b97b7] focus-visible:border-[#7754ee] focus-visible:ring-[#7754ee]/20"
            />
            {query ? (
              <Button
                type="button"
                variant="ghost"
                size="icon-xs"
                onClick={() => setQuery("")}
                aria-label="Clear skill search"
                className="absolute right-3 top-1/2 size-7 -translate-y-1/2 rounded-full px-0 text-[#80799f] hover:bg-[#f1edff] hover:text-[#5632e8] focus-visible:ring-[#7754ee]/40"
              >
                <X className="size-3.5" />
              </Button>
            ) : null}
          </div>
        </div>

        <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden" role="tablist" aria-label="Skill categories">
          {FILTER_CATEGORIES.map((category) => {
            const active = activeCategory === category;

            return (
              <Button
                key={category}
                type="button"
                variant="ghost"
                role="tab"
                aria-selected={active}
                onClick={() => setActiveCategory(category)}
                className={cn(
                  "min-h-9 shrink-0 rounded-full px-3.5 text-[10.5px] font-bold transition-all duration-200 focus-visible:ring-[#7754ee]/40",
                  active
                    ? "bg-gradient-to-r from-[#5535ee] to-[#3f73f2] text-white shadow-[0_7px_16px_rgba(66,77,232,0.24)] hover:bg-gradient-to-r hover:from-[#5535ee] hover:to-[#3f73f2]"
                    : "bg-[#f1edff] text-[#263267] hover:bg-[#e8e1ff]",
                )}
              >
                {category}
              </Button>
            );
          })}
        </div>
      </section>

      <section className="space-y-4" aria-label="Curated skills">
        {visibleGroups.length > 0 ? (
          visibleGroups.map(({ category, skills }) => {
            const CategoryIcon = category.icon;
            const categoryTone = SKILL_TONE_STYLES[category.tone];

            return (
              <Card
                key={category.name}
                className="gap-0 overflow-hidden rounded-[24px] border-[#e8e3fb] bg-[#f8f7ff] shadow-[0_10px_26px_rgba(75,61,157,0.07)]"
              >
                <CardHeader className="flex flex-row items-center gap-3 px-4 pb-3 pt-4">
                  <span
                    className="grid size-10 shrink-0 place-items-center rounded-2xl"
                    style={{
                      backgroundColor: categoryTone.background,
                      color: categoryTone.foreground,
                    }}
                  >
                    <CategoryIcon className="size-[19px]" strokeWidth={2.25} aria-hidden="true" />
                  </span>
                  <div className="min-w-0">
                    <CardTitle className="text-[16px] tracking-[-0.025em] text-[#17245b]">
                      {category.name}
                    </CardTitle>
                    <p className="mt-0.5 text-[10.5px] font-medium text-[#817d9f]">
                      {skills.length} {skills.length === 1 ? "skill" : "skills"}
                      {query.trim() ? " matched" : " to explore"}
                    </p>
                  </div>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-2.5 px-4 pb-4 min-[360px]:grid-cols-3">
                  {skills.map((skill) => {
                    const selected = selectedIdSet.has(skill.id);
                    const tone = SKILL_TONE_STYLES[skill.tone];
                    const Icon = skill.icon;

                    return (
                      <Button
                        key={skill.id}
                        type="button"
                        variant="ghost"
                        aria-pressed={selected}
                        onClick={() => toggleSkill(skill.id)}
                        className={cn(
                          "group relative flex h-auto min-h-[110px] min-w-0 w-full flex-col items-center justify-center gap-2 rounded-2xl px-2 py-3 text-center transition-all duration-200 focus-visible:ring-[#7754ee]/50 active:scale-[0.98]",
                          selected
                            ? "border border-[#7449f3] bg-[#f4f0ff] shadow-[0_7px_16px_rgba(96,63,226,0.12)] hover:bg-[#f4f0ff]"
                            : "border border-transparent bg-white shadow-[0_5px_14px_rgba(75,61,157,0.07)] hover:-translate-y-0.5 hover:border-[#d6cbfb] hover:bg-white hover:shadow-[0_9px_18px_rgba(75,61,157,0.11)]",
                        )}
                      >
                        {selected ? (
                          <span className="absolute right-2 top-2 grid size-5 place-items-center rounded-full bg-gradient-to-br from-[#4f2cf0] to-[#9a2ff1] text-white shadow-sm">
                            <Check className="size-3" strokeWidth={3} />
                          </span>
                        ) : null}
                        <span
                          className="grid size-12 shrink-0 place-items-center rounded-full transition-transform duration-200 group-hover:scale-105"
                          style={{
                            backgroundColor: tone.background,
                            color: tone.foreground,
                            boxShadow: `inset 0 0 0 1px ${tone.ring}`,
                          }}
                        >
                          <Icon className="size-[22px]" strokeWidth={2.1} aria-hidden="true" />
                        </span>
                        <span className="line-clamp-2 text-[11px] font-bold leading-tight text-[#202957]">
                          {skill.name}
                        </span>
                      </Button>
                    );
                  })}
                </CardContent>
              </Card>
            );
          })
        ) : (
          <Card className="gap-0 rounded-[24px] border-[#e8e3fb] bg-white shadow-[0_10px_26px_rgba(75,61,157,0.07)]">
            <CardContent className="px-5 py-10 text-center">
              <span className="mx-auto grid size-12 place-items-center rounded-full bg-[#eee9ff] text-[#6438d8]">
                <Search className="size-5" />
              </span>
              <p className="mt-3 text-sm font-bold text-[#17245b]">No matching skills</p>
              <p className="mt-1 text-xs leading-relaxed text-[#777993]">
                Try another name, category, or keyword from the curated library.
              </p>
            </CardContent>
          </Card>
        )}
      </section>

      <div className="sticky bottom-0 z-30 -mx-4 mt-1 border-t border-[#e8e3fb] bg-[#fbfaff]/95 px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-3 backdrop-blur-md">
        <Button
          type="button"
          onClick={save}
          className="h-12 w-full rounded-2xl bg-gradient-to-r from-[#4f2cf0] via-[#7134ed] to-[#9a2ff1] text-sm font-bold text-white shadow-[0_10px_22px_rgba(91,53,231,0.25)] hover:brightness-105"
        >
          Save Skills
          <ArrowRight className="size-4" />
        </Button>
        <p className="mt-2 flex items-center justify-center gap-1 text-[10px] font-medium text-[#817d9f]">
          <Eye className="size-3" />
          Your skills are visible on your public profile
        </p>
      </div>
    </EditorShell>
  );
}

function getInitialSkillIds(profile: Profile) {
  const seen = new Set<string>();

  return [...profile.skills]
    .sort((left, right) => left.order - right.order)
    .map((skill) => findSkillByName(skill.name))
    .filter((skill): skill is SkillDefinition => Boolean(skill))
    .filter((skill) => {
      if (seen.has(skill.id)) return false;
      seen.add(skill.id);
      return true;
    })
    .map((skill) => skill.id);
}

function getVisibleGroups(activeCategory: FilterCategory, query: string) {
  const categories: SkillCategory[] =
    activeCategory === "All" ? [...SKILL_CATEGORIES] : [activeCategory];

  return categories.flatMap((categoryName) => {
    const category = SKILL_CATEGORY_DEFINITIONS.find(({ name }) => name === categoryName);
    const skills = SKILLS.filter(
      (skill) => skill.category === categoryName && skillMatchesQuery(skill, query),
    );

    return category && skills.length > 0 ? [{ category, skills }] : [];
  });
}
