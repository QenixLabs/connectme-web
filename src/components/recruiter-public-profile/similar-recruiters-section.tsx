"use client";

import { Card } from "@/components/ui/card";

const MOCK_RECRUITERS: Array<{
  name: string;
  industry: string;
  jobs: number;
  verified: boolean;
  initials: string;
}> = [
  { name: "Bollywood Casting Co.", industry: "Media & Entertainment", jobs: 8, verified: true, initials: "BC" },
  { name: "Digital Ads Agency", industry: "Advertising", jobs: 12, verified: true, initials: "DA" },
  { name: "Film Productions Ltd.", industry: "Film & TV", jobs: 5, verified: false, initials: "FP" },
];

export function SimilarRecruitersSection() {
  if (MOCK_RECRUITERS.length === 0) return null;

  return (
    <section className="mt-6">
      <p className="mb-3 text-[13px] font-semibold text-foreground">
        Similar Companies
      </p>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {MOCK_RECRUITERS.map((r) => (
          <Card
            key={r.name}
            className="flex items-center gap-4 border-border p-4 shadow-card transition hover:bg-muted/50"
          >
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary text-base font-bold text-primary-foreground">
              {r.initials}
            </div>
            <div className="min-w-0">
              <div className="text-sm font-semibold">{r.name}</div>
              <div className="text-xs text-muted-foreground">
                {r.industry} · {r.jobs} active jobs
              </div>
            </div>
          </Card>
        ))}
      </div>
    </section>
  );
}
