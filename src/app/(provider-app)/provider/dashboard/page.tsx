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
  Sparkles,
} from "lucide-react";
import { providersApi, servicesApi } from "@/lib/api/marketplace";
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
    queryKey: queryKeys.services.mine({ limit: 100 }),
    queryFn: () => servicesApi.getMine({ limit: 50 }),
  });

  if (profileQuery.isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-64" />
        <div className="grid gap-4 sm:grid-cols-3">
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
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
  const profileChecks = [
    Boolean(profile?.display_name),
    Boolean(profile?.about),
    Boolean(profile?.categories?.length),
    Boolean(profile?.service_areas?.length),
    Boolean(profile?.profile_photo),
    Boolean(profile?.portfolio?.length),
  ];
  const completion = Math.round(
    (profileChecks.filter(Boolean).length / profileChecks.length) * 100,
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium text-primary">Provider dashboard</p>
          <h1 className="text-3xl font-bold tracking-tight">
            {profile?.display_name || profile?.business_name || "Your studio"}
          </h1>
          <p className="mt-1 text-muted-foreground">
            Manage your public profile, services, and enquiries from one place.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href={`/providers/${profile?.slug ?? ""}`} target="_blank">
              <Eye className="mr-2 size-4" />
              View public profile
            </Link>
          </Button>
          <Button asChild>
            <Link href="/provider/services">
              <Briefcase className="mr-2 size-4" />
              Manage services
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

      <div className="grid gap-4 sm:grid-cols-3">
        <MetricCard
          icon={Briefcase}
          label="Total services"
          value={services.length}
          hint={`${drafts.length} in draft`}
        />
        <MetricCard
          icon={CheckCircle2}
          label="Published"
          value={published.length}
          hint="Visible in the marketplace"
        />
        <MetricCard
          icon={BarChart3}
          label="Profile completion"
          value={`${completion}%`}
          hint="Complete your profile for better discovery"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Recent services</CardTitle>
              <CardDescription>Your latest listings and their status.</CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/provider/services">
                View all <ArrowRight className="ml-1 size-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {servicesQuery.isLoading ? (
              <div className="space-y-3">
                <Skeleton className="h-16" />
                <Skeleton className="h-16" />
                <Skeleton className="h-16" />
              </div>
            ) : services.length === 0 ? (
              <div className="rounded-xl border border-dashed p-8 text-center">
                <Briefcase className="mx-auto size-8 text-muted-foreground" />
                <p className="mt-3 font-semibold">No services yet</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Create your first listing to appear in marketplace search.
                </p>
                <Button className="mt-4" asChild>
                  <Link href="/provider/services">Create a service</Link>
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

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="size-4 text-primary" />
              Profile checklist
            </CardTitle>
            <CardDescription>Stronger profiles rank better in discovery.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <ChecklistRow done={Boolean(profile?.slug)} label="Public profile URL" />
            <ChecklistRow done={Boolean(profile?.about)} label="About section" />
            <ChecklistRow
              done={Boolean(profile?.categories?.length)}
              label="Categories selected"
            />
            <ChecklistRow
              done={Boolean(profile?.service_areas?.length)}
              label="Service areas added"
            />
            <ChecklistRow done={Boolean(profile?.profile_photo)} label="Profile photo" />
            <ChecklistRow
              done={Boolean(profile?.portfolio?.length)}
              label="Portfolio item"
              icon={ImageIcon}
            />
            <div className="flex items-center gap-2 rounded-lg bg-muted px-3 py-2 text-xs text-muted-foreground">
              <MapPin className="size-4" />
              {profile?.location?.city || "Add a city to your profile"}
            </div>
            <Button variant="outline" className="w-full" asChild>
              <Link href="/provider/profile">Edit profile</Link>
            </Button>
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
