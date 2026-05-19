'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import {
  CampaignWizardInput,
  campaignWizardSchema,
} from '@/lib/validations/campaign-wizard.schema';
import { BasicInfoStep } from './BasicInfoStep';
import { RequirementsStep } from './RequirementsStep';
import { PublishStep } from './PublishStep';
import { useCreateCampaign } from '@/lib/api/hooks/useCreateCampaign';
import { useUpdateCampaign } from '@/lib/api/hooks/useUpdateCampaign';
import { useCampaign } from '@/lib/api/hooks/useCampaign';
import { getApiErrorMessage } from '@/lib/formatters';

const STEPS = [
  { label: 'Basic Info', number: 1 },
  { label: 'Requirements', number: 2 },
  { label: 'Publish', number: 3 },
];

function getStepFields(step: number): string[] {
  switch (step) {
    case 1:
      return [
        'name',
        'description',
        'role_type',
        'industry',
        'location.city',
        'location.state',
        'dates.start',
        'dates.end',
        'deadline',
      ];
    case 2:
      return [
        'requirements.skills',
        'requirements.languages',
        'requirements.gender',
        'requirements.age_range.min',
        'requirements.age_range.max',
        'budget_range.min',
        'budget_range.max',
        'budget_range.currency',
        'requirements.attributes',
      ];
    case 3:
      return ['publishOption'];
    default:
      return [];
  }
}

function mapCampaignToDefaults(campaign: any): CampaignWizardInput {
  const publishOption: CampaignWizardInput['publishOption'] =
    campaign.status === 'draft'
      ? 'draft'
      : campaign.visibility === 'invite_only'
        ? 'invite_only'
        : 'public';

  return {
    name: campaign.name ?? '',
    description: campaign.description ?? '',
    role_type: campaign.role_type ?? '',
    industry: campaign.industry ?? '',
    location: {
      city: campaign.location?.city ?? '',
      state: campaign.location?.state ?? '',
    },
    dates: {
      start: campaign.dates?.start?.slice(0, 10) ?? '',
      end: campaign.dates?.end?.slice(0, 10) ?? '',
    },
    deadline: campaign.deadline?.slice(0, 10) ?? '',
    requirements: {
      skills: campaign.requirements?.skills ?? [],
      languages: campaign.requirements?.languages ?? [],
      gender: campaign.requirements?.gender ?? '',
      age_range: {
        min: campaign.requirements?.age_range?.min ?? undefined,
        max: campaign.requirements?.age_range?.max ?? undefined,
      },
      attributes: campaign.requirements?.attributes ?? '',
    },
    budget_range: {
      min: campaign.budget_range?.min ?? undefined,
      max: campaign.budget_range?.max ?? undefined,
      currency: campaign.budget_range?.currency ?? 'INR',
    },
    publishOption,
  };
}

interface CampaignWizardProps {
  campaignId?: string;
}

export function CampaignWizard({ campaignId }: CampaignWizardProps) {
  const router = useRouter();
  const isEdit = !!campaignId;
  const [step, setStep] = useState(1);
  const [serverError, setServerError] = useState<string | null>(null);
  const [isNavigating, setIsNavigating] = useState(false);

  const createCampaign = useCreateCampaign();
  const updateCampaign = useUpdateCampaign();
  const { data: existingCampaign, isLoading: isLoadingCampaign } = useCampaign(
    campaignId ?? '',
  );

  const form = useForm<CampaignWizardInput>({
    resolver: zodResolver(campaignWizardSchema),
    mode: 'onChange',
    defaultValues: {
      name: '',
      description: '',
      role_type: '',
      industry: '',
      location: { city: '', state: '' },
      dates: { start: '', end: '' },
      deadline: '',
      requirements: {
        skills: [],
        languages: [],
        gender: '',
        age_range: { min: undefined, max: undefined },
        attributes: '',
      },
      budget_range: { min: undefined, max: undefined, currency: 'INR' },
      publishOption: 'draft',
    },
  });

  useEffect(() => {
    if (existingCampaign) {
      form.reset(mapCampaignToDefaults(existingCampaign));
    }
  }, [existingCampaign, form]);

  const onNext = async () => {
    setServerError(null);
    const fields = getStepFields(step);
    const valid = await form.trigger(fields as any);
    if (valid) {
      setIsNavigating(true);
      setStep((s) => Math.min(s + 1, 3));
      setTimeout(() => setIsNavigating(false), 100);
    }
  };

  const onBack = () => {
    setServerError(null);
    setStep((s) => Math.max(s - 1, 1));
  };

  const buildPayload = (values: CampaignWizardInput) => ({
    name: values.name,
    description: values.description || undefined,
    role_type: values.role_type || undefined,
    industry: values.industry || undefined,
    location: values.location?.city || values.location?.state
      ? {
          city: values.location.city || undefined,
          state: values.location.state || undefined,
        }
      : undefined,
    dates: values.dates?.start || values.dates?.end
      ? {
          start: values.dates.start || undefined,
          end: values.dates.end || undefined,
        }
      : undefined,
    deadline: values.deadline || undefined,
    requirements: values.requirements
      ? {
          skills: values.requirements.skills?.length
            ? values.requirements.skills
            : undefined,
          languages: values.requirements.languages?.length
            ? values.requirements.languages
            : undefined,
          gender: values.requirements.gender || undefined,
          age_range:
            values.requirements.age_range?.min != null ||
            values.requirements.age_range?.max != null
              ? {
                  min: values.requirements.age_range.min,
                  max: values.requirements.age_range.max,
                }
              : undefined,
          attributes: values.requirements.attributes || undefined,
        }
      : undefined,
    budget_range:
      values.budget_range?.min != null ||
      values.budget_range?.max != null
        ? {
            min: values.budget_range.min,
            max: values.budget_range.max,
            currency: values.budget_range.currency || 'INR',
          }
        : undefined,
    status: values.publishOption === 'draft' ? 'draft' : 'active',
    visibility: values.publishOption === 'invite_only' ? 'invite_only' : 'public',
  });

  const onSubmit = async (values: CampaignWizardInput) => {
    setServerError(null);
    const payload = buildPayload(values);

    try {
      if (isEdit && campaignId) {
        await updateCampaign.mutateAsync({ id: campaignId, payload });
      } else {
        await createCampaign.mutateAsync(payload);
      }
      router.push('/recruiter/campaigns');
    } catch (err: any) {
      setServerError(
        getApiErrorMessage(
          err,
          isEdit ? 'Failed to update campaign' : 'Failed to create campaign',
        ),
      );
    }
  };

  if (isEdit && isLoadingCampaign) {
    return (
      <div className="max-w-2xl mx-auto space-y-8">
        <Skeleton className="h-8 w-64 mx-auto" />
        <Skeleton className="h-72 rounded-xl" />
        <div className="flex justify-between">
          <Skeleton className="h-10 w-20" />
          <Skeleton className="h-10 w-24" />
        </div>
      </div>
    );
  }

  const isPending = createCampaign.isPending || updateCampaign.isPending;
  const buttonLabel =
    step < 3
      ? 'Next'
      : form.watch('publishOption') === 'draft'
        ? isEdit
          ? 'Save as Draft'
          : 'Save as Draft'
        : isEdit
          ? 'Update Campaign'
          : 'Publish Campaign';

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="max-w-2xl mx-auto space-y-8"
      >
        {/* Step Indicator */}
        <div className="flex items-center justify-center gap-2 sm:gap-4">
          {STEPS.map((s, idx) => (
            <div key={s.number} className="flex items-center gap-2 sm:gap-4">
              <div
                className={cn(
                  'flex items-center gap-2',
                  step >= s.number ? 'text-brand' : 'text-text-muted'
                )}
              >
                <span
                  className={cn(
                    'w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium border-2 shrink-0',
                    step === s.number
                      ? 'border-brand bg-brand text-white'
                      : step > s.number
                        ? 'border-brand bg-brand-soft text-brand-active'
                        : 'border-border bg-card text-text-muted'
                  )}
                >
                  {s.number}
                </span>
                <span className="hidden sm:inline text-sm font-medium">
                  {s.label}
                </span>
              </div>
              {idx < STEPS.length - 1 && (
                <div
                  className={cn(
                    'w-6 sm:w-12 h-0.5',
                    step > s.number ? 'bg-brand' : 'bg-border'
                  )}
                />
              )}
            </div>
          ))}
        </div>

        {/* Step Content */}
        <div className="min-h-[300px]">
          {step === 1 && <BasicInfoStep />}
          {step === 2 && <RequirementsStep />}
          {step === 3 && <PublishStep />}
        </div>

        {/* Server Error */}
        {serverError && (
          <Alert variant="destructive">
            <AlertDescription>{serverError}</AlertDescription>
          </Alert>
        )}

        {/* Navigation */}
        <div className="flex justify-between pt-4 border-t border-border">
          <Button
            type="button"
            variant="outline"
            onClick={onBack}
            disabled={step === 1}
          >
            Back
          </Button>
          {step < 3 ? (
            <Button type="button" variant="primary" onClick={onNext}>
              Next
            </Button>
          ) : (
            <Button
              type="submit"
              variant="primary"
              disabled={isNavigating}
              isLoading={isPending}
              loadingLabel={
                form.watch('publishOption') === 'draft'
                  ? 'Saving...'
                  : 'Updating...'
              }
            >
              {buttonLabel}
            </Button>
          )}
        </div>
      </form>
    </Form>
  );
}
