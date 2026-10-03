"use client";

import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { EditorShell, SaveAction } from "./EditorShell";
import { Button } from "@/components/ui/button";
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

interface CustomFieldRow {
  id: string;
  key: string;
  value: string;
}

function toCustomFieldRows(fields?: Record<string, string>): CustomFieldRow[] {
  return Object.entries(fields ?? {}).map(([key, value], index) => ({
    id: `custom-${index}-${key}`,
    key,
    value,
  }));
}

export function PhysicalEditor({ profile, onBack, onUpdate }: EditorProps) {
  const [attrs, setAttrs] = useState<PhysicalAttributes>(
    profile.physicalAttributes,
  );
  const [customFields, setCustomFields] = useState<CustomFieldRow[]>(() =>
    toCustomFieldRows(profile.physicalAttributes.custom_fields),
  );

  const set = <K extends keyof PhysicalAttributes>(
    key: K,
    value: PhysicalAttributes[K],
  ) => {
    setAttrs((prev) => ({ ...prev, [key]: value }));
  };

  const save = () => {
    const custom_fields = Object.fromEntries(
      customFields
        .map(({ key, value }) => [key.trim(), value.trim()] as const)
        .filter(([key, value]) => key.length > 0 && value.length > 0),
    );

    onUpdate({
      physicalAttributes: { ...attrs, custom_fields },
    });
    onBack();
  };

  const updateCustomField = (
    id: string,
    field: "key" | "value",
    value: string,
  ) => {
    setCustomFields((previous) =>
      previous.map((item) => (item.id === id ? { ...item, [field]: value } : item)),
    );
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

          <div className="space-y-3 border-t pt-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <Label>Custom Details</Label>
                <p className="mt-1 text-xs text-muted-foreground">
                  Add any other casting detail as a label and value.
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="shrink-0 gap-1.5"
                onClick={() =>
                  setCustomFields((previous) => [
                    ...previous,
                    {
                      id: `custom-${Date.now()}-${previous.length}`,
                      key: "",
                      value: "",
                    },
                  ])
                }
              >
                <Plus className="size-3.5" />
                Add field
              </Button>
            </div>

            {customFields.length > 0 ? (
              <div className="space-y-2">
                {customFields.map((field, index) => (
                  <div
                    key={field.id}
                    className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2 sm:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)_auto]"
                  >
                    <Input
                      aria-label={`Custom field ${index + 1} name`}
                      value={field.key}
                      onChange={(event) =>
                        updateCustomField(field.id, "key", event.target.value)
                      }
                      placeholder="Label"
                    />
                    <Input
                      className="col-span-2 sm:col-span-1"
                      aria-label={`Custom field ${index + 1} value`}
                      value={field.value}
                      onChange={(event) =>
                        updateCustomField(field.id, "value", event.target.value)
                      }
                      placeholder="Value"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      aria-label={`Remove custom field ${index + 1}`}
                      onClick={() =>
                        setCustomFields((previous) =>
                          previous.filter((item) => item.id !== field.id),
                        )
                      }
                    >
                      <Trash2 className="size-4 text-muted-foreground" />
                    </Button>
                  </div>
                ))}
              </div>
            ) : null}
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
