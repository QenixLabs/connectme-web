import { useQuery } from "@tanstack/react-query";
import { conversationsApi } from "@/lib/api/conversations";

export { useUnreadNotifications } from "@/hooks/use-notifications";

export function useUnreadMessages() {
  return useQuery({
    queryKey: ["unread-messages"],
    queryFn: () => conversationsApi.getUnreadCount(),
    staleTime: 30_000,
  });
}
