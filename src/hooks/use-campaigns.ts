import {
  useQuery,
  useMutation,
  useQueryClient,
  useInfiniteQuery,
} from "@tanstack/react-query";
import { toast } from "sonner";
import { campaignsApi } from "@/lib/api/campaigns";
import type {
  QueryCampaignsParams,
  QueryApplicationParams,
  CampaignAnalyticsParams,
  QuerySubmissionsParams,
  RecruiterCampaignParams,
  QueryRecruiterInvitesParams,
  QueryMatchingTalentsParams,
  BulkInviteByFilterPayload,
} from "@/lib/api/campaigns";

export const campaignKeys = {
  all: ["campaigns"] as const,
  lists: () => [...campaignKeys.all, "list"] as const,
  list: (params: QueryCampaignsParams) =>
    [...campaignKeys.lists(), params] as const,
  recruiterList: (params: RecruiterCampaignParams) =>
    [...campaignKeys.all, "recruiter-list", params] as const,
  details: () => [...campaignKeys.all, "detail"] as const,
  detail: (id: string) => [...campaignKeys.details(), id] as const,
  talentView: (id: string) => [...campaignKeys.all, "talent-view", id] as const,
  bookmarks: () => [...campaignKeys.all, "bookmarks"] as const,
  recommendations: (limit: number) =>
    [...campaignKeys.all, "recommendations", limit] as const,
  applications: () => [...campaignKeys.all, "applications"] as const,
  applicationList: (params: Omit<QueryCampaignsParams, "applied"> = {}) =>
    [...campaignKeys.applications(), params] as const,
  campaignApplications: (campaignId: string, params?: QueryApplicationParams) =>
    [...campaignKeys.all, "campaign-applications", campaignId, params] as const,
  analytics: (campaignId: string, params?: CampaignAnalyticsParams) =>
    [...campaignKeys.all, "analytics", campaignId, params] as const,
  demographics: (campaignId: string) =>
    [...campaignKeys.all, "demographics", campaignId] as const,
  invites: (campaignId: string) =>
    [...campaignKeys.all, "invites", campaignId] as const,
  recruiterInvites: (params?: QueryRecruiterInvitesParams) =>
    [...campaignKeys.all, "recruiter-invites", params] as const,
  team: (campaignId: string) =>
    [...campaignKeys.all, "team", campaignId] as const,
  submissions: (campaignId: string, params?: QuerySubmissionsParams) =>
    [...campaignKeys.all, "submissions", campaignId, params] as const,
  matchingTalents: (campaignId: string, params?: QueryMatchingTalentsParams) =>
    [...campaignKeys.all, "matching-talents", campaignId, params] as const,
  bulkInvitePreview: (campaignId: string, params?: QueryMatchingTalentsParams) =>
    [...campaignKeys.all, "bulk-invite-preview", campaignId, params] as const,
};

export function useCampaigns(
  params: QueryCampaignsParams = {},
  enabled = true,
) {
  return useQuery({
    queryKey: campaignKeys.list(params),
    queryFn: () => campaignsApi.getCampaigns(params),
    enabled,
  });
}

export function useRecruiterCampaigns(params: RecruiterCampaignParams = {}) {
  const { cursor: _cursor, ...rest } = params;
  return useInfiniteQuery({
    queryKey: campaignKeys.recruiterList(rest),
    queryFn: ({ pageParam }) =>
      campaignsApi.getRecruiterCampaigns({ ...params, cursor: pageParam }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
  });
}

export function useMyApplications(
  params: Omit<QueryCampaignsParams, "applied"> = {},
  enabled = true,
) {
  return useQuery({
    queryKey: campaignKeys.applicationList(params),
    queryFn: () => campaignsApi.getMyApplications(params),
    enabled,
  });
}

export function useCampaignCount(
  params: QueryCampaignsParams = {},
  enabled = true,
) {
  return useQuery({
    queryKey: [...campaignKeys.list(params), "count"],
    queryFn: () => campaignsApi.getCampaignCount(params),
    enabled,
  });
}

export function useOpportunityStats() {
  return useQuery({
    queryKey: [...campaignKeys.all, "opportunity-stats"],
    queryFn: () => campaignsApi.getOpportunityStats(),
  });
}

export function useCampaign(id: string) {
  return useQuery({
    queryKey: campaignKeys.detail(id),
    queryFn: () => campaignsApi.getCampaignById(id),
    enabled: !!id,
  });
}

export function useCampaignTalentView(id: string) {
  return useQuery({
    queryKey: campaignKeys.talentView(id),
    queryFn: () => campaignsApi.getCampaignTalentView(id),
    enabled: !!id,
  });
}

export function useBookmarks() {
  return useQuery({
    queryKey: campaignKeys.bookmarks(),
    queryFn: () => campaignsApi.getBookmarks(),
  });
}

export function useCampaignRecommendations(limit = 10) {
  return useQuery({
    queryKey: campaignKeys.recommendations(limit),
    queryFn: () => campaignsApi.getRecommendations(limit),
  });
}

export function useBookmarkCampaign() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, bookmarked }: { id: string; bookmarked: boolean }) =>
      bookmarked
        ? campaignsApi.unbookmarkCampaign(id)
        : campaignsApi.bookmarkCampaign(id),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: campaignKeys.bookmarks() });
      queryClient.invalidateQueries({
        queryKey: campaignKeys.detail(variables.id),
      });
      queryClient.invalidateQueries({ queryKey: campaignKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: [...campaignKeys.all, "recommendations"],
      });

      if (data?.bookmarked) {
        toast.success("Job saved", {
          action: {
            label: "Click here to view all saved jobs",
            onClick: () => {
              window.location.href =
                "/talent/opportunities?tab=All&bookmarked=true";
            },
          },
        });
      }
    },
  });
}

export function useApplyToCampaign() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload?: {
        message?: string;
        answers?: { question_id: string; answer: string }[];
      };
    }) => campaignsApi.applyToCampaign(id, payload),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: campaignKeys.detail(variables.id),
      });
      queryClient.invalidateQueries({ queryKey: campaignKeys.lists() });
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { message?: string } } };
      const message =
        err.response?.data?.message || "Failed to apply. Please try again.";
      toast.error(message);
    },
  });
}

export function useWithdrawApplication() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id }: { id: string }) =>
      campaignsApi.withdrawApplication(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: campaignKeys.applications() });
      queryClient.invalidateQueries({ queryKey: campaignKeys.lists() });
    },
  });
}

/* ---- Campaign Applications (Recruiter) ---- */

export function useCampaignApplications(
  campaignId: string,
  params: QueryApplicationParams = {},
) {
  return useQuery({
    queryKey: campaignKeys.campaignApplications(campaignId, params),
    queryFn: () => campaignsApi.getCampaignApplications(campaignId, params),
    enabled: !!campaignId,
  });
}

export function useBulkUpdateApplications() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      campaignId,
      applicationIds,
      status,
    }: {
      campaignId: string;
      applicationIds: string[];
      status: "pending" | "accepted" | "rejected";
    }) =>
      campaignsApi.bulkUpdateApplications(campaignId, applicationIds, status),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: campaignKeys.campaignApplications(variables.campaignId),
      });
    },
  });
}

export function useShortlistApplication() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      campaignId,
      applicationId,
    }: {
      campaignId: string;
      applicationId: string;
    }) => campaignsApi.shortlistApplication(campaignId, applicationId),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: campaignKeys.campaignApplications(variables.campaignId),
      });
    },
  });
}

export function useUnshortlistApplication() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      campaignId,
      applicationId,
    }: {
      campaignId: string;
      applicationId: string;
    }) => campaignsApi.unshortlistApplication(campaignId, applicationId),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: campaignKeys.campaignApplications(variables.campaignId),
      });
    },
  });
}

export function useUpsertApplicantNote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      campaignId,
      applicationId,
      noteText,
      rating,
    }: {
      campaignId: string;
      applicationId: string;
      noteText?: string;
      rating?: number;
    }) =>
      campaignsApi.upsertApplicantNote(
        campaignId,
        applicationId,
        noteText,
        rating,
      ),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: campaignKeys.campaignApplications(variables.campaignId),
      });
    },
  });
}

/* ---- Campaign Analytics ---- */

export function useCampaignAnalytics(
  campaignId: string,
  params: CampaignAnalyticsParams = {},
) {
  return useQuery({
    queryKey: campaignKeys.analytics(campaignId, params),
    queryFn: () => campaignsApi.getCampaignAnalytics(campaignId, params),
    enabled: !!campaignId,
  });
}

export function useCampaignDemographics(campaignId: string) {
  return useQuery({
    queryKey: campaignKeys.demographics(campaignId),
    queryFn: () => campaignsApi.getCampaignDemographics(campaignId),
    enabled: !!campaignId,
  });
}

/* ---- Campaign Invites ---- */

export function useCampaignInvites(campaignId: string) {
  return useQuery({
    queryKey: campaignKeys.invites(campaignId),
    queryFn: () => campaignsApi.getCampaignInvites(campaignId),
    enabled: !!campaignId,
  });
}

export function useRecruiterInvites(
  params: QueryRecruiterInvitesParams = {},
  enabled = true,
) {
  return useQuery({
    queryKey: campaignKeys.recruiterInvites(params),
    queryFn: () => campaignsApi.getRecruiterInvites(params),
    enabled,
  });
}

export function useCancelCampaignInvite() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (inviteId: string) =>
      campaignsApi.cancelCampaignInvite(inviteId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [...campaignKeys.all, "recruiter-invites"],
      });
      toast.success("Invitation cancelled");
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { message?: string } } };
      const message =
        err.response?.data?.message ||
        "Failed to cancel invitation. Please try again.";
      toast.error(message);
    },
  });
}

export function useSendCampaignInviteReminder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (inviteId: string) =>
      campaignsApi.sendCampaignInviteReminder(inviteId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [...campaignKeys.all, "recruiter-invites"],
      });
      toast.success("Reminder sent");
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { message?: string } } };
      const message =
        err.response?.data?.message ||
        "Failed to send reminder. Please try again.";
      toast.error(message);
    },
  });
}

/* ---- Campaign Team ---- */

export function useCampaignTeam(campaignId: string) {
  return useQuery({
    queryKey: campaignKeys.team(campaignId),
    queryFn: () => campaignsApi.getCampaignTeam(campaignId),
    enabled: !!campaignId,
  });
}

export function useInviteCampaignTeamMember() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      campaignId,
      email,
      role,
    }: {
      campaignId: string;
      email: string;
      role: "editor" | "viewer";
    }) => campaignsApi.inviteCampaignTeamMember(campaignId, email, role),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: campaignKeys.team(variables.campaignId),
      });
      toast.success("Team member added");
    },
    onError: () => toast.error("Could not add team member"),
  });
}

export function useUpdateCampaignTeamMemberRole() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      campaignId,
      memberId,
      role,
    }: {
      campaignId: string;
      memberId: string;
      role: "editor" | "viewer";
    }) => campaignsApi.updateCampaignTeamMemberRole(campaignId, memberId, role),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: campaignKeys.team(variables.campaignId),
      });
      toast.success("Team role updated");
    },
    onError: () => toast.error("Could not update team role"),
  });
}

export function useRemoveCampaignTeamMember() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      campaignId,
      memberId,
    }: {
      campaignId: string;
      memberId: string;
    }) => campaignsApi.removeCampaignTeamMember(campaignId, memberId),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: campaignKeys.team(variables.campaignId),
      });
      toast.success("Team member removed");
    },
    onError: () => toast.error("Could not remove team member"),
  });
}

/* ---- Campaign Submissions ---- */

export function useCampaignSubmissions(
  campaignId: string,
  params: QuerySubmissionsParams = {},
) {
  return useQuery({
    queryKey: campaignKeys.submissions(campaignId, params),
    queryFn: () => campaignsApi.getCampaignSubmissions(campaignId, params),
    enabled: !!campaignId,
  });
}

export function useReviewTaskSubmission() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      campaignId,
      submissionId,
      recruiter_notes,
      recruiter_rating,
    }: {
      campaignId: string;
      submissionId: string;
      recruiter_notes?: string;
      recruiter_rating?: number;
    }) =>
      campaignsApi.reviewTaskSubmission(campaignId, submissionId, {
        recruiter_notes,
        recruiter_rating,
      }),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: campaignKeys.submissions(variables.campaignId),
      });
      queryClient.invalidateQueries({
        queryKey: campaignKeys.campaignApplications(variables.campaignId),
      });
    },
  });
}

/* ---- Campaign Task ---- */

export function useUpsertCampaignTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      campaignId,
      payload,
    }: {
      campaignId: string;
      payload: Parameters<typeof campaignsApi.upsertTask>[1];
    }) => campaignsApi.upsertTask(campaignId, payload),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: campaignKeys.detail(variables.campaignId),
      });
    },
  });
}

/* ---- Campaign Actions ---- */

export function useCloseCampaign() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (campaignId: string) => campaignsApi.closeCampaign(campaignId),
    onSuccess: (_data, campaignId) => {
      queryClient.invalidateQueries({
        queryKey: campaignKeys.detail(campaignId),
      });
      queryClient.invalidateQueries({ queryKey: campaignKeys.lists() });
      toast.success("Campaign closed");
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(
        err.response?.data?.message ?? "Failed to close campaign",
      );
    },
  });
}

export function useReopenCampaign() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (campaignId: string) => campaignsApi.reopenCampaign(campaignId),
    onSuccess: (_data, campaignId) => {
      queryClient.invalidateQueries({
        queryKey: campaignKeys.detail(campaignId),
      });
      queryClient.invalidateQueries({ queryKey: campaignKeys.lists() });
      toast.success("Campaign reopened");
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(
        err.response?.data?.message ?? "Failed to reopen campaign",
      );
    },
  });
}

export function useDeleteCampaign() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (campaignId: string) =>
      campaignsApi.deleteCampaign(campaignId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: campaignKeys.lists() });
      toast.success("Campaign deleted");
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(
        err.response?.data?.message ?? "Failed to delete campaign",
      );
    },
  });
}

export function useCloneCampaign() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (campaignId: string) => campaignsApi.cloneCampaign(campaignId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: campaignKeys.lists() });
    },
  });
}

/* ---- Create / Update Campaign ---- */

export function useCreateCampaign() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: Parameters<typeof campaignsApi.createCampaign>[0]) =>
      campaignsApi.createCampaign(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: campaignKeys.lists() });
    },
  });
}

export function useUpdateCampaign() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: Parameters<typeof campaignsApi.updateCampaign>[1];
    }) => campaignsApi.updateCampaign(id, payload),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: campaignKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: campaignKeys.detail(variables.id),
      });
    },
  });
}

/* ---- Campaign Media ---- */

export function useUploadCampaignMedia() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      campaignId,
      formData,
    }: {
      campaignId: string;
      formData: FormData;
    }) => campaignsApi.uploadCampaignMedia(campaignId, formData),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: campaignKeys.detail(variables.campaignId),
      });
    },
  });
}

/* ---- Campaign Publish ---- */

export function usePublishCampaign() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (campaignId: string) =>
      campaignsApi.publishCampaign(campaignId),
    onSuccess: (_data, campaignId) => {
      queryClient.invalidateQueries({
        queryKey: campaignKeys.detail(campaignId),
      });
      queryClient.invalidateQueries({ queryKey: campaignKeys.lists() });
    },
  });
}

/* ---- Campaign → Talent discovery (Talent tab) ---- */

export function useCampaignMatchingTalents(
  campaignId: string,
  params: QueryMatchingTalentsParams = {},
  enabled = true,
) {
  return useQuery({
    queryKey: campaignKeys.matchingTalents(campaignId, params),
    queryFn: () => campaignsApi.getMatchingTalents(campaignId, params),
    enabled: !!campaignId && enabled,
    placeholderData: (prev) => prev,
    staleTime: 15 * 1000,
  });
}

export function useBulkInvitePreview(
  campaignId: string,
  params: QueryMatchingTalentsParams = {},
  enabled = false,
) {
  return useQuery({
    queryKey: campaignKeys.bulkInvitePreview(campaignId, params),
    queryFn: () => campaignsApi.previewBulkInvite(campaignId, params),
    enabled: !!campaignId && enabled,
    staleTime: 10 * 1000,
  });
}

export function useInviteSingleTalent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      campaignId,
      talentId,
      message,
    }: {
      campaignId: string;
      talentId: string;
      message?: string;
    }) => campaignsApi.inviteTalent(campaignId, talentId, message),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: [...campaignKeys.all, "matching-talents", variables.campaignId],
      });
      queryClient.invalidateQueries({
        queryKey: campaignKeys.invites(variables.campaignId),
      });
    },
  });
}

export function useBulkInviteMatchingTalent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      campaignId,
      payload,
    }: {
      campaignId: string;
      payload: BulkInviteByFilterPayload;
    }) => campaignsApi.bulkInviteByFilter(campaignId, payload),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: [...campaignKeys.all, "matching-talents", variables.campaignId],
      });
      queryClient.invalidateQueries({
        queryKey: campaignKeys.invites(variables.campaignId),
      });
      queryClient.invalidateQueries({
        queryKey: [...campaignKeys.all, "bulk-invite-preview", variables.campaignId],
      });
    },
  });
}
