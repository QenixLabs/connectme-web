"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { RazorpayCheckoutButton } from "@/components/payments/razorpay-checkout-button";

export default function PaymentPage() {
  const [rupees, setRupees] = useState("100");
  const amount = Math.round(Number(rupees) * 100);

  return (
    <main className="grid min-h-screen place-items-center bg-background px-5 text-foreground">
      <Card className="w-full max-w-md space-y-5 p-6">
        <div>
          <h1 className="text-2xl font-bold">Make a payment</h1>
          <p className="mt-1 text-sm text-muted-foreground">Pay securely with Razorpay Standard Checkout.</p>
        </div>
        <label className="block text-sm font-medium">
          Amount (INR)
          <input
            className="mt-2 w-full rounded-md border bg-background px-3 py-2"
            type="number"
            min="1"
            step="0.01"
            value={rupees}
            onChange={(event) => setRupees(event.target.value)}
          />
        </label>
        <RazorpayCheckoutButton amount={amount} receipt={`payment_${Date.now()}`} />
      </Card>
    </main>
  );
}
