"use client";

import { MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";

interface EmptyListStateProps {
  error?: string | null;
  findPeopleUrl?: string;
}

export function EmptyListState({ error, findPeopleUrl }: EmptyListStateProps) {
  const router = useRouter();

  return (
    <Card className="p-8 flex flex-col items-center text-center">
      <div className="h-14 w-14 rounded-2xl bg-cream border border-border grid place-items-center mb-4">
        <MessageSquare className="h-7 w-7 text-ink-muted" strokeWidth={1.5} />
      </div>

      <p className="text-[14px] font-semibold text-ink">
        {error ? "Could not load conversations" : "No conversations yet"}
      </p>
      <p className="text-[12px] text-ink-muted mt-1.5 max-w-[260px] leading-relaxed">
        {error ||
          "Messages from recruiters and talent you connect with will appear here."}
      </p>
      {!error && findPeopleUrl && (
        <Button
          size="sm"
          className="mt-4 bg-ink hover:bg-ink-warm text-white text-[12px] rounded-full px-5 h-9"
          onClick={() => router.push(findPeopleUrl)}
        >
          Find Talent
        </Button>
      )}
    </Card>
  );
}
