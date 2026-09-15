import { Toast } from "@/components/toast";
import { Enrollment } from "@/utils/types/Enrollment";
import Ionicons from "@expo/vector-icons/Ionicons";
import { ActivityIndicator, Modal, Pressable, ScrollView, Text, View } from "react-native";

type StudentEnrollmentDialogProps = {
  visible: boolean;
  onClose: () => void;
  enrollments: Enrollment[];
  loading: boolean;
  selectedStudentId: string | null | undefined;
  onSelect: (enrollment: Enrollment) => void;
};

export function StudentEnrollmentDialog({
  visible,
  onClose,
  enrollments,
  loading,
  selectedStudentId,
  onSelect,
}: StudentEnrollmentDialogProps) {
  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View className="flex-1 bg-white">
        <View className="flex-row items-center justify-between px-4 pt-14 pb-3 border-b border-gray-100">
          <Text className="text-base font-semibold">Choisir un enfant</Text>
          <Pressable onPress={onClose} hitSlop={8}>
            <Ionicons name="close" size={22} color="#374151" />
          </Pressable>
        </View>

        <ScrollView className="flex-1" contentContainerStyle={{ padding: 16 }}>
          {loading ? (
            <View className="py-8">
              <ActivityIndicator />
            </View>
          ) : enrollments.length === 0 ? (
            <Text className="text-sm text-gray-400 text-center py-8">
              Aucun élève inscrit pour cette année scolaire.
            </Text>
          ) : (
            <View className="border border-gray-200 rounded-xl overflow-hidden">
              {enrollments.map((enrollment, index) => {
                const selected = enrollment.studentId === selectedStudentId;
                const classLabel =
                  enrollment.schoolClass?.title ??
                  enrollment.schoolClass?.abbreviation ??
                  "Classe non renseignée";

                return (
                  <Pressable
                    key={enrollment.id}
                    onPress={() => onSelect(enrollment)}
                    className={`flex-row items-center gap-3 px-4 py-3 ${
                      index > 0 ? "border-t border-gray-100" : ""
                    } ${selected ? "bg-gray-50" : ""}`}
                  >
                    <View className="flex-1">
                      <Text className="text-sm font-medium text-black" numberOfLines={1}>
                        {enrollment.student.fullName ?? "Élève"}
                      </Text>
                      <Text className="text-xs text-gray-500 mt-0.5" numberOfLines={1}>
                        {classLabel}
                      </Text>
                    </View>
                    {selected && (
                      <Ionicons name="checkmark" size={18} color="#16A34A" />
                    )}
                  </Pressable>
                );
              })}
            </View>
          )}
        </ScrollView>
      </View>
      <Toast />
    </Modal>
  );
}
