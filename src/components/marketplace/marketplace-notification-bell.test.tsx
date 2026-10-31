// @vitest-environment jsdom

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { MarketplaceNotificationBell } from "@/components/marketplace/marketplace-notification-bell";
import { notificationsApi, type Notification } from "@/lib/api/notifications";

const inquiryId = "0123456789abcdef01234567";

function notification(
  overrides: Partial<Notification> = {},
): Notification {
  return {
    _id: "notification-1",
    user_id: "user-1",
    actor_id: null,
    type: "marketplace_inquiry_received",
    title: "New service inquiry",
    body: "You received a new service inquiry.",
    data: {
      resource_type: "service_inquiry",
      resource_id: inquiryId,
      href: `/inquiries/${inquiryId}`,
    },
    resource_type: "service_inquiry",
    resource_id: inquiryId,
    status: "unread",
    is_history: false,
    dismiss_strategy: "manual",
    created_at: "2026-10-27T10:00:00.000Z",
    updated_at: "2026-10-27T10:00:00.000Z",
    ...overrides,
  };
}

function renderBell() {
  const client = new QueryClient({
    defaultOptions: {
      queries: { retry: false, staleTime: 60_000 },
      mutations: { retry: 0 },
    },
  });
  return {
    client,
    ...render(
      <QueryClientProvider client={client}>
        <MarketplaceNotificationBell />
      </QueryClientProvider>,
    ),
  };
}

describe("MarketplaceNotificationBell", () => {
  let items: Notification[];

  beforeEach(() => {
    items = [notification()];
    vi.spyOn(notificationsApi, "getUnreadCount").mockImplementation(async () => ({
      count: items.filter((item) => item.status === "unread").length,
    }));
    vi.spyOn(notificationsApi, "getNotifications").mockImplementation(
      async ({ history } = {}) => {
        const data = items.filter((item) =>
          history ? item.status === "read" : item.status === "unread",
        );
        return { data, total: data.length, page: 1, limit: 8, total_pages: 1 };
      },
    );
    vi.spyOn(notificationsApi, "markAsRead").mockImplementation(async (id) => {
      items = items.map((item) =>
        item._id === id
          ? { ...item, status: "read", is_history: true }
          : item,
      );
      return { message: "Marked as read" };
    });
    vi.spyOn(notificationsApi, "markAllAsRead").mockImplementation(async () => {
      const count = items.filter((item) => item.status === "unread").length;
      items = items.map((item) => ({
        ...item,
        status: "read",
        is_history: true,
      }));
      return { modified: count };
    });
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it("renders the unread count and recent notifications", async () => {
    renderBell();
    expect(
      await screen.findByRole("button", { name: "Notifications, 1 unread" }),
    ).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Notifications, 1 unread" }));

    expect(await screen.findByText("New service inquiry")).toBeTruthy();
    expect(screen.getByText("You received a new service inquiry.")).toBeTruthy();
    expect(screen.getByRole("link", { name: /New service inquiry/ }).getAttribute("href"))
      .toBe(`/inquiries/${inquiryId}`);
    expect(screen.getByRole("button", { name: "Mark all read" })).toBeTruthy();
  });

  it("shows loading, empty, and error states", async () => {
    vi.mocked(notificationsApi.getNotifications).mockImplementation(
      () => new Promise(() => {}),
    );
    renderBell();
    fireEvent.click(await screen.findByRole("button", { name: "Notifications" }));
    expect(screen.getByRole("status").textContent).toContain("Loading");
    cleanup();

    vi.mocked(notificationsApi.getNotifications).mockResolvedValue({
      data: [],
      total: 0,
      page: 1,
      limit: 8,
      total_pages: 1,
    });
    renderBell();
    fireEvent.click(await screen.findByRole("button", { name: "Notifications, 1 unread" }));
    expect(await screen.findByText(/You’re all caught up/)).toBeTruthy();
    cleanup();

    vi.mocked(notificationsApi.getNotifications).mockRejectedValue(
      new Error("Request failed"),
    );
    renderBell();
    fireEvent.click(await screen.findByRole("button", { name: "Notifications, 1 unread" }));
    expect(await screen.findByRole("alert")).toBeTruthy();
    expect(screen.getByRole("button", { name: "Try again" })).toBeTruthy();
  });

  it("loads the list only when opened and keeps the badge on one count query", async () => {
    renderBell();
    await screen.findByRole("button", { name: "Notifications, 1 unread" });

    expect(notificationsApi.getUnreadCount).toHaveBeenCalledTimes(1);
    expect(notificationsApi.getNotifications).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole("button", { name: "Notifications, 1 unread" }));

    expect(await screen.findByText("New service inquiry")).toBeTruthy();
    expect(notificationsApi.getNotifications).toHaveBeenCalledTimes(2);
  });

  it("marks one item as read, refreshes the list and unread count, and retains it in history", async () => {
    const { client } = renderBell();
    fireEvent.click(await screen.findByRole("button", { name: "Notifications, 1 unread" }));
    const markRead = await screen.findByRole("button", {
      name: "Mark as read: New service inquiry",
    });
    fireEvent.click(markRead);

    await waitFor(() => expect(notificationsApi.markAsRead).toHaveBeenCalledWith("notification-1"));
    expect(await screen.findByRole("button", { name: "Notifications" })).toBeTruthy();
    expect(await screen.findByText("New service inquiry")).toBeTruthy();
    expect(client.getQueryData(["notifications", "unread"])).toEqual({ count: 0 });
    expect(screen.queryByRole("button", { name: /Mark as read:/ })).toBeNull();
  });

  it("marks all read and deduplicates repeated list requests through the query cache", async () => {
    const second = notification({
      _id: "notification-2",
      title: "Review update",
      type: "marketplace_review_moderated",
      resource_type: "provider_review",
      resource_id: "abcdefabcdefabcdefabcdef",
      data: {
        resource_type: "provider_review",
        resource_id: "abcdefabcdefabcdefabcdef",
        href: "/providers/public-provider#reviews",
      },
    });
    items.push(second);
    const { client } = renderBell();
    fireEvent.click(await screen.findByRole("button", { name: "Notifications, 2 unread" }));
    fireEvent.click(screen.getByRole("button", { name: "Mark all read" }));

    await waitFor(() => expect(notificationsApi.markAllAsRead).toHaveBeenCalledTimes(1));
    expect(await screen.findByRole("button", { name: "Notifications" })).toBeTruthy();
    expect(await screen.findByText("Review update")).toBeTruthy();
    expect(screen.getByRole("link", { name: /Review update/ }).getAttribute("href"))
      .toBe("/providers/public-provider#reviews");
    expect(client.getQueryData(["notifications", "unread"])).toEqual({ count: 0 });

    const callsAfterRead = vi.mocked(notificationsApi.getNotifications).mock.calls.length;
    fireEvent.click(screen.getByRole("button", { name: "Notifications" }));
    fireEvent.click(screen.getByRole("button", { name: "Notifications" }));
    await waitFor(() =>
      expect(notificationsApi.getNotifications).toHaveBeenCalledTimes(callsAfterRead),
    );
  });
});
