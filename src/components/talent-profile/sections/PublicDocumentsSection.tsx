"use client";

import { FileText } from "lucide-react";
import Link from "next/link";
import type { PortfolioApiResponse } from "@/lib/api/talent";
import { toPortfolioItems } from "../data";
import { GlassCard } from "../primitives";

export function PublicDocumentsSection({
  items,
  username,
  onOpen,
}: {
  items: PortfolioApiResponse[];
  username: string;
  onOpen: (itemId: string) => void;
}) {
  const documents = toPortfolioItems(items.filter((item) => item.type === "document"));

  if (documents.length === 0) return null;

  return (
    <GlassCard>
      <div className="mb-3 flex items-center gap-2">
        <span className="grid size-6 place-items-center rounded-md bg-secondary">
          <FileText className="size-3.5 text-brand" />
         </span>
         <h2 className="text-[15px] font-bold text-foreground">Documents</h2>
         <Link
           href={`/talent/${encodeURIComponent(username)}/portfolio`}
           className="ml-auto shrink-0 text-xs font-semibold text-brand transition-colors hover:text-brand/80"
         >
           View All
         </Link>
      </div>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {documents.map((document) => (
          <button
            key={document.id}
            type="button"
            onClick={() => onOpen(document.id)}
            className="flex min-w-0 items-center gap-3 rounded-xl border border-border/70 bg-background/50 px-3 py-3 text-left transition-colors hover:bg-secondary"
          >
            <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-secondary text-brand">
              <FileText className="size-5" />
            </span>
            <span className="min-w-0">
              <span className="block truncate text-sm font-semibold text-foreground">{document.title}</span>
              <span className="mt-0.5 block truncate text-xs text-muted-foreground">
                {document.fileName || "Portfolio document"}
              </span>
            </span>
          </button>
        ))}
      </div>
    </GlassCard>
  );
}
