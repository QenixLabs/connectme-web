"use client";

import { useState } from "react";
import { Check, Plus, Search, X } from "lucide-react";
import { EditorShell, SaveAction } from "./EditorShell";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LANGUAGE_FLUENCY_OPTIONS } from "../../profile/profile-constants";
import { cn } from "@/lib/utils";
import type { Profile, LanguageItem } from "../profile-types";

interface EditorProps {
  profile: Profile;
  onBack: () => void;
  onUpdate: (patch: Partial<Profile>) => void;
}

const ALL_LANGUAGES = [
  "English",
  "Hindi",
  "Telugu",
  "Tamil",
  "Bengali",
  "Marathi",
  "Kannada",
  "Malayalam",
  "Punjabi",
  "Gujarati",
  "Urdu",
  "French",
];

function LanguageRow({
  item,
  onChange,
  onRemove,
}: {
  item: LanguageItem;
  onChange: (item: LanguageItem) => void;
  onRemove: () => void;
}) {
  return (
    <div className="flex items-center gap-2">
      <Input
        value={item.name}
        onChange={(e) => onChange({ ...item, name: e.target.value })}
        placeholder="Language"
        className="flex-1"
      />
      <Select
        value={item.fluency}
        onValueChange={(v) => onChange({ ...item, fluency: v })}
      >
        <SelectTrigger className="w-[140px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {LANGUAGE_FLUENCY_OPTIONS.map((opt) => (
            <SelectItem key={opt} value={opt}>
              {opt}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Button
        variant="ghost"
        size="icon"
        onClick={onRemove}
        aria-label={`Remove ${item.name}`}
      >
        <X className="size-4" />
      </Button>
    </div>
  );
}

export function LanguagesEditor({ profile, onBack, onUpdate }: EditorProps) {
  const [languages, setLanguages] = useState<LanguageItem[]>(profile.languages);
  const [accents, setAccents] = useState<string[]>(profile.accents);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [query, setQuery] = useState("");

  const save = () => {
    onUpdate({ languages, accents });
    onBack();
  };

  const availableLanguages = ALL_LANGUAGES.filter(
    (l) => !languages.some((existing) => existing.name.toLowerCase() === l.toLowerCase()),
  ).filter((l) => l.toLowerCase().includes(query.toLowerCase()));

  return (
    <EditorShell
      title="Languages & Accents"
      onBack={onBack}
      action={<SaveAction onClick={save} />}
    >
      <Card>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label>Languages</Label>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setQuery("");
                  setPickerOpen(true);
                }}
              >
                <Plus className="mr-1 size-3.5" /> Add
              </Button>
            </div>
            {languages.length === 0 ? (
              <p className="text-sm text-muted-foreground">No languages added yet.</p>
            ) : (
              <div className="space-y-2">
                {languages.map((lang, idx) => (
                  <LanguageRow
                    key={`${lang.name}-${idx}`}
                    item={lang}
                    onChange={(updated) =>
                      setLanguages((prev) =>
                        prev.map((l, i) => (i === idx ? updated : l)),
                      )
                    }
                    onRemove={() =>
                      setLanguages((prev) => prev.filter((_, i) => i !== idx))
                    }
                  />
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="space-y-3">
          <Label>Accents</Label>
          <div className="flex flex-wrap gap-2">
            {accents.map((accent) => (
              <Badge key={accent} variant="secondary" className="gap-1">
                {accent}
                <button
                  onClick={() =>
                    setAccents((prev) => prev.filter((a) => a !== accent))
                  }
                  aria-label={`Remove ${accent}`}
                >
                  <X className="size-3" />
                </button>
              </Badge>
            ))}
            <Input
              value=""
              onChange={(e) => {
                const v = e.target.value.trim();
                if (v && e.target.value.endsWith(",")) {
                  const cleaned = v.replace(/,$/, "");
                  if (cleaned && !accents.includes(cleaned)) {
                    setAccents([...accents, cleaned]);
                  }
                  e.target.value = "";
                }
              }}
              onKeyDown={(e) => {
                const target = e.currentTarget;
                const v = target.value.trim();
                if (e.key === "Enter" && v && !accents.includes(v)) {
                  e.preventDefault();
                  setAccents([...accents, v]);
                  target.value = "";
                }
              }}
              placeholder="Add accent and press Enter"
              className="min-w-[180px] flex-1"
            />
          </div>
        </CardContent>
      </Card>

      <Sheet open={pickerOpen} onOpenChange={setPickerOpen}>
        <SheetContent side="bottom" className="rounded-t-2xl">
          <SheetHeader className="px-0">
            <SheetTitle>Add Language</SheetTitle>
          </SheetHeader>
          <div className="space-y-4 pb-6">
            <div className="relative">
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search"
                className="pr-9"
              />
              <Search className="absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            </div>
            <div className="flex flex-wrap gap-2">
              {availableLanguages.map((lang) => (
                <Button
                  key={lang}
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setLanguages([
                      ...languages,
                      { name: lang, fluency: "Fluent" },
                    ]);
                    setPickerOpen(false);
                  }}
                >
                  <Plus className="mr-1 size-3" /> {lang}
                </Button>
              ))}
              {availableLanguages.length === 0 && (
                <p className="w-full py-4 text-center text-sm text-muted-foreground">
                  Nothing left to add.
                </p>
              )}
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </EditorShell>
  );
}
