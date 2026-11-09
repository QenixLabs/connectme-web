"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import {
  ArrowUpRight,
  CalendarDays,
  Check,
  ChevronLeft,
  CircleDollarSign,
  Inbox,
  Image as ImageIcon,
  MapPin,
  MessageSquare,
  Search,
  Send,
} from "lucide-react";
import { toast } from "sonner";
import { conversationsApi, serviceInquiriesApi } from "@/lib/api";
import type {
  Conversation,
  Message,
  ServiceInquiry,
  ServiceInquiryStatus,
} from "@/lib/api";
import { getApiErrorMessage } from "@/lib/api/client";
import { servicesApi } from "@/lib/api/marketplace";
import { queryKeys } from "@/lib/api/query-keys";
import { getConversationParticipant, getMessageSenderId } from "@/lib/messages";
import { authStore } from "@/stores/auth-store";
import { useStore } from "zustand/react";
import { InquiryStatus } from "@/components/service-inquiries/inquiry-status";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";

const PAGE_SIZE = 20;
const STATUS_FILTERS: {
  label: string;
  value: ServiceInquiryStatus | undefined;
}[] = [
  { label: "All", value: undefined },
  { label: "New", value: "new" },
  { label: "Responded", value: "responded" },
  { label: "Closed", value: "closed" },
];

function participantName(conversation: Conversation | undefined, userId?: string) {
  const participant = getConversationParticipant(conversation, userId);
  return (
    participant?.full_legal_name ||
    participant?.display_name ||
    participant?.business_name ||
    participant?.company_name ||
    participant?.username ||
    "Requester"
  );
}

function initials(name: string) {
  return (
    name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join("") || "R"
  );
}

function dateLabel(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "Recently"
    : formatDistanceToNow(date, { addSuffix: true });
}

function formatBudget(inquiry: ServiceInquiry) {
  if (!inquiry.budget) return "Budget not specified";
  return `${inquiry.budget.currency} ${inquiry.budget.amount.toLocaleString()}`;
}

export default function ProviderInquiriesPage() {
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState<ServiceInquiryStatus | undefined>();
  const [search, setSearch] = useState("");
  const [activeId, setActiveId] = useState<string | null>(null);
  const [messageText, setMessageText] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();
  const currentUserId = useStore(authStore, (state) => state.user?._id);
  const filters = { page, limit: PAGE_SIZE, status };
  const inquiriesQuery = useQuery({
    queryKey: queryKeys.serviceInquiries.incoming(filters),
    queryFn: () => serviceInquiriesApi.getIncoming(filters),
    retry: false,
  });
  const servicesQuery = useQuery({
    queryKey: queryKeys.services.mine({ status: "all", limit: 50 }),
    queryFn: () => servicesApi.getMine({ status: "all", limit: 50 }),
    retry: false,
  });
  const conversationsQuery = useQuery({
    queryKey: queryKeys.messages.conversations(),
    queryFn: () => conversationsApi.getConversations({ limit: 50 }),
    retry: false,
  });

  const servicesById = useMemo(
    () => new Map((servicesQuery.data?.data ?? []).map((service) => [service.id, service])),
    [servicesQuery.data?.data],
  );
  const matchingInquiries = useMemo(() => {
    const inquiries = inquiriesQuery.data?.data ?? [];
    const normalizedSearch = search.trim().toLowerCase();
    if (!normalizedSearch) return inquiries;
    return inquiries.filter((inquiry) => {
      const itemConversation = conversationsQuery.data?.find(
        (item) => item._id === inquiry.conversation_id,
      );
      const serviceTitle = inquiry.service_id
        ? servicesById.get(inquiry.service_id)?.title
        : undefined;
      return [
        participantName(itemConversation, currentUserId),
        serviceTitle,
        inquiry.description,
        inquiry.location,
        inquiry.requester_id,
        inquiry.service_id,
      ].some((value) => value?.toLowerCase().includes(normalizedSearch));
    });
  }, [
    conversationsQuery.data,
    currentUserId,
    inquiriesQuery.data?.data,
    search,
    servicesById,
  ]);
  const selectedInquiry =
    matchingInquiries.find((inquiry) => inquiry.id === activeId) ??
    matchingInquiries[0];
  const selectedService = selectedInquiry?.service_id
    ? servicesById.get(selectedInquiry.service_id)
    : undefined;
  const selectedServiceImage =
    selectedService?.image_urls?.[0] || selectedService?.images?.[0];
  const selectedServiceTitle = selectedService?.title || (
    selectedInquiry?.service_id
      ? servicesQuery.isError
        ? "Could not load service details"
        : servicesQuery.isPending
          ? "Loading service..."
          : "Service details unavailable"
      : "General inquiry"
  );
  const showMobileDetail = Boolean(
    activeId && matchingInquiries.some((inquiry) => inquiry.id === activeId),
  );
  const conversationId = selectedInquiry?.conversation_id ?? "";
  const conversationQuery = useQuery({
    queryKey: queryKeys.messages.conversation(conversationId),
    queryFn: () => conversationsApi.getConversation(conversationId),
    enabled: Boolean(conversationId),
    retry: false,
  });
  const messagesQuery = useQuery({
    queryKey: queryKeys.messages.thread(conversationId),
    queryFn: () => conversationsApi.getMessages(conversationId, { limit: 50 }),
    enabled: Boolean(conversationId),
    retry: false,
  });
  const conversation = conversationQuery.data;
  const requester = participantName(conversation, currentUserId);
  const requesterProfile = getConversationParticipant(
    conversation,
    currentUserId,
  );

  const sendMessage = useMutation({
    mutationFn: (content: string) =>
      conversationsApi.sendMessage({
        conversation_id: conversationId,
        content,
        client_message_id: crypto.randomUUID(),
      }),
    onSuccess: async (message) => {
      queryClient.setQueryData<Message[]>(
        queryKeys.messages.thread(conversationId),
        (messages) =>
          messages?.some((item) => item._id === message._id)
            ? messages
            : [...(messages ?? []), message],
      );
      setMessageText("");
      await queryClient.invalidateQueries({
        queryKey: queryKeys.messages.conversations(),
      });
    },
    onError: (error) =>
      toast.error(getApiErrorMessage(error, "Could not send your message.")),
  });
  const updateInquiry = useMutation({
    mutationFn: ({
      inquiryId,
      status: nextStatus,
    }: {
      inquiryId: string;
      status: "responded" | "closed";
    }) => serviceInquiriesApi.update(inquiryId, { status: nextStatus }),
    onSuccess: async (_result, { status: nextStatus }) => {
      await queryClient.invalidateQueries({
        queryKey: ["service-inquiries"],
      });
      toast.success(
        nextStatus === "responded" ? "Inquiry marked as responded" : "Inquiry closed",
      );
    },
    onError: (error) =>
      toast.error(getApiErrorMessage(error, "Could not update this inquiry.")),
  });

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messagesQuery.data]);

  useEffect(() => {
    if (
      !conversationId ||
      !conversation ||
      !currentUserId ||
      !conversation.unread_counts[currentUserId]
    ) {
      return;
    }

    conversationsApi
      .markAllRead(conversationId)
      .then(() => {
        queryClient.setQueryData<Conversation>(
          queryKeys.messages.conversation(conversationId),
          (current) =>
            current
              ? {
                  ...current,
                  unread_counts: {
                    ...current.unread_counts,
                    [currentUserId]: 0,
                  },
                }
              : current,
        );
        return queryClient.invalidateQueries({
          queryKey: queryKeys.messages.conversations(),
        });
      })
      .catch((error: unknown) =>
        toast.error(getApiErrorMessage(error, "Could not mark messages as read.")),
      );
  }, [conversation, conversationId, currentUserId, queryClient]);

  function handleSendMessage() {
    const content = messageText.trim();
    if (!content || sendMessage.isPending || !conversationId) return;
    sendMessage.mutate(content);
  }

  if (inquiriesQuery.isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-16 w-80" />
        <div className="grid gap-5 xl:grid-cols-[minmax(18rem,0.8fr)_minmax(0,1.5fr)]">
          <Skeleton className="h-[620px]" />
          <Skeleton className="h-[620px]" />
        </div>
      </div>
    );
  }

  if (inquiriesQuery.isError) {
    return (
      <Card>
        <CardContent className="space-y-3 p-6">
          <h1 className="text-xl font-semibold">Could not load your inbox</h1>
          <p role="alert" className="text-sm text-destructive">
            {getApiErrorMessage(inquiriesQuery.error, "Please try again.")}
          </p>
          <Button variant="outline" onClick={() => void inquiriesQuery.refetch()}>
            Try again
          </Button>
        </CardContent>
      </Card>
    );
  }

  const result = inquiriesQuery.data;
  if (!result) {
    return (
      <Card>
        <CardContent className="space-y-3 p-6">
          <h1 className="text-xl font-semibold">Could not load your inbox</h1>
          <p role="alert" className="text-sm text-destructive">
            The service returned no inquiry data. Please try again.
          </p>
          <Button variant="outline" onClick={() => void inquiriesQuery.refetch()}>
            Try again
          </Button>
        </CardContent>
      </Card>
    );
  }
  const unreadCount = conversation
    ? conversation.unread_counts[currentUserId ?? ""] ?? 0
    : 0;
  const messages = [...(messagesQuery.data ?? [])].sort(
    (first, second) =>
      new Date(first.created_at).getTime() -
      new Date(second.created_at).getTime(),
  );

  return (
    <div className="space-y-3 sm:space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#e9e4f4] bg-gradient-to-br from-white via-white to-[#f5f0ff] px-4 py-3.5 shadow-[0_8px_24px_-22px_rgba(74,38,150,0.5)] sm:items-end sm:border-0 sm:bg-transparent sm:px-0 sm:py-0 sm:shadow-none">
        <div className="min-w-0 flex-1">
          <p className="mb-1 text-[9px] font-bold uppercase tracking-[0.18em] text-[#6546dc] sm:text-[10px]">
            Provider inbox
          </p>
          <h1 className="whitespace-nowrap text-[20px] font-extrabold tracking-tight text-[#171b45] sm:text-4xl">
            Inquiries &amp; Quotes
          </h1>
          <p className="mt-1 max-w-[36rem] text-[11px] leading-4 text-slate-500 sm:mt-2 sm:text-sm sm:leading-normal">
            Review requests and continue the conversation with each requester.
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2 rounded-xl border border-[#e7e2f1] bg-white/85 px-2.5 py-2 text-xs shadow-sm sm:gap-2.5 sm:px-4 sm:py-2.5 sm:text-sm">
          <span className="grid size-7 place-items-center rounded-lg bg-[#f0ebff] text-[#5b35eb] sm:size-8">
            <Inbox className="size-3.5 sm:size-4" />
          </span>
          <span className="font-bold text-[#171b45] tabular-nums">{result.total}</span>
          <span className="hidden text-slate-500 sm:inline">
            {status ? `${status} inquiries` : "total inquiries"}
          </span>
          <span className="text-slate-500 sm:hidden">total</span>
        </div>
      </div>

      <div className="grid min-h-0 items-start gap-3 xl:min-h-[620px] xl:grid-cols-[minmax(18rem,0.8fr)_minmax(0,1.5fr)] xl:gap-4">
        <Card className={`${showMobileDetail ? "hidden xl:flex" : "flex"} min-h-0 flex-col gap-0 overflow-hidden rounded-none border-0 bg-transparent py-0 text-[#172554] shadow-none sm:rounded-2xl sm:border sm:border-[#e7e9f2] sm:bg-white sm:shadow-[0_12px_32px_-26px_rgba(27,30,74,0.4)] xl:min-h-[520px]`}>
          <div className="space-y-2 bg-transparent pb-2 sm:border-b sm:border-[#eff0f5] sm:bg-[#fdfdff] sm:p-4">
            <div className="flex gap-1 overflow-x-auto rounded-2xl border border-[#ebe7f2] bg-white/80 p-1 shadow-[0_3px_10px_-8px_rgba(39,27,75,0.35)] justify-around">
              {STATUS_FILTERS.map((filter) => (
                <Button
                  key={filter.label}
                  type="button"
                  size="sm"
                  variant="ghost"
                  className={`h-8 shrink-0 rounded-xl px-3 text-xs transition-colors ${
                    status === filter.value
                      ? "bg-[#681fe8] font-semibold text-white shadow-sm hover:bg-[#5c18d3] hover:text-white"
                      : "bg-transparent text-[#595570] hover:bg-[#f5f2fb] hover:text-[#4b16f5]"
                  }`}
                  aria-pressed={status === filter.value}
                  onClick={() => {
                    setStatus(filter.value);
                    setPage(1);
                    setActiveId(null);
                  }}
                >
                  {filter.label}
                </Button>
              ))}
            </div>
            <label className="relative block">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-[#77728d]" />
              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search by project, company or service..."
                aria-label="Search inquiries"
                className="h-10 rounded-2xl border-[#e7e4ee] bg-white pl-10 text-[13px] text-[#172554] shadow-[0_3px_12px_-9px_rgba(39,27,75,0.35)] placeholder:text-slate-400 focus-visible:border-[#c5b4ed] focus-visible:ring-2 focus-visible:ring-[#7659ed]/20"
              />
            </label>
          </div>

          <div className="min-h-0 space-y-2 overflow-y-auto sm:flex-1 sm:space-y-0">
            {matchingInquiries.length === 0 ? (
              <div className="flex min-h-64 flex-col items-center justify-center rounded-2xl bg-white px-6 text-center sm:rounded-none">
                <Inbox className="size-9 text-muted-foreground" />
                <p className="mt-3 font-semibold">
                  {search ? "No matching inquiries" : "Your inbox is clear"}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {search
                    ? "Try another search or choose a different status."
                    : "New service inquiries will appear here."}
                </p>
              </div>
            ) : (
              matchingInquiries.map((inquiry) => {
                const itemConversation = conversationsQuery.data?.find(
                  (item) => item._id === inquiry.conversation_id,
                );
                const name = participantName(itemConversation, currentUserId);
                const unread =
                  itemConversation?.unread_counts[currentUserId ?? ""] ?? 0;
                const active = selectedInquiry?.id === inquiry.id;
                const service = inquiry.service_id
                  ? servicesById.get(inquiry.service_id)
                  : undefined;
                const serviceImage = service?.image_urls?.[0] || service?.images?.[0];
                const serviceTitle = service?.title || (
                  inquiry.service_id
                    ? servicesQuery.isError
                      ? "Could not load service details"
                      : servicesQuery.isPending
                        ? "Loading service..."
                        : "Service details unavailable"
                    : "General inquiry"
                );
                return (
                  <article
                    key={inquiry.id}
                    className={`overflow-hidden rounded-2xl border border-[#e9e7f1] bg-white p-2.5 shadow-[0_5px_16px_-12px_rgba(36,24,80,0.3)] transition-all hover:border-[#d8cbed] hover:shadow-[0_10px_24px_-18px_rgba(74,38,150,0.42)] sm:rounded-none sm:border-0 sm:border-b sm:p-4 sm:shadow-none sm:hover:bg-[#fcfbff] sm:hover:shadow-none ${
                      active ? "ring-1 ring-inset ring-[#7659ed]/40 sm:bg-primary/5" : ""
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => setActiveId(inquiry.id)}
                      aria-current={active ? "true" : undefined}
                      className="flex w-full min-w-0 items-start gap-3 text-left"
                    >
                      <div className="grid size-16 shrink-0 place-items-center overflow-hidden rounded-xl border border-[#edf0f5] bg-gradient-to-br from-[#f2efff] to-[#f8f9fc]">
                        {serviceImage ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={serviceImage}
                            alt={`${serviceTitle} service`}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <ImageIcon
                            className="size-6 text-[#8b7ae2]"
                            aria-hidden="true"
                          />
                        )}
                      </div>
                      <span className="min-w-0 flex-1">
                        <span className="flex items-start justify-between gap-2">
                          <span className="truncate text-[14px] font-bold leading-[1.2] text-[#171b45]">
                            {serviceTitle}
                          </span>
                          <span className="shrink-0 text-[10px] text-slate-500">
                            {dateLabel(inquiry.created_at)}
                          </span>
                        </span>
                        <span className="mt-1 flex min-w-0 items-center justify-between gap-1.5">
                          <span className="truncate text-xs font-medium text-slate-600">
                            {name}
                          </span>
                          <InquiryStatus status={inquiry.status} />
                          {unread > 0 && (
                            <span className="shrink-0 rounded-full bg-[#fce7f3] px-1.5 py-0.5 text-[10px] font-semibold text-[#be185d]">
                              {unread} unread
                            </span>
                          )}
                        </span>
                        <span className="mt-1 block truncate text-[11px] leading-snug text-slate-500">
                          {inquiry.description.split(/\r?\n/, 1)[0]}
                        </span>
                        <span className="mt-1.5 flex min-w-0 items-center gap-x-2 overflow-hidden text-[10px] text-slate-600">
                          {inquiry.location && (
                            <span className="inline-flex min-w-0 items-center gap-1 truncate">
                              <MapPin className="size-3" />
                              {inquiry.location}
                            </span>
                          )}
                          {inquiry.requested_date && (
                            <span className="inline-flex shrink-0 items-center gap-1">
                              <CalendarDays className="size-3" />
                              {new Date(inquiry.requested_date).toLocaleDateString(
                                [],
                                { day: "numeric", month: "short" },
                              )}
                            </span>
                          )}
                          {inquiry.budget && (
                            <span className="shrink-0 truncate font-semibold text-[#4b16b5]">
                              {formatBudget(inquiry)}
                            </span>
                          )}
                        </span>
                      </span>
                    </button>
                    <div className="mt-2.5 flex items-center gap-1.5 border-t border-[#f0eef5] pt-2">
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        className="h-7 flex-1 rounded-lg border-[#e6e4ee] bg-[#f8f8fb] px-2 text-[10px] text-[#22234a] hover:bg-[#f0edf8]"
                        onClick={() => setActiveId(inquiry.id)}
                      >
                        View details
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        className="h-7 flex-1 rounded-lg border-[#e6e4ee] bg-[#f8f8fb] px-2 text-[10px] text-[#22234a] hover:bg-[#f0edf8]"
                        asChild
                      >
                        <Link
                          href={`/provider/messages/${inquiry.conversation_id}${
                            inquiry.service_id
                              ? `?serviceId=${encodeURIComponent(inquiry.service_id)}`
                              : ""
                          }`}
                        >
                          <MessageSquare className="size-3.5" />
                          Message
                          {unread > 0 && (
                            <span className="sr-only">
                              , {unread} unread messages
                            </span>
                          )}
                        </Link>
                      </Button>
                      {inquiry.status === "new" && (
                        <Button
                          type="button"
                          size="sm"
                          className="h-7 flex-1 rounded-lg bg-[#701de2] px-2 text-[10px] text-white hover:bg-[#5f17c6]"
                          disabled={updateInquiry.isPending}
                          onClick={() =>
                            updateInquiry.mutate({
                              inquiryId: inquiry.id,
                              status: "responded",
                            })
                          }
                        >
                          <Check className="size-3.5" />
                          Respond
                        </Button>
                      )}
                      {unread > 0 && (
                        <span className="sr-only">
                          {unread} unread message{unread === 1 ? "" : "s"}
                        </span>
                      )}
                    </div>
                  </article>
                );
              })
            )}
          </div>

          <div className="flex items-center justify-between border-t border-[#eeeaf5] bg-white/70 p-2 sm:p-3">
            <Button
              variant="ghost"
              size="sm"
              disabled={result.page <= 1}
              onClick={() => setPage((value) => value - 1)}
            >
              <ChevronLeft className="size-4" />
              Previous
            </Button>
            <span className="text-xs text-muted-foreground">
              Page {result.page}
            </span>
            <Button
              variant="ghost"
              size="sm"
              disabled={!result.hasMore}
              onClick={() => setPage((value) => value + 1)}
            >
              Next
              <ArrowUpRight className="size-4" />
            </Button>
          </div>
        </Card>

        <Card className={`${showMobileDetail ? "flex" : "hidden xl:flex"} min-h-0 flex-col gap-0 overflow-hidden rounded-2xl border-[#e7e9f2] bg-white py-0 text-[#172554] shadow-[0_12px_32px_-26px_rgba(27,30,74,0.4)] xl:min-h-[520px]`}>
          {!selectedInquiry ? (
            <CardContent className="flex flex-1 flex-col items-center justify-center p-8 text-center">
              <MessageSquare className="size-10 text-muted-foreground" />
              <p className="mt-3 font-semibold">Choose an inquiry</p>
              <p className="mt-1 max-w-sm text-sm text-muted-foreground">
                Select a request from your inbox to review its details and reply.
              </p>
            </CardContent>
          ) : (
            <>
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#eff0f5] bg-gradient-to-r from-white to-[#fcfbff] p-4">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start xl:hidden"
                  onClick={() => setActiveId(null)}
                >
                  <ChevronLeft className="size-4" />
                  All inquiries
                </Button>
                <div className="flex min-w-0 items-center gap-3">
                  <Avatar className="size-11">
                    <AvatarImage
                      src={requesterProfile?.profile_photo}
                      alt=""
                    />
                    <AvatarFallback className="bg-primary/10 font-semibold text-primary">
                      {initials(requester)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <h2 className="truncate font-semibold">{requester}</h2>
                    <p className="text-xs text-muted-foreground">
                      Requester
                      {requesterProfile?.location?.city
                        ? ` · ${requesterProfile.location.city}`
                        : ""}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <InquiryStatus status={selectedInquiry.status} />
                  <Button variant="outline" size="sm" asChild>
                    <Link
                      href={`/provider/messages/${selectedInquiry.conversation_id}${
                        selectedInquiry.service_id
                          ? `?serviceId=${encodeURIComponent(selectedInquiry.service_id)}`
                          : ""
                      }`}
                    >
                      Open full chat <ArrowUpRight className="size-4" />
                    </Link>
                  </Button>
                </div>
              </div>

              <div className="border-b border-[#eff0f5] bg-[#faf9ff] p-4">
                <div className="mb-4 flex min-w-0 items-center gap-3 rounded-xl border border-[#ebe7f5] bg-white p-2.5">
                  <div className="grid size-14 shrink-0 place-items-center overflow-hidden rounded-lg bg-gradient-to-br from-[#f2efff] to-[#f8f9fc]">
                    {selectedServiceImage ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={selectedServiceImage}
                        alt={`${selectedServiceTitle} service`}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <ImageIcon
                        className="size-5 text-[#8b7ae2]"
                        aria-hidden="true"
                      />
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-[11px] font-medium text-slate-500">
                      Inquiring about
                    </p>
                    <p className="truncate text-sm font-semibold text-[#171b45]">
                      {selectedServiceTitle}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm font-semibold">
                  <MessageSquare className="size-4 text-primary" />
                  Service request
                </div>
                <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed">
                  {selectedInquiry.description}
                </p>
                <div className="mt-4 grid gap-3 text-xs sm:grid-cols-3">
                  <div className="flex items-start gap-2">
                    <CircleDollarSign className="mt-0.5 size-4 shrink-0 text-primary" />
                    <span>
                      <span className="block text-muted-foreground">Budget</span>
                      <span className="font-medium">
                        {formatBudget(selectedInquiry)}
                      </span>
                    </span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CalendarDays className="mt-0.5 size-4 shrink-0 text-primary" />
                    <span>
                      <span className="block text-muted-foreground">
                        Requested date
                      </span>
                      <span className="font-medium">
                        {selectedInquiry.requested_date
                          ? new Date(
                              selectedInquiry.requested_date,
                            ).toLocaleDateString()
                          : "Not specified"}
                      </span>
                    </span>
                  </div>
                  <div className="flex items-start gap-2">
                    <MapPin className="mt-0.5 size-4 shrink-0 text-primary" />
                    <span>
                      <span className="block text-muted-foreground">Location</span>
                      <span className="font-medium">
                        {selectedInquiry.location || "Not specified"}
                      </span>
                    </span>
                  </div>
                </div>
              </div>

              <div
                className="flex min-h-40 flex-1 flex-col gap-3 overflow-y-auto p-4"
                aria-label="Inquiry conversation"
                aria-live="polite"
              >
                {messagesQuery.isLoading ? (
                  <div className="space-y-3">
                    <Skeleton className="h-12 w-3/4" />
                    <Skeleton className="ml-auto h-12 w-2/3" />
                    <Skeleton className="h-12 w-1/2" />
                  </div>
                ) : messagesQuery.isError ? (
                  <div className="m-auto max-w-sm text-center">
                    <p role="alert" className="text-sm text-destructive">
                      {getApiErrorMessage(
                        messagesQuery.error,
                        "Could not load this conversation.",
                      )}
                    </p>
                    <Button
                      className="mt-2"
                      size="sm"
                      variant="outline"
                      onClick={() => void messagesQuery.refetch()}
                    >
                      Try again
                    </Button>
                  </div>
                ) : messages.length === 0 ? (
                  <div className="m-auto text-center">
                    <MessageSquare className="mx-auto size-7 text-muted-foreground" />
                    <p className="mt-2 text-sm font-medium">No messages yet</p>
                    <p className="text-xs text-muted-foreground">
                      Send a reply to start the conversation.
                    </p>
                  </div>
                ) : (
                  messages.map((message) => {
                    const mine = getMessageSenderId(message) === currentUserId;
                    return (
                      <div
                        key={message._id}
                        className={`flex ${mine ? "justify-end" : "justify-start"}`}
                      >
                        <div
                          className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 ${
                            mine
                              ? "rounded-br-sm bg-primary text-primary-foreground"
                              : "rounded-bl-sm bg-muted"
                          }`}
                        >
                          <p className="whitespace-pre-wrap break-words text-sm">
                            {message.content}
                          </p>
                          <p
                            className={`mt-1 flex items-center justify-end gap-1 text-[10px] ${
                              mine
                                ? "text-primary-foreground/70"
                                : "text-muted-foreground"
                            }`}
                          >
                            {new Date(message.created_at).toLocaleTimeString(
                              [],
                              { hour: "numeric", minute: "2-digit" },
                            )}
                            {mine && message.status === "read" && (
                              <Check className="size-3" aria-label="Read" />
                            )}
                          </p>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={bottomRef} />
              </div>

              <div className="space-y-3 border-t p-4">
                <form
                  className="flex items-end gap-2"
                  onSubmit={(event) => {
                    event.preventDefault();
                    handleSendMessage();
                  }}
                >
                  <Textarea
                    value={messageText}
                    onChange={(event) => setMessageText(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" && !event.shiftKey) {
                        event.preventDefault();
                        handleSendMessage();
                      }
                    }}
                    placeholder={`Reply to ${requester}...`}
                    aria-label="Write a reply"
                    rows={2}
                    className="max-h-32 min-h-10 resize-y"
                    disabled={sendMessage.isPending}
                  />
                  <Button
                    type="submit"
                    size="icon"
                    aria-label="Send reply"
                    disabled={
                      !messageText.trim() ||
                      sendMessage.isPending ||
                      messagesQuery.isError
                    }
                  >
                    <Send className="size-4" />
                  </Button>
                </form>
                <div className="flex flex-wrap gap-2">
                  {selectedInquiry.status === "new" && (
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={updateInquiry.isPending}
                      onClick={() =>
                        updateInquiry.mutate({
                          inquiryId: selectedInquiry.id,
                          status: "responded",
                        })
                      }
                    >
                      <Check className="size-4" />
                      Mark responded
                    </Button>
                  )}
                  {selectedInquiry.status !== "closed" && (
                    <Button
                      size="sm"
                      variant="ghost"
                      disabled={updateInquiry.isPending}
                      onClick={() =>
                        updateInquiry.mutate({
                          inquiryId: selectedInquiry.id,
                          status: "closed",
                        })
                      }
                    >
                      Close inquiry
                    </Button>
                  )}
                </div>
                {unreadCount > 0 && (
                  <p className="text-xs text-muted-foreground">
                    {unreadCount} unread message{unreadCount === 1 ? "" : "s"}
                  </p>
                )}
              </div>
            </>
          )}
        </Card>
      </div>
    </div>
  );
}
