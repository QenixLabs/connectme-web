import type { LucideIcon } from "lucide-react";

export type Feature = { icon: LucideIcon; title: string; copy: string };

export function FeatureGrid({
  id,
  eyebrow,
  tone,
  title,
  subtitle,
  features,
  surface,
}: {
  id?: string;
  eyebrow: string;
  tone: "gold" | "cyan";
  title: string;
  subtitle: string;
  features: Feature[];
  surface: "background" | "surface";
}) {
  const isGold = tone === "gold";
  return (
    <section
      id={id}
      className={`border-b border-border py-16 md:py-24 ${surface === "surface" ? "bg-surface" : "bg-background"}`}
    >
      <div className="container-page">
        <p
          className={`text-center text-[11px] font-semibold uppercase tracking-[0.2em] ${isGold ? "text-gold" : "text-cyan"}`}
        >
          — {eyebrow} —
        </p>
        <h2 className="mx-auto mt-4 max-w-2xl text-center font-display text-3xl font-bold tracking-tight text-foreground md:text-4xl">
          {title}
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-center text-sm text-text-secondary">{subtitle}</p>

        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {features.map(({ icon: Icon, title: t, copy }) => (
            <article key={t} className="card-surface-landing rounded-[12px] p-5">
              <span
                className={`inline-flex size-9 items-center justify-center rounded-[8px] ${
                  isGold ? "bg-gold-soft text-gold" : "bg-cyan-soft text-cyan"
                }`}
              >
                <Icon className="size-4" />
              </span>
              <h3 className="mt-4 font-display text-sm font-semibold text-foreground">{t}</h3>
              <p className="mt-2 text-xs leading-relaxed text-text-muted">{copy}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
