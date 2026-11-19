// @vitest-environment jsdom

import { afterEach, describe, expect, it, vi } from "vitest";
import {
  loadRazorpayCheckout,
  openRazorpaySubscriptionCheckout,
} from "./razorpay-checkout";

describe("Razorpay Standard Checkout", () => {
  afterEach(() => {
    document.head.replaceChildren();
    delete window.Razorpay;
  });

  it("reports script load failures and opens a subscription checkout on retry", async () => {
    const failedLoad = loadRazorpayCheckout();
    const failedScript = document.querySelector("script");
    expect(failedScript?.src).toBe("https://checkout.razorpay.com/v1/checkout.js");
    failedScript?.dispatchEvent(new Event("error"));
    await expect(failedLoad).rejects.toThrow("Razorpay Checkout failed to load.");

    const open = vi.fn();
    const on = vi.fn();
    const checkoutOptions: Array<{
      subscription_id?: string;
      order_id?: string;
    }> = [];
    const constructor = vi.fn(function (options: {
      subscription_id?: string;
      order_id?: string;
    }) {
      checkoutOptions.push(options);
      return { open, on };
    });
    Object.defineProperty(window, "Razorpay", {
      value: constructor,
      configurable: true,
    });

    const ready = loadRazorpayCheckout();
    const scripts = document.querySelectorAll("script");
    scripts[scripts.length - 1]?.dispatchEvent(new Event("load"));
    await ready;

    openRazorpaySubscriptionCheckout(
      {
        key_id: "rzp_test_public",
        subscription_id: "sub_test_123",
        plan_name: "Pro",
      },
      {
        onPayment: vi.fn(),
        onDismiss: vi.fn(),
        onFailure: vi.fn(),
      },
    );

    expect(checkoutOptions[0].subscription_id).toBe("sub_test_123");
    expect(checkoutOptions[0].order_id).toBeUndefined();
    expect(open).toHaveBeenCalledOnce();
    expect(on).toHaveBeenCalledWith("payment.failed", expect.any(Function));
  });
});
