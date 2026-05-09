"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Bell, Check, X, Shield, User, Clock } from "lucide-react";
import { notificationsApi, talentApi } from "@/lib/api";
import { getApiErrorMessage } from "@/lib/formatters";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { EmptyState } from "@/components/ui/empty-state";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type Actor = {
  _id: string;
  email?: string;
  full_legal_name?: string;
  username?: string;
};

type NotificationItem = {
  _id: string;
  actor_id: Actor | string;
  type: string;
  title: string;
  body: string;
  data: Record<string, any>;
  status: string;
  action_status: string | null;
  is_history: boolean;
  dismiss_strategy: string;
  created_at: string;
};

function getActorName(actor: Actor | string): string {
  if (typeof actor === "string") return "Unknown";
  return actor.full_legal_name || actor.username || actor.email?.split("@")[0] || "Unknown";
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
  const [activeNotifications, setActiveNotifications] = useState<NotificationItem[]>([]);
  const [historyNotifications, setHistoryNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [respondingId, setRespondingId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("active");

  const fetchAll = useCallback(async () => {
    try {
      await notificationsApi.dismissAuto();
      const [active, history] = await Promise.all([
        notificationsApi.getNotifications(false),
        notificationsApi.getNotifications(true),
      ]);
      setActiveNotifications(active);
      setHistoryNotifications(history);
    } catch (err) {
      setError(getApiErrorMessage(err, "Failed to load notifications"));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const handleAllow = async (notificationId: string, requesterId: string) => {
    if (respondingId) return;
    setRespondingId(requesterId);
    try {
      await talentApi.respondToAccessRequest(requesterId, "allowed");
      await fetchAll();
    } catch (err) {
      setError(getApiErrorMessage(err, "Failed to respond"));
    } finally {
      setRespondingId(null);
    }
  };

  const handleDeny = async (notificationId: string, requesterId: string) => {
    if (respondingId) return;
    setRespondingId(requesterId);
    try {
      await talentApi.respondToAccessRequest(requesterId, "denied");
      await fetchAll();
    } catch (err) {
      setError(getApiErrorMessage(err, "Failed to respond"));
    } finally {
      setRespondingId(null);
    }
  };

  const handleMarkRead = async (id: string) => {
    try {
      await notificationsApi.markAsRead(id);
      setActiveNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, status: "read" } : n))
      );
    } catch {
      // ignore
    }
  };

  const renderNotification = (notification: NotificationItem) => {
    const isRequest = notification.type === "access_request";
    const isResponse = notification.type === "access_response";
    const actorName = getActorName(notification.actor_id);

    return (
      <Card
        key={notification._id}
        className={`p-4 transition-colors cursor-pointer ${
          notification.status === "unread" ? "border-brand-muted bg-brand-light/20" : ""
        }`}
        onClick={() => {
          if (notification.status === "unread") {
            handleMarkRead(notification._id);
          }
        }}
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
                {isRequest && (
                  <Badge variant="secondary" className="text-2xs shrink-0">
                    <Shield className="w-3 h-3 mr-0.5" strokeWidth={1.5} />
                    Access request
                  </Badge>
                )}
                {isResponse && (
                  <Badge variant="outline" className="text-2xs shrink-0">
                    <User className="w-3 h-3 mr-0.5" strokeWidth={1.5} />
                    Response
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

            {isRequest && notification.action_status === "pending" && (
              <div className="mt-3 flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  disabled={respondingId === notification.data.requester_id}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleAllow(
                      notification._id,
                      notification.data.requester_id
                    );
                  }}
                >
                  <Check className="w-4 h-4 mr-1" />
                  Allow
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  disabled={respondingId === notification.data.requester_id}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeny(
                      notification._id,
                      notification.data.requester_id
                    );
                  }}
                >
                  <X className="w-4 h-4 mr-1" />
                  Don&apos;t Allow
                </Button>
              </div>
            )}

            {isRequest && notification.action_status !== "pending" && (
              <div className="mt-3">
                <Badge
                  variant={notification.action_status === "allowed" ? "default" : "destructive"}
                  className="text-2xs capitalize"
                >
                  {notification.action_status === "allowed" ? (
                    <>
                      <Check className="w-3 h-3 mr-0.5" strokeWidth={1.5} />
                      Allowed
                    </>
                  ) : (
                    <>
                      <X className="w-3 h-3 mr-0.5" strokeWidth={1.5} />
                      Denied
                    </>
                  )}
                </Badge>
              </div>
            )}

            {isResponse && (
              <div className="mt-3">
                <Badge
                  variant={notification.action_status === "allowed" ? "default" : "destructive"}
                  className="text-2xs capitalize"
                >
                  {notification.action_status === "allowed" ? (
                    <>
                      <Check className="w-3 h-3 mr-0.5" strokeWidth={1.5} />
                      Approved
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

  if (loading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="h-24 animate-pulse" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="grid w-full grid-cols-2 mb-4">
        <TabsTrigger value="active">
          Active
          {activeNotifications.length > 0 && (
            <span className="ml-1.5 inline-flex items-center justify-center min-w-[18px] h-[18px] bg-brand text-white text-[10px] font-bold rounded-full px-1">
              {activeNotifications.length > 99 ? "99+" : activeNotifications.length}
            </span>
          )}
        </TabsTrigger>
        <TabsTrigger value="history">History</TabsTrigger>
      </TabsList>

      <TabsContent value="active" className="space-y-3">
        {activeNotifications.length === 0 ? (
          <EmptyState
            icon={<Bell className="w-8 h-8 text-text-muted" strokeWidth={1.5} />}
            title="No active notifications"
            description="You're all caught up. New notifications will appear here."
          />
        ) : (
          activeNotifications.map(renderNotification)
        )}
      </TabsContent>

      <TabsContent value="history" className="space-y-3">
        {historyNotifications.length === 0 ? (
          <EmptyState
            icon={<Bell className="w-8 h-8 text-text-muted" strokeWidth={1.5} />}
            title="No history"
            description="Resolved notifications will appear here."
          />
        ) : (
          historyNotifications.map(renderNotification)
        )}
      </TabsContent>
    </Tabs>
  );
}
