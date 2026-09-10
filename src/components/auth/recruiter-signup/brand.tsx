import { ChevronLeft } from "lucide-react";

export function ScriptNote({ lines }: { lines: string[] }) {
  return (
    <div className="hidden shrink-0 text-right sm:block">
      <p className="font-script text-2xl leading-6 text-foreground/80">
        {lines.map((line) => (
          <span key={line} className="block -rotate-3">
            {line}
          </span>
        ))}
      </p>
      <svg viewBox="0 0 120 12" className="ml-auto mt-1 h-3 w-24 text-primary" aria-hidden="true">
        <path
          d="M2 9C28 3 82 2 118 6"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
}

export function StepHeader({
  step,
  total,
  onBack,
}: {
  step: number;
  total: number;
  onBack: () => void;
}) {
  return (
    <div className="flex items-center gap-4">
      <button
        type="button"
        onClick={onBack}
        aria-label="Go back"
        className="rounded-full p-1 text-foreground transition-colors hover:bg-accent disabled:opacity-30"
        disabled={step === 1}
      >
        <ChevronLeft className="size-6" />
      </button>
      <div className="flex flex-1 items-center justify-center gap-2">
        {Array.from({ length: total }, (_, i) => (
          <span
            key={i}
            className={`h-1.5 w-9 rounded-full transition-colors ${
              i < step ? "bg-primary" : "bg-accent"
            }`}
          />
        ))}
      </div>
      <p className="text-sm font-semibold text-muted-foreground">
        {step} of {total}
      </p>
    </div>
  );
}

export function FooterFlourish({ lines }: { lines: string[] }) {
  return (
    <div className="relative mt-10 overflow-hidden rounded-t-[3rem] bg-accent/50 px-6 py-8">
      <p className="font-script text-xl leading-6 text-foreground/70">
        {lines.map((line) => (
          <span key={line} className="block -rotate-3">
            {line}
          </span>
        ))}
      </p>
      <svg viewBox="0 0 100 10" className="mt-1 h-3 w-20 text-primary" aria-hidden="true">
        <path
          d="M2 8C24 2 70 2 98 5"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
}
