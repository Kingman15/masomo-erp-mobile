import { incidentToPayload } from "@/api/endpoints/studentIncident";
import { CheckboxRow } from "@/components/list/checkbox-row";
import { ChipSelect } from "@/components/list/chip-select";
import { ComboBox } from "@/components/list/combo-box";
import { DateField } from "@/components/list/date-field";
import { useEmployeeOptions } from "@/hooks/queries/items/employee";
import {
  useStudentIncidentById,
  useUpdateStudentIncident,
} from "@/hooks/queries/items/student-incident";
import { useThemeColors } from "@/hooks/use-theme-colors";
import { handleApiError } from "@/lib/handle-api-error";
import { useIsOnline } from "@/lib/offline/use-offline-queue";
import { toastNotify } from "@/lib/toast";
import {
  studentIncidentProcessingSchema,
  type StudentIncidentProcessingFormValues,
} from "@/utils/schemas/student-incident-processing-schema";
import {
  STUDENT_INCIDENT_STATUSES,
  type StudentIncident,
} from "@/utils/types/StudentIncident";
import { zodResolver } from "@hookform/resolvers/zod";
import { router, Stack, useLocalSearchParams } from "expo-router";
import { useEffect } from "react";
import { Controller, useForm, type Control } from "react-hook-form";
import {
  ActivityIndicator,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { INCIDENT_STATUS_LABELS } from "./incident-status-pill";

function dateOnly(value: string | null | undefined): string | null {
  return value ? value.slice(0, 10) : null;
}

function today(): string {
  const now = new Date();
  const pad = (value: number) => String(value).padStart(2, "0");
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}

function toFormValues(incident: StudentIncident): StudentIncidentProcessingFormValues {
  return {
    status: incident.status ?? "open",
    severityLevel: incident.severityLevel,
    handledBy: incident.handledBy,
    temporaryMeasureApplied: incident.temporaryMeasureApplied,
    temporaryMeasureDescription: incident.temporaryMeasureDescription,
    measuresTaken: incident.measuresTaken,
    resolvedAt: dateOnly(incident.resolvedAt),
    psychologicalSupportRequired: incident.psychologicalSupportRequired,
    psychologicalSupportNotes: incident.psychologicalSupportNotes,
    parentsNotified: incident.parentsNotified,
    parentsNotifiedAt: dateOnly(incident.parentsNotifiedAt),
    parentsNotifiedBy: incident.parentsNotifiedBy,
    internalNotes: incident.internalNotes,
  };
}

type TextAreaFieldProps = {
  control: Control<StudentIncidentProcessingFormValues>;
  name:
    | "temporaryMeasureDescription"
    | "measuresTaken"
    | "psychologicalSupportNotes"
    | "internalNotes";
  label: string;
  placeholder: string;
  error?: string;
};

function TextAreaField({ control, name, label, placeholder, error }: TextAreaFieldProps) {
  const colors = useThemeColors();
  return (
    <>
      <Text className="text-sm font-medium text-foreground-secondary mb-2">{label}</Text>
      <Controller
        control={control}
        name={name}
        render={({ field: { value, onChange } }) => (
          <TextInput
            value={value ?? ""}
            onChangeText={(text) => onChange(text || null)}
            multiline
            textAlignVertical="top"
            placeholder={placeholder}
            placeholderTextColor={colors.faint}
            className="min-h-[80px] border border-input rounded-lg px-3 py-2 mb-1 bg-card text-foreground"
          />
        )}
      />
      {error ? (
        <Text className="text-xs text-red-500 mb-3">{error}</Text>
      ) : (
        <View className="mb-3" />
      )}
    </>
  );
}

function SectionTitle({ children }: { children: string }) {
  return (
    <Text className="text-base font-semibold text-foreground mt-3 mb-3">{children}</Text>
  );
}

// Suivi d'un incident (statut, prise en charge, mesures, parents, soutien) ; en ligne uniquement.
// Le serveur réécrit tout l'incident : on repart de la fiche chargée et on n'y change que ces champs.
export function IncidentProcessingScreen() {
  const colors = useThemeColors();
  const isOnline = useIsOnline();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { studentIncident, studentIncidentIsLoading } = useStudentIncidentById(id);

  const {
    control,
    handleSubmit,
    watch,
    reset,
    setValue,
    setError,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<StudentIncidentProcessingFormValues>({
    resolver: zodResolver(studentIncidentProcessingSchema),
    defaultValues: {
      status: "open",
      temporaryMeasureApplied: false,
      psychologicalSupportRequired: false,
      parentsNotified: false,
    },
  });

  // Fiche chargée (ou rechargée) : le formulaire repart de l'état serveur tant qu'il n'a pas été modifié.
  useEffect(() => {
    if (studentIncident && !isDirty) reset(toFormValues(studentIncident));
  }, [studentIncident, isDirty, reset]);

  const status = watch("status");
  const resolvedAt = watch("resolvedAt");
  const temporaryMeasureApplied = watch("temporaryMeasureApplied");
  const psychologicalSupportRequired = watch("psychologicalSupportRequired");
  const parentsNotified = watch("parentsNotified");
  const parentsNotifiedAt = watch("parentsNotifiedAt");

  const isClosing = status === "resolved" || status === "closed";

  // Comme le serveur, qui efface la résolution d'un incident rouvert : date du jour par défaut à la clôture.
  useEffect(() => {
    if (isClosing && !resolvedAt) setValue("resolvedAt", today());
  }, [isClosing, resolvedAt, setValue]);

  useEffect(() => {
    if (parentsNotified && !parentsNotifiedAt) setValue("parentsNotifiedAt", today());
  }, [parentsNotified, parentsNotifiedAt, setValue]);

  const { employees, employeesIsLoading } = useEmployeeOptions();
  const employeeOptions = (employees ?? []).map((employee) => ({
    id: employee.id,
    label: employee.fullName ?? "Employé",
  }));

  const { updateStudentIncident, updateStudentIncidentIsPending } =
    useUpdateStudentIncident();
  const isBusy = updateStudentIncidentIsPending || isSubmitting;
  const canSubmit = Boolean(studentIncident) && isOnline && !isBusy;

  const onSubmit = async (data: StudentIncidentProcessingFormValues) => {
    if (!studentIncident) return;

    try {
      await updateStudentIncident({
        id: studentIncident.id,
        payload: {
          ...incidentToPayload(studentIncident),
          status: data.status,
          severityLevel: data.severityLevel ?? null,
          handledBy: data.handledBy ?? null,
          temporaryMeasureApplied: data.temporaryMeasureApplied,
          temporaryMeasureDescription: data.temporaryMeasureDescription ?? null,
          measuresTaken: data.measuresTaken ?? null,
          resolvedAt: isClosing ? (data.resolvedAt ?? null) : null,
          psychologicalSupportRequired: data.psychologicalSupportRequired,
          psychologicalSupportNotes: data.psychologicalSupportNotes ?? null,
          parentsNotified: data.parentsNotified,
          parentsNotifiedAt: data.parentsNotified ? (data.parentsNotifiedAt ?? null) : null,
          parentsNotifiedBy: data.parentsNotified ? (data.parentsNotifiedBy ?? null) : null,
          internalNotes: data.internalNotes ?? null,
        },
      });
      toastNotify("Incident mis à jour avec succès.", "success");
      router.back();
    } catch (error) {
      handleApiError(error, {
        setFieldError: (field, message) =>
          setError(field as keyof StudentIncidentProcessingFormValues, { message }),
      });
    }
  };

  if (studentIncidentIsLoading || !studentIncident) {
    return (
      <>
        <Stack.Screen options={{ title: "Traiter l'incident" }} />
        <View className="flex-1 items-center justify-center bg-background">
          <ActivityIndicator />
        </View>
      </>
    );
  }

  return (
    <>
      <Stack.Screen options={{ title: "Traiter l'incident" }} />

      <KeyboardAwareScrollView
        className="flex-1 bg-background"
        contentContainerStyle={{ padding: 16 }}
        keyboardShouldPersistTaps="handled"
        bottomOffset={24}
      >
        <Controller
          control={control}
          name="status"
          render={({ field: { value, onChange } }) => (
            <ChipSelect
              label="Statut"
              options={STUDENT_INCIDENT_STATUSES.map((item) => ({
                id: item,
                label: INCIDENT_STATUS_LABELS[item],
              }))}
              value={value}
              onChange={(next) => next && onChange(next)}
            />
          )}
        />
        {errors.status && (
          <Text className="text-xs text-red-500 -mt-2 mb-3">{errors.status.message}</Text>
        )}

        {isClosing && (
          <Controller
            control={control}
            name="resolvedAt"
            render={({ field: { value, onChange } }) => (
              <DateField label="Date de résolution" value={value ?? null} onChange={onChange} />
            )}
          />
        )}

        <Text className="text-sm font-medium text-foreground-secondary mb-2">
          Gravité (1 à 5)
        </Text>
        <Controller
          control={control}
          name="severityLevel"
          render={({ field: { value, onChange } }) => (
            <TextInput
              value={value === undefined || value === null ? "" : String(value)}
              onChangeText={(text) => onChange(text ? (text as unknown as number) : null)}
              keyboardType="number-pad"
              placeholder="Optionnel"
              placeholderTextColor={colors.faint}
              className="h-11 border border-input rounded-lg px-3 mb-1 bg-card text-foreground"
            />
          )}
        />
        {errors.severityLevel ? (
          <Text className="text-xs text-red-500 mb-3">{errors.severityLevel.message}</Text>
        ) : (
          <View className="mb-3" />
        )}

        <Controller
          control={control}
          name="handledBy"
          render={({ field: { value, onChange } }) => (
            <ComboBox
              label="Pris en charge par"
              placeholder="Sélectionner un employé"
              options={employeeOptions}
              value={value ?? null}
              onChange={onChange}
              loading={employeesIsLoading}
            />
          )}
        />

        <SectionTitle>Mesures</SectionTitle>
        <Controller
          control={control}
          name="temporaryMeasureApplied"
          render={({ field: { value, onChange } }) => (
            <CheckboxRow label="Mesure temporaire appliquée" value={value} onChange={onChange} />
          )}
        />
        {temporaryMeasureApplied && (
          <TextAreaField
            control={control}
            name="temporaryMeasureDescription"
            label="Description de la mesure"
            placeholder="Mesure appliquée en attendant la décision"
            error={errors.temporaryMeasureDescription?.message}
          />
        )}
        <TextAreaField
          control={control}
          name="measuresTaken"
          label="Mesures prises"
          placeholder="Optionnel"
          error={errors.measuresTaken?.message}
        />

        <SectionTitle>Parents</SectionTitle>
        <Controller
          control={control}
          name="parentsNotified"
          render={({ field: { value, onChange } }) => (
            <CheckboxRow label="Parents notifiés" value={value} onChange={onChange} />
          )}
        />
        {parentsNotified && (
          <>
            <Controller
              control={control}
              name="parentsNotifiedAt"
              render={({ field: { value, onChange } }) => (
                <DateField label="Date de notification" value={value ?? null} onChange={onChange} />
              )}
            />
            {errors.parentsNotifiedAt && (
              <Text className="text-xs text-red-500 -mt-3 mb-3">
                {errors.parentsNotifiedAt.message}
              </Text>
            )}
            <Controller
              control={control}
              name="parentsNotifiedBy"
              render={({ field: { value, onChange } }) => (
                <ComboBox
                  label="Notifiés par"
                  placeholder="Sélectionner un employé"
                  options={employeeOptions}
                  value={value ?? null}
                  onChange={onChange}
                  loading={employeesIsLoading}
                />
              )}
            />
          </>
        )}

        <SectionTitle>Soutien psychologique</SectionTitle>
        <Controller
          control={control}
          name="psychologicalSupportRequired"
          render={({ field: { value, onChange } }) => (
            <CheckboxRow label="Soutien psychologique nécessaire" value={value} onChange={onChange} />
          )}
        />
        {psychologicalSupportRequired && (
          <TextAreaField
            control={control}
            name="psychologicalSupportNotes"
            label="Notes"
            placeholder="Suivi prévu"
            error={errors.psychologicalSupportNotes?.message}
          />
        )}

        <SectionTitle>Notes internes</SectionTitle>
        <TextAreaField
          control={control}
          name="internalNotes"
          label="Notes"
          placeholder="Optionnel"
          error={errors.internalNotes?.message}
        />

        {!isOnline && (
          <Text className="text-xs text-muted-foreground mb-2">
            Le traitement d&apos;un incident nécessite une connexion.
          </Text>
        )}

        <Pressable
          onPress={() => void handleSubmit(onSubmit)()}
          disabled={!canSubmit}
          className={`h-12 rounded-lg items-center justify-center mt-2 ${
            canSubmit ? "bg-foreground" : "bg-gray-300 dark:bg-zinc-700"
          }`}
        >
          {isBusy ? (
            <ActivityIndicator color={colors.background} />
          ) : (
            <Text className="text-background font-medium">Enregistrer</Text>
          )}
        </Pressable>
      </KeyboardAwareScrollView>
    </>
  );
}
