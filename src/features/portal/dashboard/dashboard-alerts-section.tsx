import { AlertsSummary } from "@/utils/types/PortalStudentDashboard";
import Ionicons from "@expo/vector-icons/Ionicons";
import { ActivityIndicator, Text, View } from "react-native";

type AlertItem = {
  icon: keyof typeof Ionicons.glyphMap;
  text: string;
  tone: "default" | "warning";
};

function buildAlertItems(alerts: AlertsSummary): AlertItem[] {
  const items: AlertItem[] = [];

  if (alerts.unreadConversations > 0) {
    items.push({
      icon: "chatbubble-ellipses-outline",
      text: `${alerts.unreadConversations} message(s) non lu(s)`,
      tone: "default",
    });
  }
  if (alerts.unreadAnnouncements > 0) {
    items.push({
      icon: "notifications-outline",
      text: `${alerts.unreadAnnouncements} communiqué(s) non lu(s)`,
      tone: "default",
    });
  }
  if (alerts.overdueInstallments.count > 0) {
    items.push({
      icon: "alert-circle-outline",
      text: `${alerts.overdueInstallments.count} échéance(s) de frais en retard`,
      tone: "warning",
    });
  }
  if (alerts.pendingTransportInvoices.count > 0) {
    items.push({
      icon: "receipt-outline",
      text: `${alerts.pendingTransportInvoices.count} facture(s) transport en attente`,
      tone: "default",
    });
  }
  if (alerts.upcomingInstallments.length > 0) {
    items.push({
      icon: "time-outline",
      text: `${alerts.upcomingInstallments.length} échéance(s) des frais à venir`,
      tone: "default",
    });
  }

  return items;
}

type DashboardAlertsSectionProps = {
  alerts: AlertsSummary | undefined;
  loading: boolean;
};

export function DashboardAlertsSection({ alerts, loading }: DashboardAlertsSectionProps) {
  if (loading || !alerts) {
    return (
      <View className="py-4">
        <ActivityIndicator />
      </View>
    );
  }

  const items = buildAlertItems(alerts);
  if (items.length === 0) return null;

  return (
    <>
      <Text className="text-xs font-semibold text-gray-500 uppercase mb-1 mt-4">
        Alertes
      </Text>
      <View className="border-t border-gray-100 pt-2 flex-row flex-wrap gap-x-4 gap-y-2">
        {items.map((item, index) => (
          <View key={index} className="flex-row items-center gap-1.5">
            <Ionicons
              name={item.icon}
              size={14}
              color={item.tone === "warning" ? "#dc2626" : "#6B7280"}
            />
            <Text
              className={`text-xs ${
                item.tone === "warning" ? "text-red-600" : "text-gray-500"
              }`}
            >
              {item.text}
            </Text>
          </View>
        ))}
      </View>
    </>
  );
}
