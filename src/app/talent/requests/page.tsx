"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { UserCheck, Check, X, Mail, Clock } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useCollaborationRequests } from "@/lib/api/hooks/useCollaborationRequests";
import { useAcceptCollaborationRequest } from "@/lib/api/hooks/useAcceptCollaborationRequest";
import { useRejectCollaborationRequest } from "@/lib/api/hooks/useRejectCollaborationRequest";
import { getApiErrorMessage } from "@/lib/formatters";
import { usePopup } from "@/hooks/use-popup";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface PopulatedRequester {
  _id: string;
  email: string;
  role?: string;
}

interface RequestItem {
  _id: string;
  requester_id: string | PopulatedRequester;
  status: "pending" | "accepted" | "rejected";
  created_at: string;
}

export default function TalentRequestsPage() {
  const router = useRouter();
  const popup = usePopup();
  const { data, isLoading, error } = useCollaborationRequests();
  const acceptMutation = useAcceptCollaborationRequest();
  const rejectMutation = useRejectCollaborationRequest();
  const [processingId, setProcessingId] = useState<string | null>(null);

  const requests: RequestItem[] = data?.received ?? [];
  const pendingRequests = requests.filter((r) => r.status === "pending");

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
        router.push(`/talent/messages?conversationId=${result.conversation._id}`);
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
        description: "The recruiter has been notified.",
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

  const getRequesterLabel = (requester: string | PopulatedRequester) => {
    if (typeof requester === "string") return "Unknown recruiter";
    return requester.email || "Unknown recruiter";
  };

  if (isLoading) {
    return (
      <div className="px-4 pt-6 space-y-4 pb-20">
        <h1 className="text-xl font-bold text-text-primary">Connection Requests</h1>
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-24 w-full rounded-xl" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="px-4 pt-6 pb-20">
        <h1 className="text-xl font-bold text-text-primary mb-4">Connection Requests</h1>
        <Alert variant="destructive">
          <AlertDescription>{getApiErrorMessage(error, "Failed to load requests")}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="px-4 pt-6 pb-20 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-text-primary">Connection Requests</h1>
        {pendingRequests.length > 0 && (
          <span className="text-xs font-medium bg-brand-light text-brand-hover px-2.5 py-1 rounded-full">
            {pendingRequests.length} pending
          </span>
        )}
      </div>

      {requests.length === 0 ? (
        <div className="text-center py-16 bg-card border border-border rounded-2xl">
          <UserCheck className="w-10 h-10 text-text-muted mx-auto mb-3" strokeWidth={1.5} />
          <p className="text-sm text-text-muted">No connection requests yet.</p>
          <p className="text-xs text-text-tertiary mt-1">
            Recruiters will appear here when they request to connect.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {requests.map((req) => {
            const isPending = req.status === "pending";
            const isProcessing = processingId === req._id;
            const label = getRequesterLabel(req.requester_id);

            return (
              <Card key={req._id} className="rounded-xl">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <div className="w-9 h-9 rounded-full bg-muted-bg flex items-center justify-center shrink-0">
                          <Mail className="w-4 h-4 text-text-muted" strokeWidth={1.5} />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-text-primary truncate">
                            {label}
                          </p>
                          <div className="flex items-center gap-1 text-text-muted">
                            <Clock className="w-3 h-3" strokeWidth={1.5} />
                            <span className="text-xs">
                              {formatDistanceToNow(new Date(req.created_at), { addSuffix: true })}
                            </span>
                          </div>
                        </div>
                      </div>

                      {!isPending && (
                        <span
                          className={`inline-flex items-center gap-1 mt-2 text-xs font-medium px-2 py-0.5 rounded-full ${
                            req.status === "accepted"
                              ? "bg-green-100 text-green-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {req.status === "accepted" ? (
                            <>
                              <Check className="w-3 h-3" strokeWidth={2} />
                              Accepted
                            </>
                          ) : (
                            <>
                              <X className="w-3 h-3" strokeWidth={2} />
                              Rejected
                            </>
                          )}
                        </span>
                      )}
                    </div>

                    {isPending && (
                      <div className="flex items-center gap-2 shrink-0">
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 text-xs border-border"
                          onClick={() => handleReject(req._id)}
                          disabled={isProcessing}
                        >
                          <X className="w-3.5 h-3.5 mr-1" strokeWidth={2} />
                          Decline
                        </Button>
                        <Button
                          size="sm"
                          className="h-8 text-xs"
                          onClick={() => handleAccept(req._id)}
                          disabled={isProcessing}
                        >
                          <Check className="w-3.5 h-3.5 mr-1" strokeWidth={2} />
                          {isProcessing ? "..." : "Accept"}
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
