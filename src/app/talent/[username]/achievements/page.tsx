"use client";

import { useParams } from "next/navigation";
import { AchievementPublicPage } from "@/components/achievements";

export default function PublicTalentAchievementsPage() {
  const params = useParams();
  const username = (params?.username as string) || "";

  return <AchievementPublicPage username={username} />;
}
