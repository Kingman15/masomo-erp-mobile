import { ComboBox } from "@/components/list/combo-box";
import { DateField } from "@/components/list/date-field";
import { useEnrollmentById, useEnrollments } from "@/hooks/queries/items/enrollment";
import { useEnrollmentDerogations, useFeeSchedules, useStoreDerogation } from "@/hooks/queries/items/fee-payment";
import { useSchoolClasses } from "@/hooks/queries/items/school-class";
import { useCurrentSchoolYear } from "@/hooks/queries/items/school-year";
import { useCan } from "@/hooks/use-can";
import { useThemeColors } from "@/hooks/use-theme-colors";
import { handleApiError } from "@/lib/handle-api-error";
import { toastNotify } from "@/lib/toast";
import {
  feePaymentDerogationRequestSchema,
  type FeePaymentDerogationRequestFormValues,
} from "@/utils/schemas/fee-payment-derogation-schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { router, Stack, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { ActivityIndicator, Pressable, Text, TextInput, View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { getEnrollmentLabel, getSchoolClassLabel, toDateOnly } from "../attendance/attendance-labels";
import { ChoiceList } from "./choice-list";

const DECISIONS: { id: FeePaymentDerogationRequestFormValues["status"]; label: string; description: string }[] = [
  { id: "approved", label: "Accorder", description: "Le parent peut payer jusqu'à la date fixée." },
  { id: "rejected", label: "Refuser", description: "La tranche reste exigible à son échéance." },
  { id: "pending", label: "Laisser en attente", description: "La décision sera prise plus tard." },
];

const inputClassName = "min-h-[80px] border border-input rounded-lg px-3 py-2 bg-card text-foreground";

function FieldLabel({ children }: { children: string }) {
  return <Text className="text-sm font-medium text-foreground-secondary mt-5 mb-2">{children}</Text>;
}

// Ajout d'une dérogation (délai de paiement) sur une tranche non soldée.
// Ouvert depuis la fiche frais d'un élève (?enrollmentId=…, élève fixé) ou depuis la liste (classe puis élève).
// Sans schoolFees.derogations.process, c'est une demande en attente ; avec, la décision est prise tout de suite.
export function DerogationFormScreen() {
  const colors = useThemeColors();
  const params = useLocalSearchParams<{ enrollmentId?: string }>();
  const canProcess = useCan("schoolFees.derogations.process");

  const { currentSchoolYear } = useCurrentSchoolYear();
  const schoolYearId = currentSchoolYear?.id ?? null;

  const [schoolClassId, setSchoolClassId] = useState<string | null>(null);
  const [pickedEnrollmentId, setPickedEnrollmentId] = useState<string | null>(null);
  const enrollmentId = params.enrollmentId ?? pickedEnrollmentId;

  const { schoolClasses, schoolClassesIsLoading } = useSchoolClasses({
    filters: { schoolYearId },
    enabled: Boolean(schoolYearId) && !params.enrollmentId,
  });
  const { enrollments, enrollmentsIsLoading } = useEnrollments({
    filters: { schoolYearId, schoolClassId, sortBy: "student_name", sortDirection: "asc" },
    enabled: Boolean(schoolYearId && schoolClassId),
  });
  const { enrollment } = useEnrollmentById(enrollmentId ?? undefined);

  const { feeSchedules, feeSchedulesIsLoading } = useFeeSchedules({
    filters: {
      studentId: enrollment?.studentId ?? null,
      schoolYearId: enrollment?.schoolYearId ?? null,
      schoolClassId: enrollment?.schoolClassId ?? null,
      sortBy: "dueDate",
    },
  });
  const { derogations } = useEnrollmentDerogations({
    enrollmentId: enrollment?.id,
    schoolYearId: enrollment?.schoolYearId,
  });

  // Tranches possibles : non soldées et sans demande en attente ni délai accordé.
  const installments = (feeSchedules ?? []).filter(
    (schedule) =>
      schedule.feeInstallmentId &&
      schedule.status !== "paid" &&
      !(derogations ?? []).some(
        (derogation) =>
          derogation.feeInstallmentId === schedule.feeInstallmentId &&
          (derogation.status === "pending" || derogation.status === "approved"),
      ),
  );

  const { storeDerogation, storeDerogationIsPending } = useStoreDerogation();
  const { control, handleSubmit, setValue, formState: { errors } } =
    useForm<FeePaymentDerogationRequestFormValues>({
      resolver: zodResolver(feePaymentDerogationRequestSchema),
      defaultValues: {
        feeInstallmentId: "",
        reason: null,
        status: canProcess ? "approved" : "pending",
        expirationDate: "",
        comments: null,
      },
    });
  const status = useWatch({ control, name: "status" });

  const changeSchoolClass = (id: string | null) => {
    setSchoolClassId(id);
    setPickedEnrollmentId(null);
    setValue("feeInstallmentId", "");
  };
  const changeEnrollment = (id: string | null) => {
    setPickedEnrollmentId(id);
    setValue("feeInstallmentId", "");
  };

  const submit = async (values: FeePaymentDerogationRequestFormValues) => {
    if (!enrollment) return;
    try {
      await storeDerogation({
        schoolYearId: enrollment.schoolYearId,
        studentId: enrollment.studentId,
        feeInstallmentId: values.feeInstallmentId,
        requestDate: toDateOnly(new Date()) as string,
        reason: values.reason || null,
        status: values.status,
        expirationDate: values.expirationDate,
        comments: values.status === "pending" ? null : values.comments || null,
      });
      toastNotify(
        values.status === "approved"
          ? "Dérogation accordée."
          : values.status === "rejected"
            ? "Dérogation enregistrée comme refusée."
            : "Demande de dérogation envoyée.",
        "success",
      );
      router.back();
    } catch (error) {
      handleApiError(error);
    }
  };

  return (
    <>
      <Stack.Screen options={{ title: canProcess ? "Nouvelle dérogation" : "Demander une dérogation" }} />

      {/* KeyboardProvider (racine) empêche la fenêtre de se redimensionner : un ScrollView simple resterait caché sous le clavier. */}
      <KeyboardAwareScrollView
        className="flex-1 bg-background"
        contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
        keyboardShouldPersistTaps="handled"
        bottomOffset={24}
      >
          {params.enrollmentId ? (
            <View className="rounded-xl bg-subtle px-4 py-3">
              <Text className="text-base font-semibold text-foreground">{getEnrollmentLabel(enrollment)}</Text>
              <Text className="text-sm text-muted-foreground mt-0.5">
                {getSchoolClassLabel(enrollment?.schoolClass)}
              </Text>
            </View>
          ) : (
            <>
              <ComboBox
                label="Classe"
                placeholder="Sélectionner une classe"
                options={(schoolClasses ?? []).map((schoolClass) => ({
                  id: schoolClass.id,
                  label: getSchoolClassLabel(schoolClass),
                }))}
                value={schoolClassId}
                onChange={changeSchoolClass}
                loading={schoolClassesIsLoading}
              />
              {schoolClassId && (
                <ComboBox
                  label="Élève"
                  placeholder="Sélectionner un élève"
                  options={(enrollments ?? []).map((item) => ({ id: item.id, label: getEnrollmentLabel(item) }))}
                  value={pickedEnrollmentId}
                  onChange={changeEnrollment}
                  loading={enrollmentsIsLoading}
                />
              )}
            </>
          )}

          {enrollment && (
            <>
              <FieldLabel>Tranche concernée</FieldLabel>
              {feeSchedulesIsLoading ? (
                <ActivityIndicator />
              ) : installments.length === 0 ? (
                <Text className="text-sm text-faint">
                  Aucune tranche à régler sans dérogation en cours pour cet élève.
                </Text>
              ) : (
                <Controller
                  control={control}
                  name="feeInstallmentId"
                  render={({ field: { value, onChange } }) => (
                    <ChoiceList
                      options={installments.map((installment) => ({
                        id: installment.feeInstallmentId as string,
                        label: installment.label ?? "Tranche",
                        description: installment.amountRemainingStr ? `Reste ${installment.amountRemainingStr}` : null,
                      }))}
                      value={value || null}
                      onChange={onChange}
                    />
                  )}
                />
              )}
              {errors.feeInstallmentId && (
                <Text className="text-xs text-red-500 mt-1">{errors.feeInstallmentId.message}</Text>
              )}

              <FieldLabel>Motif</FieldLabel>
              <Controller
                control={control}
                name="reason"
                render={({ field: { value, onChange } }) => (
                  <TextInput
                    value={value ?? ""}
                    onChangeText={onChange}
                    multiline
                    placeholder="Ex. : le parent paiera à la fin du mois"
                    placeholderTextColor={colors.faint}
                    textAlignVertical="top"
                    className={inputClassName}
                  />
                )}
              />
              {errors.reason && <Text className="text-xs text-red-500 mt-1">{errors.reason.message}</Text>}

              {/* Délai demandé par le parent, toujours saisi ; à l'accord immédiat, c'est le délai accordé (raccourci au besoin).
                  DateField occupe flex-1 : dans une ligne, sinon sa hauteur s'effondre. */}
              <View className="mt-5 flex-row">
                <Controller
                  control={control}
                  name="expirationDate"
                  render={({ field: { value, onChange } }) => (
                    <DateField
                      label={status === "approved" ? "Délai accordé jusqu'au" : "Délai demandé jusqu'au"}
                      value={value || null}
                      onChange={(next) => onChange(next ?? "")}
                      minimumDate={new Date()}
                    />
                  )}
                />
              </View>
              {errors.expirationDate && (
                <Text className="text-xs text-red-500 mt-1">{errors.expirationDate.message}</Text>
              )}

              {canProcess ? (
                <>
                  <FieldLabel>Décision</FieldLabel>
                  <Controller
                    control={control}
                    name="status"
                    render={({ field: { value, onChange } }) => (
                      <ChoiceList options={DECISIONS} value={value} onChange={onChange} />
                    )}
                  />

                  {status !== "pending" && (
                    <>
                      <FieldLabel>Commentaire (optionnel)</FieldLabel>
                      <Controller
                        control={control}
                        name="comments"
                        render={({ field: { value, onChange } }) => (
                          <TextInput
                            value={value ?? ""}
                            onChangeText={onChange}
                            multiline
                            placeholderTextColor={colors.faint}
                            textAlignVertical="top"
                            className={inputClassName}
                          />
                        )}
                      />
                      {errors.comments && (
                        <Text className="text-xs text-red-500 mt-1">{errors.comments.message}</Text>
                      )}
                    </>
                  )}
                </>
              ) : (
                <Text className="text-xs text-faint mt-3">
                  La demande part en attente : la personne qui la valide accorde ce délai ou le raccourcit.
                </Text>
              )}

              <Pressable
                onPress={() => void handleSubmit(submit)()}
                disabled={storeDerogationIsPending || installments.length === 0}
                className={`h-12 rounded-lg items-center justify-center mt-8 ${
                  storeDerogationIsPending || installments.length === 0 ? "bg-gray-300 dark:bg-zinc-700" : "bg-foreground"
                }`}
              >
                {storeDerogationIsPending ? (
                  <ActivityIndicator color={colors.background} />
                ) : (
                  <Text className="text-background font-medium">
                    {status === "pending" ? "Envoyer la demande" : "Enregistrer"}
                  </Text>
                )}
              </Pressable>
            </>
          )}
      </KeyboardAwareScrollView>
    </>
  );
}
