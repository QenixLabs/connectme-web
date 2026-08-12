import Link from "next/link";
import { ArrowRight, Circle } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useDashboard } from "./DashboardProvider";

function getMissingFields(profile: ReturnType<typeof useDashboard>["profile"]): string[] {
  const missing: string[] = [];
  if (!profile?.date_of_birth) missing.push("Date of birth");
  if (!profile?.documents?.resume_url) missing.push("Resume");
  if (!profile?.documents?.portfolio_pdf_url) missing.push("Portfolio PDF");
  if (!profile?.headline) missing.push("Headline");
  if (!profile?.about) missing.push("About");
  if (!profile?.skills?.length) missing.push("Skills");
  if (!profile?.languages?.length) missing.push("Languages");
  return missing;
}

export function ProfileStrength() {
  const { completeness, profile } = useDashboard();
  const missing = getMissingFields(profile);
  const r = 52;
  const c = 2 * Math.PI * r;

  return (
    <Card className="mx-4 mt-4 gap-0 rounded-2xl p-4 shadow-none lg:mx-0 lg:mt-0">
      <div className="flex items-center gap-5 lg:gap-6">
        <div className="relative size-32 shrink-0 lg:size-36">
          <svg viewBox="0 0 120 120" className="size-full -rotate-90">
            <circle
              cx="60"
              cy="60"
              r={r}
              className="fill-none stroke-secondary"
              strokeWidth="9"
            />
            <circle
              cx="60"
              cy="60"
              r={r}
              className="fill-none stroke-primary"
              strokeWidth="9"
              strokeLinecap="round"
              strokeDasharray={c}
              strokeDashoffset={c * (1 - completeness / 100)}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-[28px] leading-none font-bold lg:text-[32px]">{completeness}%</span>
            <span className="mt-1 text-[10px] tracking-[0.16em] text-muted-foreground">
              COMPLETE
            </span>
          </div>
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="font-sans text-[22px] leading-tight font-bold">Profile Strength</h3>
          <p className="text-sm text-muted-foreground">
            {missing.length > 0
              ? `${missing.length} field${missing.length === 1 ? "" : "s"} remaining`
              : "Profile complete!"}
          </p>
          {missing.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {missing.map((item) => (
                <Badge
                  key={item}
                  variant="outline"
                  className="gap-1.5 rounded-full px-3 py-1.5 text-sm font-normal"
                >
                  <Circle className="size-3.5 text-muted-foreground" />
                  {item}
                </Badge>
              ))}
            </div>
          )}
        </div>
      </div>
      <Button asChild className="mt-4 w-full rounded-full bg-cream py-3 text-[15px] font-medium text-cream-foreground hover:bg-cream/90">
        <Link href="/talent/profile">
          Complete profile <ArrowRight className="size-4" />
        </Link>
      </Button>
    </Card>
  );
}
