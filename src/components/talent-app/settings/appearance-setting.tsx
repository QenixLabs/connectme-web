"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Moon, Palette, Sun } from "lucide-react";

import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

export function AppearanceSetting() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const activeTheme = theme ?? resolvedTheme ?? "light";
  const isDark = mounted && activeTheme === "dark";

  function handleCheckedChange(checked: boolean) {
    setTheme(checked ? "dark" : "light");
  }

  return (
    <Card className="overflow-hidden rounded-[19px] border-[#e4ddf8] bg-white/90 py-0 shadow-[0_10px_30px_rgba(69,47,160,0.06)] backdrop-blur dark:border-border dark:bg-card">
      <div className="flex min-h-[76px] w-full items-center gap-3 px-4 py-3 sm:min-h-[84px] sm:gap-4 sm:px-6">
        <span className="grid size-12 shrink-0 place-items-center rounded-full bg-[#f1eaff] text-[#7635ee] dark:bg-primary/15 dark:text-primary sm:size-[52px]">
          <Palette className="size-6" strokeWidth={1.8} />
        </span>
        <span className="min-w-0 flex-1 text-left">
          <span className="block text-[16px] font-bold leading-5 text-[#151b4c] dark:text-foreground sm:text-[18px]">
            Appearance
          </span>
          <span className="mt-1 block truncate text-[13px] leading-5 text-[#5e5b8c] dark:text-muted-foreground sm:text-[15px]">
            Switch between light and dark theme
          </span>
        </span>
        {mounted ? (
          <span className="flex shrink-0 items-center gap-2.5">
            <Sun
              className={cn("size-4", !isDark ? "text-[#7635ee]" : "text-muted-foreground")}
              aria-hidden="true"
            />
            <Switch
              checked={isDark}
              onCheckedChange={handleCheckedChange}
              aria-label="Toggle dark theme"
            />
            <Moon
              className={cn("size-4", isDark ? "text-[#7635ee]" : "text-muted-foreground")}
              aria-hidden="true"
            />
            <Label className="hidden w-[38px] text-sm font-medium min-[400px]:block">
              {isDark ? "Dark" : "Light"}
            </Label>
          </span>
        ) : (
          <Skeleton className="h-6 w-[110px] shrink-0 rounded-full" />
        )}
      </div>
    </Card>
  );
}
