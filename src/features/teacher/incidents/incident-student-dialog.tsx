import { StudentPicker } from "@/components/list/student-picker";
import { ChipSelect } from "@/components/list/chip-select";
import { Toast } from "@/components/toast";
import { useThemeColors } from "@/hooks/use-theme-colors";
import {
  incidentStudentFormSchema,
  type IncidentStudentFormValues,
} from "@/utils/schemas/teacher-student-incident-schema";
import {
  INCIDENT_STUDENT_ROLES,
  INCIDENT_STUDENT_ROLE_LABELS,
} from "@/utils/types/IncidentStudent";
import { zodResolver } from "@hookform/resolvers/zod";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { Modal, Pressable, ScrollView, Text, TextInput, View } from "react-native";

type IncidentStudentDialogProps = {
  visible: boolean;
  initialValues: IncidentStudentFormValues;
  isEditing: boolean;
  schoolYearId?: string | null;
  onClose: () => void;
  onSave: (values: IncidentStudentFormValues) => void;
};

export function IncidentStudentDialog({
  visible,
  initialValues,
  isEditing,
  schoolYearId,
  onClose,
  onSave,
}: IncidentStudentDialogProps) {
  const colors = useThemeColors();
  const {
    control,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<IncidentStudentFormValues>({
    resolver: zodResolver(incidentStudentFormSchema),
    defaultValues: initialValues,
  });

  const studentId = watch("studentId");
  const studentLabel = watch("studentLabel");

  useEffect(() => {
    if (visible) {
      reset(initialValues);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible, initialValues]);

  const onSubmit = (data: IncidentStudentFormValues) => {
    onSave(data);
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View className="flex-1 bg-background">
        <View className="flex-row items-center justify-between px-4 pt-14 pb-3 border-b border-divider">
          <Text className="text-base font-semibold text-foreground">
            {isEditing ? "Modifier l'élève" : "Ajouter un élève"}
          </Text>
          <Pressable onPress={onClose} hitSlop={8}>
            <Ionicons name="close" size={22} color={colors.foregroundSecondary} />
          </Pressable>
        </View>

        <ScrollView className="flex-1" contentContainerStyle={{ padding: 16 }}>
          <StudentPicker
            label="Élève"
            value={studentId ? { id: studentId, fullDesignation: studentLabel ?? null } : null}
            onChange={(student) => {
              setValue("studentId", student?.id ?? "");
              setValue("studentLabel", student?.fullDesignation ?? null);
            }}
            schoolYearId={schoolYearId}
          />
          {errors.studentId && (
            <Text className="text-xs text-red-500 -mt-3 mb-3">
              {errors.studentId.message}
            </Text>
          )}

          <Controller
            control={control}
            name="role"
            render={({ field: { value, onChange } }) => (
              <ChipSelect
                label="Rôle"
                options={INCIDENT_STUDENT_ROLES.map((role) => ({
                  id: role,
                  label: INCIDENT_STUDENT_ROLE_LABELS[role],
                }))}
                value={value}
                onChange={(id) => onChange(id ?? "involved")}
              />
            )}
          />
          {errors.role && (
            <Text className="text-xs text-red-500 -mt-3 mb-3">
              {errors.role.message}
            </Text>
          )}

          <Text className="text-sm font-medium text-foreground-secondary mb-2">Notes</Text>
          <Controller
            control={control}
            name="notes"
            render={({ field: { value, onChange } }) => (
              <TextInput
                value={value ?? ""}
                onChangeText={(text) => onChange(text || null)}
                multiline
                textAlignVertical="top"
                placeholder="Notes (optionnel)"
                placeholderTextColor={colors.faint}
                className="min-h-[80px] border border-input rounded-lg px-3 py-2 mb-1 bg-card text-foreground"
              />
            )}
          />
          {errors.notes && (
            <Text className="text-xs text-red-500 mb-3">
              {errors.notes.message}
            </Text>
          )}

          <Pressable
            onPress={() => void handleSubmit(onSubmit)()}
            className="h-12 rounded-lg items-center justify-center bg-foreground mt-6"
          >
            <Text className="text-background font-medium">Enregistrer</Text>
          </Pressable>
        </ScrollView>
      </View>
      <Toast />
    </Modal>
  );
}
