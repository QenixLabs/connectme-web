"use client";

import Link from "next/link";
import Image from "next/image";
import {
  BadgeCheck,
  Calendar,
  Clapperboard,
  Folder,
  Globe,
  MapPin,
  Quote,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  User,
  X,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import type { CompareTalentResult } from "@/hooks/use-compare-talent";

const COL = "w-[13.5rem] shrink-0";
const LABEL_COL = "w-32 shrink-0";

const AVAILABILITY_LABEL: Record<string, string> = {
  available: "Available now",
  busy: "Busy",
  not_available: "Not available",
};

function maxOf(values: (number | undefined)[]): number | null {
  const present = values.filter((v): v is number => typeof v === "number");
  if (present.length === 0) return null;
  return Math.max(...present);
}

function Cell({
  best,
  className,
  children,
}: {
  best?: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        COL,
        "rounded-2xl px-3 py-3 text-center text-sm font-semibold",
        best ? "bg-success-soft text-success" : "bg-brand-soft text-foreground",
        className,
      )}
    >
      {children}
    </div>
  );
}

function RowLabel({ label, Icon }: { label: string; Icon: typeof Zap }) {
  return (
    <div
      className={cn(
        LABEL_COL,
        "sticky left-0 z-10 flex items-center gap-2 rounded-2xl bg-brand-soft px-3 py-3 backdrop-blur",
      )}
    >
      <Icon className="size-4 shrink-0 text-primary" strokeWidth={2.4} />
      <span className="min-w-0 text-xs font-semibold leading-tight text-foreground">
        {label}
      </span>
    </div>
  );
}

function Missing() {
  return <span className="text-muted-foreground">—</span>;
}

function ColumnHeader({
  column,
  onRemove,
}: {
  column: CompareTalentResult;
  onRemove: () => void;
}) {
  if (column.status === "loading") {
    return (
      <div className={cn(COL, "overflow-hidden rounded-3xl bg-card")}>
        <Skeleton className="h-52 w-full rounded-none" />
        <div className="space-y-2 p-3">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
          <Skeleton className="h-6 w-2/3 rounded-full" />
        </div>
      </div>
    );
  }

  if (column.status === "error" || !column.data) {
    return (
      <div
        className={cn(
          COL,
          "flex flex-col items-center gap-2 rounded-3xl border border-border/70 bg-card px-3 py-8 text-center",
        )}
      >
        <p className="text-sm font-semibold text-foreground">
          Couldn&apos;t load @{column.username}
        </p>
        <p className="text-xs text-muted-foreground">
          Their profile may be unavailable.
        </p>
        {column.refetch && (
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={column.refetch}
            className="mt-1 gap-1 rounded-xl text-xs"
          >
            <RotateCcw className="size-3.5" /> Retry
          </Button>
        )}
      </div>
    );
  }

  const t = column.data;
  const available = t.availability === "available";

  return (
    <article
      className={cn(
        COL,
        "relative overflow-hidden rounded-3xl bg-card shadow-card",
      )}
    >
      <div className="relative">
        <div className="relative h-52 w-full bg-muted">
          {t.profilePhoto ? (
            <Image
              src={t.profilePhoto}
              alt={t.name}
              fill
              sizes="216px"
              className="object-cover"
              loading="lazy"
            />
          ) : (
            <div className="flex size-full items-center justify-center bg-secondary">
              <User className="size-10 text-muted-foreground/40" />
            </div>
          )}
        </div>
        <Button
          type="button"
          variant="secondary"
          size="icon"
          aria-label={`Remove ${t.name} from comparison`}
          onClick={onRemove}
          className="absolute right-3 top-3 size-7 rounded-full"
        >
          <X className="size-4" />
        </Button>
      </div>
      <div className="p-3">
        <div className="flex items-center gap-1">
          <h3 className="truncate text-base font-extrabold text-foreground">
            {t.name}
          </h3>
          {t.isVerified && (
            <BadgeCheck className="size-4 shrink-0 text-primary" />
          )}
        </div>
        <p className="mt-0.5 truncate text-xs font-medium text-muted-foreground">
          {t.professions.length > 0 ? t.professions.join("  |  ") : "Talent"}
        </p>
        <div className="mt-2 flex flex-wrap gap-1.5">
          <span
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full px-2 py-1 text-[0.68rem] font-semibold",
              available
                ? "bg-success-soft text-success"
                : "bg-muted text-muted-foreground",
            )}
          >
            <span
              className={cn(
                "size-2 rounded-full",
                available ? "bg-success" : "bg-warning",
              )}
            />
            {AVAILABILITY_LABEL[t.availability ?? ""] ?? "Availability unknown"}
          </span>
        </div>
      </div>
    </article>
  );
}

export function CompareGrid({
  columns,
  onRemove,
}: {
  columns: CompareTalentResult[];
  onRemove: (username: string) => void;
}) {
  const ready = columns.filter((c) => c.status === "ready" && c.data);

  const bestTrust = maxOf(ready.map((c) => c.data!.trustScore));
  const bestResponse = maxOf(ready.map((c) => c.data!.responseRate));
  const bestTestimonials = maxOf(ready.map((c) => c.data!.testimonialCount));
  const bestExperience = maxOf(ready.map((c) => c.data!.yearsOfExperience));
  // Highlight "available" only when it's a differentiator.
  const availabilityBest =
    ready.length > 0 && ready.some((c) => c.data!.availability !== "available")
      ? new Set(
          ready
            .filter((c) => c.data!.availability === "available")
            .map((c) => c.username),
        )
      : null;

  const renderCells = (
    render: (column: CompareTalentResult) => React.ReactNode,
  ) => columns.map((column) => render(column));

  const numericCell = (
    column: CompareTalentResult,
    value: number | undefined,
    best: number | null,
    suffix = "",
  ) => {
    if (column.status === "loading") {
      return (
        <Cell key={column.username}>
          <Skeleton className="mx-auto h-5 w-3/4" />
        </Cell>
      );
    }
    if (column.status === "error" || value == null) {
      return (
        <Cell key={column.username}>
          <Missing />
        </Cell>
      );
    }
    return (
      <Cell key={column.username} best={value === best}>
        <span className="text-lg font-extrabold">
          {value}
          {suffix}
        </span>
      </Cell>
    );
  };

  return (
    <div className="w-max">
      {/* Profile cards */}
      <div className="flex gap-3">
        <div className={LABEL_COL} />
        {columns.map((column) => (
          <ColumnHeader
            key={column.username}
            column={column}
            onRemove={() => onRemove(column.username)}
          />
        ))}
      </div>

      {/* Attribute rows */}
      <div className="mt-3 space-y-2">
        <div className="flex gap-3">
          <RowLabel label="Trust Score" Icon={ShieldCheck} />
          {renderCells((c) => numericCell(c, c.data?.trustScore, bestTrust))}
        </div>

        <div className="flex gap-3">
          <RowLabel label="Response Rate" Icon={Zap} />
          {renderCells((c) =>
            numericCell(c, c.data?.responseRate, bestResponse, "%"),
          )}
        </div>

        <div className="flex gap-3">
          <RowLabel label="Testimonials" Icon={Quote} />
          {renderCells((c) =>
            numericCell(c, c.data?.testimonialCount, bestTestimonials),
          )}
        </div>

        <div className="flex gap-3">
          <RowLabel label="Experience" Icon={Folder} />
          {renderCells((c) => {
            if (c.status === "loading") {
              return (
                <Cell key={c.username}>
                  <Skeleton className="mx-auto h-5 w-3/4" />
                </Cell>
              );
            }
            const years = c.data?.yearsOfExperience;
            if (c.status === "error" || years == null) {
              return (
                <Cell key={c.username}>
                  <Missing />
                </Cell>
              );
            }
            return (
              <Cell key={c.username} best={years === bestExperience}>
                {years} {years === 1 ? "year" : "years"}
              </Cell>
            );
          })}
        </div>

        <div className="flex gap-3">
          <RowLabel label="Availability" Icon={Calendar} />
          {renderCells((c) => {
            if (c.status === "loading") {
              return (
                <Cell key={c.username}>
                  <Skeleton className="mx-auto h-5 w-3/4" />
                </Cell>
              );
            }
            if (c.status === "error") {
              return (
                <Cell key={c.username}>
                  <Missing />
                </Cell>
              );
            }
            const available = c.data!.availability === "available";
            return (
              <Cell key={c.username} best={availabilityBest?.has(c.username)}>
                <span className="inline-flex items-center gap-2">
                  <span
                    className={cn(
                      "size-2.5 rounded-full",
                      available ? "bg-success" : "bg-warning",
                    )}
                  />
                  {AVAILABILITY_LABEL[c.data!.availability ?? ""] ?? "Unknown"}
                </span>
              </Cell>
            );
          })}
        </div>

        <div className="flex gap-3">
          <RowLabel label="Location" Icon={MapPin} />
          {renderCells((c) => (
            <Cell key={c.username} className="text-xs">
              {c.status === "loading" ? (
                <Skeleton className="mx-auto h-4 w-3/4" />
              ) : c.status === "error" || !c.data?.location ? (
                <Missing />
              ) : (
                c.data.location
              )}
            </Cell>
          ))}
        </div>

        <div className="flex gap-3">
          <RowLabel label="Languages" Icon={Globe} />
          {renderCells((c) => (
            <Cell key={c.username} className="text-xs">
              {c.status === "loading" ? (
                <Skeleton className="mx-auto h-4 w-3/4" />
              ) : c.status === "error" ||
                !c.data ||
                c.data.languages.length === 0 ? (
                <Missing />
              ) : (
                <>
                  {c.data.languages.slice(0, 3).join(", ")}
                  {c.data.languages.length > 3 && (
                    <span className="text-muted-foreground">
                      {" "}
                      +{c.data.languages.length - 3}
                    </span>
                  )}
                </>
              )}
            </Cell>
          ))}
        </div>

        <div className="flex gap-3">
          <RowLabel label="Top Skills" Icon={Sparkles} />
          {renderCells((c) => (
            <Cell key={c.username} className="text-left">
              {c.status === "loading" ? (
                <Skeleton className="h-4 w-full" />
              ) : c.status === "error" ||
                !c.data ||
                c.data.skills.length === 0 ? (
                <Missing />
              ) : (
                <span className="flex flex-wrap gap-1.5">
                  {c.data.skills.map((skill) => (
                    <span
                      key={skill}
                      className="rounded-lg bg-card px-2 py-1 text-[0.7rem] font-semibold text-foreground"
                    >
                      {skill}
                    </span>
                  ))}
                  {c.data.extraSkills > 0 && (
                    <span className="rounded-lg bg-card px-2 py-1 text-[0.7rem] font-semibold text-muted-foreground">
                      +{c.data.extraSkills}
                    </span>
                  )}
                </span>
              )}
            </Cell>
          ))}
        </div>

        <div className="flex gap-3">
          <RowLabel label="Credits" Icon={Clapperboard} />
          {renderCells((c) => (
            <Cell key={c.username} className="text-left">
              {c.status === "loading" ? (
                <Skeleton className="h-4 w-full" />
              ) : c.status === "error" ||
                !c.data ||
                c.data.credits.length === 0 ? (
                <Missing />
              ) : (
                <span className="flex flex-col gap-1 text-xs font-medium">
                  {c.data.credits.map((credit) => (
                    <span key={credit.title}>
                      {credit.title}
                      {credit.detail && (
                        <span className="text-muted-foreground">
                          {" "}
                          ({credit.detail})
                        </span>
                      )}
                    </span>
                  ))}
                  {c.data.extraCredits > 0 && (
                    <span className="text-muted-foreground">
                      +{c.data.extraCredits} more
                    </span>
                  )}
                </span>
              )}
            </Cell>
          ))}
        </div>

        {/* CTA row */}
        <div className="flex gap-3 pt-1">
          <div className={LABEL_COL} />
          {columns.map((column) => (
            <Button
              key={column.username}
              variant="outline"
              asChild
              className={cn(
                COL,
                "h-auto rounded-2xl border-2 border-primary bg-card px-3 py-3 text-sm font-bold text-primary hover:bg-primary/10",
              )}
            >
              <Link href={`/talent/${column.username}`}>View Profile</Link>
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}
