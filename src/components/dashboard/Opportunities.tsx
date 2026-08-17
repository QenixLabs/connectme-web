"use client";

import Image from "next/image";
import Link from "next/link";
import { MapPin, Users, Calendar, Briefcase } from "lucide-react";
import { motion } from "motion/react";
import { formatDistanceToNow } from "date-fns";

import type { CampaignRecommendation } from "@/lib/api/campaigns";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { EmptyState } from "./EmptyState";
import { SectionHeading } from "./SectionHeading";

interface OpportunitiesProps {
  campaigns: CampaignRecommendation[] | undefined;
}

export function Opportunities({ campaigns }: OpportunitiesProps) {
  const hasItems = campaigns && campaigns.length > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
    >
      <SectionHeading
        title="Opportunities for you"
        action="View all"
        href="/talent/opportunities"
      />

      {!hasItems ? (
        <EmptyState
          icon={Briefcase}
          title="No opportunities yet"
          description="New casting calls and campaigns will appear here once they match your profile."
          action="Browse all"
          href="/talent/opportunities"
          className="mt-3"
        />
      ) : (
        <Carousel
          opts={{ align: "start", dragFree: true }}
          className="mt-3 w-full"
        >
          <CarouselContent className="-ml-3">
            {campaigns!.map((item) => (
              <CarouselItem
                key={item._id}
                className="basis-[85%] snap-start pl-3 sm:basis-[58%] md:basis-[48%] lg:basis-1/2 xl:basis-1/3"
              >
                <Link href={`/talent/opportunities/${item._id}`} className="group press-scale block">
                  <Card className="h-full overflow-hidden border-border/60 bg-surface/60 py-0 transition-all duration-200 hover:scale-[1.01] hover:border-border-hover hover:bg-surface hover:shadow-card">
                    <div className="relative h-36 overflow-hidden bg-muted sm:h-40">
                      {item.cover_image_url ? (
                        <Image
                          src={item.cover_image_url}
                          alt={item.name}
                          fill
                          className="object-cover transition-transform duration-500 group-hover:scale-105"
                          unoptimized
                          sizes="(max-width: 768px) 88vw, (max-width: 1024px) 50vw, 33vw"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/10 to-transparent">
                          <Briefcase className="size-10 text-primary/40" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-background/60 to-transparent" />
                      <Badge
                        variant="outline"
                        className="absolute left-3 top-3 rounded-full border-border/60 bg-background/80 px-2.5 py-0.5 text-[10px] font-medium text-foreground backdrop-blur"
                      >
                        {item.role_type || "Opportunity"}
                      </Badge>
                    </div>
                    <CardContent className="flex flex-col gap-2 p-4">
                      <h4 className="truncate text-base font-semibold text-foreground">
                        {item.name}
                      </h4>
                      <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <MapPin className="size-3.5" />
                          {item.location?.city || "Remote"}
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="size-3.5" />
                          {item.applications_count} applied
                        </span>
                      </div>
                      {item.deadline && (
                        <div className="flex items-center gap-1.5 text-[11px] font-medium text-gold">
                          <Calendar className="size-3.5" />
                          Closes{" "}
                          {formatDistanceToNow(new Date(item.deadline), {
                            addSuffix: true,
                          })}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </Link>
              </CarouselItem>
            ))}
          </CarouselContent>
          <div className="hidden lg:block">
            <CarouselPrevious className="-left-3 border-border bg-surface text-foreground hover:bg-surface-2" />
            <CarouselNext className="-right-3 border-border bg-surface text-foreground hover:bg-surface-2" />
          </div>
        </Carousel>
      )}
    </motion.div>
  );
}
