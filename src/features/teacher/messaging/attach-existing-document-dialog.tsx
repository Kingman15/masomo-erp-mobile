import { ComboBox } from "@/components/list/combo-box";
import { useAttachableDocuments } from "@/hooks/queries/items/conversation";
import type { MessageDocumentDraft } from "@/utils/types/MessageDocument";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useState } from "react";
import { Modal, Pressable, Text, View } from "react-native";

function createTempId() {
  return `${Date.now().toString(36)}${Math.random().toString(36).slice(2)}`;
}

type AttachExistingDocumentDialogProps = {
  visible: boolean;
  deskId: string | null | undefined;
  existingDocumentIds: string[];
  onClose: () => void;
  onAdd: (draft: MessageDocumentDraft) => void;
};

export function AttachExistingDocumentDialog({
  visible,
  deskId,
  existingDocumentIds,
  onClose,
  onAdd,
}: AttachExistingDocumentDialogProps) {
  const [mine, setMine] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const {
    attachableDocuments,
    attachableDocumentsIsLoading,
  } = useAttachableDocuments({ deskId, mine, enabled: visible });

  const selectableDocuments = attachableDocuments.filter(
    (document) => !existingDocumentIds.includes(document.id),
  );

  const handleClose = () => {
    setSelectedId(null);
    onClose();
  };

  const handleAdd = () => {
    const document = selectableDocuments.find((d) => d.id === selectedId);
    if (!document) return;
    onAdd({ tempId: createTempId(), documentId: document.id, document });
    setSelectedId(null);
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={handleClose}>
      <View className="flex-1 bg-white">
        <View className="flex-row items-center justify-between px-4 pt-14 pb-3 border-b border-gray-100">
          <Text className="text-base font-semibold">Joindre un document</Text>
          <Pressable onPress={handleClose} hitSlop={8}>
            <Ionicons name="close" size={22} color="#374151" />
          </Pressable>
        </View>

        <View className="p-4">
          <Pressable
            onPress={() => setMine((prev) => !prev)}
            className="flex-row items-center gap-2 mb-4"
          >
            <Ionicons
              name={mine ? "checkbox" : "square-outline"}
              size={20}
              color={mine ? "#000000" : "#9CA3AF"}
            />
            <Text className="text-sm text-gray-700">Mes documents</Text>
          </Pressable>

          <ComboBox
            label="Document"
            options={selectableDocuments.map((document) => ({
              id: document.id,
              label: document.title ?? document.originalName ?? "Sans nom",
            }))}
            value={selectedId}
            onChange={setSelectedId}
            loading={attachableDocumentsIsLoading}
            emptyLabel="Aucun document disponible"
          />

          <Pressable
            onPress={handleAdd}
            disabled={!selectedId}
            className={`h-11 rounded-lg items-center justify-center mt-2 ${
              selectedId ? "bg-black" : "bg-gray-200"
            }`}
          >
            <Text
              className={`font-medium ${selectedId ? "text-white" : "text-gray-400"}`}
            >
              Ajouter
            </Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}
