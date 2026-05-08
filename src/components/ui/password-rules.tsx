import { Check, Circle } from "lucide-react";

interface Rule {
  ok: boolean;
  text: string;
}

interface PasswordRulesProps {
  rules: Rule[];
}

export function PasswordRules({ rules }: PasswordRulesProps) {
  return (
    <ul className="mt-2 space-y-0.5">
      {rules.map((r) => (
        <li
          key={r.text}
          className={`flex items-center gap-1.5 text-xs transition-colors ${
            r.ok ? "text-success-text" : "text-text-muted"
          }`}
        >
          {r.ok ? (
            <Check className="w-3 h-3" strokeWidth={1.5} />
          ) : (
            <Circle className="w-3 h-3" strokeWidth={1.2} />
          )}
          {r.text}
        </li>
      ))}
    </ul>
  );
}
