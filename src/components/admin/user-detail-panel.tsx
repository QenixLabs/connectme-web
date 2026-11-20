"use client";

import { useCallback, useEffect, useState } from "react";
import type { ReactNode } from "react";
import { useRouter } from "next/navigation";
import {
  Loader2,
  AlertCircle,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Copy,
  ExternalLink,
  Mail,
  Phone,
  Clock3,
  MessageSquare,
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
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  adminApi,
  type AdminNote,
  type PaginatedAdminUserInvoices,
  type PaginatedModerationActions,
  type UserActivity,
  type UserDetail,
} from "@/lib/api";
import { cn } from "@/lib/utils";
import { SubscriptionOverview } from "./subscription-overview";
import { toast } from "sonner";

function getApiErrorMessage(error: unknown, fallback: string): string {
  const err = error as { response?: { data?: { message?: string } }; message?: string };
  return err.response?.data?.message ?? err.message ?? fallback;
}

function getInitials(name: string) {
  const initials = name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return initials || "?";
}

function formatDateTime(value?: string | null) {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "—"
    : date.toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
}

const STATUS_COLORS: Record<string, string> = {
  active: "bg-green/10 text-green border-green/20",
  suspended: "bg-gold/10 text-gold border-gold/20",
  banned: "bg-rose/10 text-rose border-rose/20",
};

const ACTION_CONFIG: Record<
  string,
  {
    label: string;
    icon: ReactNode;
    variant: "default" | "destructive" | "outline" | "secondary";
    needsDuration: boolean;
    needsTier: boolean;
  }
> = {
  warning: {
    label: "Warn",
    icon: <ShieldAlert className="h-3.5 w-3.5" />,
    variant: "secondary",
    needsDuration: false,
    needsTier: false,
  },
  suspension: {
    label: "Suspend",
    icon: <ShieldMinus className="h-3.5 w-3.5" />,
    variant: "destructive",
    needsDuration: true,
    needsTier: false,
  },
  ban: {
    label: "Ban",
    icon: <ShieldBan className="h-3.5 w-3.5" />,
    variant: "destructive",
    needsDuration: false,
    needsTier: false,
  },
  edit_verification: {
    label: "Edit Verification",
    icon: <ShieldX className="h-3.5 w-3.5" />,
    variant: "outline",
    needsDuration: false,
    needsTier: true,
  },
  mark_safe: {
    label: "Mark Safe",
    icon: <ShieldCheck className="h-3.5 w-3.5" />,
    variant: "default",
    needsDuration: false,
    needsTier: false,
  },
};

interface UserDetailPanelProps {
  userId: string | null;
  onClose: () => void;
  onStatusChange: () => void;
}

export function UserDetailPanel({
  userId,
  onClose,
  onStatusChange,
}: UserDetailPanelProps) {
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
  const [moderationData, setModerationData] =
    useState<PaginatedModerationActions | null>(null);
  const [moderationLoading, setModerationLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");
  const [invoices, setInvoices] = useState<PaginatedAdminUserInvoices | null>(null);
  const [invoicePage, setInvoicePage] = useState(1);
  const [invoicesLoading, setInvoicesLoading] = useState(false);

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

  const fetchInvoices = useCallback(async () => {
    if (!userId) return;
    setInvoicesLoading(true);
    try {
      const invoiceData = await adminApi.getUserInvoices(userId, {
        page: invoicePage,
        limit: 10,
      });
      setInvoices(invoiceData);
    } finally {
      setInvoicesLoading(false);
    }
  }, [userId, invoicePage]);

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
      setInvoices(null);
      setInvoicePage(1);
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
      .then(([userDetail, userActivity, userNotes]) => {
        if (!cancelled) {
          setDetail(userDetail);
          setActivity(userActivity);
          setNotes(userNotes);
          setVerificationTier(userDetail.user.verification_tier || 1);
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

  useEffect(() => {
    if (activeTab === "subscription" && userId) {
      fetchInvoices();
    }
  }, [invoicePage, userId, activeTab, fetchInvoices]);

  const refreshData = async () => {
    if (!userId) return;
    const [userDetail, userActivity, userNotes] = await Promise.all([
      adminApi.getUserById(userId),
      adminApi.getUserActivity(userId),
      adminApi.getUserNotes(userId),
    ]);
    setDetail(userDetail);
    setActivity(userActivity);
    setNotes(userNotes);
  };

  const handleAddNote = async () => {
    if (!userId || !noteContent.trim()) return;
    setAddingNote(true);
    try {
      const note = await adminApi.addUserNote(userId, noteContent.trim());
      setNotes((previous) => [note, ...previous]);
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
          toast.success("Warning issued", { description: "The user was notified in-app and by email." });
          break;
        case "suspension":
          await adminApi.suspendUser(userId, reason, actionDuration);
          toast.success("Account suspended", { description: `The user was notified about the ${actionDuration}-day suspension.` });
          break;
        case "ban":
          await adminApi.banUser(userId, reason);
          toast.success("Account banned", { description: "The user was notified in-app and by email." });
          break;
        case "edit_verification":
          await adminApi.updateVerificationTier(userId, reason, verificationTier);
          toast.success("Verification tier updated");
          break;
        case "mark_safe":
          await adminApi.markUserSafe(userId, reason || undefined);
          toast.success("User marked safe");
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
    <Sheet open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <SheetContent className="w-full overflow-y-auto sm:max-w-2xl">
        <SheetHeader>
          <SheetTitle className="text-base">User Details</SheetTitle>
        </SheetHeader>

        {loading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        )}

        {error && (
          <Alert variant="destructive" className="mt-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {!loading && detail && detail.user._id === userId && (
          <div className="mt-4 space-y-4">
            <div className="flex items-start gap-3">
              <Avatar size="lg" className="size-12">
                {detail.user.profile_photo && (
                  <AvatarImage
                    src={detail.user.profile_photo}
                    alt={`${detail.user.display_name} profile photo`}
                  />
                )}
                <AvatarFallback className="bg-muted text-sm font-semibold text-muted-foreground">
                  {getInitials(detail.user.display_name || detail.user.email)}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <div className="text-sm font-semibold">{detail.user.display_name}</div>
                <div className="text-xs text-muted-foreground">{detail.user.email}</div>
                <div className="mt-1 flex items-center gap-1.5">
                  <Badge variant="outline" className="text-[10px] capitalize">
                    {detail.user.role}
                  </Badge>
                  <Badge
                    variant="outline"
                    className={cn(
                      "text-[10px] capitalize",
                      STATUS_COLORS[detail.user.status]
                    )}
                  >
                    {detail.user.status}
                  </Badge>
                </div>
              </div>
            </div>

            <div className="grid gap-2 rounded-lg border border-border bg-muted/20 p-3 text-xs sm:grid-cols-2">
              <a
                href={`mailto:${detail.user.email}`}
                className="flex min-w-0 items-center gap-2 text-foreground hover:text-primary"
              >
                <Mail className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                <span className="truncate">{detail.user.email || "No email"}</span>
              </a>
              {detail.user.phone ? (
                <a
                  href={`tel:${detail.user.phone}`}
                  className="flex min-w-0 items-center gap-2 text-foreground hover:text-primary"
                >
                  <Phone className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                  <span className="truncate">{detail.user.phone}</span>
                </a>
              ) : (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Phone className="h-3.5 w-3.5" /> No phone number
                </div>
              )}
              <div className="flex min-w-0 items-center gap-2 text-muted-foreground sm:col-span-2">
                <span className="shrink-0">User ID</span>
                <code className="truncate font-mono text-[10px] text-foreground">
                  {detail.user._id}
                </code>
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  className="ml-auto h-6 w-6 shrink-0"
                  aria-label="Copy user ID"
                  onClick={() => navigator.clipboard.writeText(detail.user._id)}
                >
                  <Copy className="h-3 w-3" />
                </Button>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {detail.user.status !== "active" && (
                <Button
                  size="sm"
                  variant="outline"
                  className="h-8 text-xs"
                  onClick={() => handleAction("unrestrict")}
                  disabled={actionLoading === "unrestrict"}
                >
                  <CheckCircle className="mr-1 h-3.5 w-3.5" />
                  Activate
                </Button>
              )}
            </div>

            <SubscriptionOverview key={detail.user._id} userId={detail.user._id} onChange={onStatusChange} />

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="w-full">
                <TabsTrigger value="profile" className="flex-1 text-xs">
                  Profile
                </TabsTrigger>
                <TabsTrigger value="moderation" className="flex-1 text-xs">
                  Moderation
                </TabsTrigger>
                <TabsTrigger value="activity" className="flex-1 text-xs">
                  Activity
                </TabsTrigger>
                <TabsTrigger value="notes" className="flex-1 text-xs">
                  Notes
                </TabsTrigger>
                <TabsTrigger value="subscription" className="flex-1 text-xs">
                  Invoices
                </TabsTrigger>
              </TabsList>

              <TabsContent value="profile" className="mt-3 space-y-3">
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {[
                    { label: "Trust score", value: `${detail.user.trust_score}/100` },
                    { label: "Reports", value: detail.report_count },
                    { label: "Verification", value: `Tier ${detail.user.verification_tier}` },
                  ].map((metric) => (
                    <div key={metric.label} className="min-w-0 rounded-lg border border-border p-2.5">
                      <div className="truncate text-[10px] text-muted-foreground">{metric.label}</div>
                      <div className="mt-1 truncate text-sm font-semibold tabular-nums">{metric.value}</div>
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="text-muted-foreground">Phone</div>
                  <div>{detail.user.phone || "—"}</div>
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
                  <div>{formatDateTime(detail.user.created_at)}</div>
                  <div className="text-muted-foreground">Last Active</div>
                  <div>
                    {detail.user.last_active_at
                      ? formatDateTime(detail.user.last_active_at)
                      : "—"}
                  </div>
                </div>

                <div className="mt-3 space-y-2 border-t border-border pt-3">
                  <div className="text-xs font-medium">Reset Password</div>
                  <div className="flex gap-2">
                    <Input
                      type="password"
                      placeholder="New password"
                      value={newPassword}
                      onChange={(event) => setNewPassword(event.target.value)}
                      className="h-8 flex-1 text-xs"
                    />
                    <Button
                      size="sm"
                      className="h-8 text-xs"
                      onClick={handleUpdatePassword}
                      disabled={updatingPassword || !newPassword.trim()}
                    >
                      {updatingPassword ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        "Update"
                      )}
                    </Button>
                  </div>
                </div>

                {detail.profile && (
                  <div className="mt-3 border-t border-border pt-3">
                    <div className="mb-2 text-xs font-medium">Profile</div>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      {detail.user.role === "talent" ? (
                        <>
                          <div className="text-muted-foreground">Username</div>
                          <div>{detail.profile.username || "—"}</div>
                          <div className="text-muted-foreground">Professions</div>
                          <div>{detail.profile.professions?.join(", ") || "—"}</div>
                          <div className="text-muted-foreground">Specialties</div>
                          <div>{detail.profile.specialties?.join(", ") || "—"}</div>
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
                          <div>{detail.profile.company_name || detail.profile.business_name || detail.profile.display_name || "—"}</div>
                          {detail.user.role === "recruiter" ? (
                            <>
                              <div className="text-muted-foreground">Contact</div>
                              <div>{detail.profile.contact_name || "—"}</div>
                              <div className="text-muted-foreground">Headline</div>
                              <div>{detail.profile.headline || "—"}</div>
                              <div className="text-muted-foreground">About</div>
                              <div className="whitespace-pre-wrap">{detail.profile.about || "—"}</div>
                              <div className="text-muted-foreground">Industry</div>
                              <div>{detail.profile.industries?.join(", ") || detail.profile.industry || "—"}</div>
                              <div className="text-muted-foreground">Company Size</div>
                              <div>{detail.profile.company_size || "—"}</div>
                              <div className="text-muted-foreground">Founded / Experience</div>
                              <div>{detail.profile.founded_year || detail.profile.years_in_business || "—"}</div>
                              <div className="text-muted-foreground">Location</div>
                              <div>{detail.profile.location ? `${detail.profile.location.city || ""}, ${detail.profile.location.country || ""}` : "—"}</div>
                              <div className="text-muted-foreground">Languages</div>
                              <div>{detail.profile.languages?.join(", ") || "—"}</div>
                              <div className="text-muted-foreground">Casting Categories</div>
                              <div>{detail.profile.casting_categories?.join(", ") || "—"}</div>
                            </>
                          ) : (
                            <>
                              <div className="text-muted-foreground">Provider Type</div>
                              <div>{detail.profile.provider_type || "—"}</div>
                              <div className="text-muted-foreground">Tagline</div>
                              <div>{detail.profile.tagline || "—"}</div>
                              <div className="text-muted-foreground">About</div>
                              <div className="whitespace-pre-wrap">{detail.profile.about || "—"}</div>
                              <div className="text-muted-foreground">Categories</div>
                              <div>{detail.profile.categories?.join(", ") || "—"}</div>
                              <div className="text-muted-foreground">Service Areas</div>
                              <div>{detail.profile.service_areas?.join(", ") || "—"}</div>
                              <div className="text-muted-foreground">Skills</div>
                              <div>{detail.profile.skills?.join(", ") || "—"}</div>
                              <div className="text-muted-foreground">Accepting Inquiries</div>
                              <div>{detail.profile.accepting_inquiries == null ? "—" : detail.profile.accepting_inquiries ? "Yes" : "No"}</div>
                              <div className="text-muted-foreground">Onboarding Complete</div>
                              <div>{detail.profile.onboarding_completed == null ? "—" : detail.profile.onboarding_completed ? "Yes" : "No"}</div>
                            </>
                          )}
                          <div className="text-muted-foreground">Website</div>
                          <div>{detail.profile.company_website || "—"}</div>
                          <div className="text-muted-foreground">Specialties</div>
                          <div>{detail.profile.specialties?.join(", ") || "—"}</div>
                          <div className="text-muted-foreground">Position</div>
                          <div>{detail.profile.position || "—"}</div>
                          <div className="text-muted-foreground">Verification Status</div>
                          <div className="capitalize">
                            {detail.profile.verification_status || "—"}
                          </div>
                        </>
                      )}
                    </div>
                    {detail.user.role === "talent" && detail.profile.username && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="mt-3 h-8 text-xs"
                        onClick={() => router.push(`/talent/${detail.profile!.username}`)}
                      >
                        <ExternalLink className="mr-1 h-3.5 w-3.5" />
                        View Public Profile
                      </Button>
                    )}
                    {detail.user.role === "recruiter" && detail.profile.slug && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="mt-3 h-8 text-xs"
                        onClick={() => router.push(`/recruiter/${detail.profile!.slug}`)}
                      >
                        <ExternalLink className="mr-1 h-3.5 w-3.5" />
                        View Public Profile
                      </Button>
                    )}
                    {detail.user.role === "provider" && detail.profile.slug && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="mt-3 h-8 text-xs"
                        onClick={() => router.push(`/providers/${detail.profile!.slug}`)}
                      >
                        <ExternalLink className="mr-1 h-3.5 w-3.5" />
                        View Public Profile
                      </Button>
                    )}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="moderation" className="mt-3 space-y-3">
                <div className="space-y-3">
                  <div className="text-xs font-medium">Actions</div>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(ACTION_CONFIG).map(([key, config]) => (
                      <Button
                        key={key}
                        size="sm"
                        variant={activeAction === key ? "default" : config.variant}
                        className="h-8 text-xs"
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
                    <div className="space-y-3 rounded-md border border-border p-3">
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
                            onChange={(event) => setActionDuration(event.target.value)}
                            className="h-8 text-xs"
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
                                className="h-8 w-8 p-0 text-xs"
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
                          Reason {activeAction !== "mark_safe" && <span className="text-rose">*</span>}
                        </Label>
                        <Textarea
                          placeholder="Enter reason for this action..."
                          value={actionReason}
                          onChange={(event) => setActionReason(event.target.value)}
                          className="min-h-[60px] text-xs"
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          className="h-8 text-xs"
                          onClick={() => handleModerationAction(activeAction)}
                          disabled={
                            actionLoading === activeAction ||
                            (activeAction !== "mark_safe" && !actionReason.trim())
                          }
                        >
                          {actionLoading === activeAction ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <>
                              <UserCheck className="mr-1 h-3.5 w-3.5" />
                              Confirm
                            </>
                          )}
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 text-xs"
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
                      <div key={report._id} className="rounded-md border border-border p-2 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="font-medium">{report.reason}</span>
                          <Badge variant="outline" className="text-[10px]">
                            {report.status}
                          </Badge>
                        </div>
                        <div className="mt-1 text-muted-foreground">
                          Reporter: {report.reporter_id?.email || "Unknown"} ·{" "}
                          {new Date(report.created_at).toLocaleDateString()}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-xs text-muted-foreground">No reports.</div>
                )}

                <div className="mt-4 text-xs font-medium">Moderation Actions</div>
                {moderationLoading ? (
                  <div className="flex justify-center py-4">
                    <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                  </div>
                ) : moderationData && moderationData.actions.length > 0 ? (
                  <div className="space-y-2">
                    {moderationData.actions.map((action) => (
                      <div key={action._id} className="rounded-md border border-border p-2 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="font-medium capitalize">{action.action_type}</span>
                          <span className="text-muted-foreground">
                            {new Date(action.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="mt-1 text-muted-foreground">{action.reason}</div>
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
                          className="h-8 px-2 text-xs"
                          onClick={() => setModerationPage((page) => Math.max(1, page - 1))}
                          disabled={moderationPage <= 1}
                        >
                          <ChevronLeft className="mr-1 h-3.5 w-3.5" />
                          Prev
                        </Button>
                        <span className="text-xs text-muted-foreground">
                          Page {moderationData.page} of {moderationData.total_pages}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 px-2 text-xs"
                          onClick={() =>
                            setModerationPage((page) =>
                              Math.min(moderationData.total_pages, page + 1)
                            )
                          }
                          disabled={moderationPage >= moderationData.total_pages}
                        >
                          Next
                          <ChevronRight className="ml-1 h-3.5 w-3.5" />
                        </Button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-xs text-muted-foreground">No moderation actions.</div>
                )}
              </TabsContent>

              <TabsContent value="activity" className="mt-3 space-y-3">
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                  <div className="rounded-lg border border-border p-3">
                    <div className="text-xs text-muted-foreground">Reports</div>
                    <div className="mt-1 text-lg font-semibold tabular-nums">
                      {detail.report_count}
                    </div>
                  </div>
                  <div className="rounded-lg border border-border p-3">
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <MessageSquare className="h-3.5 w-3.5" /> Messages sent
                    </div>
                    <div className="mt-1 text-lg font-semibold tabular-nums">
                      {activity?.message_count ?? 0}
                    </div>
                  </div>
                  <div className="rounded-lg border border-border p-3">
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Clock3 className="h-3.5 w-3.5" /> Last active
                    </div>
                    <div className="mt-1 text-xs font-medium">
                      {formatDateTime(detail.user.last_active_at)}
                    </div>
                  </div>
                  {detail.user.role === "talent" && (
                    <div className="rounded-lg border border-border p-3">
                      <div className="text-xs text-muted-foreground">Profile views (30d)</div>
                      <div className="mt-1 text-lg font-semibold tabular-nums">
                        {detail.user.analytics?.profile_views_30d ?? "—"}
                      </div>
                    </div>
                  )}
                </div>
                <div className="rounded-md bg-muted/40 px-3 py-2 text-xs text-muted-foreground">
                  Session duration isn’t currently tracked, so total time spent in the app is unavailable.
                </div>

                {activity?.recent_campaigns && activity.recent_campaigns.length > 0 && (
                  <div>
                    <div className="mb-2 text-xs font-medium">Recent Campaigns</div>
                    <div className="space-y-2">
                      {activity.recent_campaigns.map((campaign) => (
                        <div
                          key={campaign._id}
                          className="rounded-md border border-border p-2 text-xs"
                        >
                          <div className="font-medium">{campaign.name}</div>
                          <div className="capitalize text-muted-foreground">
                            {campaign.status}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="notes" className="mt-3 space-y-3">
                <div className="space-y-2">
                  <Textarea
                    placeholder="Add a note..."
                    value={noteContent}
                    onChange={(event) => setNoteContent(event.target.value)}
                    className="min-h-[80px] text-xs"
                  />
                  <Button
                    size="sm"
                    className="h-8 text-xs"
                    onClick={handleAddNote}
                    disabled={addingNote || !noteContent.trim()}
                  >
                    {addingNote ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Add Note"}
                  </Button>
                </div>

                <div className="space-y-2">
                  {notes.length === 0 ? (
                    <div className="text-xs text-muted-foreground">No notes yet.</div>
                  ) : (
                    notes.map((note) => (
                      <div key={note._id} className="rounded-md border border-border p-2 text-xs">
                        <div className="flex items-center justify-between text-muted-foreground">
                          <span>{note.admin_id?.email || "Admin"}</span>
                          <span>{new Date(note.created_at).toLocaleDateString()}</span>
                        </div>
                        <div className="mt-1">{note.content}</div>
                      </div>
                    ))
                  )}
                </div>
              </TabsContent>

              <TabsContent value="subscription" className="mt-3 space-y-3">
                    <div className="mt-3 border-t border-border pt-3">
                      <div className="mb-2 text-xs font-medium">Invoices</div>
                      {invoicesLoading ? (
                        <div className="flex justify-center py-4">
                          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                        </div>
                      ) : invoices && invoices.data.length > 0 ? (
                        <div className="space-y-2">
                          {invoices.data.map((invoice) => (
                            <div
                              key={invoice._id}
                              className="rounded-md border border-border p-2 text-xs"
                            >
                              <div className="flex items-center justify-between">
                                <span className="font-medium">{invoice.razorpay_invoice_id}</span>
                                <Badge variant="outline" className="text-[10px] capitalize">
                                  {invoice.status}
                                </Badge>
                              </div>
                              <div className="mt-1 text-muted-foreground">
                                {(invoice.amount_paid ?? invoice.amount) / 100} {invoice.currency} ·{" "}
                                {invoice.period_start
                                  ? new Date(invoice.period_start).toLocaleDateString()
                                  : "—"}
                                {invoice.period_end
                                  ? ` – ${new Date(invoice.period_end).toLocaleDateString()}`
                                  : ""}
                              </div>
                              {(invoice.invoice_number || invoice.razorpay_payment_id || invoice.pdf_url) && (
                                <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-muted-foreground">
                                  {invoice.invoice_number && <span>Invoice {invoice.invoice_number}</span>}
                                  {invoice.razorpay_payment_id && <span>Payment {invoice.razorpay_payment_id}</span>}
                                  {invoice.pdf_url && <a className="text-primary underline" href={invoice.pdf_url} target="_blank" rel="noreferrer">View invoice</a>}
                                </div>
                              )}
                              {invoice.paid_at && (
                                <div className="mt-1 text-muted-foreground">
                                  Collected {new Date(invoice.paid_at).toLocaleString()}
                                </div>
                              )}
                            </div>
                          ))}
                          {invoices.total_pages > 1 && (
                            <div className="flex items-center justify-between pt-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 px-2 text-xs"
                                onClick={() => setInvoicePage((page) => Math.max(1, page - 1))}
                                disabled={invoicePage <= 1}
                              >
                                <ChevronLeft className="mr-1 h-3.5 w-3.5" />
                                Prev
                              </Button>
                              <span className="text-xs text-muted-foreground">
                                Page {invoices.page} of {invoices.total_pages}
                              </span>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 px-2 text-xs"
                                onClick={() =>
                                  setInvoicePage((page) =>
                                    Math.min(invoices.total_pages, page + 1)
                                  )
                                }
                                disabled={invoicePage >= invoices.total_pages}
                              >
                                Next
                                <ChevronRight className="ml-1 h-3.5 w-3.5" />
                              </Button>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="text-xs text-muted-foreground">No invoices found.</div>
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
