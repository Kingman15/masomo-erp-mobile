import { ComboBox } from "@/components/list/combo-box";
import { DateField } from "@/components/list/date-field";
import { TimeField } from "@/components/list/time-field";
import { useFollowedCourses } from "@/hooks/queries/items/course";
import {
  useCreateLesson,
  useLessonById,
  useUpdateLesson,
} from "@/hooks/queries/items/lesson";
import { useSchoolClasses } from "@/hooks/queries/items/school-class";
import { useSchoolSpaces } from "@/hooks/queries/items/school-space";
import { useCurrentSchoolYear, useSchoolYears } from "@/hooks/queries/items/school-year";
import { useTeachingCourses } from "@/hooks/queries/items/teaching-course";
import { useTeachingSchedulesByLessonDate } from "@/hooks/queries/items/teaching-schedule";
import { handleApiError } from "@/lib/handle-api-error";
import { toastNotify } from "@/lib/toast";
import { lessonSchema, type LessonFormValues } from "@/utils/schemas/lesson-schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { router, Stack } from "expo-router";
import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";

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
    if (schoolClasses?.length === 1) setValue("schoolClassId", schoolClasses[0].id);
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

  useEffect(() => {
    if (!teachingSchedules || teachingSchedules.length === 0) return;

    const first = teachingSchedules[0]?.courseSchedulePeriod?.startTime;
    const last =
      teachingSchedules[teachingSchedules.length - 1]?.courseSchedulePeriod
        ?.endTime;

    if (!dirtyFields.startTime && first) setValue("startTime", first.slice(0, 5));
    if (!dirtyFields.endTime && last) setValue("endTime", last.slice(0, 5));
  }, [teachingSchedules, dirtyFields.startTime, dirtyFields.endTime, setValue]);

  // --- Soumission ---

  const { createLesson, createLessonIsPending } = useCreateLesson();
  const { updateLesson, updateLessonIsPending } = useUpdateLesson(lessonId);

  const isBusy = createLessonIsPending || updateLessonIsPending || isSubmitting;

  const onSubmit = async (data: LessonFormValues) => {
    try {
      if (isEditing) {
        await updateLesson({ ...data, teacherId: lesson?.teacherId ?? null });
      } else {
        await createLesson(data);
      }

      toastNotify(
        isEditing ? "Leçon modifiée avec succès." : "Leçon ajoutée avec succès.",
        "success",
      );
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
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator />
      </View>
    );
  }

  if (isEditing && lessonError) {
    return (
      <View className="flex-1 items-center justify-center px-6 bg-white">
        <Text className="text-sm text-gray-500 text-center">
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

      <ScrollView className="flex-1 bg-white" contentContainerStyle={{ padding: 16 }}>
        <Text className="text-sm font-medium text-gray-700 mb-2">N° Fiche</Text>
        <Controller
          control={control}
          name="fileNo"
          render={({ field: { value, onChange } }) => (
            <TextInput
              value={value}
              onChangeText={onChange}
              placeholder="N° de fiche"
              placeholderTextColor="#9CA3AF"
              className="h-11 border border-gray-300 rounded-lg px-3 mb-1 bg-white"
            />
          )}
        />
        {errors.fileNo && (
          <Text className="text-xs text-red-500 mb-3">{errors.fileNo.message}</Text>
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
                label: schoolClass.title ?? schoolClass.abbreviation ?? "Classe",
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
          <Text className="text-xs text-red-500 mb-3">{errors.courseId.message}</Text>
        )}

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
        {errors.lessonDate && (
          <Text className="text-xs text-red-500 mb-3">{errors.lessonDate.message}</Text>
        )}

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
          <Text className="text-xs text-red-500 mt-1">{errors.startTime.message}</Text>
        )}
        {errors.endTime && (
          <Text className="text-xs text-red-500 mb-3">{errors.endTime.message}</Text>
        )}

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
            />
          )}
        />
        {errors.classroomId && (
          <Text className="text-xs text-red-500 mb-3">
            {errors.classroomId.message}
          </Text>
        )}

        <Text className="text-sm font-medium text-gray-700 mb-2">Sujet</Text>
        <Controller
          control={control}
          name="subject"
          render={({ field: { value, onChange } }) => (
            <TextInput
              value={value}
              onChangeText={onChange}
              multiline
              textAlignVertical="top"
              className="min-h-[60px] border border-gray-300 rounded-lg px-3 py-2 mb-1 bg-white"
            />
          )}
        />
        {errors.subject && (
          <Text className="text-xs text-red-500 mb-3">{errors.subject.message}</Text>
        )}

        <Text className="text-sm font-medium text-gray-700 mb-2">Commentaires</Text>
        <Controller
          control={control}
          name="comments"
          render={({ field: { value, onChange } }) => (
            <TextInput
              value={value ?? ""}
              onChangeText={(text) => onChange(text || null)}
              multiline
              textAlignVertical="top"
              className="min-h-[80px] border border-gray-300 rounded-lg px-3 py-2 mb-1 bg-white"
            />
          )}
        />
        {errors.comments && (
          <Text className="text-xs text-red-500 mb-1">{errors.comments.message}</Text>
        )}

        <Pressable
          onPress={() => void handleSubmit(onSubmit)()}
          disabled={isBusy}
          className={`h-12 rounded-lg items-center justify-center mt-6 ${
            isBusy ? "bg-gray-300" : "bg-black"
          }`}
        >
          {isBusy ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <Text className="text-white font-medium">
              {isEditing ? "Sauvegarder" : "Créer"}
            </Text>
          )}
        </Pressable>
      </ScrollView>
    </>
  );
}
