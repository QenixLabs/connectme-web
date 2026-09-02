"use client";

import Link from "next/link";
import { Upload, Eye, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";

export function PortfolioHeader({
  pinnedCount,
  onUpload,
}: {
  pinnedCount: number;
  onUpload: () => void;
}) {
  return (
    <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_auto] md:items-start">
      <div className="min-w-0">
        <h1 className="text-3xl font-bold tracking-tight">My Portfolio</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Showcase your best work to get noticed by top recruiters &amp; clients.
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <Link
          href="/talent/profile"
          className="flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-medium hover:bg-accent"
        >
          <Eye className="h-4 w-4" /> View Profile
        </Link>
        <span className="flex items-center gap-2 rounded-xl border border-teal/50 bg-card px-4 py-2.5 text-sm font-medium text-teal">
          <Crown className="h-4 w-4" /> Pinned{" "}
          <span className="text-foreground">{pinnedCount}/1</span>
        </span>
        <Button onClick={onUpload} className="hidden lg:flex">
          <Upload className="mr-2 h-4 w-4" /> Upload
        </Button>
      </div>
    </div>
  );
}
