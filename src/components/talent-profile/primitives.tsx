"use client";

import { useState, type CSSProperties, type ReactNode } from "react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { BadgeCheck, ChevronDown, ChevronRight, Star } from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
} from "@/components/ui/collapsible";

export function GlassCard({
  children,
  className,
  style,
  hover = true,
}: {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
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
      <div
        style={style}
        className={cn(
          "overflow-hidden rounded-2xl bg-card p-4 shadow-[var(--shadow-card)]",
          hover && "transition-all duration-200 hover:-translate-y-0.5",
          className,
        )}
      >
        {children}
      </div>
    </motion.section>
  );
}

export function SectionHeader({
  icon,
  title,
  action,
  onAction,
  collapsible = false,
  open = true,
  onToggle,
}: {
  icon: ReactNode;
  title: string;
  action?: string;
  onAction?: () => void;
  collapsible?: boolean;
  open?: boolean;
  onToggle?: () => void;
}) {
  const heading = (
    <>
      <span className="text-brand">{icon}</span>
      <h2 className="text-sm font-bold text-foreground">{title}</h2>
    </>
  );

  return (
    <div className="mb-3 flex items-center justify-between gap-3">
      {collapsible ? (
        <button
          type="button"
          onClick={onToggle}
          aria-expanded={open}
          className="flex min-w-0 flex-1 items-center gap-2 text-left"
        >
          {heading}
          <ChevronDown
            className={cn(
              "ml-auto size-4 shrink-0 text-muted-foreground transition-transform duration-200",
              open && "rotate-180",
            )}
          />
        </button>
      ) : (
        <div className="flex items-center gap-2">{heading}</div>
      )}
      {action && (
        <button
          onClick={onAction}
          className="flex shrink-0 items-center gap-0.5 text-xs font-semibold text-brand transition-colors hover:text-brand/80"
        >
          {action} <ChevronRight className="size-3.5" />
        </button>
      )}
    </div>
  );
}

export function CollapsibleSection({
  icon,
  title,
  action,
  onAction,
  collapsible = false,
  defaultOpen = true,
  children,
}: {
  icon: ReactNode;
  title: string;
  action?: string;
  onAction?: () => void;
  collapsible?: boolean;
  defaultOpen?: boolean;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <GlassCard>
      <SectionHeader
        icon={icon}
        title={title}
        action={action}
        onAction={onAction}
        collapsible={collapsible}
        open={open}
        onToggle={() => setOpen((v) => !v)}
      />
      {collapsible ? (
        <Collapsible open={open}>
          <CollapsibleContent>{children}</CollapsibleContent>
        </Collapsible>
      ) : (
        children
      )}
    </GlassCard>
  );
}

export function VerifiedBadge({ large = false }: { large?: boolean }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full bg-brand-soft px-2.5 py-1 text-brand",
        large ? "text-xs" : "text-[10px]",
      )}
    >
      <BadgeCheck className={cn("fill-current", large ? "size-4" : "size-3")} />
      <span className="font-semibold uppercase tracking-wider">Verified</span>
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

  const dot =
    status === "busy"
      ? "bg-warning"
      : status === "not_available"
        ? "bg-muted-foreground"
        : "bg-success";

  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-success/10 px-2.5 py-1 text-[11px] font-semibold text-foreground">
      <span className={cn("size-1.5 rounded-full", dot)} />
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
              ? "fill-warning text-warning"
              : "text-muted-foreground/30"
          }
        />
      ))}
    </span>
  );
}
