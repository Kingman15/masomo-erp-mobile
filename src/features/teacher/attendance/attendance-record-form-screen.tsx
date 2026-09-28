import { CheckboxRow } from "@/components/list/checkbox-row";
import { ComboBox } from "@/components/list/combo-box";
import { DateField } from "@/components/list/date-field";
import { TimeField } from "@/components/list/time-field";
import { useCurrentTeacher } from "@/hooks/queries/items/employee";
import { useEnrollments } from "@/hooks/queries/items/enrollment";
import { useSchoolClasses } from "@/hooks/queries/items/school-class";
import { useCurrentSchoolYear } from "@/hooks/queries/items/school-year";
import { useStudentAttendanceJustificationStatuses } from "@/hooks/queries/items/student-attendance-justification-status";
import { useStudentAttendancePointingChannels } from "@/hooks/queries/items/student-attendance-pointing-channel";
import { useStudentAttendancePointingTypes } from "@/hooks/queries/items/student-attendance-pointing-type";
import {
  useCreateStudentAttendanceRecord,
  useStudentAttendanceRecordById,
  useUpdateStudentAttendanceRecord,
} from "@/hooks/queries/items/student-attendance-record";
import { useThemeColors } from "@/hooks/use-theme-colors";
import { handleApiError } from "@/lib/handle-api-error";
import { toastNotify } from "@/lib/toast";
import {
  studentAttendanceRecordSchema,
  type StudentAttendanceRecordFormValues,
} from "@/utils/schemas/student-attendance-record-schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { router, Stack, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import {
  getEnrollmentLabel,
  getSchoolClassLabel,
  toDateOnly,
  toHoursMinutes,
} from "./attendance-labels";
import { AttendanceSessionPicker } from "./attendance-session-picker";
import { useAttendanceRegistersSessions } from "./use-attendance-registers-sessions";

type AttendanceRecordFormScreenProps = {
  recordId?: string;
};

type FieldErrorProps = { message?: string };

function FieldError({ message }: FieldErrorProps) {
  if (!message) return null;
  return <Text className="text-xs text-red-500 -mt-3 mb-3">{message}</Text>;
}

export function AttendanceRecordFormScreen({
  recordId,
}: AttendanceRecordFormScreenProps) {
  const colors = useThemeColors();
  const isEditing = Boolean(recordId);
  const params = useLocalSearchParams<{
    registerId?: string;
    sessionId?: string;
    schoolClassId?: string;
  }>();

  const {
    studentAttendanceRecord: record,
    studentAttendanceRecordIsLoading,
    studentAttendanceRecordError,
  } = useStudentAttendanceRecordById(recordId);

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<StudentAttendanceRecordFormValues>({
    resolver: zodResolver(studentAttendanceRecordSchema),
    defaultValues: {
      sessionId: isEditing ? "" : (params.sessionId ?? ""),
      enrollmentId: "",
      pointingTypeId: "",
      entryTime: null,
      exitTime: null,
      isLate: false,
      isPartial: false,
      justificationStatusId: null,
      justificationNote: null,
      justificationDate: null,
      pointingChannelId: null,
      location: null,
      note: null,
    },
  });

  const sessionId = watch("sessionId");
  const [schoolClassId, setSchoolClassId] = useState<string | null>(
    params.schoolClassId ?? null,
  );

  // ---

  const { currentSchoolYear } = useCurrentSchoolYear();
  const schoolYearId =
    record?.session?.register?.schoolYearId ?? currentSchoolYear?.id ?? null;

  const {
    registerId,
    setRegisterId,
    registers,
    registersIsLoading,
    sessions,
    sessionsIsLoading,
  } = useAttendanceRegistersSessions({
    schoolYearId,
    initialRegisterId: isEditing ? null : (params.registerId ?? null),
  });

  const { currentTeacher, currentTeacherIsLoading } = useCurrentTeacher();

  // Seul le titulaire d'une classe peut la pointer (règle serveur) : on ne propose que celles-là.
  const { schoolClasses, schoolClassesIsLoading } = useSchoolClasses({
    filters: { teacherId: currentTeacher?.id ?? null, homeroom: true },
    enabled: !isEditing && !currentTeacherIsLoading,
  });

  const { enrollments, enrollmentsIsLoading } = useEnrollments({
    filters: {
      schoolYearId,
      schoolClassId,
      sortBy: "student_name",
      sortDirection: "asc",
      withoutAttendanceSessionId: sessionId,
    },
    enabled: !isEditing && Boolean(schoolYearId && schoolClassId && sessionId),
  });

  const { pointingTypes, pointingTypesIsLoading } =
    useStudentAttendancePointingTypes();
  const { pointingChannels, pointingChannelsIsLoading } =
    useStudentAttendancePointingChannels();
  const { statuses, statusesIsLoading } =
    useStudentAttendanceJustificationStatuses();

  // --- Initialisation en modification ---

  useEffect(() => {
    if (!record) return;

    if (record.session?.registerId) setRegisterId(record.session.registerId);

    reset({
      sessionId: record.sessionId ?? "",
      enrollmentId: record.enrollmentId ?? "",
      pointingTypeId: record.pointingTypeId ?? "",
      entryTime: toHoursMinutes(record.entryTime),
      exitTime: toHoursMinutes(record.exitTime),
      isLate: record.isLate ?? false,
      isPartial: record.isPartial ?? false,
      justificationStatusId: record.justificationStatusId,
      justificationNote: record.justificationNote,
      justificationDate: toDateOnly(record.justificationDate),
      pointingChannelId: record.pointingChannelId,
      location: record.location,
      note: record.note,
    });
  }, [record, reset, setRegisterId]);

  // --- Auto-remplissages, création uniquement ---

  useEffect(() => {
    if (isEditing) return;
    if (!sessionId && sessions?.length === 1) {
      setValue("sessionId", sessions[0].id);
    }
  }, [sessions, sessionId, isEditing, setValue]);

  useEffect(() => {
    if (isEditing) return;
    if (!schoolClassId && schoolClasses?.length === 1) {
      setSchoolClassId(schoolClasses[0].id);
    }
  }, [schoolClasses, schoolClassId, isEditing]);

  // --- Soumission ---

  const { createStudentAttendanceRecord, createStudentAttendanceRecordIsPending } =
    useCreateStudentAttendanceRecord();
  const { updateStudentAttendanceRecord, updateStudentAttendanceRecordIsPending } =
    useUpdateStudentAttendanceRecord(recordId);

  const isBusy =
    createStudentAttendanceRecordIsPending ||
    updateStudentAttendanceRecordIsPending ||
    isSubmitting;

  const onSubmit = async (data: StudentAttendanceRecordFormValues) => {
    try {
      if (isEditing) {
        await updateStudentAttendanceRecord({
          ...data,
          pointedById: record?.pointedById ?? currentTeacher?.id ?? null,
          entryPointedAt: record?.entryPointedAt ?? null,
          exitPointedAt: record?.exitPointedAt ?? null,
        });
      } else {
        await createStudentAttendanceRecord({
          ...data,
          pointedById: currentTeacher?.id ?? null,
        });
      }

      toastNotify(
        isEditing
          ? "Pointage de présence modifié avec succès."
          : "Pointage de présence ajouté avec succès.",
        "success",
      );
      router.back();
    } catch (error) {
      handleApiError(error, {
        setFieldError: (field, message) =>
          setError(field as keyof StudentAttendanceRecordFormValues, {
            message,
          }),
      });
    }
  };

  if (isEditing && studentAttendanceRecordIsLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator />
      </View>
    );
  }

  if (isEditing && studentAttendanceRecordError) {
    return (
      <View className="flex-1 items-center justify-center px-6 bg-background">
        <Text className="text-sm text-muted-foreground text-center">
          Impossible de charger le pointage de présence.
        </Text>
      </View>
    );
  }

  const enrollmentOptions =
    isEditing && record?.enrollment
      ? [{ id: record.enrollment.id, label: getEnrollmentLabel(record.enrollment) }]
      : (enrollments ?? []).map((enrollment) => ({
          id: enrollment.id,
          label: getEnrollmentLabel(enrollment),
        }));

  return (
    <>
      <Stack.Screen
        options={{
          title: isEditing ? "Modifier le pointage" : "Ajouter un pointage",
        }}
      />

      <ScrollView
        className="flex-1 bg-background"
        contentContainerStyle={{ padding: 16 }}
        keyboardShouldPersistTaps="handled"
      >
        <Controller
          control={control}
          name="sessionId"
          render={({ field: { value, onChange } }) => (
            <AttendanceSessionPicker
              registers={registers}
              registersIsLoading={registersIsLoading}
              registerId={registerId}
              onRegisterChange={setRegisterId}
              sessions={sessions}
              sessionsIsLoading={sessionsIsLoading}
              sessionId={value || null}
              onSessionChange={(id) => {
                onChange(id ?? "");
                setValue("enrollmentId", "");
              }}
              sessionError={errors.sessionId?.message}
              disabled={isEditing}
            />
          )}
        />

        {!isEditing && (
          <ComboBox
            label="Classe"
            placeholder="Sélectionner une classe"
            options={(schoolClasses ?? []).map((schoolClass) => ({
              id: schoolClass.id,
              label: getSchoolClassLabel(schoolClass),
            }))}
            value={schoolClassId}
            onChange={(id) => {
              setSchoolClassId(id);
              setValue("enrollmentId", "");
            }}
            loading={schoolClassesIsLoading}
            emptyLabel="Vous n'êtes titulaire d'aucune classe"
          />
        )}

        <Controller
          control={control}
          name="enrollmentId"
          render={({ field: { value, onChange } }) => (
            <ComboBox
              label="Élève"
              placeholder="Sélectionner un élève"
              options={enrollmentOptions}
              value={value || null}
              onChange={(id) => onChange(id ?? "")}
              loading={enrollmentsIsLoading && Boolean(schoolClassId && sessionId)}
              disabled={isEditing}
              emptyLabel={
                schoolClassId && sessionId
                  ? "Aucun élève à pointer"
                  : "Sélectionnez une session et une classe"
              }
            />
          )}
        />
        <FieldError message={errors.enrollmentId?.message} />

        <Controller
          control={control}
          name="pointingTypeId"
          render={({ field: { value, onChange } }) => (
            <ComboBox
              label="Type de pointage"
              placeholder="Sélectionner un type"
              options={(pointingTypes ?? []).map((type) => ({
                id: type.id,
                label: type.label ?? type.code ?? "Type",
              }))}
              value={value || null}
              onChange={(id) => onChange(id ?? "")}
              loading={pointingTypesIsLoading}
            />
          )}
        />
        <FieldError message={errors.pointingTypeId?.message} />

        <View className="flex-row gap-3">
          <Controller
            control={control}
            name="entryTime"
            render={({ field: { value, onChange } }) => (
              <TimeField label="Heure d'arrivée" value={value} onChange={onChange} />
            )}
          />
          <Controller
            control={control}
            name="exitTime"
            render={({ field: { value, onChange } }) => (
              <TimeField label="Heure de départ" value={value} onChange={onChange} />
            )}
          />
        </View>
        {errors.entryTime && (
          <Text className="text-xs text-red-500 mt-1">
            {errors.entryTime.message}
          </Text>
        )}
        {errors.exitTime && (
          <Text className="text-xs text-red-500 mb-3">
            {errors.exitTime.message}
          </Text>
        )}

        <View className="mt-4">
          <Controller
            control={control}
            name="isLate"
            render={({ field: { value, onChange } }) => (
              <CheckboxRow label="En retard" value={Boolean(value)} onChange={onChange} />
            )}
          />
          <Controller
            control={control}
            name="isPartial"
            render={({ field: { value, onChange } }) => (
              <CheckboxRow label="Partiel" value={Boolean(value)} onChange={onChange} />
            )}
          />
        </View>

        <Text className="text-xs font-semibold text-faint uppercase mt-2 mb-3">
          Justification
        </Text>

        <Controller
          control={control}
          name="justificationStatusId"
          render={({ field: { value, onChange } }) => (
            <ComboBox
              label="Statut de justification"
              placeholder="Sélectionner un statut"
              options={(statuses ?? []).map((status) => ({
                id: status.id,
                label: status.label ?? status.code ?? "Statut",
              }))}
              value={value ?? null}
              onChange={onChange}
              loading={statusesIsLoading}
            />
          )}
        />
        <FieldError message={errors.justificationStatusId?.message} />

        <Controller
          control={control}
          name="justificationDate"
          render={({ field: { value, onChange } }) => (
            <DateField
              label="Date de justification"
              value={value}
              onChange={onChange}
            />
          )}
        />
        {errors.justificationDate && (
          <Text className="text-xs text-red-500 mb-3">
            {errors.justificationDate.message}
          </Text>
        )}

        <Text className="text-sm font-medium text-foreground-secondary mb-2 mt-4">
          Note de justification
        </Text>
        <Controller
          control={control}
          name="justificationNote"
          render={({ field: { value, onChange } }) => (
            <TextInput
              value={value ?? ""}
              onChangeText={(text) => onChange(text || null)}
              multiline
              textAlignVertical="top"
              className="min-h-[60px] border border-input rounded-lg px-3 py-2 mb-1 bg-card text-foreground"
            />
          )}
        />
        {errors.justificationNote && (
          <Text className="text-xs text-red-500 mb-3">
            {errors.justificationNote.message}
          </Text>
        )}

        <Text className="text-xs font-semibold text-faint uppercase mt-4 mb-3">
          Autres informations
        </Text>

        <Controller
          control={control}
          name="pointingChannelId"
          render={({ field: { value, onChange } }) => (
            <ComboBox
              label="Canal de pointage"
              placeholder="Sélectionner un canal"
              options={(pointingChannels ?? []).map((channel) => ({
                id: channel.id,
                label: channel.label ?? channel.code ?? "Canal",
              }))}
              value={value ?? null}
              onChange={onChange}
              loading={pointingChannelsIsLoading}
            />
          )}
        />

        <Text className="text-sm font-medium text-foreground-secondary mb-2">Lieu</Text>
        <Controller
          control={control}
          name="location"
          render={({ field: { value, onChange } }) => (
            <TextInput
              value={value ?? ""}
              onChangeText={(text) => onChange(text || null)}
              className="h-11 border border-input rounded-lg px-3 mb-1 bg-card text-foreground"
            />
          )}
        />
        {errors.location && (
          <Text className="text-xs text-red-500 mb-3">
            {errors.location.message}
          </Text>
        )}

        <Text className="text-sm font-medium text-foreground-secondary mb-2 mt-3">Note</Text>
        <Controller
          control={control}
          name="note"
          render={({ field: { value, onChange } }) => (
            <TextInput
              value={value ?? ""}
              onChangeText={(text) => onChange(text || null)}
              multiline
              textAlignVertical="top"
              className="min-h-[60px] border border-input rounded-lg px-3 py-2 mb-1 bg-card text-foreground"
            />
          )}
        />
        {errors.note && (
          <Text className="text-xs text-red-500 mb-1">{errors.note.message}</Text>
        )}

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
      </ScrollView>
    </>
  );
}
