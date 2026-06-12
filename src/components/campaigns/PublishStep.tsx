'use client';

import { useFormContext } from 'react-hook-form';
import {
  FormField,
  FormItem,
  FormLabel,
} from '@/components/ui/form';
import { CampaignWizardInput } from '@/lib/validations/campaign-wizard.schema';
import { cn } from '@/lib/utils';
import { Lock, Globe, UserPlus, Calendar, Clock } from 'lucide-react';

const OPTIONS = [
  {
    value: 'draft' as const,
    label: 'Draft',
    description: 'Save privately, publish later',
    icon: Lock,
  },
  {
    value: 'public' as const,
    label: 'Public',
    description: 'Any talent can discover and apply',
    icon: Globe,
  },
  {
    value: 'invite_only' as const,
    label: 'Invite only',
    description: 'Only invited talents can apply',
    icon: UserPlus,
  },
];

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-[11px] font-medium tracking-widest text-text-muted uppercase mt-5 mb-2.5">
      {children}
    </div>
  );
}

function RevBlock({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-muted-bg rounded-lg p-3 mb-2.5">
      <div className="text-[11px] font-medium tracking-wider text-text-muted uppercase mb-2">
        {title}
      </div>
      {children}
    </div>
  );
}

function RevRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between text-sm py-1 border-b border-border last:border-b-0">
      <span className="text-text-secondary">{label}</span>
      <span className="text-text-primary font-medium">{value}</span>
    </div>
  );
}

export function PublishStep() {
  const { control, watch, setValue } = useFormContext<CampaignWizardInput>();
  const publishOption = watch('publishOption');
  const scheduledPublishAt = watch('scheduled_publish_at');
  const autoCloseOnDeadline = watch('auto_close_on_deadline');
  const values = watch();

  const roleIndustry = [values.role_type, values.industry].filter(Boolean).join(' / ') || '—';
  const loc = [values.location?.city, values.location?.state].filter(Boolean).join(', ') || '—';
  const genderAge = [
    values.requirements?.gender || 'Any',
    values.requirements?.age_range?.min != null && values.requirements?.age_range?.max != null
      ? `${values.requirements.age_range.min}–${values.requirements.age_range.max}`
      : '—',
  ].join(', ');

  const budget = values.is_unpaid
    ? 'Unpaid / voluntary'
    : values.budget_range?.min != null || values.budget_range?.max != null
      ? `₹${values.budget_range.min ?? 0} – ₹${values.budget_range.max ?? 0}`
      : 'Not specified';

  return (
    <div>
      <SectionLabel>Review</SectionLabel>

      <RevBlock title="Basic info">
        <RevRow label="Campaign name" value={values.name || '—'} />
        <RevRow label="Role / industry" value={roleIndustry} />
        <RevRow label="Location" value={loc} />
        <RevRow label="Deadline" value={values.deadline || '—'} />
      </RevBlock>

      <RevBlock title="Requirements">
        <RevRow
          label="Skills"
          value={values.requirements?.skills?.length ? values.requirements.skills.join(', ') : '—'}
        />
        <RevRow label="Gender / age" value={genderAge} />
        <RevRow label="Budget" value={budget} />
      </RevBlock>

      <SectionLabel>Visibility</SectionLabel>

      <FormField
        control={control}
        name="publishOption"
        render={() => (
          <FormItem>
            <div className="flex flex-col gap-2">
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
                      'flex items-center gap-3 p-3 rounded-lg border text-left transition-all cursor-pointer',
                      selected
                        ? 'border-campaign bg-campaign-light'
                        : 'border-border bg-card hover:border-campaign/50'
                    )}
                  >
                    <div className={cn(
                      'w-8 h-8 rounded-lg flex items-center justify-center shrink-0',
                      selected ? 'bg-campaign/10' : 'bg-muted-bg'
                    )}>
                      <Icon
                        className={cn(
                          'w-4 h-4',
                          selected ? 'text-campaign' : 'text-text-muted'
                        )}
                        strokeWidth={1.5}
                      />
                    </div>
                    <div>
                      <span className="text-sm font-medium text-text-primary block">
                        {opt.label}
                      </span>
                      <span className="text-[11px] text-text-muted leading-snug">
                        {opt.description}
                      </span>
                    </div>
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
            <div className="flex items-center gap-3 bg-card border border-border rounded-lg p-3">
              <Calendar className="w-4 h-4 text-text-muted shrink-0" strokeWidth={1.5} />
              <div className="flex-1">
                <label className="text-sm font-medium text-text-secondary block mb-1">
                  Publish date & time
                </label>
                <input
                  type="datetime-local"
                  value={scheduledPublishAt || ''}
                  onChange={(e) =>
                    setValue('scheduled_publish_at', e.target.value, { shouldValidate: true })
                  }
                  className="h-9 rounded-lg text-xs px-3 bg-page border border-border w-full sm:w-auto"
                />
              </div>
            </div>
            {scheduledPublishAt && (
              <p className="text-xs text-text-muted">
                Campaign will be saved as draft and automatically published at the scheduled time.
              </p>
            )}
          </div>
        </>
      )}

      <SectionLabel>Settings</SectionLabel>
      <div className="flex items-center gap-3 bg-card border border-border rounded-lg p-3">
        <Clock className="w-4 h-4 text-text-muted shrink-0" strokeWidth={1.5} />
        <div className="flex-1">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={autoCloseOnDeadline}
              onChange={(e) =>
                setValue('auto_close_on_deadline', e.target.checked, { shouldValidate: true })
              }
              className="w-4 h-4 rounded border-border text-brand focus:ring-brand"
            />
            <span className="text-sm font-medium text-text-secondary">Auto-close on deadline</span>
          </label>
          <p className="text-xs text-text-muted mt-1">
            Automatically close the campaign when the deadline passes.
          </p>
        </div>
      </div>
    </div>
  );
}
