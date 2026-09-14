import { formatShortDate } from "@/lib/format";
import type { PortalFeePaymentDerogationDTO } from "@/utils/types/objects/PortalFeePaymentDerogationDTO";
import { memo } from "react";
import { Pressable, Text, View } from "react-native";
import {
  getFeePaymentDerogationDesignation,
  getFeePaymentDerogationInstallmentLabel,
} from "./fee-payment-derogation-designation";
import { FeePaymentDerogationStatusPill } from "./fee-payment-derogation-status-pill";

type WaiverRowProps = {
  feePaymentDerogation: PortalFeePaymentDerogationDTO;
  onPress?: (feePaymentDerogation: PortalFeePaymentDerogationDTO) => void;
};

function WaiverRowComponent({ feePaymentDerogation, onPress }: WaiverRowProps) {
  const installmentLabel = getFeePaymentDerogationInstallmentLabel(feePaymentDerogation);

  return (
    <Pressable
      onPress={() => onPress?.(feePaymentDerogation)}
      className="mx-4 mt-3 px-4 py-3 rounded-xl border border-gray-200 bg-white"
    >
      <View className="flex-row items-center justify-between gap-3">
        <Text className="flex-1 text-sm font-medium text-black" numberOfLines={2}>
          {getFeePaymentDerogationDesignation(feePaymentDerogation)}
        </Text>
        <FeePaymentDerogationStatusPill
          status={feePaymentDerogation.status}
          label={feePaymentDerogation.statusStr}
        />
      </View>

      {installmentLabel && (
        <Text className="text-xs text-gray-400 mt-0.5">{installmentLabel}</Text>
      )}

      {feePaymentDerogation.reason && (
        <Text className="text-sm text-gray-600 mt-2" numberOfLines={2}>
          {feePaymentDerogation.reason}
        </Text>
      )}

      <Text className="text-xs text-gray-400 mt-2">
        Demandée le : {formatShortDate(feePaymentDerogation.requestDate)}
        {feePaymentDerogation.expirationDate
          ? ` · Expire le ${formatShortDate(feePaymentDerogation.expirationDate)}`
          : ""}
      </Text>
    </Pressable>
  );
}

export const WaiverRow = memo(WaiverRowComponent);
