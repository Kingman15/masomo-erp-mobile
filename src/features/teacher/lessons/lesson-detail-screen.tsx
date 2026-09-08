import { useLessonById } from "@/hooks/queries/items/lesson";
import { toastNotify } from "@/lib/toast";
import Ionicons from "@expo/vector-icons/Ionicons";
import { router, Stack, useLocalSearchParams } from "expo-router";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";

function formatLessonDate(value: Date | string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("fr-FR", {
    weekday: "long",
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

export function LessonDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { lesson, lessonIsLoading, lessonError, loadLesson } =
    useLessonById(id);

  const course = lesson?.teachingCourse?.followCourse?.course;
  const schoolClass = lesson?.teachingCourse?.schoolClass;
  const className = schoolClass?.title ?? schoolClass?.abbreviation ?? null;
  const schoolYear = lesson?.teachingCourse?.followCourse?.schoolYear;
  const teacher = lesson?.teacher ?? lesson?.teachingCourse?.teacher;

  return (
    <>
      <Stack.Screen options={{ title: "Détails de la leçon" }} />

      <View className="flex-1 bg-white">
        {lessonIsLoading ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator />
          </View>
        ) : lessonError ? (
          <View className="flex-1 items-center justify-center px-6 gap-3">
            <Text className="text-sm text-gray-500 text-center">
              Impossible de charger la leçon.
            </Text>
            <Pressable
              onPress={() => loadLesson()}
              className="h-10 px-4 rounded-lg bg-black items-center justify-center"
            >
              <Text className="text-white font-medium">Réessayer</Text>
            </Pressable>
          </View>
        ) : lesson ? (
          <ScrollView
            className="flex-1"
            contentContainerStyle={{ padding: 16 }}
          >
            <Text className="text-xs font-medium text-gray-500 capitalize">
              {formatLessonDate(lesson.lessonDate)}
            </Text>
            <Text className="text-xl font-semibold text-black mt-1">
              {lesson.subject}
            </Text>
            <Text className="text-sm text-gray-500 mt-0.5">
              {lesson.intervalStr ?? `${lesson.startTime} - ${lesson.endTime}`}
            </Text>

            <View className="mt-4 border-t border-gray-100 pt-1">
              <InfoRow
                icon="bookmark-outline"
                label="N° de leçon"
                value={lesson.fileNo}
              />

              {course && (
                <InfoRow
                  icon="book-outline"
                  label="Cours"
                  value={course.name}
                />
              )}
              {className && (
                <InfoRow
                  icon="people-outline"
                  label="Classe"
                  value={className}
                />
              )}
              {lesson.classroom && (
                <InfoRow
                  icon="location-outline"
                  label="Salle"
                  value={lesson.classroom.designation}
                />
              )}
            </View>

            {lesson.comments && (
              <View className="mt-4 border-t border-gray-100 pt-3">
                <Text className="text-xs text-gray-500 mb-1">Commentaires</Text>
                <Text className="text-sm text-black">{lesson.comments}</Text>
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

            <View className="mt-6 gap-3">
              <Pressable
                onPress={() => router.push(`/teacher/lessons/${lesson.id}/edit`)}
                className="h-12 rounded-lg bg-black items-center justify-center flex-row gap-2"
              >
                <Ionicons name="create-outline" size={18} color="#ffffff" />
                <Text className="text-white font-medium">Modifier</Text>
              </Pressable>

              <Pressable
                onPress={() =>
                  toastNotify(
                    "Contactez votre administration pour supprimer cette leçon.",
                    "info",
                  )
                }
                className="h-12 rounded-lg border border-red-200 items-center justify-center flex-row gap-2"
              >
                <Ionicons name="trash-outline" size={18} color="#DC2626" />
                <Text className="text-red-600 font-medium">Supprimer</Text>
              </Pressable>
            </View>
          </ScrollView>
        ) : null}
      </View>
    </>
  );
}
