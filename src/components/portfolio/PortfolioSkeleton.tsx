"use client";

export function PortfolioSkeleton() {
  return (
    <div className="min-h-screen bg-bg-page">
      <main className="container-page pb-28 pt-6 md:py-8 lg:pb-8">
        <div className="h-9 w-32 animate-pulse rounded-xl bg-muted" />
        <div className="mt-6 h-8 w-48 animate-pulse rounded-xl bg-muted" />
        <div className="mt-2 h-5 w-64 animate-pulse rounded-lg bg-muted" />
        <div className="mt-5 flex gap-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="h-10 w-20 animate-pulse rounded-xl bg-muted"
            />
          ))}
        </div>
        <div className="mt-6 h-5 w-28 animate-pulse rounded-lg bg-muted" />
        <div className="mt-4 aspect-[21/9] w-full animate-pulse rounded-2xl bg-muted" />
        <div className="mt-6 h-5 w-24 animate-pulse rounded-lg bg-muted" />
        <div className="mt-4 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="aspect-[4/3] animate-pulse rounded-2xl bg-muted"
            />
          ))}
        </div>
      </main>
    </div>
  );
}
