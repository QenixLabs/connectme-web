// @vitest-environment jsdom

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, render } from "@testing-library/react";
import type { Socket } from "socket.io-client";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { NotificationToastListener } from "@/components/notifications/notification-toast-listener";
import type { Notification } from "@/lib/api/notifications";

const mocks = vi.hoisted(() => ({
  handler: undefined as ((payload: unknown) => void) | undefined,
  pathname: "/recruiter/dashboard",
  push: vi.fn(),
  toast: vi.fn(),
  socketOn: vi.fn(),
  socketOff: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  usePathname: () => mocks.pathname,
  useRouter: () => ({ push: mocks.push }),
}));

vi.mock("sonner", () => ({ toast: mocks.toast }));

vi.mock("@/providers/auth-store-provider", () => ({
  useAuthStore: (selector: (state: { isAuthenticated: boolean }) => unknown) =>
    selector({ isAuthenticated: true }),
}));

vi.mock("@/providers/socket-provider", () => ({
  useSocket: () =>
    ({
      on: mocks.socketOn.mockImplementation((_event, handler) => {
        mocks.handler = handler;
      }),
      off: mocks.socketOff,
    }) as unknown as Socket,
}));

function createNotification(data: Record<string, unknown> = {}): Notification {
  return {
    _id: "notification-1",
    user_id: "user-1",
    actor_id: null,
    title: "New application",
    body: "A talent applied to your campaign",
    type: "application_received",
    data,
    status: "unread",
    action_status: null,
    is_history: false,
    dismiss_strategy: "manual",
    delivered_at: "2026-11-20T00:00:00.000Z",
    read_at: null,
    created_at: "2026-11-20T00:00:00.000Z",
    updated_at: "2026-11-20T00:00:00.000Z",
  };
}

describe("NotificationToastListener", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("shows a popup for new notifications and links to the notification target", () => {
    const client = new QueryClient();
    const invalidateQueries = vi.spyOn(client, "invalidateQueries");
    render(
      <QueryClientProvider client={client}>
        <NotificationToastListener />
      </QueryClientProvider>,
    );

    const notification = createNotification({
      href: "/recruiter/campaigns/campaign-1/applications",
    });

    act(() => mocks.handler?.(notification));

    expect(mocks.toast).toHaveBeenCalledWith(
      notification.title,
      expect.objectContaining({ description: notification.body }),
    );
    expect(invalidateQueries).toHaveBeenCalledWith({
      queryKey: ["notifications"],
    });

    const options = mocks.toast.mock.calls[0][1] as {
      action: { onClick: () => void };
    };
    options.action.onClick();
    expect(mocks.push).toHaveBeenCalledWith(notification.data.href);
  });

  it("does not show the same notification more than once", () => {
    const client = new QueryClient();
    render(
      <QueryClientProvider client={client}>
        <NotificationToastListener />
      </QueryClientProvider>,
    );
    const notification = createNotification();

    act(() => {
      mocks.handler?.(notification);
      mocks.handler?.(notification);
    });

    expect(mocks.toast).toHaveBeenCalledTimes(1);
  });

  it("shows future notification types using their payload without a frontend type update", () => {
    const client = new QueryClient();
    render(
      <QueryClientProvider client={client}>
        <NotificationToastListener />
      </QueryClientProvider>,
    );
    const notification = createNotification({ href: "/recruiter/dashboard" });
    const futureNotification = { ...notification, _id: "future-1", type: "new_feature_event" };

    act(() => mocks.handler?.(futureNotification));

    expect(mocks.toast).toHaveBeenLastCalledWith(
      futureNotification.title,
      expect.objectContaining({ description: futureNotification.body }),
    );
  });

  it.each(["talent", "recruiter", "provider"])(
    "falls back to the %s notification page",
    (role) => {
      mocks.pathname = `/${role}/dashboard`;
      const client = new QueryClient();
      const { unmount } = render(
        <QueryClientProvider client={client}>
          <NotificationToastListener />
        </QueryClientProvider>,
      );

      act(() => mocks.handler?.(createNotification()));

      const options = mocks.toast.mock.calls[
        mocks.toast.mock.calls.length - 1
      ][1] as {
        action: { onClick: () => void };
      };
      options.action.onClick();
      expect(mocks.push).toHaveBeenLastCalledWith(`/${role}/notifications`);
      unmount();
    },
  );
});
