"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PortfolioHeaderProps {
  username: string;
  isOwner?: boolean;
  onAddWork?: () => void;
}

export function PortfolioHeader({ username, isOwner, onAddWork }: PortfolioHeaderProps) {
  const router = useRouter();

  return (
    <header className="flex items-center justify-between gap-4">
      <button
        onClick={() => router.push(`/talent/${username}`)}
        className="profile-inset inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-foreground/80 transition-colors hover:bg-bg-surface"
      >
        <ArrowLeft className="size-4" />
        {isOwner ? "Profile" : "Talent Profile"}
      </button>

      {isOwner && (
        <Button
          onClick={onAddWork}
          size="sm"
          className="gap-1.5 rounded-xl bg-primary px-4 text-primary-foreground shadow-button hover:bg-primary/90"
        >
          <Plus className="size-4" />
          <span className="hidden sm:inline">Add Work</span>
          <span className="sm:hidden">Add</span>
        </Button>
      )}
    </header>
  );
}
