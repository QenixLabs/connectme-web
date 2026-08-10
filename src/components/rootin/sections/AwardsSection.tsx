"use client";

import { Trophy } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, SectionHead, EmptyState } from "../primitives";
import type { AwardItem } from "./types";

export interface AwardsSectionProps {
  data: AwardItem[];
  className?: string;
}

export function AwardsSection({ data, className }: AwardsSectionProps) {
  const [featured, ...rest] = data;

  return (
    <Card className={cn("transition-all duration-300 ease-out", className)}>
      <SectionHead
        icon={<Trophy width={16} height={16} className="text-gold" />}
        title="Awards & Recognitions"
        action="View All"
      />

      {!featured ? (
        <EmptyState icon={<Trophy width={32} height={32} />} message="No awards added yet." />
      ) : (
        <div className="space-y-3">
          <div
            className="group rounded-xl border bg-surface p-4 transition-all duration-200 hover:-translate-y-px hover:bg-surface/90"
            style={{ borderColor: "var(--border-card)" }}
          >
            <Trophy
              width={32}
              height={32}
              className="mx-auto mb-2 text-gold transition-transform duration-200 group-hover:scale-110 group-hover:drop-shadow-[0_0_6px_var(--gold)]"
            />
            <p className="text-sm font-semibold leading-snug text-foreground/85">{featured.name}</p>
            <p className="mt-1 text-xs leading-snug text-muted-foreground/50">{featured.issuer}</p>
          </div>

          {rest.length > 0 && (
            <div
              className={cn(
                "grid gap-2.5",
                rest.length === 1
                  ? "grid-cols-1"
                  : "grid-cols-2",
              )}
            >
              {rest.map((a) => (
                <div
                  key={a.name}
                  className={cn(
                    "group rounded-xl border bg-surface px-2.5 py-2 text-center transition-all duration-200 hover:-translate-y-px hover:bg-surface/90",
                    rest.length % 2 !== 0 && a === rest[rest.length - 1] && "col-span-2 justify-self-center w-3/4",
                  )}
                  style={{ borderColor: "var(--border-card)" }}
                >
                  <Trophy
                    width={18}
                    height={18}
                    className="mx-auto mb-1.5 text-gold/70 transition-transform duration-200 group-hover:scale-110 group-hover:drop-shadow-[0_0_4px_var(--gold)]"
                  />
                  <p className="text-[11px] font-semibold leading-snug text-foreground/75">{a.name}</p>
                  <p className="mt-0.5 text-[10px] leading-snug text-muted-foreground/45">{a.issuer}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </Card>
  );
}
