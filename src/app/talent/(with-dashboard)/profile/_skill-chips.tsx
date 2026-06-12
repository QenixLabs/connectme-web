"use client";

interface Skill {
  name: string;
  proficiency?: string;
}

interface SkillChipsProps {
  skills: Skill[];
  showProficiency?: boolean;
}

export function SkillChips({ skills, showProficiency = false }: SkillChipsProps) {
  if (!skills || skills.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2">
      {skills.map((skill) => (
        <span
          key={skill.name}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[13px] font-medium bg-white text-text-secondary border border-border shadow-[0_1px_2px_black/4]"
        >
          {skill.name}
          {showProficiency && skill.proficiency && (
            <span className="text-text-muted text-[11px]">{skill.proficiency}</span>
          )}
        </span>
      ))}
    </div>
  );
}
