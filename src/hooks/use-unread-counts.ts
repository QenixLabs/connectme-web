import { useQuery } from "@tanstack/react-query";
import { notificationsApi } from "@/lib/api/notifications";
import { conversationsApi } from "@/lib/api/conversations";

export function useUnreadNotifications() {
  return useQuery({
    queryKey: ["unread-notifications"],
    queryFn: () => notificationsApi.getUnreadCount(),
    staleTime: 30_000,
  });
}

export function useUnreadMessages() {
  return useQuery({
    queryKey: ["unread-messages"],
    queryFn: () => conversationsApi.getUnreadCount(),
    staleTime: 30_000,
  });
}
