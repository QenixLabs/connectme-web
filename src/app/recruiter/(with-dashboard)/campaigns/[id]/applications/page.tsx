'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import {
  ArrowLeft,
  Mail,
  Clock,
  CheckCircle2,
  XCircle,
  User,
  Users,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
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
import { getApiErrorMessage } from '@/lib/formatters';
import { cn } from '@/lib/utils';

const STATUS_META: Record<
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

export default function CampaignApplicationsPage() {
  const params = useParams();
  const router = useRouter();
  const campaignId = params.id as string;

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

  const updateStatus = useUpdateApplicationStatus();

  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const handleStatusChange = async (appId: string, status: string) => {
    setUpdatingId(appId);
    try {
      await updateStatus.mutateAsync({ campaignId, applicationId: appId, status });
    } finally {
      setUpdatingId(null);
    }
  };

  const isLoading = isLoadingCampaign || isLoadingApps;
  const error = campaignError || appsError;

  if (isLoading) {
    return (
      <div className="max-w-[1280px] mx-auto w-full px-4 sm:px-6 py-8 pb-24 lg:pb-12 space-y-6">
        <Skeleton className="h-8 w-48 rounded-lg" />
        <Skeleton className="h-6 w-72 rounded-md" />
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-[1280px] mx-auto w-full px-4 sm:px-6 py-8">
        <Alert variant="destructive" className="rounded-xl border-error-muted">
          <AlertDescription>
            {getApiErrorMessage(error, 'Failed to load applications')}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="max-w-[1280px] mx-auto w-full px-4 sm:px-6 py-8 pb-24 lg:pb-12 flex flex-col gap-6">
      <Button
        variant="ghost"
        size="sm"
        className="w-fit -ml-2 text-ink-muted hover:text-ink group font-medium"
        onClick={() => router.push('/recruiter/campaigns')}
      >
        <ArrowLeft className="w-4 h-4 mr-1 transition-transform group-hover:-translate-x-0.5" strokeWidth={1.5} />
        Back to Campaigns
      </Button>

      <div>
        <h1 className="text-[26px] font-serif font-semibold text-ink tracking-tight">
          {campaign?.name ?? 'Applications'}
        </h1>
        <p className="mt-1.5 text-sm text-ink-muted">
          {applications?.length ?? 0} application{applications?.length !== 1 ? 's' : ''} received
        </p>
      </div>

      {applications && applications.length > 0 ? (
        <div className="space-y-3">
          {applications.map((app) => {
            const meta = STATUS_META[app.status] ?? STATUS_META.pending;
            const Icon = meta.icon;
            const talentEmail =
              typeof app.talent_id === 'object' && app.talent_id !== null
                ? app.talent_id.email
                : 'Unknown';

            return (
              <article
                key={app._id}
                className="bg-card border border-border/60 rounded-2xl p-5 shadow-luxe flex flex-col sm:flex-row sm:items-center gap-4 hover:shadow-luxe-lg transition-shadow"
              >
                <div className="flex-1 min-w-0 space-y-2">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center shrink-0">
                      <User className="w-4 h-4 text-slate-500" strokeWidth={1.5} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-ink truncate">
                        {talentEmail}
                      </p>
                      <p className="text-xs text-ink-muted font-medium mt-0.5">
                        Applied {new Date(app.created_at).toLocaleDateString('en-US', {
                          month: 'short', day: 'numeric', year: 'numeric',
                        })}
                      </p>
                    </div>
                  </div>

                  {app.message && (
                    <div className="flex items-start gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-ink-muted/60 mt-0.5 shrink-0" strokeWidth={1.5} />
                      <p className="text-sm text-ink-soft leading-relaxed line-clamp-2">
                        {app.message}
                      </p>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <Badge className={cn(
                    'rounded-full text-[10px] font-semibold px-2.5 py-0.5 border shrink-0',
                    meta.classes,
                  )}>
                    <Icon className="w-3 h-3 mr-1" strokeWidth={1.5} />
                    {meta.label}
                  </Badge>

                  <Select
                    value={app.status}
                    onValueChange={(val) => handleStatusChange(app._id, val)}
                    disabled={updateStatus.isPending && updatingId === app._id}
                  >
                    <SelectTrigger className="w-[140px] h-9 text-sm rounded-xl border-border/60 bg-card">
                      <SelectValue placeholder="Update status" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
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
        <div className="text-center py-24 bg-card border border-border/60 rounded-2xl shadow-luxe">
          <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-muted-bg mx-auto">
            <Users className="w-9 h-9 text-ink-muted/40" strokeWidth={1.5} />
          </div>
          <p className="text-base font-serif font-semibold text-ink">
            No applications yet
          </p>
          <p className="mt-2 text-sm text-ink-muted max-w-sm mx-auto leading-relaxed">
            Applications will appear here when talents apply to your campaign.
          </p>
        </div>
      )}
    </div>
  );
}
