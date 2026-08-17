"use client";

import { useFormContext } from "react-hook-form";
import { FormField, FormItem } from "@/components/ui/form";
import { CampaignWizardInput } from "@/lib/validations/campaign-wizard.schema";
import { cn } from "@/lib/utils";
import { Lock, Globe, UserPlus, Calendar, Clock, Tag, ClipboardList } from "lucide-react";
import type { LucideIcon } from "lucide-react";

const OPTIONS = [
  {
    value: "draft" as const,
    label: "Draft",
    description: "Save privately, publish later",
    icon: Lock,
    hint: "Only you can see this campaign",
  },
  {
    value: "public" as const,
    label: "Public",
    description: "Any talent can discover and apply",
    icon: Globe,
    hint: "Listed in talent search and recommendations",
  },
  {
    value: "invite_only" as const,
    label: "Invite only",
    description: "Only invited talents can apply",
    icon: UserPlus,
    hint: "Hidden from public search, visible via invite link",
  },
];

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2 pt-2 first:pt-0">
       <div className="h-px flex-1 bg-border" />
       <span className="shrink-0 text-[11px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
        {children}
      </span>
       <div className="h-px flex-1 bg-border" />
    </div>
  );
}

function RevCard({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon: LucideIcon;
  children: React.ReactNode;
}) {
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card">
      <div className="flex items-center gap-2 border-b border-border bg-muted px-4 py-2.5">
        <Icon className="size-3.5 text-muted-foreground" strokeWidth={1.5} />
        <span className="text-[11px] font-semibold uppercase tracking-[0.06em] text-muted-foreground">
          {title}
        </span>
      </div>
      <div className="px-4 py-2">{children}</div>
    </div>
  );
}

function RevRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between border-b border-border/60 py-1.5 text-sm last:border-b-0">
      <span className="text-muted-foreground">{label}</span>
      <span className="ml-4 text-right font-medium text-foreground">
        {value}
      </span>
    </div>
  );
}

export function PublishStep() {
  const { control, watch, setValue } =
    useFormContext<CampaignWizardInput>();
  const publishOption = watch("publishOption");
  const scheduledPublishAt = watch("scheduled_publish_at");
  const autoCloseOnDeadline = watch("auto_close_on_deadline");
  const values = watch();

  const roleLine =
    [values.role_type, values.specialties?.join(", ")]
      .filter(Boolean)
      .join(" / ") || "\u2014";
  const loc =
    [values.location?.city, values.location?.state]
      .filter(Boolean)
      .join(", ") || "\u2014";
  const genderAge = [
    values.requirements?.gender || "Any",
    values.requirements?.age_range?.min != null &&
    values.requirements?.age_range?.max != null
      ? `${values.requirements.age_range.min}\u2013${values.requirements.age_range.max}`
      : "\u2014",
  ].join(", ");

  const budget =
    values.budget_range?.min != null ||
    values.budget_range?.max != null
      ? `\u20B9${values.budget_range?.min ?? 0} \u2013 \u20B9${values.budget_range?.max ?? 0}`
      : "Not specified";

  return (
    <div className="flex flex-col gap-4">
      <SectionLabel>Review your campaign</SectionLabel>

      <div className="space-y-3">
        <RevCard title="Basic Info" icon={ClipboardList}>
          <RevRow
            label="Campaign name"
            value={values.name || "\u2014"}
          />
          <RevRow label="Role / specialties" value={roleLine} />
          <RevRow label="Location" value={loc} />
          <RevRow
            label="Application deadline"
            value={values.deadline || "\u2014"}
          />
          {values.dates?.start && (
            <RevRow
              label="Project dates"
              value={`${values.dates.start}${values.dates.end ? ` \u2192 ${values.dates.end}` : ""}`}
            />
          )}
        </RevCard>

        <RevCard title="Requirements" icon={Tag}>
          <RevRow
            label="Skills"
            value={
              values.requirements?.skills?.length
                ? values.requirements.skills.join(", ")
                : "\u2014"
            }
          />
          <RevRow
            label="Languages"
            value={
              values.requirements?.languages?.length
                ? values.requirements.languages.join(", ")
                : "\u2014"
            }
          />
          <RevRow label="Gender / age" value={genderAge} />
          <RevRow label="Budget" value={budget} />
          {values.requirements?.attributes && (
            <RevRow
              label="Other"
              value={values.requirements.attributes}
            />
          )}
        </RevCard>

        {values.specialties && values.specialties.length > 0 && (
          <RevCard title="Specialties" icon={Tag}>
            <RevRow
              label="Required"
              value={values.specialties.join(", ")}
            />
          </RevCard>
        )}

        {values.questions && values.questions.length > 0 && (
          <RevCard title="Questions" icon={ClipboardList}>
            {values.questions.map((q, i) => (
              <div
                key={i}
                 className="flex items-center gap-2 border-b border-border/60 py-1.5 last:border-b-0"
              >
                 <span className="shrink-0 text-xs font-bold text-muted-foreground">
                  {i + 1}.
                </span>
                 <span className="flex-1 text-sm text-foreground">
                  {q.question_text || "\u2014"}
                </span>
                 <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                  {q.question_type}
                </span>
                {q.is_required && (
                   <span className="rounded bg-destructive/10 px-1.5 py-0.5 text-[10px] font-semibold text-destructive">
                    Required
                  </span>
                )}
              </div>
            ))}
          </RevCard>
        )}

        {values.task?.title && (
          <RevCard title="Assignment Task" icon={ClipboardList}>
            <RevRow label="Title" value={values.task.title} />
            <RevRow
              label="Type"
              value={
                values.task.task_type === "file_upload"
                  ? "File Upload"
                  : "Text Response"
              }
            />
            <RevRow
              label="Deadline"
              value={`${values.task.deadline_days || 3} days after shortlist`}
            />
            {values.task.description && (
               <div className="py-2 text-sm leading-relaxed text-muted-foreground">
                {values.task.description}
              </div>
            )}
          </RevCard>
        )}
      </div>

      <SectionLabel>Visibility</SectionLabel>

      <FormField
        control={control}
        name="publishOption"
        render={() => (
          <FormItem>
            <div className="space-y-2">
              {OPTIONS.map((opt) => {
                const Icon = opt.icon;
                const selected = publishOption === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() =>
                      setValue("publishOption", opt.value, {
                        shouldValidate: true,
                      })
                    }
                    className={cn(
                      "flex items-start gap-4 p-4 rounded-xl border text-left transition-all duration-200 w-full",
                      selected
                         ? "border-accent-teal bg-accent-teal-bg shadow-sm"
                         : "border-border bg-card hover:border-border-hover",
                    )}
                  >
                    <div
                      className={cn(
                        "w-10 h-10 rounded-xl flex items-center justify-center shrink-0 mt-0.5 transition-colors",
                        selected
                           ? "bg-accent-teal text-accent-foreground"
                           : "bg-muted text-muted-foreground",
                      )}
                    >
                      <Icon className="w-5 h-5" strokeWidth={1.5} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <span
                        className={cn(
                          "text-sm font-semibold block",
                           selected ? "text-foreground" : "text-foreground/90",
                        )}
                      >
                        {opt.label}
                      </span>
                       <span className="mt-0.5 block text-[13px] leading-relaxed text-muted-foreground">
                        {opt.description}
                      </span>
                       <span className="mt-1 block text-[11px] text-muted-foreground/60">
                        {opt.hint}
                      </span>
                    </div>
                    {selected && (
                       <div className="mt-1 flex size-5 shrink-0 items-center justify-center rounded-full bg-accent-teal">
                        <svg
                           className="size-3 text-accent-foreground"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth={3}
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </FormItem>
        )}
      />

      {publishOption !== "draft" && (
        <>
          <SectionLabel>Scheduling</SectionLabel>
          <div className="space-y-3">
             <div className="flex items-start gap-3 rounded-xl border border-border bg-card p-4">
               <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-muted">
                <Calendar
                   className="size-5 text-muted-foreground"
                  strokeWidth={1.5}
                />
              </div>
              <div className="flex-1">
                 <label className="mb-2 block text-sm font-semibold text-foreground">
                  Publish date &amp; time
                </label>
                <input
                  type="datetime-local"
                  value={scheduledPublishAt || ""}
                  onChange={(e) =>
                    setValue("scheduled_publish_at", e.target.value, {
                      shouldValidate: true,
                    })
                  }
                   className="h-10 w-full rounded-xl border-border bg-bg-surface-inset px-3 text-sm text-foreground focus-visible:ring-accent-teal/30"
                />
              </div>
            </div>
            {scheduledPublishAt && (
               <p className="flex items-center gap-1.5 rounded-lg border border-accent-amber/30 bg-accent-amber-bg p-2.5 text-xs text-accent-amber">
                <Clock
                  className="w-3.5 h-3.5 shrink-0"
                  strokeWidth={1.5}
                />
                Campaign will be saved as draft and automatically published at
                the scheduled time.
              </p>
            )}
          </div>
        </>
      )}

      <SectionLabel>Settings</SectionLabel>
       <div className="flex items-start gap-3 rounded-xl border border-border bg-card p-4">
         <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-muted">
           <Clock className="size-5 text-muted-foreground" strokeWidth={1.5} />
        </div>
        <div className="flex-1">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={autoCloseOnDeadline}
              onChange={(e) =>
                setValue("auto_close_on_deadline", e.target.checked, {
                  shouldValidate: true,
                })
              }
               className="h-4 w-4 shrink-0 rounded accent-accent-teal"
            />
             <span className="text-sm font-semibold text-foreground">
              Auto-close on deadline
            </span>
          </label>
           <p className="ml-7 mt-1.5 text-xs text-muted-foreground">
            Automatically close the campaign and stop receiving applications
            when the deadline passes.
          </p>
        </div>
      </div>
    </div>
  );
}
