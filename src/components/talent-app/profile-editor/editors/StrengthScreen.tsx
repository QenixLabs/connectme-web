"use client";

import { Check, Circle } from "lucide-react";
import { EditorShell } from "./EditorShell";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { computeStrength } from "../compute-strength";
import type { Profile } from "../profile-types";

interface StrengthScreenProps {
  profile: Profile;
  onBack: () => void;
}

export function StrengthScreen({ profile, onBack }: StrengthScreenProps) {
  const { percent, items } = computeStrength(profile);
  const done = items.filter((i) => i.done);
  const todo = items.filter((i) => !i.done);

  return (
    <EditorShell title="Profile Strength" onBack={onBack}>
      <Card>
        <CardContent className="flex items-center gap-5">
          <Ring percent={percent} size={92} />
          <div className="min-w-0">
            <p className="text-lg font-bold">
              {percent >= 80
                ? "Great! Your profile looks strong."
                : "Your profile needs a little work."}
            </p>
            <p className="text-sm text-muted-foreground">
              {todo.length} {todo.length === 1 ? "thing" : "things"} can still
              improve your profile.
            </p>
          </div>
        </CardContent>
      </Card>

      <p className="px-1 text-sm font-semibold text-muted-foreground">
        Completed · {done.length}
      </p>
      <Card className="divide-y">
        {done.map((i) => (
          <div key={i.label} className="flex items-center gap-3 px-4 py-3">
            <span className="grid size-6 shrink-0 place-items-center rounded-full bg-success/15 text-success">
              <Check className="size-3.5" />
            </span>
            <span className="text-sm font-medium">{i.label}</span>
          </div>
        ))}
        {done.length === 0 && (
          <p className="px-4 py-6 text-center text-sm text-muted-foreground">
            Nothing completed yet.
          </p>
        )}
      </Card>

      <p className="px-1 text-sm font-semibold text-muted-foreground">
        Incomplete · {todo.length}
      </p>
      <Card className="divide-y">
        {todo.length === 0 ? (
          <p className="px-4 py-6 text-center text-sm text-muted-foreground">
            Everything is done. Nice work.
          </p>
        ) : (
          todo.map((i) => (
            <div
              key={i.label}
              className="flex items-center gap-3 px-4 py-3"
            >
              <Circle className="size-6 shrink-0 text-muted-foreground/40" />
              <span className="text-sm text-muted-foreground">{i.label}</span>
            </div>
          ))
        )}
      </Card>

      <Button variant="outline" className="w-full" onClick={onBack}>
        Back to Edit Profile
      </Button>
    </EditorShell>
  );
}

export function Ring({ percent, size = 64 }: { percent: number; size?: number }) {
  const stroke = size * 0.1;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <defs>
          <linearGradient id={`ring-${size}`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="oklch(0.53 0.245 297)" />
            <stop offset="100%" stopColor="oklch(0.63 0.24 4)" />
          </linearGradient>
        </defs>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          strokeWidth={stroke}
          className="stroke-muted"
          fill="none"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          strokeWidth={stroke}
          stroke={`url(#ring-${size})`}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c - (c * percent) / 100}
          style={{ transition: "stroke-dashoffset 0.6s ease" }}
        />
      </svg>
      <span
        className="absolute inset-0 grid place-items-center font-extrabold"
        style={{ fontSize: size * 0.24 }}
      >
        {percent}%
      </span>
    </div>
  );
}
