'use client';

import { useFormContext } from 'react-hook-form';
import {
  FormField,
  FormItem,
} from '@/components/ui/form';
import { CampaignWizardInput } from '@/lib/validations/campaign-wizard.schema';
import { cn } from '@/lib/utils';
import { Lock, Globe, UserPlus, Calendar, Clock, Eye, Info, MapPin, Briefcase, DollarSign, Tag } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

const OPTIONS = [
  {
    value: 'draft' as const,
    label: 'Draft',
    description: 'Save privately, publish later',
    icon: Lock,
    hint: 'Only you can see this campaign',
  },
  {
    value: 'public' as const,
    label: 'Public',
    description: 'Any talent can discover and apply',
    icon: Globe,
    hint: 'Listed in talent search and recommendations',
  },
  {
    value: 'invite_only' as const,
    label: 'Invite only',
    description: 'Only invited talents can apply',
    icon: UserPlus,
    hint: 'Hidden from public search, visible via invite link',
  },
];

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2 pt-2 first:pt-0">
      <div className="h-px flex-1 bg-border/40" />
      <span className="text-[11px] font-semibold uppercase tracking-[0.1em] text-ink-muted shrink-0">
        {children}
      </span>
      <div className="h-px flex-1 bg-border/40" />
    </div>
  );
}

function RevCard({ title, icon: Icon, children }: { title: string; icon: LucideIcon; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-border/60 bg-muted-bg/30 overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-2.5 bg-muted-bg/60 border-b border-border/40">
        <Icon className="w-3.5 h-3.5 text-ink-muted" strokeWidth={1.5} />
        <span className="text-[11px] font-semibold uppercase tracking-[0.06em] text-ink-muted">
          {title}
        </span>
      </div>
      <div className="px-4 py-2">
        {children}
      </div>
    </div>
  );
}

function RevRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between text-sm py-1.5 border-b border-border/30 last:border-b-0">
      <span className="text-ink-muted">{label}</span>
      <span className="text-ink font-medium text-right ml-4">{value}</span>
    </div>
  );
}

export function PublishStep() {
  const { control, watch, setValue } = useFormContext<CampaignWizardInput>();
  const publishOption = watch('publishOption');
  const scheduledPublishAt = watch('scheduled_publish_at');
  const autoCloseOnDeadline = watch('auto_close_on_deadline');
  const values = watch();

  const roleIndustry = [values.role_type, values.industry].filter(Boolean).join(' / ') || '\u2014';
  const loc = [values.location?.city, values.location?.state].filter(Boolean).join(', ') || '\u2014';
  const genderAge = [
    values.requirements?.gender || 'Any',
    values.requirements?.age_range?.min != null && values.requirements?.age_range?.max != null
      ? `${values.requirements.age_range.min}\u2013${values.requirements.age_range.max}`
      : '\u2014',
  ].join(', ');

  const budget = values.is_unpaid
    ? 'Unpaid / voluntary'
    : values.budget_range?.min != null || values.budget_range?.max != null
      ? `\u20B9${values.budget_range.min ?? 0} \u2013 \u20B9${values.budget_range.max ?? 0}`
      : 'Not specified';

  return (
    <div className="flex flex-col gap-4">
      <SectionLabel>Review your campaign</SectionLabel>

      <div className="space-y-3">
        <RevCard title="Basic Info" icon={Info}>
          <RevRow label="Campaign name" value={values.name || '\u2014'} />
          <RevRow label="Role / industry" value={roleIndustry} />
          <RevRow label="Location" value={loc} />
          <RevRow label="Application deadline" value={values.deadline || '\u2014'} />
          {values.dates?.start && (
            <RevRow
              label="Project dates"
              value={`${values.dates.start}${values.dates.end ? ` \u2192 ${values.dates.end}` : ''}`}
            />
          )}
        </RevCard>

        <RevCard title="Requirements" icon={Tag}>
          <RevRow
            label="Skills"
            value={values.requirements?.skills?.length ? values.requirements.skills.join(', ') : '\u2014'}
          />
          <RevRow
            label="Languages"
            value={values.requirements?.languages?.length ? values.requirements.languages.join(', ') : '\u2014'}
          />
          <RevRow label="Gender / age" value={genderAge} />
          <RevRow label="Budget" value={budget} />
          {values.requirements?.attributes && (
            <RevRow label="Other" value={values.requirements.attributes} />
          )}
        </RevCard>

        {values.questions && values.questions.length > 0 && (
          <RevCard title="Questions" icon={Info}>
            {values.questions.map((q, i) => (
              <div key={i} className="flex items-center gap-2 py-1.5 border-b border-border/30 last:border-b-0">
                <span className="text-xs font-bold text-ink-muted shrink-0">{i + 1}.</span>
                <span className="text-sm text-ink flex-1">{q.question_text || '\u2014'}</span>
                <span className="text-[10px] font-medium text-ink-muted bg-muted-bg px-1.5 py-0.5 rounded">
                  {q.question_type}
                </span>
                {q.is_required && (
                  <span className="text-[10px] font-semibold text-rose-500 bg-rose-50 px-1.5 py-0.5 rounded">
                    Required
                  </span>
                )}
              </div>
            ))}
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
                      setValue('publishOption', opt.value, { shouldValidate: true })
                    }
                    className={cn(
                      'flex items-start gap-4 p-4 rounded-xl border text-left transition-all duration-200 w-full',
                      selected
                        ? 'border-gold bg-gold-soft/40 shadow-sm'
                        : 'border-border/60 bg-card hover:border-border hover:shadow-luxe',
                    )}
                  >
                    <div className={cn(
                      'w-10 h-10 rounded-xl flex items-center justify-center shrink-0 mt-0.5 transition-colors',
                      selected ? 'bg-gradient-to-br from-gold to-gold-hover text-white shadow-[0_4px_14px_-4px_oklch(0.74_0.13_80/0.45)]' : 'bg-muted-bg text-ink-muted',
                    )}>
                      <Icon className="w-5 h-5" strokeWidth={1.5} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className={cn(
                        "text-sm font-semibold block",
                        selected ? "text-ink" : "text-ink",
                      )}>
                        {opt.label}
                      </span>
                      <span className="text-[13px] text-ink-muted block mt-0.5 leading-relaxed">
                        {opt.description}
                      </span>
                      <span className="text-[11px] text-ink-muted/60 block mt-1">
                        {opt.hint}
                      </span>
                    </div>
                    {selected && (
                      <div className="w-5 h-5 rounded-full bg-gold flex items-center justify-center shrink-0 mt-1">
                        <svg className="w-3 h-3 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
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

      {publishOption !== 'draft' && (
        <>
          <SectionLabel>Scheduling</SectionLabel>
          <div className="space-y-3">
            <div className="flex items-start gap-3 bg-card border border-border/60 rounded-xl p-4">
              <div className="w-10 h-10 rounded-xl bg-muted-bg flex items-center justify-center shrink-0">
                <Calendar className="w-5 h-5 text-ink-muted" strokeWidth={1.5} />
              </div>
              <div className="flex-1">
                <label className="text-sm font-semibold text-ink block mb-2">
                  Publish date &amp; time
                </label>
                <input
                  type="datetime-local"
                  value={scheduledPublishAt || ''}
                  onChange={(e) =>
                    setValue('scheduled_publish_at', e.target.value, { shouldValidate: true })
                  }
                  className="h-10 rounded-xl text-sm px-3 bg-card border border-border/60 w-full focus-visible:ring-gold/30"
                />
              </div>
            </div>
            {scheduledPublishAt && (
              <p className="text-xs text-ink-muted/80 flex items-center gap-1.5 bg-amber-50 text-amber-700 rounded-lg p-2.5 border border-amber-200">
                <Clock className="w-3.5 h-3.5 shrink-0" strokeWidth={1.5} />
                Campaign will be saved as draft and automatically published at the scheduled time.
              </p>
            )}
          </div>
        </>
      )}

      <SectionLabel>Settings</SectionLabel>
      <div className="flex items-start gap-3 bg-card border border-border/60 rounded-xl p-4">
        <div className="w-10 h-10 rounded-xl bg-muted-bg flex items-center justify-center shrink-0">
          <Clock className="w-5 h-5 text-ink-muted" strokeWidth={1.5} />
        </div>
        <div className="flex-1">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={autoCloseOnDeadline}
              onChange={(e) =>
                setValue('auto_close_on_deadline', e.target.checked, { shouldValidate: true })
              }
              className="w-4 h-4 rounded accent-gold shrink-0"
            />
            <span className="text-sm font-semibold text-ink">Auto-close on deadline</span>
          </label>
          <p className="text-xs text-ink-muted mt-1.5 ml-7">
            Automatically close the campaign and stop receiving applications when the deadline passes.
          </p>
        </div>
      </div>
    </div>
  );
}
