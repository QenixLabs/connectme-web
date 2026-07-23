"use client";

import { useRouter } from "next/navigation";
import { useState, useMemo } from "react";
import { UserCheck } from "lucide-react";
import { useCollaborationRequests } from "@/lib/api/hooks/useCollaborationRequests";
import { useAcceptCollaborationRequest } from "@/lib/api/hooks/useAcceptCollaborationRequest";
import { useRejectCollaborationRequest } from "@/lib/api/hooks/useRejectCollaborationRequest";
import { getApiErrorMessage } from "@/lib/formatters";
import { usePopup } from "@/hooks/use-popup";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { EmptyState } from "@/components/ui/empty-state";
import { RequestsStatsBar } from "@/components/requests/requests-stats-bar";
import { RequestCard, type RequestItem } from "@/components/requests/request-card";
import { RequesterProfileSheet } from "@/components/requests/requester-profile-sheet";
import { RequestsFilter } from "@/components/requests/requests-filter";
import { SafetyBanner } from "@/components/requests/safety-banner";
import { GrainOverlay } from "@/components/requests/grain-overlay";

type SortKey = "newest" | "oldest";

interface RequesterProfile {
  _id: string;
  email: string;
  role?: string;
  full_legal_name?: string;
  username?: string;
  slug?: string;
  company_name?: string;
  company_website?: string;
  company_size?: string;
  specialties?: string[];
  position?: string;
  profile_photo?: string;
  verification_status?: string;
}

export default function TalentRequestsPage() {
  const router = useRouter();
  const popup = usePopup();
  const { data, isLoading, error } = useCollaborationRequests();
  const acceptMutation = useAcceptCollaborationRequest();
  const rejectMutation = useRejectCollaborationRequest();
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("received");
  const [receivedSort, setReceivedSort] = useState<SortKey>("newest");
  const [sentSort, setSentSort] = useState<SortKey>("newest");
  const [historySort, setHistorySort] = useState<SortKey>("newest");
  const [hasMessageOnly, setHasMessageOnly] = useState(false);
  const [selectedRequester, setSelectedRequester] = useState<RequesterProfile | null>(null);
  const [profileSheetOpen, setProfileSheetOpen] = useState(false);

  const received: RequestItem[] = (data?.received ?? []) as RequestItem[];
  const rawSent: RequestItem[] = (data?.sent ?? []) as RequestItem[];

  const sent = useMemo(
    () =>
      rawSent.map((req) => ({
        ...req,
        requester_id:
          ((req as unknown as Record<string, unknown>).receiver_id as RequesterProfile) ||
          req.requester_id,
      })),
    [rawSent]
  );

  const pendingReceived = received.filter((r) => r.status === "pending");
  const acceptedReceived = received.filter((r) => r.status === "accepted");
  const rejectedReceived = received.filter((r) => r.status === "rejected");
  const historyReceived = received.filter((r) => r.status !== "pending");

  const pendingSent = sent.filter((r) => r.status === "pending");
  const acceptedSent = sent.filter((r) => r.status === "accepted");

  const sortRequests = (requests: RequestItem[], sort: SortKey) => {
    return [...requests].sort((a, b) => {
      const diff =
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      return sort === "newest" ? diff : -diff;
    });
  };

  const filterByMessage = (requests: RequestItem[]) => {
    if (!hasMessageOnly) return requests;
    return requests.filter((r) => r.message);
  };

  const displayedPending = useMemo(
    () => filterByMessage(sortRequests(pendingReceived, receivedSort)),
    [pendingReceived, receivedSort, hasMessageOnly]
  );

  const displayedHistory = useMemo(
    () => sortRequests(historyReceived, historySort),
    [historyReceived, historySort]
  );

  const displayedSent = useMemo(
    () => sortRequests(sent, sentSort),
    [sent, sentSort]
  );

  const handleAccept = async (requestId: string) => {
    setProcessingId(requestId);
    try {
      const result = await acceptMutation.mutateAsync(requestId);
      popup.show({
        title: "Request accepted",
        description: "You can now message this recruiter.",
        variant: "success",
      });
      if (result?.conversation?._id) {
        router.push(
          `/talent/messages?conversationId=${result.conversation._id}`
        );
      }
    } catch (err) {
      popup.show({
        title: "Failed to accept",
        description: getApiErrorMessage(err, "Something went wrong"),
        variant: "error",
      });
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (requestId: string) => {
    setProcessingId(requestId);
    try {
      await rejectMutation.mutateAsync(requestId);
      popup.show({
        title: "Request rejected",
        description: "The request has been dismissed.",
        variant: "info",
      });
    } catch (err) {
      popup.show({
        title: "Failed to reject",
        description: getApiErrorMessage(err, "Something went wrong"),
        variant: "error",
      });
    } finally {
      setProcessingId(null);
    }
  };

  const handleViewProfile = (requester: RequesterProfile) => {
    setSelectedRequester(requester);
    setProfileSheetOpen(true);
  };

  const handleProfileClick = (requester: RequesterProfile) => {
    if (requester.role === "recruiter" && requester.slug) {
      router.push(`/recruiter/${requester.slug}`);
    } else if (requester.role === "talent" && requester.username) {
      router.push(`/talent/${requester.username}`);
    }
  };

  const emptyStateIcon = (
    <UserCheck className="w-5 h-5 text-text-muted" strokeWidth={1.5} />
  );

  if (isLoading) {
    return (
      <div className="relative min-h-screen bg-page">
        <GrainOverlay />
        <div className="relative z-10 px-4 pt-6 pb-0 space-y-4">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-14 w-full rounded-xl" />
          <div className="flex gap-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-9 w-20 rounded-lg" />
            ))}
          </div>
          <div className="rounded-2xl bg-card border border-border divide-y divide-border-subtle">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="px-4 py-4">
                <div className="flex gap-4">
                  <Skeleton className="w-[56px] h-[56px] rounded-xl flex-shrink-0" />
                  <div className="flex-1 space-y-2.5 py-1">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-40" />
                    <div className="flex gap-2.5 pt-1">
                      <Skeleton className="h-10 flex-1 rounded-lg" />
                      <Skeleton className="h-10 flex-1 rounded-lg" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="relative min-h-screen bg-page">
        <GrainOverlay />
        <div className="relative z-10 px-4 pt-6 pb-20">
          <h1 className="text-lg font-semibold text-text-primary mb-4">
            Connection Requests
          </h1>
          <div className="bg-error-surface text-error border border-error-border text-sm rounded-xl p-4">
            {getApiErrorMessage(error, "Failed to load requests")}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-page">
      <GrainOverlay />

      <div className="relative z-10 px-4 pt-5 space-y-4">
        <h1 className="text-lg font-semibold text-text-primary">
          Connection Requests
        </h1>

        <SafetyBanner />

        <RequestsStatsBar
          pendingCount={pendingReceived.length}
          acceptedCount={acceptedReceived.length}
          rejectedCount={rejectedReceived.length}
          sentCount={sent.length}
          sentAcceptedCount={acceptedSent.length}
        />

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full grid grid-cols-3 h-auto p-[3px] bg-muted rounded-xl border border-border">
            <TabsTrigger
              value="received"
              className="text-xs py-2 data-[state=active]:bg-background data-[state=active]:shadow-sm data-[state=active]:border-border rounded-lg text-text-secondary data-[state=active]:text-text-primary border border-transparent"
            >
              Received
              {pendingReceived.length > 0 && (
                <span className="ml-1.5 inline-flex items-center justify-center min-w-[18px] h-[18px] rounded-full bg-brand text-white text-[10px] font-semibold px-1">
                  {pendingReceived.length}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger
              value="sent"
              className="text-xs py-2 data-[state=active]:bg-background data-[state=active]:shadow-sm data-[state=active]:border-border rounded-lg text-text-secondary data-[state=active]:text-text-primary border border-transparent"
            >
              Sent
              {pendingSent.length > 0 && (
                <span className="ml-1.5 text-[10px] text-text-muted">
                  ({pendingSent.length})
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger
              value="history"
              className="text-xs py-2 data-[state=active]:bg-background data-[state=active]:shadow-sm data-[state=active]:border-border rounded-lg text-text-secondary data-[state=active]:text-text-primary border border-transparent"
            >
              History
            </TabsTrigger>
          </TabsList>

          <TabsContent value="received" className="mt-4 space-y-3">
            <RequestsFilter
              sort={receivedSort}
              onSortChange={setReceivedSort}
              showMessageFilter
              hasMessageOnly={hasMessageOnly}
              onHasMessageToggle={() => setHasMessageOnly(!hasMessageOnly)}
            />

            {displayedPending.length === 0 ? (
              <EmptyState
                icon={emptyStateIcon}
                title="No pending requests"
                description={
                  hasMessageOnly
                    ? "No pending requests with messages."
                    : "When recruiters request to connect, they'll appear here."
                }
              />
            ) : (
              <div className="rounded-2xl bg-card border border-border divide-y divide-border-subtle overflow-hidden">
                {displayedPending.map((req) => (
                  <RequestCard
                    key={req._id}
                    request={req}
                    isProcessing={processingId === req._id}
                    onAccept={handleAccept}
                    onReject={handleReject}
                    onViewProfile={handleViewProfile}
                    onProfileClick={handleProfileClick}
                    mode="received"
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="sent" className="mt-4 space-y-3">
            <RequestsFilter sort={sentSort} onSortChange={setSentSort} />

            {displayedSent.length === 0 ? (
              <EmptyState
                icon={emptyStateIcon}
                title="No sent requests"
                description="Requests you've sent to other users will appear here."
              />
            ) : (
              <div className="rounded-2xl bg-card border border-border divide-y divide-border-subtle overflow-hidden">
                {displayedSent.map((req) => (
                  <RequestCard
                    key={req._id}
                    request={req}
                    isProcessing={false}
                    onAccept={() => {}}
                    onReject={() => {}}
                    onViewProfile={handleViewProfile}
                    onProfileClick={handleProfileClick}
                    mode="sent"
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="history" className="mt-4 space-y-3">
            <RequestsFilter sort={historySort} onSortChange={setHistorySort} />

            {displayedHistory.length === 0 ? (
              <EmptyState
                icon={emptyStateIcon}
                title="No past requests"
                description="Accepted and declined requests will appear here."
              />
            ) : (
              <div className="rounded-2xl bg-card border border-border divide-y divide-border-subtle overflow-hidden">
                {displayedHistory.map((req) => (
                  <RequestCard
                    key={req._id}
                    request={req}
                    isProcessing={false}
                    onAccept={handleAccept}
                    onReject={handleReject}
                    onViewProfile={handleViewProfile}
                    onProfileClick={handleProfileClick}
                    mode="history"
                  />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>

        <RequesterProfileSheet
          open={profileSheetOpen}
          onOpenChange={setProfileSheetOpen}
          requester={selectedRequester}
        />
      </div>
    </div>
  );
}
