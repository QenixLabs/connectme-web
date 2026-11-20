"use client";

import { useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { type Notification, notificationTypeLabel } from "@/lib/api/notifications";
import { useAuthStore } from "@/providers/auth-store-provider";
import { useSocket } from "@/providers/socket-provider";

type WorkspaceRole = "talent" | "recruiter" | "provider";

function isNotification(value: unknown): value is Notification {
  if (!value || typeof value !== "object") return false;
  const notification = value as Partial<Notification>;
  return (
    typeof notification._id === "string" &&
    typeof notification.title === "string" &&
    typeof notification.body === "string" &&
    typeof notification.type === "string" &&
    typeof notification.data === "object" &&
    notification.data !== null
  );
}

function workspaceRole(pathname: string): WorkspaceRole | null {
  if (pathname.startsWith("/talent/")) return "talent";
  if (pathname.startsWith("/recruiter/")) return "recruiter";
  if (pathname.startsWith("/provider/")) return "provider";
  return null;
}

export function NotificationToastListener() {
  const socket = useSocket();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const pathname = usePathname();
  const router = useRouter();
  const queryClient = useQueryClient();
  const role = workspaceRole(pathname);
  const seenNotifications = useRef(new Set<string>());

  useEffect(() => {
    if (!socket || !isAuthenticated || !role) return;

    const handleNotification = (payload: unknown) => {
      if (!isNotification(payload) || seenNotifications.current.has(payload._id)) {
        return;
      }

      seenNotifications.current.add(payload._id);
      void queryClient.invalidateQueries({ queryKey: ["notifications"] });

      const notificationPath =
        typeof payload.data.href === "string" &&
        payload.data.href.startsWith("/") &&
        !payload.data.href.startsWith("//")
          ? payload.data.href
          : `/${role}/notifications`;

      toast(payload.title, {
        description: payload.body || notificationTypeLabel(payload.type),
        duration: 8000,
        action: {
          label: "View",
          onClick: () => router.push(notificationPath),
        },
      });
    };

    socket.on("notification:new", handleNotification);
    return () => {
      socket.off("notification:new", handleNotification);
    };
  }, [isAuthenticated, queryClient, role, router, socket]);

  return null;
}
