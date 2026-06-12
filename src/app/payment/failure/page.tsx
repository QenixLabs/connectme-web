"use client";

import { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
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
import { XCircle, RotateCcw, Loader2 } from "lucide-react";

function PaymentFailureContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuthStore();

  const reason = searchParams.get("reason") || "Your payment could not be processed.";

  const redirectToBilling = () => {
    if (user?.role === "talent") {
      router.push("/talent/billing");
    } else if (user?.role === "recruiter") {
      router.push("/recruiter/billing");
    } else {
      router.push("/");
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
          <div className="mx-auto h-12 w-12 rounded-full bg-red-100 flex items-center justify-center mb-4">
            <XCircle className="h-6 w-6 text-red-600" />
          </div>
          <CardTitle className="text-xl">Payment Failed</CardTitle>
          <CardDescription>{reason}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg bg-muted p-3">
            <p className="text-xs text-muted-foreground uppercase tracking-wider">
              Common reasons
            </p>
            <ul className="text-sm mt-1 space-y-1 list-disc list-inside text-muted-foreground">
              <li>Insufficient funds</li>
              <li>Bank declined the transaction</li>
              <li>Card expired or invalid</li>
              <li>Network timeout</li>
            </ul>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-3">
          <Button className="w-full" onClick={redirectToBilling}>
            <RotateCcw className="h-4 w-4 mr-2" />
            Try Again
          </Button>
          <Button className="w-full" variant="outline" onClick={redirectToDashboard}>
            Go to Dashboard
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

function PaymentFailureFallback() {
  return (
    <div className="min-h-screen bg-page flex items-center justify-center px-4">
      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
    </div>
  );
}

export default function PaymentFailurePage() {
  return (
    <Suspense fallback={<PaymentFailureFallback />}>
      <PaymentFailureContent />
    </Suspense>
  );
}
