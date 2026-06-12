"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuthStore } from "@/providers/auth-store-provider";
import { subscriptionsApi } from "@/lib/api";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Loader2, CheckCircle2 } from "lucide-react";

function PaymentSuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuthStore();
  const [checking, setChecking] = useState(true);
  const [confirmed, setConfirmed] = useState(false);

  const subscriptionId = searchParams.get("subscription_id");

  useEffect(() => {
    let mounted = true;

    const verify = async () => {
      try {
        const result = await subscriptionsApi.getMySubscription();
        if (mounted) {
          if (result.subscription?.status === "active" || result.subscription?.status === "trialing") {
            setConfirmed(true);
          }
        }
      } catch {
        // ignore
      } finally {
        if (mounted) setChecking(false);
      }
    };

    verify();

    const timer = setTimeout(() => {
      if (mounted) setChecking(false);
    }, 3000);

    return () => {
      mounted = false;
      clearTimeout(timer);
    };
  }, []);

  const redirectToDashboard = () => {
    if (user?.role === "talent") {
      router.push("/talent/dashboard");
    } else if (user?.role === "recruiter") {
      router.push("/recruiter/dashboard");
    } else {
      router.push("/");
    }
  };

  const redirectToBilling = () => {
    if (user?.role === "talent") {
      router.push("/talent/billing");
    } else if (user?.role === "recruiter") {
      router.push("/recruiter/billing");
    } else {
      router.push("/");
    }
  };

  return (
    <div className="min-h-screen bg-page flex items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto h-12 w-12 rounded-full bg-green-100 flex items-center justify-center mb-4">
            <CheckCircle2 className="h-6 w-6 text-green-600" />
          </div>
          <CardTitle className="text-xl">Payment Successful</CardTitle>
          <CardDescription>
            {checking
              ? "Confirming your subscription..."
              : confirmed
              ? "Your subscription is now active."
              : "Payment received. It may take a moment to activate."}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {checking && (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          )}
          {subscriptionId && (
            <div className="rounded-lg bg-muted p-3">
              <p className="text-xs text-muted-foreground uppercase tracking-wider">
                Subscription ID
              </p>
              <p className="text-sm font-mono mt-1 break-all">{subscriptionId}</p>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex flex-col gap-3">
          <Button className="w-full" onClick={redirectToDashboard} disabled={checking}>
            Go to Dashboard
          </Button>
          <Button className="w-full" variant="outline" onClick={redirectToBilling} disabled={checking}>
            View Billing
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

function PaymentSuccessFallback() {
  return (
    <div className="min-h-screen bg-page flex items-center justify-center px-4">
      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={<PaymentSuccessFallback />}>
      <PaymentSuccessContent />
    </Suspense>
  );
}
