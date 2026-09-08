import { useTeachingCourseById } from "@/hooks/queries/items/teaching-course";
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
  return (
    <View className="flex-row items-center gap-3 py-2.5">
      <Ionicons name={icon} size={16} color="#6B7280" />
      <Text className="text-xs text-gray-500 w-28">{label}</Text>
      <Text className="flex-1 text-sm text-black">{value}</Text>
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

      <View className="flex-1 bg-white">
        {teachingCourseIsLoading ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator />
          </View>
        ) : teachingCourseError ? (
          <View className="flex-1 items-center justify-center px-6 gap-3">
            <Text className="text-sm text-gray-500 text-center">
              Impossible de charger le cours.
            </Text>
            <Pressable
              onPress={() => loadTeachingCourse()}
              className="h-10 px-4 rounded-lg bg-black items-center justify-center"
            >
              <Text className="text-white font-medium">Réessayer</Text>
            </Pressable>
          </View>
        ) : teachingCourse ? (
          <ScrollView
            className="flex-1"
            contentContainerStyle={{ padding: 16 }}
          >
            {className && (
              <Text className="text-xs font-medium text-gray-500">
                {className}
              </Text>
            )}
            <Text className="text-xl font-semibold text-black mt-1">
              {course?.name ?? "Cours"}
            </Text>
            <Text
              className={`text-sm mt-0.5 ${
                teachingCourse.isActive ? "text-green-600" : "text-gray-400"
              }`}
            >
              {teachingCourse.isActive ? "Actif" : "Inactif"}
            </Text>

            <View className="mt-4 border-t border-gray-100 pt-1">
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

            <View className="mt-4 border-t border-gray-100 pt-1">
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
                  <View key={tag} className="px-2 py-1 rounded-full bg-gray-100">
                    <Text className="text-xs text-gray-600">{tag}</Text>
                  </View>
                ))}
              </View>
            )}

            {followCourse?.prerequisites && (
              <View className="mt-4 border-t border-gray-100 pt-3">
                <Text className="text-xs text-gray-500 mb-1">Prérequis</Text>
                <Text className="text-sm text-black">
                  {followCourse.prerequisites}
                </Text>
              </View>
            )}

            {followCourse?.description && (
              <View className="mt-4 border-t border-gray-100 pt-3">
                <Text className="text-xs text-gray-500 mb-1">
                  Description du cours
                </Text>
                <Text className="text-sm text-black">
                  {followCourse.description}
                </Text>
              </View>
            )}

            {teachingCourse.comments && (
              <View className="mt-4 border-t border-gray-100 pt-3">
                <Text className="text-xs text-gray-500 mb-1">
                  Commentaires
                </Text>
                <Text className="text-sm text-black">
                  {teachingCourse.comments}
                </Text>
              </View>
            )}

            {followCourse?.comments && (
              <View className="mt-4 border-t border-gray-100 pt-3">
                <Text className="text-xs text-gray-500 mb-1">
                  Commentaires du cours
                </Text>
                <Text className="text-sm text-black">
                  {followCourse.comments}
                </Text>
              </View>
            )}

            <View className="mt-4 border-t border-gray-100 pt-1">
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
