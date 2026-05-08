import { useMemo } from "react";

export interface StrengthLevel {
  score: number;
  label: string;
  color: string;
}

export function usePasswordStrength(password: string): StrengthLevel {
  return useMemo(() => {
    let score = 0;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/\d/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    const levels: StrengthLevel[] = [
      { score: 0, label: "", color: "bg-surface-secondary" },
      { score: 1, label: "Weak", color: "bg-strength-weak" },
      { score: 2, label: "Fair", color: "bg-strength-fair" },
      { score: 3, label: "Good", color: "bg-strength-good" },
      { score: 4, label: "Strong", color: "bg-strength-strong" },
    ];

    return levels[score];
  }, [password]);
}
