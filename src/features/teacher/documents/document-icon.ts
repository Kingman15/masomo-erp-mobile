import Ionicons from "@expo/vector-icons/Ionicons";

export function documentIconName(
  mimeType: string | null,
): keyof typeof Ionicons.glyphMap {
  if (!mimeType) return "document-outline";
  if (mimeType === "application/pdf") return "document-text-outline";
  if (mimeType.startsWith("image/")) return "image-outline";
  if (mimeType.startsWith("video/")) return "videocam-outline";
  if (mimeType.includes("spreadsheet") || mimeType.includes("excel")) {
    return "grid-outline";
  }
  if (mimeType.includes("zip") || mimeType.includes("compressed")) {
    return "archive-outline";
  }
  return "document-outline";
}
