"use client";

import { useState } from "react";
import { ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import type { Credit } from "@/lib/validations/credit-testimonial.schema";

const CREDIT_CATEGORIES = [
  { key: "all", label: "All" },
  { key: "Film", label: "Film" },
  { key: "Web Series", label: "Web Series" },
  { key: "TV", label: "TV" },
  { key: "Commercial", label: "Commercial" },
  { key: "Music Video", label: "Music Video" },
  { key: "Theatre", label: "Theatre" },
] as const;

function deriveCategory(credit: Credit): string {
  const platform = (credit.platform || "").toLowerCase();
  if (platform.includes("netflix") || platform.includes("amazon") || platform.includes("web")) return "Web Series";
  if (platform.includes("tv") || platform.includes("television")) return "TV";
  if (platform.includes("film") || platform.includes("movie")) return "Film";
  if (platform.includes("commercial") || platform.includes("ad")) return "Commercial";
  if (platform.includes("music") || platform.includes("song") || platform.includes("video")) return "Music Video";
  if (platform.includes("theatre") || platform.includes("stage") || platform.includes("play")) return "Theatre";
  return "Film";
}

interface ExperienceSectionProps {
  credits: Credit[];
  preview?: boolean;
}

export function ExperienceSection({ credits, preview = false }: ExperienceSectionProps) {
  const [activeFilter, setActiveFilter] = useState<string>("all");

  const filtered =
    activeFilter === "all"
      ? credits
      : credits.filter((c) => deriveCategory(c) === activeFilter);

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
          {CREDIT_CATEGORIES.map((f) => (
            <button
              key={f.key}
              onClick={() => setActiveFilter(f.key)}
              className={`rounded-full border px-3 py-1 text-xs font-medium transition ${
                activeFilter === f.key
                  ? "border-amber bg-amber text-amber-foreground"
                  : "border-border text-muted-foreground hover:border-foreground/40 hover:text-foreground"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {displayed.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            No credits added yet
          </p>
        ) : (
        <div className="relative space-y-4 border-l border-border pl-6">
          {displayed.map((exp) => (
            <div key={exp._id} className="relative">
              <span className="absolute -left-[27px] top-1 flex h-3 w-3 items-center justify-center rounded-full border-2 border-amber bg-background" />
              <div className="flex flex-wrap items-start gap-3">
                <span className="text-xs font-semibold text-muted-foreground">
                  {exp.year}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-semibold text-foreground">
                    {exp.project_name}{" "}
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
                  {exp.role_played}
                </Badge>
              </div>
            </div>
          ))}
        </div>
        )}
      </CardContent>
    </Card>
  );
}
