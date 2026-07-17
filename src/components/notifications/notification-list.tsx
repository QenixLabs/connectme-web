"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import {
  Bell,
  Check,
  X,
  User,
  Clock,
  FileCheck,
  Mail,
  Loader2,
  CheckCheck,
  ArrowRightLeft,
  ClipboardList,
  Sparkles,
} from "lucide-react";
import {
  notificationsApi,
  useRespondToInvite,
  useNotifications,
  useMarkAsRead,
  useMarkAllAsRead,
  useDismissAuto,
  useRespondToAction,
} from "@/lib/api";
import { useSocket } from "@/hooks/use-socket";
import { getApiErrorMessage } from "@/lib/formatters";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { EmptyState } from "@/components/ui/empty-state";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { NotificationItem } from "@/lib/api/notifications";

type Actor = {
  _id: string;
  email?: string;
  full_legal_name?: string;
  username?: string;
};

function getActorName(actor: Actor | string | null): string {
  if (!actor) return "System";
  if (typeof actor === "string") return "Unknown";
  return (
    actor.full_legal_name ||
    actor.username ||
    actor.email?.split("@")[0] ||
    "Unknown"
  );
}

function formatTimeAgo(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
}

export function NotificationList() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("active");
  const [respondingId, setRespondingId] = useState<string | null>(null);
  const { socket } = useSocket();

  const isHistory = activeTab === "history";

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    error,
  } = useNotifications(isHistory);

  const markAsRead = useMarkAsRead();
  const markAllAsRead = useMarkAllAsRead();
  const dismissAuto = useDismissAuto();

  const allNotifications = data?.pages.flatMap((page) => page.data) ?? [];

  const dismissAutoMutateRef = useRef(dismissAuto.mutate);
  dismissAutoMutateRef.current = dismissAuto.mutate;

  useEffect(() => {
    const handleBeforeUnload = () => {
      dismissAutoMutateRef.current();
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      dismissAutoMutateRef.current();
    };
  }, []);

  useEffect(() => {
    if (!socket) return;

    const handleNotification = (notification: NotificationItem) => {
      queryClient.setQueryData(
        ["notifications", "list", false],
        (old: { pages: Array<{ data: NotificationItem[]; total: number }> } | undefined) => {
          if (!old) return old;
          const firstPage = old.pages[0];
          if (firstPage?.data?.some((n: NotificationItem) => n._id === notification._id)) {
            return old;
          }
          const newPages = [...old.pages];
          newPages[0] = {
            ...firstPage,
            data: [notification, ...firstPage.data],
            total: (firstPage.total || 0) + 1,
          };
          return { ...old, pages: newPages };
        }
      );
      queryClient.invalidateQueries({ queryKey: ["notifications", "unread-count"] });
    };

    socket.on("notification:new", handleNotification);

    return () => {
      socket.off("notification:new", handleNotification);
    };
  }, [socket, queryClient]);

  const respondToInvite = useRespondToInvite();
  const respondToAction = useRespondToAction();

  const handleAcceptInvite = async (notificationId: string, inviteId: string) => {
    if (respondingId) return;
    setRespondingId(inviteId);
    try {
      await respondToInvite.mutateAsync({ inviteId, action: "accept" });
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    } catch (err) {
      // handled by component if needed
    } finally {
      setRespondingId(null);
    }
  };

  const handleDeclineInvite = async (notificationId: string, inviteId: string) => {
    if (respondingId) return;
    setRespondingId(inviteId);
    try {
      await respondToInvite.mutateAsync({ inviteId, action: "decline" });
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    } catch (err) {
      // handled by component if needed
    } finally {
      setRespondingId(null);
    }
  };

  const handleAcceptMigration = async (notificationId: string) => {
    if (respondingId) return;
    setRespondingId(notificationId);
    try {
      await respondToAction.mutateAsync({ notificationId, action: "accepted" });
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    } catch (err) {
      // handled by component if needed
    } finally {
      setRespondingId(null);
    }
  };

  const handleDeclineMigration = async (notificationId: string) => {
    if (respondingId) return;
    setRespondingId(notificationId);
    try {
      await respondToAction.mutateAsync({ notificationId, action: "declined" });
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    } catch (err) {
      // handled by component if needed
    } finally {
      setRespondingId(null);
    }
  };

  const handleMarkRead = useCallback(
    (id: string) => {
      markAsRead.mutate(id);
    },
    [markAsRead]
  );

  const handleMarkAllRead = useCallback(() => {
    markAllAsRead.mutate();
  }, [markAllAsRead]);

  const renderNotification = (notification: NotificationItem) => {
    const isVerificationStatus = notification.type === "verification_status";
    const isCampaignInvite = notification.type === "campaign_invite";
    const isCampaignRecommendation = notification.type === "campaign_recommendation";
    const isPlanMigrationRequest = notification.type === "plan_migration_request";
    const isApplicationReceived = notification.type === "application_received";
    const isApplicationStatusChanged =
      notification.type === "application_status_changed";
    const isTaskAssigned = notification.type === "task_assigned";
    const isTaskSubmitted = notification.type === "task_submitted";
    const inviteId = notification.data?.invite_id;
    const migrationId = notification.data?.migration_id;
    const actorName = getActorName(notification.actor_id);

    const handleCardClick = () => {
      if (notification.status === "unread") {
        handleMarkRead(notification._id);
      }
      if (
        isCampaignInvite ||
        isCampaignRecommendation ||
        isApplicationReceived ||
        isApplicationStatusChanged
      ) {
        const campaignId = notification.data?.campaign_id;
        if (campaignId) {
          router.push(`/talent/opportunities/${campaignId}`);
        }
      }
      if (isTaskAssigned) {
        const campaignId = notification.data?.campaign_id;
        if (campaignId) {
          router.push(`/talent/opportunities/${campaignId}`);
        }
      }
      if (isTaskSubmitted) {
        const campaignId = notification.data?.campaign_id;
        if (campaignId) {
          router.push(`/recruiter/campaigns/${campaignId}`);
        }
      }
    };

    return (
      <Card
        key={notification._id}
        className={`p-4 transition-colors cursor-pointer ${
          notification.status === "unread"
            ? "border-brand-muted bg-brand-light/20"
            : ""
        }`}
        onClick={handleCardClick}
      >
        <div className="flex items-start gap-3">
          <Avatar
            name={actorName}
            size="sm"
            className="shrink-0 mt-0.5"
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-sm font-semibold text-text-primary truncate">
                  {notification.title}
                </span>
                {isVerificationStatus && (
                  <Badge variant="outline" className="text-2xs shrink-0">
                    <FileCheck className="w-3 h-3 mr-0.5" strokeWidth={1.5} />
                    Verification
                  </Badge>
                )}
                {isCampaignInvite && (
                  <Badge variant="secondary" className="text-2xs shrink-0">
                    <Mail className="w-3 h-3 mr-0.5" strokeWidth={1.5} />
                    Campaign Invite
                  </Badge>
                )}
                {isCampaignRecommendation && (
                  <Badge variant="secondary" className="text-2xs shrink-0">
                    <Sparkles className="w-3 h-3 mr-0.5" strokeWidth={1.5} />
                    Campaign Match
                  </Badge>
                )}
                {isPlanMigrationRequest && (
                  <Badge variant="secondary" className="text-2xs shrink-0">
                    <ArrowRightLeft className="w-3 h-3 mr-0.5" strokeWidth={1.5} />
                    Plan Migration
                  </Badge>
                )}
                {isApplicationReceived && (
                  <Badge variant="outline" className="text-2xs shrink-0">
                    <User className="w-3 h-3 mr-0.5" strokeWidth={1.5} />
                    Application
                  </Badge>
                )}
                {isApplicationStatusChanged && (
                  <Badge variant="outline" className="text-2xs shrink-0">
                    <FileCheck className="w-3 h-3 mr-0.5" strokeWidth={1.5} />
                    Status Update
                  </Badge>
                )}
                {isTaskAssigned && (
                  <Badge variant="secondary" className="text-2xs shrink-0">
                    <ClipboardList className="w-3 h-3 mr-0.5" strokeWidth={1.5} />
                    Task Assigned
                  </Badge>
                )}
                {isTaskSubmitted && (
                  <Badge variant="outline" className="text-2xs shrink-0">
                    <ClipboardList className="w-3 h-3 mr-0.5" strokeWidth={1.5} />
                    Task Submitted
                  </Badge>
                )}
              </div>
              <span className="text-2xs text-text-muted shrink-0 flex items-center gap-1">
                <Clock className="w-3 h-3" strokeWidth={1.5} />
                {formatTimeAgo(notification.created_at)}
              </span>
            </div>

            <p className="text-xs text-text-muted mt-0.5">{actorName}</p>
            <p className="text-sm text-text-secondary mt-2">{notification.body}</p>

            {isCampaignRecommendation && notification.data?.match_score && (
              <div className="mt-2">
                <Badge variant="secondary" className="text-2xs">
                  {notification.data.match_score}% match
                </Badge>
              </div>
            )}

            {isCampaignInvite && notification.action_status === "pending" && inviteId && (
              <div className="mt-3 flex gap-2">
                <Button
                  size="sm"
                  disabled={respondingId === inviteId}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleAcceptInvite(notification._id, inviteId);
                  }}
                >
                  <Check className="w-4 h-4 mr-1" />
                  Accept Invite
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={respondingId === inviteId}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeclineInvite(notification._id, inviteId);
                  }}
                >
                  <X className="w-4 h-4 mr-1" />
                  Decline
                </Button>
              </div>
            )}

            {isCampaignInvite && notification.action_status !== "pending" && (
              <div className="mt-3">
                <Badge
                  variant={notification.action_status === "allowed" ? "default" : "destructive"}
                  className="text-2xs capitalize"
                >
                  {notification.action_status === "allowed" ? (
                    <>
                      <Check className="w-3 h-3 mr-0.5" strokeWidth={1.5} />
                      Accepted
                    </>
                  ) : (
                    <>
                      <X className="w-3 h-3 mr-0.5" strokeWidth={1.5} />
                      Declined
                    </>
                  )}
                </Badge>
              </div>
            )}

            {isPlanMigrationRequest && notification.action_status === "pending" && migrationId && (
              <div className="mt-3 flex gap-2">
                <Button
                  size="sm"
                  disabled={respondingId === notification._id}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleAcceptMigration(notification._id);
                  }}
                >
                  <Check className="w-4 h-4 mr-1" />
                  Accept
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={respondingId === notification._id}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeclineMigration(notification._id);
                  }}
                >
                  <X className="w-4 h-4 mr-1" />
                  Decline
                </Button>
              </div>
            )}

            {isPlanMigrationRequest && notification.action_status !== "pending" && (
              <div className="mt-3">
                <Badge
                  variant={notification.action_status === "accepted" ? "default" : "destructive"}
                  className="text-2xs capitalize"
                >
                  {notification.action_status === "accepted" ? (
                    <>
                      <Check className="w-3 h-3 mr-0.5" strokeWidth={1.5} />
                      Accepted
                    </>
                  ) : (
                    <>
                      <X className="w-3 h-3 mr-0.5" strokeWidth={1.5} />
                      Declined
                    </>
                  )}
                </Badge>
              </div>
            )}
          </div>
        </div>
      </Card>
    );
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="h-24 animate-pulse" />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <Alert variant="destructive">
        <AlertDescription>
          {getApiErrorMessage(error, "Failed to load notifications")}
        </AlertDescription>
      </Alert>
    );
  }

  const unreadCount = allNotifications.filter((n) => n.status === "unread").length;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-0">
            <TabsTrigger value="active">
              Active
              {unreadCount > 0 && (
                <span className="ml-1.5 inline-flex items-center justify-center min-w-[18px] h-[18px] bg-brand text-white text-[10px] font-bold rounded-full px-1">
                  {unreadCount > 99 ? "99+" : unreadCount}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {activeTab === "active" && unreadCount > 0 && (
        <Button
          variant="ghost"
          size="sm"
          className="text-xs"
          onClick={handleMarkAllRead}
          disabled={markAllAsRead.isPending}
        >
          <CheckCheck className="w-3.5 h-3.5 mr-1" />
          Mark all as read
        </Button>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsContent value="active" className="space-y-3 mt-0">
          {allNotifications.length === 0 ? (
            <EmptyState
              icon={<Bell className="w-8 h-8 text-text-muted" strokeWidth={1.5} />}
              title="No active notifications"
              description="You're all caught up. New notifications will appear here."
            />
          ) : (
            <>
              {allNotifications.map(renderNotification)}
              {hasNextPage && (
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => fetchNextPage()}
                  disabled={isFetchingNextPage}
                >
                  {isFetchingNextPage ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    "Load more"
                  )}
                </Button>
              )}
            </>
          )}
        </TabsContent>

        <TabsContent value="history" className="space-y-3 mt-0">
          {allNotifications.length === 0 ? (
            <EmptyState
              icon={<Bell className="w-8 h-8 text-text-muted" strokeWidth={1.5} />}
              title="No history"
              description="Resolved notifications will appear here."
            />
          ) : (
            <>
              {allNotifications.map(renderNotification)}
              {hasNextPage && (
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => fetchNextPage()}
                  disabled={isFetchingNextPage}
                >
                  {isFetchingNextPage ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    "Load more"
                  )}
                </Button>
              )}
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
