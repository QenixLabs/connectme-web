import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from "@tanstack/react-query";
import { campaignsApi } from "@/lib/api/campaigns";
import type {
  QueryCampaignsParams,
  QueryApplicationParams,
  CampaignAnalyticsParams,
  QuerySubmissionsParams,
  RecruiterCampaignParams,
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
  talentView: (id: string) =>
    [...campaignKeys.all, "talent-view", id] as const,
  bookmarks: () => [...campaignKeys.all, "bookmarks"] as const,
  recommendations: (limit: number) =>
    [...campaignKeys.all, "recommendations", limit] as const,
  applications: () => [...campaignKeys.all, "applications"] as const,
  campaignApplications: (campaignId: string, params?: QueryApplicationParams) =>
    [...campaignKeys.all, "campaign-applications", campaignId, params] as const,
  analytics: (campaignId: string, params?: CampaignAnalyticsParams) =>
    [...campaignKeys.all, "analytics", campaignId, params] as const,
  demographics: (campaignId: string) =>
    [...campaignKeys.all, "demographics", campaignId] as const,
  invites: (campaignId: string) =>
    [...campaignKeys.all, "invites", campaignId] as const,
  team: (campaignId: string) =>
    [...campaignKeys.all, "team", campaignId] as const,
  submissions: (campaignId: string, params?: QuerySubmissionsParams) =>
    [...campaignKeys.all, "submissions", campaignId, params] as const,
};

export function useCampaigns(params: QueryCampaignsParams = {}) {
  return useQuery({
    queryKey: campaignKeys.list(params),
    queryFn: () => campaignsApi.getCampaigns(params),
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
) {
  return useQuery({
    queryKey: campaignKeys.applications(),
    queryFn: () => campaignsApi.getMyApplications(params),
  });
}

export function useCampaignCount(params: QueryCampaignsParams = {}) {
  return useQuery({
    queryKey: [...campaignKeys.list(params), "count"],
    queryFn: () => campaignsApi.getCampaignCount(params),
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: campaignKeys.bookmarks() });
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
      payload?: { message?: string; answers?: { question_id: string; answer: string }[] };
    }) => campaignsApi.applyToCampaign(id, payload),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: campaignKeys.detail(variables.id),
      });
      queryClient.invalidateQueries({ queryKey: campaignKeys.lists() });
    },
  });
}

export function useWithdrawApplication() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id }: { id: string }) => campaignsApi.withdrawApplication(id),
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
    }) => campaignsApi.bulkUpdateApplications(campaignId, applicationIds, status),
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
    }) => campaignsApi.upsertApplicantNote(campaignId, applicationId, noteText, rating),
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

/* ---- Campaign Team ---- */

export function useCampaignTeam(campaignId: string) {
  return useQuery({
    queryKey: campaignKeys.team(campaignId),
    queryFn: () => campaignsApi.getCampaignTeam(campaignId),
    enabled: !!campaignId,
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

/* ---- Campaign Actions ---- */

export function useCloseCampaign() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (campaignId: string) => campaignsApi.closeCampaign(campaignId),
    onSuccess: (_data, campaignId) => {
      queryClient.invalidateQueries({ queryKey: campaignKeys.detail(campaignId) });
      queryClient.invalidateQueries({ queryKey: campaignKeys.lists() });
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
    mutationFn: (campaignId: string) => campaignsApi.publishCampaign(campaignId),
    onSuccess: (_data, campaignId) => {
      queryClient.invalidateQueries({ queryKey: campaignKeys.detail(campaignId) });
      queryClient.invalidateQueries({ queryKey: campaignKeys.lists() });
    },
  });
}
