"use client";

import { User } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, SectionHead } from "../primitives";
import type { TalentData } from "./types";

export interface AboutSectionProps {
  talent: TalentData;
  className?: string;
}

export function AboutSection({ talent, className }: AboutSectionProps) {
  return (
    <Card prominent className={cn("transition-all duration-300 ease-out", className)}>
      <SectionHead icon={<User width={16} height={16} />} title="About" />
      <p className="max-w-prose text-sm leading-relaxed text-foreground/65 transition-all duration-300 ease-out">
        {talent.bio || "No bio added yet."}
      </p>
    </Card>
  );
}
