import { ChipSelect } from "@/components/list/chip-select";
import type { TeachingCourseEvaluationDocumentType } from "@/utils/types/TeachingCourseEvaluationDocument";
import Ionicons from "@expo/vector-icons/Ionicons";
import * as DocumentPicker from "expo-document-picker";
import { useState } from "react";
import {
  ActivityIndicator,
  Modal,
  Pressable,
  Text,
  View,
} from "react-native";

const MAX_FILE_SIZE = 10 * 1024 * 1024;

const ACCEPTED_MIME_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "image/jpeg",
  "image/png",
];

const ACCEPTED_EXTENSIONS = ["pdf", "doc", "docx", "jpg", "jpeg", "png"];

const DOCUMENT_TYPE_OPTIONS: {
  id: TeachingCourseEvaluationDocumentType;
  label: string;
  help: string;
}[] = [
  {
    id: "subject",
    label: "Sujet de l'évaluation",
    help: "Remis aux élèves pour réaliser l'évaluation",
  },
  {
    id: "correction",
    label: "Corrigé",
    help: "Généralement partagé après la publication de l'évaluation",
  },
  {
    id: "scale",
    label: "Barème de notation",
    help: "Grille de notation utilisée pour corriger",
  },
];

function getExtension(name: string) {
  const parts = name.split(".");
  return parts.length > 1 ? parts[parts.length - 1].toLowerCase() : "";
}

function formatFileSize(bytes: number) {
  if (bytes < 1024) return `${bytes} o`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} Ko`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`;
}

type PickedFile = {
  uri: string;
  name: string;
  mimeType: string;
  size?: number;
};

export type EvaluationDocumentUploadPayload = {
  uri: string;
  name: string;
  mimeType: string;
  documentType: TeachingCourseEvaluationDocumentType | null;
};

type EvaluationDocumentUploadDialogProps = {
  isPending: boolean;
  onClose: () => void;
  onUpload: (payload: EvaluationDocumentUploadPayload) => void;
};

export function EvaluationDocumentUploadDialog({
  isPending,
  onClose,
  onUpload,
}: EvaluationDocumentUploadDialogProps) {
  const [file, setFile] = useState<PickedFile | null>(null);
  const [documentType, setDocumentType] =
    useState<TeachingCourseEvaluationDocumentType | null>(null);
  const [error, setError] = useState<string | null>(null);

  const pickFile = async () => {
    setError(null);
    const result = await DocumentPicker.getDocumentAsync({
      type: ACCEPTED_MIME_TYPES,
      copyToCacheDirectory: true,
    });
    if (result.canceled) return;

    const asset = result.assets[0];
    const extension = getExtension(asset.name);

    if (!ACCEPTED_EXTENSIONS.includes(extension)) {
      setError(
        "Format non accepté. Formats autorisés : PDF, DOC, DOCX, JPG, PNG.",
      );
      return;
    }
    if (asset.size && asset.size > MAX_FILE_SIZE) {
      setError("Le fichier dépasse la taille maximale autorisée (10 Mo).");
      return;
    }

    setFile({
      uri: asset.uri,
      name: asset.name,
      mimeType: asset.mimeType ?? "application/octet-stream",
      size: asset.size,
    });
  };

  const handleUpload = () => {
    if (!file) return;
    onUpload({
      uri: file.uri,
      name: file.name,
      mimeType: file.mimeType,
      documentType,
    });
  };

  const selectedTypeHelp = DOCUMENT_TYPE_OPTIONS.find(
    (option) => option.id === documentType,
  )?.help;

  return (
    <Modal visible animationType="slide" onRequestClose={onClose}>
      <View className="flex-1 bg-white">
        <View className="flex-row items-center justify-between px-4 pt-14 pb-3 border-b border-gray-100">
          <Text className="text-base font-semibold">Ajouter un document</Text>
          <Pressable onPress={onClose} hitSlop={8}>
            <Ionicons name="close" size={22} color="#374151" />
          </Pressable>
        </View>

        <View className="p-4">
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
            <Text className="text-xs text-gray-500 mb-3">
              {file.name}
              {file.size ? ` · ${formatFileSize(file.size)}` : ""}
            </Text>
          )}

          {error && <Text className="text-xs text-red-500 mb-3">{error}</Text>}

          <ChipSelect
            label="Type de document (optionnel)"
            options={DOCUMENT_TYPE_OPTIONS.map(({ id, label }) => ({
              id,
              label,
            }))}
            value={documentType}
            onChange={(id) =>
              setDocumentType(id as TeachingCourseEvaluationDocumentType | null)
            }
          />
          {selectedTypeHelp && (
            <Text className="text-xs text-gray-400 -mt-3 mb-4">
              {selectedTypeHelp}
            </Text>
          )}

          <Pressable
            onPress={handleUpload}
            disabled={!file || isPending}
            className={`h-12 rounded-lg items-center justify-center mt-2 ${
              !file || isPending ? "bg-gray-300" : "bg-black"
            }`}
          >
            {isPending ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text className="text-white font-medium">Uploader</Text>
            )}
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}
