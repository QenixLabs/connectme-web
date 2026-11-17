"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { publicContentApi, LegalKey } from "@/lib/api/admin-content";
import {
  ContentError,
  ContentLoading,
  contentDate,
} from "@/components/admin/content-shared";
import { FormattedContent } from "./formatted-content";

export function PublicLegalPage({ documentKey }: { documentKey: LegalKey }) {
  const query = useQuery({
    queryKey: ["legal-public", documentKey],
    queryFn: () => publicContentApi.legal(documentKey),
    retry: (count, error) =>
      (error as { response?: { status: number } }).response?.status !== 404 &&
      count < 2,
  });
  const unpublished =
    (query.error as { response?: { status: number } } | null)?.response
      ?.status === 404;
  return (
    <main className="mx-auto max-w-3xl space-y-8 px-5 py-12">
      <nav className="flex flex-wrap gap-5 text-sm text-primary">
        <Link href="/">Home</Link>
        <Link href="/terms">Terms &amp; Conditions</Link>
        <Link href="/privacy">Privacy Policy</Link>
      </nav>
      {query.isPending ? (
        <ContentLoading />
      ) : unpublished ? (
        <section className="rounded-lg border p-8">
          <h1 className="text-2xl font-semibold">
            {documentKey === "terms" ? "Terms & Conditions" : "Privacy Policy"}
          </h1>
          <p className="mt-3 text-muted-foreground">
            This document has not been published yet.
          </p>
        </section>
      ) : query.error ? (
        <ContentError error={query.error} retry={() => void query.refetch()} />
      ) : (
        query.data && (
          <article className="space-y-6">
            <header className="space-y-3 border-b pb-6">
              <h1 className="break-words text-3xl font-semibold">
                {query.data.title}
              </h1>
              <p className="text-sm text-muted-foreground">
                Version {query.data.version} · Effective{" "}
                {contentDate(query.data.effective_at)}
              </p>
            </header>
            <FormattedContent content={query.data.content} />
          </article>
        )
      )}
    </main>
  );
}
