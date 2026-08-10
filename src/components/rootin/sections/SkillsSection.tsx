"use client";

import { Paperclip } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, SectionHead, Pill } from "../primitives";
import { getDisplayMode } from "./types";

export interface SkillsSectionProps {
  data: string[];
  className?: string;
}

export function SkillsSection({ data, className }: SkillsSectionProps) {
  const mode = getDisplayMode(data.length);

  if (mode === "empty") {
    return (
      <Card className={cn("transition-all duration-300 ease-out", className)}>
        <SectionHead
          icon={<Paperclip width={16} height={16} />}
          title="Skills"
          action="View All"
        />
      </Card>
    );
  }

  return (
    <Card className={cn("transition-all duration-300 ease-out", className)}>
      <SectionHead
        icon={<Paperclip width={16} height={16} />}
        title="Skills"
        action="View All"
      />
      <div
        className={cn(
          "flex flex-wrap gap-2 transition-all duration-300 ease-out",
          mode === "compact" && "justify-center",
          mode === "expanded" && "overflow-auto",
        )}
        style={mode === "expanded" ? { maxHeight: "min(180px, 35vh)" } : undefined}
      >
        {data.map((s) => (
          <button key={s} className="transition-opacity duration-200 hover:opacity-70">
            <Pill>{s}</Pill>
          </button>
        ))}
      </div>
    </Card>
  );
}
