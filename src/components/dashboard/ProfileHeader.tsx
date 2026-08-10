import { useRouter } from "next/navigation";
import { MapPin, Pencil, Sun, Check } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useDashboard } from "./DashboardProvider";

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "GOOD MORNING";
  if (h < 17) return "GOOD AFTERNOON";
  return "GOOD EVENING";
}

function formatDate() {
  return new Date().toLocaleDateString("en-US", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}

export function ProfileHeader() {
  const { profile } = useDashboard();
  const router = useRouter();

  const name = profile?.full_legal_name || "Talent";
  const username = profile?.username;
  const initials = name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  const city = profile?.location?.city;
  const state = profile?.location?.state;
  const locationStr = [city, state].filter(Boolean).join(", ");
  const isVerified = profile?.is_verified;

  const handleCardClick = () => {
    if (username) {
      router.push(`/talent/${username}`);
    }
  };

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  return (
    <Card
      className="mx-4 flex-row items-start gap-4 rounded-2xl p-4 shadow-none lg:mx-0 cursor-pointer hover:bg-accent/50 transition-colors"
      onClick={handleCardClick}
    >
      <div className="relative shrink-0">
        <Avatar className="size-[86px] border-2 border-border lg:size-28">
          <AvatarImage src={profile?.profile_photo} alt={name} />
          <AvatarFallback>{initials}</AvatarFallback>
        </Avatar>
        <span className="absolute right-1 bottom-1 size-4 rounded-full border-2 border-card bg-primary" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 text-[11px] font-semibold tracking-[0.14em] text-muted-foreground lg:text-xs">
          <Sun className="size-4 text-warning" />
          {getGreeting()}
        </div>
        <h2 className="mt-1 truncate text-[26px] leading-tight font-bold lg:text-[32px]">
          {name}
        </h2>
        <p className="text-sm text-muted-foreground">{formatDate()}</p>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          {locationStr && (
            <span className="flex items-center gap-1 text-sm text-muted-foreground">
              <MapPin className="size-4" /> {locationStr}
            </span>
          )}
          {isVerified && (
            <Badge
              variant="outline"
              className="gap-1.5 rounded-full border-primary/60 px-3 py-1 text-sm text-primary"
            >
              <Check className="size-4" /> Verified
            </Badge>
          )}
        </div>
      </div>
      <Button
        variant="outline"
        size="icon"
        aria-label="Edit profile"
        className="size-10 shrink-0 rounded-full bg-transparent"
        asChild
      >
        <a href="/talent/profile" onClick={handleEditClick}>
          <Pencil className="size-4" />
        </a>
      </Button>
    </Card>
  );
}
