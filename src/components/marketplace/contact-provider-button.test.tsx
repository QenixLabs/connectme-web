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
        serviceId="service-1"
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
        is_phone_verified: true,
        verification_tier: 3,
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

    const textarea = (await screen.findByRole("textbox")) as HTMLTextAreaElement;
    expect(textarea.value).toBe(
      'I\'m contacting you about the service "Logo design".',
    );

    fireEvent.click(screen.getByRole("button", { name: "Send message" }));

    await waitFor(() => expect(sendMessage).toHaveBeenCalledTimes(1));
    expect(startByUsername).toHaveBeenCalledWith("jane-doe", "service-1");
    expect(sendMessage).toHaveBeenCalledWith(
      expect.objectContaining({
        conversation_id: "conversation-1",
        content: 'I\'m contacting you about the service "Logo design".',
        service_id: "service-1",
      }),
    );
    expect(push).toHaveBeenCalledWith(
      "/talent/messages/conversation-1?serviceId=service-1",
    );
  });

  it("sends the edited pre-filled message as-is", async () => {
    renderButton();
    fireEvent.click(screen.getByRole("button", { name: "Contact provider" }));

    const textarea = (await screen.findByRole("textbox")) as HTMLTextAreaElement;
    fireEvent.change(textarea, {
      target: {
        value:
          'I\'m contacting you about the service "Logo design".\n\nMy budget is 5000 INR.',
      },
    });
    fireEvent.click(screen.getByRole("button", { name: "Send message" }));

    await waitFor(() => expect(sendMessage).toHaveBeenCalledTimes(1));
    expect(sendMessage).toHaveBeenCalledWith(
      expect.objectContaining({
        content:
          'I\'m contacting you about the service "Logo design".\n\nMy budget is 5000 INR.',
      }),
    );
  });

  it("redirects to document verification before opening a conversation", () => {
    authStore.setState({
      user: {
        ...authStore.getState().user!,
        is_phone_verified: true,
        verification_tier: 2,
      },
      isAuthenticated: true,
    });

    renderButton();
    fireEvent.click(screen.getByRole("button", { name: "Contact provider" }));

    expect(push).toHaveBeenCalledWith("/talent/verify-documents");
    expect(startByUsername).not.toHaveBeenCalled();
  });

  it("supports multiple contact buttons on the same page", () => {
    render(
      <AuthStoreProvider>
        <ContactProviderButton
          providerSlug="jane-doe"
          providerName="Jane Doe"
          serviceId="service-1"
          serviceTitle="Logo design"
        />
        <ContactProviderButton
          providerSlug="jane-doe"
          providerName="Jane Doe"
          serviceId="service-1"
          serviceTitle="Logo design"
        />
      </AuthStoreProvider>,
    );

    expect(screen.getAllByRole("button", { name: "Contact provider" })).toHaveLength(2);
  });
});
