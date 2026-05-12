"use client";

import { useEffect, useState } from "react";
import { MessageSquare, Check, X, Shield, User, Clock } from "lucide-react";
import { messagesApi, talentApi } from "@/lib/api";
import { getApiErrorMessage } from "@/lib/formatters";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { EmptyState } from "@/components/ui/empty-state";
import { Separator } from "@/components/ui/separator";

type Sender = {
  _id: string;
  email: string;
  full_legal_name?: string;
  username?: string;
  role?: string;
};

type MessageItem = {
  _id: string;
  sender_id: Sender | string;
  receiver_id: string;
  content: string;
  message_type: string;
  status: string;
  is_read: boolean;
  created_at: string;
};

function getSenderName(sender: Sender | string): string {
  if (typeof sender === "string") return "Unknown";
  return sender.full_legal_name || sender.username || sender.email?.split("@")[0] || "Unknown";
}

function getSenderEmail(sender: Sender | string): string {
  if (typeof sender === "string") return "";
  return sender.email ?? "";
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

export default function TalentMessagesPage() {
  const [messages, setMessages] = useState<MessageItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [respondingId, setRespondingId] = useState<string | null>(null);

  useEffect(() => {
    messagesApi
      .getConversations()
      .then((data) => setMessages(data))
      .catch((err) => setError(getApiErrorMessage(err)))
      .finally(() => setLoading(false));
  }, []);

  const handleAllow = async (msgId: string, requesterId: string) => {
    if (respondingId) return;
    setRespondingId(requesterId);
    try {
      await talentApi.respondToAccessRequest(requesterId, "allowed");
      setMessages((prev) =>
        prev.map((m) =>
          m._id === msgId ? { ...m, status: "allowed" } : m
        )
      );
    } catch (err) {
      setError(getApiErrorMessage(err, "Failed to respond"));
    } finally {
      setRespondingId(null);
    }
  };

  const handleDeny = async (msgId: string, requesterId: string) => {
    if (respondingId) return;
    setRespondingId(requesterId);
    try {
      await talentApi.respondToAccessRequest(requesterId, "denied");
      setMessages((prev) =>
        prev.map((m) =>
          m._id === msgId ? { ...m, status: "denied" } : m
        )
      );
    } catch (err) {
      setError(getApiErrorMessage(err, "Failed to respond"));
    } finally {
      setRespondingId(null);
    }
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

  if (messages.length === 0) {
    return (
      <div className="space-y-6">
        <EmptyState
          icon={<MessageSquare className="w-8 h-8 text-text-muted" strokeWidth={1.5} />}
          title="Messages"
          description="No messages yet. When recruiters contact you, they will appear here."
        />
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-6">
      <h1 className="text-xl font-bold text-text-primary">Messages</h1>
      {messages.map((msg) => {
        const isRequest = msg.message_type === "access_request";
        const isResponse = msg.message_type === "access_response";
        const senderName = getSenderName(msg.sender_id);
        const senderEmail = getSenderEmail(msg.sender_id);

        return (
          <Card
            key={msg._id}
            className={`p-4 transition-colors ${
              !msg.is_read && isRequest ? "border-brand-muted bg-brand-light/30" : ""
            }`}
          >
            <div className="flex items-start gap-3">
              <Avatar
                name={senderName}
                size="sm"
                className="shrink-0 mt-0.5"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-sm font-semibold text-text-primary truncate">
                      {senderName}
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
                    {formatTimeAgo(msg.created_at)}
                  </span>
                </div>

                {senderEmail && (
                  <p className="text-xs text-text-muted mt-0.5">{senderEmail}</p>
                )}

                <p className="text-sm text-text-secondary mt-2">{msg.content}</p>

                {isRequest && msg.status === "pending" && (
                  <div className="mt-3 flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={respondingId === getSenderName(msg.sender_id)}
                      onClick={() =>
                        handleAllow(
                          msg._id,
                          typeof msg.sender_id === "string"
                            ? msg.sender_id
                            : msg.sender_id._id
                        )
                      }
                    >
                      <Check className="w-4 h-4 mr-1" />
                      Allow
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      disabled={respondingId === getSenderName(msg.sender_id)}
                      onClick={() =>
                        handleDeny(
                          msg._id,
                          typeof msg.sender_id === "string"
                            ? msg.sender_id
                            : msg.sender_id._id
                        )
                      }
                    >
                      <X className="w-4 h-4 mr-1" />
                      Don&apos;t Allow
                    </Button>
                  </div>
                )}

                {isRequest && msg.status !== "pending" && (
                  <div className="mt-3">
                    <Badge
                      variant={msg.status === "allowed" ? "default" : "destructive"}
                      className="text-2xs capitalize"
                    >
                      {msg.status === "allowed" ? (
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
                      variant={msg.status === "allowed" ? "default" : "destructive"}
                      className="text-2xs capitalize"
                    >
                      {msg.status === "allowed" ? (
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
      })}
    </div>
  );
}
