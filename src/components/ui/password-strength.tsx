import { usePasswordStrength } from "@/hooks/use-password-strength";

interface PasswordStrengthProps {
  password: string;
}

export function PasswordStrength({ password }: PasswordStrengthProps) {
  const strength = usePasswordStrength(password);

  if (password.length === 0) return null;

  return (
    <div className="mt-2">
      <div className="flex gap-1 mb-1">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className={`h-1 flex-1 rounded-full transition-all ${
              i < strength.score ? strength.color : "bg-surface-secondary"
            }`}
          />
        ))}
      </div>
      {strength.label && (
        <p className="text-xs text-text-muted">
          Strength:{" "}
          <span className="font-medium text-text-secondary">
            {strength.label}
          </span>
        </p>
      )}
    </div>
  );
}
