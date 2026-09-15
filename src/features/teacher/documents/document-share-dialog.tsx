import { ComboBox } from "@/components/list/combo-box";
import { DateField } from "@/components/list/date-field";
import { Toast } from "@/components/toast";
import { useGeneralClasses } from "@/hooks/queries/items/general-class";
import { useOptions } from "@/hooks/queries/items/option";
import { useSchoolClasses } from "@/hooks/queries/items/school-class";
import { useSections } from "@/hooks/queries/items/section";
import {
  documentShareFormSchema,
  type DocumentShareFormValues,
} from "@/utils/schemas/document-schema";
import { zodResolver } from "@hookform/resolvers/zod";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Modal, Pressable, ScrollView, Text, View } from "react-native";
import type { DocumentAudienceType } from "./audience-type-options";
import { AUDIENCE_TYPE_OPTIONS } from "./audience-type-options";

type NamedEntity = {
  id: string;
  title?: string | null;
  abbreviation?: string | null;
  code?: string | null;
};

function labelFor(item: NamedEntity): string {
  return item.title ?? item.abbreviation ?? item.code ?? "N/A";
}

type DocumentShareDialogProps = {
  visible: boolean;
  initialValues: DocumentShareFormValues;
  isEditing: boolean;
  onClose: () => void;
  onSave: (values: DocumentShareFormValues) => void;
};

export function DocumentShareDialog({
  visible,
  initialValues,
  isEditing,
  onClose,
  onSave,
}: DocumentShareDialogProps) {
  const {
    control,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<DocumentShareFormValues>({
    resolver: zodResolver(documentShareFormSchema),
    defaultValues: initialValues,
  });

  const audienceType = watch("audienceType");
  const audienceId = watch("audienceId");
  const publishedAt = watch("publishedAt");

  const [sectionId, setSectionId] = useState<string | null>(null);
  const [optionId, setOptionId] = useState<string | null>(null);
  const [generalClassId, setGeneralClassId] = useState<string | null>(null);

  const { sections, sectionsIsLoading } = useSections();
  const { options, optionsIsLoading } = useOptions({
    filters: { sectionId },
    enabled:
      audienceType === "option" ||
      audienceType === "generalClass" ||
      audienceType === "schoolClass",
  });
  const { generalClasses, generalClassesIsLoading } = useGeneralClasses({
    filters: { sectionId, optionId },
    enabled: audienceType === "generalClass" || audienceType === "schoolClass",
  });
  const { schoolClasses = [], schoolClassesIsLoading } = useSchoolClasses({
    filters: { sectionId, optionId, generalClassId },
    enabled: audienceType === "schoolClass",
  });

  useEffect(() => {
    if (visible) {
      reset(initialValues);
      setSectionId(null);
      setOptionId(null);
      setGeneralClassId(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible, initialValues]);

  const handleAudienceTypeChange = (id: string | null) => {
    setValue("audienceType", (id as DocumentAudienceType) ?? "school");
    setValue("audienceId", null);
    setValue("audienceLabel", null);
    setSectionId(null);
    setOptionId(null);
    setGeneralClassId(null);
  };

  const selectAudience = (item: NamedEntity | undefined, id: string | null) => {
    setValue("audienceId", id);
    setValue("audienceLabel", item ? labelFor(item) : null);
  };

  const onSubmit = (data: DocumentShareFormValues) => {
    onSave(data);
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View className="flex-1 bg-white">
        <View className="flex-row items-center justify-between px-4 pt-14 pb-3 border-b border-gray-100">
          <Text className="text-base font-semibold">
            {isEditing ? "Modifier le partage" : "Ajouter un partage"}
          </Text>
          <Pressable onPress={onClose} hitSlop={8}>
            <Ionicons name="close" size={22} color="#374151" />
          </Pressable>
        </View>

        <ScrollView className="flex-1" contentContainerStyle={{ padding: 16 }}>
          <Controller
            control={control}
            name="audienceType"
            render={({ field: { value } }) => (
              <ComboBox
                label="Audience cible"
                options={AUDIENCE_TYPE_OPTIONS.map((option) => ({
                  id: option.id,
                  label: option.label,
                }))}
                value={value}
                onChange={handleAudienceTypeChange}
              />
            )}
          />

          {(audienceType === "section" ||
            audienceType === "option" ||
            audienceType === "generalClass" ||
            audienceType === "schoolClass") && (
            <ComboBox
              label="Section"
              options={sections.map((section) => ({
                id: section.id,
                label: labelFor(section),
              }))}
              value={audienceType === "section" ? (audienceId ?? null) : sectionId}
              onChange={(id) => {
                if (audienceType === "section") {
                  selectAudience(
                    sections.find((section) => section.id === id),
                    id,
                  );
                } else {
                  setSectionId(id);
                  setOptionId(null);
                  setGeneralClassId(null);
                  setValue("audienceId", null);
                  setValue("audienceLabel", null);
                }
              }}
              loading={sectionsIsLoading}
            />
          )}

          {(audienceType === "option" ||
            audienceType === "generalClass" ||
            audienceType === "schoolClass") && (
            <ComboBox
              label="Option"
              options={options.map((option) => ({
                id: option.id,
                label: labelFor(option),
              }))}
              value={audienceType === "option" ? (audienceId ?? null) : optionId}
              onChange={(id) => {
                if (audienceType === "option") {
                  selectAudience(
                    options.find((option) => option.id === id),
                    id,
                  );
                } else {
                  setOptionId(id);
                  setGeneralClassId(null);
                  setValue("audienceId", null);
                  setValue("audienceLabel", null);
                }
              }}
              loading={optionsIsLoading}
            />
          )}

          {(audienceType === "generalClass" || audienceType === "schoolClass") && (
            <ComboBox
              label="Classe générale"
              options={generalClasses.map((generalClass) => ({
                id: generalClass.id,
                label: labelFor(generalClass),
              }))}
              value={
                audienceType === "generalClass" ? (audienceId ?? null) : generalClassId
              }
              onChange={(id) => {
                if (audienceType === "generalClass") {
                  selectAudience(
                    generalClasses.find((generalClass) => generalClass.id === id),
                    id,
                  );
                } else {
                  setGeneralClassId(id);
                  setValue("audienceId", null);
                  setValue("audienceLabel", null);
                }
              }}
              loading={generalClassesIsLoading}
            />
          )}

          {audienceType === "schoolClass" && (
            <ComboBox
              label="Classe scolaire"
              options={schoolClasses.map((schoolClass) => ({
                id: schoolClass.id,
                label: labelFor(schoolClass),
              }))}
              value={audienceId ?? null}
              onChange={(id) =>
                selectAudience(
                  schoolClasses.find((schoolClass) => schoolClass.id === id),
                  id,
                )
              }
              loading={schoolClassesIsLoading}
            />
          )}

          {errors.audienceId && (
            <Text className="text-xs text-red-500 -mt-3 mb-3">
              {errors.audienceId.message}
            </Text>
          )}

          <Controller
            control={control}
            name="publishedAt"
            render={({ field: { value, onChange } }) => (
              <DateField
                label="Date de publication"
                placeholder="Non publié"
                value={value ?? null}
                onChange={onChange}
              />
            )}
          />

          <View className="mt-4" />

          <Controller
            control={control}
            name="expiresAt"
            render={({ field: { value, onChange } }) => (
              <DateField
                label="Date d'expiration"
                placeholder="Sans expiration"
                value={value ?? null}
                onChange={onChange}
                minimumDate={publishedAt ? new Date(publishedAt) : undefined}
              />
            )}
          />
          {errors.expiresAt && (
            <Text className="text-xs text-red-500 mt-1 mb-3">
              {errors.expiresAt.message}
            </Text>
          )}

          <Pressable
            onPress={() => void handleSubmit(onSubmit)()}
            className="h-12 rounded-lg items-center justify-center bg-black mt-6"
          >
            <Text className="text-white font-medium">Enregistrer</Text>
          </Pressable>
        </ScrollView>
      </View>
      <Toast />
    </Modal>
  );
}
