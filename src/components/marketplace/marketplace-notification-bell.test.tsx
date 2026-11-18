// @vitest-environment jsdom

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { MarketplaceNotificationBell } from "@/components/marketplace/marketplace-notification-bell";
import { notificationsApi } from "@/lib/api/notifications";

describe("MarketplaceNotificationBell", () => {
  it("links directly to the role notification page and only loads the unread count", async () => {
    vi.spyOn(notificationsApi, "getUnreadCount").mockResolvedValue({ count: 3 });
    const client = new QueryClient({
      defaultOptions: { queries: { retry: false, staleTime: 60_000 } },
    });

    render(
      <QueryClientProvider client={client}>
        <MarketplaceNotificationBell role="provider" />
      </QueryClientProvider>,
    );

    const link = await screen.findByRole("link", { name: "Notifications, 3 unread" });
    expect(link.getAttribute("href")).toBe("/provider/notifications");
    expect(notificationsApi.getUnreadCount).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole("dialog")).toBeNull();
  });
});
