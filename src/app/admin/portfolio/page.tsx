"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Clock,
  ShieldAlert,
  Check,
  X,
  Loader2,
  ImageIcon,
  Play,
  ExternalLink,
  User,
  Search,
  ChevronDown,
  ChevronRight,
  ShieldCheck,
  Pin,
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import {
  adminApi,
  type PortfolioTalent,
  type PortfolioItem,
} from "@/lib/api";
import { getApiErrorMessage } from "@/lib/formatters";

function getYouTubeEmbedUrl(url: string): string | null {
  const patterns = [
    /(?:https?:\/\/)?(?:www\.)?youtube\.com\/watch\?v=([^&]+)/,
    /(?:https?:\/\/)?youtu\.be\/([^?]+)/,
    /(?:https?:\/\/)?(?:www\.)?youtube\.com\/embed\/([^?]+)/,
  ];
  for (const p of patterns) {
    const m = url.match(p);
    if (m) return `https://www.youtube.com/embed/${m[1]}`;
  }
  return null;
}

function getInstagramPostUrl(url: string): string | null {
  const m = url.match(/(?:https?:\/\/)?(?:www\.)?instagram\.com\/p\/([^/?]+)/);
  if (m) return `https://www.instagram.com/p/${m[1]}/embed`;
  return null;
}

function statusBadge(status: string) {
  if (status === "pending") {
    return (
      <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
        <Clock className="w-3 h-3" />
        Pending
      </span>
    );
  }
  if (status === "flagged") {
    return (
      <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-red-50 text-red-700 border border-red-200">
        <ShieldAlert className="w-3 h-3" />
        Flagged
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
      <ShieldCheck className="w-3 h-3" />
      Approved
    </span>
  );
}

function typeIcon(type: string) {
  if (type === "video") return <Play className="w-3.5 h-3.5" />;
  if (type === "youtube") return <Play className="w-3.5 h-3.5" />;
  if (type === "instagram") return <ExternalLink className="w-3.5 h-3.5" />;
  return <ImageIcon className="w-3.5 h-3.5" />;
}

function typeLabel(type: string) {
  if (type === "youtube") return "YouTube";
  if (type === "instagram") return "Instagram";
  return type;
}

export default function AdminPortfolioPage() {
  const router = useRouter();
  const [talents, setTalents] = useState<PortfolioTalent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [processingKey, setProcessingKey] = useState<string | null>(null);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectTarget, setRejectTarget] = useState<{
    userId: string;
    itemId: string;
    userName: string;
  } | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedUserIds, setExpandedUserIds] = useState<Set<string>>(
    new Set()
  );

  const fetchTalents = useCallback(() => {
    setLoading(true);
    setError(null);
    adminApi
      .getAllPortfoliosByTalent()
      .then((data) => setTalents(data))
      .catch((err) =>
        setError(getApiErrorMessage(err, "Failed to load portfolios"))
      )
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchTalents();
  }, [fetchTalents]);

  const filteredTalents = useMemo(() => {
    if (!searchQuery.trim()) return talents;
    const q = searchQuery.toLowerCase();
    return talents.filter(
      (t) =>
        t.user_name?.toLowerCase().includes(q) ||
        t.user_email?.toLowerCase().includes(q) ||
        t.username?.toLowerCase().includes(q)
    );
  }, [talents, searchQuery]);

  const toggleExpand = (userId: string) => {
    setExpandedUserIds((prev) => {
      const next = new Set(prev);
      if (next.has(userId)) {
        next.delete(userId);
      } else {
        next.add(userId);
      }
      return next;
    });
  };

  const handleApprove = async (userId: string, itemId: string) => {
    const key = `${userId}:${itemId}`;
    setActionError(null);
    setProcessingKey(key);
    try {
      await adminApi.approvePortfolioItem(userId, itemId);
      setTalents((prev) =>
        prev.map((t) => {
          if (t.user_id !== userId) return t;
          return {
            ...t,
            items: t.items.map((item) =>
              item.id === itemId
                ? { ...item, ai_moderation_status: "approved" }
                : item
            ),
          };
        })
      );
    } catch (err) {
      setActionError(getApiErrorMessage(err, "Failed to approve"));
    } finally {
      setProcessingKey(null);
    }
  };

  const openRejectDialog = (
    userId: string,
    itemId: string,
    userName: string
  ) => {
    setRejectTarget({ userId, itemId, userName });
    setRejectReason("");
    setRejectDialogOpen(true);
    setActionError(null);
  };

  const handleReject = async () => {
    if (!rejectTarget) return;
    if (!rejectReason.trim()) {
      setActionError("Please provide a reason for rejection");
      return;
    }
    const key = `${rejectTarget.userId}:${rejectTarget.itemId}`;
    setActionError(null);
    setProcessingKey(key);
    try {
      await adminApi.rejectPortfolioItem(
        rejectTarget.userId,
        rejectTarget.itemId,
        rejectReason.trim()
      );
      setTalents((prev) =>
        prev.map((t) => {
          if (t.user_id !== rejectTarget.userId) return t;
          return {
            ...t,
            items: t.items.map((item) =>
              item.id === rejectTarget.itemId
                ? { ...item, ai_moderation_status: "flagged" }
                : item
            ),
          };
        })
      );
      setRejectDialogOpen(false);
      setRejectTarget(null);
      setRejectReason("");
    } catch (err) {
      setActionError(getApiErrorMessage(err, "Failed to reject"));
    } finally {
      setProcessingKey(null);
    }
  };

  const renderMedia = (item: PortfolioItem) => {
    if (item.type === "youtube") {
      const linkUrl = item.embed_url || item.url;
      const embedSrc = getYouTubeEmbedUrl(linkUrl);
      const thumb = item.thumbnail_url;
      if (embedSrc) {
        return (
          <div className="aspect-video bg-black rounded-md overflow-hidden">
            <iframe
              src={embedSrc}
              className="w-full h-full"
              allowFullScreen
              title={item.caption || "YouTube video"}
            />
          </div>
        );
      }
      return (
        <div
          className="aspect-video bg-cover bg-center rounded-md flex items-center justify-center"
          style={thumb ? { backgroundImage: `url(${thumb})` } : undefined}
        >
          <div className="absolute inset-0 bg-black/40 rounded-md" />
          <a
            href={linkUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="relative z-10 flex flex-col items-center gap-2"
          >
            <Play className="w-8 h-8 text-white" />
            <span className="text-xs text-white hover:underline">
              Open YouTube
            </span>
          </a>
        </div>
      );
    }

    if (item.type === "instagram") {
      const linkUrl = item.embed_url || item.url;
      const embedSrc = getInstagramPostUrl(linkUrl);
      if (embedSrc) {
        return (
          <div className="aspect-square bg-muted rounded-md overflow-hidden">
            <iframe
              src={embedSrc}
              className="w-full h-full"
              title={item.caption || "Instagram post"}
            />
          </div>
        );
      }
      return (
        <div className="aspect-square bg-muted rounded-md flex flex-col items-center justify-center gap-2">
          <ExternalLink className="w-8 h-8 text-muted-foreground" />
          <a
            href={linkUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-primary hover:underline"
          >
            Open Instagram
          </a>
        </div>
      );
    }

    if (item.type === "video") {
      return (
        <div className="aspect-video bg-black rounded-md overflow-hidden relative group">
          <video
            src={item.url}
            controls
            className="w-full h-full object-contain"
            poster={item.thumbnail_url}
            preload="metadata"
          >
            Your browser does not support the video tag.
          </video>
        </div>
      );
    }

    return (
      <div className="aspect-square bg-muted rounded-md overflow-hidden">
        <img
          src={item.thumbnail_url || item.url}
          alt={item.caption || "Portfolio image"}
          className="w-full h-full object-cover"
          onError={(e) => {
            const t = e.target as HTMLImageElement;
            t.style.display = "none";
            const parent = t.parentElement;
            if (parent) {
              const fallback = parent.querySelector(".media-fallback");
              if (fallback) (fallback as HTMLElement).style.display = "flex";
            }
          }}
        />
        <div className="media-fallback hidden w-full h-full items-center justify-center bg-muted">
          <ImageIcon className="w-8 h-8 text-muted-foreground" />
        </div>
      </div>
    );
  };

  const renderItemActions = (talent: PortfolioTalent, item: PortfolioItem) => {
    const key = `${talent.user_id}:${item.id}`;
    const isProcessing = processingKey === key;

    if (item.ai_moderation_status === "approved") {
      return (
        <Button
          size="sm"
          variant="outline"
          className="h-7 text-xs gap-1"
          onClick={() =>
            openRejectDialog(
              talent.user_id,
              item.id,
              talent.user_name || "User"
            )
          }
          disabled={!!processingKey}
        >
          <X className="w-3 h-3" />
          Flag
        </Button>
      );
    }

    if (item.ai_moderation_status === "flagged") {
      return (
        <div className="flex items-center gap-1.5">
          <Button
            size="sm"
            variant="outline"
            className="h-7 text-xs gap-1 bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100 hover:text-emerald-800"
            onClick={() => handleApprove(talent.user_id, item.id)}
            disabled={isProcessing}
          >
            {isProcessing ? (
              <Loader2 className="w-3 h-3 animate-spin" />
            ) : (
              <>
                <Check className="w-3 h-3" />
                Approve
              </>
            )}
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="h-7 text-xs gap-1"
            onClick={() =>
              openRejectDialog(
                talent.user_id,
                item.id,
                talent.user_name || "User"
              )
            }
            disabled={isProcessing}
          >
            <X className="w-3 h-3" />
            Reject
          </Button>
        </div>
      );
    }

    return (
      <div className="flex items-center gap-1.5">
        <Button
          size="sm"
          variant="outline"
          className="h-7 text-xs gap-1 bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100 hover:text-emerald-800"
          onClick={() => handleApprove(talent.user_id, item.id)}
          disabled={isProcessing}
        >
          {isProcessing ? (
            <Loader2 className="w-3 h-3 animate-spin" />
          ) : (
            <>
              <Check className="w-3 h-3" />
              Approve
            </>
          )}
        </Button>
        <Button
          size="sm"
          variant="outline"
          className="h-7 text-xs gap-1"
          onClick={() =>
            openRejectDialog(
              talent.user_id,
              item.id,
              talent.user_name || "User"
            )
          }
          disabled={isProcessing}
        >
          <X className="w-3 h-3" />
          Reject
        </Button>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push("/admin/dashboard")}
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to Dashboard
        </Button>
      </div>

      <Card className="border-border-subtle">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-lg">Talent Portfolios</CardTitle>
            <p className="text-xs text-muted-foreground mt-0.5">
              {talents.length} talent{talents.length !== 1 ? "s" : ""} with
              portfolio items
            </p>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {actionError && (
            <Alert variant="destructive">
              <AlertDescription>{actionError}</AlertDescription>
            </Alert>
          )}

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, email, or username..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : error ? (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : filteredTalents.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-12">
              {searchQuery
                ? "No talents match your search."
                : "No portfolio items found."}
            </p>
          ) : (
            <div className="space-y-2">
              {filteredTalents.map((talent) => {
                const isExpanded = expandedUserIds.has(talent.user_id);
                const pendingCount = talent.items.filter(
                  (i) => i.ai_moderation_status === "pending"
                ).length;
                const flaggedCount = talent.items.filter(
                  (i) => i.ai_moderation_status === "flagged"
                ).length;
                const approvedCount = talent.items.filter(
                  (i) => i.ai_moderation_status === "approved"
                ).length;

                return (
                  <div
                    key={talent.user_id}
                    className="rounded-lg border overflow-hidden"
                  >
                    <button
                      type="button"
                      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-muted/50 transition-colors text-left"
                      onClick={() => toggleExpand(talent.user_id)}
                    >
                      <div className="shrink-0">
                        {talent.profile_photo ? (
                          <img
                            src={talent.profile_photo}
                            alt={talent.user_name}
                            className="w-9 h-9 rounded-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display =
                                "none";
                            }}
                          />
                        ) : (
                          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-300 to-blue-400 flex items-center justify-center text-xs font-medium text-white">
                            {(talent.user_name || "U")
                              .charAt(0)
                              .toUpperCase()}
                          </div>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium truncate">
                            {talent.user_name}
                          </span>
                          {talent.username && (
                            <span className="text-xs text-muted-foreground shrink-0">
                              @{talent.username}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground truncate">
                          {talent.user_email}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        {pendingCount > 0 && (
                          <Badge
                            variant="outline"
                            className="text-[10px] bg-amber-50 text-amber-700 border-amber-200"
                          >
                            {pendingCount} pending
                          </Badge>
                        )}
                        {flaggedCount > 0 && (
                          <Badge
                            variant="outline"
                            className="text-[10px] bg-red-50 text-red-700 border-red-200"
                          >
                            {flaggedCount} flagged
                          </Badge>
                        )}
                        <span className="text-xs text-muted-foreground">
                          {talent.items.length} item
                          {talent.items.length !== 1 ? "s" : ""}
                        </span>
                        {isExpanded ? (
                          <ChevronDown className="w-4 h-4 text-muted-foreground" />
                        ) : (
                          <ChevronRight className="w-4 h-4 text-muted-foreground" />
                        )}
                      </div>
                    </button>

                    {isExpanded && (
                      <div className="border-t px-4 py-4">
                        {talent.items.length === 0 ? (
                          <p className="text-xs text-muted-foreground text-center py-6">
                            No items in this portfolio.
                          </p>
                        ) : (
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {talent.items.map((item) => (
                              <div
                                key={item.id}
                                className="rounded-lg border overflow-hidden bg-background"
                              >
                                {renderMedia(item)}
                                <div className="p-3 space-y-2">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <Badge
                                      variant="secondary"
                                      className="text-[10px] capitalize"
                                    >
                                      {typeLabel(item.type)}
                                    </Badge>
                                    <Badge
                                      variant="secondary"
                                      className="text-[10px] capitalize"
                                    >
                                      {item.category}
                                    </Badge>
                                    {item.is_pinned && (
                                      <Badge
                                        variant="secondary"
                                        className="text-[10px] gap-0.5"
                                      >
                                        <Pin className="w-2.5 h-2.5" />
                                        Pinned
                                      </Badge>
                                    )}
                                    {statusBadge(item.ai_moderation_status)}
                                  </div>
                                  {item.caption && (
                                    <p className="text-xs text-muted-foreground line-clamp-2">
                                      {item.caption}
                                    </p>
                                  )}
                                  {(item.type === "youtube" ||
                                    item.type === "instagram") &&
                                    (item.embed_url || item.url) && (
                                    <a
                                      href={item.embed_url || item.url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-[10px] text-muted-foreground hover:text-foreground truncate block"
                                    >
                                      {item.embed_url || item.url}
                                    </a>
                                  )}
                                  {item.moderation_notes && (
                                    <p className="text-[10px] text-red-600 bg-red-50 rounded px-2 py-1">
                                      Note: {item.moderation_notes}
                                    </p>
                                  )}
                                  <div className="flex items-center justify-between pt-1">
                                    <span className="text-[10px] text-muted-foreground">
                                      {new Date(
                                        item.created_at
                                      ).toLocaleDateString()}
                                    </span>
                                    {renderItemActions(talent, item)}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Reject Portfolio Item</DialogTitle>
            <DialogDescription>
              Provide a reason for rejecting this item from{" "}
              {rejectTarget?.userName}. The item will be flagged and the reason
              will be recorded.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            {actionError && (
              <Alert variant="destructive">
                <AlertDescription>{actionError}</AlertDescription>
              </Alert>
            )}
            <div className="space-y-2">
              <Label htmlFor="rejection-reason">Rejection Reason</Label>
              <Input
                id="rejection-reason"
                placeholder="e.g., Inappropriate content, copyright violation"
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
              />
            </div>
            <div className="flex items-center justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  setRejectDialogOpen(false);
                  setRejectTarget(null);
                  setActionError(null);
                }}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleReject}
                disabled={
                  rejectTarget
                    ? processingKey ===
                      `${rejectTarget.userId}:${rejectTarget.itemId}`
                    : false
                }
              >
                {rejectTarget &&
                processingKey ===
                  `${rejectTarget.userId}:${rejectTarget.itemId}` ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  "Reject"
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
