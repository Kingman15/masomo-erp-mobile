import {
  incidentToPayload,
  type IncidentSanctionPayload,
} from "@/api/endpoints/studentIncident";
import { CheckboxRow } from "@/components/list/checkbox-row";
import { ChipSelect } from "@/components/list/chip-select";
import { ComboBox } from "@/components/list/combo-box";
import { DateField } from "@/components/list/date-field";
import { useEmployeeOptions } from "@/hooks/queries/items/employee";
import { useSanctionTypes } from "@/hooks/queries/items/sanction-type";
import {
  useStudentIncidentById,
  useUpdateStudentIncident,
} from "@/hooks/queries/items/student-incident";
import { useConfirm } from "@/hooks/use-confirm";
import { useThemeColors } from "@/hooks/use-theme-colors";
import { handleApiError } from "@/lib/handle-api-error";
import { useIsOnline } from "@/lib/offline/use-offline-queue";
import { toastNotify } from "@/lib/toast";
import {
  studentIncidentSanctionSchema,
  type StudentIncidentSanctionFormValues,
} from "@/utils/schemas/student-incident-sanction-schema";
import {
  STUDENT_INCIDENT_SANCTION_STATUSES,
  type StudentIncidentSanction,
} from "@/utils/types/StudentIncidentSanction";
import { zodResolver } from "@hookform/resolvers/zod";
import { router, Stack, useLocalSearchParams } from "expo-router";
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
import { SANCTION_STATUS_CONFIG } from "../sanctions/sanction-status-pill";

function dateOnly(value: string | null | undefined): string | null {
  return value ? value.slice(0, 10) : null;
}

function today(): string {
  const now = new Date();
  const pad = (value: number) => String(value).padStart(2, "0");
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}

function toFormValues(
  sanction: StudentIncidentSanction | undefined,
  defaultStudentId: string | null,
): StudentIncidentSanctionFormValues {
  return {
    studentId: sanction?.studentId ?? defaultStudentId ?? "",
    sanctionTypeId: sanction?.sanctionTypeId ?? "",
    status: sanction?.status ?? "pending",
    startsAt: dateOnly(sanction?.startsAt),
    endsAt: dateOnly(sanction?.endsAt),
    decidedAt: dateOnly(sanction?.decidedAt) ?? today(),
    decidedBy: sanction?.decidedBy ?? null,
    justification: sanction?.justification ?? null,
    notes: sanction?.notes ?? null,
    parentsNotified: sanction?.parentsNotified ?? false,
    parentsNotifiedAt: dateOnly(sanction?.parentsNotifiedAt),
  };
}

// Ajout ou modification d'une sanction d'un incident ; en ligne uniquement.
// L'API n'a pas de route propre aux sanctions : elles passent par la mise à jour de l'incident (une ligne, avec `_delete` pour supprimer).
export function IncidentSanctionFormScreen() {
  const colors = useThemeColors();
  const isOnline = useIsOnline();
  const { confirm, ConfirmDialog } = useConfirm();
  const { id, sanctionId } = useLocalSearchParams<{ id: string; sanctionId?: string }>();
  const { studentIncident, studentIncidentIsLoading } = useStudentIncidentById(id);

  const sanction = studentIncident?.sanctions?.find((item) => item.id === sanctionId);
  const isEditing = Boolean(sanctionId);

  // Seuls les élèves de l'incident peuvent être sanctionnés (le serveur rattache la sanction à leur ligne).
  const studentOptions = useMemo(
    () =>
      (studentIncident?.incidentStudents ?? [])
        .filter((item) => item.studentId)
        .map((item) => ({
          id: item.studentId as string,
          label: item.student?.fullName ?? item.student?.fullDesignation ?? "Élève",
        })),
    [studentIncident],
  );

  const {
    control,
    handleSubmit,
    watch,
    reset,
    setValue,
    setError,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<StudentIncidentSanctionFormValues>({
    resolver: zodResolver(studentIncidentSanctionSchema),
    defaultValues: toFormValues(undefined, null),
  });

  useEffect(() => {
    if (!studentIncident || isDirty) return;
    const defaultStudentId =
      studentIncident.mainStudentId ?? (studentOptions.length === 1 ? studentOptions[0].id : null);
    reset(toFormValues(sanction, defaultStudentId));
  }, [studentIncident, sanction, studentOptions, isDirty, reset]);

  const parentsNotified = watch("parentsNotified");
  const parentsNotifiedAt = watch("parentsNotifiedAt");

  useEffect(() => {
    if (parentsNotified && !parentsNotifiedAt) setValue("parentsNotifiedAt", today());
  }, [parentsNotified, parentsNotifiedAt, setValue]);

  const { sanctionTypes, sanctionTypesIsLoading } = useSanctionTypes();
  const { employees, employeesIsLoading } = useEmployeeOptions();

  const { updateStudentIncident, updateStudentIncidentIsPending } =
    useUpdateStudentIncident();
  const isBusy = updateStudentIncidentIsPending || isSubmitting;
  const canSubmit = Boolean(studentIncident) && isOnline && !isBusy;

  const save = async (sanctionPayload: IncidentSanctionPayload, message: string) => {
    if (!studentIncident) return;
    await updateStudentIncident({
      id: studentIncident.id,
      payload: { ...incidentToPayload(studentIncident), sanctions: [sanctionPayload] },
    });
    toastNotify(message, "success");
    router.back();
  };

  const onSubmit = async (data: StudentIncidentSanctionFormValues) => {
    try {
      await save(
        {
          id: sanction?.id ?? null,
          studentId: data.studentId,
          sanctionTypeId: data.sanctionTypeId,
          // Champs non saisis sur mobile : repris de la sanction existante.
          regulationArticleId: sanction?.regulationArticleId ?? null,
          isAppealed: sanction?.isAppealed ?? false,
          appealedAt: sanction?.appealedAt ?? null,
          appealNotes: sanction?.appealNotes ?? null,
          parentsNotifiedBy: data.parentsNotified ? (sanction?.parentsNotifiedBy ?? null) : null,
          startsAt: data.startsAt ?? null,
          endsAt: data.endsAt ?? null,
          status: data.status,
          justification: data.justification ?? null,
          notes: data.notes ?? null,
          decidedBy: data.decidedBy ?? null,
          decidedAt: data.decidedAt,
          parentsNotified: data.parentsNotified,
          parentsNotifiedAt: data.parentsNotified ? (data.parentsNotifiedAt ?? null) : null,
        },
        isEditing ? "Sanction modifiée avec succès." : "Sanction ajoutée avec succès.",
      );
    } catch (error) {
      handleApiError(error, {
        setFieldError: (field, message) =>
          setError(field as keyof StudentIncidentSanctionFormValues, { message }),
      });
    }
  };

  const onDelete = async () => {
    if (!sanction) return;
    const ok = await confirm({
      title: "Supprimer la sanction",
      description: "Cette sanction sera retirée de l'incident.",
      confirmText: "Supprimer",
      cancelText: "Annuler",
      variant: "destructive",
    });
    if (!ok) return;

    try {
      await save(
        {
          id: sanction.id,
          studentId: sanction.studentId ?? "",
          sanctionTypeId: sanction.sanctionTypeId,
          regulationArticleId: sanction.regulationArticleId,
          startsAt: sanction.startsAt,
          endsAt: sanction.endsAt,
          status: sanction.status ?? "pending",
          justification: sanction.justification,
          notes: sanction.notes,
          decidedBy: sanction.decidedBy,
          decidedAt: sanction.decidedAt ?? today(),
          isAppealed: sanction.isAppealed,
          appealedAt: sanction.appealedAt,
          appealNotes: sanction.appealNotes,
          parentsNotified: sanction.parentsNotified,
          parentsNotifiedAt: sanction.parentsNotifiedAt,
          parentsNotifiedBy: sanction.parentsNotifiedBy,
          delete: true,
        },
        "Sanction supprimée.",
      );
    } catch (error) {
      handleApiError(error);
    }
  };

  const title = isEditing ? "Modifier la sanction" : "Nouvelle sanction";

  if (studentIncidentIsLoading || !studentIncident || (isEditing && !sanction)) {
    return (
      <>
        <Stack.Screen options={{ title }} />
        <View className="flex-1 items-center justify-center bg-background">
          {studentIncidentIsLoading ? (
            <ActivityIndicator />
          ) : (
            <Text className="text-sm text-muted-foreground">Sanction introuvable.</Text>
          )}
        </View>
      </>
    );
  }

  return (
    <>
      <Stack.Screen options={{ title }} />

      <KeyboardAwareScrollView
        className="flex-1 bg-background"
        contentContainerStyle={{ padding: 16 }}
        keyboardShouldPersistTaps="handled"
        bottomOffset={24}
      >
        <Controller
          control={control}
          name="studentId"
          render={({ field: { value, onChange } }) => (
            <ComboBox
              label="Élève"
              placeholder="Sélectionner un élève"
              options={studentOptions}
              value={value || null}
              onChange={(next) => onChange(next ?? "")}
              emptyLabel="Aucun élève dans l'incident"
              error={errors.studentId?.message}
            />
          )}
        />

        <Controller
          control={control}
          name="sanctionTypeId"
          render={({ field: { value, onChange } }) => (
            <ComboBox
              label="Type de sanction"
              placeholder="Sélectionner un type"
              options={(sanctionTypes ?? []).map((type) => ({ id: type.id, label: type.name }))}
              value={value || null}
              onChange={(next) => onChange(next ?? "")}
              loading={sanctionTypesIsLoading}
              error={errors.sanctionTypeId?.message}
            />
          )}
        />

        <Controller
          control={control}
          name="status"
          render={({ field: { value, onChange } }) => (
            <ChipSelect
              label="Statut"
              options={STUDENT_INCIDENT_SANCTION_STATUSES.map((item) => ({
                id: item,
                label: SANCTION_STATUS_CONFIG[item].label,
              }))}
              value={value}
              onChange={(next) => next && onChange(next)}
            />
          )}
        />

        <View className="flex-row gap-3">
          <View className="flex-1">
            <Controller
              control={control}
              name="startsAt"
              render={({ field: { value, onChange } }) => (
                <DateField label="Début" value={value ?? null} onChange={onChange} />
              )}
            />
          </View>
          <View className="flex-1">
            <Controller
              control={control}
              name="endsAt"
              render={({ field: { value, onChange } }) => (
                <DateField label="Fin" value={value ?? null} onChange={onChange} />
              )}
            />
          </View>
        </View>
        {errors.endsAt && (
          <Text className="text-xs text-red-500 -mt-3 mb-3">{errors.endsAt.message}</Text>
        )}

        <Controller
          control={control}
          name="decidedAt"
          render={({ field: { value, onChange } }) => (
            <DateField label="Date de décision" value={value} onChange={(next) => onChange(next ?? "")} />
          )}
        />
        {errors.decidedAt && (
          <Text className="text-xs text-red-500 -mt-3 mb-3">{errors.decidedAt.message}</Text>
        )}

        <Controller
          control={control}
          name="decidedBy"
          render={({ field: { value, onChange } }) => (
            <ComboBox
              label="Décidée par"
              placeholder="Sélectionner un employé"
              options={(employees ?? []).map((employee) => ({
                id: employee.id,
                label: employee.fullName ?? "Employé",
              }))}
              value={value ?? null}
              onChange={onChange}
              loading={employeesIsLoading}
            />
          )}
        />

        <Text className="text-sm font-medium text-foreground-secondary mb-2">Justification</Text>
        <Controller
          control={control}
          name="justification"
          render={({ field: { value, onChange } }) => (
            <TextInput
              value={value ?? ""}
              onChangeText={(text) => onChange(text || null)}
              multiline
              textAlignVertical="top"
              placeholder="Optionnel"
              placeholderTextColor={colors.faint}
              className="min-h-[80px] border border-input rounded-lg px-3 py-2 mb-4 bg-card text-foreground"
            />
          )}
        />

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
          </>
        )}

        <Text className="text-sm font-medium text-foreground-secondary mb-2">Notes</Text>
        <Controller
          control={control}
          name="notes"
          render={({ field: { value, onChange } }) => (
            <TextInput
              value={value ?? ""}
              onChangeText={(text) => onChange(text || null)}
              multiline
              textAlignVertical="top"
              placeholder="Optionnel"
              placeholderTextColor={colors.faint}
              className="min-h-[80px] border border-input rounded-lg px-3 py-2 mb-4 bg-card text-foreground"
            />
          )}
        />

        {!isOnline && (
          <Text className="text-xs text-muted-foreground mb-2">
            L&apos;enregistrement d&apos;une sanction nécessite une connexion.
          </Text>
        )}

        <Pressable
          onPress={() => void handleSubmit(onSubmit)()}
          disabled={!canSubmit}
          className={`h-12 rounded-lg items-center justify-center ${
            canSubmit ? "bg-foreground" : "bg-gray-300 dark:bg-zinc-700"
          }`}
        >
          {isBusy ? (
            <ActivityIndicator color={colors.background} />
          ) : (
            <Text className="text-background font-medium">
              {isEditing ? "Enregistrer" : "Ajouter la sanction"}
            </Text>
          )}
        </Pressable>

        {isEditing && (
          <Pressable
            onPress={() => void onDelete()}
            disabled={!canSubmit}
            className="h-12 rounded-lg items-center justify-center mt-3 border border-red-300 dark:border-red-800"
          >
            <Text className="text-red-600 dark:text-red-400 font-medium">
              Supprimer la sanction
            </Text>
          </Pressable>
        )}
      </KeyboardAwareScrollView>

      <ConfirmDialog />
    </>
  );
}
