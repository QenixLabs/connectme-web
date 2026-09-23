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
null
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
