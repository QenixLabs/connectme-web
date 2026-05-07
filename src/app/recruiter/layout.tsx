import { DashboardLayout } from "@/components/layout/dashboard-layout";

export default function RecruiterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <DashboardLayout role="recruiter" homeHref="/recruiter/dashboard">
      {children}
    </DashboardLayout>
  );
}
