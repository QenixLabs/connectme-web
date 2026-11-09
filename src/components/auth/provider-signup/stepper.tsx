"use client";

import { Check } from "lucide-react";

export const SIGNUP_STEPS = [
  "Create Account",
  "Provider Type",
  "Identity",
  "Categories",
];

export function Stepper({ current }: { current: number }) {
  return (
    <nav aria-label="Provider signup progress" className="w-full">
      <ol className="grid grid-cols-4">
        {SIGNUP_STEPS.map((label, i) => {
          const n = i + 1;
          const done = n < current;
          const active = n === current;

          return (
            <li key={label} className="relative flex min-w-0 flex-col items-center">
              {i > 0 ? (
                <span
                  aria-hidden="true"
                  className={`absolute right-1/2 top-3.5 h-[2px] w-full transition-colors duration-300 motion-reduce:transition-none ${
                    n <= current ? "bg-[#8738FF]" : "bg-[#E4E8F2]"
                  }`}
                />
              ) : null}
              {i < SIGNUP_STEPS.length - 1 ? (
                <span
                  aria-hidden="true"
                  className={`absolute left-1/2 top-3.5 h-[2px] w-full transition-colors duration-300 motion-reduce:transition-none ${
                    n < current ? "bg-[#8738FF]" : "bg-[#E4E8F2]"
                  }`}
                />
              ) : null}

              <span
                aria-current={active ? "step" : undefined}
                className={`relative z-10 grid size-7 place-items-center rounded-full text-[11px] font-bold transition-all duration-300 motion-reduce:transition-none ${
                  active
                    ? "bg-gradient-to-br from-[#8738FF] to-[#6D2BE5] text-white shadow-[0_4px_12px_-3px_rgba(135,56,255,0.65)] ring-4 ring-[#8738FF]/12"
                    : done
                      ? "border border-[#8738FF]/30 bg-[#F3ECFF] text-[#8738FF]"
                      : "border border-[#E1E7F2] bg-white text-[#A1ACC0]"
                }`}
              >
                {done ? (
                  <Check className="size-3.5 stroke-[3]" aria-hidden="true" />
                ) : (
                  n
                )}
                {done ? <span className="sr-only"> (completed)</span> : null}
              </span>

              <span
                className={`mt-2 max-w-full text-center text-[9.5px] leading-[1.2] transition-colors duration-300 motion-reduce:transition-none sm:text-[11px] ${
                  active
                    ? "font-bold text-[#101333]"
                    : done
                      ? "font-semibold text-[#4E5971]"
                      : "font-medium text-[#9AA6BC]"
                }`}
              >
                {label}
              </span>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
