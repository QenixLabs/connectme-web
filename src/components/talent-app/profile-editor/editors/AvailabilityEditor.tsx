"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import { EditorShell, SaveAction } from "./EditorShell";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { Profile, Availability } from "../profile-types";

interface EditorProps {
  profile: Profile;
  onBack: () => void;
  onUpdate: (patch: Partial<Profile>) => void;
}

const OPTIONS: { value: Availability; title: string; description: string }[] = [
  {
    value: "available",
    title: "Available for Work",
    description: "Clients can book you right now",
  },
  {
    value: "busy",
    title: "Busy",
    description: "You won't appear in active casting searches",
  },
  {
    value: "not_available",
    title: "Not Available",
    description: "Hide your profile from casting searches",
  },
];

const TRAVEL_CITIES = [
  "Mumbai",
  "Delhi NCR",
  "Hyderabad",
  "Bangalore",
  "Chennai",
  "Kolkata",
  "Pune",
  "Ahmedabad",
];

export function AvailabilityEditor({ profile, onBack, onUpdate }: EditorProps) {
  const [availability, setAvailability] = useState<Availability>(
    profile.availability,
  );
  const [availableFrom, setAvailableFrom] = useState(profile.availableFrom);
  const [openToTravel, setOpenToTravel] = useState(profile.openToTravel);
  const [travelLocations, setTravelLocations] = useState<string[]>(
    profile.travelLocations,
  );

  const toggleLocation = (city: string) => {
    setTravelLocations((prev) =>
      prev.includes(city)
        ? prev.filter((c) => c !== city)
        : [...prev, city],
    );
  };

  const save = () => {
    onUpdate({
      availability,
      availableFrom,
      openToTravel,
      travelLocations,
    });
    onBack();
  };

  return (
    <EditorShell
      title="Availability"
      onBack={onBack}
      action={<SaveAction onClick={save} />}
    >
      <div className="space-y-2.5">
        {OPTIONS.map((option) => {
          const selected = availability === option.value;
          return (
            <Card
              key={option.value}
              onClick={() => setAvailability(option.value)}
              className={cn(
                "cursor-pointer p-4 transition-colors",
                selected
                  ? "border-primary bg-primary/5"
                  : "hover:border-primary/40",
              )}
            >
              <div className="flex items-start gap-3">
                <div
                  className={cn(
                    "mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full border",
                    selected
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-muted-foreground/40",
                  )}
                >
                  {selected && <Check className="size-3" />}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold">{option.title}</p>
                  <p className="text-sm text-muted-foreground">
                    {option.description}
                  </p>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {availability === "available" && (
        <div className="space-y-4 pt-2">
          <div className="space-y-1.5">
            <Label>Available from date (optional)</Label>
            <Input
              type="date"
              value={availableFrom}
              onChange={(e) => setAvailableFrom(e.target.value)}
            />
          </div>

          <div className="flex items-center justify-between gap-3 rounded-xl border p-4">
            <div>
              <p className="font-semibold">Open to travel</p>
              <p className="text-sm text-muted-foreground">
                Willing to relocate for the right project
              </p>
            </div>
            <Switch
              checked={openToTravel}
              onCheckedChange={setOpenToTravel}
              aria-label="Open to travel"
            />
          </div>

          {openToTravel && (
            <div>
              <Label className="mb-2 block">Preferred locations</Label>
              <div className="flex flex-wrap gap-2">
                {TRAVEL_CITIES.map((city) => {
                  const selected = travelLocations.includes(city);
                  return (
                    <Badge
                      key={city}
                      variant={selected ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => toggleLocation(city)}
                    >
                      {city}
                    </Badge>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </EditorShell>
  );
}
