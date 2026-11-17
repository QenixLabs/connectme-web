"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Megaphone } from "lucide-react";
import { useAuthStore } from "@/providers/auth-store-provider";
import { publicContentApi } from "@/lib/api/admin-content";
import { Button } from "@/components/ui/button";
import {
  ContentPagination,
  contentDate,
} from "@/components/admin/content-shared";
import { safeActionLink } from "./formatted-content";

export function CommunicationFeed() {
  const { user } = useAuthStore();
  const [page, setPage] = useState(1);
  const query = useQuery({
    queryKey: ["communications-feed", user?._id, user?.role, page],
    queryFn: () => publicContentApi.feed(page),
    enabled: !!user,
    refetchInterval: 60000,
  });
  if (!user) return null;
  if (query.isPending)
    return (
      <p
        role="status"
        className="p-3 text-center text-xs text-muted-foreground"
      >
        Loading updates…
      </p>
    );
  if (query.error)
    return (
      <div
        role="alert"
        className="flex items-center justify-center gap-3 p-3 text-xs text-muted-foreground"
      >
        Updates unavailable.
        <Button size="sm" variant="ghost" onClick={() => void query.refetch()}>
          Retry
        </Button>
      </div>
    );
  if (!query.data || query.data.total === 0) return null;
  return (
    <section
      aria-label="Platform updates"
      className="mx-auto w-full max-w-6xl space-y-3 px-4 py-4 sm:px-6"
    >
      <h2 className="flex items-center gap-2 text-sm font-semibold">
        <Megaphone className="size-4" />
        Notices &amp; announcements
      </h2>
      {query.data.items.map((item) => (
        <details
          key={item._id}
          className={`rounded-lg border p-4 ${item.kind === "notice" ? "border-primary/25 bg-primary/5" : "bg-background"}`}
          open={item.kind === "notice"}
        >
          <summary className="cursor-pointer break-words text-sm font-semibold">
            {item.title}
            <span className="ml-2 text-xs font-normal capitalize text-muted-foreground">
              {item.kind}
            </span>
          </summary>
          <p className="mt-3 whitespace-pre-wrap break-words text-sm leading-6">
            {item.message}
          </p>
          {safeActionLink(item.action_link) && (
            <a
              className="mt-3 inline-block text-sm text-primary underline"
              href={safeActionLink(item.action_link)}
            >
              Learn more
            </a>
          )}
          <p className="mt-3 text-xs text-muted-foreground">
            {contentDate(item.published_at)}
          </p>
        </details>
      ))}
      {(query.data.total_pages > 1 || page > 1) && (
        <ContentPagination
          page={page}
          pages={query.data.total_pages}
          total={query.data.total}
          onChange={setPage}
        />
      )}
    </section>
  );
}
