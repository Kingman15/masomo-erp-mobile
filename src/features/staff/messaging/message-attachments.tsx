import { documentIconName } from "@/features/staff/documents/document-icon";
import { formatFileSize } from "@/features/staff/documents/format-file-size";
import { useThemeColors } from "@/hooks/use-theme-colors";
import type { MessageDocument } from "@/utils/types/MessageDocument";
import Ionicons from "@expo/vector-icons/Ionicons";
import { openBrowserAsync } from "expo-web-browser";
import { Pressable, Text, View } from "react-native";

type MessageAttachmentsProps = {
  documents: MessageDocument[];
  tint?: "light" | "dark";
};

export function MessageAttachments({
  documents,
  tint = "light",
}: MessageAttachmentsProps) {
  const colors = useThemeColors();
  if (documents.length === 0) return null;

  return (
    <View className="mt-1 gap-1">
      {documents.map((item) => {
        const document = item.document;
        const label = document?.title ?? document?.originalName ?? "Pièce jointe";

        return (
          <Pressable
            key={item.id}
            onPress={() => {
              if (document?.url) void openBrowserAsync(document.url);
            }}
            className="flex-row items-center gap-1.5"
          >
            <Ionicons
              name={documentIconName(document?.mimeType ?? null)}
              size={14}
              color={tint === "dark" ? colors.input : colors.foregroundSecondary}
            />
            <Text
              className={`text-xs underline flex-shrink ${
                tint === "dark" ? "text-gray-200 dark:text-zinc-700" : "text-foreground-secondary"
              }`}
              numberOfLines={1}
            >
              {label}
              {document?.size ? ` · ${formatFileSize(document.size)}` : ""}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
