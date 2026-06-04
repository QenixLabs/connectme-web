"use client";

import { MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

interface EmptyListStateProps {
  error?: string | null;
  findPeopleUrl?: string;
}

export function EmptyListState({ error, findPeopleUrl }: EmptyListStateProps) {
  const router = useRouter();

  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="w-20 h-20 rounded-full bg-msg-gold-soft flex items-center justify-center mb-5">
        <MessageSquare className="w-9 h-9 text-msg-gold" strokeWidth={1.5} />
      </div>
      <p className="text-base font-semibold text-msg-ink">
        {error ? "Could not load conversations" : "No conversations yet"}
      </p>
      <p className="text-sm text-msg-ink-muted mt-1.5 text-center max-w-xs">
        {error || "Start messaging after connecting with others."}
      </p>
      {!error && findPeopleUrl && (
        <Button
          size="sm"
          className="mt-4 bg-msg-ink hover:bg-msg-ink-soft text-white text-xs rounded-full px-5"
          onClick={() => router.push(findPeopleUrl)}
        >
          Find Talent
        </Button>
      )}
    </div>
  );
}
