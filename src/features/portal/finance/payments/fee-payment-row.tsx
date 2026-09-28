import { formatShortDate } from "@/lib/format";
import type { PortalFeePaymentDTO } from "@/utils/types/objects/PortalFeePaymentDTO";
import { memo } from "react";
import { Pressable, Text, View } from "react-native";
import { getFeePaymentDesignation, getFeePaymentInstallmentLabel } from "./fee-payment-designation";
import { FeePaymentStatusPill } from "./fee-payment-status-pill";

type FeePaymentRowProps = {
  feePayment: PortalFeePaymentDTO;
  onPress?: (feePayment: PortalFeePaymentDTO) => void;
};

function FeePaymentRowComponent({ feePayment, onPress }: FeePaymentRowProps) {
  const hasRemaining =
    feePayment.amountRemaining != null && parseFloat(feePayment.amountRemaining) > 0;
  const installmentLabel = getFeePaymentInstallmentLabel(feePayment);

  return (
    <Pressable
      onPress={() => onPress?.(feePayment)}
      className="mx-4 mt-3 px-4 py-3 rounded-xl border border-border bg-card"
    >
      <View className="flex-row items-center justify-between gap-3">
        <Text className="flex-1 text-sm font-medium text-foreground" numberOfLines={2}>
          {getFeePaymentDesignation(feePayment)}
        </Text>
        <FeePaymentStatusPill status={feePayment.paymentStatus} label={feePayment.paymentStatusStr} />
      </View>

      {installmentLabel && (
        <Text className="text-xs text-faint mt-0.5">{installmentLabel}</Text>
      )}

      <View className="flex-row items-baseline justify-between gap-3 mt-2">
        <View className="flex-row items-baseline gap-1">
          <Text className="text-base font-bold text-foreground">
            {feePayment.amountPaidStr ?? "—"}
          </Text>
          <Text className="text-xs text-faint">/ {feePayment.amountDueStr ?? "—"}</Text>
        </View>
        <Text
          className={`text-sm font-semibold ${hasRemaining ? "text-red-600" : "text-faint"}`}
        >
          Reste {feePayment.amountRemainingStr ?? "—"}
        </Text>
      </View>

      <Text className="text-xs text-faint mt-1">
        Échéance : {formatShortDate(feePayment.dueDate)}
        {feePayment.receiptNumber ? ` · Reçu ${feePayment.receiptNumber}` : ""}
      </Text>
    </Pressable>
  );
}

export const FeePaymentRow = memo(FeePaymentRowComponent);
