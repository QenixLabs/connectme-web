// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ContactProviderButton } from "@/components/marketplace/contact-provider-button";
import { AuthStoreProvider } from "@/providers/auth-store-provider";
import { authStore } from "@/stores/auth-store";

const { push, startByUsername, sendMessage } = vi.hoisted(() => ({
  push: vi.fn(),
  startByUsername: vi.fn(),
  sendMessage: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push }),
  usePathname: () => "/services/service-id",
}));

vi.mock("sonner", () => ({
  toast: { success: vi.fn(), message: vi.fn(), error: vi.fn() },
}));

vi.mock("@/lib/api", () => ({
  conversationsApi: {
    startByUsername,
    sendMessage,
  },
}));

vi.mock("@/lib/api/client", () => ({
  getApiErrorMessage: (_error: unknown, fallback: string) => fallback,
}));

function renderButton() {
  return render(
    <AuthStoreProvider>
      <ContactProviderButton
        providerSlug="jane-doe"
        providerName="Jane Doe"
        serviceTitle="Logo design"
      />
    </AuthStoreProvider>,
  );
}

describe("ContactProviderButton", () => {
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
    startByUsername.mockResolvedValue({ conversation_id: "conversation-1" });
    sendMessage.mockResolvedValue({});
  });

  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it("includes the service title when starting a conversation without extra details", async () => {
    renderButton();
    fireEvent.click(screen.getByRole("button", { name: "Contact provider" }));
    fireEvent.click(await screen.findByRole("button", { name: "Send message" }));

    await waitFor(() => expect(sendMessage).toHaveBeenCalledTimes(1));
    expect(startByUsername).toHaveBeenCalledWith("jane-doe");
    expect(sendMessage).toHaveBeenCalledWith(
      expect.objectContaining({
        conversation_id: "conversation-1",
        content: 'I\'m contacting you about the service "Logo design".',
      }),
    );
    expect(push).toHaveBeenCalledWith("/talent/messages/conversation-1");
  });
});
