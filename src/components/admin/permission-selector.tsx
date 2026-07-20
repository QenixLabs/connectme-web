"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, X } from "lucide-react";
import { useState, useId } from "react";

export const PERMISSION_KEYS = [
  { value: "campaign-creation", label: "Campaign creation" },
  { value: "campaign-analytics", label: "Campaign analytics" },
  { value: "campaign-export", label: "Campaign export" },
  { value: "portfolio-media-upload", label: "Portfolio media upload" },
  { value: "public-profile-portfolio", label: "Public profile / portfolio" },
  { value: "shortlist-campaign-talent", label: "Shortlist campaign talent" },
  { value: "save-campaign", label: "Save / apply to campaign" },
  { value: "bulk-campaign-invite", label: "Bulk campaign invite" },
  { value: "team-collaboration", label: "Team collaboration" },
] as const;

interface PermissionSelectorProps {
  value: string[];
  onChange: (value: string[]) => void;
}

export function PermissionSelector({ value, onChange }: PermissionSelectorProps) {
  const [custom, setCustom] = useState("");
  const idPrefix = useId();

  const toggle = (permission: string) => {
    if (value.includes(permission)) {
      onChange(value.filter((v) => v !== permission));
    } else {
      onChange([...value, permission]);
    }
  };

  const addCustom = () => {
    const key = custom.trim().toLowerCase().replace(/\s+/g, "-");
    if (!key || value.includes(key)) return;
    onChange([...value, key]);
    setCustom("");
  };

  const removeCustom = (permission: string) => {
    onChange(value.filter((v) => v !== permission));
  };

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 gap-2">
        {PERMISSION_KEYS.map((permission) => (
          <div key={permission.value} className="flex items-center space-x-2">
            <Checkbox
              id={`${idPrefix}-${permission.value}`}
              checked={value.includes(permission.value)}
              onCheckedChange={() => toggle(permission.value)}
            />
            <label
              htmlFor={`${idPrefix}-${permission.value}`}
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              {permission.label}
            </label>
          </div>
        ))}
      </div>

      <div className="space-y-2">
        <p className="text-xs text-muted-foreground">Demo / future features</p>
        <div className="flex gap-2">
          <Input
            value={custom}
            onChange={(e) => setCustom(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addCustom();
              }
            }}
            placeholder="custom-feature-key"
            className="h-8 text-xs"
          />
          <Button type="button" variant="outline" size="sm" onClick={addCustom} className="h-8">
            <Plus className="w-3.5 h-3.5" />
          </Button>
        </div>
        {value
          .filter((v) => !PERMISSION_KEYS.some((p) => p.value === v))
          .length > 0 && (
          <div className="flex flex-wrap gap-2">
            {value
              .filter((v) => !PERMISSION_KEYS.some((p) => p.value === v))
              .map((v) => (
                <span
                  key={v}
                  className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-slate-100 text-xs"
                >
                  {v}
                  <button
                    type="button"
                    aria-label={`Remove ${v} permission`}
                    onClick={() => removeCustom(v)}
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
          </div>
        )}
      </div>
    </div>
  );
}
