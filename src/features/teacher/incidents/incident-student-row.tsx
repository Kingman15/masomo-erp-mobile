import { INCIDENT_STUDENT_ROLE_LABELS } from "@/utils/types/IncidentStudent";
import type { IncidentStudentFormValues } from "@/utils/schemas/teacher-student-incident-schema";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Pressable, Text, View } from "react-native";

type IncidentStudentRowProps = {
  incidentStudent: IncidentStudentFormValues;
  onPress: () => void;
  onDelete: () => void;
};

export function IncidentStudentRow({
  incidentStudent,
  onPress,
  onDelete,
}: IncidentStudentRowProps) {
  return (
    <Pressable
      onPress={onPress}
      className="flex-row items-center gap-3 px-3 py-3 border border-gray-200 rounded-lg mb-2 bg-white"
    >
      <View className="flex-1">
        <View className="flex-row items-center gap-2">
          <Text className="flex-1 text-sm font-medium text-black" numberOfLines={1}>
            {incidentStudent.studentLabel ?? "Élève"}
          </Text>
          <View className="px-2 py-0.5 rounded-full bg-gray-100">
            <Text className="text-xs text-gray-600">
              {INCIDENT_STUDENT_ROLE_LABELS[incidentStudent.role]}
            </Text>
          </View>
        </View>
        {incidentStudent.notes && (
          <Text className="text-xs text-gray-400 mt-0.5" numberOfLines={1}>
            {incidentStudent.notes}
          </Text>
        )}
      </View>

      <Pressable onPress={onDelete} hitSlop={8} className="p-1">
        <Ionicons name="trash-outline" size={18} color="#EF4444" />
      </Pressable>
    </Pressable>
  );
}
