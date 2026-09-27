import type { StudentAttendanceBulkRecordPayload } from "@/api/endpoints/studentAttendanceRecord";
import { ComboBox } from "@/components/list/combo-box";
import { describeFailure } from "@/features/teacher/sync/sync-labels";
import { useCurrentTeacher } from "@/hooks/queries/items/employee";
import { useEnrollments } from "@/hooks/queries/items/enrollment";
import { useSchoolClasses } from "@/hooks/queries/items/school-class";
import { useCurrentSchoolYear } from "@/hooks/queries/items/school-year";
import { useStudentAttendancePointingChannels } from "@/hooks/queries/items/student-attendance-pointing-channel";
import { useBulkCreateStudentAttendanceRecords } from "@/hooks/queries/items/student-attendance-record";
import { useConfirm } from "@/hooks/use-confirm";
import { handleApiError } from "@/lib/handle-api-error";
import { getFailureCode, getOfflineFailure } from "@/lib/offline/offline-error";
import { notifyQueued } from "@/lib/offline/use-offline-mutation";
import { useIsOnline } from "@/lib/offline/use-offline-queue";
import { toastNotify } from "@/lib/toast";
import {
  studentAttendanceBulkRecordSchema,
  type StudentAttendanceBulkRecordFormValues,
} from "@/utils/schemas/student-attendance-bulk-record-schema";
import type { StudentAttendanceRecordDTO } from "@/utils/types/objects/StudentAttendanceRecordDTO";
import { zodResolver } from "@hookform/resolvers/zod";
import { router, Stack, useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { AttendanceBulkStudentRow } from "./attendance-bulk-student-row";
import { getSchoolClassLabel, getSessionLabel } from "./attendance-labels";
import { AttendanceSessionPicker } from "./attendance-session-picker";
import { classEnrollmentsFilters } from "./class-enrollments";
import { useAttendanceRegistersSessions } from "./use-attendance-registers-sessions";

export function AttendanceBulkScreen() {
  const params = useLocalSearchParams<{
    registerId?: string;
    sessionId?: string;
    schoolClassId?: string;
  }>();

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<StudentAttendanceBulkRecordFormValues>({
    resolver: zodResolver(studentAttendanceBulkRecordSchema),
    defaultValues: {
      sessionId: params.sessionId ?? "",
      schoolClassId: params.schoolClassId ?? "",
      pointedById: null,
      pointingChannelId: null,
      location: null,
    },
  });

  const sessionId = watch("sessionId");
  const schoolClassId = watch("schoolClassId");

  const [records, setRecords] = useState<StudentAttendanceRecordDTO[]>([]);

  // ---

  const { currentSchoolYear } = useCurrentSchoolYear();
  const schoolYearId = currentSchoolYear?.id ?? null;

  const {
    registerId,
    setRegisterId,
    registers,
    registersIsLoading,
    sessions,
    sessionsIsLoading,
  } = useAttendanceRegistersSessions({
    schoolYearId,
    initialRegisterId: params.registerId ?? null,
  });

  const { currentTeacher, currentTeacherIsLoading } = useCurrentTeacher();

  // Seul le titulaire d'une classe peut la pointer (règle serveur) : on ne propose que celles-là.
  const { schoolClasses, schoolClassesIsLoading } = useSchoolClasses({
    filters: { teacherId: currentTeacher?.id ?? null, homeroom: true },
    enabled: !currentTeacherIsLoading,
  });

  const { pointingChannels, pointingChannelsIsLoading } =
    useStudentAttendancePointingChannels();

  const isOnline = useIsOnline();

  const {
    enrollments: sessionEnrollments,
    enrollmentsError,
    enrollmentsIsLoading,
    enrollmentsIsFetching,
    loadEnrollments,
  } = useEnrollments({
    filters: classEnrollmentsFilters(schoolYearId, schoolClassId, sessionId),
    enabled: Boolean(schoolYearId && schoolClassId && sessionId),
  });

  // Hors ligne, ou serveur injoignable alors que le téléphone se croit en ligne : les élèves « pas encore pointés » de cette session ne sont en général pas en cache, on reprend tous les élèves de la classe (préchargés).
  // Le serveur ignore un pointage identique à l'existant et signale un pointage différent (409).
  const { enrollments: classEnrollments } = useEnrollments({
    filters: classEnrollmentsFilters(schoolYearId, schoolClassId),
    enabled: false,
  });

  const serverUnreachable = !isOnline || Boolean(enrollmentsError);
  // Une liste déjà chargée reste affichée même si son rechargement échoue.
  const enrollments =
    sessionEnrollments ?? (serverUnreachable ? classEnrollments : undefined);

  // --- Auto-remplissages ---

  useEffect(() => {
    if (currentTeacher) setValue("pointedById", currentTeacher.id);
  }, [currentTeacher, setValue]);

  useEffect(() => {
    if (!sessionId && sessions?.length === 1) {
      setValue("sessionId", sessions[0].id);
    }
  }, [sessions, sessionId, setValue]);

  useEffect(() => {
    if (!schoolClassId && schoolClasses?.length === 1) {
      setValue("schoolClassId", schoolClasses[0].id);
    }
  }, [schoolClasses, schoolClassId, setValue]);

  useEffect(() => {
    setRecords(
      (enrollments ?? []).map((enrollment) => ({
        enrollment,
        isChecked: true,
        isPresent: true,
        isLate: false,
        isPartial: false,
        justificationNote: null,
      })),
    );
  }, [enrollments]);

  // --- Pointage ---

  const handleRecordChange = useCallback(
    (enrollmentId: string, patch: Partial<StudentAttendanceRecordDTO>) => {
      setRecords((previous) =>
        previous.map((record) =>
          record.enrollment.id === enrollmentId
            ? { ...record, ...patch }
            : record,
        ),
      );
    },
    [],
  );

  const setAll = (patch: Partial<StudentAttendanceRecordDTO>) => {
    setRecords((previous) =>
      previous.map((record) =>
        record.isChecked || "isChecked" in patch
          ? { ...record, ...patch }
          : record,
      ),
    );
  };

  const counts = useMemo(() => {
    const checked = records.filter((record) => record.isChecked);
    const present = checked.filter((record) => record.isPresent).length;
    return {
      checked: checked.length,
      present,
      absent: checked.length - present,
    };
  }, [records]);

  const allChecked = records.length > 0 && counts.checked === records.length;

  // --- Soumission ---

  const {
    bulkCreateStudentAttendanceRecords,
    bulkCreateStudentAttendanceRecordsIsPending,
  } = useBulkCreateStudentAttendanceRecords();

  const isBusy = bulkCreateStudentAttendanceRecordsIsPending || isSubmitting;

  const { confirm, ConfirmDialog } = useConfirm();

  const attendanceLabel = (data: StudentAttendanceBulkRecordFormValues) => {
    const session = sessions?.find((item) => item.id === data.sessionId);
    const schoolClass = schoolClasses?.find(
      (item) => item.id === data.schoolClassId,
    );
    return [
      schoolClass ? getSchoolClassLabel(schoolClass) : null,
      session ? getSessionLabel(session) : null,
    ]
      .filter(Boolean)
      .join(" · ");
  };

  const submitRecords = async (
    payload: StudentAttendanceBulkRecordPayload,
    label: string,
  ): Promise<void> => {
    try {
      const result = await bulkCreateStudentAttendanceRecords(payload, label);
      if (result.status === "queued") {
        notifyQueued();
      } else {
        const skipped = result.data.skipped.length;
        toastNotify(
          skipped > 0
            ? `Pointages enregistrés. ${skipped} élève(s) déjà pointé(s) laissé(s) tel(s) quel(s).`
            : "Pointages de présence enregistrés avec succès.",
          "success",
        );
      }
      router.back();
    } catch (error) {
      const failure = getOfflineFailure(error);

      // Un autre agent a pointé certains élèves différemment : rien n'a été écrit.
      if (
        getFailureCode(failure) === "ATTENDANCE_CONFLICT" &&
        payload.conflictStrategy !== "skip_existing"
      ) {
        const confirmed = await confirm({
          title: "Élèves déjà pointés",
          description: `${describeFailure(failure)}\n\nEnregistrer les autres élèves sans modifier ces pointages ?`,
          confirmText: "Enregistrer les autres",
          cancelText: "Annuler",
        });
        if (confirmed) {
          await submitRecords(
            { ...payload, conflictStrategy: "skip_existing" },
            label,
          );
        }
        return;
      }

      handleApiError(error, {
        setFieldError: (field, message) =>
          setError(field as keyof StudentAttendanceBulkRecordFormValues, {
            message,
          }),
      });
    }
  };

  const onSubmit = async (data: StudentAttendanceBulkRecordFormValues) => {
    const recordItems = records
      .filter((record) => record.isChecked)
      .map((record) => ({
        enrollmentId: record.enrollment.id,
        isPresent: record.isPresent,
        isLate: record.isLate,
        isPartial: record.isPartial,
        justificationNote: record.justificationNote,
      }));

    if (recordItems.length === 0) {
      toastNotify("Veuillez effectuer des pointages des présences.", "info");
      return;
    }

    await submitRecords({ ...data, records: recordItems }, attendanceLabel(data));
  };

  const canLoadStudents = Boolean(schoolYearId && schoolClassId && sessionId);

  return (
    <>
      <Stack.Screen options={{ title: "Pointage de présences" }} />
      <ConfirmDialog />

      <ScrollView
        className="flex-1 bg-white"
        contentContainerStyle={{ paddingBottom: 24 }}
        keyboardShouldPersistTaps="handled"
      >
        <View className="p-4">
          <Text className="text-xs font-semibold text-gray-400 uppercase mb-3">
            Informations principales
          </Text>

          <ComboBox
            label="Année scolaire"
            options={
              currentSchoolYear
                ? [{ id: currentSchoolYear.id, label: currentSchoolYear.title }]
                : []
            }
            value={schoolYearId}
            onChange={() => {}}
            disabled
            emptyLabel="Année scolaire en cours"
          />

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
                onSessionChange={(id) => onChange(id ?? "")}
                sessionError={errors.sessionId?.message}
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
                  label: getSchoolClassLabel(schoolClass),
                }))}
                value={value || null}
                onChange={(id) => onChange(id ?? "")}
                loading={schoolClassesIsLoading}
                emptyLabel="Vous n'êtes titulaire d'aucune classe"
              />
            )}
          />
          {errors.schoolClassId && (
            <Text className="text-xs text-red-500 -mt-3 mb-3">
              {errors.schoolClassId.message}
            </Text>
          )}

          <ComboBox
            label="Pointé par"
            options={
              currentTeacher
                ? [
                    {
                      id: currentTeacher.id,
                      label: currentTeacher.fullName ?? "Enseignant",
                    },
                  ]
                : []
            }
            value={currentTeacher?.id ?? null}
            onChange={() => {}}
            loading={currentTeacherIsLoading}
            disabled
            emptyLabel="—"
          />

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

          <Text className="text-sm font-medium text-gray-700 mb-2">Lieu</Text>
          <Controller
            control={control}
            name="location"
            render={({ field: { value, onChange } }) => (
              <TextInput
                value={value ?? ""}
                onChangeText={(text) => onChange(text || null)}
                placeholder="Lieu du pointage"
                placeholderTextColor="#9CA3AF"
                className="h-11 border border-gray-300 rounded-lg px-3 mb-1 bg-white"
              />
            )}
          />
          {errors.location && (
            <Text className="text-xs text-red-500 mb-3">
              {errors.location.message}
            </Text>
          )}
        </View>

        <View className="border-t border-gray-100 pt-4">
          <View className="flex-row items-center justify-between px-4 mb-2">
            <Text className="text-xs font-semibold text-gray-400 uppercase">
              Pointage
            </Text>
            {records.length > 0 && (
              <Text className="text-xs text-gray-500">
                {counts.present} présent{counts.present > 1 ? "s" : ""} ·{" "}
                {counts.absent} absent{counts.absent > 1 ? "s" : ""}
              </Text>
            )}
          </View>

          {records.length > 0 && (
            <View className="flex-row flex-wrap gap-2 px-4 pb-3">
              <Pressable
                onPress={() => setAll({ isChecked: !allChecked })}
                className="h-8 px-3 rounded-lg border border-gray-300 items-center justify-center"
              >
                <Text className="text-xs font-medium text-gray-700">
                  {allChecked ? "Tout décocher" : "Tout cocher"}
                </Text>
              </Pressable>
              <Pressable
                onPress={() => setAll({ isPresent: true })}
                className="h-8 px-3 rounded-lg border border-gray-300 items-center justify-center"
              >
                <Text className="text-xs font-medium text-gray-700">
                  Tous présents
                </Text>
              </Pressable>
              <Pressable
                onPress={() =>
                  setAll({ isPresent: false, isLate: false, isPartial: false })
                }
                className="h-8 px-3 rounded-lg border border-gray-300 items-center justify-center"
              >
                <Text className="text-xs font-medium text-gray-700">
                  Tous absents
                </Text>
              </Pressable>
            </View>
          )}

          {!canLoadStudents ? (
            <Text className="text-sm text-gray-400 text-center px-6 py-10">
              Sélectionnez une session et une classe pour afficher les élèves.
            </Text>
          ) : enrollmentsIsLoading ||
            (enrollmentsIsFetching && records.length === 0) ? (
            <View className="py-10">
              <ActivityIndicator />
            </View>
          ) : !enrollments && isOnline && enrollmentsError ? (
            <View className="items-center px-6 py-10 gap-3">
              <Text className="text-sm text-gray-500 text-center">
                Impossible de charger les élèves.
              </Text>
              <Pressable
                onPress={() => loadEnrollments()}
                className="h-10 px-4 rounded-lg bg-black items-center justify-center"
              >
                <Text className="text-white font-medium">Réessayer</Text>
              </Pressable>
            </View>
          ) : !enrollments ? (
            <Text className="text-sm text-gray-400 text-center px-6 py-10">
              Les élèves de cette classe n&apos;ont pas été gardés sur
              l&apos;appareil. Reconnecte-toi pour les charger.
            </Text>
          ) : records.length === 0 ? (
            <Text className="text-sm text-gray-400 text-center px-6 py-10">
              Tous les élèves de cette classe ont déjà été pointés pour cette
              session.
            </Text>
          ) : (
            records.map((record) => (
              <AttendanceBulkStudentRow
                key={record.enrollment.id}
                record={record}
                onChange={handleRecordChange}
              />
            ))
          )}
        </View>

        <View className="px-4">
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
                Sauvegarder
                {counts.checked > 0 ? ` (${counts.checked})` : ""}
              </Text>
            )}
          </Pressable>
        </View>
      </ScrollView>
    </>
  );
}
