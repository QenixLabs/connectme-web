import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function SectionHeading({
  title,
  action,
  href,
  small,
}: {
  title: string;
  action?: string;
  href?: string;
  small?: boolean;
}) {
  return (
    <div className="flex items-center justify-between px-5 lg:px-0">
      <div className="flex items-center gap-2.5">
        <span className="size-2.5 rotate-45 bg-primary" />
        <h3
          className={cn(
            "font-sans",
            small
              ? "text-[13px] font-semibold tracking-[0.14em]"
              : "text-[20px] font-bold tracking-tight"
          )}
        >
          {title}
        </h3>
      </div>
      {action && href ? (
        <Button asChild variant="ghost" className="gap-1 px-0 text-sm text-primary hover:text-primary">
          <Link href={href}>
            {action} <ArrowRight className="size-4" />
          </Link>
        </Button>
      ) : null}
    </div>
  );
}
