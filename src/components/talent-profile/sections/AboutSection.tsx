"use client";

import { useState } from "react";
import { User, ChevronDown } from "lucide-react";
import { CollapsibleSection } from "../primitives";
import { cn } from "@/lib/utils";

export function AboutSection({
  bio,
  collapsible = false,
}: {
  bio: string;
  collapsible?: boolean;
}) {
  const [expanded, setExpanded] = useState(false);
  const hasLongBio = bio.length > 160;
  const canCollapse = collapsible && !!bio.trim();
  const text = bio || "No bio added yet.";

  return (
    <CollapsibleSection
      icon={<User className="size-4" />}
      title="About Me"
      collapsible={canCollapse}
    >
      <p
        className={cn(
          "text-xs leading-relaxed text-muted-foreground",
          !expanded && hasLongBio && "line-clamp-3",
        )}
      >
        {text}
      </p>
      {hasLongBio && (
        <button
          onClick={() => setExpanded((v) => !v)}
          className="mt-2 flex items-center gap-1 text-xs font-bold text-brand"
        >
          {expanded ? "Show less" : "Read More"}{" "}
          <ChevronDown
            className={cn(
              "size-3.5 transition-transform",
              expanded && "rotate-180",
            )}
          />
        </button>
      )}
    </CollapsibleSection>
  );
}
