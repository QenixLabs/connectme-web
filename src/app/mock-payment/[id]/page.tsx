"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { usePopup } from "@/hooks/use-popup";
import { Loader2, CreditCard, XCircle, CheckCircle2 } from "lucide-react";
import { subscriptionsApi } from "@/lib/api";
import { useAuthStore } from "@/providers/auth-store-provider";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function MockPaymentPage() {
  const router = useRouter();
  const params = useParams();
  const popup = usePopup();
  const subscriptionId = params.id as string;
  const { user } = useAuthStore();

  const [loading, setLoading] = useState(false);

  const handleComplete = async () => {
    setLoading(true);
    try {
      await subscriptionsApi.simulateWebhook({
        event: "subscription.activated",
        razorpaySubscriptionId: subscriptionId,
      });
      popup.show({ title: "Payment successful! Subscription activated.", variant: "success" });
      redirectToDashboard();
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || "Payment simulation failed";
      popup.show({ title: message, variant: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async () => {
    setLoading(true);
    try {
      await subscriptionsApi.simulateWebhook({
        event: "subscription.cancelled",
        razorpaySubscriptionId: subscriptionId,
      });
      popup.show({ title: "Payment cancelled.", variant: "info" });
      redirectToDashboard();
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || "Cancellation simulation failed";
      popup.show({ title: message, variant: "error" });
    } finally {
      setLoading(false);
    }
  };

  const redirectToDashboard = () => {
    if (user?.role === "talent") {
      router.push("/talent/dashboard");
    } else if (user?.role === "recruiter") {
      router.push("/recruiter/dashboard");
    } else {
      router.push("/");
    }
  };

  return (
    <div className="min-h-screen bg-page flex items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto h-12 w-12 rounded-full bg-amber-100 flex items-center justify-center mb-4">
            <CreditCard className="h-6 w-6 text-amber-600" />
          </div>
          <CardTitle className="text-xl">Mock Payment</CardTitle>
          <CardDescription>
            Complete or cancel this subscription for testing.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg bg-muted p-3">
            <p className="text-xs text-muted-foreground uppercase tracking-wider">
              Subscription ID
            </p>
            <p className="text-sm font-mono mt-1 break-all">{subscriptionId}</p>
          </div>
          <Badge variant="outline" className="w-full justify-center py-1.5">
            Razorpay Mock — Dev Only
          </Badge>
        </CardContent>
        <CardFooter className="flex flex-col gap-3">
          <Button
            className="w-full"
            onClick={handleComplete}
            disabled={loading}
          >
            {loading ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <CheckCircle2 className="h-4 w-4 mr-2" />
            )}
            Complete Payment
          </Button>
          <Button
            className="w-full"
            variant="outline"
            onClick={handleCancel}
            disabled={loading}
          >
            <XCircle className="h-4 w-4 mr-2" />
            Cancel
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
