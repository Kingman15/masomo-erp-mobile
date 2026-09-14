import { ChipSelect } from "@/components/list/chip-select";
import { DOCUMENT_CATEGORIES } from "@/features/teacher/documents/document-categories";
import { useUploadDocument } from "@/hooks/queries/items/document";
import { handleApiError } from "@/lib/handle-api-error";
import type { MessageDocumentDraft } from "@/utils/types/MessageDocument";
import Ionicons from "@expo/vector-icons/Ionicons";
import * as DocumentPicker from "expo-document-picker";
import { useState } from "react";
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";

function createTempId() {
  return `${Date.now().toString(36)}${Math.random().toString(36).slice(2)}`;
}

const MAX_FILE_SIZE = 10 * 1024 * 1024;

const ACCEPTED_MIME_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "image/jpeg",
  "image/png",
];

const ACCEPTED_EXTENSIONS = ["pdf", "doc", "docx", "jpg", "jpeg", "png"];

function getExtension(name: string) {
  const parts = name.split(".");
  return parts.length > 1 ? parts[parts.length - 1].toLowerCase() : "";
}

type PickedFile = {
  uri: string;
  name: string;
  mimeType: string;
  size?: number;
};

type UploadDocumentDialogProps = {
  visible: boolean;
  schoolYearId: string | null | undefined;
  onClose: () => void;
  onUploaded: (draft: MessageDocumentDraft) => void;
};

export function UploadDocumentDialog({
  visible,
  schoolYearId,
  onClose,
  onUploaded,
}: UploadDocumentDialogProps) {
  const [file, setFile] = useState<PickedFile | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<string | null>(null);
  const [description, setDescription] = useState("");

  const { uploadDocument, uploadDocumentIsPending } = useUploadDocument();

  const reset = () => {
    setFile(null);
    setFileError(null);
    setTitle("");
    setCategory(null);
    setDescription("");
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const pickFile = async () => {
    setFileError(null);
    const result = await DocumentPicker.getDocumentAsync({
      type: ACCEPTED_MIME_TYPES,
      copyToCacheDirectory: true,
    });
    if (result.canceled) return;

    const asset = result.assets[0];
    const extension = getExtension(asset.name);

    if (!ACCEPTED_EXTENSIONS.includes(extension)) {
      setFileError(
        "Format non accepté. Formats autorisés : PDF, DOC, DOCX, JPG, JPEG, PNG.",
      );
      return;
    }
    if (asset.size && asset.size > MAX_FILE_SIZE) {
      setFileError("Le fichier dépasse la taille maximale autorisée (10 Mo).");
      return;
    }

    setFile({
      uri: asset.uri,
      name: asset.name,
      mimeType: asset.mimeType ?? "application/octet-stream",
      size: asset.size,
    });
  };

  const handleUpload = async () => {
    if (!file) {
      setFileError("Veuillez sélectionner un fichier.");
      return;
    }

    try {
      const document = await uploadDocument({
        uri: file.uri,
        name: file.name,
        mimeType: file.mimeType,
        schoolYearId,
        title: title.trim() || null,
        category: category ?? null,
        description: description.trim() || null,
      });
      onUploaded({ tempId: createTempId(), documentId: document.id, document });
      handleClose();
    } catch (error) {
      handleApiError(error);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={handleClose}>
      <View className="flex-1 bg-white">
        <View className="flex-row items-center justify-between px-4 pt-14 pb-3 border-b border-gray-100">
          <Text className="text-base font-semibold">Téléverser un fichier</Text>
          <Pressable onPress={handleClose} hitSlop={8}>
            <Ionicons name="close" size={22} color="#374151" />
          </Pressable>
        </View>

        <ScrollView className="flex-1" contentContainerStyle={{ padding: 16 }}>
          <Pressable
            onPress={() => void pickFile()}
            className="h-11 rounded-lg border border-dashed border-gray-300 items-center justify-center mb-1 flex-row gap-2"
          >
            <Ionicons name="attach-outline" size={18} color="#374151" />
            <Text className="text-sm font-medium text-gray-700">
              {file ? "Changer de fichier" : "Sélectionner un fichier"}
            </Text>
          </Pressable>
          {file && (
            <Text className="text-xs text-gray-500 mb-1">{file.name}</Text>
          )}
          <Text className="text-xs text-gray-400 mb-1">
            Formats : PDF, DOC, DOCX, JPG, JPEG, PNG · max 10 Mo.
          </Text>
          {fileError && (
            <Text className="text-xs text-red-500 mb-3">{fileError}</Text>
          )}

          <Text className="text-sm font-medium text-gray-700 mb-2 mt-2">
            Titre
          </Text>
          <TextInput
            value={title}
            onChangeText={setTitle}
            placeholder="Titre (optionnel)"
            placeholderTextColor="#9CA3AF"
            className="h-11 border border-gray-300 rounded-lg px-3 mb-3 bg-white"
          />

          <ChipSelect
            label="Catégorie"
            options={DOCUMENT_CATEGORIES.map((item) => ({
              id: item,
              label: item,
            }))}
            value={category}
            onChange={setCategory}
          />

          <Text className="text-sm font-medium text-gray-700 mb-2">
            Description
          </Text>
          <TextInput
            value={description}
            onChangeText={setDescription}
            multiline
            textAlignVertical="top"
            placeholder="Description (optionnel)"
            placeholderTextColor="#9CA3AF"
            className="min-h-[80px] border border-gray-300 rounded-lg px-3 py-2 mb-4 bg-white"
          />

          <Pressable
            onPress={() => void handleUpload()}
            disabled={uploadDocumentIsPending}
            className={`h-11 rounded-lg items-center justify-center ${
              uploadDocumentIsPending ? "bg-gray-300" : "bg-black"
            }`}
          >
            {uploadDocumentIsPending ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text className="text-white font-medium">Téléverser</Text>
            )}
          </Pressable>
        </ScrollView>
      </View>
    </Modal>
  );
}
