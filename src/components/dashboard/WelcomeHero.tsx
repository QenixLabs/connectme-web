"use client";

import Link from "next/link";
import { MapPin, Pencil, Sun, Check, Clock, XCircle } from "lucide-react";
import { motion } from "motion/react";

import type { TalentProfile } from "@/lib/api/talent";
import type { User } from "@/stores/auth-store";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

function formatDate() {
  return new Date().toLocaleDateString("en-US", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}

function getInitials(name: string) {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

const availabilityConfig = {
  available: {
    label: "Available",
    icon: Check,
    color: "text-green",
    bg: "bg-green/10",
    border: "border-green/20",
    dot: "bg-green",
  },
  busy: {
    label: "Busy",
    icon: Clock,
    color: "text-warning",
    bg: "bg-warning/10",
    border: "border-warning/20",
    dot: "bg-warning",
  },
  not_available: {
    label: "Not available",
    icon: XCircle,
    color: "text-destructive",
    bg: "bg-destructive/10",
    border: "border-destructive/20",
    dot: "bg-destructive",
  },
};

interface WelcomeHeroProps {
  profile: TalentProfile | undefined;
  user: User | null;
}

export function WelcomeHero({ profile, user }: WelcomeHeroProps) {
  const name = profile?.full_legal_name || user?.username || "Talent";
  const username = profile?.username;
  const initials = getInitials(name);
  const city = profile?.location?.city;
  const state = profile?.location?.state;
  const locationStr = [city, state].filter(Boolean).join(", ");
  const availability = profile?.availability ?? "available";
  const availabilityMeta = availabilityConfig[availability] ?? availabilityConfig.available;
  const AvailabilityIcon = availabilityMeta.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
    >
      <Card className="relative overflow-hidden border-border/60 bg-gradient-to-br from-surface via-card to-background py-0">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/[0.03] to-transparent" />
        <div className="ambient-glow -right-16 -top-16 size-72 bg-primary/20" />
        <div className="ambient-glow bottom-0 left-1/4 size-56 bg-gold/10" />

        <CardContent className="relative flex flex-col gap-5 p-5 sm:flex-row sm:items-center sm:gap-6 lg:p-6">
          <Link
            href={username ? `/talent/${username}` : "/talent/profile"}
            className="group relative shrink-0 self-start"
          >
            <Avatar className="size-24 border-2 border-border ring-2 ring-primary/10 transition-transform duration-200 group-hover:scale-[1.02] sm:size-28">
              <AvatarImage src={profile?.profile_photo} alt={name} />
              <AvatarFallback className="bg-muted text-xl font-semibold">
                {initials}
              </AvatarFallback>
            </Avatar>
            <span className="absolute right-1 bottom-1 size-4 rounded-full border-2 border-card bg-green shadow-[0_0_8px_rgba(34,197,94,0.6)]" />
          </Link>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <Badge
                variant="outline"
                className="gap-1.5 rounded-full border-primary/30 bg-primary/10 px-3 py-1 text-xs font-medium text-primary"
              >
                <Sun className="size-3" />
                {getGreeting()}
              </Badge>
              <Badge
                variant="outline"
                className={cn(
                  "gap-1.5 rounded-full px-3 py-1 text-xs font-medium",
                  availabilityMeta.color,
                  availabilityMeta.bg,
                  availabilityMeta.border
                )}
              >
                <span className={cn("size-1.5 rounded-full", availabilityMeta.dot)} />
                <AvailabilityIcon className="size-3" />
                {availabilityMeta.label}
              </Badge>
            </div>

            <h1 className="mt-3 text-2xl font-bold leading-tight sm:text-3xl">
              <span className="bg-gradient-to-r from-foreground via-foreground to-muted-foreground bg-clip-text text-transparent">
                {name}
              </span>
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">{formatDate()}</p>

            <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-text-secondary">
              {locationStr && (
                <span className="flex items-center gap-1.5">
                  <MapPin className="size-3.5 text-muted-foreground" /> {locationStr}
                </span>
              )}
              {profile?.is_verified && (
                <Badge
                  variant="outline"
                  className="gap-1 rounded-full border-gold/40 bg-gold/10 px-2.5 py-0.5 text-xs text-gold"
                >
                  <Check className="size-3" /> Verified
                </Badge>
              )}
            </div>
          </div>

          <Button
            asChild
            variant="outline"
            size="icon"
            className="absolute top-4 right-4 rounded-full border-border bg-surface/80 hover:bg-surface-2 hover:text-foreground sm:static sm:size-9 lg:hidden"
          >
            <Link href="/talent/profile" aria-label="Edit profile">
              <Pencil className="size-4" />
            </Link>
          </Button>

          <Button
            asChild
            variant="outline"
            className="hidden rounded-full border-border bg-surface/80 px-4 hover:bg-surface-2 hover:text-foreground lg:inline-flex"
          >
            <Link href="/talent/profile">
              <Pencil className="size-3.5" />
              Edit profile
            </Link>
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
}
