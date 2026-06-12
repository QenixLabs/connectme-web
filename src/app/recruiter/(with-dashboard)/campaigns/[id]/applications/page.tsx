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
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { SectionHeader } from '@/components/ui/section-header';
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
      <div className="max-w-[1280px] mx-auto w-full px-4 py-6 pb-24 lg:pb-8 space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-6 w-72" />
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
      <div className="max-w-[1280px] mx-auto w-full px-4 py-6">
        <Alert variant="destructive">
          <AlertDescription>
            {getApiErrorMessage(error, 'Failed to load applications')}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

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

      <SectionHeader
        title={campaign?.name ?? 'Applications'}
        subtitle={`${applications?.length ?? 0} application${applications?.length !== 1 ? 's' : ''} received`}
      />

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
                className="bg-card border border-border rounded-2xl p-[18px] shadow-card flex flex-col sm:flex-row sm:items-center gap-4"
              >
                <div className="flex-1 min-w-0 space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-muted-bg flex items-center justify-center">
                      <User className="w-4 h-4 text-text-muted" strokeWidth={1.5} />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-text-primary">
                        {talentEmail}
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
                      <p className="text-sm text-text-secondary line-clamp-2">
                        {app.message}
                      </p>
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
          <User className="w-10 h-10 text-text-muted mx-auto mb-3" strokeWidth={1.5} />
          <p className="text-sm text-text-muted mb-1">No applications yet</p>
          <p className="text-xs text-text-muted">
            Applications will appear here when talents apply.
          </p>
        </div>
      )}
    </div>
  );
}
