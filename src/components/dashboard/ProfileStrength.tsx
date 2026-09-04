"use client";

import Link from "next/link";
import { ArrowRight, Circle, CheckCircle2 } from "lucide-react";
import { motion } from "motion/react";

import type { TalentProfile } from "@/lib/api/talent";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { AnimatedNumber } from "./AnimatedNumber";

function getMissingFields(profile: TalentProfile | undefined): string[] {
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

interface ProfileStrengthProps {
  profile: TalentProfile | undefined;
  completeness: number;
}

export function ProfileStrength({ profile, completeness }: ProfileStrengthProps) {
  const missing = getMissingFields(profile);
  const r = 54;
  const c = 2 * Math.PI * r;
  const offset = c * (1 - completeness / 100);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
    >
      <Card className="h-full border-border/60 bg-surface/60 py-0 transition-all duration-200 hover:border-border-hover">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
        <CardContent className="flex flex-col items-center gap-5 p-5 text-center sm:flex-row sm:items-center sm:text-left lg:flex-col lg:items-stretch lg:gap-6">
          <div className="relative mx-auto size-28 shrink-0 sm:size-32 lg:size-36">
            <svg viewBox="0 0 120 120" className="size-full -rotate-90">
              <circle
                cx="60"
                cy="60"
                r={r}
                className="fill-none stroke-primary/10"
                strokeWidth="8"
              />
              <motion.circle
                cx="60"
                cy="60"
                r={r}
                className="fill-none stroke-primary"
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={c}
                initial={{ strokeDashoffset: c }}
                animate={{ strokeDashoffset: offset }}
                transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                style={{
                  filter: "drop-shadow(0 0 8px rgba(26,91,219,0.5))",
                }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <AnimatedNumber
                value={completeness}
                formatter={(n) => `${Math.round(n)}%`}
                className="text-[30px] font-bold leading-none"
              />
              <span className="mt-1 text-[10px] font-semibold tracking-[0.14em] text-muted-foreground uppercase">
                Complete
              </span>
            </div>
          </div>

          <div className="min-w-0 flex-1">
            <h3 className="text-base font-semibold text-foreground">
              Profile Strength
            </h3>
            <p className="mt-0.5 text-sm text-muted-foreground">
              {missing.length > 0
                ? `${missing.length} field${missing.length === 1 ? "" : "s"} remaining`
                : "Your profile is complete"}
            </p>
            {missing.length > 0 && (
              <ul className="mt-3 space-y-2">
                {missing.slice(0, 4).map((item) => (
                  <li
                    key={item}
                    className="flex items-center gap-2 text-xs text-text-secondary"
                  >
                    <Circle className="size-2 shrink-0 fill-muted-foreground text-muted-foreground" />
                    {item}
                  </li>
                ))}
                {missing.length > 4 && (
                  <li className="text-xs text-muted-foreground">
                    +{missing.length - 4} more
                  </li>
                )}
              </ul>
            )}
            {missing.length === 0 && (
              <div className="mt-3 flex items-center gap-2 text-xs text-green">
                <CheckCircle2 className="size-4" />
                <span>All set — recruiters can find you</span>
              </div>
            )}
          </div>
        </CardContent>
        <CardFooter className="px-5 pb-5 pt-0">
          <Button
            asChild
            className="w-full rounded-full bg-gradient-to-r from-primary to-primary/90 py-2 text-sm font-medium text-primary-foreground shadow-button hover:shadow-button-hover"
          >
            <Link href="/talent/profile">
              {missing.length > 0 ? "Complete profile" : "View profile"}
              <ArrowRight className="size-4" />
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
}
