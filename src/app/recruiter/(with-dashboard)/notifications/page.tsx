import { NotificationList } from "@/components/notifications/notification-list";

export default function RecruiterNotificationsPage() {
  return (
    <div className="px-4 pt-4 pb-6 space-y-4">
      <h1 className="text-xl font-bold text-text-primary">Notifications</h1>
      <NotificationList />
    </div>
  );
}
