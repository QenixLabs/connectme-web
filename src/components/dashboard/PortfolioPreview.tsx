"use client";

import Link from "next/link";
import Image from "next/image";
import { Folder, ImageIcon, Play, ExternalLink, Eye } from "lucide-react";
import { motion } from "motion/react";

import type { PortfolioApiResponse } from "@/lib/api/talent";
import type { PortfolioStatsResponse } from "@/lib/api/talent";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EmptyState } from "./EmptyState";
import { SectionHeading } from "./SectionHeading";

interface PortfolioPreviewProps {
  items: PortfolioApiResponse[] | undefined;
  stats: PortfolioStatsResponse | undefined;
}

function PortfolioThumb({ item }: { item: PortfolioApiResponse }) {
  const isVideo = item.type === "video";
  const isLink = item.type === "youtube" || item.type === "instagram";
  return (
    <div className="group relative aspect-square overflow-hidden rounded-xl bg-muted">
      {item.thumbnail_url || item.url ? (
        <Image
          src={item.thumbnail_url || item.url}
          alt={item.title || item.caption || "Portfolio item"}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          unoptimized
          sizes="(max-width: 640px) 50vw, 25vw"
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center">
          <ImageIcon className="size-6 text-muted-foreground" />
        </div>
      )}
      <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors duration-200 group-hover:bg-black/30">
        {isVideo && (
          <div className="flex size-10 items-center justify-center rounded-full bg-white/20 opacity-0 backdrop-blur-sm transition-opacity group-hover:opacity-100">
            <Play className="size-5 fill-white text-white" />
          </div>
        )}
        {isLink && (
          <div className="flex size-10 items-center justify-center rounded-full bg-white/20 opacity-0 backdrop-blur-sm transition-opacity group-hover:opacity-100">
            <ExternalLink className="size-5 text-white" />
          </div>
        )}
      </div>
    </div>
  );
}

export function PortfolioPreview({ items, stats }: PortfolioPreviewProps) {
  const hasItems = items && items.length > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.35, ease: [0.16, 1, 0.3, 1] }}
    >
      <SectionHeading
        title="Portfolio"
        action="Manage"
        href="/talent/portfolio"
      />

      {!hasItems ? (
        <EmptyState
          icon={Folder}
          title="No portfolio items"
          description="Upload photos, videos, or links to showcase your best work to recruiters."
          action="Add media"
          href="/talent/portfolio"
          className="mt-3"
        />
      ) : (
        <Card className="mt-3 border-border/60 bg-surface/60 py-0 transition-all duration-200 hover:border-border-hover">
          <CardContent className="p-5">
            <div className="mb-4 flex items-center gap-5 text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <Folder className="size-3.5" />
                <span className="font-medium text-foreground">{stats?.total_items ?? items!.length}</span> items
              </span>
              <span className="flex items-center gap-1.5">
                <Eye className="size-3.5" />
                <span className="font-medium text-foreground">{(stats?.total_views ?? 0).toLocaleString()}</span> views
              </span>
            </div>
            <div className="grid min-w-0 grid-cols-2 gap-3 sm:grid-cols-4">
              {items!.map((item) => (
                <Link key={item.id} href="/talent/portfolio" className="min-w-0 press-scale">
                  <PortfolioThumb item={item} />
                </Link>
              ))}
            </div>
            <Button
              asChild
              variant="outline"
              className="mt-5 w-full rounded-full border-border bg-background/50 text-foreground hover:bg-surface-2"
            >
              <Link href="/talent/portfolio">Open portfolio</Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </motion.div>
  );
}
