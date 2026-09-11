import type { Document } from "@/utils/types/Document";
import Ionicons from "@expo/vector-icons/Ionicons";
import { router } from "expo-router";
import { Pressable, Text, View } from "react-native";
import { documentIconName } from "./document-icon";
import { formatFileSize } from "./format-file-size";

type DocumentRowProps = {
  item: Document;
  isFirst?: boolean;
};

export function DocumentRow({ item, isFirst }: DocumentRowProps) {
  const metaParts = [
    item.originalName,
    formatFileSize(item.size),
    item.uploadedByUser
      ? `Téléversé par ${item.uploadedByUser.username ?? "N/A"}`
      : null,
    item.createdAt
      ? new Date(item.createdAt).toLocaleDateString("fr-FR")
      : null,
  ].filter(Boolean);

  return (
    <Pressable
      onPress={() => router.push(`/teacher/documents/${item.id}`)}
      className={`flex-row items-start gap-3 px-4 py-4 ${isFirst ? "" : "border-t border-gray-100"}`}
    >
      <View className="w-10 h-10 rounded-lg bg-gray-100 border border-gray-200 items-center justify-center">
        <Ionicons
          name={documentIconName(item.mimeType)}
          size={20}
          color="#6B7280"
        />
      </View>

      <View className="flex-1">
        <Text className="text-base font-bold text-black" numberOfLines={2}>
          {item.title ?? item.originalName ?? "Sans nom"}
        </Text>

        {item.description && (
          <Text className="text-sm text-gray-500 mt-0.5" numberOfLines={2}>
            {item.description}
          </Text>
        )}

        {metaParts.length > 0 && (
          <Text className="text-xs text-gray-400 mt-1" numberOfLines={1}>
            {metaParts.join(" · ")}
          </Text>
        )}
      </View>

      <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
    </Pressable>
  );
}
