import { ComboBox } from "@/components/list/combo-box";
import { DateField } from "@/components/list/date-field";
import { TimeField } from "@/components/list/time-field";
import { lessonTimesFromWeeklySchedule } from "@/features/staff/schedule/weekly-schedule";
import { useFollowedCourses } from "@/hooks/queries/items/course";
import { useActiveCourseSchedule } from "@/hooks/queries/items/course-schedule";
import {
  useCreateLesson,
  useLessonById,
  useLessonFileNumbers,
  useUpdateLesson,
} from "@/hooks/queries/items/lesson";
import { useSchoolClasses } from "@/hooks/queries/items/school-class";
import { useSchoolSpaces } from "@/hooks/queries/items/school-space";
import {
  useCurrentSchoolYear,
  useSchoolYears,
} from "@/hooks/queries/items/school-year";
import { useTeachingCourses } from "@/hooks/queries/items/teaching-course";
import {
  useTeachingScheduleDTOs,
  useTeachingSchedulesByLessonDate,
} from "@/hooks/queries/items/teaching-schedule";
import { useConfirm } from "@/hooks/use-confirm";
import { useThemeColors } from "@/hooks/use-theme-colors";
import { formatShortDate } from "@/lib/format";
import { handleApiError } from "@/lib/handle-api-error";
import {
  findLessonWithFileNo,
  nextLessonFileNo,
} from "@/lib/lesson-file-numbers";
import { notifyQueued } from "@/lib/offline/use-offline-mutation";
import { toastNotify } from "@/lib/toast";
import {
  lessonSchema,
  type LessonFormValues,
} from "@/utils/schemas/lesson-schema";
import { zodResolver } from "@hookform/resolvers/zod";
import * as Crypto from "expo-crypto";
import { router, Stack } from "expo-router";
import { useEffect, useMemo } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  ActivityIndicator,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";

type LessonFormScreenProps = {
  lessonId?: string;
};

function toDateOnly(value: Date | string) {
  const date = new Date(value);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function toHoursMinutes(value: string) {
  return value.slice(0, 5);
}

export function LessonFormScreen({ lessonId }: LessonFormScreenProps) {
  const colors = useThemeColors();
  const isEditing = Boolean(lessonId);

  const { lesson, lessonIsLoading, lessonError } = useLessonById(lessonId);

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    reset,
    setError,
    formState: { errors, dirtyFields, isSubmitting },
  } = useForm<LessonFormValues>({
    resolver: zodResolver(lessonSchema),
    defaultValues: {
      fileNo: "",
      subject: "",
      lessonDate: toDateOnly(new Date()),
      startTime: "",
      endTime: "",
      comments: null,
    },
  });

  const schoolYearId = watch("schoolYearId");
  const schoolClassId = watch("schoolClassId");
  const courseId = watch("courseId");
  const lessonDate = watch("lessonDate");
  const fileNo = watch("fileNo");

  const { confirm, ConfirmDialog } = useConfirm();

  useEffect(() => {
    if (!lesson) return;

    reset({
      fileNo: lesson.fileNo,
      subject: lesson.subject,
      lessonDate: toDateOnly(lesson.lessonDate),
      startTime: toHoursMinutes(lesson.startTime),
      endTime: toHoursMinutes(lesson.endTime),
      schoolYearId: lesson.teachingCourse?.followCourse?.schoolYearId,
      schoolClassId: lesson.teachingCourse?.schoolClassId,
      courseId: lesson.teachingCourse?.followCourse?.courseId,
      classroomId: lesson.classroomId,
      comments: lesson.comments,
    });
  }, [lesson, reset]);

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

  const { schoolSpaces, schoolSpacesIsLoading } = useSchoolSpaces();

  const { teachingCourses } = useTeachingCourses({
    filters: { schoolYearId, schoolClassId, courseId },
    enabled: Boolean(schoolYearId && schoolClassId && courseId),
  });

  const { teachingSchedules } = useTeachingSchedulesByLessonDate({
    filters: { schoolYearId, schoolClassId, courseId, lessonDate },
    enabled: Boolean(schoolYearId && schoolClassId && courseId && lessonDate),
  });

  // --- Auto-remplissages, création uniquement ---

  useEffect(() => {
    if (isEditing) return;
    if (currentSchoolYear?.id) setValue("schoolYearId", currentSchoolYear.id);
  }, [currentSchoolYear, isEditing, setValue]);

  useEffect(() => {
    if (isEditing) return;
    if (schoolClasses?.length === 1)
      setValue("schoolClassId", schoolClasses[0].id);
  }, [schoolClasses, isEditing, setValue]);

  useEffect(() => {
    if (isEditing) return;
    if (courses?.length === 1) setValue("courseId", courses[0].id);
  }, [courses, isEditing, setValue]);

  useEffect(() => {
    if (isEditing) return;
    if (dirtyFields.classroomId) return;
    if (teachingCourses?.length === 1 && teachingCourses[0].classroomId) {
      setValue("classroomId", teachingCourses[0].classroomId);
    }
  }, [teachingCourses, isEditing, dirtyFields.classroomId, setValue]);

  // Aide à la numérotation, non bloquante : un numéro peut légitimement servir à plusieurs leçons (leçon sur deux périodes, reprise…).
  const { lessonFileNumbers } = useLessonFileNumbers({
    schoolYearId,
    schoolClassId,
    courseId,
  });

  const lessonWithSameFileNo = useMemo(
    () => findLessonWithFileNo(lessonFileNumbers ?? [], fileNo, lessonId),
    [lessonFileNumbers, fileNo, lessonId],
  );

  useEffect(() => {
    if (isEditing || dirtyFields.fileNo || !lessonFileNumbers) return;
    setValue("fileNo", nextLessonFileNo(lessonFileNumbers) ?? "");
  }, [lessonFileNumbers, isEditing, dirtyFields.fileNo, setValue]);

  // Hors ligne, by-lesson-date ne répond pas : les heures sont déduites de l'horaire hebdomadaire gardé sur l'appareil.
  const { activeCourseSchedule } = useActiveCourseSchedule({ schoolYearId });
  const { teachingScheduleDTOs } = useTeachingScheduleDTOs({
    filters: { courseScheduleId: activeCourseSchedule?.id ?? null },
  });

  const scheduledTimes = useMemo(() => {
    if (teachingSchedules && teachingSchedules.length > 0) {
      const startTime = teachingSchedules[0]?.courseSchedulePeriod?.startTime;
      const endTime =
        teachingSchedules[teachingSchedules.length - 1]?.courseSchedulePeriod
          ?.endTime;
      return { startTime, endTime };
    }

    if (!teachingScheduleDTOs || !schoolClassId || !courseId || !lessonDate) {
      return null;
    }

    return lessonTimesFromWeeklySchedule(teachingScheduleDTOs, {
      schoolClassId,
      courseId,
      lessonDate,
    });
  }, [
    teachingSchedules,
    teachingScheduleDTOs,
    schoolClassId,
    courseId,
    lessonDate,
  ]);

  useEffect(() => {
    if (!scheduledTimes) return;

    const { startTime, endTime } = scheduledTimes;

    if (!dirtyFields.startTime && startTime)
      setValue("startTime", startTime.slice(0, 5));
    if (!dirtyFields.endTime && endTime)
      setValue("endTime", endTime.slice(0, 5));
  }, [scheduledTimes, dirtyFields.startTime, dirtyFields.endTime, setValue]);

  // --- Soumission ---

  const { createLesson, createLessonIsPending } = useCreateLesson();
  const { updateLesson, updateLessonIsPending } = useUpdateLesson(lessonId);

  const isBusy = createLessonIsPending || updateLessonIsPending || isSubmitting;

  const lessonLabel = (data: LessonFormValues) => {
    const course = courses?.find((item) => item.id === data.courseId);
    const schoolClass = schoolClasses?.find(
      (item) => item.id === data.schoolClassId,
    );
    return [
      course?.shortName ?? course?.name,
      schoolClass?.title ?? schoolClass?.abbreviation,
      formatShortDate(data.lessonDate),
    ]
      .filter(Boolean)
      .join(" · ");
  };

  const onSubmit = async (data: LessonFormValues) => {
    if (lessonWithSameFileNo) {
      const confirmed = await confirm({
        title: "N° de fiche déjà utilisé",
        description: `La fiche n° ${data.fileNo} est déjà utilisée pour la leçon du ${formatShortDate(lessonWithSameFileNo.lessonDate)}. Enregistrer quand même ?`,
        confirmText: "Enregistrer",
      });
      if (!confirmed) return;
    }

    try {
      if (isEditing) {
        await updateLesson({ ...data, teacherId: lesson?.teacherId ?? null });
        toastNotify("Leçon modifiée avec succès.", "success");
      } else {
        // id généré ici : la leçon s'affiche dans la liste avant sa synchronisation.
        const result = await createLesson(
          { ...data, id: Crypto.randomUUID() },
          lessonLabel(data),
        );
        if (result.status === "queued") notifyQueued();
        else toastNotify("Leçon ajoutée avec succès.", "success");
      }

      router.back();
    } catch (error) {
      handleApiError(error, {
        setFieldError: (field, message) =>
          setError(field as keyof LessonFormValues, { message }),
      });
    }
  };

  if (isEditing && lessonIsLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator />
      </View>
    );
  }

  if (isEditing && lessonError) {
    return (
      <View className="flex-1 items-center justify-center px-6 bg-background">
        <Text className="text-sm text-muted-foreground text-center">
          Impossible de charger la leçon.
        </Text>
      </View>
    );
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: isEditing ? "Modifier la leçon" : "Ajouter une leçon",
        }}
      />

      <ConfirmDialog />

      {/* KeyboardProvider (racine) empêche la fenêtre de se redimensionner : un ScrollView simple resterait caché sous le clavier. */}
      <KeyboardAwareScrollView
        className="flex-1 bg-background"
        contentContainerStyle={{ padding: 16 }}
        keyboardShouldPersistTaps="handled"
        bottomOffset={24}
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
              error={errors.schoolClassId?.message}
            />
          )}
        />

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
              error={errors.courseId?.message}
            />
          )}
        />

        <View className="mb-4">
          {/* DateField est en flex-1 : dans une colonne de hauteur libre il s'écrase, d'où la ligne. */}
          <View className="flex-row">
            <Controller
              control={control}
              name="lessonDate"
              render={({ field: { value, onChange } }) => (
                <DateField
                  label="Date de la leçon"
                  value={value}
                  onChange={(v) => onChange(v ?? "")}
                />
              )}
            />
          </View>
          {errors.lessonDate && (
            <Text className="text-xs text-red-500 mt-1">
              {errors.lessonDate.message}
            </Text>
          )}
        </View>

        <View className="mb-4">
          <Text className="text-sm font-medium text-foreground-secondary mb-2">
            N° Fiche
          </Text>
          <Controller
            control={control}
            name="fileNo"
            render={({ field: { value, onChange } }) => (
              <TextInput
                value={value}
                onChangeText={onChange}
                placeholder="N° de fiche"
                placeholderTextColor={colors.faint}
                className="h-11 border border-input rounded-lg px-3 bg-card text-foreground"
              />
            )}
          />
          {errors.fileNo && (
            <Text className="text-xs text-red-500 mt-1">
              {errors.fileNo.message}
            </Text>
          )}
          {!errors.fileNo && lessonWithSameFileNo && (
            <Text className="text-xs text-amber-600 dark:text-amber-400 mt-1">
              Déjà utilisé le {formatShortDate(lessonWithSameFileNo.lessonDate)}
            </Text>
          )}
        </View>

        <View className="mb-4">
          <View className="flex-row gap-3">
            <Controller
              control={control}
              name="startTime"
              render={({ field: { value, onChange } }) => (
                <TimeField
                  label="Heure début"
                  value={value}
                  onChange={(v) => onChange(v ?? "")}
                />
              )}
            />
            <Controller
              control={control}
              name="endTime"
              render={({ field: { value, onChange } }) => (
                <TimeField
                  label="Heure fin"
                  value={value}
                  onChange={(v) => onChange(v ?? "")}
                />
              )}
            />
          </View>
          {errors.startTime && (
            <Text className="text-xs text-red-500 mt-1">
              {errors.startTime.message}
            </Text>
          )}
          {errors.endTime && (
            <Text className="text-xs text-red-500 mt-1">
              {errors.endTime.message}
            </Text>
          )}
        </View>

        <Controller
          control={control}
          name="classroomId"
          render={({ field: { value, onChange } }) => (
            <ComboBox
              label="Espace d'enseignement"
              placeholder="Sélectionner un espace"
              options={(schoolSpaces ?? []).map((space) => ({
                id: space.id,
                label: space.designation,
              }))}
              value={value ?? null}
              onChange={onChange}
              loading={schoolSpacesIsLoading}
              error={errors.classroomId?.message}
            />
          )}
        />

        <View className="mb-4">
          <Text className="text-sm font-medium text-foreground-secondary mb-2">
            Sujet
          </Text>
          <Controller
            control={control}
            name="subject"
            render={({ field: { value, onChange } }) => (
              <TextInput
                value={value}
                onChangeText={onChange}
                multiline
                textAlignVertical="top"
                className="min-h-[60px] border border-input rounded-lg px-3 py-2 bg-card text-foreground"
              />
            )}
          />
          {errors.subject && (
            <Text className="text-xs text-red-500 mt-1">
              {errors.subject.message}
            </Text>
          )}
        </View>

        <View>
          <Text className="text-sm font-medium text-foreground-secondary mb-2">
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
                className="min-h-[80px] border border-input rounded-lg px-3 py-2 bg-card text-foreground"
              />
            )}
          />
          {errors.comments && (
            <Text className="text-xs text-red-500 mt-1">
              {errors.comments.message}
            </Text>
          )}
        </View>

        <Pressable
          onPress={() => void handleSubmit(onSubmit)()}
          disabled={isBusy}
          className={`h-12 rounded-lg items-center justify-center mt-6 ${
            isBusy ? "bg-gray-300 dark:bg-zinc-700" : "bg-foreground"
          }`}
        >
          {isBusy ? (
            <ActivityIndicator color={colors.background} />
          ) : (
            <Text className="text-background font-medium">
              {isEditing ? "Sauvegarder" : "Créer"}
            </Text>
          )}
        </Pressable>
      </KeyboardAwareScrollView>
    </>
  );
}
