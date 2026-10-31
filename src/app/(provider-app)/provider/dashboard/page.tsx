"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import {
  AlertCircle,
  ArrowRight,
  BarChart3,
  Briefcase,
  CheckCircle2,
  Eye,
  Image as ImageIcon,
  MapPin,
  MessageSquare,
  Plus,
  Sparkles,
} from "lucide-react";
import { providersApi, servicesApi } from "@/lib/api/marketplace";
import { serviceInquiriesApi } from "@/lib/api/inquiries";
import { getApiErrorMessage } from "@/lib/api/client";
import { queryKeys } from "@/lib/api/query-keys";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

export default function ProviderDashboardPage() {
  const profileQuery = useQuery({
    queryKey: queryKeys.provider.me(),
    queryFn: providersApi.getMyProfile,
  });
  const servicesQuery = useQuery({
    queryKey: queryKeys.services.mine({ limit: 50 }),
    queryFn: () => servicesApi.getMine({ limit: 50 }),
  });
  const inquiriesQuery = useQuery({
    queryKey: queryKeys.serviceInquiries.incoming({ page: 1, limit: 5 }),
    queryFn: () => serviceInquiriesApi.getIncoming({ page: 1, limit: 5 }),
  });

  if (profileQuery.isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-64" />
        <div className="grid gap-4 sm:grid-cols-3">
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32 sm:col-span-3" />
        </div>
        <Skeleton className="h-64" />
      </div>
    );
  }

  if (profileQuery.isError) {
    const status = (profileQuery.error as { response?: { status?: number } })?.response?.status;
    return (
      <Card className="border-dashed">
        <CardHeader>
          <CardTitle>Provider profile not found</CardTitle>
          <CardDescription>
            {status === 404
              ? "Activate provider access and complete onboarding to start listing services."
              : getApiErrorMessage(profileQuery.error, "Could not load your provider profile.")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild>
            <Link href="/provider/onboarding">Go to onboarding</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  const profile = profileQuery.data?.profile;
  const services = servicesQuery.data?.data ?? [];
  const published = services.filter((service) => service.status === "published");
  const drafts = services.filter((service) => service.status === "draft");
  const inquiries = inquiriesQuery.data?.data ?? [];
  const profileChecks = [
    Boolean(profile?.display_name || profile?.business_name),
    Boolean(profile?.about),
    Boolean(profile?.categories?.length),
    Boolean(profile?.service_areas?.length),
    Boolean(profile?.profile_photo),
    Boolean(profile?.portfolio?.length),
  ];
  const completedProfileChecks = profileChecks.filter(Boolean).length;
  const completion = Math.round(
    (completedProfileChecks / profileChecks.length) * 100,
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">Provider studio</p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight">
            {profile?.display_name || profile?.business_name || "Your studio"}
          </h1>
          <p className="mt-1 text-muted-foreground">
            Your services, client inquiries, and profile health at a glance.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {profile?.slug && (
            <Button variant="outline" asChild>
              <Link href={`/providers/${profile.slug}`} target="_blank" rel="noreferrer">
                <Eye className="size-4" />
                View public profile
              </Link>
            </Button>
          )}
          <Button asChild>
            <Link href="/provider/services">
              <Plus className="size-4" />
              Add a service
            </Link>
          </Button>
        </div>
      </div>

      {profile && !profile.onboarding_completed && (
        <Card className="border-amber-300 bg-amber-50 dark:bg-amber-950/20">
          <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <AlertCircle className="mt-0.5 size-5 text-amber-600" />
              <div>
                <p className="font-semibold">Finish onboarding to publish services</p>
                <p className="text-sm text-muted-foreground">
                  Add your display name and complete the onboarding step before publishing.
                </p>
              </div>
            </div>
            <Button asChild variant="outline">
              <Link href="/provider/onboarding">Complete onboarding</Link>
            </Button>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          icon={Briefcase}
          label="Total services"
          value={servicesQuery.data?.total ?? services.length}
          hint={`${drafts.length} in draft`}
        />
        <MetricCard
          icon={CheckCircle2}
          label="Published"
          value={published.length}
          hint="Visible in the marketplace"
        />
        <MetricCard
          icon={MessageSquare}
          label="Incoming inquiries"
          value={inquiriesQuery.data?.total ?? 0}
          hint="Requests from potential clients"
        />
        <MetricCard
          icon={BarChart3}
          label="Profile strength"
          value={`${completion}%`}
          hint={`${completedProfileChecks} of ${profileChecks.length} profile essentials`}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <Card className="overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between gap-3">
            <div>
              <CardTitle>Recent inquiries</CardTitle>
              <CardDescription>New client requests to review and respond to.</CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/provider/inquiries">
                View inbox <ArrowRight className="size-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {inquiriesQuery.isLoading ? (
              <div className="space-y-3">
                <Skeleton className="h-16" />
                <Skeleton className="h-16" />
                <Skeleton className="h-16" />
              </div>
            ) : inquiriesQuery.isError ? (
              <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-4">
                <p role="alert" className="text-sm text-destructive">
                  {getApiErrorMessage(inquiriesQuery.error, "Could not load your inquiries.")}
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-3"
                  onClick={() => void inquiriesQuery.refetch()}
                >
                  Try again
                </Button>
              </div>
            ) : inquiries.length === 0 ? (
              <div className="rounded-xl border border-dashed p-7 text-center">
                <MessageSquare className="mx-auto size-8 text-muted-foreground" />
                <p className="mt-3 font-semibold">No inquiries yet</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Keep your services and profile up to date to help clients find you.
                </p>
                <Button className="mt-4" variant="outline" asChild>
                  <Link href="/provider/profile">Improve your profile</Link>
                </Button>
              </div>
            ) : (
              <div className="divide-y">
                {inquiries.slice(0, 4).map((inquiry) => (
                  <Link
                    key={inquiry.id}
                    href={`/inquiries/${inquiry.id}`}
                    className="flex items-center gap-3 py-3 transition-colors first:pt-0 last:pb-0 hover:bg-muted/40"
                  >
                    <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
                      <MessageSquare className="size-4" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium">
                        {inquiry.description}
                      </span>
                      <span className="mt-1 block text-xs text-muted-foreground">
                        {inquiry.location || "Location not specified"} ·{" "}
                        {new Date(inquiry.created_at).toLocaleDateString()}
                      </span>
                    </span>
                    <Badge
                      variant={inquiry.status === "new" ? "default" : "secondary"}
                      className="shrink-0 capitalize"
                    >
                      {inquiry.status}
                    </Badge>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="size-4 text-primary" />
              Profile strength
            </CardTitle>
            <CardDescription>Complete these details to help clients choose you.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="mb-2 flex items-center justify-between text-sm">
                <span className="font-semibold">{completion}% complete</span>
                <span className="text-muted-foreground">
                  {completedProfileChecks}/{profileChecks.length}
                </span>
              </div>
              <div
                role="progressbar"
                aria-label="Profile completion"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={completion}
                className="h-2 overflow-hidden rounded-full bg-muted"
              >
                <div
                  className="h-full rounded-full bg-primary transition-[width]"
                  style={{ width: `${completion}%` }}
                />
              </div>
            </div>
            <div className="space-y-3 text-sm">
              <ChecklistRow
                done={Boolean(profile?.display_name || profile?.business_name)}
                label="Business or display name"
              />
              <ChecklistRow done={Boolean(profile?.about)} label="About section" />
              <ChecklistRow
                done={Boolean(profile?.categories?.length)}
                label="Service categories"
              />
              <ChecklistRow
                done={Boolean(profile?.service_areas?.length)}
                label="Service areas"
              />
              <ChecklistRow done={Boolean(profile?.profile_photo)} label="Profile photo" />
              <ChecklistRow
                done={Boolean(profile?.portfolio?.length)}
                label="Portfolio item"
                icon={ImageIcon}
              />
            </div>
            <div className="flex items-center gap-2 rounded-lg bg-muted px-3 py-2 text-xs text-muted-foreground">
              <MapPin className="size-4" />
              {profile?.location?.city || "Add a city to your profile"}
            </div>
            <Button variant="outline" className="w-full" asChild>
              <Link href="/provider/profile">Edit profile</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between gap-3">
            <div>
              <CardTitle>Services</CardTitle>
              <CardDescription>Manage the work clients can discover in the marketplace.</CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/provider/services">
                View all <ArrowRight className="size-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {servicesQuery.isLoading ? (
              <div className="space-y-3">
                <Skeleton className="h-16" />
                <Skeleton className="h-16" />
              </div>
            ) : servicesQuery.isError ? (
              <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-4">
                <p role="alert" className="text-sm text-destructive">
                  {getApiErrorMessage(servicesQuery.error, "Could not load your services.")}
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-3"
                  onClick={() => void servicesQuery.refetch()}
                >
                  Try again
                </Button>
              </div>
            ) : services.length === 0 ? (
              <div className="rounded-xl border border-dashed p-8 text-center">
                <Briefcase className="mx-auto size-8 text-muted-foreground" />
                <p className="mt-3 font-semibold">Add your first service</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Create a listing so clients can discover what you offer.
                </p>
                <Button className="mt-4" asChild>
                  <Link href="/provider/services">
                    <Plus className="size-4" />
                    Create a service
                  </Link>
                </Button>
              </div>
            ) : (
              <div className="divide-y">
                {services.slice(0, 5).map((service) => (
                  <div
                    key={service.id}
                    className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0"
                  >
                    <div className="min-w-0">
                      <p className="truncate font-medium">{service.title}</p>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {service.category}
                        {service.service_areas.length > 0
                          ? ` · ${service.service_areas.slice(0, 2).join(", ")}`
                          : ""}
                      </p>
                    </div>
                    <StatusBadge status={service.status} />
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function MetricCard({
  icon: Icon,
  label,
  value,
  hint,
}: {
  icon: typeof Briefcase;
  label: string;
  value: string | number;
  hint: string;
}) {
  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-muted-foreground">{label}</p>
          <span className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Icon className="size-4" />
          </span>
        </div>
        <p className="mt-3 text-3xl font-bold tracking-tight">{value}</p>
        <p className="mt-1 text-xs text-muted-foreground">{hint}</p>
      </CardContent>
    </Card>
  );
}

function ChecklistRow({
  done,
  label,
  icon: Icon,
}: {
  done: boolean;
  label: string;
  icon?: typeof ImageIcon;
}) {
  return (
    <div className="flex items-center gap-2">
      <span
        className={
          done
            ? "flex size-5 items-center justify-center rounded-full bg-emerald-100 text-emerald-700"
            : "flex size-5 items-center justify-center rounded-full border border-dashed"
        }
      >
        {done && <CheckCircle2 className="size-3.5" />}
      </span>
      {Icon && <Icon className="size-4 text-muted-foreground" />}
      <span className={done ? "text-foreground" : "text-muted-foreground"}>{label}</span>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  if (status === "published") {
    return <Badge className="bg-emerald-600 hover:bg-emerald-600">Published</Badge>;
  }
  if (status === "unpublished") {
    return <Badge variant="secondary">Unpublished</Badge>;
  }
  return <Badge variant="outline">Draft</Badge>;
}
