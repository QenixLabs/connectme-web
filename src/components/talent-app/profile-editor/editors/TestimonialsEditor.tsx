"use client";

import { useState } from "react";
import { Link2, MessageSquareQuote, Star } from "lucide-react";
import { EditorShell } from "./EditorShell";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import type { Profile, Testimonial } from "../profile-types";

interface EditorProps {
  profile: Profile;
  onBack: () => void;
  onUpdate: (patch: Partial<Profile>) => void;
}

export function TestimonialsEditor({
  profile,
  onBack,
  onUpdate,
}: EditorProps) {
  const toggleApproved = (id: string, approved: boolean) => {
    onUpdate({
      testimonials: profile.testimonials.map((t) =>
        t.id === id ? { ...t, approvedByTalent: approved } : t,
      ),
    });
    toast.success(approved ? "Testimonial approved" : "Testimonial hidden");
  };

  const copyRequestLink = () => {
    navigator.clipboard.writeText(
      `${window.location.origin}/talent/${profile.username}/review`,
    );
    toast.success("Request link copied");
  };

  return (
    <EditorShell title="Testimonials" onBack={onBack}>
      {profile.testimonials.length === 0 ? (
        <div className="flex flex-col items-center rounded-2xl border border-dashed border-muted-foreground/25 px-6 py-12 text-center">
          <div className="grid size-12 place-items-center rounded-xl bg-primary/10 text-primary">
            <MessageSquareQuote className="size-5" />
          </div>
          <p className="mt-3 font-semibold">No testimonials yet</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Directors and casting teams you have worked with can leave reviews
            on your profile.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {profile.testimonials.map((t) => (
            <Card key={t.id}>
              <CardContent className="py-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-semibold">{t.author}</p>
                    <p className="text-xs text-muted-foreground">{t.role}</p>
                  </div>
                  <span className="flex shrink-0 items-center gap-1 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-bold text-primary">
                    <Star className="size-3 fill-current" /> {t.rating}
                  </span>
                </div>
                <p className="mt-2.5 text-sm leading-relaxed text-muted-foreground">
                  &ldquo;{t.text}&rdquo;
                </p>
                <div className="mt-3 flex items-center justify-between gap-3 rounded-xl bg-muted/50 px-3.5 py-2.5">
                  <span className="text-sm font-medium">
                    {t.approvedByTalent
                      ? "Shown on your profile"
                      : "Pending your approval"}
                  </span>
                  <Switch
                    checked={t.approvedByTalent}
                    onCheckedChange={(v) => toggleApproved(t.id, v)}
                    aria-label={`Approve testimonial from ${t.author}`}
                  />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <div className="rounded-2xl border bg-muted/40 p-4">
        <p className="text-sm font-medium">You stay in control</p>
        <p className="mt-1 text-xs text-muted-foreground">
          Reviews only appear publicly after you approve them. You can hide one
          at any time.
        </p>
      </div>

      <div>
        <p className="mb-2 px-1 text-xs font-extrabold uppercase tracking-wide text-muted-foreground">
          Request a review
        </p>
        <Card className="cursor-pointer p-0" onClick={copyRequestLink}>
          <CardContent className="flex items-center gap-3.5 py-3.5">
            <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
              <Link2 className="size-[18px]" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="font-semibold">Copy request link</p>
              <p className="text-sm text-muted-foreground">
                Send it to a director you worked with
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </EditorShell>
  );
}
