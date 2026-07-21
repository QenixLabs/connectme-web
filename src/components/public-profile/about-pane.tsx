"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";

interface AboutPaneProps {
  about: string | undefined;
}

export function AboutPane({ about }: AboutPaneProps) {
  const [expanded, setExpanded] = useState(false);
  const text = about || "No bio added yet.";

  return (
    <Card className="border-border shadow-card">
      <CardContent className="p-5">
        <h2 className="mb-4 text-lg font-bold text-foreground">About</h2>
        <p className="text-sm leading-relaxed text-muted-foreground">
          {expanded
            ? text
            : text.length > 250
              ? text.slice(0, 250) + "..."
              : text}
        </p>
        {text.length > 250 && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="mt-2 text-sm font-semibold text-amber hover:underline"
          >
            {expanded ? "Show Less" : "Show More"}
          </button>
        )}
      </CardContent>
    </Card>
  );
}
