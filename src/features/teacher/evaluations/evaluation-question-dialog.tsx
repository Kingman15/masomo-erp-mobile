import { Toast } from "@/components/toast";
import {
  teachingCourseEvaluationQuestionSchema,
  type TeachingCourseEvaluationQuestionFormValues,
} from "@/utils/schemas/teaching-course-evaluation-schema";
import { zodResolver } from "@hookform/resolvers/zod";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  Modal,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";

type EvaluationQuestionDialogProps = {
  visible: boolean;
  initialValues: TeachingCourseEvaluationQuestionFormValues;
  isEditing: boolean;
  onClose: () => void;
  onSave: (values: TeachingCourseEvaluationQuestionFormValues) => void;
  onDelete?: () => void;
};

export function EvaluationQuestionDialog({
  visible,
  initialValues,
  isEditing,
  onClose,
  onSave,
  onDelete,
}: EvaluationQuestionDialogProps) {
  const {
    control,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<TeachingCourseEvaluationQuestionFormValues>({
    resolver: zodResolver(teachingCourseEvaluationQuestionSchema),
    defaultValues: initialValues,
  });

  const [keywordDraft, setKeywordDraft] = useState("");
  const keywords = watch("correctAnswerKeywords") ?? [];

  useEffect(() => {
    if (visible) {
      reset(initialValues);
      setKeywordDraft("");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible, initialValues]);

  const addKeyword = () => {
    const value = keywordDraft.trim();
    if (!value) return;
    setValue("correctAnswerKeywords", [...keywords, value]);
    setKeywordDraft("");
  };

  const removeKeyword = (index: number) => {
    setValue(
      "correctAnswerKeywords",
      keywords.filter((_, i) => i !== index),
    );
  };

  const onSubmit = (data: TeachingCourseEvaluationQuestionFormValues) => {
    onSave(data);
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View className="flex-1 bg-white">
        <View className="flex-row items-center justify-between px-4 pt-14 pb-3 border-b border-gray-100">
          <Text className="text-base font-semibold">
            {isEditing ? "Modifier la question" : "Ajouter une question"}
          </Text>
          <Pressable onPress={onClose} hitSlop={8}>
            <Ionicons name="close" size={22} color="#374151" />
          </Pressable>
        </View>

        <ScrollView className="flex-1" contentContainerStyle={{ padding: 16 }}>
          <Text className="text-sm font-medium text-gray-700 mb-2">
            N° de question
          </Text>
          <Controller
            control={control}
            name="questionNo"
            render={({ field: { value, onChange } }) => (
              <TextInput
                value={value === undefined || value === null ? "" : String(value)}
                onChangeText={(text) => onChange(text as unknown as number)}
                keyboardType="number-pad"
                placeholder="1"
                placeholderTextColor="#9CA3AF"
                className="h-11 border border-gray-300 rounded-lg px-3 mb-1 bg-white"
              />
            )}
          />
          {errors.questionNo && (
            <Text className="text-xs text-red-500 mb-3">
              {errors.questionNo.message}
            </Text>
          )}

          <Text className="text-sm font-medium text-gray-700 mb-2">Points</Text>
          <Controller
            control={control}
            name="weight"
            render={({ field: { value, onChange } }) => (
              <TextInput
                value={value === undefined || value === null ? "" : String(value)}
                onChangeText={(text) => onChange(text as unknown as number)}
                keyboardType="decimal-pad"
                placeholder="0"
                placeholderTextColor="#9CA3AF"
                className="h-11 border border-gray-300 rounded-lg px-3 mb-1 bg-white"
              />
            )}
          />
          {errors.weight && (
            <Text className="text-xs text-red-500 mb-3">
              {errors.weight.message}
            </Text>
          )}

          <Text className="text-sm font-medium text-gray-700 mb-2">
            Texte de la question
          </Text>
          <Controller
            control={control}
            name="questionText"
            render={({ field: { value, onChange } }) => (
              <TextInput
                value={value}
                onChangeText={onChange}
                multiline
                textAlignVertical="top"
                className="min-h-[80px] border border-gray-300 rounded-lg px-3 py-2 mb-1 bg-white"
              />
            )}
          />
          {errors.questionText && (
            <Text className="text-xs text-red-500 mb-3">
              {errors.questionText.message}
            </Text>
          )}

          <Text className="text-sm font-medium text-gray-700 mb-2">
            Bonne réponse
          </Text>
          <Controller
            control={control}
            name="correctAnswerText"
            render={({ field: { value, onChange } }) => (
              <TextInput
                value={value ?? ""}
                onChangeText={(text) => onChange(text || null)}
                multiline
                textAlignVertical="top"
                placeholder="Réponse attendue (optionnel)"
                placeholderTextColor="#9CA3AF"
                className="min-h-[60px] border border-gray-300 rounded-lg px-3 py-2 mb-3 bg-white"
              />
            )}
          />

          <Text className="text-sm font-medium text-gray-700 mb-2">
            Mots-clés
          </Text>
          <View className="flex-row gap-2 mb-2">
            <TextInput
              value={keywordDraft}
              onChangeText={setKeywordDraft}
              onSubmitEditing={addKeyword}
              placeholder="Ajouter un mot-clé"
              placeholderTextColor="#9CA3AF"
              className="flex-1 h-11 border border-gray-300 rounded-lg px-3 bg-white"
            />
            <Pressable
              onPress={addKeyword}
              className="h-11 px-4 rounded-lg bg-black items-center justify-center"
            >
              <Text className="text-white font-medium">Ajouter</Text>
            </Pressable>
          </View>
          {keywords.length > 0 && (
            <View className="flex-row flex-wrap gap-2 mb-3">
              {keywords.map((keyword, index) => (
                <View
                  key={`${keyword}-${index}`}
                  className="flex-row items-center gap-1 px-3 h-8 rounded-full bg-gray-100"
                >
                  <Text className="text-sm text-gray-700">{keyword}</Text>
                  <Pressable onPress={() => removeKeyword(index)} hitSlop={6}>
                    <Ionicons name="close" size={14} color="#6B7280" />
                  </Pressable>
                </View>
              ))}
            </View>
          )}

          <Text className="text-sm font-medium text-gray-700 mb-2">
            Commentaires
          </Text>
          <Controller
            control={control}
            name="comments"
            render={({ field: { value, onChange } }) => (
              <TextInput
                value={value ?? ""}
                onChangeText={(text) => onChange(text || null)}
                multiline
                textAlignVertical="top"
                className="min-h-[60px] border border-gray-300 rounded-lg px-3 py-2 mb-1 bg-white"
              />
            )}
          />
          {errors.comments && (
            <Text className="text-xs text-red-500 mb-1">
              {errors.comments.message}
            </Text>
          )}

          <View className="flex-row gap-3 mt-6">
            {isEditing && onDelete && (
              <Pressable
                onPress={onDelete}
                className="h-12 px-5 rounded-lg items-center justify-center border border-red-300"
              >
                <Text className="text-red-500 font-medium">Supprimer</Text>
              </Pressable>
            )}
            <Pressable
              onPress={() => void handleSubmit(onSubmit)()}
              className="flex-1 h-12 rounded-lg items-center justify-center bg-black"
            >
              <Text className="text-white font-medium">Enregistrer</Text>
            </Pressable>
          </View>
        </ScrollView>
      </View>
      <Toast />
    </Modal>
  );
}
