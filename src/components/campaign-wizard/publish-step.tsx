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
      <div className="h-px flex-1 bg-zinc-700/40" />
      <span className="text-[11px] font-semibold uppercase tracking-[0.1em] text-zinc-500 shrink-0">
        {children}
      </span>
      <div className="h-px flex-1 bg-zinc-700/40" />
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
    <div className="rounded-xl border border-zinc-700/50 bg-zinc-900/30 overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-2.5 bg-zinc-800/50 border-b border-zinc-700/30">
        <Icon className="w-3.5 h-3.5 text-zinc-500" strokeWidth={1.5} />
        <span className="text-[11px] font-semibold uppercase tracking-[0.06em] text-zinc-500">
          {title}
        </span>
      </div>
      <div className="px-4 py-2">{children}</div>
    </div>
  );
}

function RevRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between text-sm py-1.5 border-b border-zinc-700/20 last:border-b-0">
      <span className="text-zinc-500">{label}</span>
      <span className="text-zinc-200 font-medium text-right ml-4">
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
                className="flex items-center gap-2 py-1.5 border-b border-zinc-700/20 last:border-b-0"
              >
                <span className="text-xs font-bold text-zinc-500 shrink-0">
                  {i + 1}.
                </span>
                <span className="text-sm text-zinc-200 flex-1">
                  {q.question_text || "\u2014"}
                </span>
                <span className="text-[10px] font-medium text-zinc-500 bg-zinc-800 px-1.5 py-0.5 rounded">
                  {q.question_type}
                </span>
                {q.is_required && (
                  <span className="text-[10px] font-semibold text-red-400 bg-red-500/10 px-1.5 py-0.5 rounded">
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
              <div className="py-2 text-sm text-zinc-400 leading-relaxed">
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
                        ? "border-teal-500 bg-teal-500/10 shadow-sm"
                        : "border-zinc-700/50 bg-zinc-900/50 hover:border-zinc-600",
                    )}
                  >
                    <div
                      className={cn(
                        "w-10 h-10 rounded-xl flex items-center justify-center shrink-0 mt-0.5 transition-colors",
                        selected
                          ? "bg-teal-500 text-white"
                          : "bg-zinc-800 text-zinc-500",
                      )}
                    >
                      <Icon className="w-5 h-5" strokeWidth={1.5} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <span
                        className={cn(
                          "text-sm font-semibold block",
                          selected ? "text-zinc-100" : "text-zinc-200",
                        )}
                      >
                        {opt.label}
                      </span>
                      <span className="text-[13px] text-zinc-500 block mt-0.5 leading-relaxed">
                        {opt.description}
                      </span>
                      <span className="text-[11px] text-zinc-500/60 block mt-1">
                        {opt.hint}
                      </span>
                    </div>
                    {selected && (
                      <div className="w-5 h-5 rounded-full bg-teal-500 flex items-center justify-center shrink-0 mt-1">
                        <svg
                          className="w-3 h-3 text-white"
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
            <div className="flex items-start gap-3 bg-zinc-900/50 border border-zinc-700/50 rounded-xl p-4">
              <div className="w-10 h-10 rounded-xl bg-zinc-800/50 flex items-center justify-center shrink-0">
                <Calendar
                  className="w-5 h-5 text-zinc-500"
                  strokeWidth={1.5}
                />
              </div>
              <div className="flex-1">
                <label className="text-sm font-semibold text-zinc-100 block mb-2">
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
                  className="h-10 rounded-xl text-sm px-3 bg-zinc-900/50 border border-zinc-700/50 w-full focus-visible:ring-teal-500/30 text-zinc-100"
                />
              </div>
            </div>
            {scheduledPublishAt && (
              <p className="text-xs text-amber-400/80 flex items-center gap-1.5 bg-amber-500/10 text-amber-400 rounded-lg p-2.5 border border-amber-500/20">
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
      <div className="flex items-start gap-3 bg-zinc-900/50 border border-zinc-700/50 rounded-xl p-4">
        <div className="w-10 h-10 rounded-xl bg-zinc-800/50 flex items-center justify-center shrink-0">
          <Clock className="w-5 h-5 text-zinc-500" strokeWidth={1.5} />
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
              className="w-4 h-4 rounded accent-teal-500 shrink-0"
            />
            <span className="text-sm font-semibold text-zinc-100">
              Auto-close on deadline
            </span>
          </label>
          <p className="text-xs text-zinc-500 mt-1.5 ml-7">
            Automatically close the campaign and stop receiving applications
            when the deadline passes.
          </p>
        </div>
      </div>
    </div>
  );
}
