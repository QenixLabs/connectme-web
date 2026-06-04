'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, type Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form } from '@/components/ui/form';
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
import { useUploadCampaignMedia } from '@/lib/api/hooks/useCampaigns';
import { getApiErrorMessage } from '@/lib/formatters';
import { campaignApi, type Campaign, type CampaignQuestion } from '@/lib/api';
import { Check } from 'lucide-react';

const STEPS = [
  { label: 'Basic info', number: 1 },
  { label: 'Requirements', number: 2 },
  { label: 'Review & publish', number: 3 },
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
        'questions',
      ];
    case 3:
      return ['publishOption', 'scheduled_publish_at', 'auto_close_on_deadline'];
    default:
      return [];
  }
}

function toDateInputValue(val: unknown): string {
  if (!val) return '';
  if (typeof val === 'string') return val.slice(0, 10);
  if (val instanceof Date) return val.toISOString().slice(0, 10);
  return '';
}

function toDatetimeInputValue(val: unknown): string {
  if (!val) return '';
  if (typeof val === 'string') return val.slice(0, 16);
  if (val instanceof Date) return val.toISOString().slice(0, 16);
  return '';
}

function mapCampaignToDefaults(campaign: Campaign): CampaignWizardInput {
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
      start: toDateInputValue(campaign.dates?.start),
      end: toDateInputValue(campaign.dates?.end),
    },
    deadline: toDateInputValue(campaign.deadline),
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
    is_budget_disclosed: campaign.is_budget_disclosed ?? false,
    is_unpaid: campaign.is_unpaid ?? false,
    questions: (campaign.questions || []).map((q) => ({
      _id: q._id,
      question_text: q.question_text,
      question_type: q.question_type,
      options: q.options || [],
      is_required: q.is_required,
      order: q.order,
    })),
    publishOption,
    scheduled_publish_at: toDatetimeInputValue(campaign.scheduled_publish_at),
    auto_close_on_deadline: campaign.auto_close_on_deadline ?? true,
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
  const [pendingMediaFile, setPendingMediaFile] = useState<File | null>(null);

  const createCampaign = useCreateCampaign();
  const uploadMedia = useUploadCampaignMedia();
  const updateCampaign = useUpdateCampaign();
  const { data: existingCampaign, isLoading: isLoadingCampaign } = useCampaign(
    campaignId ?? '',
  );

  const form = useForm<CampaignWizardInput>({
    resolver: zodResolver(campaignWizardSchema) as unknown as Resolver<CampaignWizardInput>,
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
      is_budget_disclosed: false,
      is_unpaid: false,
      questions: [],
      publishOption: 'draft',
      scheduled_publish_at: '',
      auto_close_on_deadline: true,
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
    const valid = await form.trigger(fields as unknown as Parameters<typeof form.trigger>[0]);
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

  const goToStep = (n: number) => {
    if (n >= step) return;
    setServerError(null);
    setStep(n);
  };

  const buildPayload = (values: CampaignWizardInput): Partial<
    Omit<Campaign, '_id' | 'recruiter_id' | 'applications_count' | 'created_at'>
  > => ({
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
    questions: values.questions?.length
      ? values.questions.map((q, i) => {
          const base = {
            question_text: q.question_text,
            question_type: q.question_type,
            is_required: q.is_required,
            order: i,
            ...(q._id ? { _id: q._id } : {}),
            ...((q.question_type === 'select' || q.question_type === 'multiselect') ? { options: q.options } : {}),
          };
          return base as unknown as CampaignQuestion;
        })
      : undefined,
    status: values.publishOption === 'draft' || values.scheduled_publish_at ? 'draft' : 'active',
    visibility: values.publishOption === 'invite_only' ? 'invite_only' : 'public',
    scheduled_publish_at: values.scheduled_publish_at || undefined,
    auto_close_on_deadline: values.auto_close_on_deadline,
  });

  const onSubmit = async (values: CampaignWizardInput) => {
    setServerError(null);
    const payload = buildPayload(values);

    try {
      let resultCampaignId = campaignId;
      if (isEdit && campaignId) {
        await updateCampaign.mutateAsync({ id: campaignId, payload });
      } else {
        const created = await createCampaign.mutateAsync(payload as Parameters<typeof campaignApi.create>[0]);
        resultCampaignId = created._id;
      }

      if (pendingMediaFile && resultCampaignId) {
        const formData = new FormData();
        formData.append('file', pendingMediaFile);
        formData.append('is_banner', 'true');
        formData.append('type', 'image');
        await uploadMedia.mutateAsync({ campaignId: resultCampaignId, formData });
      }

      router.push('/recruiter/campaigns');
    } catch (err: unknown) {
      setServerError(
        getApiErrorMessage(
          err,
          isEdit ? 'Failed to update campaign' : 'Failed to create campaign',
        ),
      );
    }
  };

  const saveDraft = () => {
    form.setValue('publishOption', 'draft', { shouldValidate: true });
    form.handleSubmit(onSubmit)();
  };

  if (isEdit && isLoadingCampaign) {
    return (
      <div className="max-w-[640px] mx-auto p-6 bg-card border border-border rounded-xl space-y-6">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-4 w-64" />
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-72 rounded-xl" />
        <div className="flex justify-between">
          <Skeleton className="h-10 w-20" />
          <Skeleton className="h-10 w-24" />
        </div>
      </div>
    );
  }

  const isPending = createCampaign.isPending || updateCampaign.isPending || uploadMedia.isPending;

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="max-w-[640px] mx-auto px-4 py-5 sm:p-6 bg-card border border-border rounded-xl"
      >
        {/* Header */}
        <div className="mb-6">
          <div className="text-lg font-medium text-text-primary">
            {isEdit ? 'Edit campaign' : 'New campaign'}
          </div>
          <div className="text-sm text-text-secondary mt-0.5">
            {isEdit ? 'Update your casting call details' : 'Create a casting call or project'}
          </div>
        </div>

        {/* Stepper */}
        <div className="flex items-start mb-6">
          {STEPS.map((s, idx) => {
            const isActive = step === s.number;
            const isDone = step > s.number;
            return (
              <div key={s.number} className="flex items-center flex-1">
                <button
                  type="button"
                  onClick={() => goToStep(s.number)}
                  className="flex flex-col items-center gap-1 cursor-pointer min-w-0 flex-1"
                >
                  <span
                    className={cn(
                      'w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium border-[1.5px] shrink-0 transition-all',
                      isActive
                        ? 'bg-[#B85C00] border-[#B85C00] text-white'
                        : isDone
                          ? 'bg-success-light border-success text-success-text'
                          : 'border-border text-text-muted'
                    )}
                  >
                    {isDone ? (
                      <Check className="w-3.5 h-3.5" strokeWidth={2.5} />
                    ) : (
                      s.number
                    )}
                  </span>
                  <span
                    className={cn(
                      'text-[10px] leading-tight text-center mt-0.5',
                      isActive
                        ? 'text-text-primary font-medium'
                        : isDone
                          ? 'text-success-text'
                          : 'text-text-muted'
                    )}
                  >
                    {s.label === 'Basic info' && (
                      <>
                        Basic
                        <br />
                        info
                      </>
                    )}
                    {s.label === 'Requirements' && (
                      <>
                        Require
                        <br />
                        ments
                      </>
                    )}
                    {s.label === 'Review & publish' && (
                      <>
                        Review &amp;
                        <br />
                        publish
                      </>
                    )}
                  </span>
                </button>
                {idx < STEPS.length - 1 && (
                  <div className="flex-1 h-px bg-border mx-1 mt-3.5" />
                )}
          </div>
            );
          })}
        </div>

        {/* Progress bar */}
        <div className="h-0.5 bg-border rounded-full overflow-hidden mb-6">
          <div
            className="h-full bg-[#B85C00] rounded-full transition-all duration-300"
            style={{ width: `${(step / 3) * 100}%` }}
          />
        </div>

        {/* Step Content */}
        <div className={cn(step === 1 ? 'block' : 'hidden')}>
          <BasicInfoStep
            mediaFile={pendingMediaFile}
            onMediaChange={setPendingMediaFile}
            existingBanner={existingCampaign?.banner}
          />
        </div>
        <div className={cn(step === 2 ? 'block' : 'hidden')}>
          <RequirementsStep />
        </div>
        <div className={cn(step === 3 ? 'block' : 'hidden')}>
          <PublishStep />
        </div>

        {/* Server Error */}
        {serverError && (
          <Alert variant="destructive" className="mt-6">
            <AlertDescription>{serverError}</AlertDescription>
          </Alert>
        )}

        {/* Actions */}
        <div className="flex items-center gap-2 mt-6 pt-4 border-t border-border">
          {step > 1 && (
            <button
              type="button"
              onClick={onBack}
              className="px-3 py-2.5 rounded-lg text-sm font-medium border border-border text-text-secondary hover:bg-muted-bg transition-colors shrink-0"
            >
              ← Back
            </button>
          )}
          <button
            type="button"
            onClick={saveDraft}
            disabled={isPending}
            className="px-3 py-2.5 rounded-lg text-sm font-medium border border-border text-text-secondary bg-transparent hover:bg-muted-bg transition-colors disabled:opacity-50 flex-1"
          >
            Save draft
          </button>
          {step < 3 ? (
            <button
              type="button"
              onClick={onNext}
              disabled={isNavigating}
              className="px-3 py-2.5 rounded-lg text-sm font-medium bg-[#B85C00] text-white hover:bg-[#9A4D00] transition-colors disabled:opacity-50 flex-[2] flex items-center justify-center gap-1.5"
            >
              Next →
            </button>
          ) : (
            <button
              type="submit"
              disabled={isNavigating || isPending}
              className={cn(
                'px-3 py-2.5 rounded-lg text-sm font-medium text-white transition-colors disabled:opacity-50 flex-[2] flex items-center justify-center gap-1.5',
                form.watch('publishOption') === 'draft'
                  ? 'bg-[#B85C00] hover:bg-[#9A4D00]'
                  : 'bg-[#1a8a4a] hover:bg-[#157a3f]'
              )}
            >
              {isPending
                ? (form.watch('publishOption') === 'draft' ? 'Saving...' : 'Publishing...')
                : (form.watch('publishOption') === 'draft'
                    ? (isEdit ? 'Save draft' : 'Save draft')
                    : (isEdit ? 'Update campaign' : 'Publish'))}
            </button>
          )}
        </div>
      </form>
    </Form>
  );
}
