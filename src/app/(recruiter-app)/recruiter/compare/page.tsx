import type { Metadata } from "next";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { CompareTalentPage } from "@/components/recruiter-app/compare-talent/CompareTalentPage";

export const metadata: Metadata = {
  title: "RootIn — Compare Talent",
  description:
    "Compare shortlisted talent side by side — trust score, availability, skills and credits — then invite the best fit.",
};

export default function RecruiterCompareRoute() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto w-full max-w-[940px] space-y-3 px-4 pt-5">
          <Skeleton className="h-10 w-1/2" />
          <Skeleton className="h-32 rounded-3xl" />
          <Skeleton className="h-64 rounded-3xl" />
        </div>
      }
    >
      <CompareTalentPage />
    </Suspense>
  );
}
