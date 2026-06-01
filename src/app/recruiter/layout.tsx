import { Suspense } from "react";

export default function RecruiterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense fallback={<div className="min-h-screen bg-page" />}>
      {children}
    </Suspense>
  );
}
