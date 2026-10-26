"use client";

import { useParams } from "next/navigation";
import { CreditsPublicPage } from "@/components/talent-profile/CreditsPublicPage";

export default function PublicTalentCreditsPage() {
  const params = useParams();
  const username = (params?.username as string) || "";

  return <CreditsPublicPage username={username} />;
}
