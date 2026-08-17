"use client";

import type { ReactNode } from "react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { BadgeCheck, Star } from "lucide-react";
import { Card } from "@/components/ui/card";

export function GlassCard({
  children,
  className,
  hover = true,
}: {
  children: ReactNode;
  className?: string;
  hover?: boolean;
}) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
      className="relative"
    >
      <Card
        className={cn(
          "profile-card gap-0 overflow-hidden rounded-2xl p-5 sm:p-6",
          hover && "transition-all duration-200 hover:-translate-y-0.5 hover:border-border-hover",
          className,
        )}
      >
        {children}
      </Card>
    </motion.section>
  );
}

export function SectionHeader({
  icon,
  title,
  action,
  onAction,
}: {
  icon: ReactNode;
  title: string;
  action?: string;
  onAction?: () => void;
}) {
  return (
    <div className="mb-4 flex items-center justify-between gap-4">
      <div className="flex items-center gap-2.5">
        <span className="text-profile-section-icon">{icon}</span>
        <h2 className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground/50">
          {title}
        </h2>
      </div>
      {action && (
        <button
          onClick={onAction}
          className="text-[11px] font-medium text-primary/80 transition-colors hover:text-primary"
        >
          {action}
        </button>
      )}
    </div>
  );
}

export function StatCard({
  label,
  value,
  sub,
  icon,
  accent = "primary",
}: {
  label: string;
  value: ReactNode;
  sub?: string;
  icon: ReactNode;
  accent?: "primary" | "gold" | "success";
}) {
  const accentClass =
    accent === "gold"
      ? "text-accent-amber bg-accent-amber-bg border-accent-amber/30"
      : accent === "success"
        ? "text-accent-green bg-accent-green-bg border-accent-green/30"
        : "text-accent-purple bg-accent-purple/10 border-accent-purple/20";

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
      className="profile-stat relative overflow-hidden rounded-2xl p-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-border-hover sm:p-5"
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground/45">
            {label}
          </p>
          <div className="mt-2 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            {value}
          </div>
          {sub && <p className="mt-1 text-xs text-muted-foreground/60">{sub}</p>}
        </div>
        <div
          className={cn(
            "grid h-9 w-9 place-items-center rounded-xl border",
            accentClass,
          )}
        >
          {icon}
        </div>
      </div>
    </motion.div>
  );
}

export function VerifiedBadge({ large = false }: { large?: boolean }) {
  return (
    <span
      className={cn(
        "profile-verified-badge inline-flex items-center gap-1 rounded-full backdrop-blur-sm",
        large ? "px-3 py-1.5 text-xs" : "px-2 py-0.5 text-[10px]",
      )}
    >
      <BadgeCheck className={cn("fill-current", large ? "size-4" : "size-3")} />
      <span className="font-semibold uppercase tracking-wider">RootVerified</span>
    </span>
  );
}

export function AvailabilityBadge({ status }: { status?: string }) {
  const label =
    status === "available"
      ? "Available"
      : status === "busy"
        ? "Busy"
        : status === "not_available"
          ? "Not Available"
          : "Available";
  const color =
    status === "available"
      ? "bg-success"
      : status === "busy"
        ? "bg-warning"
        : "bg-muted-foreground";

  return (
    <span className="profile-availability-badge inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs backdrop-blur-sm">
      <span className={cn("size-1.5 rounded-full", color)} />
      {label}
    </span>
  );
}

export function AnimatedContainer({
  children,
  className,
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  const reduced = useReducedMotion();
  return (
    <motion.div
      initial={reduced ? undefined : { opacity: 0, y: 12 }}
      whileInView={reduced ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1], delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function Stars({ value, size = 14 }: { value: number; size?: number }) {
  return (
    <span className="inline-flex items-center gap-0.5">
      {[0, 1, 2, 3, 4].map((i) => (
        <Star
          key={i}
          width={size}
          height={size}
          className={
            i < Math.round(value)
              ? "fill-accent-amber text-accent-amber drop-shadow-[0_0_3px_var(--accent-amber)]"
              : "text-muted-foreground/30"
          }
        />
      ))}
    </span>
  );
}
