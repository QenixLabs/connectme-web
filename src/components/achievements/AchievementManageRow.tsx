import { BadgeCheck, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Achievement } from "@/lib/api/talent";
import {
  ACHIEVEMENT_TYPE_CONFIG,
  getAchievementOrganization,
  getAchievementTitle,
  getAchievementYear,
  isVerifiedAchievement,
} from "./achievement-types";
import { AchievementMedia } from "./AchievementCard";

interface AchievementManageRowProps {
  achievement: Achievement;
  onEdit: () => void;
  onDelete: () => void;
}

export function AchievementManageRow({
  achievement,
  onEdit,
  onDelete,
}: AchievementManageRowProps) {
  const config = ACHIEVEMENT_TYPE_CONFIG[achievement.type];

  return (
    <Card className="rounded-[22px] border-[#e9e6f7] bg-white shadow-[0_8px_22px_rgba(36,43,93,0.06)] transition-shadow hover:shadow-[0_12px_28px_rgba(36,43,93,0.1)]">
      <CardContent className="flex min-w-0 items-center gap-3 p-3 sm:p-3.5">
        <AchievementMedia achievement={achievement} className="size-[58px] shrink-0 rounded-[15px]" />
        <div className="min-w-0 flex-1">
          <div className="flex min-w-0 items-start gap-2">
            <div className="min-w-0 flex-1">
              <h3 className="truncate text-[13px] font-extrabold tracking-[-0.02em] text-[#14225b]">
                {getAchievementTitle(achievement)}
              </h3>
              <p className="mt-0.5 truncate text-[11px] text-[#687092]">
                {getAchievementOrganization(achievement)}
              </p>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  className="-mr-1 -mt-1 size-8 rounded-full text-[#737895] hover:bg-[#f1edff] hover:text-[#5730dc]"
                  aria-label={`More options for ${getAchievementTitle(achievement)}`}
                >
                  <MoreHorizontal className="size-[17px]" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-36">
                <DropdownMenuItem onClick={onEdit} className="cursor-pointer">
                  <Pencil className="mr-2 size-3.5" /> Edit
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onDelete} className="cursor-pointer text-destructive focus:text-destructive">
                  <Trash2 className="mr-2 size-3.5" /> Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <div className="mt-1.5 flex min-w-0 flex-wrap items-center gap-1.5">
            <Badge className="h-5 rounded-full bg-[#f1edff] px-2 text-[9px] font-bold text-[#5e34d7] hover:bg-[#f1edff]">
              {config.label}
            </Badge>
            {achievement.featured && (
              <Badge className="h-5 rounded-full bg-[#fff4c8] px-2 text-[9px] font-bold text-[#a16207] hover:bg-[#fff4c8]">
                Featured
              </Badge>
            )}
            {isVerifiedAchievement(achievement) && (
              <span className="inline-flex items-center gap-1 text-[9px] font-semibold text-[#18805a]">
                <BadgeCheck className="size-3.5" /> Verified
              </span>
            )}
            {getAchievementYear(achievement) && (
              <span className="text-[10px] font-semibold text-[#8a8da8]">
                {getAchievementYear(achievement)}
              </span>
            )}
          </div>
        </div>
        <div className="hidden shrink-0 items-center gap-1 sm:flex">
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={onEdit}
            className="size-9 rounded-full text-[#5e34d7] hover:bg-[#f1edff]"
            aria-label={`Edit ${getAchievementTitle(achievement)}`}
          >
            <Pencil className="size-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={onDelete}
            className="size-9 rounded-full text-[#d04b66] hover:bg-[#fff0f2]"
            aria-label={`Delete ${getAchievementTitle(achievement)}`}
          >
            <Trash2 className="size-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
