import { useEnrollments } from "@/hooks/queries/items/enrollment";
import { useSchoolClassById } from "@/hooks/queries/items/school-class";
import { useCurrentSchoolYear } from "@/hooks/queries/items/school-year";
import { useThemeColors } from "@/hooks/use-theme-colors";
import Ionicons from "@expo/vector-icons/Ionicons";
import { router, Stack, useLocalSearchParams } from "expo-router";
import { ActivityIndicator, Pressable, ScrollView, Text, View } from "react-native";
import { getSchoolClassLabel } from "../attendance/attendance-labels";
import { classEnrollmentsFilters } from "../attendance/class-enrollments";
import { EnrollmentRow } from "../students/enrollment-row";
import { getHomeroomTeachersLabel } from "./class-labels";

type InfoRowProps = {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string | null | undefined;
};

function InfoRow({ icon, label, value }: InfoRowProps) {
  const colors = useThemeColors();
  return (
    <View className="flex-row items-center gap-3 py-2.5">
      <Ionicons name={icon} size={16} color={colors.mutedForeground} />
      <Text className="text-xs text-muted-foreground w-32">{label}</Text>
      <Text className="flex-1 text-sm text-foreground">{value || "—"}</Text>
    </View>
  );
}

function SectionTitle({ children }: { children: string }) {
  return <Text className="text-xs font-semibold text-muted-foreground uppercase mb-1 mt-5">{children}</Text>;
}

// Fiche classe (consultation seule) : informations, titulaires en vigueur et élèves inscrits sur l'année courante.
export function ClassDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { schoolClass, schoolClassIsLoading, schoolClassError, loadSchoolClass } = useSchoolClassById(id);

  const { currentSchoolYear } = useCurrentSchoolYear();
  const schoolYearId = currentSchoolYear?.id ?? null;

  // Mêmes filtres que le pointage : liste partagée avec le cache hors ligne.
  const { enrollments, enrollmentsIsLoading, enrollmentsError, loadEnrollments } = useEnrollments({
    filters: classEnrollmentsFilters(schoolYearId, id ?? null),
    enabled: Boolean(schoolYearId && id),
  });

  return (
    <>
      <Stack.Screen options={{ title: "Fiche classe" }} />

      <View className="flex-1 bg-background">
        {schoolClassIsLoading ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator />
          </View>
        ) : schoolClassError || !schoolClass ? (
          <View className="flex-1 items-center justify-center px-6 gap-3">
            <Text className="text-sm text-muted-foreground text-center">Impossible de charger la fiche de la classe.</Text>
            <Pressable
              onPress={() => loadSchoolClass()}
              className="h-10 px-4 rounded-lg bg-foreground items-center justify-center"
            >
              <Text className="text-background font-medium">Réessayer</Text>
            </Pressable>
          </View>
        ) : (
          <ScrollView className="flex-1" contentContainerStyle={{ paddingVertical: 16 }}>
            <View className="px-4">
              <Text className="text-xl font-semibold text-foreground">{getSchoolClassLabel(schoolClass)}</Text>
              {currentSchoolYear?.title && (
                <Text className="text-sm text-muted-foreground mt-0.5">{currentSchoolYear.title}</Text>
              )}

              <SectionTitle>Informations</SectionTitle>
              <View className="border-t border-divider pt-1">
                <InfoRow icon="pricetag-outline" label="Abréviation" value={schoolClass.abbreviation} />
                <InfoRow icon="layers-outline" label="Classe générique" value={schoolClass.generalClass?.title} />
                <InfoRow icon="person-outline" label="Titulaire(s)" value={getHomeroomTeachersLabel(schoolClass)} />
                <InfoRow icon="business-outline" label="Salle de classe" value={schoolClass.classroom?.designation} />
              </View>

              <SectionTitle>
                {enrollments ? `Élèves (${enrollments.length})` : "Élèves"}
              </SectionTitle>
            </View>

            {enrollmentsIsLoading ? (
              <ActivityIndicator className="mt-2" />
            ) : enrollmentsError ? (
              <View className="items-center px-6 py-6 gap-3">
                <Text className="text-sm text-muted-foreground text-center">Impossible de charger les élèves.</Text>
                <Pressable
                  onPress={() => loadEnrollments()}
                  className="h-10 px-4 rounded-lg bg-foreground items-center justify-center"
                >
                  <Text className="text-background font-medium">Réessayer</Text>
                </Pressable>
              </View>
            ) : enrollments && enrollments.length > 0 ? (
              <View className="border-t border-divider">
                {enrollments.map((enrollment) => (
                  <EnrollmentRow
                    key={enrollment.id}
                    enrollment={enrollment}
                    onPress={(item) => router.push(`/staff/students/${item.id}`)}
                  />
                ))}
              </View>
            ) : (
              <Text className="px-4 text-sm text-faint mt-2">Aucun élève inscrit dans cette classe.</Text>
            )}
          </ScrollView>
        )}
      </View>
    </>
  );
}
