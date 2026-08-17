"use client";

import Link from "next/link";
import { Star, Quote, Clapperboard } from "lucide-react";
import { motion } from "motion/react";

import type { Credit, Testimonial } from "@/lib/api/talent";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SectionHeading } from "./SectionHeading";

interface CreditsTeaserProps {
  credits: Credit[] | undefined;
  testimonials: Testimonial[] | undefined;
}

export function CreditsTeaser({ credits, testimonials }: CreditsTeaserProps) {
  const credit = credits?.[0];
  const testimonial = testimonials?.[0];

  if (!credit && !testimonial) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
    >
      <SectionHeading title="Highlights" />
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        {credit && (
          <Card className="border-border/60 bg-surface/60 py-0 transition-all duration-200 hover:border-border-hover">
            <CardContent className="flex flex-col gap-4 p-5">
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-xl bg-gold/10 text-gold">
                  <Clapperboard className="size-5" />
                </div>
                <Badge
                  variant="outline"
                  className="rounded-full border-border/60 bg-background/50 px-2.5 py-0.5 text-[10px] text-muted-foreground"
                >
                  Credit
                </Badge>
              </div>
              <div className="min-w-0">
                <p className="break-words font-semibold text-foreground">{credit.project_name}</p>
                <p className="mt-0.5 break-words text-sm text-muted-foreground">
                  {credit.role_played}
                  {credit.year ? ` • ${credit.year}` : ""}
                  {credit.platform ? ` • ${credit.platform}` : ""}
                </p>
              </div>
              <Button
                asChild
                variant="ghost"
                size="sm"
                className="h-auto w-fit justify-start px-0 text-xs text-primary hover:bg-transparent hover:text-primary/80"
              >
                <Link href="/talent/profile">View all credits</Link>
              </Button>
            </CardContent>
          </Card>
        )}

        {testimonial && (
          <Card className="relative overflow-hidden border-border/60 bg-surface/60 py-0 transition-all duration-200 hover:border-border-hover">
            <div className="absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-primary to-primary/40" />
            <CardContent className="flex flex-col gap-4 p-5 pl-6">
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Quote className="size-5" />
                </div>
                <Badge
                  variant="outline"
                  className="rounded-full border-border/60 bg-background/50 px-2.5 py-0.5 text-[10px] text-muted-foreground"
                >
                  Testimonial
                </Badge>
              </div>
              <p className="line-clamp-3 break-words text-sm italic leading-relaxed text-text-secondary">
                &ldquo;{testimonial.content}&rdquo;
              </p>
              <div className="mt-auto flex items-center justify-between">
                <span className="text-xs font-medium text-foreground">
                  {testimonial.author_name}
                  {testimonial.author_company
                    ? `, ${testimonial.author_company}`
                    : ""}
                </span>
                {testimonial.rating ? (
                  <span className="flex items-center gap-0.5 text-xs text-gold">
                    <Star className="size-3 fill-gold" />
                    {testimonial.rating}
                  </span>
                ) : null}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </motion.div>
  );
}
