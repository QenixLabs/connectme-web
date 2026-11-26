import type { UpgradeResponse } from "@/lib/api/subscriptions";

const SCRIPT_URL = "https://checkout.razorpay.com/v1/checkout.js";
let scriptPromise: Promise<void> | null = null;

export async function loadRazorpayCheckout(): Promise<void> {
  if (typeof window !== "undefined" && window.Razorpay) return;
  if (scriptPromise) return scriptPromise;
  if (typeof window === "undefined") {
    throw new Error("Razorpay Checkout is only available in a browser.");
  }

  scriptPromise = new Promise<void>((resolve, reject) => {
    const script = document.createElement("script");
    script.src = SCRIPT_URL;
    script.async = true;
    script.onload = () => {
      if (window.Razorpay) resolve();
      else reject(new Error("Razorpay Checkout did not initialize."));
    };
    script.onerror = () => reject(new Error("Razorpay Checkout failed to load."));
    document.head.appendChild(script);
  }).catch((error: unknown) => {
    scriptPromise = null;
    throw error;
  });

  return scriptPromise;
}

export function openRazorpaySubscriptionCheckout(
  checkout: NonNullable<UpgradeResponse["checkout"]>,
  callbacks: {
    onPayment: (response: RazorpayPaymentResponse) => void | Promise<void>;
    onDismiss: () => void;
    onFailure: (message: string) => void;
  },
): void {
  if (!window.Razorpay) {
    throw new Error("Razorpay Checkout is not ready.");
  }

  const instance = new window.Razorpay({
    key: checkout.key_id,
    subscription_id: checkout.subscription_id,
    name: "Morporfiil",
    description: `${checkout.plan_name} subscription`,
    handler: callbacks.onPayment,
    modal: { ondismiss: callbacks.onDismiss },
  });
  instance.on("payment.failed", (response) => {
    callbacks.onFailure(response.error?.description || "Payment failed. Please try again.");
  });
  instance.open();
}
