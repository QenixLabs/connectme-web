"use client";

import { DashboardProvider } from "@/components/dashboard/DashboardProvider";
import { ProfileHeader } from "@/components/dashboard/ProfileHeader";
import { ProfileStrength } from "@/components/dashboard/ProfileStrength";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { Overview } from "@/components/dashboard/Overview";
import { PlanBanner } from "@/components/dashboard/PlanBanner";
import { Upcoming } from "@/components/dashboard/Upcoming";
import { Opportunities } from "@/components/dashboard/Opportunities";
import { RecentActivity } from "@/components/dashboard/RecentActivity";
import { Recommended } from "@/components/dashboard/Recommended";

export function DashboardContent() {
  return (
    <DashboardProvider>
      <div className="bg-background font-sans">
        <main className="mx-auto max-w-[520px] lg:max-w-none">
          <div className="mt-2 space-y-6 lg:mt-6 lg:grid lg:grid-cols-2 lg:gap-6 lg:space-y-0 lg:px-8">
            <ProfileHeader />
            <ProfileStrength />
            <QuickActions />
            <Overview />
            <div className="lg:col-span-2">
              <PlanBanner />
            </div>
            <Upcoming />
            <Opportunities />
            <RecentActivity />
            <Recommended />
          </div>
        </main>
      </div>
    </DashboardProvider>
  );
}
