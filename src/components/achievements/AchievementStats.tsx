import { Award, BadgeCheck, Building2, GraduationCap, Star } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import type { Achievement } from "@/lib/api/talent";
import { getAchievementStats } from "./achievement-types";

const statItems = [
  { key: "awards", label: "Awards", icon: Award, tone: "text-[#7c3aed]", background: "bg-[#f1edff]" },
  { key: "nominations", label: "Nominations", icon: Star, tone: "text-[#d946ef]", background: "bg-[#fdf0ff]" },
  { key: "trainings", label: "Trainings", icon: GraduationCap, tone: "text-[#4f46e5]", background: "bg-[#eef2ff]" },
  { key: "certifications", label: "Certifications", icon: BadgeCheck, tone: "text-[#9333ea]", background: "bg-[#faf5ff]" },
  { key: "institutions", label: "Institutions", icon: Building2, tone: "text-[#0284c7]", background: "bg-[#f0f9ff]" },
] as const;

export function AchievementStats({ achievements }: { achievements: Achievement[] }) {
  const stats = getAchievementStats(achievements);

  return (
    <Card className="rounded-[24px] border-[#e9e6f7] bg-white/95 shadow-[0_10px_28px_rgba(75,61,157,0.08)]">
      <CardContent className="no-scrollbar flex overflow-x-auto p-2 sm:grid sm:grid-cols-5 sm:overflow-visible sm:p-3">
        {statItems.map((item, index) => {
          const Icon = item.icon;
          return (
            <div
              key={item.key}
              className={`flex min-w-[106px] flex-1 items-center gap-2.5 px-2.5 py-2.5 sm:min-w-0 sm:justify-center sm:px-2 ${
                index > 0 ? "border-l border-[#e7e4f5]" : ""
              }`}
            >
              <span className={`grid size-10 shrink-0 place-items-center rounded-[14px] ${item.background} ${item.tone}`}>
                <Icon className="size-[21px]" strokeWidth={2.2} />
              </span>
              <span className="min-w-0">
                <strong className="block text-[19px] font-extrabold leading-none tracking-[-0.04em] text-[#13225c]">
                  {stats[item.key]}
                </strong>
                <span className="mt-1 block truncate text-[10px] font-semibold text-[#737895]">
                  {item.label}
                </span>
              </span>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
