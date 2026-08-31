"use client";

import { useState } from "react";
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
import { Card, CardContent } from "@/components/ui/card";
import {
  BODY_TYPE_OPTIONS,
  HAIR_LENGTH_OPTIONS,
  EYE_COLOR_OPTIONS,
  COMPLEXION_OPTIONS,
} from "../../profile/profile-constants";
import type { Profile, PhysicalAttributes } from "../profile-types";

interface EditorProps {
  profile: Profile;
  onBack: () => void;
  onUpdate: (patch: Partial<Profile>) => void;
}

function SelectField({
  label,
  value,
  options,
  onChange,
  placeholder = "Select",
}: {
  label: string;
  value?: string;
  options: string[];
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      <Select value={value || "__empty__"} onValueChange={(v) => onChange(v === "__empty__" ? "" : v)}>
        <SelectTrigger>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="__empty__">{placeholder}</SelectItem>
          {options.map((o) => (
            <SelectItem key={o} value={o}>
              {o}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

const TATTOO_OPTIONS = ["None", "Small", "Medium", "Large", "Multiple"];

export function PhysicalEditor({ profile, onBack, onUpdate }: EditorProps) {
  const [attrs, setAttrs] = useState<PhysicalAttributes>(
    profile.physicalAttributes,
  );

  const set = <K extends keyof PhysicalAttributes>(
    key: K,
    value: PhysicalAttributes[K],
  ) => {
    setAttrs((prev) => ({ ...prev, [key]: value }));
  };

  const save = () => {
    onUpdate({ physicalAttributes: attrs });
    onBack();
  };

  return (
    <EditorShell
      title="Physical Attributes"
      onBack={onBack}
      action={<SaveAction onClick={save} />}
    >
      <Card>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="height">Height (cm)</Label>
              <Input
                id="height"
                type="number"
                value={attrs.height_cm ?? ""}
                onChange={(e) =>
                  set("height_cm", e.target.value ? Number(e.target.value) : undefined)
                }
                placeholder="180"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="weight">Weight (kg)</Label>
              <Input
                id="weight"
                type="number"
                value={attrs.weight_kg ?? ""}
                onChange={(e) =>
                  set("weight_kg", e.target.value ? Number(e.target.value) : undefined)
                }
                placeholder="72"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="chest">Chest</Label>
              <Input
                id="chest"
                value={attrs.chest ?? ""}
                onChange={(e) => set("chest", e.target.value)}
                placeholder="40 in"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="waist">Waist</Label>
              <Input
                id="waist"
                value={attrs.waist ?? ""}
                onChange={(e) => set("waist", e.target.value)}
                placeholder="32 in"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="shoe">Shoe Size</Label>
              <Input
                id="shoe"
                value={attrs.shoe_size ?? ""}
                onChange={(e) => set("shoe_size", e.target.value)}
                placeholder="UK 9"
              />
            </div>
          </div>

          <SelectField
            label="Hair Color"
            value={attrs.hair_color}
            options={[
              "Black",
              "Dark Brown",
              "Brown",
              "Blonde",
              "Red",
              "Grey",
              "Coloured",
            ]}
            onChange={(v) => set("hair_color", v)}
          />
          <SelectField
            label="Eye Color"
            value={attrs.eye_color}
            options={EYE_COLOR_OPTIONS}
            onChange={(v) => set("eye_color", v)}
          />
          <SelectField
            label="Complexion"
            value={attrs.complexion}
            options={COMPLEXION_OPTIONS}
            onChange={(v) => set("complexion", v)}
          />
          <SelectField
            label="Body Type"
            value={attrs.body_type}
            options={BODY_TYPE_OPTIONS}
            onChange={(v) => set("body_type", v)}
          />
          <SelectField
            label="Hair Length"
            value={attrs.hair_length}
            options={HAIR_LENGTH_OPTIONS}
            onChange={(v) => set("hair_length", v)}
          />
          <SelectField
            label="Tattoos / Marks"
            value={attrs.tattoos}
            options={TATTOO_OPTIONS}
            onChange={(v) => set("tattoos", v)}
          />

          <div className="space-y-1.5">
            <Label htmlFor="distinctive">Distinctive Features</Label>
            <Input
              id="distinctive"
              value={attrs.distinctive_features ?? ""}
              onChange={(e) => set("distinctive_features", e.target.value)}
              placeholder="Freckles, dimples, scars, etc."
            />
          </div>
        </CardContent>
      </Card>

      <div className="rounded-2xl border bg-muted/40 p-4">
        <p className="text-sm font-medium">Used for casting filters</p>
        <p className="mt-1 text-xs text-muted-foreground">
          These details are only shown publicly if Physical Attributes is on in
          Section Visibility.
        </p>
      </div>
    </EditorShell>
  );
}
