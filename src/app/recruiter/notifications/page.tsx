import { NotificationList } from "@/components/notifications/notification-list";

export default function RecruiterNotificationsPage() {
  return (
    <div className="space-y-4 pb-6">
      <h1 className="text-xl font-bold text-text-primary">Notifications</h1>
      <NotificationList />
    </div>
  );
}
