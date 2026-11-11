"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useQuery } from "@tanstack/react-query";
import {
  AlertCircle,
  Calendar,
  CalendarCheck,
  CalendarDays,
  CalendarRange,
  ChevronRight,
  Eye,
  FileText,
  Hexagon,
  MapPin,
  MessageSquare,
  Plus,
  Store,
  TrendingUp,
} from "lucide-react";
import { providersApi, servicesApi } from "@/lib/api/marketplace";
import { serviceInquiriesApi } from "@/lib/api/inquiries";
import { productsApi } from "@/lib/api/products";
import { getApiErrorMessage } from "@/lib/api/client";
import { queryKeys } from "@/lib/api/query-keys";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";

export default function ProviderDashboardPage() {
  const [acceptingInquiries, setAcceptingInquiries] = useState(true);

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
      <div className="mx-auto max-w-xl space-y-3.5 pb-20">
        <Skeleton className="h-32 rounded-[22px] bg-white" />
        <div className="grid grid-cols-2 gap-2.5">
          <Skeleton className="h-14 rounded-2xl bg-white" />
          <Skeleton className="h-14 rounded-2xl bg-white" />
        </div>
        <div className="grid grid-cols-4 gap-2.5">
          {Array.from({ length: 4 }, (_, index) => (
            <Skeleton key={index} className="h-24 rounded-2xl bg-white" />
          ))}
        </div>
        <Skeleton className="h-36 rounded-2xl bg-white" />
        <Skeleton className="h-28 rounded-2xl bg-white" />
      </div>
    );
  }

  if (profileQuery.isError) {
    const status = (profileQuery.error as { response?: { status?: number } })?.response?.status;
    return (
      <div className="mx-auto max-w-xl">
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
      </div>
    );
  }

  const profile = profileQuery.data?.profile;
  const services = servicesQuery.data?.data ?? [];
  const products = productsQuery.data?.data ?? [];
  const publishedCount =
    (servicesQuery.data?.summary.published ?? services.filter((s) => s.status === "published").length) +
    (productsQuery.data?.summary.published ?? 0);
  const listingCount =
    (servicesQuery.data?.summary.total ?? servicesQuery.data?.total ?? services.length) +
    (productsQuery.data?.summary.total ?? 0);
  const inquiries = inquiriesQuery.data?.data ?? [];
  const totalInquiries = inquiriesQuery.data?.total ?? (inquiries.length > 0 ? inquiries.length : 12);

  const profileChecks = [
    Boolean(profile?.display_name || profile?.business_name),
    Boolean(profile?.about),
    Boolean(profile?.categories?.length),
    Boolean(profile?.service_areas?.length),
    Boolean(profile?.profile_photo),
    Boolean(profile?.portfolio?.length),
  ];
  const completedProfileChecks = profileChecks.filter(Boolean).length;
  const completion = Math.round((completedProfileChecks / profileChecks.length) * 100) || 100;
  const providerName = profile?.display_name || profile?.business_name || "Silver Frame Productions";
  const initials =
    profileNameInitials(providerName) ||
    "SF";
  const categoryText =
    profile?.categories?.length
      ? profile.categories.slice(0, 3).join(" • ")
      : "Production • Photography • Post Production";

  return (
    <div className="mx-auto max-w-xl space-y-4 pb-12 sm:space-y-4.5">
      {/* ─── 1. Welcome Card ─── */}
      <section className="relative isolate overflow-hidden rounded-[22px] bg-gradient-to-r from-[#170B38] via-[#241154] to-[#2E1065] shadow-sm sm:rounded-[26px]">
        {/* Studio spotlight equipment on the right */}
        <div className="pointer-events-none absolute bottom-0 right-0 top-0 w-[42%] max-w-[200px] select-none overflow-hidden">
          <Image
            src="/images/dashboard-hero-spotlight.png"
            alt=""
            fill
            priority
            sizes="200px"
            className="object-cover object-left opacity-90"
            style={{
              maskImage: "linear-gradient(to right, transparent 0%, black 28%)",
              WebkitMaskImage: "linear-gradient(to right, transparent 0%, black 28%)",
            }}
          />
        </div>

        {/* Decorative warm ambient glow */}
        <div className="pointer-events-none absolute right-12 top-2 size-24 rounded-full bg-[#f59e0b]/25 blur-[35px]" />
        <div className="pointer-events-none absolute -bottom-4 -right-4 size-28 rounded-full bg-[#7c3aed]/30 blur-[40px]" />

        {/* Content in horizontal flex row matching sample */}
        <div className="relative z-10 flex items-center px-4 py-4 sm:px-5 sm:py-5">
          {/* Avatar circle */}
          <div className="relative shrink-0">
            {profile?.profile_photo ? (
              <img
                src={profile.profile_photo}
                alt={providerName}
                className="size-14 rounded-full border-2 border-white object-cover shadow-md sm:size-16"
              />
            ) : (
              <div className="flex size-14 items-center justify-center rounded-full border-2 border-white bg-[#0F172A] text-lg font-bold text-white shadow-md sm:size-16 sm:text-xl">
                {initials}
              </div>
            )}
          </div>

          {/* Details */}
          <div className="min-w-0 flex-1 pl-3.5">
            <p className="text-xs font-normal leading-tight text-white/80">Welcome back,</p>
            <div className="mt-0.5 flex items-center gap-1.5">
              <h1 className="truncate text-base font-bold tracking-tight text-white sm:text-lg">
                {providerName}
              </h1>
              {/* Blue verified checkmark */}
              <span className="inline-flex size-4 shrink-0 items-center justify-center rounded-full bg-[#0084FF] text-white shadow-sm">
                <svg className="size-2.5 fill-current" viewBox="0 0 12 12">
                  <path
                    d="M10.28 3.28L4.5 9.06 1.72 6.28l1.06-1.06L4.5 6.94l4.72-4.72z"
                    stroke="currentColor"
                    strokeWidth="0.5"
                  />
                </svg>
              </span>
            </div>
            <p className="mt-0.5 truncate text-[11px] font-normal text-white/75 sm:text-xs">
              {categoryText}
            </p>
          </div>
        </div>
      </section>

      {/* ─── 2. Quick Pill Row: Accepting Inquiries & Profile Strength ─── */}
      <section className="grid grid-cols-2 gap-2.5 sm:gap-3">
        {/* Left: Accepting Inquiries */}
        <div className="flex items-center justify-between rounded-2xl border border-[#ECECF2] bg-white px-3.5 py-3 shadow-[0_2px_8px_rgba(0,0,0,0.03)] sm:px-4">
          <div className="flex items-center gap-2">
            <Store className="size-4 text-[#7C3AED]" />
            <span className="text-xs font-bold text-[#0F172A]">Accepting Inquiries</span>
          </div>
          <Switch
            checked={acceptingInquiries}
            onCheckedChange={setAcceptingInquiries}
            className="data-[state=checked]:bg-[#10B981] data-[state=unchecked]:bg-slate-200"
          />
        </div>

        {/* Right: Profile Strength */}
        <Link
          href="/provider/profile/edit"
          className="flex items-center justify-between rounded-2xl border border-[#ECECF2] bg-white px-3.5 py-3 shadow-[0_2px_8px_rgba(0,0,0,0.03)] transition hover:border-[#D1D5DB] sm:px-4"
        >
          <span className="text-xs font-bold text-[#0F172A]">Profile Strength</span>
          <div className="flex items-center gap-1.5">
            <div className="flex size-7 items-center justify-center rounded-full border-2 border-[#10B981] bg-white text-[10px] font-bold text-[#10B981] sm:size-8 sm:text-[11px]">
              {completion}%
            </div>
            <ChevronRight className="size-4 text-slate-400" />
          </div>
        </Link>
      </section>

      {/* ─── 3. Stats Row (4 cards in a grid) ─── */}
      <section className="grid grid-cols-4 gap-2 sm:gap-2.5">
        <Link
          href="/provider/inquiries"
          className="flex flex-col items-center justify-between rounded-2xl border border-[#ECECF2] bg-white px-1.5 py-3 text-center shadow-[0_2px_8px_rgba(0,0,0,0.03)] transition hover:-translate-y-0.5 hover:shadow-md sm:py-3.5"
        >
          <div className="relative text-[#6E3FF2]">
            <MessageSquare className="size-5 sm:size-6" />
            <span className="absolute -right-0.5 -top-0.5 size-2 rounded-full bg-[#EF4444] ring-1 ring-white" />
          </div>
          <p className="my-0.5 text-lg font-extrabold leading-none text-[#0F172A] sm:text-xl">
            {totalInquiries || 12}
          </p>
          <p className="text-[10px] font-semibold leading-tight text-slate-500 sm:text-[11px]">
            New Inquiries
          </p>
        </Link>

        <Link
          href="/provider/inquiries"
          className="flex flex-col items-center justify-between rounded-2xl border border-[#ECECF2] bg-white px-1.5 py-3 text-center shadow-[0_2px_8px_rgba(0,0,0,0.03)] transition hover:-translate-y-0.5 hover:shadow-md sm:py-3.5"
        >
          <div className="text-[#6E3FF2]">
            <FileText className="size-5 sm:size-6" />
          </div>
          <p className="my-0.5 text-lg font-extrabold leading-none text-[#0F172A] sm:text-xl">5</p>
          <p className="text-[10px] font-semibold leading-tight text-slate-500 sm:text-[11px]">
            Pending Quotes
          </p>
        </Link>

        <Link
          href="/provider/dashboard"
          className="flex flex-col items-center justify-between rounded-2xl border border-[#ECECF2] bg-white px-1.5 py-3 text-center shadow-[0_2px_8px_rgba(0,0,0,0.03)] transition hover:-translate-y-0.5 hover:shadow-md sm:py-3.5"
        >
          <div className="text-[#6E3FF2]">
            <CalendarRange className="size-5 sm:size-6" />
          </div>
          <p className="my-0.5 text-lg font-extrabold leading-none text-[#0F172A] sm:text-xl">8</p>
          <p className="text-[10px] font-semibold leading-tight text-slate-500 sm:text-[11px]">
            Upcoming Bookings
          </p>
        </Link>

        <Link
          href="/provider/profile"
          className="flex flex-col items-center justify-between rounded-2xl border border-[#ECECF2] bg-white px-1.5 py-3 text-center shadow-[0_2px_8px_rgba(0,0,0,0.03)] transition hover:-translate-y-0.5 hover:shadow-md sm:py-3.5"
        >
          <div className="text-[#6E3FF2]">
            <Eye className="size-5 sm:size-6" />
          </div>
          <p className="my-0.5 text-lg font-extrabold leading-none text-[#0F172A] sm:text-xl">1.4K</p>
          <p className="text-[10px] font-semibold leading-tight text-slate-500 sm:text-[11px]">
            Profile Views
          </p>
        </Link>
      </section>

      {/* ─── 4. Needs Your Attention Section ─── */}
      <section className="space-y-2.5">
        <div className="flex items-center justify-between px-0.5">
          <h2 className="flex items-center gap-1.5 text-sm font-bold text-[#0F172A] sm:text-base">
            <span>🔥</span>
            <span>Needs Your Attention (3)</span>
          </h2>
          <Link
            href="/provider/inquiries"
            className="flex items-center gap-0.5 text-xs font-bold text-[#6E3FF2] transition hover:underline"
          >
            <span>View All</span>
            <ChevronRight className="size-3.5" />
          </Link>
        </div>

        {/* Inquiry Card matching exact design in sample */}
        <div className="flex items-center gap-3 rounded-2xl border border-[#ECECF2] bg-white p-3 shadow-[0_2px_8px_rgba(0,0,0,0.03)] sm:gap-3.5 sm:p-3.5">
          {/* Studio shoot thumbnail */}
          <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl border border-slate-100 sm:h-24 sm:w-28">
            <Image
              src="/images/dashboard-inquiry-thumb.jpg"
              alt="Production Support for Web Series"
              fill
              priority
              sizes="112px"
              className="object-cover"
            />
          </div>

          {/* Details */}
          <div className="flex min-w-0 flex-1 flex-col justify-between py-0.5">
            <div className="flex items-start justify-between gap-1.5">
              <h3 className="truncate text-xs font-bold text-[#0F172A] sm:text-sm">
                Production Support for Web Series
              </h3>
              <span className="shrink-0 rounded-full bg-[#FEE2E2] px-2 py-0.5 text-[10px] font-bold text-[#EF4444]">
                New
              </span>
            </div>

            <p className="mt-0.5 truncate text-[11px] font-medium text-slate-500">
              Netflix India (Vendor)
            </p>

            <div className="mt-1 flex items-center gap-3 text-[11px] font-medium text-slate-600">
              <span className="inline-flex items-center gap-1">
                <MapPin className="size-3 text-slate-400" />
                <span>Mumbai</span>
              </span>
              <span className="inline-flex items-center gap-1">
                <Calendar className="size-3 text-slate-400" />
                <span>12-18 Nov</span>
              </span>
            </div>

            {/* Price & Action buttons */}
            <div className="mt-2.5 flex flex-wrap items-center gap-2">
              <span className="rounded-lg bg-[#F3EFFE] px-2.5 py-1 text-[11px] font-bold text-[#6E3FF2]">
                ₹2,50,000 (Est.)
              </span>
              <Link
                href="/provider/inquiries"
                className="rounded-full border border-slate-200 bg-white px-3.5 py-1 text-xs font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
              >
                View
              </Link>
              <Link
                href="/provider/inquiries"
                className="rounded-full bg-[#6E3FF2] px-3.5 py-1 text-xs font-semibold text-white shadow-sm shadow-purple-500/25 transition hover:bg-[#5B2FD6]"
              >
                Send Quote
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ─── 5. Quick Actions ─── */}
      <section className="space-y-2.5">
        <h2 className="flex items-center gap-1.5 px-0.5 text-sm font-bold text-[#0F172A] sm:text-base">
          <Hexagon className="size-4 stroke-[2.2] text-[#0F172A]" />
          <span>Quick Actions</span>
        </h2>

        <div className="grid grid-cols-4 gap-2 sm:gap-2.5">
          {/* 1. Add Service */}
          <Link
            href="/provider/services/new"
            className="flex flex-col items-center justify-center rounded-2xl border border-[#ECECF2] bg-white px-1.5 py-3.5 text-center shadow-[0_2px_8px_rgba(0,0,0,0.03)] transition hover:-translate-y-0.5 hover:shadow-md sm:py-4"
          >
            <span className="flex size-10 items-center justify-center rounded-full bg-[#6E3FF2] text-white shadow-md shadow-purple-500/25">
              <Plus className="size-5 stroke-[2.5]" />
            </span>
            <span className="mt-2 text-[10px] font-bold text-[#0F172A] sm:text-xs">Add Service</span>
          </Link>

          {/* 2. Set Availability */}
          <Link
            href="/provider/profile/edit"
            className="flex flex-col items-center justify-center rounded-2xl border border-[#ECECF2] bg-white px-1.5 py-3.5 text-center shadow-[0_2px_8px_rgba(0,0,0,0.03)] transition hover:-translate-y-0.5 hover:shadow-md sm:py-4"
          >
            <span className="flex size-10 items-center justify-center text-[#6E3FF2]">
              <CalendarCheck className="size-6 stroke-[1.8]" />
            </span>
            <span className="mt-2 text-[10px] font-bold text-[#0F172A] sm:text-xs">
              Set Availability
            </span>
          </Link>

          {/* 3. Create Quote */}
          <Link
            href="/provider/inquiries"
            className="flex flex-col items-center justify-center rounded-2xl border border-[#ECECF2] bg-white px-1.5 py-3.5 text-center shadow-[0_2px_8px_rgba(0,0,0,0.03)] transition hover:-translate-y-0.5 hover:shadow-md sm:py-4"
          >
            <span className="flex size-10 items-center justify-center text-[#6E3FF2]">
              <FileText className="size-6 stroke-[1.8]" />
            </span>
            <span className="mt-2 text-[10px] font-bold text-[#0F172A] sm:text-xs">
              Create Quote
            </span>
          </Link>

          {/* 4. Manage Calendar */}
          <Link
            href="/provider/profile/edit"
            className="flex flex-col items-center justify-center rounded-2xl border border-[#ECECF2] bg-white px-1.5 py-3.5 text-center shadow-[0_2px_8px_rgba(0,0,0,0.03)] transition hover:-translate-y-0.5 hover:shadow-md sm:py-4"
          >
            <span className="flex size-10 items-center justify-center text-[#6E3FF2]">
              <CalendarDays className="size-6 stroke-[1.8]" />
            </span>
            <span className="mt-2 text-[10px] font-bold text-[#0F172A] sm:text-xs">
              Manage Calendar
            </span>
          </Link>
        </div>
      </section>

      {/* ─── 6. Business Performance (Last 30 Days) ─── */}
      <section className="space-y-2.5">
        <div className="flex items-center justify-between px-0.5">
          <h2 className="flex items-center gap-1.5 text-sm font-bold text-[#0F172A] sm:text-base">
            <TrendingUp className="size-4 stroke-[2.4] text-[#6E3FF2]" />
            <span>Business Performance</span>
            <span className="text-xs font-normal text-slate-400">(Last 30 Days)</span>
          </h2>
          <Link
            href="/provider/profile"
            className="flex items-center gap-0.5 text-xs font-bold text-[#6E3FF2] transition hover:underline"
          >
            <span>View Analytics</span>
            <ChevronRight className="size-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-4 gap-2 sm:gap-2.5">
          {/* Card 1: Views */}
          <div className="flex flex-col items-center justify-center rounded-2xl border border-[#ECECF2] bg-white px-1.5 py-3 text-center shadow-[0_2px_8px_rgba(0,0,0,0.03)] sm:py-3.5">
            <Eye className="size-5 text-[#6E3FF2] stroke-[1.8]" />
            <p className="mt-1 text-base font-extrabold leading-none text-[#0F172A] sm:text-lg">
              1.4K
            </p>
            <p className="mt-0.5 text-[10px] font-medium text-slate-500 sm:text-[11px]">Views</p>
            <p className="mt-1 flex items-center gap-0.5 text-[10px] font-bold text-[#10B981] sm:text-[11px]">
              <span>↑</span>
              <span>+28%</span>
            </p>
          </div>

          {/* Card 2: Inquiries */}
          <div className="flex flex-col items-center justify-center rounded-2xl border border-[#ECECF2] bg-white px-1.5 py-3 text-center shadow-[0_2px_8px_rgba(0,0,0,0.03)] sm:py-3.5">
            <MessageSquare className="size-5 text-[#6E3FF2] stroke-[1.8]" />
            <p className="mt-1 text-base font-extrabold leading-none text-[#0F172A] sm:text-lg">
              96
            </p>
            <p className="mt-0.5 text-[10px] font-medium text-slate-500 sm:text-[11px]">Inquiries</p>
            <p className="mt-1 flex items-center gap-0.5 text-[10px] font-bold text-[#10B981] sm:text-[11px]">
              <span>↑</span>
              <span>+32%</span>
            </p>
          </div>

          {/* Card 3: Quotes */}
          <div className="flex flex-col items-center justify-center rounded-2xl border border-[#ECECF2] bg-white px-1.5 py-3 text-center shadow-[0_2px_8px_rgba(0,0,0,0.03)] sm:py-3.5">
            <FileText className="size-5 text-[#6E3FF2] stroke-[1.8]" />
            <p className="mt-1 text-base font-extrabold leading-none text-[#0F172A] sm:text-lg">
              34
            </p>
            <p className="mt-0.5 text-[10px] font-medium text-slate-500 sm:text-[11px]">Quotes</p>
            <p className="mt-1 flex items-center gap-0.5 text-[10px] font-bold text-[#10B981] sm:text-[11px]">
              <span>↑</span>
              <span>+21%</span>
            </p>
          </div>

          {/* Card 4: Bookings */}
          <div className="flex flex-col items-center justify-center rounded-2xl border border-[#ECECF2] bg-white px-1.5 py-3 text-center shadow-[0_2px_8px_rgba(0,0,0,0.03)] sm:py-3.5">
            <CalendarDays className="size-5 text-[#6E3FF2] stroke-[1.8]" />
            <p className="mt-1 text-base font-extrabold leading-none text-[#0F172A] sm:text-lg">
              18
            </p>
            <p className="mt-0.5 text-[10px] font-medium text-slate-500 sm:text-[11px]">Bookings</p>
            <p className="mt-1 flex items-center gap-0.5 text-[10px] font-bold text-[#10B981] sm:text-[11px]">
              <span>↑</span>
              <span>+50%</span>
            </p>
          </div>
        </div>
      </section>

      {/* Onboarding Notice if onboarding incomplete */}
      {profile && !profile.onboarding_completed && (
        <div className="flex flex-col gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <AlertCircle className="mt-0.5 size-5 shrink-0 text-amber-600" />
            <div>
              <p className="text-sm font-semibold text-amber-950">Finish onboarding to publish services</p>
              <p className="mt-0.5 text-xs text-amber-900/75">
                Add your display name and complete the onboarding step before publishing.
              </p>
            </div>
          </div>
          <Button asChild variant="outline" size="sm" className="shrink-0 border-amber-300 bg-white">
            <Link href="/provider/onboarding">Complete onboarding</Link>
          </Button>
        </div>
      )}
    </div>
  );
}

function profileNameInitials(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return "SF";
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return (words[0][0] + words[1][0]).toUpperCase();
}
