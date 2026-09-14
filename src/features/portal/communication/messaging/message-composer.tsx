import { documentIconName } from "@/features/teacher/documents/document-icon";
import { formatFileSize } from "@/features/teacher/documents/format-file-size";
import type { MessageDocumentDraft } from "@/utils/types/MessageDocument";
import Ionicons from "@expo/vector-icons/Ionicons";
import type { ReactNode } from "react";
import { useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";
import { AttachExistingDocumentDialog } from "./attach-existing-document-dialog";
import { UploadDocumentDialog } from "./upload-document-dialog";

type MessageComposerProps = {
  body: string;
  onBodyChange: (value: string) => void;
  documents: MessageDocumentDraft[];
  onDocumentsChange: (documents: MessageDocumentDraft[]) => void;
  disabled?: boolean;
  schoolYearId?: string | null;
  placeholder?: string;
  // Rendu à droite du champ de texte (ex. bouton d'envoi) — la logique
  // d'envoi reste la responsabilité de l'écran appelant.
  trailing?: ReactNode;
};

export function MessageComposer({
  body,
  onBodyChange,
  documents,
  onDocumentsChange,
  disabled,
  schoolYearId,
  placeholder = "Écrire un message…",
  trailing,
}: MessageComposerProps) {
  const [attachDialogVisible, setAttachDialogVisible] = useState(false);
  const [uploadDialogVisible, setUploadDialogVisible] = useState(false);

  const addDraft = (draft: MessageDocumentDraft) => {
    if (documents.some((d) => d.documentId === draft.documentId)) return;
    onDocumentsChange([...documents, draft]);
  };

  const removeDraft = (tempId: string) => {
    onDocumentsChange(documents.filter((d) => d.tempId !== tempId));
  };

  return (
    <View className="p-3 border-t border-gray-100">
      {documents.length > 0 && (
        <View className="gap-2 mb-2">
          {documents.map((draft) => (
            <View
              key={draft.tempId}
              className="flex-row items-center gap-2 border border-gray-200 rounded-lg px-3 py-2"
            >
              <Ionicons
                name={documentIconName(draft.document?.mimeType ?? null)}
                size={16}
                color="#6B7280"
              />
              <View className="flex-1">
                <Text className="text-sm text-black" numberOfLines={1}>
                  {draft.document?.title ??
                    draft.document?.originalName ??
                    "Sans nom"}
                </Text>
                {draft.document?.size != null && (
                  <Text className="text-xs text-gray-400">
                    {formatFileSize(draft.document.size)}
                  </Text>
                )}
              </View>
              <Pressable onPress={() => removeDraft(draft.tempId)} hitSlop={8}>
                <Ionicons name="close-circle" size={18} color="#9CA3AF" />
              </Pressable>
            </View>
          ))}
        </View>
      )}

      {!disabled && (
        <View className="flex-row items-center gap-4 mb-2">
          <Pressable
            onPress={() => setAttachDialogVisible(true)}
            className="flex-row items-center gap-1.5"
          >
            <Ionicons name="attach-outline" size={18} color="#374151" />
            <Text className="text-xs font-medium text-gray-700">
              Joindre un document
            </Text>
          </Pressable>
          <Pressable
            onPress={() => setUploadDialogVisible(true)}
            className="flex-row items-center gap-1.5"
          >
            <Ionicons name="cloud-upload-outline" size={18} color="#374151" />
            <Text className="text-xs font-medium text-gray-700">
              Téléverser un fichier
            </Text>
          </Pressable>
        </View>
      )}

      <View className="flex-row items-end gap-2">
        <TextInput
          value={body}
          onChangeText={onBodyChange}
          editable={!disabled}
          placeholder={placeholder}
          placeholderTextColor="#9CA3AF"
          multiline
          className={`flex-1 min-h-[40px] max-h-32 border border-gray-300 rounded-lg px-3 py-2 text-sm ${
            disabled ? "bg-gray-50 text-gray-400" : "bg-white"
          }`}
        />
        {trailing}
      </View>

      <AttachExistingDocumentDialog
        visible={attachDialogVisible}
        existingDocumentIds={documents.map((d) => d.documentId)}
        onClose={() => setAttachDialogVisible(false)}
        onAdd={addDraft}
      />

      <UploadDocumentDialog
        visible={uploadDialogVisible}
        schoolYearId={schoolYearId}
        onClose={() => setUploadDialogVisible(false)}
        onUploaded={addDraft}
      />
    </View>
  );
}
