import type { Metadata } from "next";
import { cookies } from "next/headers";
import { TopBar } from "@/components/shared/top-bar";
import { GuestTopBar } from "@/components/shared/guest-top-bar";
import { talentNavItems, recruiterNavItems } from "@/components/shared/nav-config";

export const metadata: Metadata = {
  title: "Talent Profile | RootIn",
  description:
    "RootIn talent profile: portfolio reels, experience timeline, skills, reviews and awards.",
  openGraph: {
    title: "Talent Profile | RootIn",
    description:
      "RootIn talent profile: portfolio reels, experience timeline, skills, reviews and awards.",
    type: "profile",
  },
  twitter: {
    card: "summary_large_image",
  },
};

async function getViewer() {
  const store = await cookies();
  const session = store.get("auth_session")?.value;
  const role = store.get("user_role")?.value;
  if (!session || (role !== "talent" && role !== "recruiter" && role !== "admin")) return null;
  return { role };
}

export default async function PublicTalentProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const viewer = await getViewer();

  return (
    <div className="flex min-h-screen flex-col">
      {viewer ? (
        <TopBar
          navItems={viewer.role === "recruiter" ? recruiterNavItems : talentNavItems}
          role={viewer.role === "recruiter" ? "recruiter" : "talent"}
        />
      ) : (
        <GuestTopBar />
      )}
      <main className="flex-1">{children}</main>
    </div>
  );
}
