// @vitest-environment jsdom
import type { ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { adminApi, type AdminUserSubscriptionDetail } from "@/lib/api/admin";
import { SubscriptionOverview } from "./subscription-overview";

vi.mock("@/components/ui/select", () => ({
  Select: ({ value, onValueChange, children }: { value: string; onValueChange: (value: string) => void; children: ReactNode }) =>
    <select aria-label="Override selection" value={value} onChange={(event) => onValueChange(event.target.value)}>{children}</select>,
  SelectTrigger: () => null,
  SelectValue: () => null,
  SelectContent: ({ children }: { children: ReactNode }) => <>{children}</>,
  SelectItem: ({ value, children }: { value: string; children: ReactNode }) => <option value={value}>{children}</option>,
}));

function overview(): AdminUserSubscriptionDetail {
  return {
    subscription: null, paid_subscription: null, plan: null,
    effective: { plan_key: "recruiter_free", plan_display_name: "Free", source: "free", status: "active", expires_at: null },
    active_override: null, history: [],
    usage: [{ key: "messages", label: "Messages this billing period", used: 12, limit: 50 }],
    available_plans: [{ key: "recruiter_pro", display_name: "Pro", monthly_price: 100 }],
    can_override: true, revision: "initial", as_of: new Date().toISOString(),
    expiry_policy: "After expiry, current eligible subscription or free access applies.",
    billing_consequences: "No charge or refund. Existing paid subscriptions continue billing.",
  };
}

function renderOverview(userId = "user-1") {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } });
  const onChange = vi.fn();
  return { client, onChange, ...render(<QueryClientProvider client={client}><SubscriptionOverview userId={userId} onChange={onChange} /></QueryClientProvider>) };
}

async function reviewRevocation() {
  fireEvent.click(await screen.findByRole("button", { name: "Manage access override" }));
  fireEvent.change(screen.getAllByRole("combobox")[0], { target: { value: "revoke" } });
  fireEvent.change(screen.getByLabelText(/Effective until/), { target: { value: "2099-12-01T12:00" } });
  fireEvent.change(screen.getByLabelText(/Reason/), { target: { value: "Support case 123" } });
  fireEvent.click(screen.getByRole("button", { name: "Review override" }));
}

describe("Admin subscription overview", () => {
  beforeEach(() => {
    vi.spyOn(adminApi, "getUserSubscription").mockResolvedValue(overview());
    vi.spyOn(adminApi, "updateUserSubscription").mockResolvedValue(overview());
  });
  afterEach(() => { cleanup(); vi.restoreAllMocks(); });

  it("shows free access and usage even without an underlying subscription", async () => {
    renderOverview();
    expect(await screen.findByText("Free access")).toBeTruthy();
    expect(screen.getByText("No underlying subscription. Free access is the fallback.")).toBeTruthy();
    expect(screen.getByText("12 / 50")).toBeTruthy();
    expect(screen.getByText("Override history (0)")).toBeTruthy();
  });

  it("distinguishes paid billing from active admin access and shows cancellation", async () => {
    const data = overview();
    data.subscription = {
      _id: "sub-1", user_id: "user-1", plan_key: "recruiter_pro", plan_display_name: "Pro",
      status: "active", access_status: "active", billing_cycle: "yearly", billing_cycle_inferred: false,
      current_period_end: "2099-11-01T00:00:00Z", cancel_at_period_end: true, razorpay_subscription_id: "sub_paid",
    };
    data.effective = { ...data.effective, plan_key: "recruiter_business", plan_display_name: "Business", source: "admin_granted" };
    data.active_override = { _id: "override-1", action: "upgrade", plan_key: "recruiter_business", reason: "Support grant",
      starts_at: "2026-01-01T00:00:00Z", ends_at: "2099-12-01T00:00:00Z", superseded_at: null,
      created_at: "2026-01-01T00:00:00Z", admin_id: "admin-1", before: {}, billing_consequences: data.billing_consequences };
    vi.mocked(adminApi.getUserSubscription).mockResolvedValue(data);
    renderOverview();
    expect(await screen.findByText("Admin-granted access")).toBeTruthy();
    expect(screen.getByText("Business")).toBeTruthy();
    expect(screen.getByText("Underlying subscription")).toBeTruthy();
    expect(screen.getByText("Pro")).toBeTruthy();
    expect(screen.getByText("yearly")).toBeTruthy();
    expect(screen.getByText(/Scheduled for/)).toBeTruthy();
    expect(screen.getByText("Support grant")).toBeTruthy();
  });

  it("requires review and explicit billing acknowledgement before saving", async () => {
    const { onChange } = renderOverview();
    await reviewRevocation();
    expect(screen.getByText(overview().billing_consequences)).toBeTruthy();
    expect((screen.getByRole("button", { name: "Apply override" }) as HTMLButtonElement).disabled).toBe(true);
    expect(adminApi.updateUserSubscription).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole("checkbox"));
    fireEvent.click(screen.getByRole("button", { name: "Apply override" }));
    await waitFor(() => expect(adminApi.updateUserSubscription).toHaveBeenCalledWith("user-1", expect.objectContaining({
      action: "revoke", reason: "Support case 123", expected_revision: "initial", billing_acknowledged: true,
    })));
    await waitFor(() => expect(onChange).toHaveBeenCalledOnce());
  });

  it("blocks confirmation when refresh detects a newer subscription record", async () => {
    const { client } = renderOverview();
    await reviewRevocation();
    fireEvent.click(screen.getByRole("checkbox"));
    act(() => { client.setQueryData(["admin-user-subscription", "user-1"], { ...overview(), revision: "newer" }); });
    expect(await screen.findByText(/Subscription changed/)).toBeTruthy();
    expect((screen.getByRole("button", { name: "Apply override" }) as HTMLButtonElement).disabled).toBe(true);
    expect(adminApi.updateUserSubscription).not.toHaveBeenCalled();
  });

  it("shows load failures with retry instead of incorrectly labeling access free", async () => {
    vi.mocked(adminApi.getUserSubscription).mockRejectedValue(new Error("Network unavailable"));
    renderOverview();
    expect(await screen.findByRole("alert")).toBeTruthy();
    expect(screen.queryByText("Free access")).toBeNull();
    vi.mocked(adminApi.getUserSubscription).mockResolvedValue(overview());
    fireEvent.click(screen.getByRole("button", { name: "Refresh subscription" }));
    expect(await screen.findByText("Free access")).toBeTruthy();
  });
});
