"use client";

import { Bell, ChevronDown, MessageSquare, Search } from "lucide-react";
import { IconBadge } from "./IconBadge";
const avatarRahul = "/images/portfolio/p9.jpg";

export function Topbar() {
  return (
    <header className="sticky top-0 z-10 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-5 border-b border-border/30 bg-background/80 px-6 py-3.5 backdrop-blur-xl">
      <label
        className="flex min-w-0 max-w-lg items-center gap-2 rounded-xl border bg-card px-4 py-2.5 text-sm transition-all duration-200 focus-within:border-accent/20 focus-within:shadow-[var(--shadow-search),0_0_0_1px_var(--accent)]"
        style={{ borderColor: "oklch(1 0 0 / 0.05)", boxShadow: "var(--shadow-search)" }}
      >
        <Search width={16} height={16} className="mt-px shrink-0 text-muted-foreground/45" />
        <input
          placeholder="Search talents, skills, roles\u2026"
          className="min-w-0 flex-1 bg-transparent outline-none placeholder:text-muted-foreground/50"
        />
      </label>
      <div className="flex shrink-0 items-center gap-3">
        <IconBadge icon={MessageSquare} count={6} tone="primary" label="Messages" />
        <IconBadge icon={Bell} count={12} tone="warning" label="Notifications" />
        <button
          className="flex items-center gap-2 rounded-xl border bg-card px-3 py-2 text-left transition-all duration-200 hover:bg-card/80"
          style={{ borderColor: "var(--border-card)" }}
        >
          <img
            src={avatarRahul}
            alt="Rahul Verma"
            loading="lazy"
            width={512}
            height={512}
            className="h-8 w-8 rounded-full object-cover"
          />
          <span>
            <span className="block text-sm font-medium">Rahul Verma</span>
            <span className="block text-xs text-muted-foreground/50">Senior Recruiter</span>
          </span>
          <ChevronDown width={16} height={16} className="text-muted-foreground/40" />
        </button>
      </div>
    </header>
  );
}
