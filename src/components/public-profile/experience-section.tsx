"use client";

import { useState } from "react";
import { ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import type { MockCredit } from "@/lib/mocks/public-profile";
import { CREDIT_TYPES } from "@/lib/mocks/public-profile";

interface ExperienceSectionProps {
  credits: MockCredit[];
  preview?: boolean;
}

export function ExperienceSection({ credits, preview = false }: ExperienceSectionProps) {
  const [activeFilter, setActiveFilter] = useState<string>("all");

  const filtered =
    activeFilter === "all"
      ? credits
      : credits.filter((c) => c.type === activeFilter);

  const displayed = preview ? filtered.slice(0, 3) : filtered;

  return (
    <Card className="border-border shadow-card">
      <CardContent className="p-5">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-foreground">Experience</h2>
          {preview && credits.length > 3 && (
            <button className="text-sm font-semibold text-amber hover:underline">
              View All <ChevronRight className="inline h-4 w-4" />
            </button>
          )}
        </div>

        <div className="mb-4 flex flex-wrap gap-2">
          {CREDIT_TYPES.map((f, i) => (
            <button
              key={f.key}
              onClick={() => setActiveFilter(f.key)}
              className={`rounded-full border px-3 py-1 text-xs font-medium transition ${
                (i === 0 && activeFilter === "all") || activeFilter === f.key
                  ? "border-amber bg-amber text-amber-foreground"
                  : "border-border text-muted-foreground hover:border-foreground/40 hover:text-foreground"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        <div className="relative space-y-4 border-l border-border pl-6">
          {displayed.map((exp) => (
            <div key={exp.id} className="relative">
              <span className="absolute -left-[27px] top-1 flex h-3 w-3 items-center justify-center rounded-full border-2 border-amber bg-background" />
              <div className="flex flex-wrap items-start gap-3">
                <span className="text-xs font-semibold text-muted-foreground">
                  {exp.year}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-semibold text-foreground">
                    {exp.title}{" "}
                    {exp.platform && (
                      <span className="text-muted-foreground">
                        ({exp.platform})
                      </span>
                    )}
                  </div>
                  {exp.director && (
                    <div className="mt-0.5 text-xs text-muted-foreground">
                      {exp.director.startsWith("Director:") || exp.director.startsWith("Agency:") || exp.director.startsWith("Artist:") || exp.director.startsWith("Theatre Group:")
                        ? exp.director
                        : `Director: ${exp.director}`}
                    </div>
                  )}
                </div>
                <Badge
                  variant="outline"
                  className="border-amber/40 bg-amber/10 text-[11px] font-semibold text-foreground"
                >
                  {exp.role}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
