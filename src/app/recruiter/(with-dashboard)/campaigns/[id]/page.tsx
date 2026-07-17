'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { motion } from "motion/react";
import {
  ArrowLeft,
  Pencil,
  Download,
  Mail,
  Clock,
  CheckCircle2,
  XCircle,
  User,
  Users,
  Send,
  Ban,
  Play,
  RotateCcw,
  Copy,
  Link2,
  Star,
  Bookmark,
  BookmarkCheck,
  Trash2,
  MessageSquare,
  Shield,
  UserPlus,
  UserX,
  Calendar,
  MapPin,
  Briefcase,
  TrendingUp,
  BarChart3,
  PieChartIcon,
  Activity,
  ArrowUpRight,
  Check,
  AlertTriangle,
  Sparkles,
  Compass,
  Search,
  LayoutGrid,
  List,
  Filter,
  X,
  Loader2,
  ClipboardList,
  FileText,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  useCampaignApplications,
  useUpdateApplicationStatus,
  useAddToShortlist,
  useRemoveFromShortlist,
  useUpsertApplicantNote,
  useDeleteApplicantNote,
} from '@/lib/api/hooks/useCampaignApplications';
import { useCampaign } from '@/lib/api/hooks/useCampaign';
import {
  useCampaignInvites,
  useCampaignAnalytics,
  useCampaignDemographics,
  useInviteTalent,
} from '@/lib/api';
import { campaignApi } from '@/lib/api/campaign';
import { getApiErrorMessage } from '@/lib/formatters';
import {
  usePublishCampaign,
  useCloseCampaign,
  useReopenCampaign,
  useCloneCampaign,
  useUploadCampaignMedia,
} from '@/lib/api/hooks/useCampaigns';
import { useBulkUpdateApplicationStatus } from '@/lib/api/hooks/useCampaignApplications';
import {
  useCampaignTeam,
  useInviteTeamMember,
  useUpdateTeamMemberRole,
  useRemoveTeamMember,
} from '@/lib/api/hooks/useCampaignTeam';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { useTierGuard } from '@/hooks/use-tier-guard';
import { useFeatureGuard, isFeatureForbidden } from '@/hooks/use-feature-guard';
import { usePopup } from '@/hooks/use-popup';
import { TalentGridCard } from '@/components/talent-grid-card';
import { CampaignApplicationCard } from '@/components/campaign-application-card';
import { CampaignApplicationRow } from '@/components/campaign-application-row';
import { ApplicationNoteSheet } from '@/components/application-note-sheet';
import { TaskSubmissionsPanel } from '@/components/campaigns/TaskSubmissionsPanel';
import { TaskSubmissionDetail } from '@/components/campaigns/TaskSubmissionDetail';
import { type TaskSubmission } from '@/lib/api';
import { useReviewTaskSubmission } from '@/lib/api/hooks/useCampaignTask';
import { useSendAcceptanceMessage } from '@/lib/api/hooks/useCampaignTask';
import { useTalentRecommendations } from '@/lib/api/hooks/useTalentRecommendations';
import { FeatureGateAlert } from '@/components/feature-gate-alert';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from 'recharts';

const APP_STATUS_META: Record<
  string,
  { label: string; icon: typeof CheckCircle2; classes: string }
> = {
  pending: {
    label: 'Pending',
    icon: Clock,
    classes: 'bg-amber-50 text-amber-700 border-amber-200',
  },
  accepted: {
    label: 'Accepted',
    icon: CheckCircle2,
    classes: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  },
  rejected: {
    label: 'Rejected',
    icon: XCircle,
    classes: 'bg-rose-50 text-rose-700 border-rose-200',
  },
};

const INVITE_STATUS_META: Record<
  string,
  { label: string; icon: typeof Clock; classes: string }
> = {
  pending: {
    label: 'Pending',
    icon: Clock,
    classes: 'bg-amber-50 text-amber-700 border-amber-200',
  },
  accepted: {
    label: 'Accepted',
    icon: CheckCircle2,
    classes: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  },
  declined: {
    label: 'Declined',
    icon: Ban,
    classes: 'bg-rose-50 text-rose-700 border-rose-200',
  },
};

const PIE_COLORS = ['var(--color-brand)', 'var(--color-success)', 'var(--color-error)'];
const BAR_COLOR = '#6366f1';

const PROFESSION_GRADIENTS: Record<string, string> = {
  Actor: "from-fuchsia-600 via-purple-700 to-violet-800",
  Model: "from-teal-600 via-emerald-700 to-green-800",
  Dancer: "from-indigo-600 via-violet-700 to-purple-800",
  Musician: "from-indigo-600 via-violet-700 to-purple-800",
  "Voice Artist": "from-rose-600 via-pink-700 to-fuchsia-800",
  Photographer: "from-violet-600 via-purple-700 to-indigo-800",
  Influencer: "from-sky-600 via-blue-700 to-indigo-800",
  "Extra / Background": "from-slate-600 to-slate-800",
};

function getProfessionGradient(roleType?: string): string {
  if (!roleType) return "from-slate-700 to-slate-900";
  const key = roleType.toLowerCase();
  for (const [k, v] of Object.entries(PROFESSION_GRADIENTS)) {
    if (key.includes(k.toLowerCase())) return v;
  }
  return "from-slate-700 to-slate-900";
}

function DetailStatCard({
  label,
  value,
  icon: Icon,
  accent,
}: {
  label: string;
  value: number | string;
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  accent: string;
}) {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-card border border-border/60 shadow-luxe p-5 hover:shadow-luxe-lg transition-shadow duration-300">
      <div className="flex items-center justify-between mb-3">
        <div
          className={cn(
            "h-10 w-10 rounded-xl bg-gradient-to-br grid place-items-center text-white",
            accent,
          )}
        >
          <Icon className="h-4 w-4" strokeWidth={1.5} />
        </div>
      </div>
      <p className="font-serif text-[28px] font-semibold text-ink leading-none tracking-tight">
        {typeof value === 'number' ? value.toLocaleString() : value}
      </p>
      <p className="mt-1 text-[12px] font-semibold uppercase tracking-[0.08em] text-ink-muted">
        {label}
      </p>
    </div>
  );
}

export default function CampaignDetailPage() {
  const params = useParams();
  const router = useRouter();
  const campaignId = params.id as string;
  const [activeTab, setActiveTab] = useState('applicants');
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [selectedApps, setSelectedApps] = useState<Set<string>>(new Set());
  const [analyticsFrom, setAnalyticsFrom] = useState('');
  const [analyticsTo, setAnalyticsTo] = useState('');

  const [teamInviteEmail, setTeamInviteEmail] = useState('');
  const [teamInviteRole, setTeamInviteRole] = useState('viewer');
  const [showShortlistedOnly, setShowShortlistedOnly] = useState(false);

  // Applicants tab state
  const [appSearch, setAppSearch] = useState('');
  const [appDebouncedSearch, setAppDebouncedSearch] = useState('');
  const [appStatus, setAppStatus] = useState('all');
  const [appShortlisted, setAppShortlisted] = useState('all');
  const [appSort, setAppSort] = useState('newest');
  const [appViewMode, setAppViewMode] = useState<'grid' | 'list'>('grid');
  const [appSelectMode, setAppSelectMode] = useState(false);
  const [appSelectedIds, setAppSelectedIds] = useState<Set<string>>(new Set());
  const [noteSheetOpen, setNoteSheetOpen] = useState(false);
  const [noteApplication, setNoteApplication] = useState<Record<string, unknown> | null>(null);

  // Task submission state
  const [selectedSubmission, setSelectedSubmission] = useState<TaskSubmission | null>(null);
  const reviewSubmission = useReviewTaskSubmission();
  const sendAcceptanceMsg = useSendAcceptanceMessage();

  const { guard } = useTierGuard(3);
  const { handleFeatureError } = useFeatureGuard();

  useEffect(() => {
    const timer = setTimeout(() => setAppDebouncedSearch(appSearch), 300);
    return () => clearTimeout(timer);
  }, [appSearch]);

  const appFilters = useMemo(() => ({
    status: appStatus !== 'all' ? appStatus : undefined,
    shortlisted: appShortlisted === 'true' ? 'true' : undefined,
    search: appDebouncedSearch || undefined,
    sort: appSort,
  }), [appStatus, appShortlisted, appDebouncedSearch, appSort]);

  const {
    data: campaign,
    isLoading: isLoadingCampaign,
    error: campaignError,
  } = useCampaign(campaignId);

  const {
    data: appsResponse,
    isLoading: isLoadingApps,
    error: appsError,
  } = useCampaignApplications(campaignId, { sort: 'newest', limit: 5 });

  const {
    data: fullAppsResponse,
    isLoading: isLoadingFullApps,
  } = useCampaignApplications(campaignId, appFilters);

  const applications = appsResponse?.data;
  const appSummary = appsResponse ? {
    total: appsResponse.total,
    pending: appsResponse.pending,
    accepted: appsResponse.accepted,
    rejected: appsResponse.rejected,
    shortlisted: appsResponse.shortlisted,
  } : null;

  const fullApplications = fullAppsResponse?.data;
  const fullAppSummary = fullAppsResponse ? {
    total: fullAppsResponse.total,
    pending: fullAppsResponse.pending,
    accepted: fullAppsResponse.accepted,
    rejected: fullAppsResponse.rejected,
    shortlisted: fullAppsResponse.shortlisted,
  } : null;

  const {
    data: invites,
    isLoading: isLoadingInvites,
    error: invitesError,
  } = useCampaignInvites(campaignId);

  const analyticsRange =
    analyticsFrom || analyticsTo
      ? { from: analyticsFrom || undefined, to: analyticsTo || undefined }
      : undefined;

  const {
    data: analytics,
    isLoading: isLoadingAnalytics,
    error: analyticsError,
  } = useCampaignAnalytics(campaignId, analyticsRange);

  const {
    data: demographics,
    isLoading: isLoadingDemographics,
    error: demographicsError,
  } = useCampaignDemographics(campaignId);

  const updateStatus = useUpdateApplicationStatus();
  const bulkUpdateStatus = useBulkUpdateApplicationStatus();
  const publishCampaign = usePublishCampaign();
  const closeCampaign = useCloseCampaign();
  const reopenCampaign = useReopenCampaign();
  const cloneCampaign = useCloneCampaign();
  const uploadMedia = useUploadCampaignMedia();
  const addToShortlist = useAddToShortlist();
  const removeFromShortlist = useRemoveFromShortlist();
  const upsertNote = useUpsertApplicantNote();
  const deleteNote = useDeleteApplicantNote();

  const {
    data: teamData,
    isLoading: isLoadingTeam,
    error: teamError,
  } = useCampaignTeam(campaignId);
  const inviteTeamMember = useInviteTeamMember();
  const updateTeamRole = useUpdateTeamMemberRole();
  const removeTeamMember = useRemoveTeamMember();

  const {
    data: recResponse,
    isLoading: isLoadingRecs,
    error: recsError,
  } = useTalentRecommendations(campaignId, 10, campaign?.status === 'active');

  const inviteTalent = useInviteTalent();
  const { show: showPopup } = usePopup();

  const handleInvite = (talentId: string) => {
    guard(() =>
      inviteTalent.mutate(
        { campaignId, talentId },
        {
          onSuccess: () =>
            showPopup({ title: 'Talent invited', variant: 'success', position: 'bottom-center' }),
          onError: (err) => {
            if (handleFeatureError(err)) return;
            const e = err as { response?: { data?: { message?: string } } };
            showPopup({ title: 'Failed to invite', description: e.response?.data?.message, variant: 'error', position: 'bottom-center' });
          },
        },
      ),
    );
  };

  const [noteAppId, setNoteAppId] = useState<string | null>(null);
  const [noteText, setNoteText] = useState('');
  const [noteRating, setNoteRating] = useState(0);

  const handleStatusChange = async (appId: string, status: string) => {
    setUpdatingId(appId);
    try {
      await updateStatus.mutateAsync({
        campaignId,
        applicationId: appId,
        status,
      });
    } finally {
      setUpdatingId(null);
    }
  };

  const toggleAppSelection = (appId: string) => {
    const next = new Set(selectedApps);
    if (next.has(appId)) {
      next.delete(appId);
    } else {
      next.add(appId);
    }
    setSelectedApps(next);
  };

  const handleBulkUpdate = async (status: string) => {
    if (selectedApps.size === 0) return;
    await bulkUpdateStatus.mutateAsync({
      campaignId,
      applicationIds: Array.from(selectedApps),
      status,
    });
    setSelectedApps(new Set());
  };

  const handleExport = async () => {
    if (!campaign) return;
    try {
      await campaignApi.exportCsv(campaignId, campaign.name);
    } catch (err) {
      if (handleFeatureError(err)) return;
    }
  };

  const handleViewSubmission = (submission: TaskSubmission) => {
    setSelectedSubmission(submission);
  };

  const handleReviewSubmission = (notes: string, rating: number) => {
    if (!selectedSubmission) return;
    reviewSubmission.mutate(
      {
        campaignId,
        submissionId: selectedSubmission._id,
        payload: { recruiter_notes: notes || undefined, recruiter_rating: rating || undefined },
      },
      {
        onSuccess: () => setSelectedSubmission(null),
      },
    );
  };

  const handleAcceptFromSubmission = async () => {
    if (!selectedSubmission) return;
    try {
      await updateStatus.mutateAsync({
        campaignId,
        applicationId: selectedSubmission.application_id,
        status: 'accepted',
      });
      if (selectedSubmission.talent_id) {
        sendAcceptanceMsg.mutate({ campaignId, talentId: selectedSubmission.talent_id });
      }
      setSelectedSubmission(null);
    } catch {}
  };

  const handleRejectFromSubmission = async () => {
    if (!selectedSubmission) return;
    try {
      await updateStatus.mutateAsync({
        campaignId,
        applicationId: selectedSubmission.application_id,
        status: 'rejected',
      });
      setSelectedSubmission(null);
    } catch {}
  };

  // Applicant tab handlers
  const handleAppStatusChange = async (appId: string, status: string) => {
    setUpdatingId(appId);
    try {
      await updateStatus.mutateAsync({ campaignId, applicationId: appId, status });
      if (status === 'accepted') {
        const app = applications?.find((a) => a._id === appId);
        const talentId = typeof app?.talent_id === 'object' && app.talent_id !== null
          ? app.talent_id._id
          : typeof app?.talent_id === 'string' ? app.talent_id : null;
        if (talentId) {
          sendAcceptanceMsg.mutate({ campaignId, talentId });
        }
      }
    } finally {
      setUpdatingId(null);
    }
  };

  const handleAppToggleShortlist = (appId: string, isShortlisted: boolean) => {
    if (isShortlisted) {
      removeFromShortlist.mutate({ campaignId, applicationId: appId });
    } else {
      addToShortlist.mutate({ campaignId, applicationId: appId });
    }
  };

  const handleAppToggleSelect = (appId: string) => {
    setAppSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(appId)) next.delete(appId);
      else next.add(appId);
      return next;
    });
  };

  const handleAppBulkUpdate = async (status: string) => {
    if (appSelectedIds.size === 0) return;
    await bulkUpdateStatus.mutateAsync({
      campaignId,
      applicationIds: Array.from(appSelectedIds),
      status,
    });
    setAppSelectedIds(new Set());
  };

  const handleOpenNote = (app: Record<string, unknown>) => {
    setNoteApplication(app);
    setNoteSheetOpen(true);
  };

  const handleSaveNote = (noteText: string, rating: number) => {
    if (!noteApplication) return;
    upsertNote.mutate(
      {
        campaignId,
        applicationId: noteApplication._id as string,
        payload: { note_text: noteText, rating: rating || undefined },
      },
      {
        onSuccess: () => {
          setNoteSheetOpen(false);
          setNoteApplication(null);
        },
      },
    );
  };

  const handleDeleteNote = () => {
    if (!noteApplication) return;
    deleteNote.mutate(
      { campaignId, applicationId: noteApplication._id as string },
      {
        onSuccess: () => {
          setNoteSheetOpen(false);
          setNoteApplication(null);
        },
      },
    );
  };

  const hasActiveAppFilters = appStatus !== 'all' || appShortlisted !== 'true' || !!appDebouncedSearch;

  const handleCoverUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !campaignId) return;
    const formData = new FormData();
    formData.append('file', file);
    guard(() => uploadMedia.mutate({ campaignId, formData }));
    e.target.value = '';
  };

  const isLoading = isLoadingCampaign;
  const error = campaignError;

  if (isLoading) {
    return (
      <div className="max-w-[1280px] mx-auto w-full px-4 sm:px-6 py-8 pb-24 lg:pb-12 space-y-8">
        <Skeleton className="h-8 w-48 rounded-lg" />
        <Skeleton className="h-[140px] rounded-2xl w-full" />
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-[100px] rounded-2xl" />
          ))}
        </div>
        <Skeleton className="h-64 rounded-2xl" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-[1280px] mx-auto w-full px-4 sm:px-6 py-8">
        <Button
          variant="ghost"
          size="sm"
          className="w-fit -ml-2 mb-4 text-ink-muted hover:text-ink group"
          onClick={() => router.push('/recruiter/campaigns')}
        >
          <ArrowLeft className="w-4 h-4 mr-1 transition-transform group-hover:-translate-x-0.5" strokeWidth={1.5} />
          Back to Campaigns
        </Button>
        <Alert variant="destructive" className="rounded-xl border-error-muted">
          <AlertDescription>
            {getApiErrorMessage(error, 'Failed to load campaign')}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const totalApplicants = analytics?.total_applications ?? 0;
  const pendingInvites = invites?.filter((i) => i.status === 'pending').length ?? 0;
  const acceptedInvites = analytics?.accepted_invites ?? 0;
  const declinedInvites = analytics?.declined_invites ?? 0;
  const responseRate = analytics?.response_rate ?? 0;

  return (
    <div className="max-w-[1280px] mx-auto w-full px-4 sm:px-6 py-8 pb-24 lg:pb-12 flex flex-col gap-8">
      <motion.div
        initial={{ opacity: 0, x: -6 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Button
          variant="ghost"
          size="sm"
          className="w-fit -ml-2 text-ink-muted hover:text-ink group font-medium"
          onClick={() => router.push('/recruiter/campaigns')}
        >
          <ArrowLeft className="w-4 h-4 mr-1 transition-transform group-hover:-translate-x-0.5" strokeWidth={1.5} />
          Back to Campaigns
        </Button>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="relative overflow-hidden rounded-2xl border border-border/60 bg-card shadow-luxe"
      >
        {campaign?.cover_image_url ? (
          <div className="relative h-[200px] w-full overflow-hidden group/cover">
            <img
              src={campaign.cover_image_url}
              alt={campaign.name}
              className="h-full w-full object-cover transition-transform duration-700 group-hover/cover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
            <label
              htmlFor="cover-upload-detail"
              className="absolute top-3 right-3 opacity-0 group-hover/cover:opacity-100 transition-opacity cursor-pointer px-3 py-1.5 rounded-lg bg-black/50 text-white text-xs font-medium backdrop-blur-sm hover:bg-black/70"
            >
              <Pencil className="w-3 h-3 inline mr-1" strokeWidth={1.5} />
              Change cover
            </label>
          </div>
        ) : (
          <div
            className={cn(
              "relative h-[200px] w-full overflow-hidden group/cover bg-gradient-to-br",
              getProfessionGradient(campaign?.role_type),
            )}
          >
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(255,255,255,0.10),_transparent_55%)]" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_rgba(255,255,255,0.08),_transparent_50%)]" />
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-white/20 via-white/40 to-white/20" />
            <label
              htmlFor="cover-upload-detail"
              className="absolute top-3 right-3 opacity-0 group-hover/cover:opacity-100 transition-opacity cursor-pointer px-3 py-1.5 rounded-lg bg-black/50 text-white text-xs font-medium backdrop-blur-sm hover:bg-black/70"
            >
              <Pencil className="w-3 h-3 inline mr-1" strokeWidth={1.5} />
              Add cover
            </label>
          </div>
        )}
        <input
          type="file"
          accept="image/*"
          onChange={handleCoverUpload}
          className="hidden"
          id="cover-upload-detail"
        />
        <div className="p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6">
            <div className="flex-1 min-w-0 space-y-3">
              <div className="flex items-center gap-2 flex-wrap">
                <Badge
                  className={cn(
                    "rounded-full text-[10px] font-semibold uppercase tracking-[0.12em] border px-2.5 py-0.5",
                    campaign?.status === 'active'
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : campaign?.status === 'draft'
                        ? 'bg-amber-50 text-amber-700 border-amber-200'
                        : 'bg-slate-100 text-slate-600 border-slate-200',
                  )}
                >
                  {campaign?.status}
                </Badge>
                <Badge variant="outline" className="rounded-full text-[10px] font-semibold uppercase tracking-[0.12em] px-2.5 py-0.5">
                  {campaign?.visibility === 'invite_only' ? 'Invite Only' : 'Public'}
                </Badge>
              </div>
              <h1 className="text-[26px] font-serif font-semibold text-ink tracking-tight leading-tight">
                {campaign?.name}
              </h1>
              <div className="flex items-center gap-5 text-sm text-ink-muted flex-wrap">
                {campaign?.role_type && (
                  <span className="flex items-center gap-1.5 font-medium">
                    <Briefcase className="h-4 w-4 text-ink-muted/50" strokeWidth={1.5} />
                    {campaign.role_type}
                  </span>
                )}
                {campaign?.specialties && campaign.specialties.length > 0 && (
                  <span className="flex items-center gap-1.5 font-medium">
                    <Activity className="h-4 w-4 text-ink-muted/50" strokeWidth={1.5} />
                    {campaign.specialties.join(', ')}
                  </span>
                )}
                {campaign?.location?.city && (
                  <span className="flex items-center gap-1.5 font-medium">
                    <MapPin className="h-4 w-4 text-ink-muted/50" strokeWidth={1.5} />
                    {[campaign.location.city, campaign.location.state].filter(Boolean).join(', ')}
                  </span>
                )}
                {campaign?.deadline && (
                  <span className="flex items-center gap-1.5 font-medium">
                    <Calendar className="h-4 w-4 text-ink-muted/50" strokeWidth={1.5} />
                    Deadline: {new Date(campaign.deadline).toLocaleDateString('en-US', {
                      month: 'short', day: 'numeric', year: 'numeric',
                    })}
                  </span>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              {campaign?.status === 'draft' && (
                <Button
                  variant="outline"
                  size="sm"
                  className="h-9 rounded-xl border-border/60 bg-card shadow-luxe text-sm font-medium hover:bg-cream-soft"
                  onClick={() => guard(() => publishCampaign.mutate(campaignId))}
                  disabled={publishCampaign.isPending}
                >
                  <Play className="w-3.5 h-3.5 mr-1.5" strokeWidth={1.5} />
                  Publish
                </Button>
              )}
              {campaign?.status === 'active' && (
                <Button
                  variant="outline"
                  size="sm"
                  className="h-9 rounded-xl border-border/60 bg-card shadow-luxe text-sm font-medium hover:bg-cream-soft"
                  onClick={() => guard(() => closeCampaign.mutate(campaignId))}
                  disabled={closeCampaign.isPending}
                >
                  <XCircle className="w-3.5 h-3.5 mr-1.5" strokeWidth={1.5} />
                  Close
                </Button>
              )}
              {campaign?.status === 'closed' && (
                <Button
                  variant="outline"
                  size="sm"
                  className="h-9 rounded-xl border-border/60 bg-card shadow-luxe text-sm font-medium hover:bg-cream-soft"
                  onClick={() => guard(() => reopenCampaign.mutate(campaignId))}
                  disabled={reopenCampaign.isPending}
                >
                  <RotateCcw className="w-3.5 h-3.5 mr-1.5" strokeWidth={1.5} />
                  Reopen
                </Button>
              )}
              <Button
                variant="outline"
                size="sm"
                className="h-9 rounded-xl border-border/60 bg-card shadow-luxe text-sm font-medium hover:bg-cream-soft"
                onClick={() => guard(() => cloneCampaign.mutate(campaignId))}
                disabled={cloneCampaign.isPending}
              >
                <Copy className="w-3.5 h-3.5 mr-1.5" strokeWidth={1.5} />
                Clone
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-9 rounded-xl border-border/60 bg-card shadow-luxe text-sm font-medium hover:bg-cream-soft"
                onClick={() =>
                  guard(() => router.push(`/recruiter/campaigns/${campaignId}/edit`))
                }
              >
                <Pencil className="w-3.5 h-3.5 mr-1.5" strokeWidth={1.5} />
                Edit
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-9 rounded-xl text-sm font-medium text-ink-muted hover:text-ink hover:bg-cream-soft"
                onClick={() => {
                  const url = `${window.location.origin}/talent/opportunities/${campaignId}`;
                  navigator.clipboard.writeText(url);
                }}
              >
                <Link2 className="w-3.5 h-3.5 mr-1.5" strokeWidth={1.5} />
                Copy Link
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-9 rounded-xl text-sm font-medium text-ink-muted hover:text-ink hover:bg-cream-soft"
                onClick={handleExport}
              >
                <Download className="w-3.5 h-3.5 mr-1.5" strokeWidth={1.5} />
                Export
              </Button>
            </div>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.06, ease: "easeOut" }}
        className="grid grid-cols-2 sm:grid-cols-5 gap-4"
      >
        <DetailStatCard
          label="Total Applicants"
          value={totalApplicants}
          icon={Users}
          accent="from-blue-500 to-blue-600"
        />
        <DetailStatCard
          label="Pending Invites"
          value={pendingInvites}
          icon={Send}
          accent="from-amber-500 to-amber-600"
        />
        <DetailStatCard
          label="Accepted"
          value={acceptedInvites}
          icon={CheckCircle2}
          accent="from-emerald-500 to-emerald-600"
        />
        <DetailStatCard
          label="Declined"
          value={declinedInvites}
          icon={Ban}
          accent="from-rose-500 to-pink-600"
        />
        <DetailStatCard
          label="Response Rate"
          value={`${Math.round(responseRate * 100)}%`}
          icon={TrendingUp}
          accent="from-violet-500 to-purple-600"
        />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1, ease: "easeOut" }}
      >
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-6 bg-muted-bg/50 border border-border/60 rounded-xl p-1">
            <TabsTrigger
              value="applicants"
              className="rounded-lg data-[state=active]:bg-card data-[state=active]:shadow-luxe data-[state=active]:text-ink text-ink-muted text-xs font-semibold py-2.5"
            >
              Applicants
              <span className="ml-1.5 px-1.5 py-0.5 rounded-md text-[10px] bg-muted-bg data-[state=active]:bg-muted-bg">
                {totalApplicants}
              </span>
            </TabsTrigger>
            <TabsTrigger
              value="invites"
              className="rounded-lg data-[state=active]:bg-card data-[state=active]:shadow-luxe data-[state=active]:text-ink text-ink-muted text-xs font-semibold py-2.5"
            >
              Invites
              <span className="ml-1.5 px-1.5 py-0.5 rounded-md text-[10px] bg-muted-bg data-[state=active]:bg-muted-bg">
                {invites?.length ?? 0}
              </span>
            </TabsTrigger>
            <TabsTrigger
              value="team"
              className="rounded-lg data-[state=active]:bg-card data-[state=active]:shadow-luxe data-[state=active]:text-ink text-ink-muted text-xs font-semibold py-2.5"
            >
              Team
            </TabsTrigger>
            <TabsTrigger
              value="recommended"
              className="rounded-lg data-[state=active]:bg-card data-[state=active]:shadow-luxe data-[state=active]:text-ink text-ink-muted text-xs font-semibold py-2.5"
            >
              Recommended
            </TabsTrigger>
            <TabsTrigger
              value="analytics"
              className="rounded-lg data-[state=active]:bg-card data-[state=active]:shadow-luxe data-[state=active]:text-ink text-ink-muted text-xs font-semibold py-2.5"
            >
              Analytics
            </TabsTrigger>
            <TabsTrigger
              value="submissions"
              className="rounded-lg data-[state=active]:bg-card data-[state=active]:shadow-luxe data-[state=active]:text-ink text-ink-muted text-xs font-semibold py-2.5"
            >
              Submissions
            </TabsTrigger>
          </TabsList>

          <TabsContent value="applicants" className="space-y-4 mt-6">
            {isLoadingApps ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="aspect-[3/4] rounded-2xl" />
                ))}
              </div>
            ) : appsError ? (
              <Alert variant="destructive" className="rounded-xl border-error-muted">
                <AlertDescription>
                  {getApiErrorMessage(appsError, 'Failed to load applications')}
                </AlertDescription>
              </Alert>
            ) : applications && applications.length > 0 ? (
              <div className="space-y-5">
                {/* Header with stats + View All */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <h3 className="text-sm font-semibold text-ink">Applications</h3>
                    {appSummary && (
                      <div className="hidden sm:flex items-center gap-3">
                        <div className="text-center">
                          <p className="text-base font-semibold text-ink">{appSummary.total}</p>
                          <p className="text-2xs uppercase tracking-wider text-ink-muted">Total</p>
                        </div>
                        <div className="w-px h-6 bg-border" />
                        <div className="text-center">
                          <p className="text-base font-semibold text-amber-600">{appSummary.pending}</p>
                          <p className="text-2xs uppercase tracking-wider text-ink-muted">Pending</p>
                        </div>
                        <div className="w-px h-6 bg-border" />
                        <div className="text-center">
                          <p className="text-base font-semibold text-emerald-600">{appSummary.accepted}</p>
                          <p className="text-2xs uppercase tracking-wider text-ink-muted">Accepted</p>
                        </div>
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => router.push(`/recruiter/campaigns/${campaignId}/applications`)}
                    className="text-[11px] font-medium text-gold flex items-center gap-0.5 hover:text-gold-hover transition-colors"
                  >
                    View all applications
                    <ArrowUpRight className="h-3 w-3" />
                  </button>
                </div>

                {/* Grid of top 5 applications */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                  {applications.map((app) => (
                    <CampaignApplicationCard
                      key={app._id}
                      application={app}
                      onViewProfile={() => {
                        const talent = typeof app.talent_id === 'object' && app.talent_id !== null ? app.talent_id : null;
                        if (talent?.username) router.push(`/talent/${talent.username}`);
                      }}
                      onStatusChange={(status) => handleAppStatusChange(app._id, status)}
                      onToggleShortlist={() => handleAppToggleShortlist(app._id, app.is_shortlisted ?? false)}
                      onAddNote={() => handleOpenNote(app as unknown as Record<string, unknown>)}
                    />
                  ))}
                </div>

                {/* "You Might Also Like" recommendations */}
                {campaign?.status === 'active' && (() => {
                  const talentRecs = recResponse?.data;
                  if (!talentRecs || talentRecs.length === 0) return null;
                  return (
                    <div className="pt-5 border-t border-border/60">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <Sparkles className="h-4 w-4 text-gold" strokeWidth={1.5} />
                          <p className="text-[13px] font-semibold text-ink">
                            You Might Also Like
                          </p>
                        </div>
                        <button
                          onClick={() => setActiveTab('recommended')}
                          className="text-[11px] font-medium text-gold flex items-center gap-0.5 hover:text-gold-hover transition-colors"
                        >
                          View all recommended
                          <ArrowUpRight className="h-3 w-3" />
                        </button>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {talentRecs.slice(0, 3).map((r) => {
                          const talent = r.talent as Record<string, unknown>;
                          return (
                            <TalentGridCard
                              key={r._id}
                              profile={{
                                _id: talent?._id as string,
                                user_id: talent?.user_id as string,
                                username: talent?.username as string,
                                full_legal_name: talent?.full_legal_name as string,
                                profile_photo: talent?.profile_photo as string,
                                location: talent?.location as Record<string, string>,
                                professions: talent?.professions as string[],
                                is_verified: true,
                              }}
                              matchScore={r.total_score}
                              onViewProfile={() =>
                                router.push("/talent/" + (talent?.username as string))
                              }
                              onInvite={() => handleInvite(talent?.user_id as string)}
                            />
                          );
                        })}
                      </div>
                    </div>
                  );
                })()}
              </div>
            ) : (
              <div className="text-center py-24 bg-card border border-border/60 rounded-2xl shadow-luxe">
                <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-muted-bg mx-auto">
                  <Users className="w-9 h-9 text-ink-muted/40" strokeWidth={1.5} />
                </div>
                <p className="text-base font-serif font-semibold text-ink">
                  No applications yet
                </p>
                <p className="mt-2 text-sm text-ink-muted max-w-sm mx-auto leading-relaxed">
                  Share your campaign link with talent or wait for organic applications to start rolling in.
                </p>
              </div>
            )}

            {/* Note Sheet */}
            <ApplicationNoteSheet
              open={noteSheetOpen}
              onClose={() => { setNoteSheetOpen(false); setNoteApplication(null); }}
              application={noteApplication as unknown as import('@/components/campaign-application-card').EnrichedApplication | null}
              onSave={handleSaveNote}
              onDelete={handleDeleteNote}
              isSaving={upsertNote.isPending}
              isDeleting={deleteNote.isPending}
            />
          </TabsContent>

          <TabsContent value="invites" className="space-y-4 mt-6">
            {isLoadingInvites ? (
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-20 rounded-2xl" />
                ))}
              </div>
            ) : invitesError ? (
              <Alert variant="destructive" className="rounded-xl border-error-muted">
                <AlertDescription>
                  {getApiErrorMessage(invitesError, 'Failed to load invites')}
                </AlertDescription>
              </Alert>
            ) : invites && invites.length > 0 ? (
              <div className="space-y-3">
                {invites.map((invite, idx) => {
                  const meta = INVITE_STATUS_META[invite.status] ?? INVITE_STATUS_META.pending;
                  const Icon = meta.icon;
                  const talent =
                    typeof invite.talent_id === 'object' && invite.talent_id !== null
                      ? invite.talent_id
                      : null;

                  return (
                    <motion.article
                      key={invite._id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: idx * 0.04 }}
                      className="bg-card border border-border/60 rounded-2xl px-5 py-4 shadow-luxe flex flex-col sm:flex-row sm:items-center gap-4 hover:shadow-luxe-lg transition-shadow"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center shrink-0">
                            <User className="w-4 h-4 text-slate-500" strokeWidth={1.5} />
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-ink">
                              {talent?.full_legal_name || talent?.email || 'Unknown'}
                            </p>
                            <p className="text-xs text-ink-muted mt-0.5 font-medium">
                              Invited {new Date(invite.created_at).toLocaleDateString('en-US', {
                                month: 'short', day: 'numeric', year: 'numeric',
                              })}
                            </p>
                          </div>
                        </div>
                      </div>
                      <Badge className={cn(
                        'rounded-full text-[10px] font-semibold px-2.5 py-0.5 border shrink-0',
                        meta.classes,
                      )}>
                        <Icon className="w-3 h-3 mr-1" strokeWidth={1.5} />
                        {meta.label}
                      </Badge>
                    </motion.article>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-24 bg-card border border-border/60 rounded-2xl shadow-luxe">
                <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-muted-bg mx-auto">
                  <Send className="w-9 h-9 text-ink-muted/40" strokeWidth={1.5} />
                </div>
                <p className="text-base font-serif font-semibold text-ink">
                  No invites sent yet
                </p>
                <p className="mt-2 text-sm text-ink-muted max-w-sm mx-auto leading-relaxed">
                  Invite talent directly to apply for this campaign. They'll receive a notification.
                </p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="team" className="space-y-4 mt-6">
            <div className="bg-card border border-border/60 rounded-2xl p-6 shadow-luxe space-y-5">
              <div className="flex flex-col sm:flex-row gap-3">
                <Input
                  placeholder="Email address..."
                  value={teamInviteEmail}
                  onChange={(e) => setTeamInviteEmail(e.target.value)}
                  className="h-10 text-sm flex-1 rounded-xl border-border/60 bg-card"
                />
                <div className="flex gap-2">
                  <Select value={teamInviteRole} onValueChange={setTeamInviteRole}>
                    <SelectTrigger className="w-[120px] h-10 text-sm rounded-xl border-border/60 bg-card">
                      <SelectValue placeholder="Role" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      <SelectItem value="viewer">Viewer</SelectItem>
                      <SelectItem value="editor">Editor</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button
                    size="sm"
                    className="h-10 text-sm rounded-xl bg-gradient-to-br from-gold to-gold-hover text-white hover:from-gold-bright hover:to-gold shadow-[0_4px_14px_-4px_oklch(0.74_0.13_80/0.45)] font-semibold px-5"
                    onClick={() => {
                      if (!teamInviteEmail.trim()) return;
                      guard(() =>
                        inviteTeamMember.mutate(
                          {
                            campaignId,
                            email: teamInviteEmail.trim(),
                            role: teamInviteRole,
                          },
                          {
                            onSuccess: () => {
                              setTeamInviteEmail('');
                              setTeamInviteRole('viewer');
                            },
                          },
                        ),
                      );
                    }}
                    disabled={inviteTeamMember.isPending || !teamInviteEmail.trim()}
                  >
                    <UserPlus className="w-4 h-4 mr-1.5" strokeWidth={1.5} />
                    Invite
                  </Button>
                </div>
              </div>

              {isLoadingTeam ? (
                <div className="space-y-3">
                  {Array.from({ length: 2 }).map((_, i) => (
                    <Skeleton key={i} className="h-16 rounded-xl" />
                  ))}
                </div>
              ) : teamError ? (
                isFeatureForbidden(teamError) ? (
                  <FeatureGateAlert {...isFeatureForbidden(teamError)!} />
                ) : (
                  <Alert variant="destructive" className="rounded-xl border-error-muted">
                    <AlertDescription>
                      {getApiErrorMessage(teamError, 'Failed to load team')}
                    </AlertDescription>
                  </Alert>
                )
              ) : teamData?.members && teamData.members.length > 0 ? (
                <div className="space-y-2">
                  {teamData.members.map(
                    (member: {
                      _id: string;
                      user_id: { full_legal_name?: string; email?: string } | null;
                      role: string;
                    }) => {
                      const user = member.user_id;
                      const displayName = user?.full_legal_name || user?.email || 'Unknown';
                      return (
                        <div
                          key={member._id}
                          className="flex items-center justify-between gap-4 bg-muted-bg/50 border border-border/30 rounded-xl px-4 py-3"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center shrink-0">
                              <User className="w-4 h-4 text-slate-500" strokeWidth={1.5} />
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-semibold text-ink truncate">{displayName}</p>
                              <p className="text-xs text-ink-muted truncate">{user?.email}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <Badge variant="outline" className="rounded-lg text-[10px] font-medium capitalize py-0.5">
                              {member.role}
                            </Badge>
                            <Select
                              value={member.role}
                              onValueChange={(val) =>
                                updateTeamRole.mutate({
                                  campaignId,
                                  memberId: member._id,
                                  role: val,
                                })
                              }
                            >
                              <SelectTrigger className="w-[100px] h-8 text-xs rounded-lg border-border/60">
                                <SelectValue placeholder="Role" />
                              </SelectTrigger>
                              <SelectContent className="rounded-xl">
                                <SelectItem value="viewer">Viewer</SelectItem>
                                <SelectItem value="editor">Editor</SelectItem>
                              </SelectContent>
                            </Select>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-8 w-8 p-0 text-error-text hover:bg-error-light rounded-lg"
                              onClick={() =>
                                removeTeamMember.mutate({
                                  campaignId,
                                  memberId: member._id,
                                })
                              }
                              disabled={removeTeamMember.isPending}
                            >
                              <UserX className="w-4 h-4" strokeWidth={1.5} />
                            </Button>
                          </div>
                        </div>
                      );
                    },
                  )}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Shield className="w-10 h-10 text-ink-muted/40 mx-auto mb-3" strokeWidth={1.5} />
                  <p className="text-sm font-semibold text-ink">No team members yet</p>
                  <p className="text-xs text-ink-muted mt-1">
                    Invite colleagues to collaborate on this campaign.
                  </p>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="recommended" className="space-y-4 mt-6">
            {campaign?.status !== 'active' ? (
              <div className="text-center py-24 bg-card border border-border/60 rounded-2xl shadow-luxe">
                <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-muted-bg mx-auto">
                  <Compass className="w-9 h-9 text-ink-muted/40" strokeWidth={1.5} />
                </div>
                <p className="text-base font-serif font-semibold text-ink">
                  Campaign is not active
                </p>
                <p className="mt-2 text-sm text-ink-muted max-w-sm mx-auto leading-relaxed">
                  Publish this campaign to get AI-powered talent recommendations.
                </p>
              </div>
            ) : isLoadingRecs ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {Array.from({ length: 8 }).map((_, i) => (
                  <Skeleton key={i} className="aspect-[3/4] rounded-2xl" />
                ))}
              </div>
            ) : recsError ? (
              <Alert variant="destructive" className="rounded-xl border-error-muted">
                <AlertDescription>
                  {getApiErrorMessage(recsError, 'Failed to load recommendations')}
                </AlertDescription>
              </Alert>
            ) : (() => {
              const talentRecs = recResponse?.data;
              if (!talentRecs || talentRecs.length === 0) {
                return (
                  <div className="text-center py-24 bg-card border border-border/60 rounded-2xl shadow-luxe">
                    <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-muted-bg mx-auto">
                      <Sparkles className="w-9 h-9 text-ink-muted/40" strokeWidth={1.5} />
                    </div>
                    <p className="text-base font-serif font-semibold text-ink">
                      No strong matches yet
                    </p>
                    <p className="mt-2 text-sm text-ink-muted max-w-sm mx-auto leading-relaxed">
                      Try broadening your campaign requirements to find more matching talent.
                    </p>
                  </div>
                );
              }
              return (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {talentRecs.map((r) => {
                    const talent = r.talent as Record<string, unknown>;
                    return (
                      <TalentGridCard
                        key={r._id}
                        profile={{
                          _id: talent?._id as string,
                          user_id: talent?.user_id as string,
                          username: talent?.username as string,
                          full_legal_name: talent?.full_legal_name as string,
                          profile_photo: talent?.profile_photo as string,
                          location: talent?.location as Record<string, string>,
                          professions: talent?.professions as string[],
                          is_verified: true,
                        }}
                        matchScore={r.total_score}
                        onViewProfile={() =>
                          router.push("/talent/" + (talent?.username as string))
                        }
                        onInvite={() => handleInvite(talent?.user_id as string)}
                      />
                    );
                  })}
                </div>
              );
            })()}
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6 mt-6">
            {isLoadingAnalytics || isLoadingDemographics ? (
              <div className="space-y-6">
                <Skeleton className="h-64 rounded-2xl" />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Skeleton className="h-72 rounded-2xl" />
                  <Skeleton className="h-72 rounded-2xl" />
                </div>
              </div>
            ) : analyticsError || demographicsError ? (
              isFeatureForbidden(analyticsError) ? (
                <FeatureGateAlert {...isFeatureForbidden(analyticsError)!} />
              ) : isFeatureForbidden(demographicsError) ? (
                <FeatureGateAlert {...isFeatureForbidden(demographicsError)!} />
              ) : (
                <Alert variant="destructive" className="rounded-xl border-error-muted">
                  <AlertDescription>
                    {getApiErrorMessage(
                      analyticsError || demographicsError,
                      'Failed to load analytics',
                    )}
                  </AlertDescription>
                </Alert>
              )
            ) : (
              <>
                <div className="flex items-center gap-3 bg-card border border-border/60 rounded-2xl p-4 shadow-luxe flex-wrap">
                  <span className="text-sm font-semibold text-ink">Date range:</span>
                  <input
                    type="date"
                    value={analyticsFrom}
                    onChange={(e) => setAnalyticsFrom(e.target.value)}
                    className="h-9 rounded-xl text-sm px-3 bg-muted-bg/50 border border-border/60 text-ink"
                  />
                  <span className="text-xs text-ink-muted font-medium">to</span>
                  <input
                    type="date"
                    value={analyticsTo}
                    onChange={(e) => setAnalyticsTo(e.target.value)}
                    className="h-9 rounded-xl text-sm px-3 bg-muted-bg/50 border border-border/60 text-ink"
                  />
                  {(analyticsFrom || analyticsTo) && (
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-9 text-xs rounded-lg hover:bg-cream-soft font-medium"
                      onClick={() => {
                        setAnalyticsFrom('');
                        setAnalyticsTo('');
                      }}
                    >
                      Reset
                    </Button>
                  )}
                </div>

                <div className="bg-card border border-border/60 rounded-2xl p-6 shadow-luxe">
                  <div className="flex items-center gap-2.5 mb-6">
                    <div className="h-8 w-8 rounded-lg bg-indigo-50 flex items-center justify-center">
                      <BarChart3 className="w-4 h-4 text-indigo-500" strokeWidth={1.5} />
                    </div>
                    <h3 className="text-sm font-semibold text-ink">Applications Over Time</h3>
                  </div>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={analytics?.applications_over_time ?? []}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                        <XAxis dataKey="date" tick={{ fontSize: 12, fill: '#94a3b8' }} />
                        <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: '#94a3b8' }} />
                        <Tooltip />
                        <Line
                          type="monotone"
                          dataKey="count"
                          stroke={BAR_COLOR}
                          strokeWidth={2.5}
                          dot={false}
                          activeDot={{ r: 4, fill: BAR_COLOR }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div className="bg-card border border-border/60 rounded-2xl p-6 shadow-luxe">
                    <div className="flex items-center gap-2.5 mb-6">
                      <div className="h-8 w-8 rounded-lg bg-amber-50 flex items-center justify-center">
                        <PieChartIcon className="w-4 h-4 text-amber-500" strokeWidth={1.5} />
                      </div>
                      <h3 className="text-sm font-semibold text-ink">Status Breakdown</h3>
                    </div>
                    <div className="h-56">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={[
                              { name: 'Pending', value: analytics?.status_breakdown.pending ?? 0 },
                              { name: 'Accepted', value: analytics?.status_breakdown.accepted ?? 0 },
                              { name: 'Rejected', value: analytics?.status_breakdown.rejected ?? 0 },
                            ]}
                            cx="50%"
                            cy="50%"
                            innerRadius={55}
                            outerRadius={76}
                            paddingAngle={4}
                            dataKey="value"
                          >
                            {[
                              analytics?.status_breakdown.pending ?? 0,
                              analytics?.status_breakdown.accepted ?? 0,
                              analytics?.status_breakdown.rejected ?? 0,
                            ].map((_, index) => (
                              <Cell
                                key={`cell-${index}`}
                                fill={PIE_COLORS[index % PIE_COLORS.length]}
                              />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="flex justify-center gap-6 mt-3">
                      {['Pending', 'Accepted', 'Rejected'].map((label, i) => (
                        <div key={label} className="flex items-center gap-2">
                          <span
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: PIE_COLORS[i] }}
                          />
                          <span className="text-xs text-ink-muted font-medium">{label}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-card border border-border/60 rounded-2xl p-6 shadow-luxe">
                    <div className="flex items-center gap-2.5 mb-6">
                      <div className="h-8 w-8 rounded-lg bg-pink-50 flex items-center justify-center">
                        <BarChart3 className="w-4 h-4 text-pink-500" strokeWidth={1.5} />
                      </div>
                      <h3 className="text-sm font-semibold text-ink">Gender Distribution</h3>
                    </div>
                    <div className="h-56">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={Object.entries(demographics?.gender ?? {}).map(
                            ([name, count]) => ({
                              name: name.charAt(0).toUpperCase() + name.slice(1),
                              count,
                            }),
                          )}
                          margin={{ top: 5, right: 5, bottom: 5, left: -20 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                          <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#94a3b8' }} />
                          <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: '#94a3b8' }} />
                          <Tooltip />
                          <Bar dataKey="count" fill={BAR_COLOR} radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>

                {demographics?.professions && demographics.professions.length > 0 && (
                  <div className="bg-card border border-border/60 rounded-2xl p-6 shadow-luxe">
                    <div className="flex items-center gap-2.5 mb-6">
                      <div className="h-8 w-8 rounded-lg bg-teal-50 flex items-center justify-center">
                        <Briefcase className="w-4 h-4 text-teal-500" strokeWidth={1.5} />
                      </div>
                      <h3 className="text-sm font-semibold text-ink">Top Professions</h3>
                    </div>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={demographics.professions}
                          layout="vertical"
                          margin={{ top: 5, right: 5, bottom: 5, left: 20 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                          <XAxis type="number" allowDecimals={false} tick={{ fontSize: 12, fill: '#94a3b8' }} />
                          <YAxis
                            dataKey="name"
                            type="category"
                            tick={{ fontSize: 12, fill: '#64748b' }}
                            width={110}
                          />
                          <Tooltip />
                          <Bar dataKey="count" fill={BAR_COLOR} radius={[0, 4, 4, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                )}
              </>
            )}
          </TabsContent>

          <TabsContent value="submissions" className="space-y-4 mt-6">
            {!campaign?.task ? (
              <div className="text-center py-24 bg-card border border-border/60 rounded-2xl shadow-luxe">
                <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-muted-bg mx-auto">
                  <ClipboardList className="w-9 h-9 text-ink-muted/40" strokeWidth={1.5} />
                </div>
                <p className="text-base font-serif font-semibold text-ink">
                  No task configured
                </p>
                <p className="mt-2 text-sm text-ink-muted max-w-sm mx-auto leading-relaxed">
                  Add an assignment task in campaign settings to review talent submissions here.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-4 h-9 rounded-xl border-border/60 bg-card hover:bg-cream-soft text-sm font-medium"
                  onClick={() => router.push(`/recruiter/campaigns/${campaignId}/edit`)}
                >
                  <Pencil className="w-3.5 h-3.5 mr-1.5" strokeWidth={1.5} />
                  Edit Campaign
                </Button>
              </div>
            ) : (
              <TaskSubmissionsPanel
                campaignId={campaignId}
                onViewSubmission={handleViewSubmission}
              />
            )}

            {selectedSubmission && (
              <TaskSubmissionDetail
                submission={selectedSubmission}
                onClose={() => setSelectedSubmission(null)}
                onReview={handleReviewSubmission}
                onAccept={
                  selectedSubmission.application_id
                    ? handleAcceptFromSubmission
                    : undefined
                }
                onReject={
                  selectedSubmission.application_id
                    ? handleRejectFromSubmission
                    : undefined
                }
                isReviewing={reviewSubmission.isPending}
                isUpdatingStatus={updateStatus.isPending}
              />
            )}
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  );
}
