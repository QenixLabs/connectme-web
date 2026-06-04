"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Clock, ShieldAlert, Send, CheckCircle, Loader2, MessageSquareWarning } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { appealsApi, authApi, type Appeal } from "@/lib/api";
import { getApiErrorMessage } from "@/lib/formatters";

function useCountdown(targetDate: string | null) {
  const [timeLeft, setTimeLeft] = useState({
    days: 0, hours: 0, minutes: 0, seconds: 0, expired: false,
  });

  useEffect(() => {
    if (!targetDate) return;
    const target = new Date(targetDate).getTime();
    const tick = () => {
      const now = Date.now();
      const diff = target - now;
      if (diff <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, expired: true });
        return;
      }
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      setTimeLeft({ days, hours, minutes, seconds, expired: false });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [targetDate]);

  return timeLeft;
}

function SuspendedContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const until = searchParams.get("until");
  const reason = searchParams.get("reason");

  const timeLeft = useCountdown(until);
  const [appealText, setAppealText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [appeals, setAppeals] = useState<Appeal[]>([]);
  const [loadingAppeal, setLoadingAppeal] = useState(true);

  const openAppeal = appeals.find((a) => a.status === "open");
  const latestAppeal = appeals[0] || null;

  useEffect(() => {
    authApi.getCurrentUser()
      .then(({ user }) => {
        if (user.status !== "suspended") {
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
    if (!appealText.trim()) return;
    setSubmitting(true);
    setError(null);
    try {
      await appealsApi.create(appealText.trim(), "suspension");
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

  const formattedUntil = until ? new Date(until).toLocaleString() : "Unknown";

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <div className="w-full max-w-md space-y-4">
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-amber-600" />
              <CardTitle className="text-base">Account Suspended</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
              <div className="text-xs text-amber-800 font-medium mb-1">Reason</div>
              <div className="text-sm text-amber-900">{reason || "Violation of platform policies"}</div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Clock className="w-3.5 h-3.5" />
                Suspension ends: {formattedUntil}
              </div>

              {!timeLeft.expired ? (
                <div className="grid grid-cols-4 gap-2 text-center">
                  {[
                    { value: timeLeft.days, label: "Days" },
                    { value: timeLeft.hours, label: "Hours" },
                    { value: timeLeft.minutes, label: "Mins" },
                    { value: timeLeft.seconds, label: "Secs" },
                  ].map((unit) => (
                    <div key={unit.label} className="bg-slate-100 rounded-md p-2">
                      <div className="text-lg font-bold text-slate-800">{String(unit.value).padStart(2, "0")}</div>
                      <div className="text-[10px] text-muted-foreground uppercase">{unit.label}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-md p-3 text-center">
                  Your suspension has expired. You may now <Link href="/auth/login" className="font-medium underline">log in</Link>.
                </div>
              )}
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
                          {latestAppeal.status === "resolved" ? <CheckCircle className="w-4 h-4" /> : <ShieldAlert className="w-4 h-4" />}
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
                          placeholder="Explain why you believe this suspension is incorrect..."
                          value={appealText}
                          onChange={(e) => setAppealText(e.target.value)}
                          className="text-xs min-h-[100px]"
                        />
                        <Button
                          className="w-full text-xs h-9"
                          onClick={handleSubmit}
                          disabled={submitting || !appealText.trim()}
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

export default function SuspendedPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>}>
      <SuspendedContent />
    </Suspense>
  );
}
