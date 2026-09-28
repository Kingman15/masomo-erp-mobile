import { useTeachingCourseById } from "@/hooks/queries/items/teaching-course";
import { useThemeColors } from "@/hooks/use-theme-colors";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Stack, useLocalSearchParams } from "expo-router";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";

function formatDate(value: Date | string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

type InfoRowProps = {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
};

function InfoRow({ icon, label, value }: InfoRowProps) {
  const colors = useThemeColors();
  return (
    <View className="flex-row items-center gap-3 py-2.5">
      <Ionicons name={icon} size={16} color={colors.mutedForeground} />
      <Text className="text-xs text-muted-foreground w-28">{label}</Text>
      <Text className="flex-1 text-sm text-foreground">{value}</Text>
    </View>
  );
}

export function TeachingCourseDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const {
    teachingCourse,
    teachingCourseIsLoading,
    teachingCourseError,
    loadTeachingCourse,
  } = useTeachingCourseById(id);

  const followCourse = teachingCourse?.followCourse;
  const course = followCourse?.course;
  const schoolClass = teachingCourse?.schoolClass;
  const className = schoolClass?.title ?? schoolClass?.abbreviation ?? null;
  const schoolYear = followCourse?.schoolYear;
  const teacher = teachingCourse?.teacher;

  const tags = [
    followCourse?.withoutExam ? "Sans examen" : null,
    followCourse?.isOptionWeighted ? "Cours d'option" : null,
  ].filter((tag): tag is string => Boolean(tag));

  return (
    <>
      <Stack.Screen options={{ title: "Détails du cours" }} />

      <View className="flex-1 bg-background">
        {teachingCourseIsLoading ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator />
          </View>
        ) : teachingCourseError ? (
          <View className="flex-1 items-center justify-center px-6 gap-3">
            <Text className="text-sm text-muted-foreground text-center">
              Impossible de charger le cours.
            </Text>
            <Pressable
              onPress={() => loadTeachingCourse()}
              className="h-10 px-4 rounded-lg bg-foreground items-center justify-center"
            >
              <Text className="text-background font-medium">Réessayer</Text>
            </Pressable>
          </View>
        ) : teachingCourse ? (
          <ScrollView
            className="flex-1"
            contentContainerStyle={{ padding: 16 }}
          >
            {className && (
              <Text className="text-xs font-medium text-muted-foreground">
                {className}
              </Text>
            )}
            <Text className="text-xl font-semibold text-foreground mt-1">
              {course?.name ?? "Cours"}
            </Text>
            <Text
              className={`text-sm mt-0.5 ${
                teachingCourse.isActive ? "text-green-600" : "text-faint"
              }`}
            >
              {teachingCourse.isActive ? "Actif" : "Inactif"}
            </Text>

            <View className="mt-4 border-t border-divider pt-1">
              {teachingCourse.classroom && (
                <InfoRow
                  icon="location-outline"
                  label="Salle"
                  value={teachingCourse.classroom.designation}
                />
              )}
              {teachingCourse.startDate && (
                <InfoRow
                  icon="calendar-outline"
                  label="Date début"
                  value={formatDate(teachingCourse.startDate)}
                />
              )}
              {teachingCourse.endDate && (
                <InfoRow
                  icon="calendar-outline"
                  label="Date fin"
                  value={formatDate(teachingCourse.endDate)}
                />
              )}
            </View>

            <View className="mt-4 border-t border-divider pt-1">
              {followCourse?.courseTypeStr && (
                <InfoRow
                  icon="pricetag-outline"
                  label="Type de cours"
                  value={followCourse.courseTypeStr}
                />
              )}
              {followCourse?.deliveryTypeStr && (
                <InfoRow
                  icon="layers-outline"
                  label="Dispensation"
                  value={followCourse.deliveryTypeStr}
                />
              )}
              {followCourse?.difficultyLevelStr && (
                <InfoRow
                  icon="speedometer-outline"
                  label="Difficulté"
                  value={followCourse.difficultyLevelStr}
                />
              )}
              {followCourse && (
                <InfoRow
                  icon="timer-outline"
                  label="Maxima périodique"
                  value={String(followCourse.maxPeriod)}
                />
              )}
              {followCourse?.maxExam != null && (
                <InfoRow
                  icon="document-text-outline"
                  label="Maxima examen"
                  value={String(followCourse.maxExam)}
                />
              )}
            </View>

            {tags.length > 0 && (
              <View className="flex-row flex-wrap gap-2 mt-3">
                {tags.map((tag) => (
                  <View key={tag} className="px-2 py-1 rounded-full bg-muted">
                    <Text className="text-xs text-gray-600 dark:text-zinc-400">{tag}</Text>
                  </View>
                ))}
              </View>
            )}

            {followCourse?.prerequisites && (
              <View className="mt-4 border-t border-divider pt-3">
                <Text className="text-xs text-muted-foreground mb-1">Prérequis</Text>
                <Text className="text-sm text-foreground">
                  {followCourse.prerequisites}
                </Text>
              </View>
            )}

            {followCourse?.description && (
              <View className="mt-4 border-t border-divider pt-3">
                <Text className="text-xs text-muted-foreground mb-1">
                  Description du cours
                </Text>
                <Text className="text-sm text-foreground">
                  {followCourse.description}
                </Text>
              </View>
            )}

            {teachingCourse.comments && (
              <View className="mt-4 border-t border-divider pt-3">
                <Text className="text-xs text-muted-foreground mb-1">
                  Commentaires
                </Text>
                <Text className="text-sm text-foreground">
                  {teachingCourse.comments}
                </Text>
              </View>
            )}

            {followCourse?.comments && (
              <View className="mt-4 border-t border-divider pt-3">
                <Text className="text-xs text-muted-foreground mb-1">
                  Commentaires du cours
                </Text>
                <Text className="text-sm text-foreground">
                  {followCourse.comments}
                </Text>
              </View>
            )}

            <View className="mt-4 border-t border-divider pt-1">
              <InfoRow
                icon="person-outline"
                label="Enseignant"
                value={teacher?.fullName ?? "—"}
              />
              <InfoRow
                icon="calendar-outline"
                label="Année scolaire"
                value={schoolYear?.title ?? "—"}
              />
            </View>
          </ScrollView>
        ) : null}
      </View>
    </>
  );
}
