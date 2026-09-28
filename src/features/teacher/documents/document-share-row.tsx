import { useThemeColors } from "@/hooks/use-theme-colors";
import type { DocumentShareFormValues } from "@/utils/schemas/document-schema";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Pressable, Text, View } from "react-native";
import { AUDIENCE_TYPE_OPTIONS } from "./audience-type-options";

type DocumentShareRowProps = {
  share: DocumentShareFormValues;
  onPress: () => void;
  onDelete: () => void;
};

export function DocumentShareRow({
  share,
  onPress,
  onDelete,
}: DocumentShareRowProps) {
  const colors = useThemeColors();
  const typeLabel =
    AUDIENCE_TYPE_OPTIONS.find((option) => option.id === share.audienceType)
      ?.label ?? share.audienceType;

  const targetLabel = share.audienceType === "school" ? null : share.audienceLabel;

  const dateParts = [
    share.publishedAt
      ? `Publié le ${new Date(share.publishedAt).toLocaleDateString("fr-FR")}`
      : "Non publié",
    share.expiresAt
      ? `Expire le ${new Date(share.expiresAt).toLocaleDateString("fr-FR")}`
      : null,
  ].filter(Boolean);

  return (
    <Pressable
      onPress={onPress}
      className="flex-row items-center gap-3 px-3 py-3 border border-border rounded-lg mb-2 bg-card"
    >
      <View className="w-9 h-9 rounded-lg bg-muted border border-border items-center justify-center">
        <Ionicons name="people-outline" size={16} color={colors.mutedForeground} />
      </View>

      <View className="flex-1">
        <Text className="text-sm font-semibold text-foreground">
          {targetLabel ? `${typeLabel} · ${targetLabel}` : typeLabel}
        </Text>
        <Text className="text-xs text-faint mt-0.5">
          {dateParts.join(" · ")}
        </Text>
      </View>

      <Pressable onPress={onDelete} hitSlop={8} className="p-1">
        <Ionicons name="trash-outline" size={18} color="#EF4444" />
      </Pressable>
    </Pressable>
  );
}
