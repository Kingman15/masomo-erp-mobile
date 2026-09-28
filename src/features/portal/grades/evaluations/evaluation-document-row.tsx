import { useThemeColors } from "@/hooks/use-theme-colors";
import type { TeachingCourseEvaluationDocument } from "@/utils/types/TeachingCourseEvaluationDocument";
import Ionicons from "@expo/vector-icons/Ionicons";
import { openBrowserAsync } from "expo-web-browser";
import { Pressable, Text, View } from "react-native";

const DOCUMENT_TYPE_LABELS: Record<string, string> = {
  subject: "Sujet",
  correction: "Corrigé",
  scale: "Barème",
};

function formatFileSize(bytes: number) {
  if (bytes < 1024) return `${bytes} o`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} Ko`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`;
}

type EvaluationDocumentRowProps = {
  document: TeachingCourseEvaluationDocument;
};

export function EvaluationDocumentRow({ document }: EvaluationDocumentRowProps) {
  const colors = useThemeColors();
  return (
    <Pressable
      onPress={() => void openBrowserAsync(document.url)}
      className="flex-row items-center gap-3 px-3 py-3 border border-border rounded-lg mb-2 bg-card"
    >
      <Ionicons name="document-text-outline" size={20} color={colors.mutedForeground} />

      <View className="flex-1">
        {document.documentType && (
          <Text className="text-xs text-faint mb-0.5">
            {DOCUMENT_TYPE_LABELS[document.documentType] ??
              document.documentType}
          </Text>
        )}
        <Text className="text-sm text-foreground" numberOfLines={1}>
          {document.originalName}
        </Text>
        <Text className="text-xs text-faint mt-0.5">
          {formatFileSize(document.size)}
        </Text>
      </View>

      <Ionicons name="chevron-forward" size={16} color={colors.input} />
    </Pressable>
  );
}
