import { ComboBox } from "@/components/list/combo-box";
import { DateField } from "@/components/list/date-field";
import { TimeField } from "@/components/list/time-field";
import { useCurrentSchoolYear } from "@/hooks/queries/items/school-year";
import { useStudentAttendanceRegisters } from "@/hooks/queries/items/student-attendance-register";
import { useCreateStudentAttendanceSession } from "@/hooks/queries/items/student-attendance-session";
import { useThemeColors } from "@/hooks/use-theme-colors";
import { handleApiError } from "@/lib/handle-api-error";
import { useIsOnline } from "@/lib/offline/use-offline-queue";
import { toastNotify } from "@/lib/toast";
import {
  studentAttendanceSessionSchema,
  type StudentAttendanceSessionFormValues,
} from "@/utils/schemas/student-attendance-session-schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { router, Stack, useLocalSearchParams } from "expo-router";
import { useEffect, useMemo } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  ActivityIndicator,
  Pressable,
  Text,
  TextInput,
} from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";

function today(): string {
  const now = new Date();
  const pad = (value: number) => String(value).padStart(2, "0");
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}

// Création d'une session ouverte depuis le pointage (direction, directeur de discipline) ; en ligne uniquement.
export function AttendanceSessionFormScreen() {
  const colors = useThemeColors();
  const isOnline = useIsOnline();
  const params = useLocalSearchParams<{ registerId?: string }>();

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<StudentAttendanceSessionFormValues>({
    resolver: zodResolver(studentAttendanceSessionSchema),
    defaultValues: {
      registerId: params.registerId ?? "",
      attendanceDate: today(),
      arrivalTime: null,
      departureTime: null,
      title: null,
      description: null,
    },
  });

  const registerId = watch("registerId");

  const { currentSchoolYear } = useCurrentSchoolYear();
  const schoolYearId = currentSchoolYear?.id ?? null;

  const { studentAttendanceRegisters, studentAttendanceRegistersIsLoading } =
    useStudentAttendanceRegisters({
      filters: { schoolYearId },
      enabled: Boolean(schoolYearId),
    });

  // Seuls les registres ouverts reçoivent de nouvelles sessions.
  const openRegisters = useMemo(
    () =>
      (studentAttendanceRegisters ?? []).filter(
        (register) => register.status === "open",
      ),
    [studentAttendanceRegisters],
  );

  useEffect(() => {
    if (!registerId && openRegisters.length === 1) {
      setValue("registerId", openRegisters[0].id);
    }
  }, [openRegisters, registerId, setValue]);

  const { createStudentAttendanceSession, createStudentAttendanceSessionIsPending } =
    useCreateStudentAttendanceSession();
  const isBusy = createStudentAttendanceSessionIsPending || isSubmitting;

  const onSubmit = async (data: StudentAttendanceSessionFormValues) => {
    if (!schoolYearId) return;

    try {
      await createStudentAttendanceSession({ ...data, schoolYearId });
      toastNotify("Session de présence créée avec succès.", "success");
      router.back();
    } catch (error) {
      handleApiError(error, {
        setFieldError: (field, message) =>
          setError(field as keyof StudentAttendanceSessionFormValues, {
            message,
          }),
      });
    }
  };

  return (
    <>
      <Stack.Screen options={{ title: "Nouvelle session" }} />

      <KeyboardAwareScrollView
        className="flex-1 bg-background"
        contentContainerStyle={{ padding: 16 }}
        keyboardShouldPersistTaps="handled"
        bottomOffset={24}
      >
        <Controller
          control={control}
          name="registerId"
          render={({ field: { value, onChange } }) => (
            <ComboBox
              label="Registre de présences"
              placeholder="Sélectionner un registre"
              options={openRegisters.map((register) => ({
                id: register.id,
                label: register.title ?? register.code ?? "Registre",
              }))}
              value={value || null}
              onChange={(id) => onChange(id ?? "")}
              loading={studentAttendanceRegistersIsLoading}
              emptyLabel="Aucun registre ouvert"
              error={errors.registerId?.message}
            />
          )}
        />

        <Controller
          control={control}
          name="attendanceDate"
          render={({ field: { value, onChange } }) => (
            <DateField
              label="Date"
              value={value}
              onChange={(date) => onChange(date ?? "")}
            />
          )}
        />
        {errors.attendanceDate && (
          <Text className="text-xs text-red-500 -mt-3 mb-3">
            {errors.attendanceDate.message}
          </Text>
        )}

        <Controller
          control={control}
          name="arrivalTime"
          render={({ field: { value, onChange } }) => (
            <TimeField
              label="Heure d'arrivée (optionnel)"
              value={value ?? null}
              onChange={onChange}
            />
          )}
        />
        {errors.arrivalTime && (
          <Text className="text-xs text-red-500 -mt-3 mb-3">
            {errors.arrivalTime.message}
          </Text>
        )}

        <Controller
          control={control}
          name="departureTime"
          render={({ field: { value, onChange } }) => (
            <TimeField
              label="Heure de départ (optionnel)"
              value={value ?? null}
              onChange={onChange}
            />
          )}
        />
        {errors.departureTime && (
          <Text className="text-xs text-red-500 -mt-3 mb-3">
            {errors.departureTime.message}
          </Text>
        )}

        <Text className="text-sm font-medium text-foreground-secondary mb-2">
          Titre
        </Text>
        <Controller
          control={control}
          name="title"
          render={({ field: { value, onChange } }) => (
            <TextInput
              value={value ?? ""}
              onChangeText={(text) => onChange(text || null)}
              placeholder="Par défaut : la date"
              placeholderTextColor={colors.faint}
              className="h-11 border border-input rounded-lg px-3 mb-1 bg-card text-foreground"
            />
          )}
        />
        {errors.title && (
          <Text className="text-xs text-red-500 mb-3">{errors.title.message}</Text>
        )}

        <Text className="text-sm font-medium text-foreground-secondary mb-2 mt-2">
          Description
        </Text>
        <Controller
          control={control}
          name="description"
          render={({ field: { value, onChange } }) => (
            <TextInput
              value={value ?? ""}
              onChangeText={(text) => onChange(text || null)}
              multiline
              textAlignVertical="top"
              placeholder="Description (optionnel)"
              placeholderTextColor={colors.faint}
              className="min-h-[80px] border border-input rounded-lg px-3 py-2 mb-1 bg-card text-foreground"
            />
          )}
        />
        {errors.description && (
          <Text className="text-xs text-red-500 mb-3">
            {errors.description.message}
          </Text>
        )}

        {!isOnline && (
          <Text className="text-xs text-muted-foreground mt-3">
            La création d&apos;une session nécessite une connexion.
          </Text>
        )}

        <Pressable
          onPress={() => void handleSubmit(onSubmit)()}
          disabled={isBusy || !isOnline || !schoolYearId}
          className={`h-12 rounded-lg items-center justify-center mt-4 ${
            isBusy || !isOnline || !schoolYearId
              ? "bg-gray-300 dark:bg-zinc-700"
              : "bg-foreground"
          }`}
        >
          {isBusy ? (
            <ActivityIndicator color={colors.background} />
          ) : (
            <Text className="text-background font-medium">Créer la session</Text>
          )}
        </Pressable>
      </KeyboardAwareScrollView>
    </>
  );
}
