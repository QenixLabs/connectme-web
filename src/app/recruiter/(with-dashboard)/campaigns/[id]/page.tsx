'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';
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
  CheckCheck,
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
  UserCog,
  UserX,
  Pin,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { SectionHeader } from '@/components/ui/section-header';
import { StatCard } from '@/components/ui/stat-card';
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
} from '@/lib/api';
import { campaignApi } from '@/lib/api/campaign';
import { getApiErrorMessage } from '@/lib/formatters';
import { usePublishCampaign, useCloseCampaign, useReopenCampaign, useCloneCampaign, useUploadCampaignMedia, useDeleteCampaignMedia } from '@/lib/api/hooks/useCampaigns';
import { useUpdateCampaign } from '@/lib/api/hooks/useUpdateCampaign';
import { useBulkUpdateApplicationStatus } from '@/lib/api/hooks/useCampaignApplications';
import {
  useCampaignTeam,
  useInviteTeamMember,
  useUpdateTeamMemberRole,
  useRemoveTeamMember,
} from '@/lib/api/hooks/useCampaignTeam';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { useTierGuard } from '@/hooks/use-tier-guard';
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
    classes: 'bg-warning-light text-warning-text border-warning-muted',
  },
  accepted: {
    label: 'Accepted',
    icon: CheckCircle2,
    classes: 'bg-success-light text-success-text border-success-muted',
  },
  rejected: {
    label: 'Rejected',
    icon: XCircle,
    classes: 'bg-error-light text-error-text border-error-muted',
  },
};

const INVITE_STATUS_META: Record<
  string,
  { label: string; icon: typeof Clock; classes: string }
> = {
  pending: {
    label: 'Pending',
    icon: Clock,
    classes: 'bg-warning-light text-warning-text border-warning-muted',
  },
  accepted: {
    label: 'Accepted',
    icon: CheckCircle2,
    classes: 'bg-success-light text-success-text border-success-muted',
  },
  declined: {
    label: 'Declined',
    icon: Ban,
    classes: 'bg-error-light text-error-text border-error-muted',
  },
};

const PIE_COLORS = ['#f59e0b', '#22c55e', '#ef4444'];
const BAR_COLOR = '#4f6ef7';

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
  const { guard } = useTierGuard(3);
  const updateCampaign = useUpdateCampaign();

  const {
    data: campaign,
    isLoading: isLoadingCampaign,
    error: campaignError,
  } = useCampaign(campaignId);

  const {
    data: applications,
    isLoading: isLoadingApps,
    error: appsError,
  } = useCampaignApplications(campaignId);

  const {
    data: invites,
    isLoading: isLoadingInvites,
    error: invitesError,
  } = useCampaignInvites(campaignId);

  const analyticsRange = analyticsFrom || analyticsTo
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
  const deleteMedia = useDeleteCampaignMedia();
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const addToShortlist = useAddToShortlist();
  const removeFromShortlist = useRemoveFromShortlist();
  const upsertNote = useUpsertApplicantNote();
  const deleteNote = useDeleteApplicantNote();

  const { data: teamData, isLoading: isLoadingTeam, error: teamError } = useCampaignTeam(campaignId);
  const inviteTeamMember = useInviteTeamMember();
  const updateTeamRole = useUpdateTeamMemberRole();
  const removeTeamMember = useRemoveTeamMember();

  const [noteAppId, setNoteAppId] = useState<string | null>(null);
  const [noteText, setNoteText] = useState('');
  const [noteRating, setNoteRating] = useState(0);

  const handleStatusChange = async (appId: string, status: string) => {
    setUpdatingId(appId);
    try {
      await updateStatus.mutateAsync({ campaignId, applicationId: appId, status });
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
    } catch {
      // ignore
    }
  };

  const isLoading = isLoadingCampaign;
  const error = campaignError;

  if (isLoading) {
    return (
      <div className="max-w-[1280px] mx-auto w-full px-4 py-6 pb-24 lg:pb-8 space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-6 w-72" />
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-64 rounded-xl" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-[1280px] mx-auto w-full px-4 py-6">
        <Alert variant="destructive">
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
    <div className="max-w-[1280px] mx-auto w-full px-4 py-6 pb-24 lg:pb-8 flex flex-col gap-5">
      <Button
        variant="ghost"
        size="sm"
        className="w-fit -ml-2 text-text-secondary"
        onClick={() => router.push('/recruiter/campaigns')}
      >
        <ArrowLeft className="w-4 h-4 mr-1" strokeWidth={1.5} />
        Back to Campaigns
      </Button>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-xl font-bold text-text-primary">{campaign?.name}</h1>
            <Badge variant="secondary" className="text-2xs capitalize">
              {campaign?.status}
            </Badge>
            <Badge variant="outline" className="text-2xs">
              {campaign?.visibility === 'invite_only' ? 'Invite Only' : 'Public'}
            </Badge>
          </div>
          {campaign?.deadline && (
            <p className="text-xs text-text-muted mt-1">
              Deadline: {new Date(campaign.deadline).toLocaleDateString()}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {campaign?.status === 'draft' && (
            <Button
              variant="outline"
              size="sm"
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
              onClick={() => guard(() => closeCampaign.mutate(campaignId))}
              disabled={closeCampaign.isPending}
            >
              Close
            </Button>
          )}
          {campaign?.status === 'closed' && (
            <Button
              variant="outline"
              size="sm"
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
            onClick={() => guard(() => cloneCampaign.mutate(campaignId))}
            disabled={cloneCampaign.isPending}
          >
            <Copy className="w-3.5 h-3.5 mr-1.5" strokeWidth={1.5} />
            Clone
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => guard(() => router.push(`/recruiter/campaigns/${campaignId}/edit`))}
          >
            <Pencil className="w-3.5 h-3.5 mr-1.5" strokeWidth={1.5} />
            Edit
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              const url = `${window.location.origin}/talent/opportunities/${campaignId}`;
              navigator.clipboard.writeText(url);
            }}
          >
            <Link2 className="w-3.5 h-3.5 mr-1.5" strokeWidth={1.5} />
            Copy Link
          </Button>
          <Button variant="outline" size="sm" onClick={handleExport}>
            <Download className="w-3.5 h-3.5 mr-1.5" strokeWidth={1.5} />
            Export
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <StatCard label="Total Applicants" value={totalApplicants} align="left" />
        <StatCard label="Pending Invites" value={pendingInvites} align="left" />
        <StatCard label="Accepted Invites" value={acceptedInvites} align="left" />
        <StatCard label="Declined Invites" value={declinedInvites} align="left" />
        <StatCard label="Response Rate" value={`${Math.round(responseRate * 100)}%`} align="left" />
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="applicants">Applicants ({totalApplicants})</TabsTrigger>
          <TabsTrigger value="invites">Invites ({invites?.length ?? 0})</TabsTrigger>
          <TabsTrigger value="media">Media ({campaign?.media?.length ?? 0})</TabsTrigger>
          <TabsTrigger value="team">Team</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="applicants" className="space-y-3">
          {isLoadingApps ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-24 rounded-xl" />
              ))}
            </div>
          ) : appsError ? (
            <Alert variant="destructive">
              <AlertDescription>{getApiErrorMessage(appsError, 'Failed to load applications')}</AlertDescription>
            </Alert>
          ) : applications && applications.length > 0 ? (
            <div className="space-y-3">
              <div className="flex items-center gap-2"
              >
                <button
                  onClick={() => setShowShortlistedOnly(false)}
                  className={cn(
                    "px-3 py-1.5 rounded-full text-xs font-medium border transition-colors",
                    !showShortlistedOnly
                      ? "bg-brand text-white border-brand"
                      : "bg-card text-text-secondary border-border hover:border-brand hover:text-brand"
                  )}
                >
                  All
                </button>
                <button
                  onClick={() => setShowShortlistedOnly(true)}
                  className={cn(
                    "px-3 py-1.5 rounded-full text-xs font-medium border transition-colors",
                    showShortlistedOnly
                      ? "bg-brand text-white border-brand"
                      : "bg-card text-text-secondary border-border hover:border-brand hover:text-brand"
                  )}
                >
                  Shortlisted
                </button>
              </div>
              {selectedApps.size > 0 && (
                <div className="flex items-center justify-between gap-3 bg-card border border-border rounded-xl p-3">
                  <span className="text-sm text-text-secondary">
                    {selectedApps.size} selected
                  </span>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleBulkUpdate('accepted')}
                      disabled={bulkUpdateStatus.isPending}
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 mr-1" strokeWidth={1.5} />
                      Accept
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-error-text hover:bg-error-light"
                      onClick={() => handleBulkUpdate('rejected')}
                      disabled={bulkUpdateStatus.isPending}
                    >
                      <XCircle className="w-3.5 h-3.5 mr-1" strokeWidth={1.5} />
                      Reject
                    </Button>
                  </div>
                </div>
              )}
              {applications.filter((app) => !showShortlistedOnly || app.is_shortlisted).map((app) => {
                const meta = APP_STATUS_META[app.status] ?? APP_STATUS_META.pending;
                const Icon = meta.icon;
                const talent =
                  typeof app.talent_id === 'object' && app.talent_id !== null
                    ? app.talent_id
                    : null;
                const isSelected = selectedApps.has(app._id);
                const isEditingNote = noteAppId === app._id;
                const note = app.note;

                return (
                  <article
                    key={app._id}
                    className={cn(
                      "bg-card border rounded-2xl p-[18px] shadow-[0_1px_3px_rgba(0,0,0,0.07),0_4px_12px_rgba(0,0,0,0.04)] flex flex-col gap-4",
                      isSelected ? "border-brand" : "border-border",
                    )}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                      <div className="flex-1 min-w-0 space-y-2">
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleAppSelection(app._id)}
                            className="w-4 h-4 rounded border-border text-brand focus:ring-brand"
                          />
                          <div className="w-8 h-8 rounded-full bg-muted-bg flex items-center justify-center">
                            <User className="w-4 h-4 text-text-muted" strokeWidth={1.5} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <p className="text-sm font-medium text-text-primary">
                                {talent?.full_legal_name || talent?.email || 'Unknown'}
                              </p>
                              {app.is_shortlisted && (
                                <Badge variant="outline" className="text-2xs text-brand border-brand-muted bg-brand-light">
                                  <BookmarkCheck className="w-3 h-3 mr-0.5" strokeWidth={1.5} />
                                  Shortlisted
                                </Badge>
                              )}
                            </div>
                            <p className="text-xs text-text-muted">
                              {new Date(app.created_at).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric',
                              })}
                            </p>
                          </div>
                        </div>
                        {app.message && (
                          <div className="flex items-start gap-1.5">
                            <Mail className="w-3.5 h-3.5 text-text-muted mt-0.5 shrink-0" strokeWidth={1.5} />
                            <p className="text-sm text-text-secondary line-clamp-2">{app.message}</p>
                          </div>
                        )}
                        {app.answers && app.answers.length > 0 && (
                          <div className="space-y-1 mt-1">
                            {app.answers.map((ans: { question_id: string; question_text: string; answer: string }) => (
                              <div key={ans.question_id} className="text-xs text-text-secondary">
                                <span className="font-medium text-text-primary">{ans.question_text}:</span>{' '}
                                {ans.answer}
                              </div>
                            ))}
                          </div>
                        )}
                        {note && !isEditingNote && (
                          <div className="space-y-1.5 pt-1">
                            {(() => {
                              const r = note.rating;
                              if (r == null || r <= 0) return null;
                              return (
                                <div className="flex items-center gap-0.5">
                                  {Array.from({ length: 5 }).map((_, i) => (
                                    <Star
                                      key={i}
                                      className={cn(
                                        "w-3.5 h-3.5",
                                        i < r ? "fill-amber-400 text-amber-400" : "text-text-muted"
                                      )}
                                      strokeWidth={1.5}
                                    />
                                  ))}
                                </div>
                              );
                            })()}
                            {note.note_text && (
                              <div className="flex items-start gap-1.5">
                                <MessageSquare className="w-3.5 h-3.5 text-text-muted mt-0.5 shrink-0" strokeWidth={1.5} />
                                <p className="text-xs text-text-secondary">{note.note_text}</p>
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-2 shrink-0 flex-wrap">
                        <Badge className={cn('shrink-0', meta.classes)}>
                          <Icon className="w-3 h-3 mr-1" strokeWidth={1.5} />
                          {meta.label}
                        </Badge>
                        <Select
                          value={app.status}
                          onValueChange={(val) => handleStatusChange(app._id, val)}
                          disabled={updateStatus.isPending && updatingId === app._id}
                        >
                          <SelectTrigger className="w-[130px] h-9 text-sm">
                            <SelectValue placeholder="Update status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="accepted">Accepted</SelectItem>
                            <SelectItem value="rejected">Rejected</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {/* Actions row */}
                    <div className="flex items-center gap-2 pt-2 border-t border-border-subtle">
                      <Button
                        size="sm"
                        variant={app.is_shortlisted ? "default" : "outline"}
                        className="h-8 text-xs"
                        onClick={() => {
                          if (app.is_shortlisted) {
                            removeFromShortlist.mutate({ campaignId, applicationId: app._id });
                          } else {
                            addToShortlist.mutate({ campaignId, applicationId: app._id });
                          }
                        }}
                        disabled={addToShortlist.isPending || removeFromShortlist.isPending}
                      >
                        {app.is_shortlisted ? (
                          <BookmarkCheck className="w-3.5 h-3.5 mr-1" strokeWidth={1.5} />
                        ) : (
                          <Bookmark className="w-3.5 h-3.5 mr-1" strokeWidth={1.5} />
                        )}
                        {app.is_shortlisted ? 'Shortlisted' : 'Shortlist'}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-8 text-xs"
                        onClick={() => {
                          if (isEditingNote) {
                            setNoteAppId(null);
                            setNoteText('');
                            setNoteRating(0);
                          } else {
                            setNoteAppId(app._id);
                            setNoteText(note?.note_text || '');
                            setNoteRating(note?.rating || 0);
                          }
                        }}
                      >
                        <MessageSquare className="w-3.5 h-3.5 mr-1" strokeWidth={1.5} />
                        {isEditingNote ? 'Cancel' : note ? 'Edit Note' : 'Add Note'}
                      </Button>
                    </div>

                    {isEditingNote && (
                      <div className="space-y-3 bg-muted-bg rounded-xl p-3">
                        <div className="flex items-center gap-1">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <button
                              key={i}
                              onClick={() => setNoteRating(i + 1)}
                              className="p-0.5"
                            >
                              <Star
                                className={cn(
                                  "w-5 h-5",
                                  i < noteRating ? "fill-amber-400 text-amber-400" : "text-text-muted"
                                )}
                                strokeWidth={1.5}
                              />
                            </button>
                          ))}
                        </div>
                        <Textarea
                          value={noteText}
                          onChange={(e) => setNoteText(e.target.value)}
                          placeholder="Write a note about this applicant..."
                          rows={3}
                          className="resize-none text-sm bg-card"
                        />
                        <div className="flex items-center justify-end gap-2">
                          {note && (
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-8 text-xs text-error-text"
                              onClick={() => {
                                deleteNote.mutate({ campaignId, applicationId: app._id }, {
                                  onSuccess: () => setNoteAppId(null),
                                });
                              }}
                              disabled={deleteNote.isPending}
                            >
                              <Trash2 className="w-3.5 h-3.5 mr-1" strokeWidth={1.5} />
                              Delete
                            </Button>
                          )}
                          <Button
                            size="sm"
                            className="h-8 text-xs"
                            onClick={() => {
                              upsertNote.mutate({
                                campaignId,
                                applicationId: app._id,
                                payload: { note_text: noteText, rating: noteRating || undefined },
                              }, {
                                onSuccess: () => {
                                  setNoteAppId(null);
                                  setNoteText('');
                                  setNoteRating(0);
                                },
                              });
                            }}
                            disabled={upsertNote.isPending}
                          >
                            Save Note
                          </Button>
                        </div>
                      </div>
                    )}
                  </article>
                );
              })}
              {applications.filter((app) => !showShortlistedOnly || app.is_shortlisted).length === 0 && (
                <div className="text-center py-12 bg-card border border-border rounded-2xl"
                >
                  <p className="text-sm text-text-muted"
                  >
                    {showShortlistedOnly ? 'No shortlisted applications yet.' : 'No applications yet.'}
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-20 bg-card border border-border rounded-2xl">
              <Users className="w-10 h-10 text-text-muted mx-auto mb-3" strokeWidth={1.5} />
              <p className="text-sm text-text-muted">No applications yet</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="invites" className="space-y-3">
          {isLoadingInvites ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-20 rounded-xl" />
              ))}
            </div>
          ) : invitesError ? (
            <Alert variant="destructive">
              <AlertDescription>{getApiErrorMessage(invitesError, 'Failed to load invites')}</AlertDescription>
            </Alert>
          ) : invites && invites.length > 0 ? (
            <div className="space-y-3">
              {invites.map((invite) => {
                const meta = INVITE_STATUS_META[invite.status] ?? INVITE_STATUS_META.pending;
                const Icon = meta.icon;
                const talent =
                  typeof invite.talent_id === 'object' && invite.talent_id !== null
                    ? invite.talent_id
                    : null;

                return (
                  <article
                    key={invite._id}
                    className="bg-card border border-border rounded-2xl p-[18px] shadow-[0_1px_3px_rgba(0,0,0,0.07),0_4px_12px_rgba(0,0,0,0.04)] flex flex-col sm:flex-row sm:items-center gap-4"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-muted-bg flex items-center justify-center">
                          <User className="w-4 h-4 text-text-muted" strokeWidth={1.5} />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-text-primary">
                            {talent?.full_legal_name || talent?.email || 'Unknown'}
                          </p>
                          <p className="text-xs text-text-muted">
                            {new Date(invite.created_at).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            })}
                          </p>
                        </div>
                      </div>
                    </div>
                    <Badge className={cn('shrink-0', meta.classes)}>
                      <Icon className="w-3 h-3 mr-1" strokeWidth={1.5} />
                      {meta.label}
                    </Badge>
                  </article>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-20 bg-card border border-border rounded-2xl">
              <Send className="w-10 h-10 text-text-muted mx-auto mb-3" strokeWidth={1.5} />
              <p className="text-sm text-text-muted">No invites sent yet</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="media" className="space-y-4">
          <div className="flex items-center gap-3">
            <input
              type="file"
              accept="image/*,video/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (!file || !campaignId) return;
                const formData = new FormData();
                formData.append('file', file);
                uploadMedia.mutate({ campaignId, formData });
                e.target.value = '';
              }}
              className="hidden"
              id="media-upload"
            />
            <label htmlFor="media-upload">
              <Button variant="outline" size="sm" className="cursor-pointer" asChild>
                <span>Upload Media</span>
              </Button>
            </label>
          </div>

          {campaign?.media && campaign.media.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {campaign.media.map((item, idx) => {
                const isPinned = campaign.cover_image_url === item.url;
                return (
                  <div
                    key={idx}
                    className={cn(
                      "relative rounded-xl overflow-hidden aspect-square group",
                      isPinned ? "border-2 border-brand ring-1 ring-brand" : "border border-border"
                    )}
                  >
                    {item.type === 'video' ? (
                      <video src={item.url} className="w-full h-full object-cover" controls />
                    ) : (
                      <img src={item.url} alt={item.caption || ''} className="w-full h-full object-cover" />
                    )}
                    <div className="absolute top-2 right-2 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      {!isPinned && (
                        <button
                          onClick={() =>
                            updateCampaign.mutate({
                              id: campaignId,
                              payload: { cover_image_url: item.url },
                            })
                          }
                          disabled={updateCampaign.isPending}
                          className="p-1.5 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
                          title="Pin as cover"
                        >
                          <Pin className="w-3.5 h-3.5" strokeWidth={1.5} />
                        </button>
                      )}
                      <button
                        onClick={() => deleteMedia.mutate({ campaignId, url: item.url })}
                        className="p-1.5 rounded-full bg-black/50 text-white hover:bg-black/70"
                      >
                        <Trash2 className="w-3.5 h-3.5" strokeWidth={1.5} />
                      </button>
                    </div>
                    {isPinned && (
                      <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-brand text-white text-[10px] font-semibold">
                        Pinned
                      </span>
                    )}
                    {item.caption && (
                      <p className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-[11px] px-2 py-1 truncate">
                        {item.caption}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-16 bg-card border border-border rounded-2xl">
              <p className="text-sm text-text-muted">No media yet</p>
              <p className="text-xs text-text-muted mt-1">Upload images or videos to showcase this campaign.</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="team" className="space-y-4">
          <div className="bg-card border border-border rounded-2xl p-4 space-y-4">
            <div className="flex items-center gap-3">
              <Input
                placeholder="Email address..."
                value={teamInviteEmail}
                onChange={(e) => setTeamInviteEmail(e.target.value)}
                className="h-10 text-sm flex-1"
              />
              <Select value={teamInviteRole} onValueChange={setTeamInviteRole}>
                <SelectTrigger className="w-[130px] h-10 text-sm">
                  <SelectValue placeholder="Role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="viewer">Viewer</SelectItem>
                  <SelectItem value="editor">Editor</SelectItem>
                </SelectContent>
              </Select>
              <Button
                size="sm"
                className="h-10 text-xs"
                onClick={() => {
                  if (!teamInviteEmail.trim()) return;
                  guard(() => inviteTeamMember.mutate(
                    { campaignId, email: teamInviteEmail.trim(), role: teamInviteRole },
                    {
                      onSuccess: () => {
                        setTeamInviteEmail('');
                        setTeamInviteRole('viewer');
                      },
                    }
                  ));
                }}
                disabled={inviteTeamMember.isPending || !teamInviteEmail.trim()}
              >
                <UserPlus className="w-3.5 h-3.5 mr-1" strokeWidth={1.5} />
                Invite
              </Button>
            </div>

            {isLoadingTeam ? (
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-16 rounded-xl" />
                ))}
              </div>
            ) : teamError ? (
              <Alert variant="destructive">
                <AlertDescription>{getApiErrorMessage(teamError, 'Failed to load team')}</AlertDescription>
              </Alert>
            ) : teamData?.members && teamData.members.length > 0 ? (
              <div className="space-y-2">
                {teamData.members.map((member: { _id: string; user_id: { full_legal_name?: string; email?: string } | null; role: string }) => {
                  const user = member.user_id;
                  const displayName = user?.full_legal_name || user?.email || 'Unknown';
                  return (
                    <div
                      key={member._id}
                      className="flex items-center justify-between gap-3 bg-page border border-border rounded-xl p-3"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-muted-bg flex items-center justify-center">
                          <User className="w-4 h-4 text-text-muted" strokeWidth={1.5} />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-text-primary">{displayName}</p>
                          <p className="text-xs text-text-muted">{user?.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-2xs capitalize">
                          {member.role}
                        </Badge>
                        <Select
                          value={member.role}
                          onValueChange={(val) =>
                            updateTeamRole.mutate({ campaignId, memberId: member._id, role: val })
                          }
                        >
                          <SelectTrigger className="w-[100px] h-8 text-xs">
                            <SelectValue placeholder="Role" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="viewer">Viewer</SelectItem>
                            <SelectItem value="editor">Editor</SelectItem>
                          </SelectContent>
                        </Select>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 w-8 p-0 text-error-text"
                          onClick={() => removeTeamMember.mutate({ campaignId, memberId: member._id })}
                          disabled={removeTeamMember.isPending}
                        >
                          <UserX className="w-4 h-4" strokeWidth={1.5} />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12">
                <Shield className="w-8 h-8 text-text-muted mx-auto mb-2" strokeWidth={1.5} />
                <p className="text-sm text-text-muted">No team members yet</p>
                <p className="text-xs text-text-muted mt-1">Invite colleagues to collaborate on this campaign.</p>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          {isLoadingAnalytics || isLoadingDemographics ? (
            <div className="space-y-6">
              <Skeleton className="h-64 rounded-xl" />
              <Skeleton className="h-64 rounded-xl" />
            </div>
          ) : analyticsError || demographicsError ? (
            <Alert variant="destructive">
              <AlertDescription>{getApiErrorMessage(analyticsError || demographicsError, 'Failed to load analytics')}</AlertDescription>
            </Alert>
          ) : (
            <>
              <div className="flex items-center gap-3 bg-card border border-border rounded-xl p-3">
                <span className="text-sm text-text-secondary">Date range:</span>
                <input
                  type="date"
                  value={analyticsFrom}
                  onChange={(e) => setAnalyticsFrom(e.target.value)}
                  className="h-9 rounded-lg text-xs px-3 bg-page border border-border"
                />
                <span className="text-xs text-text-muted">to</span>
                <input
                  type="date"
                  value={analyticsTo}
                  onChange={(e) => setAnalyticsTo(e.target.value)}
                  className="h-9 rounded-lg text-xs px-3 bg-page border border-border"
                />
                {(analyticsFrom || analyticsTo) && (
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-8 text-xs"
                    onClick={() => { setAnalyticsFrom(''); setAnalyticsTo(''); }}
                  >
                    Reset
                  </Button>
                )}
              </div>

              <div className="bg-card border border-border rounded-2xl p-4 sm:p-6">
                <h3 className="text-sm font-semibold text-text-primary mb-4">Applications Over Time</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={analytics?.applications_over_time ?? []}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                      <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                      <Tooltip />
                      <Line type="monotone" dataKey="count" stroke={BAR_COLOR} strokeWidth={2} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-card border border-border rounded-2xl p-4 sm:p-6">
                  <h3 className="text-sm font-semibold text-text-primary mb-4">Application Status Breakdown</h3>
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
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {[
                            analytics?.status_breakdown.pending ?? 0,
                            analytics?.status_breakdown.accepted ?? 0,
                            analytics?.status_breakdown.rejected ?? 0,
                          ].map((_, index) => (
                            <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="flex justify-center gap-4 mt-2">
                    {['Pending', 'Accepted', 'Rejected'].map((label, i) => (
                      <div key={label} className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: PIE_COLORS[i] }} />
                        <span className="text-xs text-text-secondary">{label}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-card border border-border rounded-2xl p-4 sm:p-6">
                  <h3 className="text-sm font-semibold text-text-primary mb-4">Gender Distribution</h3>
                  <div className="h-56">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={Object.entries(demographics?.gender ?? {}).map(([name, count]) => ({
                          name: name.charAt(0).toUpperCase() + name.slice(1),
                          count,
                        }))}
                        margin={{ top: 5, right: 5, bottom: 5, left: -20 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                        <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                        <Tooltip />
                        <Bar dataKey="count" fill={BAR_COLOR} radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              {demographics?.professions && demographics.professions.length > 0 && (
                <div className="bg-card border border-border rounded-2xl p-4 sm:p-6">
                  <h3 className="text-sm font-semibold text-text-primary mb-4">Top Professions</h3>
                  <div className="h-56">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={demographics.professions}
                        layout="vertical"
                        margin={{ top: 5, right: 5, bottom: 5, left: 20 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis type="number" allowDecimals={false} tick={{ fontSize: 12 }} />
                        <YAxis dataKey="name" type="category" tick={{ fontSize: 12 }} width={100} />
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
      </Tabs>
    </div>
  );
}
