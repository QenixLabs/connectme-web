"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Loader2,
  AlertCircle,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  ShieldAlert,
  ShieldBan,
  ShieldCheck,
  ShieldMinus,
  ShieldX,
  UserCheck,
} from "lucide-react";

import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Avatar } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { adminApi, type UserDetail, type AdminNote, type UserActivity, type PaginatedModerationActions } from "@/lib/api";
import { getApiErrorMessage } from "@/lib/formatters";

const STATUS_COLORS: Record<string, string> = {
  active: "bg-emerald-100 text-emerald-800 border-emerald-200",
  suspended: "bg-amber-100 text-amber-800 border-amber-200",
  banned: "bg-rose-100 text-rose-800 border-rose-200",
};

const ACTION_CONFIG: Record<string, { label: string; icon: React.ReactNode; variant: "default" | "destructive" | "outline" | "secondary"; needsDuration: boolean; needsTier: boolean }> = {
  warning: { label: "Warn", icon: <ShieldAlert className="w-3.5 h-3.5" />, variant: "secondary", needsDuration: false, needsTier: false },
  suspension: { label: "Suspend", icon: <ShieldMinus className="w-3.5 h-3.5" />, variant: "destructive", needsDuration: true, needsTier: false },
  ban: { label: "Ban", icon: <ShieldBan className="w-3.5 h-3.5" />, variant: "destructive", needsDuration: false, needsTier: false },
  edit_verification: { label: "Edit Verification", icon: <ShieldX className="w-3.5 h-3.5" />, variant: "outline", needsDuration: false, needsTier: true },
  mark_safe: { label: "Mark Safe", icon: <ShieldCheck className="w-3.5 h-3.5" />, variant: "default", needsDuration: false, needsTier: false },
};

interface UserDetailPanelProps {
  userId: string | null;
  onClose: () => void;
  onStatusChange: () => void;
}

export function UserDetailPanel({ userId, onClose, onStatusChange }: UserDetailPanelProps) {
  const router = useRouter();
  const [detail, setDetail] = useState<UserDetail | null>(null);
  const [activity, setActivity] = useState<UserActivity | null>(null);
  const [notes, setNotes] = useState<AdminNote[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [noteContent, setNoteContent] = useState("");
  const [addingNote, setAddingNote] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [activeAction, setActiveAction] = useState<string | null>(null);
  const [actionReason, setActionReason] = useState("");
  const [actionDuration, setActionDuration] = useState("1");
  const [verificationTier, setVerificationTier] = useState(1);
  const [newPassword, setNewPassword] = useState("");
  const [updatingPassword, setUpdatingPassword] = useState(false);
  const [moderationPage, setModerationPage] = useState(1);
  const [moderationData, setModerationData] = useState<PaginatedModerationActions | null>(null);
  const [moderationLoading, setModerationLoading] = useState(false);

  const fetchModerationActions = async (page = 1) => {
    if (!userId) return;
    setModerationLoading(true);
    try {
      const data = await adminApi.getUserModerationActions(userId, { page, limit: 10 });
      setModerationData(data);
    } catch (err) {
      setError(getApiErrorMessage(err, "Failed to load moderation actions"));
    } finally {
      setModerationLoading(false);
    }
  };

  useEffect(() => {
    if (!userId) {
      setDetail(null);
      setActivity(null);
      setNotes([]);
      setActiveAction(null);
      setActionReason("");
      setActionDuration("1");
      setVerificationTier(1);
      setModerationPage(1);
      setModerationData(null);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);
    setActiveAction(null);

    Promise.all([
      adminApi.getUserById(userId),
      adminApi.getUserActivity(userId),
      adminApi.getUserNotes(userId),
    ])
      .then(([d, a, n]) => {
        if (!cancelled) {
          setDetail(d);
          setActivity(a);
          setNotes(n);
          setVerificationTier(d.user.verification_tier || 1);
        }
      })
      .catch((err) => {
        if (!cancelled) setError(getApiErrorMessage(err, "Failed to load user"));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    fetchModerationActions(1);

    return () => {
      cancelled = true;
    };
  }, [userId]);

  useEffect(() => {
    if (!userId || moderationPage === 1) return;
    fetchModerationActions(moderationPage);
  }, [moderationPage, userId]);

  const refreshData = async () => {
    if (!userId) return;
    const [d, a, n] = await Promise.all([
      adminApi.getUserById(userId),
      adminApi.getUserActivity(userId),
      adminApi.getUserNotes(userId),
    ]);
    setDetail(d);
    setActivity(a);
    setNotes(n);
  };

  const handleAddNote = async () => {
    if (!userId || !noteContent.trim()) return;
    setAddingNote(true);
    try {
      const note = await adminApi.addUserNote(userId, noteContent.trim());
      setNotes((prev) => [note, ...prev]);
      setNoteContent("");
    } catch (err) {
      setError(getApiErrorMessage(err, "Failed to add note"));
    } finally {
      setAddingNote(false);
    }
  };

  const handleAction = async (action: string, reason?: string) => {
    if (!userId) return;
    setActionLoading(action);
    try {
      if (action === "unrestrict") {
        await adminApi.unrestrictUser(userId, reason);
      }
      onStatusChange();
      await refreshData();
      await fetchModerationActions(moderationPage);
    } catch (err) {
      setError(getApiErrorMessage(err, `Failed to ${action} user`));
    } finally {
      setActionLoading(null);
    }
  };

  const handleModerationAction = async (actionType: string) => {
    if (!userId) return;
    const reason = actionReason.trim();
    if (!reason && actionType !== "mark_safe") {
      setError("Reason is required for this action");
      return;
    }
    setActionLoading(actionType);
    setError(null);
    try {
      switch (actionType) {
        case "warning":
          await adminApi.warnUser(userId, reason);
          break;
        case "suspension":
          await adminApi.suspendUser(userId, reason, actionDuration);
          break;
        case "ban":
          await adminApi.banUser(userId, reason);
          break;
        case "edit_verification":
          await adminApi.updateVerificationTier(userId, reason, verificationTier);
          break;
        case "mark_safe":
          await adminApi.markUserSafe(userId, reason || undefined);
          break;
      }
      setActiveAction(null);
      setActionReason("");
      setActionDuration("1");
      setVerificationTier(detail?.user.verification_tier || 1);
      onStatusChange();
      await refreshData();
      await fetchModerationActions(moderationPage);
    } catch (err) {
      setError(getApiErrorMessage(err, `Failed to ${actionType} user`));
    } finally {
      setActionLoading(null);
    }
  };

  const handleUpdatePassword = async () => {
    if (!userId || !newPassword.trim()) return;
    if (newPassword.trim().length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    setUpdatingPassword(true);
    setError(null);
    try {
      await adminApi.updateUserPassword(userId, newPassword.trim());
      setNewPassword("");
    } catch (err) {
      setError(getApiErrorMessage(err, "Failed to update password"));
    } finally {
      setUpdatingPassword(false);
    }
  };

  const open = !!userId;

  return (
    <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
      <SheetContent className="w-full sm:max-w-xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="text-base">User Details</SheetTitle>
        </SheetHeader>

        {loading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
          </div>
        )}

        {error && (
          <Alert variant="destructive" className="mt-4">
            <AlertCircle className="w-4 h-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {!loading && detail && (
          <div className="mt-4 space-y-4">
            {/* Header */}
            <div className="flex items-start gap-3">
              <Avatar name={detail.user.display_name} src={detail.user.profile_photo} size="md" className="w-12 h-12" />
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-sm">{detail.user.display_name}</div>
                <div className="text-xs text-muted-foreground">{detail.user.email}</div>
                <div className="flex items-center gap-1.5 mt-1">
                  <Badge variant="outline" className="text-[10px] capitalize">
                    {detail.user.role}
                  </Badge>
                  <Badge
                    variant="outline"
                    className={`text-[10px] capitalize ${STATUS_COLORS[detail.user.status] || ""}`}
                  >
                    {detail.user.status}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex flex-wrap gap-2">
              {detail.user.status !== "active" && (
                <Button
                  size="sm"
                  variant="outline"
                  className="text-xs h-8"
                  onClick={() => handleAction("unrestrict")}
                  disabled={actionLoading === "unrestrict"}
                >
                  <CheckCircle className="w-3.5 h-3.5 mr-1" />
                  Activate
                </Button>
              )}
            </div>

            <Tabs defaultValue="profile" className="w-full">
              <TabsList className="w-full">
                <TabsTrigger value="profile" className="text-xs flex-1">Profile</TabsTrigger>
                <TabsTrigger value="moderation" className="text-xs flex-1">Moderation</TabsTrigger>
                <TabsTrigger value="activity" className="text-xs flex-1">Activity</TabsTrigger>
                <TabsTrigger value="notes" className="text-xs flex-1">Notes</TabsTrigger>
              </TabsList>

              <TabsContent value="profile" className="space-y-3 mt-3">
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="text-muted-foreground">Phone</div>
                  <div>{detail.user.phone}</div>
                  <div className="text-muted-foreground">Auth Provider</div>
                  <div className="capitalize">{detail.user.auth_provider || "credentials"}</div>
                  <div className="text-muted-foreground">Verification Tier</div>
                  <div>{detail.user.verification_tier}</div>
                  <div className="text-muted-foreground">Trust Score</div>
                  <div>{detail.user.trust_score}</div>
                  <div className="text-muted-foreground">Email Verified</div>
                  <div>{detail.user.is_email_verified ? "Yes" : "No"}</div>
                  <div className="text-muted-foreground">Phone Verified</div>
                  <div>{detail.user.is_phone_verified ? "Yes" : "No"}</div>
                  <div className="text-muted-foreground">Joined</div>
                  <div>{new Date(detail.user.created_at).toLocaleDateString()}</div>
                  <div className="text-muted-foreground">Last Active</div>
                  <div>
                    {detail.user.last_active_at
                      ? new Date(detail.user.last_active_at).toLocaleDateString()
                      : "—"}
                  </div>
                </div>

                <div className="border-t pt-3 mt-3 space-y-2">
                  <div className="text-xs font-medium">Reset Password</div>
                  <div className="flex gap-2">
                    <Input
                      type="password"
                      placeholder="New password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="text-xs h-8 flex-1"
                    />
                    <Button
                      size="sm"
                      className="text-xs h-8"
                      onClick={handleUpdatePassword}
                      disabled={updatingPassword || !newPassword.trim()}
                    >
                      {updatingPassword ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        "Update"
                      )}
                    </Button>
                  </div>
                </div>

                {detail.profile && (
                  <div className="border-t pt-3 mt-3">
                    <div className="text-xs font-medium mb-2">Profile</div>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      {detail.user.role === "talent" ? (
                        <>
                          <div className="text-muted-foreground">Username</div>
                          <div>{detail.profile.username || "—"}</div>
                          <div className="text-muted-foreground">Professions</div>
                          <div>{detail.profile.professions?.join(", ") || "—"}</div>
                          <div className="text-muted-foreground">Industries</div>
                          <div>{detail.profile.industries?.join(", ") || "—"}</div>
                          <div className="text-muted-foreground">Headline</div>
                          <div>{detail.profile.headline || "—"}</div>
                          <div className="text-muted-foreground">Location</div>
                          <div>
                            {detail.profile.location
                              ? `${detail.profile.location.city || ""}, ${detail.profile.location.country || ""}`
                              : "—"}
                          </div>
                          <div className="text-muted-foreground">Privacy</div>
                          <div className="capitalize">{detail.profile.privacy_mode || "—"}</div>
                        </>
                      ) : (
                        <>
                          <div className="text-muted-foreground">Company</div>
                          <div>{detail.profile.company_name || "—"}</div>
                          <div className="text-muted-foreground">Website</div>
                          <div>{detail.profile.company_website || "—"}</div>
                          <div className="text-muted-foreground">Industry</div>
                          <div>{detail.profile.industry || "—"}</div>
                          <div className="text-muted-foreground">Position</div>
                          <div>{detail.profile.position || "—"}</div>
                          <div className="text-muted-foreground">Verification Status</div>
                          <div className="capitalize">{detail.profile.verification_status || "—"}</div>
                        </>
                      )}
                    </div>
                    {detail.user.role === "talent" && detail.profile.username && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-xs h-8 mt-3"
                        onClick={() => router.push(`/talent/${detail.profile!.username}`)}
                      >
                        <ExternalLink className="w-3.5 h-3.5 mr-1" />
                        View Public Profile
                      </Button>
                    )}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="moderation" className="space-y-3 mt-3">
                {/* Moderation Actions */}
                <div className="space-y-3">
                  <div className="text-xs font-medium">Actions</div>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(ACTION_CONFIG).map(([key, config]) => (
                      <Button
                        key={key}
                        size="sm"
                        variant={activeAction === key ? "default" : config.variant}
                        className="text-xs h-8"
                        onClick={() => {
                          setActiveAction(activeAction === key ? null : key);
                          setActionReason("");
                          setActionDuration("1");
                          setVerificationTier(detail?.user.verification_tier || 1);
                          setError(null);
                        }}
                        disabled={!!actionLoading}
                      >
                        {config.icon}
                        <span className="ml-1">{config.label}</span>
                      </Button>
                    ))}
                  </div>

                  {activeAction && (
                    <div className="border rounded-md p-3 space-y-3">
                      <div className="text-xs font-medium">
                        {ACTION_CONFIG[activeAction].label}
                      </div>
                      {ACTION_CONFIG[activeAction].needsDuration && (
                        <div className="space-y-1">
                          <Label className="text-xs">Duration (days)</Label>
                          <Input
                            type="number"
                            min={1}
                            max={365}
                            value={actionDuration}
                            onChange={(e) => setActionDuration(e.target.value)}
                            className="text-xs h-8"
                          />
                        </div>
                      )}
                      {ACTION_CONFIG[activeAction].needsTier && (
                        <div className="space-y-1">
                          <Label className="text-xs">Verification Tier</Label>
                          <div className="flex gap-2">
                            {[1, 2, 3].map((tier) => (
                              <Button
                                key={tier}
                                size="sm"
                                variant={verificationTier === tier ? "default" : "outline"}
                                className="text-xs h-8 w-8 p-0"
                                onClick={() => setVerificationTier(tier)}
                              >
                                {tier}
                              </Button>
                            ))}
                          </div>
                        </div>
                      )}
                      <div className="space-y-1">
                        <Label className="text-xs">
                          Reason {activeAction !== "mark_safe" && <span className="text-rose-500">*</span>}
                        </Label>
                        <Textarea
                          placeholder="Enter reason for this action..."
                          value={actionReason}
                          onChange={(e) => setActionReason(e.target.value)}
                          className="text-xs min-h-[60px]"
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          className="text-xs h-8"
                          onClick={() => handleModerationAction(activeAction)}
                          disabled={
                            actionLoading === activeAction ||
                            (activeAction !== "mark_safe" && !actionReason.trim())
                          }
                        >
                          {actionLoading === activeAction ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <>
                              <UserCheck className="w-3.5 h-3.5 mr-1" />
                              Confirm
                            </>
                          )}
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-xs h-8"
                          onClick={() => {
                            setActiveAction(null);
                            setActionReason("");
                            setActionDuration("1");
                            setVerificationTier(detail?.user.verification_tier || 1);
                            setError(null);
                          }}
                          disabled={!!actionLoading}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  )}
                </div>

                <div className="text-xs font-medium">Reports ({detail.report_count})</div>
                {activity?.recent_reports && activity.recent_reports.length > 0 ? (
                  <div className="space-y-2">
                    {activity.recent_reports.map((report) => (
                      <div key={report._id} className="border rounded-md p-2 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="font-medium">{report.reason}</span>
                          <Badge variant="outline" className="text-[10px]">
                            {report.status}
                          </Badge>
                        </div>
                        <div className="text-muted-foreground mt-1">
                          Reporter: {report.reporter_id?.email || "Unknown"} ·{" "}
                          {new Date(report.created_at).toLocaleDateString()}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-xs text-muted-foreground">No reports.</div>
                )}

                <div className="text-xs font-medium mt-4">Moderation Actions</div>
                {moderationLoading ? (
                  <div className="flex justify-center py-4">
                    <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                  </div>
                ) : moderationData && moderationData.actions.length > 0 ? (
                  <div className="space-y-2">
                    {moderationData.actions.map((action) => (
                      <div key={action._id} className="border rounded-md p-2 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="font-medium capitalize">{action.action_type}</span>
                          <span className="text-muted-foreground">
                            {new Date(action.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="text-muted-foreground mt-1">{action.reason}</div>
                        <div className="text-muted-foreground">
                          By: {action.admin_id?.email || "System"}
                        </div>
                      </div>
                    ))}
                    {moderationData.total_pages > 1 && (
                      <div className="flex items-center justify-between pt-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-xs h-8 px-2"
                          onClick={() => setModerationPage((p) => Math.max(1, p - 1))}
                          disabled={moderationPage <= 1}
                        >
                          <ChevronLeft className="w-3.5 h-3.5 mr-1" />
                          Prev
                        </Button>
                        <span className="text-xs text-muted-foreground">
                          Page {moderationData.page} of {moderationData.total_pages}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-xs h-8 px-2"
                          onClick={() => setModerationPage((p) => Math.min(moderationData.total_pages, p + 1))}
                          disabled={moderationPage >= moderationData.total_pages}
                        >
                          Next
                          <ChevronRight className="w-3.5 h-3.5 ml-1" />
                        </Button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-xs text-muted-foreground">No moderation actions.</div>
                )}
              </TabsContent>

              <TabsContent value="activity" className="space-y-3 mt-3">
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="text-muted-foreground">Messages Sent</div>
                  <div>{activity?.message_count ?? 0}</div>
                </div>

                {activity?.recent_campaigns && activity.recent_campaigns.length > 0 && (
                  <div>
                    <div className="text-xs font-medium mb-2">Recent Campaigns</div>
                    <div className="space-y-2">
                      {activity.recent_campaigns.map((c) => (
                        <div key={c._id} className="border rounded-md p-2 text-xs">
                          <div className="font-medium">{c.name}</div>
                          <div className="text-muted-foreground capitalize">{c.status}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="notes" className="space-y-3 mt-3">
                <div className="space-y-2">
                  <Textarea
                    placeholder="Add a note..."
                    value={noteContent}
                    onChange={(e) => setNoteContent(e.target.value)}
                    className="text-xs min-h-[80px]"
                  />
                  <Button
                    size="sm"
                    className="text-xs h-8"
                    onClick={handleAddNote}
                    disabled={addingNote || !noteContent.trim()}
                  >
                    {addingNote ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Add Note"}
                  </Button>
                </div>

                <div className="space-y-2">
                  {notes.length === 0 ? (
                    <div className="text-xs text-muted-foreground">No notes yet.</div>
                  ) : (
                    notes.map((note) => (
                      <div key={note._id} className="border rounded-md p-2 text-xs">
                        <div className="text-muted-foreground flex items-center justify-between">
                          <span>{note.admin_id?.email || "Admin"}</span>
                          <span>{new Date(note.created_at).toLocaleDateString()}</span>
                        </div>
                        <div className="mt-1">{note.content}</div>
                      </div>
                    ))
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
