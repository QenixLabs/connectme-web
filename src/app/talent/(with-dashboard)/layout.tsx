import { Suspense } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";

export default function TalentDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense fallback={<div className="min-h-screen bg-page" />}>
      <DashboardLayout role="talent" homeHref="/talent/dashboard">
        {children}
      </DashboardLayout>
    </Suspense>
  );
}
