import { ENROLLMENT_STATUS_LABELS, type Enrollment } from "@/utils/types/Enrollment";
import { memo } from "react";
import { Pressable, Text, View } from "react-native";
import { getEnrollmentLabel, getSchoolClassLabel } from "../attendance/attendance-labels";

type EnrollmentRowProps = {
  enrollment: Enrollment;
  onPress?: (enrollment: Enrollment) => void;
};

function EnrollmentRowComponent({ enrollment, onPress }: EnrollmentRowProps) {
  // Seul un statut inhabituel est signalé : la plupart des inscriptions sont actives.
  const status =
    enrollment.status && enrollment.status !== "active"
      ? (ENROLLMENT_STATUS_LABELS[enrollment.status] ?? enrollment.status)
      : null;

  return (
    <Pressable
      onPress={() => onPress?.(enrollment)}
      className="px-4 py-3 border-b border-divider bg-card"
    >
      <View className="flex-row items-center justify-between gap-2">
        <Text className="flex-1 text-base font-semibold text-foreground" numberOfLines={1}>
          {getEnrollmentLabel(enrollment)}
        </Text>
        {status && (
          <View className="px-2.5 py-1 rounded-full bg-amber-100 dark:bg-amber-900/40">
            <Text className="text-xs font-medium text-amber-700 dark:text-amber-300">
              {status}
            </Text>
          </View>
        )}
      </View>
      <Text className="text-sm text-muted-foreground mt-0.5" numberOfLines={1}>
        {[getSchoolClassLabel(enrollment.schoolClass), enrollment.student?.registrationNo]
          .filter(Boolean)
          .join(" · ")}
      </Text>
    </Pressable>
  );
}

export const EnrollmentRow = memo(EnrollmentRowComponent);
