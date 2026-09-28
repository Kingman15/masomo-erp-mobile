import { Text, View } from "react-native";

type ConversationStatusPillProps = {
  awaitingSchoolReply: boolean;
};

export function ConversationStatusPill({
  awaitingSchoolReply,
}: ConversationStatusPillProps) {
  const config = awaitingSchoolReply
    ? { bg: "bg-amber-100 dark:bg-amber-900/40", fg: "text-amber-700 dark:text-amber-300", label: "À traiter" }
    : { bg: "bg-muted", fg: "text-muted-foreground", label: "Traité" };

  return (
    <View className={`px-2.5 py-1 rounded-full ${config.bg}`}>
      <Text className={`text-xs font-medium ${config.fg}`}>
        {config.label}
      </Text>
    </View>
  );
}
