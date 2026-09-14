import { Text, View } from "react-native";

type ConversationStatusPillProps = {
  awaitingSchoolReply: boolean;
};

export function ConversationStatusPill({
  awaitingSchoolReply,
}: ConversationStatusPillProps) {
  const config = awaitingSchoolReply
    ? { bg: "bg-amber-100", fg: "text-amber-700", label: "À traiter" }
    : { bg: "bg-gray-100", fg: "text-gray-500", label: "Traité" };

  return (
    <View className={`px-2.5 py-1 rounded-full ${config.bg}`}>
      <Text className={`text-xs font-medium ${config.fg}`}>
        {config.label}
      </Text>
    </View>
  );
}
