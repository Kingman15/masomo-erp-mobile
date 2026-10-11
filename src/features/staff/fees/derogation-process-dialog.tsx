import { DateField } from "@/components/list/date-field";
import { Toast } from "@/components/toast";
import { useProcessDerogation } from "@/hooks/queries/items/fee-payment";
import { useThemeColors } from "@/hooks/use-theme-colors";
import { formatShortDate } from "@/lib/format";
import { handleApiError } from "@/lib/handle-api-error";
import { toastNotify } from "@/lib/toast";
import {
  feePaymentDerogationProcessSchema,
  type FeePaymentDerogationProcessFormValues,
} from "@/utils/schemas/fee-payment-derogation-schema";
import type { FeePaymentDerogation } from "@/utils/types/FeePayment";
import Ionicons from "@expo/vector-icons/Ionicons";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { ActivityIndicator, Modal, Pressable, Text, TextInput, View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { getEnrollmentLabel, toDateOnly } from "../attendance/attendance-labels";
import { ChoiceList } from "./choice-list";

type DerogationProcessDialogProps = {
  derogation: FeePaymentDerogation | null;
  visible: boolean;
  onClose: () => void;
};

const DECISIONS: { id: FeePaymentDerogationProcessFormValues["status"]; label: string; description: string }[] = [
  { id: "approved", label: "Accorder", description: "Le parent peut payer jusqu'à la date fixée." },
  { id: "rejected", label: "Refuser", description: "La tranche reste exigible à son échéance." },
];

const DEFAULT_VALUES: FeePaymentDerogationProcessFormValues = { status: "approved", expirationDate: null, comments: null };

// Décision sur une demande en attente : accorder avec un délai, ou refuser.
export function DerogationProcessDialog({ derogation, visible, onClose }: DerogationProcessDialogProps) {
  const colors = useThemeColors();
  const { processDerogation, processDerogationIsPending } = useProcessDerogation();

  const { control, handleSubmit, reset, formState: { errors } } =
    useForm<FeePaymentDerogationProcessFormValues>({
      resolver: zodResolver(feePaymentDerogationProcessSchema),
      defaultValues: DEFAULT_VALUES,
    });
  const status = useWatch({ control, name: "status" });

  useEffect(() => {
    // Délai accordé pré-rempli avec celui demandé par le parent : l'école le garde ou le raccourcit.
    if (visible) reset({ ...DEFAULT_VALUES, expirationDate: derogation?.expirationDate?.slice(0, 10) ?? null });
  }, [visible, reset, derogation]);

  const submit = async (values: FeePaymentDerogationProcessFormValues) => {
    if (!derogation) return;
    try {
      await processDerogation({
        id: derogation.id,
        status: values.status,
        decisionDate: toDateOnly(new Date()) as string,
        expirationDate: values.expirationDate ?? null,
        comments: values.comments || null,
      });
      toastNotify(values.status === "approved" ? "Délai accordé." : "Demande refusée.", "success");
      onClose();
    } catch (error) {
      handleApiError(error);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View className="flex-1 bg-background">
        <View className="flex-row items-center justify-between px-4 pt-14 pb-3 border-b border-divider">
          <Text className="text-base font-semibold text-foreground">Traiter la demande</Text>
          <Pressable onPress={onClose} hitSlop={8}>
            <Ionicons name="close" size={22} color={colors.foregroundSecondary} />
          </Pressable>
        </View>

        {derogation && (
          <KeyboardAwareScrollView
            className="flex-1"
            contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
            keyboardShouldPersistTaps="handled"
            bottomOffset={24}
          >
            <View className="rounded-xl bg-subtle px-4 py-3 mb-5">
              <Text className="text-base font-semibold text-foreground">{getEnrollmentLabel(derogation.enrollment)}</Text>
              <Text className="text-sm text-muted-foreground mt-0.5">
                {derogation.feeInstallment?.fullDesignation ?? "Frais"}
              </Text>
              <Text className="text-xs text-faint mt-1.5">
                Demandée le {formatShortDate(derogation.requestDate)}
                {derogation.expirationDate ? ` · délai demandé jusqu'au ${formatShortDate(derogation.expirationDate)}` : ""}
              </Text>
              {derogation.reason ? (
                <Text className="text-sm text-foreground-secondary mt-2">{derogation.reason}</Text>
              ) : null}
            </View>

            <Text className="text-sm font-medium text-foreground-secondary mb-2">Décision</Text>
            <Controller
              control={control}
              name="status"
              render={({ field: { value, onChange } }) => (
                <ChoiceList options={DECISIONS} value={value} onChange={onChange} />
              )}
            />

            {status === "approved" && (
              <View className="mt-5">
                {/* DateField occupe flex-1 : dans une ligne, sinon sa hauteur s'effondre et il chevauche le champ suivant. */}
                <View className="flex-row">
                  <Controller
                    control={control}
                    name="expirationDate"
                    render={({ field: { value, onChange } }) => (
                      <DateField label="Délai accordé jusqu'au" value={value} onChange={onChange} minimumDate={new Date()} />
                    )}
                  />
                </View>
                {errors.expirationDate && (
                  <Text className="text-xs text-red-500 mt-1">{errors.expirationDate.message}</Text>
                )}
              </View>
            )}

            <Text className="text-sm font-medium text-foreground-secondary mt-5 mb-2">Commentaire (optionnel)</Text>
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
                  className="min-h-[80px] border border-input rounded-lg px-3 py-2 bg-card text-foreground"
                />
              )}
            />
            {errors.comments && <Text className="text-xs text-red-500 mt-1">{errors.comments.message}</Text>}

            <Pressable
              onPress={() => void handleSubmit(submit)()}
              disabled={processDerogationIsPending}
              className={`h-12 rounded-lg items-center justify-center mt-8 ${
                processDerogationIsPending ? "bg-gray-300 dark:bg-zinc-700" : "bg-foreground"
              }`}
            >
              {processDerogationIsPending ? (
                <ActivityIndicator color={colors.background} />
              ) : (
                <Text className="text-background font-medium">Enregistrer la décision</Text>
              )}
            </Pressable>
          </KeyboardAwareScrollView>
        )}
      </View>
      <Toast />
    </Modal>
  );
}
