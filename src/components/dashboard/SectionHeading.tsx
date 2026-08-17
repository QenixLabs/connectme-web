import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface SectionHeadingProps {
  title: string;
  action?: string;
  href?: string;
  className?: string;
}

export function SectionHeading({
  title,
  action,
  href,
  className,
}: SectionHeadingProps) {
  return (
    <div
      className={cn(
        "flex items-center justify-between",
        className
      )}
    >
      <h3 className="flex items-center gap-2 text-[11px] font-semibold tracking-[0.14em] text-muted-foreground uppercase">
        <span className="size-1.5 rounded-full bg-primary shadow-glow" />
        {title}
      </h3>
      {action && href ? (
        <Button
          asChild
          variant="ghost"
          size="sm"
          className="h-auto gap-1 px-0 py-0 text-xs font-medium text-primary hover:text-primary/80"
        >
          <Link href={href}>
            {action} <ArrowRight className="size-3.5" />
          </Link>
        </Button>
      ) : null}
    </div>
  );
}
