import { ChipSelect } from "@/components/list/chip-select";
import { ComboBox } from "@/components/list/combo-box";
import { useCreateDocument } from "@/hooks/queries/items/document";
import {
  useCurrentSchoolYear,
  useSchoolYears,
} from "@/hooks/queries/items/school-year";
import { handleApiError } from "@/lib/handle-api-error";
import { toastNotify } from "@/lib/toast";
import {
  documentFormSchema,
  type DocumentFormValues,
  type DocumentShareFormValues,
} from "@/utils/schemas/document-schema";
import { zodResolver } from "@hookform/resolvers/zod";
import Ionicons from "@expo/vector-icons/Ionicons";
import * as DocumentPicker from "expo-document-picker";
import { router, Stack } from "expo-router";
import { useEffect, useState } from "react";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  TextInput,
} from "react-native";
import { DOCUMENT_CATEGORIES } from "./document-categories";
import { DocumentShareDialog } from "./document-share-dialog";
import { DocumentShareRow } from "./document-share-row";
import { formatFileSize } from "./format-file-size";

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

function createTempId() {
  return `${Date.now().toString(36)}${Math.random().toString(36).slice(2)}`;
}

function emptyShare(): DocumentShareFormValues {
  return {
    tempId: createTempId(),
    audienceType: "school",
    audienceId: null,
    audienceLabel: null,
    publishedAt: null,
    expiresAt: null,
  };
}

type PickedFile = {
  uri: string;
  name: string;
  mimeType: string;
  size?: number;
};

export function DocumentFormScreen() {
  const [file, setFile] = useState<PickedFile | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<DocumentFormValues>({
    resolver: zodResolver(documentFormSchema),
    defaultValues: {
      title: "",
      description: null,
      category: null,
      schoolYearId: null,
      shares: [],
    },
  });

  const { fields, append, update, remove } = useFieldArray({
    control,
    name: "shares",
    keyName: "fieldKey",
  });

  const schoolYearId = watch("schoolYearId");

  const { schoolYears, schoolYearsIsLoading } = useSchoolYears();
  const { currentSchoolYear } = useCurrentSchoolYear();

  useEffect(() => {
    if (!schoolYearId && currentSchoolYear?.id) {
      setValue("schoolYearId", currentSchoolYear.id);
    }
  }, [currentSchoolYear, schoolYearId, setValue]);

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

  // --- Partages ---

  const [shareDialog, setShareDialog] = useState<{
    visible: boolean;
    index: number | null;
    values: DocumentShareFormValues;
  }>({ visible: false, index: null, values: emptyShare() });

  const openAddShare = () => {
    setShareDialog({ visible: true, index: null, values: emptyShare() });
  };

  const openEditShare = (index: number) => {
    setShareDialog({ visible: true, index, values: fields[index] });
  };

  const closeShareDialog = () => {
    setShareDialog((state) => ({ ...state, visible: false }));
  };

  const saveShare = (values: DocumentShareFormValues) => {
    if (shareDialog.index === null) {
      append(values);
    } else {
      update(shareDialog.index, values);
    }
    closeShareDialog();
  };

  // --- Soumission ---

  const { createDocument, createDocumentIsPending } = useCreateDocument();
  const isBusy = createDocumentIsPending || isSubmitting;

  const onSubmit = async (data: DocumentFormValues) => {
    if (!file) {
      setFileError("Veuillez sélectionner un fichier.");
      return;
    }

    try {
      await createDocument({
        uri: file.uri,
        name: file.name,
        mimeType: file.mimeType,
        title: data.title,
        description: data.description ?? null,
        category: data.category ?? null,
        schoolYearId: data.schoolYearId ?? null,
        shares: data.shares.map((share) => ({
          audienceType: share.audienceType,
          audienceId: share.audienceId ?? null,
          publishedAt: share.publishedAt ?? null,
          expiresAt: share.expiresAt ?? null,
        })),
      });

      toastNotify("Document partagé avec succès.", "success");
      router.back();
    } catch (error) {
      handleApiError(error, {
        setFieldError: (field, message) =>
          setError(field as keyof DocumentFormValues, { message }),
      });
    }
  };

  return (
    <>
      <Stack.Screen options={{ title: "Partager un document" }} />

      <ScrollView
        className="flex-1 bg-white"
        contentContainerStyle={{ padding: 16 }}
      >
        <Text className="text-sm font-medium text-gray-700 mb-2">Titre</Text>
        <Controller
          control={control}
          name="title"
          render={({ field: { value, onChange } }) => (
            <TextInput
              value={value}
              onChangeText={onChange}
              placeholder="Titre du document"
              placeholderTextColor="#9CA3AF"
              className="h-11 border border-gray-300 rounded-lg px-3 mb-1 bg-white"
            />
          )}
        />
        {errors.title && (
          <Text className="text-xs text-red-500 mb-3">
            {errors.title.message}
          </Text>
        )}

        <Text className="text-sm font-medium text-gray-700 mb-2 mt-1">
          Fichier
        </Text>
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
          <Text className="text-xs text-gray-500 mb-1">
            {file.name}
            {file.size ? ` · ${formatFileSize(file.size)}` : ""}
          </Text>
        )}
        <Text className="text-xs text-gray-400 mb-1">
          Formats : PDF, DOC, DOCX, JPG, JPEG, PNG · max 10 Mo.
        </Text>
        {fileError && (
          <Text className="text-xs text-red-500 mb-3">{fileError}</Text>
        )}

        <Text className="text-sm font-medium text-gray-700 mb-2 mt-2">
          Catégorie
        </Text>
        <Controller
          control={control}
          name="category"
          render={({ field: { value, onChange } }) => (
            <TextInput
              value={value ?? ""}
              onChangeText={(text) => onChange(text || null)}
              placeholder="Catégorie (optionnel)"
              placeholderTextColor="#9CA3AF"
              className="h-11 border border-gray-300 rounded-lg px-3 mb-2 bg-white"
            />
          )}
        />
        <Controller
          control={control}
          name="category"
          render={({ field: { value, onChange } }) => (
            <ChipSelect
              label="Suggestions"
              options={DOCUMENT_CATEGORIES.map((category) => ({
                id: category,
                label: category,
              }))}
              value={value ?? null}
              onChange={onChange}
            />
          )}
        />
        {errors.category && (
          <Text className="text-xs text-red-500 -mt-2 mb-3">
            {errors.category.message}
          </Text>
        )}

        <Controller
          control={control}
          name="schoolYearId"
          render={({ field: { value } }) => (
            <ComboBox
              label="Année scolaire"
              options={(schoolYears ?? []).map((year) => ({
                id: year.id,
                label: year.title,
              }))}
              value={value ?? null}
              onChange={() => {}}
              loading={schoolYearsIsLoading}
              disabled
            />
          )}
        />

        <Text className="text-sm font-medium text-gray-700 mb-2">
          Description
        </Text>
        <Controller
          control={control}
          name="description"
          render={({ field: { value, onChange } }) => (
            <TextInput
              value={value ?? ""}
              onChangeText={(text) => onChange(text || null)}
              multiline
              textAlignVertical="top"
              placeholder="Description (optionnel)"
              placeholderTextColor="#9CA3AF"
              className="min-h-[80px] border border-gray-300 rounded-lg px-3 py-2 mb-1 bg-white"
            />
          )}
        />
        {errors.description && (
          <Text className="text-xs text-red-500 mb-3">
            {errors.description.message}
          </Text>
        )}

        <Text className="text-base font-semibold text-black mt-2 mb-3">
          Partages
        </Text>

        {fields.map((field, index) => (
          <DocumentShareRow
            key={field.fieldKey}
            share={field}
            onPress={() => openEditShare(index)}
            onDelete={() => remove(index)}
          />
        ))}

        {typeof errors.shares?.message === "string" && (
          <Text className="text-xs text-red-500 mb-3">
            {errors.shares.message}
          </Text>
        )}

        <Pressable
          onPress={openAddShare}
          className="h-11 rounded-lg border border-dashed border-gray-300 items-center justify-center mb-6"
        >
          <Text className="text-sm font-medium text-gray-600">
            + Ajouter un partage
          </Text>
        </Pressable>

        <Pressable
          onPress={() => void handleSubmit(onSubmit)()}
          disabled={isBusy}
          className={`h-12 rounded-lg items-center justify-center ${
            isBusy ? "bg-gray-300" : "bg-black"
          }`}
        >
          {isBusy ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <Text className="text-white font-medium">
              Partager le document
            </Text>
          )}
        </Pressable>
      </ScrollView>

      <DocumentShareDialog
        visible={shareDialog.visible}
        initialValues={shareDialog.values}
        isEditing={shareDialog.index !== null}
        onClose={closeShareDialog}
        onSave={saveShare}
      />
    </>
  );
}
