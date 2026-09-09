import { CheckboxRow } from "@/components/list/checkbox-row";
import { ComboBox } from "@/components/list/combo-box";
import { DateField } from "@/components/list/date-field";
import { useFollowedCourses } from "@/hooks/queries/items/course";
import { useEvaluationPeriods } from "@/hooks/queries/items/evaluation-period";
import { useSchoolClasses } from "@/hooks/queries/items/school-class";
import {
  useCurrentSchoolYear,
  useSchoolYears,
} from "@/hooks/queries/items/school-year";
import {
  useCreateTeachingCourseEvaluation,
  useDeleteTeachingCourseEvaluation,
  usePublishTeachingCourseEvaluation,
  useTeachingCourseEvaluationById,
  useUpdateTeachingCourseEvaluation,
  useUpdateTeachingCourseEvaluationCountsTowardsFinal,
} from "@/hooks/queries/items/teaching-course-evaluation";
import { useTeachingCourseEvaluationTypes } from "@/hooks/queries/items/teaching-course-evaluation-type";
import { useConfirm } from "@/hooks/use-confirm";
import { handleApiError } from "@/lib/handle-api-error";
import { toastNotify } from "@/lib/toast";
import {
  teachingCourseEvaluationSchema,
  type TeachingCourseEvaluationCountsTowardsFinalFormValues,
  type TeachingCourseEvaluationFormValues,
  type TeachingCourseEvaluationPublishFormValues,
  type TeachingCourseEvaluationQuestionFormValues,
} from "@/utils/schemas/teaching-course-evaluation-schema";
import type { TeachingCourseEvaluationQuestion } from "@/utils/types/TeachingCourseEvaluationQuestion";
import Ionicons from "@expo/vector-icons/Ionicons";
import { zodResolver } from "@hookform/resolvers/zod";
import { router, Stack } from "expo-router";
import { useEffect, useState } from "react";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { EvaluationCountsTowardsFinalDialog } from "./evaluation-counts-towards-final-dialog";
import { EvaluationDocumentsSection } from "./evaluation-documents-section";
import { EvaluationPublishDialog } from "./evaluation-publish-dialog";
import { EvaluationQuestionDialog } from "./evaluation-question-dialog";
import { EvaluationQuestionRow } from "./evaluation-question-row";
import { EvaluationScoringDialog } from "./evaluation-scoring-dialog";

type EvaluationFormScreenProps = {
  evaluationId?: string;
};

function toDateOnly(value: Date | string) {
  const date = new Date(value);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function createTempId() {
  return `${Date.now().toString(36)}${Math.random().toString(36).slice(2)}`;
}

function emptyQuestion(
  questionNo: number,
): TeachingCourseEvaluationQuestionFormValues {
  return {
    id: null,
    tempId: createTempId(),
    isDeleted: false,
    questionNo,
    questionType: "text",
    questionText: "",
    weight: 0,
    correctAnswerText: null,
    correctAnswerKeywords: [],
    comments: null,
  };
}

function mapQuestionToFormValues(
  question: TeachingCourseEvaluationQuestion,
): TeachingCourseEvaluationQuestionFormValues {
  const correctAnswer = question.correctAnswer as {
    answerText?: string | null;
    keywords?: string[] | null;
  } | null;

  return {
    id: question.id,
    tempId: createTempId(),
    isDeleted: false,
    questionNo: question.questionNo,
    questionType: "text",
    questionText: question.questionText ?? "",
    weight: question.weight ?? 0,
    correctAnswerText: correctAnswer?.answerText ?? null,
    correctAnswerKeywords: correctAnswer?.keywords ?? [],
    comments: question.comments ?? null,
  };
}

export function EvaluationFormScreen({
  evaluationId,
}: EvaluationFormScreenProps) {
  const isEditing = Boolean(evaluationId);

  const {
    teachingCourseEvaluation,
    teachingCourseEvaluationIsLoading,
    teachingCourseEvaluationError,
  } = useTeachingCourseEvaluationById(evaluationId);

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    resetField,
    reset,
    setError,
    formState: { errors, dirtyFields, isSubmitting },
  } = useForm<TeachingCourseEvaluationFormValues>({
    resolver: zodResolver(teachingCourseEvaluationSchema),
    defaultValues: {
      evaluationDate: toDateOnly(new Date()),
      dueDate: null,
      wording: "",
      comments: null,
      questions: [],
      isVisibleToGuardians: false,
      isVisibleToStudents: false,
      countsTowardsFinal: true,
      publish: false,
    },
  });

  const { fields, append, remove, update } = useFieldArray({
    control,
    name: "questions",
    keyName: "fieldKey",
  });

  const schoolYearId = watch("schoolYearId");
  const schoolClassId = watch("schoolClassId");
  const courseId = watch("courseId");
  const evaluationTypeId = watch("evaluationTypeId");
  const weight = watch("weight") as unknown as string | number | undefined;

  const { schoolYears, schoolYearsIsLoading } = useSchoolYears();
  const { currentSchoolYear } = useCurrentSchoolYear({ enabled: !isEditing });

  const { schoolClasses, schoolClassesIsLoading } = useSchoolClasses({
    filters: { schoolYearId },
  });

  const { courses, coursesIsLoading } = useFollowedCourses({
    schoolYearId,
    schoolClassId,
    teacherId: null,
  });

  const { evaluationPeriods, evaluationPeriodsIsLoading } =
    useEvaluationPeriods();
  const {
    teachingCourseEvaluationTypes,
    teachingCourseEvaluationTypesIsLoading,
  } = useTeachingCourseEvaluationTypes();

  // --- Chargement en édition ---

  useEffect(() => {
    if (!teachingCourseEvaluation) return;

    reset({
      schoolYearId:
        teachingCourseEvaluation.teachingCourse?.followCourse?.schoolYearId ??
        undefined,
      schoolClassId:
        teachingCourseEvaluation.teachingCourse?.schoolClassId ?? undefined,
      courseId:
        teachingCourseEvaluation.teachingCourse?.followCourse?.courseId ??
        undefined,
      evaluationTypeId: teachingCourseEvaluation.evaluationTypeId ?? undefined,
      evaluationPeriodId:
        teachingCourseEvaluation.evaluationPeriodId ?? undefined,
      weight: teachingCourseEvaluation.weight ?? undefined,
      maxScore: teachingCourseEvaluation.maxScore ?? undefined,
      evaluationDate: teachingCourseEvaluation.evaluationDate
        ? toDateOnly(teachingCourseEvaluation.evaluationDate)
        : "",
      dueDate: teachingCourseEvaluation.dueDate
        ? toDateOnly(teachingCourseEvaluation.dueDate)
        : null,
      wording: teachingCourseEvaluation.wording ?? "",
      comments: teachingCourseEvaluation.comments ?? null,
      isVisibleToGuardians:
        teachingCourseEvaluation.isVisibleToGuardians ?? false,
      isVisibleToStudents:
        teachingCourseEvaluation.isVisibleToStudents ?? false,
      countsTowardsFinal: teachingCourseEvaluation.countsTowardsFinal ?? true,
      publish: false,
      questions: (teachingCourseEvaluation.questions ?? []).map(
        mapQuestionToFormValues,
      ),
    });
  }, [teachingCourseEvaluation, reset]);

  // --- Auto-remplissages, création uniquement ---

  useEffect(() => {
    if (isEditing) return;
    if (currentSchoolYear?.id) setValue("schoolYearId", currentSchoolYear.id);
  }, [currentSchoolYear, isEditing, setValue]);

  useEffect(() => {
    if (isEditing) return;
    if (!schoolClassId && schoolClasses?.length === 1) {
      setValue("schoolClassId", schoolClasses[0].id);
    }
  }, [schoolClasses, schoolClassId, isEditing, setValue]);

  useEffect(() => {
    if (isEditing) return;
    if (!courseId && courses?.length === 1) {
      setValue("courseId", courses[0].id);
    }
  }, [courses, courseId, isEditing, setValue]);

  useEffect(() => {
    if (isEditing) return;
    if (dirtyFields.maxScore) return;
    if (weight === undefined || weight === null || weight === "") {
      resetField("maxScore");
      return;
    }
    setValue("maxScore", weight as unknown as number);
  }, [weight, dirtyFields.maxScore, isEditing, setValue, resetField]);

  useEffect(() => {
    if (isEditing) return;
    if (dirtyFields.wording) return;

    const type = teachingCourseEvaluationTypes?.find(
      (t) => t.id === evaluationTypeId,
    );
    const course = courses?.find((c) => c.id === courseId);
    const schoolClass = schoolClasses?.find((c) => c.id === schoolClassId);

    const parts = [
      type?.abbreviation ?? type?.name ?? null,
      course?.name ?? null,
      schoolClass?.abbreviation ?? schoolClass?.title ?? null,
    ].filter((part): part is string => Boolean(part));

    const generated = parts.join(" - ");
    if (generated) {
      setValue("wording", generated);
    } else {
      resetField("wording");
    }
  }, [
    evaluationTypeId,
    courseId,
    schoolClassId,
    teachingCourseEvaluationTypes,
    courses,
    schoolClasses,
    dirtyFields.wording,
    isEditing,
    setValue,
    resetField,
  ]);

  useEffect(() => {
    if (isEditing) return;

    const type = teachingCourseEvaluationTypes?.find(
      (t) => t.id === evaluationTypeId,
    );
    if (!type) return;

    setValue("countsTowardsFinal", type.defaultCountsTowardsFinal ?? true);

    if (!dirtyFields.isVisibleToGuardians) {
      setValue("isVisibleToGuardians", type.defaultGuardianVisibility ?? false);
    }
    if (!dirtyFields.isVisibleToStudents) {
      setValue("isVisibleToStudents", type.defaultStudentVisibility ?? false);
    }
  }, [
    evaluationTypeId,
    teachingCourseEvaluationTypes,
    dirtyFields.isVisibleToGuardians,
    dirtyFields.isVisibleToStudents,
    isEditing,
    setValue,
  ]);

  // --- Questions ---

  const { confirm, ConfirmDialog } = useConfirm();

  const [questionDialog, setQuestionDialog] = useState<{
    visible: boolean;
    index: number | null;
    values: TeachingCourseEvaluationQuestionFormValues;
  }>({ visible: false, index: null, values: emptyQuestion(1) });

  const openAddQuestion = () => {
    const nextNo =
      fields.length > 0
        ? Math.max(...fields.map((f) => Number(f.questionNo) || 0)) + 1
        : 1;
    setQuestionDialog({
      visible: true,
      index: null,
      values: emptyQuestion(nextNo),
    });
  };

  const openEditQuestion = (index: number) => {
    setQuestionDialog({ visible: true, index, values: fields[index] });
  };

  const closeQuestionDialog = () => {
    setQuestionDialog((state) => ({ ...state, visible: false }));
  };

  const saveQuestion = (values: TeachingCourseEvaluationQuestionFormValues) => {
    if (questionDialog.index === null) {
      append(values);
    } else {
      update(questionDialog.index, values);
    }
    closeQuestionDialog();
  };

  const deleteQuestion = async (index: number) => {
    const question = fields[index];
    if (question.id) {
      const ok = await confirm({
        title: "Supprimer la question",
        description:
          "La suppression d'une question est irréversible. Continuer ?",
        confirmText: "Supprimer",
        variant: "destructive",
      });
      if (!ok) return;
      update(index, { ...question, isDeleted: true });
    } else {
      remove(index);
    }
  };

  const restoreQuestion = (index: number) => {
    update(index, { ...fields[index], isDeleted: false });
  };

  // --- Publication ---

  const [publishDialogOpen, setPublishDialogOpen] = useState(false);
  const { publishTeachingCourseEvaluation, publishTeachingCourseEvaluationIsPending } =
    usePublishTeachingCourseEvaluation(evaluationId);

  const handlePublish = async (
    values: TeachingCourseEvaluationPublishFormValues,
  ) => {
    try {
      await publishTeachingCourseEvaluation(values);
      toastNotify("Évaluation publiée avec succès.", "success");
      setPublishDialogOpen(false);
    } catch (error) {
      handleApiError(error);
    }
  };

  // --- Résultats (cotation) ---

  const [scoringDialogOpen, setScoringDialogOpen] = useState(false);

  // --- Compte dans la moyenne ---

  const [countsDialogOpen, setCountsDialogOpen] = useState(false);
  const {
    updateTeachingCourseEvaluationCountsTowardsFinal,
    updateTeachingCourseEvaluationCountsTowardsFinalIsPending,
  } = useUpdateTeachingCourseEvaluationCountsTowardsFinal(evaluationId);

  const handleSaveCountsTowardsFinal = async (
    values: TeachingCourseEvaluationCountsTowardsFinalFormValues,
  ) => {
    try {
      await updateTeachingCourseEvaluationCountsTowardsFinal(values);
      toastNotify("Mis à jour avec succès.", "success");
      setCountsDialogOpen(false);
    } catch (error) {
      handleApiError(error);
    }
  };

  // --- Suppression ---

  const {
    deleteTeachingCourseEvaluation,
    deleteTeachingCourseEvaluationIsPending,
  } = useDeleteTeachingCourseEvaluation();

  const handleDeleteEvaluation = async () => {
    if (!evaluationId) return;

    const ok = await confirm({
      title: "Supprimer l'évaluation",
      description: "Cette action est irréversible. Continuer ?",
      confirmText: "Supprimer",
      variant: "destructive",
    });
    if (!ok) return;

    try {
      await deleteTeachingCourseEvaluation(evaluationId);
      toastNotify("Évaluation supprimée avec succès.", "success");
      router.back();
    } catch (error) {
      handleApiError(error);
    }
  };

  // --- Soumission ---

  const {
    createTeachingCourseEvaluation,
    createTeachingCourseEvaluationIsPending,
  } = useCreateTeachingCourseEvaluation();
  const {
    updateTeachingCourseEvaluation,
    updateTeachingCourseEvaluationIsPending,
  } = useUpdateTeachingCourseEvaluation(evaluationId);

  const isBusy =
    createTeachingCourseEvaluationIsPending ||
    updateTeachingCourseEvaluationIsPending ||
    isSubmitting;

  const onSubmit = async (data: TeachingCourseEvaluationFormValues) => {
    try {
      if (isEditing) {
        await updateTeachingCourseEvaluation(data);
      } else {
        await createTeachingCourseEvaluation(data);
      }

      toastNotify(
        isEditing
          ? "Évaluation modifiée avec succès."
          : "Évaluation créée avec succès.",
        "success",
      );
      router.back();
    } catch (error) {
      handleApiError(error, {
        setFieldError: (field, message) =>
          setError(field as keyof TeachingCourseEvaluationFormValues, {
            message,
          }),
      });
    }
  };

  if (isEditing && teachingCourseEvaluationIsLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator />
      </View>
    );
  }

  if (isEditing && teachingCourseEvaluationError) {
    return (
      <View className="flex-1 items-center justify-center px-6 bg-white">
        <Text className="text-sm text-gray-500 text-center">
          {"Impossible de charger l'évaluation."}
        </Text>
      </View>
    );
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: isEditing ? "Modifier l'évaluation" : "Ajouter une évaluation",
        }}
      />

      <ScrollView
        className="flex-1 bg-white"
        contentContainerStyle={{ padding: 16 }}
      >
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
              value={value}
              onChange={() => {}}
              loading={schoolYearsIsLoading}
              disabled
            />
          )}
        />

        <Controller
          control={control}
          name="schoolClassId"
          render={({ field: { value, onChange } }) => (
            <ComboBox
              label="Classe"
              placeholder="Sélectionner une classe"
              options={(schoolClasses ?? []).map((schoolClass) => ({
                id: schoolClass.id,
                label:
                  schoolClass.title ?? schoolClass.abbreviation ?? "Classe",
              }))}
              value={value}
              onChange={(id) => {
                onChange(id);
                setValue("courseId", "");
              }}
              loading={schoolClassesIsLoading}
              disabled={isEditing}
              emptyLabel="Sélectionnez une année scolaire"
            />
          )}
        />
        {errors.schoolClassId && (
          <Text className="text-xs text-red-500 mb-3">
            {errors.schoolClassId.message}
          </Text>
        )}

        <Controller
          control={control}
          name="courseId"
          render={({ field: { value, onChange } }) => (
            <ComboBox
              label="Cours"
              placeholder="Sélectionner un cours"
              options={(courses ?? []).map((course) => ({
                id: course.id,
                label: course.shortName ?? course.name,
              }))}
              value={value}
              onChange={onChange}
              loading={coursesIsLoading}
              disabled={isEditing}
              emptyLabel="Sélectionnez une classe"
            />
          )}
        />
        {errors.courseId && (
          <Text className="text-xs text-red-500 mb-3">
            {errors.courseId.message}
          </Text>
        )}

        <Controller
          control={control}
          name="evaluationTypeId"
          render={({ field: { value, onChange } }) => (
            <ComboBox
              label="Type d'évaluation"
              placeholder="Sélectionner un type"
              options={(teachingCourseEvaluationTypes ?? []).map((type) => ({
                id: type.id,
                label: type.name,
              }))}
              value={value}
              onChange={onChange}
              loading={teachingCourseEvaluationTypesIsLoading}
            />
          )}
        />
        {errors.evaluationTypeId && (
          <Text className="text-xs text-red-500 mb-3">
            {errors.evaluationTypeId.message}
          </Text>
        )}

        <Controller
          control={control}
          name="evaluationPeriodId"
          render={({ field: { value, onChange } }) => (
            <ComboBox
              label="Période d'évaluation"
              placeholder="Sélectionner une période"
              options={(evaluationPeriods ?? []).map((period) => ({
                id: period.id,
                label: period.name,
              }))}
              value={value}
              onChange={onChange}
              loading={evaluationPeriodsIsLoading}
            />
          )}
        />
        {errors.evaluationPeriodId && (
          <Text className="text-xs text-red-500 mb-3">
            {errors.evaluationPeriodId.message}
          </Text>
        )}

        <View className="flex-row gap-3">
          <Controller
            control={control}
            name="evaluationDate"
            render={({ field: { value, onChange } }) => (
              <DateField
                label="Date d'évaluation"
                value={value}
                onChange={(v) => onChange(v ?? "")}
              />
            )}
          />
          <Controller
            control={control}
            name="dueDate"
            render={({ field: { value, onChange } }) => (
              <DateField
                label="Date limite"
                value={value}
                onChange={onChange}
              />
            )}
          />
        </View>
        {errors.evaluationDate && (
          <Text className="text-xs text-red-500 mt-1 mb-3">
            {errors.evaluationDate.message}
          </Text>
        )}

        {isEditing && teachingCourseEvaluation && (
          <View className="mb-4 px-3 py-3 rounded-lg bg-gray-50">
            <Text className="text-xs text-gray-500">
              {teachingCourseEvaluation.publishedAt
                ? `Publiée le ${new Date(
                    teachingCourseEvaluation.publishedAt,
                  ).toLocaleDateString("fr-FR")}${
                    teachingCourseEvaluation.publishedByUser?.name
                      ? ` par ${teachingCourseEvaluation.publishedByUser.name}`
                      : ""
                  }`
                : "Non publiée"}
            </Text>
          </View>
        )}

        {isEditing && teachingCourseEvaluation && (
          <View className="mb-4 px-3 py-3 rounded-lg bg-gray-50">
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center gap-2">
                <Ionicons
                  name={
                    teachingCourseEvaluation.countsTowardsFinal
                      ? "checkbox"
                      : "square-outline"
                  }
                  size={18}
                  color={
                    teachingCourseEvaluation.countsTowardsFinal
                      ? "#000000"
                      : "#9CA3AF"
                  }
                />
                <Text className="text-sm text-gray-700">
                  Compte dans la moyenne
                </Text>
              </View>
              <Pressable onPress={() => setCountsDialogOpen(true)}>
                <Text className="text-sm font-medium text-black">
                  Modifier
                </Text>
              </Pressable>
            </View>

            {!teachingCourseEvaluation.countsTowardsFinal && (
              <View className="mt-2 gap-0.5">
                {teachingCourseEvaluation.exclusionReason && (
                  <Text className="text-xs text-gray-500">
                    {`Motif : ${teachingCourseEvaluation.exclusionReason}`}
                  </Text>
                )}
                {teachingCourseEvaluation.excludedAt && (
                  <Text className="text-xs text-gray-400">
                    {`Exclue le ${new Date(
                      teachingCourseEvaluation.excludedAt,
                    ).toLocaleDateString("fr-FR")}${
                      teachingCourseEvaluation.excludedByUser?.name
                        ? ` par ${teachingCourseEvaluation.excludedByUser.name}`
                        : ""
                    }`}
                  </Text>
                )}
              </View>
            )}
          </View>
        )}

        <View className="flex-row gap-3">
          <View className="flex-1">
            <Text className="text-sm font-medium text-gray-700 mb-2">
              Pondération
            </Text>
            <Controller
              control={control}
              name="weight"
              render={({ field: { value, onChange } }) => (
                <TextInput
                  value={
                    value === undefined || value === null ? "" : String(value)
                  }
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
          </View>

          <View className="flex-1">
            <Text className="text-sm font-medium text-gray-700 mb-2">
              Noté sur
            </Text>
            <Controller
              control={control}
              name="maxScore"
              render={({ field: { value, onChange } }) => (
                <TextInput
                  value={
                    value === undefined || value === null ? "" : String(value)
                  }
                  onChangeText={(text) => onChange(text as unknown as number)}
                  keyboardType="decimal-pad"
                  placeholder="0"
                  placeholderTextColor="#9CA3AF"
                  className="h-11 border border-gray-300 rounded-lg px-3 mb-1 bg-white"
                />
              )}
            />
            {errors.maxScore && (
              <Text className="text-xs text-red-500 mb-3">
                {errors.maxScore.message}
              </Text>
            )}
          </View>
        </View>

        <Text className="text-sm font-medium text-gray-700 mb-2">Libellé</Text>
        <Controller
          control={control}
          name="wording"
          render={({ field: { value, onChange } }) => (
            <TextInput
              value={value}
              onChangeText={onChange}
              placeholder="Libellé de l'évaluation"
              placeholderTextColor="#9CA3AF"
              className="h-11 border border-gray-300 rounded-lg px-3 mb-1 bg-white"
            />
          )}
        />
        {errors.wording && (
          <Text className="text-xs text-red-500 mb-3">
            {errors.wording.message}
          </Text>
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
              className="min-h-[80px] border border-gray-300 rounded-lg px-3 py-2 mb-4 bg-white"
            />
          )}
        />
        {errors.comments && (
          <Text className="text-xs text-red-500 mb-3">
            {errors.comments.message}
          </Text>
        )}

        <Controller
          control={control}
          name="isVisibleToGuardians"
          render={({ field: { value, onChange } }) => (
            <CheckboxRow
              label="Visible par les tuteurs"
              value={value}
              onChange={onChange}
            />
          )}
        />
        <Controller
          control={control}
          name="isVisibleToStudents"
          render={({ field: { value, onChange } }) => (
            <CheckboxRow
              label="Visible par les élèves"
              value={value}
              onChange={onChange}
            />
          )}
        />
        {!isEditing && (
          <Controller
            control={control}
            name="publish"
            render={({ field: { value, onChange } }) => (
              <CheckboxRow
                label="Publier immédiatement"
                value={Boolean(value)}
                onChange={onChange}
              />
            )}
          />
        )}

        <Text className="text-base font-semibold text-black mt-2 mb-3">
          Questions
        </Text>

        {fields.map((field, index) => (
          <EvaluationQuestionRow
            key={field.fieldKey}
            question={field}
            errorMessage={errors.questions?.[index]?.questionNo?.message}
            onPress={() => openEditQuestion(index)}
            onDelete={() => void deleteQuestion(index)}
            onRestore={() => restoreQuestion(index)}
          />
        ))}

        {typeof errors.questions?.message === "string" && (
          <Text className="text-xs text-red-500 mb-3">
            {errors.questions.message}
          </Text>
        )}

        <Pressable
          onPress={openAddQuestion}
          className="h-11 rounded-lg border border-dashed border-gray-300 items-center justify-center mb-6"
        >
          <Text className="text-sm font-medium text-gray-600">
            + Ajouter une question
          </Text>
        </Pressable>

        {isEditing && evaluationId && (
          <EvaluationDocumentsSection evaluationId={evaluationId} />
        )}

        {isEditing && teachingCourseEvaluation && (
          <View className="mb-6">
            <Text className="text-base font-semibold text-black mb-3">
              Résultats
            </Text>
            <Pressable
              onPress={() => setScoringDialogOpen(true)}
              className="h-11 rounded-lg border border-gray-300 items-center justify-center flex-row gap-2"
            >
              <Ionicons name="create-outline" size={16} color="#000000" />
              <Text className="text-sm font-medium text-black">
                Saisir les notes
              </Text>
            </Pressable>
          </View>
        )}

        {isEditing && !teachingCourseEvaluation?.publishedAt && (
          <Pressable
            onPress={() => setPublishDialogOpen(true)}
            className="h-12 rounded-lg items-center justify-center border border-gray-300 mb-3"
          >
            <Text className="text-black font-medium">Publier</Text>
          </Pressable>
        )}

        <View className="flex-row gap-3">
          {isEditing && (
            <Pressable
              onPress={() => void handleDeleteEvaluation()}
              disabled={deleteTeachingCourseEvaluationIsPending}
              className="w-12 h-12 rounded-lg items-center justify-center border border-red-300"
            >
              <Ionicons name="trash-outline" size={20} color="#EF4444" />
            </Pressable>
          )}

          <Pressable
            onPress={() => void handleSubmit(onSubmit)()}
            disabled={isBusy}
            className={`flex-1 h-12 rounded-lg items-center justify-center ${
              isBusy ? "bg-gray-300" : "bg-black"
            }`}
          >
            {isBusy ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text className="text-white font-medium">
                {isEditing ? "Enregistrer" : "Créer"}
              </Text>
            )}
          </Pressable>
        </View>
      </ScrollView>

      <EvaluationQuestionDialog
        visible={questionDialog.visible}
        initialValues={questionDialog.values}
        isEditing={questionDialog.index !== null}
        onClose={closeQuestionDialog}
        onSave={saveQuestion}
        onDelete={
          questionDialog.index !== null
            ? () => {
                const index = questionDialog.index as number;
                closeQuestionDialog();
                void deleteQuestion(index);
              }
            : undefined
        }
      />

      <EvaluationPublishDialog
        visible={publishDialogOpen}
        isPending={publishTeachingCourseEvaluationIsPending}
        onClose={() => setPublishDialogOpen(false)}
        onPublish={(values) => void handlePublish(values)}
      />

      <EvaluationCountsTowardsFinalDialog
        visible={countsDialogOpen}
        isPending={updateTeachingCourseEvaluationCountsTowardsFinalIsPending}
        initialValues={{
          countsTowardsFinal:
            teachingCourseEvaluation?.countsTowardsFinal ?? true,
          exclusionReason: teachingCourseEvaluation?.exclusionReason ?? null,
        }}
        onClose={() => setCountsDialogOpen(false)}
        onSave={(values) => void handleSaveCountsTowardsFinal(values)}
      />

      {scoringDialogOpen && evaluationId && teachingCourseEvaluation && (
        <EvaluationScoringDialog
          evaluationId={evaluationId}
          evaluation={teachingCourseEvaluation}
          onClose={() => setScoringDialogOpen(false)}
        />
      )}

      <ConfirmDialog />
    </>
  );
}
