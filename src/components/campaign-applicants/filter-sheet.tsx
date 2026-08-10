import { useState } from "react";
import { X } from "lucide-react";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";

const stageOptions = [
  { label: "All Stages", dot: "bg-muted-foreground" },
  { label: "Applied", dot: "bg-[var(--info)]" },
  { label: "Shortlisted", dot: "bg-primary" },
  { label: "Pending Review", dot: "bg-[var(--amber)]" },
  { label: "Accepted", dot: "bg-[var(--success)]" },
  { label: "Rejected", dot: "bg-[var(--destructive)]" },
];

const taskOptions = [
  { label: "All Status", dot: "bg-muted-foreground" },
  { label: "Not Started", dot: "bg-muted-foreground" },
  { label: "In Progress", dot: "bg-[var(--info)]" },
  { label: "Completed", dot: "bg-[var(--success)]" },
  { label: "Under Review", dot: "bg-[var(--amber)]" },
];

const availabilityOptions = [
  "All",
  "Available Now",
  "Available in 1 Week",
  "Available in 2+ Weeks",
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
          checked ? "border-primary bg-primary" : "border-border",
        )}
      >
        {checked && (
          <svg viewBox="0 0 12 12" className="h-3 w-3 text-primary-foreground">
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
            className="text-sm text-primary underline underline-offset-2"
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

interface FilterSheetProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}

export function FilterSheet({ open, onOpenChange }: FilterSheetProps) {
  const [selected, setSelected] = useState<string[]>([]);
  const [range, setRange] = useState([0, 100]);

  const toggle = (label: string) =>
    setSelected((s) =>
      s.includes(label) ? s.filter((x) => x !== label) : [...s, label],
    );

  const clearGroup = (labels: string[]) =>
    setSelected((s) => s.filter((x) => !labels.includes(x)));

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        className="max-h-[92vh] overflow-y-auto rounded-t-3xl border-border bg-background p-5 [&>button]:hidden"
      >
        <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-border" />
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-2xl font-bold">Filter Applicants</h2>
          <button
            onClick={() => onOpenChange(false)}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-card text-muted-foreground"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <Group
          title="Stage"
          onClear={() => clearGroup(stageOptions.map((o) => o.label))}
        >
          {stageOptions.map((o) => (
            <Row
              key={o.label}
              label={o.label}
              dot={o.dot}
              checked={selected.includes(o.label)}
              onToggle={() => toggle(o.label)}
            />
          ))}
        </Group>

        <Group
          title="Task Status"
          onClear={() => clearGroup(taskOptions.map((o) => o.label))}
        >
          {taskOptions.map((o) => (
            <Row
              key={o.label}
              label={o.label}
              dot={o.dot}
              checked={selected.includes(o.label)}
              onToggle={() => toggle(o.label)}
            />
          ))}
        </Group>

        <Group
          title="Availability"
          onClear={() => clearGroup(availabilityOptions)}
        >
          {availabilityOptions.map((o) => (
            <Row
              key={o}
              label={o}
              checked={selected.includes(o)}
              onToggle={() => toggle(o)}
            />
          ))}
        </Group>

        <div className="mt-6">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-base font-semibold">Profile Score</h3>
            <button
              onClick={() => setRange([0, 100])}
              className="text-sm text-primary underline underline-offset-2"
            >
              Clear
            </button>
          </div>
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>0%</span>
            <span>100%</span>
          </div>
          <Slider
            value={range}
            onValueChange={setRange}
            max={100}
            step={5}
            className="mt-2"
          />
          <p className="mt-2 text-center text-sm text-muted-foreground">
            {range[0]}% - {range[1]}%
          </p>
        </div>

        <div className="mt-6 flex flex-col gap-3 pb-4">
          <button
            onClick={() => onOpenChange(false)}
            className="w-full rounded-xl bg-primary py-3.5 text-base font-semibold text-primary-foreground"
          >
            Apply Filters
          </button>
          <button
            onClick={() => {
              setSelected([]);
              setRange([0, 100]);
            }}
            className="w-full rounded-xl border border-primary py-3.5 text-base font-semibold text-primary"
          >
            Reset All
          </button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
