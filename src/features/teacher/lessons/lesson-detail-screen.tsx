import { useDeleteLesson, useLessonById } from "@/hooks/queries/items/lesson";
import { useCan } from "@/hooks/use-can";
import { useConfirm } from "@/hooks/use-confirm";
import { useThemeColors } from "@/hooks/use-theme-colors";
import { handleApiError } from "@/lib/handle-api-error";
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
  const colors = useThemeColors();
  return (
    <View className="flex-row items-center gap-3 py-2.5">
      <Ionicons name={icon} size={16} color={colors.mutedForeground} />
      <Text className="text-xs text-muted-foreground w-28">{label}</Text>
      <Text className="flex-1 text-sm text-foreground">{value}</Text>
    </View>
  );
}

export function LessonDetailScreen() {
  const colors = useThemeColors();
  const canUpdate = useCan("academics.lessons.update");
  // Rôle enseignant par défaut : pas de suppression, réservée à l'administration.
  const canDelete = useCan("academics.lessons.delete");
  const { id } = useLocalSearchParams<{ id: string }>();
  const { lesson, lessonIsLoading, lessonError, loadLesson } =
    useLessonById(id);

  const { deleteLesson, deleteLessonIsPending } = useDeleteLesson();
  const { confirm, ConfirmDialog } = useConfirm();

  const handleDelete = async () => {
    if (!lesson) return;

    const confirmed = await confirm({
      title: "Supprimer la leçon",
      description: "Voulez-vous vraiment supprimer cette leçon ?",
      confirmText: "Supprimer",
      variant: "destructive",
    });
    if (!confirmed) return;

    try {
      await deleteLesson(lesson.id);
      toastNotify("Leçon supprimée avec succès.", "success");
      router.back();
    } catch (error) {
      handleApiError(error);
    }
  };

  const course = lesson?.teachingCourse?.followCourse?.course;
  const schoolClass = lesson?.teachingCourse?.schoolClass;
  const className = schoolClass?.title ?? schoolClass?.abbreviation ?? null;
  const schoolYear = lesson?.teachingCourse?.followCourse?.schoolYear;
  const teacher = lesson?.teacher;

  return (
    <>
      <Stack.Screen options={{ title: "Détails de la leçon" }} />

      <View className="flex-1 bg-background">
        {lessonIsLoading ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator />
          </View>
        ) : lessonError ? (
          <View className="flex-1 items-center justify-center px-6 gap-3">
            <Text className="text-sm text-muted-foreground text-center">
              Impossible de charger la leçon.
            </Text>
            <Pressable
              onPress={() => loadLesson()}
              className="h-10 px-4 rounded-lg bg-foreground items-center justify-center"
            >
              <Text className="text-background font-medium">Réessayer</Text>
            </Pressable>
          </View>
        ) : lesson ? (
          <ScrollView
            className="flex-1"
            contentContainerStyle={{ padding: 16 }}
          >
            <Text className="text-xs font-medium text-muted-foreground capitalize">
              {formatLessonDate(lesson.lessonDate)}
            </Text>
            <Text className="text-xl font-semibold text-foreground mt-1">
              {lesson.subject}
            </Text>
            <Text className="text-sm text-muted-foreground mt-0.5">
              {lesson.intervalStr ?? `${lesson.startTime} - ${lesson.endTime}`}
            </Text>

            <View className="mt-4 border-t border-divider pt-1">
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
              <View className="mt-4 border-t border-divider pt-3">
                <Text className="text-xs text-muted-foreground mb-1">
                  Commentaires
                </Text>
                <Text className="text-sm text-foreground">
                  {lesson.comments}
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

            {(canUpdate || canDelete) && (
            <View className="mt-6 gap-3">
              {canUpdate && (
                <Pressable
                  onPress={() =>
                    router.push(`/teacher/lessons/${lesson.id}/edit`)
                  }
                  className="h-12 rounded-lg bg-foreground items-center justify-center flex-row gap-2"
                >
                  <Ionicons
                    name="create-outline"
                    size={18}
                    color={colors.background}
                  />
                  <Text className="text-background font-medium">Modifier</Text>
                </Pressable>
              )}

              {canDelete && (
                <Pressable
                  onPress={() => void handleDelete()}
                  disabled={deleteLessonIsPending}
                  className="h-12 rounded-lg border border-red-200 dark:border-red-800 items-center justify-center flex-row gap-2"
                >
                  {deleteLessonIsPending ? (
                    <ActivityIndicator color="#DC2626" />
                  ) : (
                    <>
                      <Ionicons name="trash-outline" size={18} color="#DC2626" />
                      <Text className="text-red-600 font-medium">Supprimer</Text>
                    </>
                  )}
                </Pressable>
              )}
            </View>
            )}
          </ScrollView>
        ) : null}
      </View>

      <ConfirmDialog />
    </>
  );
}
