"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { UserCheck, Check, X, Clock, Users } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useCollaborationRequests } from "@/lib/api/hooks/useCollaborationRequests";
import { useAcceptCollaborationRequest } from "@/lib/api/hooks/useAcceptCollaborationRequest";
import { useRejectCollaborationRequest } from "@/lib/api/hooks/useRejectCollaborationRequest";
import { getApiErrorMessage } from "@/lib/formatters";
import { usePopup } from "@/hooks/use-popup";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

interface RequesterProfile {
  _id: string;
  email: string;
  role?: string;
  full_legal_name?: string;
  username?: string;
  company_name?: string;
  profile_photo?: string;
}

interface RequestItem {
  _id: string;
  requester_id: RequesterProfile;
  status: "pending" | "accepted" | "rejected";
  message?: string;
  created_at: string;
}

const AVATAR_COLORS = [
  { bg: "bg-violet-100", text: "text-violet-800", border: "border-violet-200" },
  { bg: "bg-emerald-100", text: "text-emerald-800", border: "border-emerald-200" },
  { bg: "bg-rose-100", text: "text-rose-800", border: "border-rose-200" },
  { bg: "bg-amber-100", text: "text-amber-800", border: "border-amber-200" },
  { bg: "bg-sky-100", text: "text-sky-800", border: "border-sky-200" },
  { bg: "bg-pink-100", text: "text-pink-800", border: "border-pink-200" },
];

function getAvatarColor(name: string) {
  const idx = name.charCodeAt(0) % AVATAR_COLORS.length;
  return AVATAR_COLORS[idx];
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function getDisplayName(requester: RequesterProfile): string {
  return (
    requester.full_legal_name ||
    requester.username ||
    requester.email ||
    "Unknown"
  );
}

function getRoleLine(requester: RequesterProfile): string {
  const role = requester.role === "recruiter" ? "Recruiter" : "Talent";
  if (requester.company_name) return `${role} · ${requester.company_name}`;
  return role;
}

function RequesterAvatar({ requester }: { requester: RequesterProfile }) {
  const name = getDisplayName(requester);
  const color = getAvatarColor(name);

  if (requester.profile_photo) {
    return (
      <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0 border border-border">
        <img
          src={requester.profile_photo}
          alt={name}
          className="w-full h-full object-cover"
        />
      </div>
    );
  }

  return (
    <div
      className={cn(
        "w-10 h-10 rounded-full flex items-center justify-center text-[13px] font-semibold flex-shrink-0 border",
        color.bg,
        color.text,
        color.border
      )}
    >
      {getInitials(name)}
    </div>
  );
}

export default function TalentRequestsPage() {
  const router = useRouter();
  const popup = usePopup();
  const { data, isLoading, error } = useCollaborationRequests();
  const acceptMutation = useAcceptCollaborationRequest();
  const rejectMutation = useRejectCollaborationRequest();
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("pending");

  const requests: RequestItem[] = data?.received ?? [];
  const pendingRequests = requests.filter((r) => r.status === "pending");
  const historyRequests = requests.filter((r) => r.status !== "pending");

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

  if (isLoading) {
    return (
      <div className="px-4 pt-6 space-y-4 pb-20">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-semibold text-foreground">Connection Requests</h1>
          <Skeleton className="h-5 w-5 rounded-full" />
        </div>
        <Skeleton className="h-4 w-32" />
        <div className="flex gap-0 bg-muted rounded-lg p-[3px]">
          <Skeleton className="h-8 flex-1 rounded-md" />
          <Skeleton className="h-8 flex-1 rounded-md" />
        </div>
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-32 w-full rounded-xl" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="px-4 pt-6 pb-20">
        <h1 className="text-lg font-semibold text-foreground mb-4">Connection Requests</h1>
        <div className="bg-destructive/10 text-destructive text-sm rounded-lg p-3">
          {getApiErrorMessage(error, "Failed to load requests")}
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 pt-6 pb-20 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold text-foreground">Connection Requests</h1>
        {pendingRequests.length > 0 && (
          <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-amber-500 text-white text-[11px] font-semibold">
            {pendingRequests.length}
          </span>
        )}
      </div>
      <p className="text-xs text-muted-foreground">Pending from recruiters</p>

      {requests.length === 0 ? (
        <div className="text-center py-16 bg-card border border-border rounded-2xl">
          <UserCheck className="w-10 h-10 text-muted-foreground mx-auto mb-3" strokeWidth={1.5} />
          <p className="text-sm text-muted-foreground">No connection requests yet.</p>
          <p className="text-xs text-muted-foreground mt-1">
            Recruiters will appear here when they request to connect.
          </p>
        </div>
      ) : (
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full grid grid-cols-2 h-auto p-[3px] bg-muted rounded-lg">
            <TabsTrigger
              value="pending"
              className="text-xs py-1.5 data-[state=active]:bg-background data-[state=active]:shadow-sm data-[state=active]:border-border border border-transparent rounded-md"
            >
              Pending ({pendingRequests.length})
            </TabsTrigger>
            <TabsTrigger
              value="history"
              className="text-xs py-1.5 data-[state=active]:bg-background data-[state=active]:shadow-sm data-[state=active]:border-border border border-transparent rounded-md"
            >
              Accepted ({historyRequests.filter((r) => r.status === "accepted").length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pending" className="mt-4 space-y-3">
            {pendingRequests.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-sm text-muted-foreground">No pending requests.</p>
              </div>
            ) : (
              pendingRequests.map((req) => {
                const isProcessing = processingId === req._id;
                const requester = req.requester_id;
                const name = getDisplayName(requester);

                return (
                  <div
                    key={req._id}
                    className="bg-card border border-border rounded-xl overflow-hidden border-l-[2px] border-l-amber-500"
                  >
                    <div className="p-3.5 space-y-2.5">
                      {/* Top row */}
                      <div className="flex items-center gap-2.5">
                        <RequesterAvatar requester={requester} />
                        <div className="flex-1 min-w-0">
                          <p className="text-[13px] font-medium text-foreground truncate leading-tight">
                            {name}
                          </p>
                          <p className="text-[11px] text-muted-foreground truncate">
                            {getRoleLine(requester)}
                          </p>
                        </div>
                        <div className="flex items-center gap-1 text-[10px] text-muted-foreground flex-shrink-0">
                          <Clock className="w-3 h-3" strokeWidth={1.5} />
                          {formatDistanceToNow(new Date(req.created_at), {
                            addSuffix: false,
                          })}
                        </div>
                      </div>

                      {/* Message preview */}
                      {req.message && (
                        <div className="bg-muted rounded-lg px-3 py-2 text-xs text-muted-foreground leading-relaxed">
                          &ldquo;{req.message}&rdquo;
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1 h-8 text-xs border-border bg-secondary text-secondary-foreground hover:bg-secondary/80"
                          onClick={() => handleReject(req._id)}
                          disabled={isProcessing}
                        >
                          Decline
                        </Button>
                        <Button
                          size="sm"
                          className="flex-1 h-8 text-xs bg-amber-500 text-white hover:bg-amber-600"
                          onClick={() => handleAccept(req._id)}
                          disabled={isProcessing}
                        >
                          {isProcessing ? "..." : "Accept"}
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </TabsContent>

          <TabsContent value="history" className="mt-4 space-y-3">
            {historyRequests.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-sm text-muted-foreground">No past requests.</p>
              </div>
            ) : (
              historyRequests.map((req) => {
                const requester = req.requester_id;
                const name = getDisplayName(requester);
                const isAccepted = req.status === "accepted";

                return (
                  <div
                    key={req._id}
                    className="bg-card border border-border rounded-xl overflow-hidden opacity-90"
                  >
                    <div className="p-3.5 space-y-2">
                      <div className="flex items-center gap-2.5">
                        <RequesterAvatar requester={requester} />
                        <div className="flex-1 min-w-0">
                          <p className="text-[13px] font-medium text-foreground truncate leading-tight">
                            {name}
                          </p>
                          <p className="text-[11px] text-muted-foreground truncate">
                            {getRoleLine(requester)}
                          </p>
                        </div>
                        <div className="flex items-center gap-1 text-[10px] text-muted-foreground flex-shrink-0">
                          <Clock className="w-3 h-3" strokeWidth={1.5} />
                          {formatDistanceToNow(new Date(req.created_at), {
                            addSuffix: false,
                          })}
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <span
                          className={cn(
                            "inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full",
                            isAccepted
                              ? "bg-emerald-100 text-emerald-700"
                              : "bg-red-100 text-red-700"
                          )}
                        >
                          {isAccepted ? (
                            <>
                              <Check className="w-3 h-3" strokeWidth={2} />
                              Accepted
                            </>
                          ) : (
                            <>
                              <X className="w-3 h-3" strokeWidth={2} />
                              Declined
                            </>
                          )}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
