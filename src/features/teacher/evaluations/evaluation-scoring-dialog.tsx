import { Toast } from "@/components/toast";
import { useConfirm } from "@/hooks/use-confirm";
import {
  useExportTeachingCourseEvaluationResults,
  useImportTeachingCourseEvaluationResults,
  useSaveTeachingCourseEvaluationResults,
  useTeachingCourseEvaluationResultRoster,
} from "@/hooks/queries/items/teaching-course-evaluation-result";
import { handleApiError } from "@/lib/handle-api-error";
import { toastNotify } from "@/lib/toast";
import { teachingCourseEvaluationResultSchema } from "@/utils/schemas/teaching-course-evaluation-result-schema";
import type { TeachingCourseEvaluation } from "@/utils/types/TeachingCourseEvaluation";
import type { TeachingCourseEvaluationResultRosterEntry } from "@/utils/types/TeachingCourseEvaluationResult";
import Ionicons from "@expo/vector-icons/Ionicons";
import * as DocumentPicker from "expo-document-picker";
import { File, Paths } from "expo-file-system";
import * as Sharing from "expo-sharing";
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

const IMPORT_ACCEPTED_MIME_TYPES = [
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-excel",
];
const IMPORT_ACCEPTED_EXTENSIONS = ["xlsx", "xls"];

function getExtension(name: string) {
  const parts = name.split(".");
  return parts.length > 1 ? parts[parts.length - 1].toLowerCase() : "";
}

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
    enrollmentId: entry.enrollment.id,
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

  const {
    exportTeachingCourseEvaluationResults,
    exportTeachingCourseEvaluationResultsIsPending,
  } = useExportTeachingCourseEvaluationResults(evaluationId);

  const {
    importTeachingCourseEvaluationResults,
    importTeachingCourseEvaluationResultsIsPending,
  } = useImportTeachingCourseEvaluationResults(evaluationId);

  const { confirm, ConfirmDialog } = useConfirm();

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

  // Parse le texte saisi en score valide. Réutilisé à la fois par le blur
  // (retour visuel immédiat pendant la saisie) et par la sauvegarde (source
  // de vérité au moment d'enregistrer, indépendante du blur — cf. bug où le
  // focus restant dans le champ empêchait la prise en compte de la saisie).
  const parseDraft = (
    draft: string,
  ): { score: number | null; error: string | null } => {
    const trimmed = draft.trim();
    if (trimmed === "") return { score: null, error: null };

    const parsed = Number(trimmed);
    if (Number.isNaN(parsed) || parsed < 0 || parsed > maxScore) {
      return { score: null, error: `Doit être entre 0 et ${maxScore}` };
    }
    return { score: parsed, error: null };
  };

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
      const { score, error } = parseDraft(row.draft);

      if (error) {
        return prev.map((r, i) =>
          i === index
            ? { ...r, draft: r.score !== null ? String(r.score) : "", error }
            : r,
        );
      }

      return prev.map((r, i) =>
        i === index
          ? { ...r, score, draft: score !== null ? String(score) : "", error: null }
          : r,
      );
    });
  };

  const handleExport = async () => {
    try {
      const buffer = await exportTeachingCourseEvaluationResults();
      const fileName = `cotations_evaluation_${evaluationId}_${new Date().toISOString().slice(0, 10)}.xlsx`;
      const file = new File(Paths.cache, fileName);
      file.write(new Uint8Array(buffer));

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(file.uri, {
          mimeType:
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          dialogTitle: "Exporter les cotations",
        });
      }

      toastNotify("Export des cotations généré avec succès.", "success");
    } catch (error) {
      handleApiError(error);
    }
  };

  const handleImport = async () => {
    const result = await DocumentPicker.getDocumentAsync({
      type: IMPORT_ACCEPTED_MIME_TYPES,
      copyToCacheDirectory: true,
    });
    if (result.canceled) return;

    const asset = result.assets[0];
    if (!IMPORT_ACCEPTED_EXTENSIONS.includes(getExtension(asset.name))) {
      toastNotify("Format non accepté. Formats autorisés : XLSX, XLS.", "error");
      return;
    }

    if (hasUnsavedChangesRef.current) {
      const confirmed = await confirm({
        title: "Importer les cotations",
        description:
          "L'importation va remplacer les cotations actuellement affichées, y compris vos modifications non enregistrées. Voulez-vous continuer ?",
        confirmText: "Importer",
        cancelText: "Annuler",
      });
      if (!confirmed) return;
    }

    try {
      await importTeachingCourseEvaluationResults({
        uri: asset.uri,
        name: asset.name,
        mimeType: asset.mimeType ?? "application/octet-stream",
      });
      hasUnsavedChangesRef.current = false;
      toastNotify("Cotations importées avec succès.", "success");
    } catch (error) {
      handleApiError(error);
    }
  };

  const handleSave = async () => {
    // Re-parse le texte actuellement saisi de chaque ligne plutôt que de se
    // fier à `row.score` (mis à jour seulement au blur) : si le focus est
    // encore dans un champ au moment d'appuyer sur "Enregistrer", la saisie
    // ne doit pas être perdue.
    let hasError = false;
    const parsedRows = rows.map((row) => {
      const { score, error } = parseDraft(row.draft);
      if (error) hasError = true;
      return { ...row, score, error };
    });

    if (hasError) {
      setRows(parsedRows);
      toastNotify("Certaines notes sont invalides.", "error");
      return;
    }

    const payload = {
      evaluationId,
      results: parsedRows.map((row) => ({
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
      setRows(parsedRows);
      hasUnsavedChangesRef.current = false;
      toastNotify("Notes enregistrées avec succès.", "success");
    } catch (error) {
      handleApiError(error);
    }
  };

  const isBusy =
    saveTeachingCourseEvaluationResultsIsPending ||
    exportTeachingCourseEvaluationResultsIsPending ||
    importTeachingCourseEvaluationResultsIsPending ||
    teachingCourseEvaluationResultRosterIsLoading;

  return (
    <Modal visible animationType="slide" onRequestClose={onClose}>
      <ConfirmDialog />
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

          <View className="flex-row items-center gap-2 mt-3">
            <Pressable
              onPress={() => void handleExport()}
              disabled={isBusy}
              className={`flex-1 h-10 rounded-lg border items-center justify-center flex-row gap-1.5 ${
                isBusy ? "border-gray-200" : "border-gray-300"
              }`}
            >
              {exportTeachingCourseEvaluationResultsIsPending ? (
                <ActivityIndicator size="small" color="#374151" />
              ) : (
                <Ionicons name="download-outline" size={16} color="#374151" />
              )}
              <Text className="text-sm font-medium text-gray-700">
                Exporter
              </Text>
            </Pressable>

            <Pressable
              onPress={() => void handleImport()}
              disabled={isBusy}
              className={`flex-1 h-10 rounded-lg border items-center justify-center flex-row gap-1.5 ${
                isBusy ? "border-gray-200" : "border-gray-300"
              }`}
            >
              {importTeachingCourseEvaluationResultsIsPending ? (
                <ActivityIndicator size="small" color="#374151" />
              ) : (
                <Ionicons
                  name="cloud-upload-outline"
                  size={16}
                  color="#374151"
                />
              )}
              <Text className="text-sm font-medium text-gray-700">
                Importer
              </Text>
            </Pressable>
          </View>
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
            keyExtractor={(row, index) => `${row.enrollmentId || "row"}-${index}`}
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
      {/* Le Toast global (_layout.tsx) est peint derrière cette View opaque
          (fenêtre native séparée du Modal) : on en remonte un ici, en
          DERNIER enfant, pour qu'il se peigne par-dessus et reste visible. */}
      <Toast />
    </Modal>
  );
}
