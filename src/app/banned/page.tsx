"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ShieldBan, Send, CheckCircle, Loader2, MessageSquareWarning, ShieldX } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { appealsApi, authApi, type Appeal } from "@/lib/api";
import { getApiErrorMessage } from "@/lib/formatters";

function BannedContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const bannedAt = searchParams.get("banned_at");
  const reason = searchParams.get("reason");
  const moderationActionId = searchParams.get("moderation_action_id");

  const [appealText, setAppealText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [appeals, setAppeals] = useState<Appeal[]>([]);
  const [loadingAppeal, setLoadingAppeal] = useState(true);

  const currentAppeals = moderationActionId
    ? appeals.filter((a) => a.moderation_action_id === moderationActionId)
    : appeals;
  const openAppeal = currentAppeals.find((a) => a.status === "open");
  const latestAppeal = currentAppeals[0] || null;

  useEffect(() => {
    authApi.checkAuth()
      .then(({ user }) => {
        if (user.status !== "banned") {
          router.replace(`/${user.role}/dashboard`);
        }
      })
      .catch(() => {});
  }, [router]);

  useEffect(() => {
    appealsApi.getMyAppeals()
      .then((data) => {
        setAppeals(data.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()));
      })
      .catch(() => {})
      .finally(() => setLoadingAppeal(false));
  }, []);

  const refreshAppeals = async () => {
    const data = await appealsApi.getMyAppeals();
    setAppeals(data.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()));
  };

  const handleSubmit = async () => {
    if (!appealText.trim() || !moderationActionId) return;
    setSubmitting(true);
    setError(null);
    try {
      await appealsApi.create(appealText.trim(), moderationActionId, "ban");
      setSubmitted(true);
      setAppealText("");
      await refreshAppeals();
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      const msg = e.response?.data?.message;
      if (msg?.includes("already have an open appeal")) {
        await refreshAppeals();
      } else {
        setError(getApiErrorMessage(err, "Failed to submit appeal"));
      }
    } finally {
      setSubmitting(false);
    }
  };

  const formattedBannedAt = bannedAt ? new Date(bannedAt).toLocaleString() : "Unknown";

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <div className="w-full max-w-md space-y-4">
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <ShieldBan className="w-5 h-5 text-rose-600" />
              <CardTitle className="text-base">Account Banned</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-rose-50 border border-rose-200 rounded-lg p-3">
              <div className="text-xs text-rose-800 font-medium mb-1">Reason</div>
              <div className="text-sm text-rose-900">{reason || "Violation of platform policies"}</div>
            </div>

            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span>Banned on: {formattedBannedAt}</span>
            </div>

            <div className="text-xs text-muted-foreground leading-relaxed">
              Your account has been permanently banned. If you believe this was a
              mistake, you can submit an appeal below. Our team will review it.
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Submit an Appeal</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {loadingAppeal ? (
              <div className="flex justify-center py-4">
                <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <>
                {openAppeal && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-md p-3">
                      <MessageSquareWarning className="w-4 h-4" />
                      You already have an open appeal.
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Submitted: {new Date(openAppeal.created_at).toLocaleString()}
                    </div>
                    <div className="text-xs bg-muted rounded-md p-2">{openAppeal.reason}</div>
                    <div className="text-xs text-muted-foreground">
                      Status: <span className="font-medium capitalize">{openAppeal.status}</span>
                    </div>
                  </div>
                )}

                {!openAppeal && (
                  <>
                    {latestAppeal && (
                      <div className="space-y-2 mb-4">
                        <div className={`flex items-center gap-2 text-sm rounded-md p-3 border ${latestAppeal.status === "resolved" ? "text-emerald-700 bg-emerald-50 border-emerald-200" : "text-rose-700 bg-rose-50 border-rose-200"}`}>
                          {latestAppeal.status === "resolved" ? <CheckCircle className="w-4 h-4" /> : <ShieldX className="w-4 h-4" />}
                          Appeal {latestAppeal.status}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Submitted: {new Date(latestAppeal.created_at).toLocaleString()}
                        </div>
                        <div className="text-xs bg-muted rounded-md p-2">{latestAppeal.reason}</div>
                        {latestAppeal.admin_response && (
                          <div className="space-y-1">
                            <div className="text-xs font-medium text-muted-foreground">Admin Response</div>
                            <div className="text-xs bg-slate-100 rounded-md p-2">{latestAppeal.admin_response}</div>
                          </div>
                        )}
                        {latestAppeal.reviewed_at && (
                          <div className="text-xs text-muted-foreground">
                            Reviewed: {new Date(latestAppeal.reviewed_at).toLocaleString()}
                          </div>
                        )}
                      </div>
                    )}

                    {!submitted ? (
                      <>
                        {error && (
                          <Alert variant="destructive">
                            <AlertDescription>{error}</AlertDescription>
                          </Alert>
                        )}
                        <Textarea
                          placeholder="Explain why you believe this ban is incorrect..."
                          value={appealText}
                          onChange={(e) => setAppealText(e.target.value)}
                          className="text-xs min-h-[100px]"
                        />
                        <Button
                          className="w-full text-xs h-9"
                          onClick={handleSubmit}
                          disabled={submitting || !appealText.trim() || !moderationActionId}
                        >
                          {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Send className="w-3.5 h-3.5 mr-1.5" /> Submit Appeal</>}
                        </Button>
                      </>
                    ) : (
                      <div className="flex items-center gap-2 text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-md p-3">
                        <CheckCircle className="w-4 h-4" />
                        Appeal submitted. Our team will review it shortly.
                      </div>
                    )}
                  </>
                )}
              </>
            )}
          </CardContent>
        </Card>

        <div className="text-center">
          <Link href="/auth/login" className="text-xs text-muted-foreground hover:text-foreground underline underline-offset-2">Back to login</Link>
        </div>
      </div>
    </div>
  );
}

export default function BannedPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>}>
      <BannedContent />
    </Suspense>
  );
}
