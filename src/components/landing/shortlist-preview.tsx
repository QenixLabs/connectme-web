import logo from "@/assets/rootin-logo-orange.png";

const candidates = [
  { initials: "AR", name: "Ana Reyes", role: "Motion designer", match: "94%", status: "Top ranked", tone: "success" },
  { initials: "DO", name: "Derin Okonkwo", role: "Content strategist", match: "91%", status: "Shortlisted", tone: "gold" },
  { initials: "MH", name: "Mira Halvorsen", role: "Photographer", match: "88%", status: "In review", tone: "cyan" },
  { initials: "YA", name: "Yusuf Adler", role: "Community lead", match: "84%", status: "In review", tone: "cyan" },
] as const;

const toneClass = {
  success: "bg-success-soft text-success",
  gold: "bg-gold-soft text-gold",
  cyan: "bg-cyan-soft text-cyan",
} as const;

export function ShortlistPreview() {
  return (
    <section className="border-b border-border bg-surface py-16 md:py-24">
      <div className="container-page">
        <p className="text-center text-[11px] font-semibold uppercase tracking-[0.2em] text-cyan">
          — Inside <img src={logo.src} alt="RootIn" className="inline-block h-[16px] w-auto align-text-bottom" /> —
        </p>
        <h2 className="mx-auto mt-4 max-w-2xl text-center font-display text-3xl font-bold tracking-tight text-foreground md:text-4xl">
          Shortlist the right people with the evidence in front of you
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-center text-sm text-text-secondary">
          Applicants, match strength and verified tasks in a single review surface.
        </p>

        <div className="mx-auto mt-12 max-w-3xl rounded-[16px] border border-border bg-elevated p-5 shadow-[var(--shadow-soft)]">
          <div className="flex items-start justify-between gap-4 border-b border-border pb-4">
            <div>
              <h3 className="text-sm font-semibold text-foreground">Spring brand campaign</h3>
              <p className="mt-1 text-xs text-text-muted">26 applicants · 4 roles · closes in 6 days</p>
            </div>
            <span className="rounded-full bg-gold-soft px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-gold">
              Reviewing
            </span>
          </div>

          <ul className="divide-y divide-border">
            {candidates.map((c) => (
              <li key={c.name} className="flex items-center gap-3 py-3.5">
                <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-card text-[11px] font-semibold text-text-secondary">
                  {c.initials}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-foreground">{c.name}</p>
                  <p className="truncate text-xs text-text-muted">{c.role}</p>
                </div>
                <span className="hidden text-xs text-text-secondary sm:block">{c.match} match</span>
                <span
                  className={`rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider ${toneClass[c.tone]}`}
                >
                  {c.status}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
