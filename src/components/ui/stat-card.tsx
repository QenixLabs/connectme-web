import { cn } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: number | string;
  align?: "center" | "left";
}

export function StatCard({ label, value, align = "center" }: StatCardProps) {
  return (
    <div
      className={cn(
        "bg-card border border-border rounded-2xl p-4",
        align === "center" && "text-center"
      )}
    >
      <p
        className={cn(
          "text-xl font-bold text-text-primary",
          align === "left" && "mt-1"
        )}
      >
        {value}
      </p>
      <p
        className={cn(
          "text-xs text-text-tertiary mt-1",
          align === "left" && "leading-tight"
        )}
      >
        {label}
      </p>
    </div>
  );
}
