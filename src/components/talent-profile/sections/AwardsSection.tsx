"use client";

import Link from "next/link";
import { Trophy, ArrowRight } from "lucide-react";
import { GlassCard, SectionHeader } from "../primitives";
import type { AwardItem } from "../data";

export function AwardsSection({
  data,
  isOwner = false,
}: {
  data: AwardItem[];
  isOwner?: boolean;
}) {
  return (
    <GlassCard>
      <SectionHeader
        icon={<Trophy className="size-4" />}
        title="Awards & Recognitions"
      />
      {data.length === 0 ? (
        <div className="py-4 text-center sm:py-5">
          <p className="text-sm text-muted-foreground/60">
            No awards added yet.
          </p>
          {isOwner && (
            <Link
              href="/talent/profile"
              className="mt-1.5 inline-flex items-center gap-1 text-sm font-medium text-rootin transition-colors hover:text-rootin/80"
            >
              Add your first award
              <ArrowRight className="size-3.5" />
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          {data.map((award) => (
            <div
              key={award.id}
              className="group flex items-start gap-3 rounded-xl border border-transparent p-2.5 transition-all duration-200 hover:border-gold/20 hover:bg-gold/[0.04]"
            >
              <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-accent-amber-bg">
                <Trophy className="size-4 text-gold transition-transform group-hover:scale-110" />
              </span>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-foreground/90">
                  {award.name}
                </p>
                <p className="text-xs text-muted-foreground/60">{award.issuer}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </GlassCard>
  );
}
