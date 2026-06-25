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
import {
  Check,
  FileText,
  ListChecks,
  Eye,
  Save,
  Send,
  Loader2,
} from 'lucide-react';

const STEPS = [
  { label: 'Basic info', number: 1, icon: FileText },
  { label: 'Requirements', number: 2, icon: ListChecks },
  { label: 'Review & publish', number: 3, icon: Eye },
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
      const timer = setTimeout(() => {
        form.reset(mapCampaignToDefaults(existingCampaign));
      }, 0);
      return () => clearTimeout(timer);
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
      <div className="max-w-[680px] mx-auto bg-card border border-border/60 rounded-2xl shadow-luxe p-8 space-y-6">
        <Skeleton className="h-6 w-48 rounded-md" />
        <Skeleton className="h-4 w-64 rounded-md" />
        <Skeleton className="h-10 w-full rounded-xl" />
        <Skeleton className="h-72 rounded-xl" />
        <div className="flex justify-between">
          <Skeleton className="h-10 w-20 rounded-xl" />
          <Skeleton className="h-10 w-28 rounded-xl" />
        </div>
      </div>
    );
  }

  const isPending = createCampaign.isPending || updateCampaign.isPending || uploadMedia.isPending;
  const isLastStep = step === 3;

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="max-w-[680px] mx-auto bg-card border border-border/60 rounded-2xl shadow-luxe overflow-hidden"
      >
        <div className="px-6 sm:px-8 pt-6 sm:pt-8">
          <h2 className="text-xl font-serif font-semibold text-ink tracking-tight">
            {isEdit ? 'Edit campaign' : 'New campaign'}
          </h2>
          <p className="mt-1 text-sm text-ink-muted leading-relaxed">
            {isEdit ? 'Update your casting call details' : 'Create a casting call and start receiving applications'}
          </p>
        </div>

        <div className="px-6 sm:px-8 pt-8 pb-4">
          <div className="flex items-center gap-1 mb-5">
            {STEPS.map((s, idx) => {
              const isActive = step === s.number;
              const isDone = step > s.number;
              const StepIcon = s.icon;
              return (
                <div key={s.number} className="flex items-center flex-1 last:flex-none">
                  <button
                    type="button"
                    onClick={() => goToStep(s.number)}
                    className={cn(
                      "flex items-center gap-2 px-3 py-2 rounded-xl transition-all duration-200",
                      isActive
                        ? "bg-ink text-white shadow-sm"
                        : isDone
                          ? "bg-emerald-50 text-emerald-700"
                          : "text-ink-muted hover:bg-muted-bg",
                    )}
                  >
                    <span
                      className={cn(
                        "w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0 transition-all",
                        isActive
                          ? "bg-white/20"
                          : isDone
                            ? "bg-emerald-100"
                            : "bg-muted-bg",
                      )}
                    >
                      {isDone ? (
                        <Check className="w-3 h-3" strokeWidth={2.5} />
                      ) : (
                        <StepIcon className="w-3 h-3" strokeWidth={isActive ? 2 : 1.5} />
                      )}
                    </span>
                    <span className={cn(
                      "text-xs font-semibold hidden sm:inline",
                      isDone && "text-emerald-700",
                    )}>
                      {s.label}
                    </span>
                  </button>
                  {idx < STEPS.length - 1 && (
                    <div className="flex-1 h-px bg-border mx-1" />
                  )}
                </div>
              );
            })}
          </div>

          <div className="h-1 bg-muted-bg rounded-full overflow-hidden mb-2">
            <div
              className="h-full bg-gradient-to-r from-gold to-gold-hover rounded-full transition-all duration-500 ease-out"
              style={{ width: `${(step / 3) * 100}%` }}
            />
          </div>
        </div>

        <div className="px-6 sm:px-8 py-6 space-y-6">
          <div className={cn(
            "transition-all duration-300",
            step === 1 ? 'block opacity-100' : 'hidden opacity-0',
          )}>
            <BasicInfoStep
              mediaFile={pendingMediaFile}
              onMediaChange={setPendingMediaFile}
              existingBanner={existingCampaign?.banner}
            />
          </div>
          <div className={cn(
            "transition-all duration-300",
            step === 2 ? 'block opacity-100' : 'hidden opacity-0',
          )}>
            <RequirementsStep />
          </div>
          <div className={cn(
            "transition-all duration-300",
            step === 3 ? 'block opacity-100' : 'hidden opacity-0',
          )}>
            <PublishStep />
          </div>

          {serverError && (
            <Alert variant="destructive" className="rounded-xl border-error-muted animate-in fade-in slide-in-from-top-2">
              <AlertDescription>{serverError}</AlertDescription>
            </Alert>
          )}
        </div>

        <div className="flex items-center gap-3 px-6 sm:px-8 py-4 bg-muted-bg/30 border-t border-border/60">
          {step > 1 && (
            <button
              type="button"
              onClick={onBack}
              className="px-4 py-2.5 rounded-xl text-sm font-medium border border-border/60 bg-card text-ink-soft hover:text-ink hover:bg-cream-soft transition-all shrink-0"
            >
              Back
            </button>
          )}
          <button
            type="button"
            onClick={saveDraft}
            disabled={isPending}
            className="px-4 py-2.5 rounded-xl text-sm font-medium border border-border/60 bg-card text-ink-soft hover:text-ink hover:bg-cream-soft transition-all disabled:opacity-50 flex items-center gap-1.5"
          >
            <Save className="w-3.5 h-3.5" strokeWidth={1.5} />
            Save draft
          </button>
          {!isLastStep ? (
            <button
              type="button"
              onClick={onNext}
              disabled={isNavigating}
              className="px-5 py-2.5 rounded-xl text-sm font-semibold bg-gradient-to-br from-gold to-gold-hover text-white hover:from-gold-bright hover:to-gold shadow-[0_4px_14px_-4px_oklch(0.74_0.13_80/0.45)] transition-all active:scale-[0.98] disabled:opacity-50 ml-auto flex items-center gap-1.5"
            >
              Next
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </button>
          ) : (
            <button
              type="submit"
              disabled={isNavigating || isPending}
              className={cn(
                "px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-all active:scale-[0.98] disabled:opacity-50 ml-auto flex items-center gap-1.5 shadow-md",
                form.watch('publishOption') === 'draft'
                  ? 'bg-gradient-to-br from-slate-700 to-slate-800 hover:from-slate-800 hover:to-slate-900 shadow-slate-500/20'
                  : 'bg-gradient-to-br from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 shadow-emerald-500/20',
              )}
            >
              {isPending ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" strokeWidth={2} />
                  {form.watch('publishOption') === 'draft' ? 'Saving...' : 'Publishing...'}
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" strokeWidth={1.5} />
                  {form.watch('publishOption') === 'draft'
                    ? (isEdit ? 'Save draft' : 'Save draft')
                    : (isEdit ? 'Update & publish' : 'Publish campaign')}
                </>
              )}
            </button>
          )}
        </div>
      </form>
    </Form>
  );
}
