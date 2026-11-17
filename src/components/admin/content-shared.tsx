"use client";

import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getApiErrorMessage } from "@/lib/api/client";

export const contentDate = (value?: string) =>
  value ? new Date(value).toLocaleString() : "—";

export function ContentLoading() {
  return (
    <div
      role="status"
      className="flex items-center justify-center gap-2 rounded-lg border p-12 text-sm text-muted-foreground"
    >
      <Loader2 className="size-4 animate-spin" /> Loading…
    </div>
  );
}

export function ContentError({
  error,
  retry,
}: {
  error: unknown;
  retry: () => void;
}) {
  return (
    <div
      role="alert"
      className="space-y-3 rounded-lg border border-destructive/30 p-6"
    >
      <p className="text-sm text-destructive">
        {getApiErrorMessage(error, "Could not load content.")}
      </p>
      <Button variant="outline" onClick={retry}>
        Try again
      </Button>
    </div>
  );
}

export function ContentPagination({
  page,
  pages,
  total,
  onChange,
}: {
  page: number;
  pages: number;
  total: number;
  onChange: (page: number) => void;
}) {
  return (
    <nav
      aria-label="Pagination"
      className="flex flex-wrap items-center justify-between gap-3 pt-3 text-sm text-muted-foreground"
    >
      <span>
        {total} items · Page {page} of {Math.max(1, pages)}
      </span>
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          disabled={page <= 1}
          onClick={() => onChange(page - 1)}
        >
          Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          disabled={page >= pages}
          onClick={() => onChange(page + 1)}
        >
          Next
        </Button>
      </div>
    </nav>
  );
}
