// @vitest-environment jsdom

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ServiceInquiryForm } from "@/components/marketplace/service-inquiry-form";
import { serviceInquiriesApi } from "@/lib/api";
import { AuthStoreProvider } from "@/providers/auth-store-provider";
import { authStore } from "@/stores/auth-store";

const { push, toastSuccess } = vi.hoisted(() => ({
  push: vi.fn(),
  toastSuccess: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push }),
  usePathname: () => "/providers/jane-doe",
}));

vi.mock("sonner", () => ({
  toast: { success: toastSuccess, message: vi.fn(), error: vi.fn() },
}));

vi.mock("@/lib/api", () => ({
  serviceInquiriesApi: { create: vi.fn() },
}));

const createInquiry = vi.mocked(serviceInquiriesApi.create);

function renderForm() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: 0 } },
  });
  return render(
    <QueryClientProvider client={client}>
      <AuthStoreProvider>
        <ServiceInquiryForm providerSlug="jane-doe" providerName="Jane Doe" />
      </AuthStoreProvider>
    </QueryClientProvider>,
  );
}

function fillDescription(value = "Need a brand refresh") {
  fireEvent.change(screen.getByLabelText("What service do you need?"), {
    target: { value },
  });
}

describe("ServiceInquiryForm", () => {
  beforeEach(() => {
    authStore.setState({
      user: {
        _id: "user-1",
        email: "requester@example.com",
        role: "talent",
        is_email_verified: true,
        is_phone_verified: false,
        verification_tier: 1,
        trust_score: 0,
        status: "active",
        created_at: "2026-01-01T00:00:00.000Z",
        updated_at: "2026-01-01T00:00:00.000Z",
      },
      isAuthenticated: true,
    });
    createInquiry.mockResolvedValue({
      inquiry: {
        id: "inquiry-1",
        requester_id: "user-1",
        provider_id: "provider-1",
        service_id: null,
        description: "Need a brand refresh",
        requested_date: null,
        location: null,
        budget: null,
        status: "new",
        conversation_id: "conversation-1",
        viewer_role: "requester",
        created_at: "2026-01-01T00:00:00.000Z",
        updated_at: "2026-01-01T00:00:00.000Z",
      },
    });
  });

  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it("blocks an invalid budget before calling the API", async () => {
    const { container } = renderForm();
    fillDescription();
    fireEvent.change(screen.getByLabelText("Indicative budget in INR (optional)"), {
      target: { value: "-5" },
    });
    // Submit directly so the assertion covers the component guard rather than
    // the browser's native `min` constraint validation.
    fireEvent.submit(container.querySelector("form")!);

    expect((await screen.findByRole("alert")).textContent).toBe(
      "Enter a valid budget amount.",
    );
    expect(createInquiry).not.toHaveBeenCalled();
  });

  it("submits the inquiry and navigates to its detail page", async () => {
    renderForm();
    fillDescription();
    fireEvent.change(screen.getByLabelText("Indicative budget in INR (optional)"), {
      target: { value: "25000" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Send inquiry" }));

    await waitFor(() => expect(createInquiry).toHaveBeenCalledTimes(1));
    expect(createInquiry).toHaveBeenCalledWith(
      expect.objectContaining({
        provider_slug: "jane-doe",
        description: "Need a brand refresh",
        budget: { amount: 25000, currency: "INR" },
        idempotency_key: expect.any(String),
      }),
    );
    expect(push).toHaveBeenCalledWith("/inquiries/inquiry-1");
    expect(toastSuccess).toHaveBeenCalledWith("Inquiry sent");
  });

  it("reuses the idempotency key after a failed retry and rotates it after edits", async () => {
    createInquiry.mockRejectedValueOnce(new Error("network"));
    renderForm();
    fillDescription();
    fireEvent.click(screen.getByRole("button", { name: "Send inquiry" }));

    await waitFor(() => expect(createInquiry).toHaveBeenCalledTimes(1));
    const firstKey = createInquiry.mock.calls[0][0].idempotency_key;

    fireEvent.click(screen.getByRole("button", { name: "Send inquiry" }));
    await waitFor(() => expect(createInquiry).toHaveBeenCalledTimes(2));
    expect(createInquiry.mock.calls[1][0].idempotency_key).toBe(firstKey);

    fillDescription("Need a different scope");
    fireEvent.click(screen.getByRole("button", { name: "Send inquiry" }));
    await waitFor(() => expect(createInquiry).toHaveBeenCalledTimes(3));
    expect(createInquiry.mock.calls[2][0].idempotency_key).not.toBe(firstKey);
  });

  it("redirects unauthenticated visitors to login with a return path", async () => {
    authStore.setState({ user: null, isAuthenticated: false });
    renderForm();
    fillDescription();
    fireEvent.click(screen.getByRole("button", { name: "Send inquiry" }));

    expect(push).toHaveBeenCalledWith(
      `/auth/login?redirect=${encodeURIComponent("/providers/jane-doe")}`,
    );
    expect(createInquiry).not.toHaveBeenCalled();
  });
});
