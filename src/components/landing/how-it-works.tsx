const steps = [
  { title: "Profile", copy: "Set up who you are and what you do", tone: "gold" },
  { title: "Discovery", copy: "Be found, or find relevant talent", tone: "cyan" },
  { title: "Opportunity", copy: "Roles and campaigns get published", tone: "cyan" },
  { title: "Application", copy: "Apply and track every submission", tone: "gold" },
  { title: "Shortlisting", copy: "Compare candidates side by side", tone: "cyan" },
  { title: "Tasks", copy: "Assign, complete and verify work", tone: "gold" },
  { title: "Collaboration", copy: "Work together inside the platform", tone: "cyan" },
  { title: "Growth", copy: "Relationships lead to the next project", tone: "gold" },
] as const;

export function HowItWorks() {
  return (
    <section id="how-it-works" className="border-b border-border bg-surface py-16 md:py-24">
      <div className="container-page">
        <p className="text-center text-[11px] font-semibold uppercase tracking-[0.2em] text-cyan">
          — How it works —
        </p>
        <h2 className="mx-auto mt-4 max-w-2xl text-center font-display text-3xl font-bold tracking-tight text-foreground md:text-4xl">
          One connected path, from profile to collaboration
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-center text-sm text-text-secondary">
          Both journeys run on the same rails — talent moves forward, recruiters keep visibility at
          every step.
        </p>

        <ol className="mt-12 grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, i) => (
            <li key={step.title}>
              <span
                className={`flex size-7 items-center justify-center rounded-full text-xs font-semibold ${
                  step.tone === "gold" ? "bg-gold-soft text-gold" : "bg-cyan-soft text-cyan"
                }`}
              >
                {i + 1}
              </span>
              <h3 className="mt-4 font-display text-sm font-semibold text-foreground">{step.title}</h3>
              <p className="mt-1.5 text-xs leading-relaxed text-text-muted">{step.copy}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
