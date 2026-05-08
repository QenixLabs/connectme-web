import { DashboardLayout } from "@/components/layout/dashboard-layout";

export default function TalentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <DashboardLayout role="talent" homeHref="/talent/dashboard">
      {children}
    </DashboardLayout>
  );
}
