"use client";

import { Award, ChevronRight } from "lucide-react";
import { CollapsibleSection } from "../primitives";
import type { AwardItem } from "../data";

export function AwardsSection({
  data,
  collapsible = false,
}: {
  data: AwardItem[];
  collapsible?: boolean;
}) {
  return (
    <CollapsibleSection
      icon={<Award className="size-4" />}
      title="Awards"
      collapsible={collapsible && data.length > 0}
    >
      {data.length === 0 ? (
        <p className="py-6 text-center text-sm text-muted-foreground/60">
          No awards added yet.
        </p>
      ) : (
        <ul className="space-y-2">
          {data.map((a) => (
            <li
              key={a.id}
              className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-2 border-b border-border/60 pb-2 last:border-0 last:pb-0"
            >
              <Award className="size-4 shrink-0 text-warning" />
              <div className="min-w-0">
                <p className="truncate text-[11px] font-bold text-foreground">
                  {a.name}
                </p>
                <p className="truncate text-[10px] text-muted-foreground">
                  {a.issuer}
                </p>
              </div>
              <ChevronRight className="size-3.5 shrink-0 text-muted-foreground" />
            </li>
          ))}
        </ul>
      )}
    </CollapsibleSection>
  );
}
