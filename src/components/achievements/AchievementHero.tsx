"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, MoreHorizontal, Share2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface AchievementHeroProps {
  mode: "public" | "manage";
  title: string;
  subtitle: string;
  previewHref?: string;
  onShare?: () => void;
  onCopyLink?: () => void;
}

export function AchievementHero({
  mode,
  title,
  subtitle,
  previewHref,
  onShare,
  onCopyLink,
}: AchievementHeroProps) {
  return (
    <Card className="relative isolate overflow-hidden rounded-[30px] border-[#e8e1fb] bg-[linear-gradient(118deg,#ffffff_0%,#f9f7ff_48%,#e9edff_100%)] shadow-[0_18px_42px_rgba(75,61,157,0.12)]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_78%_32%,rgba(128,96,245,0.2),transparent_36%),radial-gradient(circle_at_20%_5%,rgba(96,165,250,0.16),transparent_34%)]" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-0 w-[64%] bg-[linear-gradient(90deg,#faf8ff_0%,rgba(250,248,255,0.62)_22%,transparent_74%)]" />
      <div className="absolute inset-y-0 right-0 z-0 w-[63%] sm:w-[55%]">
        <Image
          src="/assets/talent-edit/profile-skill-hero.png"
          alt=""
          fill
          priority
          sizes="(max-width: 640px) 63vw, 440px"
          className="object-contain object-right"
          aria-hidden="true"
        />
      </div>

      <CardContent className="relative z-10 min-h-[254px] p-0 sm:min-h-[278px]">
        <div className="flex items-center justify-between gap-2 px-4 pt-4 sm:px-6 sm:pt-5">
          <div className="flex min-w-0 items-center gap-2">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => window.history.back()}
              className="grid size-10 shrink-0 place-items-center rounded-full bg-white/85 text-[#17245b] shadow-[0_5px_18px_rgba(75,61,157,0.1)] transition-transform hover:bg-white active:scale-95"
              aria-label="Go back"
            >
              <ArrowLeft className="size-5" />
            </Button>
            <span className="truncate bg-gradient-to-r from-[#5330df] to-[#2563eb] bg-clip-text text-[15px] font-extrabold tracking-[-0.03em] text-transparent">
              RootIn
            </span>
          </div>

          <div className="flex shrink-0 items-center gap-1.5">
            {onShare && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={onShare}
                className="size-10 rounded-full bg-white/75 text-[#17245b] shadow-[0_5px_18px_rgba(75,61,157,0.08)] hover:bg-white"
                aria-label="Share achievements"
              >
                <Share2 className="size-[18px]" />
              </Button>
            )}
            {onCopyLink && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="size-10 rounded-full bg-white/75 text-[#17245b] shadow-[0_5px_18px_rgba(75,61,157,0.08)] hover:bg-white"
                    aria-label="More achievement options"
                  >
                    <MoreHorizontal className="size-[18px]" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-44">
                  <DropdownMenuItem onClick={onCopyLink} className="cursor-pointer">
                    Copy link
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>

        <div className="relative mt-8 max-w-[69%] px-5 pb-6 sm:mt-10 sm:max-w-[58%] sm:px-6">
          <p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-[#6846d9]">
            RootIn milestones
          </p>
          <h1 className="mt-2 text-[28px] font-bold leading-[1.02] tracking-[-0.055em] text-[#14225b] sm:text-[36px]">
            {title}
          </h1>
          <p className="mt-3 max-w-[18rem] text-[12px] leading-[1.45] text-[#5f6583] sm:text-sm">
            {subtitle}
          </p>
          {previewHref && (
            <Button
              asChild
              size="sm"
              className="mt-5 h-9 rounded-full bg-white/90 px-3.5 text-[11px] font-bold text-[#4f2bd2] shadow-[0_8px_20px_rgba(75,61,157,0.12)] hover:bg-white"
            >
              <Link href={previewHref}>
                {mode === "manage" ? "Preview Profile" : "View Public Profile"}
                <span aria-hidden="true">-&gt;</span>
              </Link>
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
