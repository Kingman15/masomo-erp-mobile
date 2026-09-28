import { useThemeColors } from "@/hooks/use-theme-colors";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useState } from "react";
import { ActivityIndicator, Pressable, Text, View } from "react-native";
import { StudentSwitcherPanel } from "./student-switcher-panel";
import { usePortalSelection } from "./use-portal-selection";

export function StudentSwitcherEntry() {
  const colors = useThemeColors();
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
      <View className="flex-row items-center gap-2 px-4 py-3 mb-4 rounded-2xl border border-border bg-card">
        <ActivityIndicator size="small" />
        <Text className="text-sm text-muted-foreground">Chargement des élèves …</Text>
      </View>
    );
  }

  if (studentsError) {
    return (
      <Pressable
        onPress={() => loadStudents()}
        className="flex-row items-center justify-between px-4 py-3 mb-4 rounded-2xl border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950"
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
        className="flex-row items-center justify-between px-4 py-3 mb-2 rounded-2xl border border-border bg-card active:bg-subtle"
      >
        <View className="flex-1">
          <Text
            className="text-base font-semibold text-foreground"
            numberOfLines={1}
          >
            {selectedStudent?.fullName ?? "Sélectionner un élève"}
          </Text>
          {!!subtitle && (
            <Text className="text-xs text-muted-foreground mt-0.5" numberOfLines={1}>
              {subtitle}
            </Text>
          )}
        </View>
        <Ionicons
          name={panelOpen ? "chevron-up" : "chevron-down"}
          size={18}
          color={colors.faint}
        />
      </Pressable>

      {panelOpen && (
        <StudentSwitcherPanel onClose={() => setPanelOpen(false)} />
      )}
    </>
  );
}
