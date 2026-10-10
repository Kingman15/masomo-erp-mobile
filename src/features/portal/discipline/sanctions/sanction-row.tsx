import { SanctionStatusPill } from "@/features/staff/sanctions/sanction-status-pill";
import { formatShortDate } from "@/lib/format";
import { PortalSanctionDTO } from "@/utils/types/objects/PortalSanctionDTO";
import { memo } from "react";
import { Pressable, Text, View } from "react-native";

type SanctionRowProps = {
  sanction: PortalSanctionDTO;
  onPress?: (sanction: PortalSanctionDTO) => void;
};

function SanctionRowComponent({ sanction, onPress }: SanctionRowProps) {
  return (
    <Pressable
      onPress={() => onPress?.(sanction)}
      className="px-4 py-3 border-b border-divider bg-card"
    >
      <View className="flex-row items-center justify-between gap-3">
        <Text className="flex-1 text-sm font-medium text-foreground" numberOfLines={1}>
          {sanction.sanctionType ?? "Sanction"}
        </Text>
        <SanctionStatusPill status={sanction.status} />
      </View>

      {sanction.regulationArticle && (
        <Text className="text-xs text-faint mt-0.5">
          Article : {sanction.regulationArticle}
        </Text>
      )}

      <Text className="text-xs text-faint mt-0.5">
        {formatShortDate(sanction.startsAt)}
        {sanction.endsAt ? ` → ${formatShortDate(sanction.endsAt)}` : ""}
      </Text>

      {sanction.incident && (
        <Text className="text-xs text-faint mt-0.5" numberOfLines={1}>
          Incident : {sanction.incident.incidentType ?? "Incident"}
          {sanction.incident.occurredAt
            ? ` · ${formatShortDate(sanction.incident.occurredAt)}`
            : ""}
        </Text>
      )}
    </Pressable>
  );
}

export const SanctionRow = memo(SanctionRowComponent);
