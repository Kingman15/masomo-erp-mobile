import { useCurrentSchoolYear } from "@/hooks/queries/items/school-year";
import { useTeachingCourses } from "@/hooks/queries/items/teaching-course";
import { useThemeColors } from "@/hooks/use-theme-colors";
import { useAuthStore } from "@/stores/auth";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Text, View } from "react-native";

/**
 * Enseignant sans cours ni titulariat sur l'année courante : situation possible (recrutement récent, affectations à venir),
 * on l'explique plutôt que de laisser des écrans vides. Le serveur ramène /teaching-courses aux cours de l'enseignant connecté.
 */
export function NoAssignmentAlert() {
  const user = useAuthStore((s) => s.user);
  const colors = useThemeColors();
  const isTeacher = user?.role.roleCategory === "teacher";

  const { currentSchoolYear } = useCurrentSchoolYear();
  const { teachingCourses } = useTeachingCourses({
    filters: { schoolYearId: currentSchoolYear?.id },
    enabled: isTeacher && Boolean(currentSchoolYear?.id),
  });

  if (!isTeacher || user?.isHomeroomTeacher || !currentSchoolYear || !teachingCourses || teachingCourses.length > 0) {
    return null;
  }

  return (
    <View className="flex-row gap-3 mt-3 p-4 rounded-2xl bg-subtle dark:bg-card border border-border">
      <Ionicons name="information-circle-outline" size={20} color={colors.mutedForeground} />
      <View className="flex-1 gap-1">
        <Text className="text-sm font-semibold text-foreground">Aucune classe ni aucun cours pour le moment</Text>
        <Text className="text-xs text-muted-foreground">
          Vous n'êtes titulaire d'aucune classe et aucun cours ne vous est attribué pour l'année scolaire {currentSchoolYear.title}. Vos
          écrans resteront vides jusqu'à ce que l'administration de l'école vous en affecte.
        </Text>
      </View>
    </View>
  );
}
