import { documentIconName } from "@/features/teacher/documents/document-icon";
import { formatFileSize } from "@/features/teacher/documents/format-file-size";
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
              color={tint === "dark" ? "#D1D5DB" : "#374151"}
            />
            <Text
              className={`text-xs underline flex-shrink ${
                tint === "dark" ? "text-gray-200" : "text-gray-700"
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
