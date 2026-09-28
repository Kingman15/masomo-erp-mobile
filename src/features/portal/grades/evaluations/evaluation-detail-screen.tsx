import { formatShortDate } from "@/lib/format";
import { usePortalTeachingCourseEvaluationById } from "@/hooks/queries/items/teaching-course-evaluation";
import { useThemeColors } from "@/hooks/use-theme-colors";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Stack, useLocalSearchParams } from "expo-router";
import { ActivityIndicator, Pressable, ScrollView, Text, View } from "react-native";
import { EvaluationDocumentRow } from "./evaluation-document-row";
import { usePortalSelection } from "../../use-portal-selection";

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
      <Text className="text-xs text-muted-foreground w-32">{label}</Text>
      <Text className="flex-1 text-sm text-foreground">{value}</Text>
    </View>
  );
}

function SectionTitle({ children }: { children: string }) {
  return (
    <Text className="text-xs font-semibold text-muted-foreground uppercase mb-1 mt-4">
      {children}
    </Text>
  );
}

export function EvaluationDetailScreen() {
  const { id: evaluationId } = useLocalSearchParams<{ id: string }>();
  const { selectedStudent } = usePortalSelection();

  const {
    portalTeachingCourseEvaluation: evaluation,
    portalTeachingCourseEvaluationIsLoading,
    portalTeachingCourseEvaluationError,
    loadPortalTeachingCourseEvaluation,
  } = usePortalTeachingCourseEvaluationById({
    studentId: selectedStudent?.id,
    evaluationId,
  });

  return (
    <>
      <Stack.Screen options={{ headerShown: true, title: "Détail de l'évaluation" }} />

      <View className="flex-1 bg-background">
        {portalTeachingCourseEvaluationIsLoading ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator />
          </View>
        ) : portalTeachingCourseEvaluationError ? (
          <View className="flex-1 items-center justify-center px-6 gap-3">
            <Text className="text-sm text-muted-foreground text-center">
              Cette évaluation n&apos;est pas accessible.
            </Text>
            <Pressable
              onPress={() => loadPortalTeachingCourseEvaluation()}
              className="h-10 px-4 rounded-lg bg-foreground items-center justify-center"
            >
              <Text className="text-background font-medium">Réessayer</Text>
            </Pressable>
          </View>
        ) : evaluation ? (
          <ScrollView className="flex-1" contentContainerStyle={{ padding: 16 }}>
            <Text className="text-xl font-semibold text-foreground">
              {evaluation.course.shortName ?? evaluation.course.name}
            </Text>
            <Text className="text-sm text-muted-foreground mt-0.5">
              {evaluation.wording ?? evaluation.evaluationType ?? "Évaluation"}
              {!evaluation.countsTowardsFinal && " (hors moyenne)"}
            </Text>

            <SectionTitle>Informations</SectionTitle>
            <View className="border-t border-divider pt-1">
              <InfoRow icon="book-outline" label="Cours" value={evaluation.course.name} />
              {evaluation.evaluationType && (
                <InfoRow
                  icon="pricetag-outline"
                  label="Type"
                  value={evaluation.evaluationType}
                />
              )}
              <InfoRow
                icon="calendar-outline"
                label="Période"
                value={evaluation.evaluationPeriod.name}
              />
              <InfoRow
                icon="today-outline"
                label="Date"
                value={formatShortDate(evaluation.evaluationDate)}
              />
              {evaluation.dueDate && (
                <InfoRow
                  icon="hourglass-outline"
                  label="Date limite"
                  value={formatShortDate(evaluation.dueDate)}
                />
              )}
              <InfoRow
                icon="school-outline"
                label="Noté sur"
                value={evaluation.maxScore}
              />
              <InfoRow
                icon="calculator-outline"
                label="Coefficient"
                value={evaluation.weight}
              />
              <InfoRow
                icon="checkbox-outline"
                label="Compte dans la moyenne"
                value={evaluation.countsTowardsFinal ? "Oui" : "Non"}
              />
            </View>

            {evaluation.comments && (
              <>
                <SectionTitle>Commentaires</SectionTitle>
                <Text className="text-sm text-foreground">{evaluation.comments}</Text>
              </>
            )}

            {evaluation.documents && evaluation.documents.length > 0 && (
              <>
                <SectionTitle>Documents</SectionTitle>
                {evaluation.documents.map((document) => (
                  <EvaluationDocumentRow key={document.linkId} document={document} />
                ))}
              </>
            )}

            {evaluation.questions && evaluation.questions.length > 0 && (
              <>
                <SectionTitle>Questions</SectionTitle>
                {evaluation.questions.map((question) => (
                  <View
                    key={question.id}
                    className="px-3 py-3 border border-border rounded-lg mb-2 bg-card"
                  >
                    <View className="flex-row items-center justify-between mb-1">
                      <Text className="text-xs text-faint">
                        Question {question.questionNo}
                      </Text>
                      <Text className="text-xs font-medium text-gray-600 dark:text-zinc-400">
                        {question.weight} pt
                        {Number(question.weight) > 1 ? "s" : ""}
                      </Text>
                    </View>
                    <Text className="text-sm text-foreground">
                      {question.questionText}
                    </Text>
                    <View className="flex-row items-center gap-2 mt-1.5">
                      {question.questionType === "text" && (
                        <Text className="text-xs text-faint">
                          Texte libre
                        </Text>
                      )}
                      {question.isRequired && (
                        <Text className="text-xs text-faint">
                          · Requise
                        </Text>
                      )}
                    </View>
                  </View>
                ))}
              </>
            )}
          </ScrollView>
        ) : null}
      </View>
    </>
  );
}
