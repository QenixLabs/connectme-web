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
} from '@/lib/api/hooks/useCampaignApplications';
import { useCampaign } from '@/lib/api/hooks/useCampaign';
import {
  useCampaignInvites,
  useCampaignAnalytics,
  useCampaignDemographics,
} from '@/lib/api';
import { campaignApi } from '@/lib/api/campaign';
import { getApiErrorMessage } from '@/lib/formatters';
import { cn } from '@/lib/utils';
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

  const {
    data: analytics,
    isLoading: isLoadingAnalytics,
    error: analyticsError,
  } = useCampaignAnalytics(campaignId);

  const {
    data: demographics,
    isLoading: isLoadingDemographics,
    error: demographicsError,
  } = useCampaignDemographics(campaignId);

  const updateStatus = useUpdateApplicationStatus();

  const handleStatusChange = async (appId: string, status: string) => {
    setUpdatingId(appId);
    try {
      await updateStatus.mutateAsync({ campaignId, applicationId: appId, status });
    } finally {
      setUpdatingId(null);
    }
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
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push(`/recruiter/campaigns/${campaignId}/edit`)}
          >
            <Pencil className="w-3.5 h-3.5 mr-1.5" strokeWidth={1.5} />
            Edit
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
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="applicants">Applicants ({totalApplicants})</TabsTrigger>
          <TabsTrigger value="invites">Invites ({invites?.length ?? 0})</TabsTrigger>
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
              {applications.map((app) => {
                const meta = APP_STATUS_META[app.status] ?? APP_STATUS_META.pending;
                const Icon = meta.icon;
                const talent =
                  typeof app.talent_id === 'object' && app.talent_id !== null
                    ? app.talent_id
                    : null;

                return (
                  <article
                    key={app._id}
                    className="bg-card border border-border rounded-2xl p-[18px] shadow-[0_1px_3px_rgba(0,0,0,0.07),0_4px_12px_rgba(0,0,0,0.04)] flex flex-col sm:flex-row sm:items-center gap-4"
                  >
                    <div className="flex-1 min-w-0 space-y-2">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-muted-bg flex items-center justify-center">
                          <User className="w-4 h-4 text-text-muted" strokeWidth={1.5} />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-text-primary">
                            {talent?.full_legal_name || talent?.email || 'Unknown'}
                          </p>
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
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <Badge className={cn('shrink-0', meta.classes)}>
                        <Icon className="w-3 h-3 mr-1" strokeWidth={1.5} />
                        {meta.label}
                      </Badge>
                      <Select
                        value={app.status}
                        onValueChange={(val) => handleStatusChange(app._id, val)}
                        disabled={updateStatus.isPending && updatingId === app._id}
                      >
                        <SelectTrigger className="w-[140px] h-9 text-sm">
                          <SelectValue placeholder="Update status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="accepted">Accepted</SelectItem>
                          <SelectItem value="rejected">Rejected</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </article>
                );
              })}
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
              <div className="bg-card border border-border rounded-2xl p-4 sm:p-6">
                <h3 className="text-sm font-semibold text-text-primary mb-4">Applications Over Time (30 days)</h3>
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
