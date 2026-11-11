"use client";

import Link from "next/link";
import {
  AlertCircle,
  BriefcaseBusiness,
  CheckCircle2,
  ChevronRight,
  ExternalLink,
  Eye,
  Image,
  Layers3,
  Loader2,
  MapPin,
  PencilLine,
  ShieldCheck,
  Sparkles,
  Star,
  UserRound,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { providersApi, servicesApi } from "@/lib/api/marketplace";
import { getApiErrorMessage } from "@/lib/api/client";
import { queryKeys } from "@/lib/api/query-keys";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

export default function ProviderProfilePage() {
  const profileQuery = useQuery({
    queryKey: queryKeys.provider.me(),
    queryFn: providersApi.getMyProfile,
    retry: false,
  });
  const servicesQuery = useQuery({
    queryKey: queryKeys.services.mine({ status: "all", limit: 50 }),
    queryFn: () => servicesApi.getMine({ status: "all", limit: 50 }),
    retry: false,
  });
  const profile = profileQuery.data?.profile;
  const ratingQuery = useQuery({
    queryKey: queryKeys.provider.ratingSummary(profile?.slug ?? ""),
    queryFn: () => providersApi.getRatingSummary(profile!.slug!),
    enabled: Boolean(profile?.slug),
    retry: false,
  });

  if (profileQuery.isLoading) {
    return (
      <div className="mx-auto max-w-3xl space-y-4">
        <Skeleton className="h-52 rounded-3xl" />
        <Skeleton className="h-24 rounded-2xl" />
        <Skeleton className="h-96 rounded-2xl" />
      </div>
    );
  }

  if (profileQuery.isError || !profile) {
    return (
      <div className="mx-auto max-w-xl rounded-2xl border border-[#e7e9f2] bg-white p-6 text-center shadow-sm sm:p-8">
        <AlertCircle className="mx-auto size-9 text-[#704de5]" />
        <h1 className="mt-3 text-lg font-bold text-[#171b45]">
          Could not load your profile
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {getApiErrorMessage(profileQuery.error, "Please try again.")}
        </p>
        <Button className="mt-5" asChild>
          <Link href="/provider/profile/edit">Open profile editor</Link>
        </Button>
      </div>
    );
  }

  const services = servicesQuery.data?.data ?? [];
  const publishedServices = services.filter(
    (service) => service.status === "published",
  );
  const essentials = [
    Boolean(profile.display_name?.trim()),
    Boolean(profile.about?.trim() && profile.categories?.length),
    Boolean(
      profile.profile_photo ||
        profile.banner_image ||
        profile.portfolio?.some((item) => item.image_url),
    ),
    publishedServices.length > 0,
    services.some((service) => service.indicative_price),
    Boolean(profile.service_areas?.length || profile.location?.city),
  ];
  const completionPercent = Math.round(
    (essentials.filter(Boolean).length / essentials.length) * 100,
  );
  const reviewCount = ratingQuery.data?.review_count ?? 0;
  const rating = ratingQuery.data?.average_rating;

  const actions = [
    {
      label: "Edit Profile",
      description: "Basic info, description, category",
      href: "/provider/profile/edit",
      icon: PencilLine,
      featured: true,
    },
    {
      label: "Manage Listings",
      description: "Add, edit or update your services and products",
      href: "/provider/listings",
      icon: BriefcaseBusiness,
    },
    {
      label: "Packages & Pricing",
      description: "Create services and set their pricing",
      href: "/provider/listings?type=service",
      icon: Layers3,
    },
    {
      label: "Portfolio & Media",
      description: "Photos and examples of your work",
      href: "/provider/profile/edit?step=media",
      icon: Image,
    },
    {
      label: "Reviews & Ratings",
      description:
        ratingQuery.isError
          ? "See your public profile and reviews"
          : rating === null || rating === undefined
            ? `${reviewCount} reviews`
            : `${rating.toFixed(1)} (${reviewCount} reviews)`,
      href: "/provider/profile/preview",
      icon: Star,
    },
    {
      label: "Business Details",
      description: "Account verification and documents",
      href: "/provider/verify-documents",
      icon: ShieldCheck,
    },
    {
      label: "Availability & Service Area",
      description: "Working locations and service areas",
      href: "/provider/profile/edit?step=about",
      icon: MapPin,
    },
    {
      label: "Public Page Preview",
      description: "See how your profile looks to clients",
      href: "/provider/profile/preview",
      icon: Eye,
      external: true,
    },
  ];

  return (
    <div className="mx-auto max-w-3xl pb-6">
      <section className="relative -mx-4 -mt-4 overflow-hidden rounded-b-[2rem] bg-gradient-to-br from-[#171044] via-[#5224bd] to-[#a026df] px-5 pb-12 pt-7 text-white sm:-mx-6 sm:-mt-6 sm:px-8 sm:pt-9 lg:mx-0 lg:mt-0 lg:rounded-3xl">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-20 -top-20 size-64 rounded-full bg-fuchsia-400/20 blur-3xl"
        />
        <div className="relative">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/70">
            Service provider
          </p>
          <h1 className="mt-4 max-w-xl text-3xl font-extrabold leading-tight tracking-tight sm:text-4xl">
            Manage Your Business Profile
          </h1>
          <p className="mt-2 max-w-lg text-sm leading-relaxed text-white/85 sm:text-base">
            Update your profile, showcase your work, and manage the services and
            products clients can discover.
          </p>
        </div>
      </section>

      <div className="relative z-10 -mt-7 space-y-3 px-1 sm:px-2">
        <Link
          href="/provider/profile/edit"
          className="group flex items-center gap-4 rounded-2xl border border-[#e9e7f2] bg-white p-4 shadow-[0_12px_30px_-20px_rgba(27,30,74,0.42)] transition hover:-translate-y-0.5 hover:shadow-lg"
        >
          <span
            className="grid size-[68px] shrink-0 place-items-center rounded-full p-[5px]"
            style={{
              background: `conic-gradient(#2baa62 ${completionPercent}%, #e8e9f0 ${completionPercent}% 100%)`,
            }}
          >
            <span className="grid size-full place-items-center rounded-full bg-white text-lg font-extrabold text-[#172554]">
              {completionPercent}%
            </span>
          </span>
          <span className="min-w-0 flex-1">
            <span className="block font-bold text-[#171b45]">
              Profile Strength
            </span>
            <span className="mt-0.5 block text-xs leading-relaxed text-slate-600 sm:text-sm">
              {completionPercent === 100
                ? "Your profile is looking great."
                : "Almost there! Complete the remaining steps to reach 100%."}
            </span>
          </span>
          <ChevronRight className="size-5 shrink-0 text-[#29265f] transition-transform group-hover:translate-x-0.5" />
        </Link>

        <div className="overflow-hidden rounded-2xl border border-[#e9e7f2] bg-white shadow-[0_12px_30px_-20px_rgba(27,30,74,0.42)]">
          {actions.map((action, index) => {
            const Icon = action.icon;
            return (
              <Link
                key={action.label}
                href={
                  action.href
                }
                className={`group flex min-h-[72px] items-center gap-3 px-4 py-3 transition hover:bg-[#f8f6ff] sm:gap-4 sm:px-5 ${
                  index > 0 ? "border-t border-[#eeeef3]" : ""
                }`}
              >
                <span
                  className={`grid size-11 shrink-0 place-items-center rounded-xl ${
                    action.featured
                      ? "bg-[#f0e8ff] text-[#6f2ce9]"
                      : "bg-white text-[#6f2ce9]"
                  }`}
                >
                  <Icon className="size-6" strokeWidth={2} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-bold text-[#171b45] sm:text-base">
                    {action.label}
                  </span>
                  <span className="mt-0.5 block text-xs text-slate-600 sm:text-sm">
                    {action.description}
                  </span>
                </span>
                {action.external ? (
                  <ExternalLink className="size-4 shrink-0 text-[#29265f]" />
                ) : (
                  <ChevronRight className="size-5 shrink-0 text-[#29265f] transition-transform group-hover:translate-x-0.5" />
                )}
              </Link>
            );
          })}
        </div>

        {servicesQuery.isError && (
          <div
            role="alert"
            className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-900"
          >
            <AlertCircle className="mt-0.5 size-4 shrink-0" />
            <p>
              Could not load service details.{" "}
              {getApiErrorMessage(servicesQuery.error, "Try again later.")}
            </p>
          </div>
        )}
        {ratingQuery.isError && (
          <p className="px-2 text-xs text-muted-foreground">
            Rating details could not be loaded.{" "}
            {getApiErrorMessage(ratingQuery.error, "Please try again later.")}
          </p>
        )}
        {servicesQuery.isLoading && (
          <div className="flex items-center justify-center gap-2 py-2 text-xs text-muted-foreground">
            <Loader2 className="size-3.5 animate-spin" />
            Updating profile strength…
          </div>
        )}
        {profile.onboarding_completed && completionPercent === 100 && (
          <p className="flex items-center justify-center gap-1.5 py-1 text-xs text-emerald-700">
            <CheckCircle2 className="size-3.5" />
            Profile essentials complete
          </p>
        )}
        {!profile.onboarding_completed && (
          <Link
            href="/provider/profile/edit"
            className="flex items-center justify-center gap-1.5 py-2 text-xs font-medium text-[#5932ca]"
          >
            <Sparkles className="size-3.5" />
            Continue setting up your provider profile
            <UserRound className="size-3.5" />
          </Link>
        )}
      </div>
    </div>
  );
}
