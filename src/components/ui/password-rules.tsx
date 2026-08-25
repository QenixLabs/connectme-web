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
    <ul className="mt-2 grid grid-cols-2 gap-x-3 gap-y-1">
      {rules.map((r) => (
        <li
          key={r.text}
          className={`flex items-center gap-1.5 text-xs transition-colors ${
            r.ok ? "text-green-600" : "text-muted-foreground"
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
