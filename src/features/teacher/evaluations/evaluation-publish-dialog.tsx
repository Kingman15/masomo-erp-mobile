import { DateField } from "@/components/list/date-field";
import {
  teachingCourseEvaluationPublishSchema,
  type TeachingCourseEvaluationPublishFormValues,
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
  View,
} from "react-native";

type EvaluationPublishDialogProps = {
  visible: boolean;
  isPending: boolean;
  onClose: () => void;
  onPublish: (values: TeachingCourseEvaluationPublishFormValues) => void;
};

export function EvaluationPublishDialog({
  visible,
  isPending,
  onClose,
  onPublish,
}: EvaluationPublishDialogProps) {
  const { control, handleSubmit, reset } =
    useForm<TeachingCourseEvaluationPublishFormValues>({
      resolver: zodResolver(teachingCourseEvaluationPublishSchema),
      defaultValues: { dueDate: null },
    });

  useEffect(() => {
    if (visible) reset({ dueDate: null });
  }, [visible, reset]);

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View className="flex-1 bg-white">
        <View className="flex-row items-center justify-between px-4 pt-14 pb-3 border-b border-gray-100">
          <Text className="text-base font-semibold">
            {"Publier l'évaluation"}
          </Text>
          <Pressable onPress={onClose} hitSlop={8}>
            <Ionicons name="close" size={22} color="#374151" />
          </Pressable>
        </View>

        <View className="p-4">
          <Text className="text-sm text-gray-600 mb-4">
            {
              "Une fois publiée, l'évaluation devient visible selon les paramètres de visibilité configurés."
            }
          </Text>

          <Controller
            control={control}
            name="dueDate"
            render={({ field: { value, onChange } }) => (
              <DateField
                label="Date limite (optionnel)"
                value={value}
                onChange={onChange}
              />
            )}
          />

          <Pressable
            onPress={() => void handleSubmit(onPublish)()}
            disabled={isPending}
            className={`h-12 rounded-lg items-center justify-center mt-6 ${
              isPending ? "bg-gray-300" : "bg-black"
            }`}
          >
            {isPending ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text className="text-white font-medium">Publier</Text>
            )}
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}
