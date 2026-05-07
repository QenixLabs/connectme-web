import { cn } from "@/lib/utils";

interface AvatarProps {
  name: string;
  src?: string | null;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizeMap = {
  sm: "w-10 h-10 text-sm",
  md: "w-16 h-16 text-xl",
  lg: "w-24 h-24 text-2xl",
};

export function Avatar({ name, src, size = "md", className }: AvatarProps) {
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2);

  return (
    <div
      className={cn(
        "rounded-full bg-surface-secondary flex items-center justify-center font-bold text-text-muted",
        sizeMap[size],
        className
      )}
    >
      {src ? (
        <img
          src={src}
          alt=""
          className="w-full h-full rounded-full object-cover"
        />
      ) : (
        initials
      )}
    </div>
  );
}
