import { documentIconName } from "@/features/teacher/documents/document-icon";
import { formatFileSize } from "@/features/teacher/documents/format-file-size";
import { useThemeColors } from "@/hooks/use-theme-colors";
import { formatShortDate } from "@/lib/format";
import type { PortalDocumentDTO } from "@/utils/types/objects/PortalDocumentDTO";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Pressable, Text, View } from "react-native";

type DocumentRowProps = {
  item: PortalDocumentDTO;
  onPress: (item: PortalDocumentDTO) => void;
  isFirst?: boolean;
};

export function DocumentRow({ item, onPress, isFirst }: DocumentRowProps) {
  const colors = useThemeColors();
  const metaParts = [
    item.category,
    formatFileSize(item.size),
    formatShortDate(item.createdAt),
  ].filter(Boolean);

  return (
    <Pressable
      onPress={() => onPress(item)}
      className={`flex-row items-start gap-3 px-4 py-4 ${isFirst ? "" : "border-t border-divider"}`}
    >
      <View className="w-10 h-10 rounded-lg bg-muted border border-border items-center justify-center">
        <Ionicons
          name={documentIconName(item.mimeType)}
          size={20}
          color={colors.mutedForeground}
        />
      </View>

      <View className="flex-1">
        <Text className="text-base font-bold text-foreground" numberOfLines={2}>
          {item.title ?? item.originalName ?? "Sans nom"}
        </Text>

        {item.description && (
          <Text className="text-sm text-muted-foreground mt-0.5" numberOfLines={2}>
            {item.description}
          </Text>
        )}

        {metaParts.length > 0 && (
          <Text className="text-xs text-faint mt-1" numberOfLines={1}>
            {metaParts.join(" · ")}
          </Text>
        )}
      </View>

      <Ionicons name="chevron-forward" size={18} color={colors.faint} />
    </Pressable>
  );
}
