import { useState } from "react";
import { X } from "lucide-react";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

const statusOptions = [
  { label: "All Status", dot: "bg-muted-foreground" },
  { label: "Pending", dot: "bg-teal" },
  { label: "Accepted", dot: "bg-green-tag" },
  { label: "Rejected", dot: "bg-destructive" },
];

const typeOptions = [
  { label: "All Types", dot: "bg-muted-foreground" },
  { label: "Recruiter", dot: "bg-violet-tag" },
  { label: "Mentor", dot: "bg-teal" },
  { label: "Collaborator", dot: "bg-green-tag" },
];

function Row({
  label,
  dot,
  checked,
  onToggle,
}: {
  label: string;
  dot?: string;
  checked: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      onClick={onToggle}
      className="flex w-full items-center gap-3 border-b border-border px-4 py-3.5 last:border-0"
    >
      {dot && <span className={cn("h-2.5 w-2.5 rounded-full", dot)} />}
      <span
        className={cn(
          "flex-1 text-left text-sm",
          checked ? "font-medium text-foreground" : "text-muted-foreground",
        )}
      >
        {label}
      </span>
      <span
        className={cn(
          "flex h-5 w-5 items-center justify-center rounded-md border",
          checked ? "border-teal bg-teal" : "border-border",
        )}
      >
        {checked && (
          <svg viewBox="0 0 12 12" className="h-3 w-3 text-white">
            <path
              d="M2 6.5L4.5 9L10 3.5"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
      </span>
    </button>
  );
}

function Group({
  title,
  onClear,
  children,
}: {
  title: string;
  onClear?: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="mt-6 first:mt-0">
      <div className="mb-2 flex items-center justify-between">
        <h3 className="text-base font-semibold">{title}</h3>
        {onClear && (
          <button
            onClick={onClear}
            className="text-sm text-teal underline underline-offset-2"
          >
            Clear
          </button>
        )}
      </div>
      <div className="overflow-hidden rounded-xl border border-border bg-card">
        {children}
      </div>
    </div>
  );
}

interface RequestFiltersSheetProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onApply: (filters: { status: string; type: string }) => void;
}

export function RequestFiltersSheet({
  open,
  onOpenChange,
  onApply,
}: RequestFiltersSheetProps) {
  const [selected, setSelected] = useState<string[]>([]);

  const toggle = (label: string) =>
    setSelected((s) =>
      s.includes(label) ? s.filter((x) => x !== label) : [...s, label],
    );

  const clearGroup = (labels: string[]) =>
    setSelected((s) => s.filter((x) => !labels.includes(x)));

  const handleApply = () => {
    const status =
      selected.find((s) => statusOptions.some((o) => o.label === s && o.label !== "All Status")) || "All Status";
    const type =
      selected.find((s) => typeOptions.some((o) => o.label === s && o.label !== "All Types")) || "All Types";
    onApply({ status, type });
    onOpenChange(false);
  };

  const handleReset = () => {
    setSelected([]);
    onApply({ status: "All Status", type: "All Types" });
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        className="max-h-[92vh] overflow-y-auto rounded-t-3xl border-border bg-background p-5 [&>button]:hidden"
      >
        <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-border" />
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-2xl font-bold">Filter Requests</h2>
          <button
            onClick={() => onOpenChange(false)}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-card text-muted-foreground"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <Group
          title="Status"
          onClear={() =>
            clearGroup(statusOptions.map((o) => o.label))
          }
        >
          {statusOptions.map((o) => (
            <Row
              key={o.label}
              label={o.label}
              dot={o.dot}
              checked={selected.includes(o.label)}
              onToggle={() => {
                if (o.label === "All Status") {
                  clearGroup(statusOptions.map((s) => s.label));
                } else {
                  clearGroup(["All Status"]);
                }
                toggle(o.label);
              }}
            />
          ))}
        </Group>

        <Group
          title="Request Type"
          onClear={() =>
            clearGroup(typeOptions.map((o) => o.label))
          }
        >
          {typeOptions.map((o) => (
            <Row
              key={o.label}
              label={o.label}
              dot={o.dot}
              checked={selected.includes(o.label)}
              onToggle={() => {
                if (o.label === "All Types") {
                  clearGroup(typeOptions.map((t) => t.label));
                } else {
                  clearGroup(["All Types"]);
                }
                toggle(o.label);
              }}
            />
          ))}
        </Group>

        <div className="mt-6 flex flex-col gap-3 pb-4">
          <button
            onClick={handleApply}
            className="w-full rounded-xl bg-teal py-3.5 text-base font-semibold text-white"
          >
            Apply Filters
          </button>
          <button
            onClick={handleReset}
            className="w-full rounded-xl border border-teal py-3.5 text-base font-semibold text-teal"
          >
            Reset All
          </button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
