import { Suspense } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";

export default function RecruiterDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense fallback={<div className="min-h-screen bg-page" />}>
      <DashboardLayout role="recruiter" homeHref="/recruiter/dashboard">
        {children}
      </DashboardLayout>
    </Suspense>
  );
}
