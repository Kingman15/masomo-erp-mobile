import { formatShortDate } from "@/lib/format";
import { usePortalTeachingCourseEvaluationById } from "@/hooks/queries/items/teaching-course-evaluation";
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
  return (
    <View className="flex-row items-center gap-3 py-2.5">
      <Ionicons name={icon} size={16} color="#6B7280" />
      <Text className="text-xs text-gray-500 w-32">{label}</Text>
      <Text className="flex-1 text-sm text-black">{value}</Text>
    </View>
  );
}

function SectionTitle({ children }: { children: string }) {
  return (
    <Text className="text-xs font-semibold text-gray-500 uppercase mb-1 mt-4">
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

      <View className="flex-1 bg-white">
        {portalTeachingCourseEvaluationIsLoading ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator />
          </View>
        ) : portalTeachingCourseEvaluationError ? (
          <View className="flex-1 items-center justify-center px-6 gap-3">
            <Text className="text-sm text-gray-500 text-center">
              Cette évaluation n&apos;est pas accessible.
            </Text>
            <Pressable
              onPress={() => loadPortalTeachingCourseEvaluation()}
              className="h-10 px-4 rounded-lg bg-black items-center justify-center"
            >
              <Text className="text-white font-medium">Réessayer</Text>
            </Pressable>
          </View>
        ) : evaluation ? (
          <ScrollView className="flex-1" contentContainerStyle={{ padding: 16 }}>
            <Text className="text-xl font-semibold text-black">
              {evaluation.course.shortName ?? evaluation.course.name}
            </Text>
            <Text className="text-sm text-gray-500 mt-0.5">
              {evaluation.wording ?? evaluation.evaluationType ?? "Évaluation"}
              {!evaluation.countsTowardsFinal && " (hors moyenne)"}
            </Text>

            <SectionTitle>Informations</SectionTitle>
            <View className="border-t border-gray-100 pt-1">
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
                <Text className="text-sm text-black">{evaluation.comments}</Text>
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
                    className="px-3 py-3 border border-gray-200 rounded-lg mb-2 bg-white"
                  >
                    <View className="flex-row items-center justify-between mb-1">
                      <Text className="text-xs text-gray-400">
                        Question {question.questionNo}
                      </Text>
                      <Text className="text-xs font-medium text-gray-600">
                        {question.weight} pt
                        {Number(question.weight) > 1 ? "s" : ""}
                      </Text>
                    </View>
                    <Text className="text-sm text-black">
                      {question.questionText}
                    </Text>
                    <View className="flex-row items-center gap-2 mt-1.5">
                      {question.questionType === "text" && (
                        <Text className="text-xs text-gray-400">
                          Texte libre
                        </Text>
                      )}
                      {question.isRequired && (
                        <Text className="text-xs text-gray-400">
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
