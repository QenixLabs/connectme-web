import type { LucideIcon } from "lucide-react";
import {
  Award,
  BadgeCheck,
  BriefcaseBusiness,
  Building2,
  Clapperboard,
  GraduationCap,
  Star,
} from "lucide-react";
import type { Achievement, AchievementType } from "@/lib/api/talent";

export type AchievementFilter = "all" | AchievementType;

export const ACHIEVEMENT_TYPE_VALUES: AchievementType[] = [
  "credit",
  "award",
  "nomination",
  "training",
  "workshop",
  "certification",
  "institution",
];

export interface AchievementTypeConfig {
  type: AchievementType;
  label: string;
  pluralLabel: string;
  icon: LucideIcon;
  iconClass: string;
  iconBackground: string;
}

export const ACHIEVEMENT_TYPE_CONFIG: Record<AchievementType, AchievementTypeConfig> = {
  credit: {
    type: "credit",
    label: "Credit",
    pluralLabel: "Credits",
    icon: BriefcaseBusiness,
    iconClass: "text-[#2563eb]",
    iconBackground: "bg-[#eff6ff]",
  },
  award: {
    type: "award",
    label: "Award",
    pluralLabel: "Awards",
    icon: Award,
    iconClass: "text-[#7c3aed]",
    iconBackground: "bg-[#f1edff]",
  },
  nomination: {
    type: "nomination",
    label: "Nomination",
    pluralLabel: "Nominations",
    icon: Star,
    iconClass: "text-[#d946ef]",
    iconBackground: "bg-[#fdf0ff]",
  },
  training: {
    type: "training",
    label: "Training",
    pluralLabel: "Trainings",
    icon: GraduationCap,
    iconClass: "text-[#4f46e5]",
    iconBackground: "bg-[#eef2ff]",
  },
  workshop: {
    type: "workshop",
    label: "Workshop",
    pluralLabel: "Workshops",
    icon: Clapperboard,
    iconClass: "text-[#2563eb]",
    iconBackground: "bg-[#eff6ff]",
  },
  certification: {
    type: "certification",
    label: "Certification",
    pluralLabel: "Certifications",
    icon: BadgeCheck,
    iconClass: "text-[#9333ea]",
    iconBackground: "bg-[#faf5ff]",
  },
  institution: {
    type: "institution",
    label: "Institution",
    pluralLabel: "Institutions",
    icon: Building2,
    iconClass: "text-[#0284c7]",
    iconBackground: "bg-[#f0f9ff]",
  },
};

export const PUBLIC_ACHIEVEMENT_TYPES: AchievementType[] = [
  "award",
  "nomination",
  "training",
  "workshop",
  "certification",
  "institution",
];

export const ACHIEVEMENT_FILTERS: Array<{
  value: AchievementFilter;
  label: string;
}> = [
  { value: "all", label: "All" },
  { value: "award", label: "Awards" },
  { value: "nomination", label: "Nominations" },
  { value: "training", label: "Trainings" },
  { value: "workshop", label: "Workshops" },
  { value: "certification", label: "Certifications" },
  { value: "institution", label: "Institutions" },
];

export const VERIFICATION_OPTIONS = [
  { value: "self_reported", label: "Self reported" },
  { value: "public_record", label: "Public record" },
  { value: "recruiter_cosigned", label: "Recruiter cosigned" },
] as const;

export function getAchievementTitle(achievement: Achievement): string {
  return (
    achievement.title ||
    achievement.project_name ||
    achievement.role_played ||
    "Untitled achievement"
  );
}

export function getAchievementOrganization(achievement: Achievement): string {
  return (
    achievement.organization ||
    achievement.awarding_body ||
    achievement.platform ||
    achievement.institution ||
    "Independent"
  );
}

export function getAchievementRole(achievement: Achievement): string | undefined {
  return achievement.role_level || achievement.role_played || achievement.trainer || achievement.director;
}

export function getAchievementMedia(achievement: Achievement): string | undefined {
  return achievement.media_url || achievement.proof_url || achievement.credit_url;
}

export function getAchievementYear(achievement: Achievement): string {
  if (achievement.start_date && achievement.end_date) {
    return `${achievement.start_date} - ${achievement.end_date}`;
  }
  return achievement.year ? String(achievement.year) : "";
}

export function isVerifiedAchievement(achievement: Achievement): boolean {
  return (
    achievement.verification_status === "public_record" ||
    achievement.verification_status === "recruiter_cosigned"
  );
}

export function getAchievementSearchText(achievement: Achievement): string {
  return [
    getAchievementTitle(achievement),
    getAchievementOrganization(achievement),
    achievement.type,
    achievement.category,
    achievement.role_level,
    achievement.role_played,
    achievement.year,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

export function getAchievementStats(achievements: Achievement[]) {
  return {
    awards: achievements.filter((item) => item.type === "award").length,
    nominations: achievements.filter((item) => item.type === "nomination").length,
    trainings: achievements.filter(
      (item) => item.type === "training" || item.type === "workshop",
    ).length,
    certifications: achievements.filter((item) => item.type === "certification").length,
    institutions: achievements.filter((item) => item.type === "institution").length,
  };
}

export function getFilterLabel(value: AchievementFilter): string {
  if (value === "all") return "All";
  return ACHIEVEMENT_TYPE_CONFIG[value].pluralLabel;
}
