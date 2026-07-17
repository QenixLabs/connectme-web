import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { campaignApi } from '@/lib/api';
import { queryKeys } from '@/lib/api/query-keys';
import { usePopup } from '@/hooks/use-popup';
import { useFeatureGuard } from '@/hooks/use-feature-guard';

export function useCampaignTask(campaignId: string) {
  return useQuery({
    queryKey: queryKeys.campaigns.task(campaignId),
    queryFn: () => campaignApi.getTask(campaignId),
    enabled: !!campaignId,
  });
}

export function useUpsertCampaignTask() {
  const queryClient = useQueryClient();
  const { show } = usePopup();

  return useMutation({
    mutationFn: ({
      campaignId,
      payload,
    }: {
      campaignId: string;
      payload: { title: string; description: string; task_type: string; deadline_days: number };
    }) => campaignApi.upsertTask(campaignId, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.campaigns.task(variables.campaignId) });
      show({ title: 'Task saved', variant: 'success', position: 'bottom-center' });
    },
    onError: (error) => {
      const err = error as { response?: { data?: { message?: string } } };
      show({ title: 'Failed to save task', description: err.response?.data?.message, variant: 'error', position: 'bottom-center' });
    },
  });
}

export function useDeleteCampaignTask() {
  const queryClient = useQueryClient();
  const { show } = usePopup();

  return useMutation({
    mutationFn: (campaignId: string) => campaignApi.deleteTask(campaignId),
    onSuccess: (_data, campaignId) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.campaigns.task(campaignId) });
      show({ title: 'Task removed', variant: 'success', position: 'bottom-center' });
    },
    onError: (error) => {
      const err = error as { response?: { data?: { message?: string } } };
      show({ title: 'Failed to remove task', description: err.response?.data?.message, variant: 'error', position: 'bottom-center' });
    },
  });
}

export function useCampaignTaskSubmissions(campaignId: string) {
  return useQuery({
    queryKey: queryKeys.campaigns.taskSubmissions(campaignId),
    queryFn: () => campaignApi.getTaskSubmissions(campaignId),
    enabled: !!campaignId,
  });
}

export function useReviewTaskSubmission() {
  const queryClient = useQueryClient();
  const { show } = usePopup();

  return useMutation({
    mutationFn: ({
      campaignId,
      submissionId,
      payload,
    }: {
      campaignId: string;
      submissionId: string;
      payload: { recruiter_notes?: string; recruiter_rating?: number };
    }) => campaignApi.reviewTaskSubmission(campaignId, submissionId, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.campaigns.taskSubmissions(variables.campaignId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.campaigns.taskSubmission(variables.campaignId, variables.submissionId) });
      show({ title: 'Submission reviewed', variant: 'success', position: 'bottom-center' });
    },
    onError: (error) => {
      const err = error as { response?: { data?: { message?: string } } };
      show({ title: 'Failed to review submission', description: err.response?.data?.message, variant: 'error', position: 'bottom-center' });
    },
  });
}

export function useTalentTask(campaignId: string) {
  return useQuery({
    queryKey: queryKeys.campaigns.talentTask(campaignId),
    queryFn: () => campaignApi.getMyTask(campaignId),
    enabled: !!campaignId,
  });
}

export function useSubmitTask() {
  const queryClient = useQueryClient();
  const { show } = usePopup();

  return useMutation({
    mutationFn: ({
      campaignId,
      payload,
    }: {
      campaignId: string;
      payload: { response_text?: string; file_urls?: string[] };
    }) => campaignApi.submitTask(campaignId, payload),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.campaigns.talentTask(variables.campaignId) });
      show({ title: 'Task submitted', variant: 'success', position: 'bottom-center' });
    },
    onError: (error) => {
      const err = error as { response?: { data?: { message?: string } } };
      show({ title: 'Failed to submit task', description: err.response?.data?.message, variant: 'error', position: 'bottom-center' });
    },
  });
}

export function useSendAcceptanceMessage() {
  const { show } = usePopup();
  const { handleFeatureError } = useFeatureGuard();

  return useMutation({
    mutationFn: ({
      campaignId,
      talentId,
    }: {
      campaignId: string;
      talentId: string;
    }) => campaignApi.sendAcceptanceMessage(campaignId, talentId),
    onSuccess: () => {
      show({ title: 'Acceptance message sent', variant: 'success', position: 'bottom-center' });
    },
    onError: (error) => {
      if (handleFeatureError(error)) return;
      const err = error as { response?: { data?: { message?: string } } };
      show({ title: 'Failed to send message', description: err.response?.data?.message, variant: 'error', position: 'bottom-center' });
    },
  });
}
