import { NotificationsScreen } from "@/features/portal/notifications/notifications-screen";
import { DrawerMenuButton } from "@/features/teacher/drawer-menu-button";
import { resolveTeacherNotificationRoute } from "@/features/teacher/notifications/resolve-teacher-notification-route";

export default function TeacherNotificationsScreen() {
  return (
    <NotificationsScreen
      resolveRoute={resolveTeacherNotificationRoute}
      headerLeft={() => <DrawerMenuButton />}
    />
  );
}
