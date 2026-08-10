import { BadgeCheck, Briefcase, CheckCircle2 } from "lucide-react";

function Chip({
  className,
  icon,
  title,
  meta,
  status,
  tone,
}: {
  className?: string;
  icon: React.ReactNode;
  title: string;
  meta: string;
  status: string;
  tone: "cyan" | "gold" | "success";
}) {
  const toneClass =
    tone === "gold"
      ? "bg-gold-soft text-gold"
      : tone === "success"
        ? "bg-success-soft text-success"
        : "bg-cyan-soft text-cyan";

  return (
    <div
      className={`absolute w-[210px] rounded-[12px] border border-border bg-elevated/90 p-3 backdrop-blur-sm ${className ?? ""}`}
    >
      <div className="flex items-start gap-2">
        <span className={`mt-0.5 rounded-[8px] p-1 ${toneClass}`}>{icon}</span>
        <div className="min-w-0">
          <p className="truncate text-xs font-semibold text-foreground">{title}</p>
          <p className="truncate text-[10px] text-text-muted">{meta}</p>
        </div>
      </div>
      <span
        className={`mt-2 inline-block rounded-full px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wider ${toneClass}`}
      >
        {status}
      </span>
    </div>
  );
}

export function NetworkVisual() {
  return (
    <div className="relative mx-auto h-[340px] w-full max-w-[520px] md:h-[460px]">
      <div className="absolute inset-0 flex items-center justify-center" aria-hidden="true">
        <div className="relative size-[260px] animate-orbit md:size-[380px]">
          <div className="absolute inset-0 rounded-full border border-cyan/25" />
          <span className="absolute left-1/2 top-0 size-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan shadow-[var(--glow-cyan-strong)]" />
          <span className="absolute bottom-0 left-1/2 size-1.5 -translate-x-1/2 translate-y-1/2 rounded-full bg-cyan/70" />
        </div>
        <div className="absolute size-[170px] animate-orbit-reverse md:size-[250px]">
          <div className="absolute inset-0 rounded-full border border-dashed border-gold/25" />
          <span className="absolute right-0 top-1/2 size-2 -translate-y-1/2 translate-x-1/2 rounded-full bg-gold shadow-[var(--glow-gold-strong)]" />
        </div>
      </div>

      <div className="absolute inset-0 flex items-center justify-center" aria-hidden="true">
        <div className="flex size-16 items-center justify-center rounded-full bg-gold-soft shadow-[var(--glow-gold)]">
          <span className="flex size-9 items-center justify-center rounded-full bg-gold text-[10px] font-bold text-primary-foreground">
            In
          </span>
        </div>
      </div>

      <Chip
        className="left-0 top-6 animate-float-soft md:top-10"
        icon={<BadgeCheck className="size-3.5" />}
        title="Product designer"
        meta="Portfolio · 12 projects"
        status="Discoverable"
        tone="cyan"
      />
      <Chip
        className="right-0 top-1/3 animate-float-soft"
        icon={<Briefcase className="size-3.5" />}
        title="Brand campaign"
        meta="8 roles · 26 applicants"
        status="Open"
        tone="gold"
      />
      <Chip
        className="bottom-4 left-6 animate-float-soft"
        icon={<CheckCircle2 className="size-3.5" />}
        title="Task verified"
        meta="Delivered in 4 days"
        status="Selected"
        tone="success"
      />
    </div>
  );
}
