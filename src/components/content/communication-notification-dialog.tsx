"use client";

import type { Notification } from "@/lib/api/notifications";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { safeActionLink } from "./formatted-content";

export function CommunicationNotificationDialog({
  notification,
  close,
}: {
  notification: Notification | null;
  close: () => void;
}) {
  const href = safeActionLink(
    typeof notification?.data.href === "string"
      ? notification.data.href
      : undefined,
  );
  return (
    <Dialog
      open={!!notification}
      onOpenChange={(open) => {
        if (!open) close();
      }}
    >
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{notification?.title}</DialogTitle>
          <DialogDescription>Update from RootIn</DialogDescription>
        </DialogHeader>
        <p className="whitespace-pre-wrap break-words text-sm leading-6">
          {notification?.body}
        </p>
        {href && (
          <a className="text-sm text-primary underline" href={href}>
            Learn more
          </a>
        )}
      </DialogContent>
    </Dialog>
  );
}
