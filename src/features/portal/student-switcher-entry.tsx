import Ionicons from "@expo/vector-icons/Ionicons";
import { useState } from "react";
import { ActivityIndicator, Pressable, Text, View } from "react-native";
import { StudentSwitcherPanel } from "./student-switcher-panel";
import { usePortalSelection } from "./use-portal-selection";

export function StudentSwitcherEntry() {
  const [panelOpen, setPanelOpen] = useState(false);
  const {
    selectedStudent,
    selectedSchoolYear,
    selectedSchoolClass,
    studentsIsLoading,
    studentsError,
    loadStudents,
  } = usePortalSelection();

  if (studentsIsLoading && !selectedStudent) {
    return (
      <View className="flex-row items-center gap-2 px-4 py-3 mb-4 rounded-2xl border border-gray-200 bg-white">
        <ActivityIndicator size="small" />
        <Text className="text-sm text-gray-500">Chargement des élèves …</Text>
      </View>
    );
  }

  if (studentsError) {
    return (
      <Pressable
        onPress={() => loadStudents()}
        className="flex-row items-center justify-between px-4 py-3 mb-4 rounded-2xl border border-red-200 bg-red-50"
      >
        <Text className="text-sm text-red-600 flex-1" numberOfLines={2}>
          Impossible de charger les élèves. Toucher pour réessayer.
        </Text>
        <Ionicons name="refresh" size={18} color="#dc2626" />
      </Pressable>
    );
  }

  const subtitle = [
    selectedSchoolYear?.title,
    selectedSchoolClass?.title ?? selectedSchoolClass?.abbreviation,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <>
      <Pressable
        onPress={() => setPanelOpen((open) => !open)}
        className="flex-row items-center justify-between px-4 py-3 mb-2 rounded-2xl border border-gray-200 bg-white active:bg-gray-50"
      >
        <View className="flex-1">
          <Text
            className="text-base font-semibold text-gray-900"
            numberOfLines={1}
          >
            {selectedStudent?.fullName ?? "Sélectionner un élève"}
          </Text>
          {!!subtitle && (
            <Text className="text-xs text-gray-500 mt-0.5" numberOfLines={1}>
              {subtitle}
            </Text>
          )}
        </View>
        <Ionicons
          name={panelOpen ? "chevron-up" : "chevron-down"}
          size={18}
          color="#9CA3AF"
        />
      </Pressable>

      {panelOpen && (
        <StudentSwitcherPanel onClose={() => setPanelOpen(false)} />
      )}
    </>
  );
}
