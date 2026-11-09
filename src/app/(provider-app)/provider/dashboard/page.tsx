"use client";

import Link from "next/link";
import Image from "next/image";
import { useQuery } from "@tanstack/react-query";
import {
  AlertCircle,
  ArrowRight,
  BarChart3,
  BriefcaseBusiness,
  Check,
  CheckCircle2,
  ChevronRight,
  Eye,
  Image as ImageIcon,
  Layers3,
  MapPin,
  MessageSquare,
  Package,
  Plus,
  Sparkles,
} from "lucide-react";
import { providersApi, servicesApi } from "@/lib/api/marketplace";
import { serviceInquiriesApi } from "@/lib/api/inquiries";
import { productsApi } from "@/lib/api/products";
import { getApiErrorMessage } from "@/lib/api/client";
import { queryKeys } from "@/lib/api/query-keys";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
  const productsQuery = useQuery({
    queryKey: queryKeys.products.mine({ status: "all", page: 1, limit: 50 }),
    queryFn: () => productsApi.getMine({ status: "all", page: 1, limit: 50 }),
  });
  const inquiriesQuery = useQuery({
    queryKey: queryKeys.serviceInquiries.incoming({ page: 1, limit: 5 }),
    queryFn: () => serviceInquiriesApi.getIncoming({ page: 1, limit: 5 }),
  });

  if (profileQuery.isLoading) {
    return (
      <div className="space-y-5">
        <Skeleton className="h-48 rounded-3xl bg-white" />
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }, (_, index) => (
            <Skeleton key={index} className="h-24 rounded-2xl bg-white" />
          ))}
        </div>
        <div className="grid gap-4 xl:grid-cols-3">
          {Array.from({ length: 3 }, (_, index) => (
            <Skeleton key={index} className="h-72 rounded-2xl bg-white" />
          ))}
        </div>
      </div>
    );
  }

  if (profileQuery.isError) {
    const status = (profileQuery.error as { response?: { status?: number } })?.response?.status;
    return (
      <Card className="border-dashed border-[#dfe2f0] bg-white text-[#172554]">
        <CardHeader>
          <CardTitle>Provider profile not found</CardTitle>
          <CardDescription>
            {status === 404
              ? "Activate provider access and complete onboarding to publish products or services."
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
  const products = productsQuery.data?.data ?? [];
  const publishedCount =
    (servicesQuery.data?.summary.published ?? services.filter((service) => service.status === "published").length) +
    (productsQuery.data?.summary.published ?? 0);
  const listingCount =
    (servicesQuery.data?.summary.total ?? servicesQuery.data?.total ?? services.length) +
    (productsQuery.data?.summary.total ?? 0);
  const draftCount =
    (servicesQuery.data?.summary.draft ?? services.filter((service) => service.status === "draft").length) +
    (productsQuery.data?.summary.draft ?? 0);
  const recentListings = [
    ...services.map((service) => ({
      id: `service-${service.id}`,
      title: service.title,
      category: service.category,
      detail: service.service_areas.slice(0, 2).join(", "),
      type: "Service" as const,
      status: service.status,
      updatedAt: service.updated_at ?? service.created_at ?? "",
    })),
    ...products.map((product) => ({
      id: `product-${product.id}`,
      title: product.title,
      category: product.category,
      detail: product.subcategory,
      type: "Product" as const,
      status: product.status,
      updatedAt: product.updated_at ?? product.created_at ?? "",
    })),
  ]
    .sort((a, b) => Date.parse(b.updatedAt) - Date.parse(a.updatedAt))
    .slice(0, 4);
  const listingsLoading = servicesQuery.isLoading || productsQuery.isLoading;
  const listingsError = servicesQuery.error ?? productsQuery.error;
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
  const completion = Math.round((completedProfileChecks / profileChecks.length) * 100);
  const providerName = profile?.display_name || profile?.business_name || "Your studio";

  return (
    <div className="space-y-5 sm:space-y-7">
      <section className="relative isolate min-h-[290px] overflow-hidden rounded-[28px] border border-[#5638a5] bg-gradient-to-br from-[#28104f] via-[#4615a7] to-[#191952] px-5 py-7 shadow-[0_24px_60px_-34px_rgba(57,30,133,0.62)] sm:min-h-[310px] sm:rounded-[32px] sm:px-9 sm:py-9 lg:min-h-[330px] lg:px-11">
        <div className="absolute inset-y-0 right-0 -z-10 w-full opacity-70 sm:w-[68%]">
          <Image
            src="/provider-hero.png"
            alt=""
            fill
            priority
            sizes="(min-width: 1024px) 600px, 50vw"
            className="object-cover object-[center_28%]"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#28104f] via-[#351272]/90 to-[#351272]/35" />
        </div>
        <div className="relative z-10 max-w-[650px]">
          <p className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3.5 py-1.5 text-xs font-semibold text-white shadow-sm backdrop-blur-md">
            <Sparkles className="size-3.5" />
            YOUR PROVIDER STUDIO
          </p>
          <h1 className="mt-4 max-w-[620px] break-words text-[32px] font-extrabold leading-[1.08] tracking-[-0.035em] text-white sm:text-[42px] lg:text-[48px]">
            Welcome back, {providerName}
          </h1>
          <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs font-medium text-white/80 sm:text-sm">
            <span>{profile?.categories?.slice(0, 3).join(" · ") || "Creative business"}</span>
            {profile?.location?.city && (
              <span className="inline-flex items-center gap-1">
                <MapPin className="size-3.5" />
                {profile.location.city}
              </span>
            )}
          </div>
          <p className="mt-3 max-w-lg text-sm leading-6 text-white/80 sm:text-base">
            Your next great client starts here. Publish the products and services that make your business unique.
          </p>
          <div className="mt-5 flex flex-wrap gap-2.5">
            <Button asChild className="h-11 rounded-xl bg-white px-5 text-sm font-bold text-[#351272] shadow-[0_8px_24px_-12px_rgba(0,0,0,0.7)] hover:bg-white/90">
              <Link href="/publish">
                <Plus className="size-4" />
                Publish an item
              </Link>
            </Button>
            {profile?.slug && (
              <Button
                variant="outline"
                asChild
                className="h-11 rounded-xl border-white/35 bg-white/10 px-4 text-sm font-semibold text-white backdrop-blur-sm hover:bg-white/20 hover:text-white"
              >
                <Link href={`/providers/${profile.slug}`} target="_blank" rel="noreferrer">
                  <Eye className="size-4" />
                  View public profile
                </Link>
              </Button>
            )}
          </div>
        </div>
        <div className="absolute bottom-7 right-8 hidden w-[238px] rounded-2xl border border-white/20 bg-[#1f1557]/65 p-4 text-white shadow-2xl backdrop-blur-xl lg:block">
          <p className="flex items-center gap-2 text-xs font-semibold text-white/75">
            <span
              className={`size-2 rounded-full ${
                listingsLoading || listingsError
                  ? "bg-white/50"
                  : publishedCount
                    ? "bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.8)]"
                    : "bg-amber-300"
              }`}
            />
            MARKETPLACE PRESENCE
          </p>
          <div className="mt-3 flex items-end justify-between gap-3">
            <div>
              <p className="text-3xl font-bold leading-none tracking-tight">
                {listingsLoading || listingsError ? "—" : publishedCount}
              </p>
              <p className="mt-1.5 text-xs text-white/75">items published</p>
            </div>
            <Link
              href="/publish"
              className="mb-0.5 inline-flex items-center gap-1 text-xs font-semibold text-white transition hover:text-white/80"
            >
              Manage <ArrowRight className="size-3.5" />
            </Link>
          </div>
          <p className="mt-2 text-[11px] text-white/70">
            {listingsLoading
              ? "Loading your listings…"
              : listingsError
                ? "Unable to load listings"
                : publishedCount
                  ? "Visible to clients on RootIn"
                  : "Publish a service to get discovered"}
          </p>
        </div>
      </section>

      {profile && !profile.onboarding_completed && (
        <div className="flex flex-col gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <AlertCircle className="mt-0.5 size-5 shrink-0 text-amber-600" />
            <div>
              <p className="text-sm font-semibold text-amber-950">Finish onboarding to publish services</p>
              <p className="mt-0.5 text-sm text-amber-900/75">
                Add your display name and complete the onboarding step before publishing.
              </p>
            </div>
          </div>
          <Button asChild variant="outline" className="shrink-0 border-amber-300 bg-white">
            <Link href="/provider/onboarding">Complete onboarding</Link>
          </Button>
        </div>
      )}

      <section aria-label="Studio overview">
        <div className="mb-3 px-1">
          <div>
            <h2 className="text-lg font-bold tracking-tight text-[#172554] sm:text-xl">Your studio at a glance</h2>
            <p className="mt-0.5 text-xs text-slate-500 sm:text-sm">A live snapshot of your business on RootIn</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
          <MetricCard
            icon={BriefcaseBusiness}
            label="Total listings"
            value={listingsError ? "—" : listingsLoading ? "…" : listingCount}
            hint={listingsError ? "Could not load listings" : `${draftCount} in draft`}
            tone="violet"
          />
          <MetricCard
            icon={CheckCircle2}
            label="Published listings"
            value={listingsError ? "—" : listingsLoading ? "…" : publishedCount}
            hint="Visible in the marketplace"
            tone="green"
          />
          <MetricCard
            icon={MessageSquare}
            label="New inquiries"
            value={inquiriesQuery.data?.total ?? 0}
            hint="Requests from potential clients"
            tone="amber"
          />
          <MetricCard
            icon={BarChart3}
            label="Profile strength"
            value={`${completion}%`}
            hint={`${completedProfileChecks} of ${profileChecks.length} essentials`}
            tone="rose"
          />
        </div>
      </section>

      <section className="rounded-[24px] border border-[#e7e9f2] bg-white p-4 shadow-[0_16px_38px_-32px_rgba(27,30,74,0.48)] sm:rounded-[28px] sm:p-5">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold tracking-tight text-[#172554] sm:text-lg">Quick actions</h2>
            <p className="mt-0.5 text-xs text-slate-500 sm:text-sm">Everything you need to keep business moving</p>
          </div>
          <span className="hidden text-xs font-medium text-slate-400 sm:inline">MANAGE YOUR BUSINESS</span>
        </div>
        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 xl:grid-cols-3">
          <QuickAction
            href="/provider/services/new"
            icon={<Plus className="size-5" />}
            label="Publish a service"
            description="Offer your expertise"
          />
          <QuickAction
            href="/provider/products/new"
            icon={<Package className="size-5" />}
            label="Publish a product"
            description="List something you sell"
          />
          <QuickAction
            href="/publish"
            icon={<Layers3 className="size-5" />}
            label="Manage all listings"
            description="See products and services"
          />
          <QuickAction
            href="/provider/inquiries"
            icon={<MessageSquare className="size-5" />}
            label="View inquiries"
            description="Respond to new requests"
          />
          <QuickAction
            href="/provider/profile/edit"
            icon={<Eye className="size-5" />}
            label="Edit your profile"
            description="Make a great first impression"
          />
          <QuickAction
            href="/provider/messages"
            icon={<MessageSquare className="size-5" />}
            label="Open messages"
            description="Continue your conversations"
          />
        </div>
      </section>

      <div className="grid gap-4 xl:grid-cols-3 xl:gap-5">
        <section className="overflow-hidden rounded-[24px] border border-[#e7e9f2] bg-white shadow-[0_16px_38px_-32px_rgba(27,30,74,0.48)] xl:col-span-1">
          <PanelHeading
            icon={<MessageSquare className="size-4" />}
            title="Recent inquiries"
            href="/provider/inquiries"
            action="View all"
          />
          <div className="px-4 pb-4">
            {inquiriesQuery.isLoading ? (
              <div className="space-y-3">
                <Skeleton className="h-14 rounded-xl bg-[#f3f4fa]" />
                <Skeleton className="h-14 rounded-xl bg-[#f3f4fa]" />
                <Skeleton className="h-14 rounded-xl bg-[#f3f4fa]" />
              </div>
            ) : inquiriesQuery.isError ? (
              <QueryError
                message={getApiErrorMessage(inquiriesQuery.error, "Could not load your inquiries.")}
                onRetry={() => void inquiriesQuery.refetch()}
              />
            ) : inquiries.length === 0 ? (
              <EmptyState
                icon={<MessageSquare className="size-5" />}
                title="No inquiries yet"
                description="Keep your profile and listings up to date to help customers find and contact you."
                href="/provider/profile"
                action="Improve profile"
              />
            ) : (
              <div className="space-y-2">
                {inquiries.slice(0, 4).map((inquiry) => (
                  <Link
                    key={inquiry.id}
                    href="/provider/inquiries"
                    className="flex items-center gap-3 rounded-xl bg-[#f8f8fc] p-3 transition hover:bg-[#f1efff]"
                  >
                    <span className="grid size-9 shrink-0 place-items-center rounded-full bg-[#eee9ff] text-[#4b16f5]">
                      <MessageSquare className="size-4" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-semibold text-[#172554]">
                        {inquiry.description}
                      </span>
                      <span className="mt-1 block truncate text-xs text-slate-500">
                        {inquiry.location || "Location not specified"} ·{" "}
                        {new Date(inquiry.created_at).toLocaleDateString()}
                      </span>
                    </span>
                    <span
                      className={
                        inquiry.status === "new"
                          ? "shrink-0 rounded-full bg-[#e6f8ef] px-2 py-1 text-[10px] font-semibold capitalize text-emerald-700"
                          : "shrink-0 rounded-full bg-[#f0edff] px-2 py-1 text-[10px] font-semibold capitalize text-[#603ed0]"
                      }
                    >
                      {inquiry.status}
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </section>

        <section className="overflow-hidden rounded-[24px] border border-[#e7e9f2] bg-white shadow-[0_16px_38px_-32px_rgba(27,30,74,0.48)] xl:col-span-1">
          <PanelHeading
            icon={<Layers3 className="size-4" />}
            title="Your recent listings"
            href="/publish"
            action="Manage"
          />
          <div className="px-4 pb-4">
            {listingsLoading ? (
              <div className="space-y-3">
                <Skeleton className="h-14 rounded-xl bg-[#f3f4fa]" />
                <Skeleton className="h-14 rounded-xl bg-[#f3f4fa]" />
                <Skeleton className="h-14 rounded-xl bg-[#f3f4fa]" />
              </div>
            ) : listingsError ? (
              <QueryError
                message={getApiErrorMessage(listingsError, "Could not load your listings.")}
                onRetry={() => {
                  void servicesQuery.refetch();
                  void productsQuery.refetch();
                }}
              />
            ) : recentListings.length === 0 ? (
              <EmptyState
                icon={<Layers3 className="size-5" />}
                title="Publish your first listing"
                description="Share a product or service so customers can discover what you offer."
                href="/publish"
                action="Publish an item"
              />
            ) : (
              <div className="space-y-2">
                {recentListings.map((listing) => (
                  <div
                    key={listing.id}
                    className="flex items-center gap-3 rounded-xl bg-[#f8f8fc] p-3"
                  >
                    <span
                      className={`grid size-9 shrink-0 place-items-center rounded-full ${
                        listing.type === "Product"
                          ? "bg-[#f5eaff] text-[#7b2be5]"
                          : "bg-[#e9f8f3] text-emerald-600"
                      }`}
                    >
                      {listing.type === "Product" ? (
                        <Package className="size-4" />
                      ) : (
                        <BriefcaseBusiness className="size-4" />
                      )}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-[#172554]">{listing.title}</p>
                      <p className="mt-1 truncate text-xs text-slate-500">
                        <span className="font-medium">{listing.type}</span>
                        {listing.category ? ` · ${listing.category}` : ""}
                        {listing.detail
                          ? ` · ${listing.detail}`
                          : ""}
                      </p>
                    </div>
                    <StatusBadge status={listing.status} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        <section className="rounded-[24px] border border-[#e7e9f2] bg-white p-5 shadow-[0_16px_38px_-32px_rgba(27,30,74,0.48)]">
          <div className="flex items-center gap-2">
            <span className="grid size-8 place-items-center rounded-lg bg-[#f0ebff] text-[#4b16f5]">
              <Sparkles className="size-4" />
            </span>
            <div>
              <h2 className="text-sm font-bold text-[#172554]">Profile strength</h2>
              <p className="text-xs text-slate-500">Stand out to more clients</p>
            </div>
          </div>
          <div className="mt-5 flex items-center gap-3">
            <div
              role="progressbar"
              aria-label="Profile completion"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={completion}
              className="grid size-[76px] shrink-0 place-items-center rounded-full"
              style={{
                background: `conic-gradient(#16b889 ${completion}%, #e8eaf2 ${completion}% 100%)`,
              }}
            >
              <span className="grid size-[60px] place-items-center rounded-full bg-white text-sm font-bold text-[#172554]">
                {completion}%
              </span>
            </div>
            <div>
              <p className="text-sm font-bold text-emerald-600">
                {completion === 100 ? "Excellent!" : "Keep going!"}
              </p>
              <p className="mt-1 text-xs leading-5 text-slate-500">
                {completedProfileChecks} of {profileChecks.length} profile essentials complete.
              </p>
            </div>
          </div>
          <div className="mt-5 space-y-3">
            <ChecklistRow
              done={Boolean(profile?.display_name || profile?.business_name)}
              label="Business or display name"
            />
            <ChecklistRow done={Boolean(profile?.about)} label="About section" />
            <ChecklistRow done={Boolean(profile?.categories?.length)} label="Business categories" />
            <ChecklistRow done={Boolean(profile?.service_areas?.length)} label="Areas served" />
            <ChecklistRow done={Boolean(profile?.profile_photo)} label="Profile photo" />
            <ChecklistRow
              done={Boolean(profile?.portfolio?.length)}
              label="Portfolio item"
              icon={<ImageIcon className="size-3.5" />}
            />
          </div>
          <div className="mt-4 flex items-center gap-2 rounded-xl bg-[#f7f8fc] px-3 py-2 text-xs text-slate-500">
            <MapPin className="size-3.5" />
            {profile?.location?.city || "Add a city to your profile"}
          </div>
          <Button
            variant="outline"
            asChild
            className="mt-3 h-9 w-full rounded-xl border-[#ded9f7] text-[#4b16f5] hover:bg-[#f6f3ff]"
          >
            <Link href="/provider/profile/edit">Complete your profile</Link>
          </Button>
        </section>
      </div>

      <section className="flex flex-col gap-4 rounded-[24px] border border-[#e6e1f6] bg-gradient-to-r from-[#f1edff] via-[#f7f5ff] to-[#eff4ff] px-5 py-5 shadow-[0_16px_38px_-32px_rgba(27,30,74,0.48)] sm:flex-row sm:items-center sm:justify-between sm:px-7">
        <div className="flex items-center gap-4">
          <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-white text-[#4b16f5] shadow-sm">
            <Sparkles className="size-6" />
          </span>
          <div>
            <h2 className="font-bold text-[#24186f]">Keep growing!</h2>
            <p className="mt-1 max-w-lg text-xs leading-5 text-[#596083]">
              Publish products or services and complete your profile so the right customers can find you.
            </p>
          </div>
        </div>
        <Button
          asChild
          className="h-10 shrink-0 rounded-xl bg-[#4b16f5] px-5 text-white hover:bg-[#3e10d9]"
        >
          <Link href="/publish">
            Publish an item <ArrowRight className="size-4" />
          </Link>
        </Button>
      </section>
    </div>
  );
}

function MetricCard({
  icon: Icon,
  label,
  value,
  hint,
  tone,
}: {
  icon: typeof BriefcaseBusiness;
  label: string;
  value: string | number;
  hint: string;
  tone: "violet" | "green" | "amber" | "rose";
}) {
  const tones = {
    violet: "bg-[#f0ebff] text-[#4b16f5]",
    green: "bg-[#e6f8f1] text-emerald-600",
    amber: "bg-[#fff4dc] text-amber-600",
    rose: "bg-[#fff0f3] text-rose-600",
  };

  return (
    <article className="min-h-[112px] rounded-2xl border border-[#e7e9f2] bg-white p-3.5 shadow-[0_16px_34px_-30px_rgba(27,30,74,0.48)] transition-all duration-200 hover:-translate-y-0.5 hover:border-[#dcd5fa] hover:shadow-[0_20px_38px_-26px_rgba(67,44,154,0.3)] sm:min-h-[124px] sm:rounded-[22px] sm:p-4">
      <p className="truncate text-[11px] font-semibold text-slate-500 sm:text-xs">{label}</p>
      <div className="mt-2 flex items-center justify-between gap-2">
        <p className="text-2xl font-bold leading-none tracking-tight text-[#111747] sm:text-[28px]">
          {value}
        </p>
        <span className={`grid size-9 shrink-0 place-items-center rounded-xl sm:size-11 sm:rounded-2xl ${tones[tone]}`}>
          <Icon className="size-[18px] sm:size-5" />
        </span>
      </div>
      <p className="mt-2 truncate text-[11px] text-slate-500 sm:text-xs">{hint}</p>
    </article>
  );
}

function QuickAction({
  href,
  icon,
  label,
  description,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
  description: string;
}) {
  return (
    <Link
      href={href}
      className="group flex min-h-[76px] items-center gap-3 rounded-2xl border border-[#eeedf5] bg-[#fcfbff] px-3.5 py-3 transition duration-200 hover:-translate-y-0.5 hover:border-[#d9cef9] hover:bg-[#f7f3ff] hover:shadow-[0_12px_24px_-18px_rgba(75,22,245,0.4)] sm:min-h-[88px] sm:px-4"
    >
      <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-[#f0e9ff] text-[#5b25d6] transition group-hover:bg-white">
        {icon}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-bold text-[#29205e]">{label}</span>
        <span className="mt-1 block truncate text-xs text-slate-500">{description}</span>
      </span>
      <ArrowRight className="size-4 shrink-0 text-[#9c8bc8] transition group-hover:translate-x-0.5 group-hover:text-[#5b25d6]" />
    </Link>
  );
}

function PanelHeading({
  icon,
  title,
  href,
  action,
}: {
  icon: React.ReactNode;
  title: string;
  href: string;
  action: string;
}) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-[#f0f0f6] px-4 py-3.5">
      <h2 className="flex items-center gap-2 text-sm font-bold text-[#172554]">
        <span className="text-[#4b16f5]">{icon}</span>
        {title}
      </h2>
      <Link
        href={href}
        className="flex items-center gap-1 text-xs font-semibold text-[#4b16f5] hover:text-[#3510bd]"
      >
        {action} <ChevronRight className="size-3.5" />
      </Link>
    </div>
  );
}

function QueryError({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="rounded-xl border border-rose-200 bg-rose-50 p-4">
      <p role="alert" className="text-sm text-rose-700">
        {message}
      </p>
      <Button
        variant="outline"
        size="sm"
        className="mt-3 border-rose-200 bg-white"
        onClick={onRetry}
      >
        Try again
      </Button>
    </div>
  );
}

function EmptyState({
  icon,
  title,
  description,
  href,
  action,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  href: string;
  action: string;
}) {
  return (
    <div className="rounded-xl border border-dashed border-[#dddff0] px-4 py-6 text-center">
      <span className="mx-auto grid size-10 place-items-center rounded-full bg-[#f0ebff] text-[#4b16f5]">
        {icon}
      </span>
      <p className="mt-3 text-sm font-semibold text-[#172554]">{title}</p>
      <p className="mt-1 text-xs leading-5 text-slate-500">{description}</p>
      <Link
        href={href}
        className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-[#4b16f5]"
      >
        {action} <ArrowRight className="size-3.5" />
      </Link>
    </div>
  );
}

function ChecklistRow({
  done,
  label,
  icon,
}: {
  done: boolean;
  label: string;
  icon?: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-2 text-xs">
      <span
        className={
          done
            ? "flex size-4 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-white"
            : "flex size-4 shrink-0 items-center justify-center rounded-full border border-dashed border-slate-300 text-slate-400"
        }
      >
        {done ? <Check className="size-2.5" /> : null}
      </span>
      {icon && <span className="text-slate-400">{icon}</span>}
      <span className={done ? "text-slate-700" : "text-slate-400"}>{label}</span>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const style =
    status === "published"
      ? "bg-[#e6f8ef] text-emerald-700"
      : status === "unpublished"
        ? "bg-slate-100 text-slate-600"
        : status === "paused"
          ? "bg-amber-50 text-amber-700"
          : "bg-[#f0edff] text-[#603ed0]";
  const label =
    status === "published"
      ? "Published"
      : status === "unpublished"
        ? "Unpublished"
        : status === "paused"
          ? "Paused"
          : "Draft";

  return (
    <span className={`shrink-0 rounded-full px-2 py-1 text-[10px] font-semibold ${style}`}>
      {label}
    </span>
  );
}
