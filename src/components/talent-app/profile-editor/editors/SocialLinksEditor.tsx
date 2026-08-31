"use client";

import { useState } from "react";
import {
  Instagram,
  Youtube,
  Linkedin,
  Facebook,
  Twitter,
  Twitch,
  Dribbble,
  Music,
  Globe,
  Link2,
  Plus,
  Trash2,
  Music2,
  Camera,
  Bookmark,
  MessageSquare,
  Briefcase,
  Video,
} from "lucide-react";
import { EditorShell, SaveAction } from "./EditorShell";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import type { Profile, SocialLinkItem } from "../profile-types";

interface EditorProps {
  profile: Profile;
  onBack: () => void;
  onUpdate: (patch: Partial<Profile>) => void;
}

const PLATFORMS = [
  { key: "instagram", label: "Instagram", icon: Instagram },
  { key: "youtube", label: "YouTube", icon: Youtube },
  { key: "tiktok", label: "TikTok", icon: Music2 },
  { key: "linkedin", label: "LinkedIn", icon: Linkedin },
  { key: "facebook", label: "Facebook", icon: Facebook },
  { key: "twitter", label: "X / Twitter", icon: Twitter },
  { key: "pinterest", label: "Pinterest", icon: Bookmark },
  { key: "snapchat", label: "Snapchat", icon: Camera },
  { key: "twitch", label: "Twitch", icon: Twitch },
  { key: "discord", label: "Discord", icon: MessageSquare },
  { key: "behance", label: "Behance", icon: Briefcase },
  { key: "dribbble", label: "Dribbble", icon: Dribbble },
  { key: "vimeo", label: "Vimeo", icon: Video },
  { key: "spotify", label: "Spotify", icon: Music },
  { key: "website", label: "Website", icon: Globe },
] as const;

const MAX_LINKS = 5;

interface LinkEntry {
  platform: string;
  url: string;
  visibility: string;
  show_on_profile: boolean;
}

function buildInitialLinks(profile: Profile): LinkEntry[] {
  const existing = profile.socialLinks;
  const entries: LinkEntry[] = [];

  Object.entries(existing).forEach(([key, value]) => {
    if (value.url) {
      entries.push({
        platform: key,
        url: value.url,
        visibility: value.visibility ?? "public",
        show_on_profile: value.show_on_profile ?? true,
      });
    }
  });

  return entries;
}

function getAvailablePlatforms(current: LinkEntry[], editingIndex: number) {
  const usedPlatforms = current
    .filter((_, i) => i !== editingIndex)
    .map((e) => e.platform);
  return PLATFORMS.filter((p) => !usedPlatforms.includes(p.key));
}

export function SocialLinksEditor({ profile, onBack, onUpdate }: EditorProps) {
  const [links, setLinks] = useState<LinkEntry[]>(() =>
    buildInitialLinks(profile),
  );

  const save = () => {
    const next: Record<string, SocialLinkItem> = {};
    links.forEach((entry) => {
      if (entry.platform && entry.url.trim()) {
        next[entry.platform] = {
          url: entry.url.trim(),
          visibility: entry.visibility,
          show_on_profile: entry.show_on_profile,
        };
      }
    });
    onUpdate({ socialLinks: next });
    onBack();
  };

  const addLink = () => {
    if (links.length >= MAX_LINKS) {
      toast.error(`Maximum ${MAX_LINKS} links allowed`);
      return;
    }
    const usedPlatforms = links.map((l) => l.platform);
    const firstAvailable = PLATFORMS.find(
      (p) => !usedPlatforms.includes(p.key),
    );
    if (!firstAvailable) return;

    setLinks((prev) => [
      ...prev,
      {
        platform: firstAvailable.key,
        url: "",
        visibility: "public",
        show_on_profile: true,
      },
    ]);
  };

  const removeLink = (index: number) => {
    setLinks((prev) => prev.filter((_, i) => i !== index));
  };

  const updatePlatform = (index: number, platform: string) => {
    setLinks((prev) =>
      prev.map((entry, i) => (i === index ? { ...entry, platform } : entry)),
    );
  };

  const updateUrl = (index: number, url: string) => {
    setLinks((prev) =>
      prev.map((entry, i) => (i === index ? { ...entry, url } : entry)),
    );
  };

  const getPlaceholder = (platform: string) => {
    const p = PLATFORMS.find((plat) => plat.key === platform);
    if (platform === "website") return "yoursite.com";
    if (platform === "discord") return "discord.gg/invite";
    if (platform === "tiktok") return "tiktok.com/@username";
    return `${platform}.com/username`;
  };

  return (
    <EditorShell
      title="Social Links"
      onBack={onBack}
      action={<SaveAction onClick={save} />}
    >
      <Card>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Add up to {MAX_LINKS} social links. Pick a platform and paste your
            profile URL.
          </p>

          {links.map((entry, index) => {
            const Icon =
              PLATFORMS.find((p) => p.key === entry.platform)?.icon ?? Link2;
            return (
              <div key={index} className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <Label className="sr-only">Platform</Label>
                  <Select
                    value={entry.platform}
                    onValueChange={(v) => updatePlatform(index, v)}
                  >
                    <SelectTrigger className="w-[160px]">
                      <SelectValue>
                        <span className="flex items-center gap-2">
                          <Icon className="size-4" />
                          {PLATFORMS.find((p) => p.key === entry.platform)
                            ?.label ?? "Select"}
                        </span>
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {getAvailablePlatforms(links, index).map((p) => (
                        <SelectItem key={p.key} value={p.key}>
                          <span className="flex items-center gap-2">
                            <p.icon className="size-4" />
                            {p.label}
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <div className="relative flex-1">
                    <Input
                      value={entry.url}
                      onChange={(e) => updateUrl(index, e.target.value)}
                      placeholder={getPlaceholder(entry.platform)}
                      className="pr-9"
                    />
                    <Link2 className="absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  </div>

                  <Button
                    variant="ghost"
                    size="icon"
                    className="shrink-0 text-muted-foreground hover:text-destructive"
                    onClick={() => removeLink(index)}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              </div>
            );
          })}

          {links.length < MAX_LINKS && (
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={addLink}
            >
              <Plus className="mr-2 size-4" /> Add link
            </Button>
          )}
        </CardContent>
      </Card>

      <div className="rounded-2xl border bg-muted/40 p-4">
        <p className="text-sm font-medium">Visibility</p>
        <p className="mt-1 text-xs text-muted-foreground">
          Social links follow your profile privacy setting. Turn the Social
          section off to hide them entirely.
        </p>
      </div>
    </EditorShell>
  );
}
