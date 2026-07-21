"use client";

import { type ComponentType } from "react";
import {
  User,
  FolderOpen,
  Briefcase,
  Award,
  MonitorPlay,
  MessageSquareText,
  FileText,
} from "lucide-react";

export type TabId =
  | "overview"
  | "portfolio"
  | "experience"
  | "skills"
  | "media-kit"
  | "reviews"
  | "about";

interface Tab {
  id: TabId;
  label: string;
  icon: ComponentType<{ className?: string }>;
}

const TABS: Tab[] = [
  { id: "overview", label: "Overview", icon: User },
  { id: "portfolio", label: "Portfolio", icon: FolderOpen },
  { id: "experience", label: "Experience", icon: Briefcase },
  { id: "skills", label: "Skills", icon: Award },
  { id: "media-kit", label: "Media Kit", icon: MonitorPlay },
  { id: "reviews", label: "Reviews", icon: MessageSquareText },
  { id: "about", label: "About", icon: FileText },
];

interface TabNavigationProps {
  value: TabId;
  onChange: (id: TabId) => void;
  tabs?: Tab[];
}

export function TabNavigation({ value, onChange, tabs = TABS }: TabNavigationProps) {
  return (
    <div className="mt-6">
      <div className="overflow-x-auto">
        <div className="flex w-full justify-start gap-1 md:justify-evenly border-b border-border bg-transparent px-2 pb-2">
          {tabs.map((t) => {
            const active = value === t.id;
            const Icon = t.icon;
            return (
              <button
                key={t.id}
                onClick={() => onChange(t.id)}
                className={`flex flex-col items-center gap-1 rounded-lg px-3 py-2 text-[11px] font-medium transition-colors ${
                  active
                    ? "bg-amber/10 text-amber"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                }`}
              >
                <Icon className="h-5 w-5" />
                {t.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
