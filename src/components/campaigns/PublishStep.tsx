'use client';

import { useFormContext } from 'react-hook-form';
import {
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Card, CardContent } from '@/components/ui/card';
import { CampaignWizardInput } from '@/lib/validations/campaign-wizard.schema';
import { cn } from '@/lib/utils';
import { FileText, Globe, Mail } from 'lucide-react';

const OPTIONS = [
  {
    value: 'draft' as const,
    label: 'Draft',
    description: 'Save privately. Edit and publish later.',
    icon: FileText,
  },
  {
    value: 'public' as const,
    label: 'Public',
    description: 'Any talent can discover and apply.',
    icon: Globe,
  },
  {
    value: 'invite_only' as const,
    label: 'Invite Only',
    description: 'Only invited talents can apply.',
    icon: Mail,
  },
];

export function PublishStep() {
  const { control, watch, setValue } = useFormContext<CampaignWizardInput>();
  const publishOption = watch('publishOption');
  const values = watch();

  return (
    <div className="space-y-6">
      {/* Review Summary */}
      <Card>
        <CardContent className="space-y-3 pt-6">
          <h4 className="text-sm font-semibold text-text-primary">Review</h4>
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-text-muted">Name</dt>
              <dd className="font-medium text-text-primary text-right">{values.name || '-'}</dd>
            </div>
            {values.role_type && (
              <div className="flex justify-between">
                <dt className="text-text-muted">Role Type</dt>
                <dd className="text-text-secondary text-right">{values.role_type}</dd>
              </div>
            )}
            {values.industry && (
              <div className="flex justify-between">
                <dt className="text-text-muted">Industry</dt>
                <dd className="text-text-secondary text-right">{values.industry}</dd>
              </div>
            )}
            {(values.location?.city || values.location?.state) && (
              <div className="flex justify-between">
                <dt className="text-text-muted">Location</dt>
                <dd className="text-text-secondary text-right">
                  {[values.location.city, values.location.state].filter(Boolean).join(', ')}
                </dd>
              </div>
            )}
            {values.deadline && (
              <div className="flex justify-between">
                <dt className="text-text-muted">Deadline</dt>
                <dd className="text-text-secondary text-right">{values.deadline}</dd>
              </div>
            )}
            {values.requirements?.skills && values.requirements.skills.length > 0 && (
              <div className="flex justify-between">
                <dt className="text-text-muted">Skills</dt>
                <dd className="text-text-secondary text-right">{values.requirements.skills.join(', ')}</dd>
              </div>
            )}
          </dl>
        </CardContent>
      </Card>

      {/* Publish Options */}
      <FormField
        control={control}
        name="publishOption"
        render={() => (
          <FormItem>
            <FormLabel>Visibility</FormLabel>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-2">
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
                      'flex flex-col items-center gap-2 p-4 rounded-xl border-2 text-center transition-all',
                      selected
                        ? 'border-brand bg-brand-soft'
                        : 'border-border bg-card hover:border-brand-muted'
                    )}
                  >
                    <Icon
                      className={cn(
                        'w-5 h-5',
                        selected ? 'text-brand-active' : 'text-text-muted'
                      )}
                      strokeWidth={1.5}
                    />
                    <span
                      className={cn(
                        'text-sm font-semibold',
                        selected ? 'text-brand-active' : 'text-text-primary'
                      )}
                    >
                      {opt.label}
                    </span>
                    <span className="text-xs text-text-muted leading-snug">
                      {opt.description}
                    </span>
                  </button>
                );
              })}
            </div>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
