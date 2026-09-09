import {
  useSaveTeachingCourseEvaluationResults,
  useTeachingCourseEvaluationResultRoster,
} from "@/hooks/queries/items/teaching-course-evaluation-result";
import { handleApiError } from "@/lib/handle-api-error";
import { toastNotify } from "@/lib/toast";
import { teachingCourseEvaluationResultSchema } from "@/utils/schemas/teaching-course-evaluation-result-schema";
import type { TeachingCourseEvaluation } from "@/utils/types/TeachingCourseEvaluation";
import type { TeachingCourseEvaluationResultRosterEntry } from "@/utils/types/TeachingCourseEvaluationResult";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Modal,
  Pressable,
  Text,
  View,
} from "react-native";
import { EvaluationScoringRow } from "./evaluation-scoring-row";

type ScoringRow = {
  enrollmentId: string;
  studentLabel: string;
  score: number | null;
  draft: string;
  error: string | null;
};

function toScoringRow(
  entry: TeachingCourseEvaluationResultRosterEntry,
): ScoringRow {
  const score =
    entry.score !== null && entry.score !== undefined
      ? Number(entry.score)
      : null;
  const studentLabel =
    entry.enrollment.student?.fullDesignation ??
    entry.enrollment.student?.fullName ??
    "Élève";

  return {
    enrollmentId: entry.enrollmentId,
    studentLabel,
    score: score !== null && !Number.isNaN(score) ? score : null,
    draft: score !== null && !Number.isNaN(score) ? String(score) : "",
    error: null,
  };
}

type EvaluationScoringDialogProps = {
  evaluationId: string;
  evaluation: TeachingCourseEvaluation;
  onClose: () => void;
};

export function EvaluationScoringDialog({
  evaluationId,
  evaluation,
  onClose,
}: EvaluationScoringDialogProps) {
  const {
    teachingCourseEvaluationResultRoster,
    teachingCourseEvaluationResultRosterIsLoading,
    teachingCourseEvaluationResultRosterError,
    loadTeachingCourseEvaluationResultRoster,
  } = useTeachingCourseEvaluationResultRoster(evaluationId);

  const {
    saveTeachingCourseEvaluationResults,
    saveTeachingCourseEvaluationResultsIsPending,
  } = useSaveTeachingCourseEvaluationResults(evaluationId);

  const [rows, setRows] = useState<ScoringRow[]>([]);
  // Empêche un refetch en arrière-plan d'écraser des saisies non
  // sauvegardées (cf. spec §7.6, hasUnsavedScoreChangesRef côté web).
  const hasUnsavedChangesRef = useRef(false);

  useEffect(() => {
    if (!teachingCourseEvaluationResultRoster) return;
    if (hasUnsavedChangesRef.current) return;

    const sorted = [...teachingCourseEvaluationResultRoster].sort((a, b) =>
      (a.enrollment.student?.fullDesignation ?? "").localeCompare(
        b.enrollment.student?.fullDesignation ?? "",
      ),
    );
    setRows(sorted.map(toScoringRow));
  }, [teachingCourseEvaluationResultRoster]);

  const maxScore = evaluation.maxScore ?? 0;

  const handleChangeText = (index: number, text: string) => {
    hasUnsavedChangesRef.current = true;
    setRows((prev) =>
      prev.map((row, i) =>
        i === index ? { ...row, draft: text, error: null } : row,
      ),
    );
  };

  const handleBlur = (index: number) => {
    setRows((prev) => {
      const row = prev[index];
      const trimmed = row.draft.trim();

      if (trimmed === "") {
        return prev.map((r, i) =>
          i === index ? { ...r, score: null, error: null } : r,
        );
      }

      const parsed = Number(trimmed);
      if (Number.isNaN(parsed) || parsed < 0 || parsed > maxScore) {
        return prev.map((r, i) =>
          i === index
            ? {
                ...r,
                draft: r.score !== null ? String(r.score) : "",
                error: `Doit être entre 0 et ${maxScore}`,
              }
            : r,
        );
      }

      return prev.map((r, i) =>
        i === index
          ? { ...r, score: parsed, draft: String(parsed), error: null }
          : r,
      );
    });
  };

  const handleSave = async () => {
    const payload = {
      evaluationId,
      results: rows.map((row) => ({
        enrollmentId: row.enrollmentId,
        score: row.score,
      })),
    };

    const parsed = teachingCourseEvaluationResultSchema.safeParse(payload);
    if (!parsed.success) {
      toastNotify("Certaines notes sont invalides.", "error");
      return;
    }

    try {
      await saveTeachingCourseEvaluationResults(parsed.data);
      hasUnsavedChangesRef.current = false;
      toastNotify("Notes enregistrées avec succès.", "success");
    } catch (error) {
      handleApiError(error);
    }
  };

  return (
    <Modal visible animationType="slide" onRequestClose={onClose}>
      <View className="flex-1 bg-white">
        <View className="px-4 pt-14 pb-3 border-b border-gray-100">
          <View className="flex-row items-center justify-between">
            <Text className="text-base font-semibold">Saisir les notes</Text>
            <Pressable onPress={onClose} hitSlop={8}>
              <Ionicons name="close" size={22} color="#374151" />
            </Pressable>
          </View>
          <Text className="text-xs text-gray-500 mt-1" numberOfLines={1}>
            {`${evaluation.wording ?? "Évaluation"} · Noté sur ${maxScore}`}
          </Text>
        </View>

        {teachingCourseEvaluationResultRosterIsLoading ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator />
          </View>
        ) : teachingCourseEvaluationResultRosterError ? (
          <View className="flex-1 items-center justify-center px-6 gap-3">
            <Text className="text-sm text-gray-500 text-center">
              {"Impossible de charger les élèves."}
            </Text>
            <Pressable
              onPress={() => loadTeachingCourseEvaluationResultRoster()}
              className="h-10 px-4 rounded-lg bg-black items-center justify-center"
            >
              <Text className="text-white font-medium">Réessayer</Text>
            </Pressable>
          </View>
        ) : (
          <FlatList
            data={rows}
            keyExtractor={(row) => row.enrollmentId}
            renderItem={({ item, index }) => (
              <EvaluationScoringRow
                studentLabel={item.studentLabel}
                maxScore={maxScore}
                draft={item.draft}
                error={item.error}
                onChangeText={(text) => handleChangeText(index, text)}
                onBlur={() => handleBlur(index)}
              />
            )}
            ListEmptyComponent={
              <View className="items-center justify-center px-6 py-16">
                <Text className="text-sm text-gray-400 text-center">
                  {"Aucun élève inscrit."}
                </Text>
              </View>
            }
          />
        )}

        <View className="p-4 border-t border-gray-100">
          <Pressable
            onPress={() => void handleSave()}
            disabled={saveTeachingCourseEvaluationResultsIsPending}
            className={`h-12 rounded-lg items-center justify-center ${
              saveTeachingCourseEvaluationResultsIsPending
                ? "bg-gray-300"
                : "bg-black"
            }`}
          >
            {saveTeachingCourseEvaluationResultsIsPending ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text className="text-white font-medium">
                Enregistrer les notes
              </Text>
            )}
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}
