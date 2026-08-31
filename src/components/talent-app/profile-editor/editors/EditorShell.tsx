"use client";

import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface EditorShellProps {
  title: string;
  onBack: () => void;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export function EditorShell({
  title,
  onBack,
  action,
  children,
  className,
}: EditorShellProps) {
  return (
    <div className={cn("flex min-h-full flex-col bg-background", className)}>
      <header className="sticky top-0 z-30 flex items-center justify-between gap-3 border-b bg-background/95 px-4 py-3 backdrop-blur">
        <Button variant="ghost" size="icon" onClick={onBack} aria-label="Back">
          <ArrowLeft className="size-5" />
        </Button>
        <h2 className="min-w-0 flex-1 truncate text-center text-base font-semibold">
          {title}
        </h2>
        <div className="flex w-9 justify-end">
          {action || <span className="size-9" />}
        </div>
      </header>

      <div className="flex-1 space-y-5 px-4 py-5">{children}</div>
    </div>
  );
}

export function SaveAction({ onClick, label = "Save" }: { onClick: () => void; label?: string }) {
  return (
    <Button variant="ghost" size="sm" onClick={onClick} className="font-semibold">
      {label}
    </Button>
  );
}

export function AddAction({ onClick, label = "Add" }: { onClick: () => void; label?: string }) {
  return (
    <Button variant="ghost" size="sm" onClick={onClick} className="font-semibold">
      {label}
    </Button>
  );
}
