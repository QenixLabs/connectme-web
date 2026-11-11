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
    <header className="flex items-center gap-3 px-4 pt-4 sm:px-7 sm:pt-6">
      <button
        type="button"
        onClick={onBack}
        disabled={step <= 1}
        aria-label="Go to previous step"
        className="grid size-10 shrink-0 place-items-center rounded-full border border-border text-foreground transition-colors hover:bg-accent disabled:cursor-not-allowed disabled:opacity-40"
      >
        <ChevronLeft className="size-5" />
      </button>
      <div className="min-w-0 flex-1">
        <p className="mb-2 text-xs font-medium text-muted-foreground">
          Step {step} of {total}
        </p>
        <div className="flex gap-1.5" aria-label={`Step ${step} of ${total}`}>
          {Array.from({ length: total }, (_, index) => (
            <span
              key={index}
              className={`h-1.5 flex-1 rounded-full ${
                index < step ? "bg-primary" : "bg-border"
              }`}
            />
          ))}
        </div>
      </div>
    </header>
  );
}

export function FooterFlourish({ lines }: { lines: string[] }) {
  return (
    <div className="w-full">
      <img
        src="/images/collaboration-banner.png"
        alt="Great Collaborations Create Great Work"
        className="block h-auto w-full object-cover"
      />
    </div>
  );
}
