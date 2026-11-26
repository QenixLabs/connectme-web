"use client";

import Script from "next/script";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { apiClient, getApiErrorMessage } from "@/lib/api/client";

interface RazorpayCheckoutButtonProps {
  amount: number;
  receipt?: string;
  description?: string;
  onVerified?: () => void;
}

export function RazorpayCheckoutButton({
  amount,
  receipt,
  description = "Secure payment",
  onVerified,
}: RazorpayCheckoutButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const keyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;

  async function startCheckout() {
    if (!keyId) {
      toast.error("Razorpay is not configured. Add NEXT_PUBLIC_RAZORPAY_KEY_ID.");
      return;
    }
    if (amount < 100) {
      toast.error("The minimum payment is â‚¹1.");
      return;
    }
    if (!window.Razorpay) {
      toast.error("Payment checkout is still loading. Please try again.");
      return;
    }

    setIsLoading(true);
    try {
      const { data: order } = await apiClient.post<{
        order_id: string;
        amount: number;
        currency: string;
      }>("/create-order", { amount, currency: "INR", receipt });

      const checkout = new window.Razorpay({
        key: keyId,
        amount: order.amount,
        currency: order.currency,
        name: "Morporfiil",
        description,
        order_id: order.order_id,
        handler: async (response) => {
          try {
            await apiClient.post("/verify-payment", response);
            toast.success("Payment verified successfully.");
            onVerified?.();
          } catch (error) {
            toast.error(getApiErrorMessage(error, "Payment verification failed."));
          } finally {
            setIsLoading(false);
          }
        },
        modal: {
          ondismiss: () => {
            setIsLoading(false);
            toast.info("Payment cancelled.");
          },
        },
      });
      checkout.on("payment.failed", (response) => {
        setIsLoading(false);
        toast.error(response.error?.description || "Payment failed. Please try again.");
      });
      checkout.open();
    } catch (error) {
      setIsLoading(false);
      toast.error(getApiErrorMessage(error, "Could not start payment."));
    }
  }

  return (
    <>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="afterInteractive" />
      <Button type="button" onClick={() => void startCheckout()} disabled={isLoading}>
        {isLoading ? <Loader2 className="size-4 animate-spin" /> : null}
        {isLoading ? "Processingâ€¦" : "Pay with Razorpay"}
      </Button>
    </>
  );
}
