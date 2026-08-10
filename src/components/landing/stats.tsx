const stats = [
  { value: "24k+", label: "Professional profiles", tone: "gold" },
  { value: "3.8k", label: "Opportunities & campaigns", tone: "cyan" },
  { value: "72%", label: "Shortlists filled in a week", tone: "gold" },
  { value: "140+", label: "Brands recruiting", tone: "cyan" },
] as const;

export function Stats() {
  return (
    <section className="border-b border-border bg-background py-10">
      <div className="container-page grid grid-cols-2 gap-8 lg:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label}>
            <p
              className={`font-display text-3xl font-bold tracking-tight md:text-4xl ${
                s.tone === "gold" ? "text-gold" : "text-cyan"
              }`}
            >
              {s.value}
            </p>
            <p className="mt-2 text-[11px] uppercase tracking-wider text-text-muted">{s.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
