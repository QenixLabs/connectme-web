"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Clock,
  Check,
  X,
  FileText,
  Loader2,
  ExternalLink,
  User,
} from "lucide-react";
import { toast } from "sonner";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { adminApi, type PendingVerificationItem } from "@/lib/api";

function getApiErrorMessage(error: unknown, fallback: string): string {
  const err = error as { response?: { data?: { message?: string } }; message?: string };
  return err.response?.data?.message ?? err.message ?? fallback;
}

export default function AdminVerificationsPage() {
  const router = useRouter();
  const [pending, setPending] = useState<PendingVerificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectTarget, setRejectTarget] = useState<PendingVerificationItem | null>(
    null
  );
  const [rejectReason, setRejectReason] = useState("");
  const [viewerOpen, setViewerOpen] = useState(false);
  const [viewerItem, setViewerItem] = useState<PendingVerificationItem | null>(null);

  const fetchPending = useCallback(() => {
    setLoading(true);
    setError(null);
    adminApi
      .getPendingVerifications()
      .then((data) => setPending(data))
      .catch((err) => setError(getApiErrorMessage(err, "Failed to load pending verifications")))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchPending();
  }, [fetchPending]);

  const handleApprove = async (item: PendingVerificationItem) => {
    setActionError(null);
    setProcessingId(item._id);
    try {
      await adminApi.approveVerification(item._id);
      setPending((prev) => prev.filter((p) => p._id !== item._id));
      toast.success("Verification approved");
    } catch (err) {
      setActionError(getApiErrorMessage(err, "Failed to approve"));
    } finally {
      setProcessingId(null);
    }
  };

  const openRejectDialog = (item: PendingVerificationItem) => {
    setRejectTarget(item);
    setRejectReason("");
    setRejectDialogOpen(true);
    setActionError(null);
  };

  const openViewer = (item: PendingVerificationItem) => {
    setViewerItem(item);
    setViewerOpen(true);
    setActionError(null);
  };

  const handleReject = async () => {
    if (!rejectTarget) return;
    if (!rejectReason.trim()) {
      setActionError("Please provide a reason for rejection");
      return;
    }
    setActionError(null);
    setProcessingId(rejectTarget._id);
    try {
      await adminApi.rejectVerification(rejectTarget._id, rejectReason.trim());
      setPending((prev) => prev.filter((p) => p._id !== rejectTarget._id));
      setRejectDialogOpen(false);
      setRejectTarget(null);
      setRejectReason("");
      toast.success("Verification rejected");
    } catch (err) {
      setActionError(getApiErrorMessage(err, "Failed to reject"));
    } finally {
      setProcessingId(null);
    }
  };

  const artists = pending.filter((p) => p.user_role === "talent");
  const brands = pending.filter((p) => p.user_role === "recruiter");

  const renderTable = (items: PendingVerificationItem[], title: string) => {
    if (items.length === 0) return null;

    return (
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-muted-foreground">{title}</h3>
        <div className="rounded-lg border border-border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted">
              <tr>
                <th className="text-left px-4 py-2.5 font-medium text-muted-foreground">Name</th>
                <th className="text-left px-4 py-2.5 font-medium text-muted-foreground">Role</th>
                <th className="text-left px-4 py-2.5 font-medium text-muted-foreground">Documents</th>
                <th className="text-left px-4 py-2.5 font-medium text-muted-foreground">Status</th>
                <th className="text-right px-4 py-2.5 font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {items.map((item) => (
                <tr
                  key={item._id}
                  className="hover:bg-muted/50 cursor-pointer"
                  onClick={() => openViewer(item)}
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {item.profile_photo ? (
                        <img
                          src={item.profile_photo}
                          alt={item.user_name}
                          className="w-8 h-8 rounded-full object-cover shrink-0"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                          }}
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-300 to-blue-500 flex items-center justify-center text-[10px] font-medium text-white shrink-0">
                          {item.user_name.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div>
                        <p className="font-medium">{item.user_name}</p>
                        <p className="text-xs text-muted-foreground">{item.user_email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 capitalize">{item.user_role}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5 text-muted-foreground" strokeWidth={1.5} />
                      <span>{item.submitted_docs.length}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-warning/10 text-warning border border-warning/20">
                      <Clock className="w-3 h-3" strokeWidth={1.5} />
                      Pending
                    </span>
                  </td>
                  <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-end gap-2">
                      {item.username && (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <a
                              href={`/talent/${item.username}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center justify-center h-7 px-2 text-xs font-medium rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground gap-1"
                            >
                              <User className="w-3 h-3" strokeWidth={1.5} />
                              Profile
                            </a>
                          </TooltipTrigger>
                          <TooltipContent>View public profile</TooltipContent>
                        </Tooltip>
                      )}
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 text-xs gap-1 bg-success-soft text-success border-success/20 hover:bg-success/20"
                        onClick={() => handleApprove(item)}
                        disabled={processingId === item._id}
                      >
                        {processingId === item._id ? (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        ) : (
                          <>
                            <Check className="w-3 h-3" strokeWidth={1.5} />
                            Approve
                          </>
                        )}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 text-xs gap-1"
                        onClick={() => openRejectDialog(item)}
                        disabled={processingId === item._id}
                      >
                        <X className="w-3 h-3" strokeWidth={1.5} />
                        Reject
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
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

      <Card className="border-border">
        <CardHeader>
          <CardTitle className="text-lg">Pending Profiles</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {actionError && (
            <Alert variant="destructive">
              <AlertDescription>{actionError}</AlertDescription>
            </Alert>
          )}

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : error ? (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : pending.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-12">No pending verifications.</p>
          ) : (
            <>
              {renderTable(artists, "Artists")}
              {renderTable(brands, "Brands")}
            </>
          )}
        </CardContent>
      </Card>

      {/* Reject Dialog */}
      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Reject Verification</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting {rejectTarget?.user_name}.
              This will be sent to the user.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            {actionError && (
              <Alert variant="destructive">
                <AlertDescription>{actionError}</AlertDescription>
              </Alert>
            )}
            <div className="space-y-2">
              <label className="text-sm font-medium">Rejection Reason</label>
              <Input
                placeholder="e.g., Document unclear, expired ID"
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
                disabled={processingId === rejectTarget?._id}
              >
                {processingId === rejectTarget?._id ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  "Reject"
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Document Viewer Dialog */}
      <Dialog open={viewerOpen} onOpenChange={setViewerOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Verification Details</DialogTitle>
            <DialogDescription>
              Review user information and documents
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {viewerItem && (
              <div className="flex items-center gap-3">
                {viewerItem.profile_photo ? (
                  <img
                    src={viewerItem.profile_photo}
                    alt={viewerItem.user_name}
                    className="w-12 h-12 rounded-full object-cover shrink-0"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-300 to-blue-500 flex items-center justify-center text-sm font-medium text-white shrink-0">
                    {viewerItem.user_name.charAt(0).toUpperCase()}
                  </div>
                )}
                <div>
                  <p className="font-medium">{viewerItem.user_name}</p>
                  <p className="text-xs text-muted-foreground">{viewerItem.user_email}</p>
                  <p className="text-xs text-muted-foreground capitalize">{viewerItem.user_role}</p>
                </div>
              </div>
            )}

            {viewerItem?.username && (
              <a
                href={`/talent/${viewerItem.username}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
              >
                <User className="w-4 h-4" strokeWidth={1.5} />
                View public profile
                <ExternalLink className="w-3 h-3" strokeWidth={1.5} />
              </a>
            )}

            <div className="space-y-2">
              <p className="text-sm font-medium">Documents</p>
              {viewerItem?.docs.length === 0 && (
                <p className="text-sm text-muted-foreground">No documents available.</p>
              )}
              <div className="space-y-2">
                {viewerItem?.docs.map((doc, i) => (
                  <a
                    key={i}
                    href={doc.download_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 p-2 rounded-md border border-border hover:bg-accent/50 transition-colors"
                  >
                    <FileText className="w-4 h-4 text-muted-foreground shrink-0" strokeWidth={1.5} />
                    <span className="text-sm flex-1 truncate">{doc.type}</span>
                    <ExternalLink className="w-3.5 h-3.5 text-muted-foreground shrink-0" strokeWidth={1.5} />
                  </a>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <Button
                variant="outline"
                onClick={() => {
                  setViewerOpen(false);
                  setViewerItem(null);
                }}
              >
                Close
              </Button>
              {viewerItem && (
                <Button
                  className="gap-1 bg-success-soft text-success border-success/20 hover:bg-success/20"
                  variant="outline"
                  onClick={() => {
                    handleApprove(viewerItem);
                    setViewerOpen(false);
                    setViewerItem(null);
                  }}
                  disabled={processingId === viewerItem._id}
                >
                  {processingId === viewerItem._id ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <Check className="w-4 h-4" strokeWidth={1.5} />
                      Approve
                    </>
                  )}
                </Button>
              )}
              {viewerItem && (
                <Button
                  variant="destructive"
                  onClick={() => {
                    openRejectDialog(viewerItem);
                    setViewerOpen(false);
                    setViewerItem(null);
                  }}
                  disabled={processingId === viewerItem._id}
                >
                  <X className="w-4 h-4" strokeWidth={1.5} />
                  Reject
                </Button>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
