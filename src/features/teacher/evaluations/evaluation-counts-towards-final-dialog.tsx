import { CheckboxRow } from "@/components/list/checkbox-row";
import { Toast } from "@/components/toast";
import { useThemeColors } from "@/hooks/use-theme-colors";
import {
  teachingCourseEvaluationCountsTowardsFinalSchema,
  type TeachingCourseEvaluationCountsTowardsFinalFormValues,
} from "@/utils/schemas/teaching-course-evaluation-schema";
import { zodResolver } from "@hookform/resolvers/zod";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  ActivityIndicator,
  Modal,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";

type EvaluationCountsTowardsFinalDialogProps = {
  visible: boolean;
  initialValues: TeachingCourseEvaluationCountsTowardsFinalFormValues;
  isPending: boolean;
  onClose: () => void;
  onSave: (
    values: TeachingCourseEvaluationCountsTowardsFinalFormValues,
  ) => void;
};

export function EvaluationCountsTowardsFinalDialog({
  visible,
  initialValues,
  isPending,
  onClose,
  onSave,
}: EvaluationCountsTowardsFinalDialogProps) {
  const colors = useThemeColors();
  const {
    control,
    handleSubmit,
    watch,
    reset,
    setValue,
    formState: { errors },
  } = useForm<TeachingCourseEvaluationCountsTowardsFinalFormValues>({
    resolver: zodResolver(teachingCourseEvaluationCountsTowardsFinalSchema),
    defaultValues: initialValues,
  });

  const countsTowardsFinal = watch("countsTowardsFinal");

  useEffect(() => {
    if (visible) reset(initialValues);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible, initialValues]);

  const onSubmit = (
    data: TeachingCourseEvaluationCountsTowardsFinalFormValues,
  ) => {
    onSave({
      countsTowardsFinal: data.countsTowardsFinal,
      exclusionReason: data.countsTowardsFinal
        ? null
        : (data.exclusionReason?.trim() ?? null),
    });
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View className="flex-1 bg-background">
        <View className="flex-row items-center justify-between px-4 pt-14 pb-3 border-b border-divider">
          <Text className="text-base font-semibold text-foreground">Compte dans la moyenne</Text>
          <Pressable onPress={onClose} hitSlop={8}>
            <Ionicons name="close" size={22} color={colors.foregroundSecondary} />
          </Pressable>
        </View>

        <View className="p-4">
          <Controller
            control={control}
            name="countsTowardsFinal"
            render={({ field: { value } }) => (
              <CheckboxRow
                label="Compte dans la moyenne"
                value={value}
                onChange={(v) => setValue("countsTowardsFinal", v)}
              />
            )}
          />

          {!countsTowardsFinal && (
            <>
              <Text className="text-sm font-medium text-foreground-secondary mb-2">
                {"Raison de l'exclusion"}
              </Text>
              <Controller
                control={control}
                name="exclusionReason"
                render={({ field: { value, onChange } }) => (
                  <TextInput
                    value={value ?? ""}
                    onChangeText={(text) => onChange(text || null)}
                    multiline
                    textAlignVertical="top"
                    placeholder="Pourquoi cette évaluation ne compte-t-elle pas dans la moyenne ?"
                    placeholderTextColor={colors.faint}
                    className="min-h-[80px] border border-input rounded-lg px-3 py-2 mb-1 bg-card text-foreground"
                  />
                )}
              />
              {errors.exclusionReason && (
                <Text className="text-xs text-red-500 mb-3">
                  {errors.exclusionReason.message}
                </Text>
              )}
            </>
          )}

          <Pressable
            onPress={() => void handleSubmit(onSubmit)()}
            disabled={isPending}
            className={`h-12 rounded-lg items-center justify-center mt-4 ${
              isPending ? "bg-gray-300 dark:bg-zinc-700" : "bg-foreground"
            }`}
          >
            {isPending ? (
              <ActivityIndicator color={colors.background} />
            ) : (
              <Text className="text-background font-medium">Enregistrer</Text>
            )}
          </Pressable>
        </View>
      </View>
      <Toast />
    </Modal>
  );
}
