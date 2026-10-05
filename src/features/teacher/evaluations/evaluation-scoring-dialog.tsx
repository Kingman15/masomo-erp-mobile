import type { TeachingCourseEvaluationResultPayload } from "@/api/endpoints/teachingCourseEvaluationResult";
import { Toast } from "@/components/toast";
import { describeFailure } from "@/features/teacher/sync/sync-labels";
import { useConfirm } from "@/hooks/use-confirm";
import {
  useExportTeachingCourseEvaluationResults,
  useImportTeachingCourseEvaluationResults,
  useSaveTeachingCourseEvaluationResults,
  useSubmitTeachingCourseEvaluationResults,
  useTeachingCourseEvaluationResultRoster,
} from "@/hooks/queries/items/teaching-course-evaluation-result";
import { useCan } from "@/hooks/use-can";
import { useThemeColors } from "@/hooks/use-theme-colors";
import { handleApiError } from "@/lib/handle-api-error";
import { getFailureCode, getOfflineFailure } from "@/lib/offline/offline-error";
import { notifyQueued } from "@/lib/offline/use-offline-mutation";
import { toastNotify } from "@/lib/toast";
import { teachingCourseEvaluationResultKeys } from "@/utils/query-keys/teaching-course-evaluation-result";
import { teachingCourseEvaluationResultSchema } from "@/utils/schemas/teaching-course-evaluation-result-schema";
import type { TeachingCourseEvaluation } from "@/utils/types/TeachingCourseEvaluation";
import type {
  TeachingCourseEvaluationResultRosterEntry,
  TeachingCourseEvaluationResultStatus,
} from "@/utils/types/TeachingCourseEvaluationResult";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useQueryClient } from "@tanstack/react-query";
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

  // État chargé : sert à n'envoyer que les lignes modifiées, avec la version vue (contrôle de conflit).
  originalScore: number | null;
  resultId: string | null;
  status: TeachingCourseEvaluationResultStatus | null;
  updatedAt: string | null;
};

// Une note soumise ou approuvée modifiée repasse en brouillon (règle serveur).
const VALIDATED_STATUSES: (TeachingCourseEvaluationResultStatus | null)[] = [
  "submitted",
  "approved",
];

function toScoringRow(
  entry: TeachingCourseEvaluationResultRosterEntry,
): ScoringRow {
  const parsed =
    entry.score !== null && entry.score !== undefined
      ? Number(entry.score)
      : null;
  const score = parsed !== null && !Number.isNaN(parsed) ? parsed : null;
  const studentLabel =
    entry.enrollment.student?.fullDesignation ??
    entry.enrollment.student?.fullName ??
    "Élève";

  return {
    enrollmentId: entry.enrollment.id,
    studentLabel,
    score,
    draft: score !== null ? String(score) : "",
    error: null,
    originalScore: score,
    resultId: entry.id ?? null,
    status: entry.status ?? null,
    updatedAt: entry.updatedAt ?? null,
  };
}

function draftDiffersFromOriginal(row: ScoringRow) {
  const original = row.originalScore !== null ? String(row.originalScore) : "";
  return row.draft.trim() !== original;
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
  const colors = useThemeColors();
  const {
    teachingCourseEvaluationResultRoster,
    teachingCourseEvaluationResultRosterIsLoading,
    teachingCourseEvaluationResultRosterError,
    loadTeachingCourseEvaluationResultRoster,
  } = useTeachingCourseEvaluationResultRoster(evaluationId);

  const {
    saveTeachingCourseEvaluationResults,
    saveTeachingCourseEvaluationResultsIsPending,
  } = useSaveTeachingCourseEvaluationResults();

  const queryClient = useQueryClient();

  const {
    exportTeachingCourseEvaluationResults,
    exportTeachingCourseEvaluationResultsIsPending,
  } = useExportTeachingCourseEvaluationResults(evaluationId);

  const {
    importTeachingCourseEvaluationResults,
    importTeachingCourseEvaluationResultsIsPending,
  } = useImportTeachingCourseEvaluationResults(evaluationId);

  const {
    submitTeachingCourseEvaluationResults,
    submitTeachingCourseEvaluationResultsIsPending,
  } = useSubmitTeachingCourseEvaluationResults(evaluationId);

  const canSubmitResults = useCan(
    "academics.evaluations::courseEvaluations.submitResults",
  );

  const { confirm, ConfirmDialog } = useConfirm();

  const [rows, setRows] = useState<ScoringRow[]>([]);
  // Empêche un refetch en arrière-plan d'écraser des saisies non
  // sauvegardées (cf. spec §7.6, hasUnsavedScoreChangesRef côté web).
  const hasUnsavedChangesRef = useRef(false);

  useEffect(() => {
    if (!teachingCourseEvaluationResultRoster) return;
    if (hasUnsavedChangesRef.current) return;

    // Ordre du serveur (nom de l'élève), le même qu'au pointage : pas de tri local sur fullDesignation, qui commence par le matricule.
    setRows(teachingCourseEvaluationResultRoster.map(toScoringRow));
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
          ? {
              ...r,
              score,
              draft: score !== null ? String(score) : "",
              error: null,
            }
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
      toastNotify(
        "Format non accepté. Formats autorisés : XLSX, XLS.",
        "error",
      );
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

    // Seules les lignes modifiées partent : une ligne inchangée ne peut pas écraser une note modifiée ailleurs entre-temps.
    const changedRows = parsedRows.filter(
      (row) => row.score !== row.originalScore,
    );
    if (changedRows.length === 0) {
      setRows(parsedRows);
      toastNotify("Aucune modification à enregistrer.", "info");
      return;
    }

    const revertedCount = changedRows.filter((row) =>
      VALIDATED_STATUSES.includes(row.status),
    ).length;
    if (revertedCount > 0) {
      const confirmed = await confirm({
        title: "Notes déjà validées",
        description: `${revertedCount} note(s) déjà soumise(s) ou approuvée(s) repasseront en brouillon. Continuer ?`,
        confirmText: "Enregistrer",
        cancelText: "Annuler",
      });
      if (!confirmed) return;
    }

    const payload = {
      evaluationId,
      results: changedRows.map((row) => ({
        enrollmentId: row.enrollmentId,
        score: row.score,
        expectedUpdatedAt: row.updatedAt,
      })),
    };

    const parsed = teachingCourseEvaluationResultSchema.safeParse(payload);
    if (!parsed.success) {
      toastNotify("Certaines notes sont invalides.", "error");
      return;
    }

    await submitGrades(parsed.data, parsedRows);
  };

  // Les notes mises en file restent affichées à la réouverture de la grille.
  // updatedAt n'est pas touché : c'est la version de base, rebasée par la file une fois l'envoi accepté.
  const keepQueuedScores = (payload: TeachingCourseEvaluationResultPayload) => {
    const queuedScores = new Map(
      payload.results.map((row) => [row.enrollmentId, row.score ?? null]),
    );

    queryClient.setQueryData<TeachingCourseEvaluationResultRosterEntry[]>(
      teachingCourseEvaluationResultKeys.roster(evaluationId),
      (entries) =>
        entries?.map((entry) => {
          if (!queuedScores.has(entry.enrollment.id)) return entry;
          const score = queuedScores.get(entry.enrollment.id);
          return {
            ...entry,
            score: score !== null && score !== undefined ? String(score) : null,
          };
        }),
    );
  };

  const submitGrades = async (
    payload: TeachingCourseEvaluationResultPayload,
    parsedRows: ScoringRow[],
  ): Promise<void> => {
    const label = `${evaluation.wording ?? "Évaluation"} · ${payload.results.length} note(s)`;

    try {
      const result = await saveTeachingCourseEvaluationResults(payload, label);
      hasUnsavedChangesRef.current = false;

      if (result.status === "queued") {
        keepQueuedScores(payload);
        notifyQueued();
        onClose();
        return;
      }

      const saved = new Map(
        result.data.saved.map((row) => [row.enrollment_id, row]),
      );
      setRows(
        parsedRows.map((row) => {
          const written = saved.get(row.enrollmentId);
          return written
            ? {
                ...row,
                originalScore: row.score,
                resultId: written.id,
                status: written.status,
                updatedAt: written.updated_at,
              }
            : row;
        }),
      );

      const skippedCount = result.data.skipped.length;
      toastNotify(
        skippedCount > 0
          ? `Notes enregistrées. ${skippedCount} note(s) modifiée(s) entre-temps laissée(s) telle(s) quelle(s).`
          : "Notes enregistrées avec succès.",
        "success",
      );
    } catch (error) {
      const failure = getOfflineFailure(error);

      // Des notes ont changé sur le serveur depuis le chargement : rien n'a été écrit.
      if (
        getFailureCode(failure) === "GRADES_CONFLICT" &&
        payload.conflictStrategy !== "skip_conflicts"
      ) {
        const confirmed = await confirm({
          title: "Notes modifiées entre-temps",
          description: `${describeFailure(failure)}\n\nEnregistrer les autres notes sans toucher à celles-ci ?`,
          confirmText: "Enregistrer les autres",
          cancelText: "Annuler",
        });
        if (confirmed) {
          await submitGrades(
            { ...payload, conflictStrategy: "skip_conflicts" },
            parsedRows,
          );
        }
        return;
      }

      handleApiError(error);
    }
  };

  // Seul le brouillon passe à « soumis » (règle serveur) ; une note sans id n'est pas encore enregistrée.
  const submittableResultIds = rows
    .filter((row) => row.status === "draft" && row.resultId !== null)
    .map((row) => row.resultId as string);

  const handleSubmitResults = async () => {
    // On soumet ce qui est sur le serveur : une saisie en cours doit d'abord être enregistrée.
    if (rows.some(draftDiffersFromOriginal)) {
      toastNotify(
        "Enregistrez d'abord vos modifications avant de soumettre.",
        "info",
      );
      return;
    }

    const confirmed = await confirm({
      title: "Soumettre les notes",
      description: `${submittableResultIds.length} note(s) en brouillon seront soumises pour approbation. Vous pourrez encore les modifier, mais elles repasseront alors en brouillon.`,
      confirmText: "Soumettre",
      cancelText: "Annuler",
    });
    if (!confirmed) return;

    try {
      await submitTeachingCourseEvaluationResults(submittableResultIds);
      setRows((prev) =>
        prev.map((row) =>
          row.resultId !== null && submittableResultIds.includes(row.resultId)
            ? { ...row, status: "submitted" }
            : row,
        ),
      );
      toastNotify("Notes soumises avec succès.", "success");
    } catch (error) {
      handleApiError(error);
    }
  };

  const isBusy =
    saveTeachingCourseEvaluationResultsIsPending ||
    submitTeachingCourseEvaluationResultsIsPending ||
    exportTeachingCourseEvaluationResultsIsPending ||
    importTeachingCourseEvaluationResultsIsPending ||
    teachingCourseEvaluationResultRosterIsLoading;

  return (
    <Modal visible animationType="slide" onRequestClose={onClose}>
      <ConfirmDialog />
      <View className="flex-1 bg-background">
        <View className="px-4 pt-14 pb-3 border-b border-divider">
          <View className="flex-row items-center justify-between">
            <Text className="text-base font-semibold text-foreground">
              Saisir les notes
            </Text>
            <Pressable onPress={onClose} hitSlop={8}>
              <Ionicons
                name="close"
                size={22}
                color={colors.foregroundSecondary}
              />
            </Pressable>
          </View>
          <Text
            className="text-xs text-muted-foreground mt-1"
            numberOfLines={1}
          >
            {`${evaluation.wording ?? "Évaluation"} · Noté sur ${maxScore}`}
          </Text>

          <View className="flex-row items-center gap-2 mt-3">
            <Pressable
              onPress={() => void handleExport()}
              disabled={isBusy}
              className={`flex-1 h-10 rounded-lg border items-center justify-center flex-row gap-1.5 ${
                isBusy ? "border-border" : "border-input"
              }`}
            >
              {exportTeachingCourseEvaluationResultsIsPending ? (
                <ActivityIndicator
                  size="small"
                  color={colors.foregroundSecondary}
                />
              ) : (
                <Ionicons
                  name="download-outline"
                  size={16}
                  color={colors.foregroundSecondary}
                />
              )}
              <Text className="text-sm font-medium text-foreground-secondary">
                Exporter
              </Text>
            </Pressable>

            <Pressable
              onPress={() => void handleImport()}
              disabled={isBusy}
              className={`flex-1 h-10 rounded-lg border items-center justify-center flex-row gap-1.5 ${
                isBusy ? "border-border" : "border-input"
              }`}
            >
              {importTeachingCourseEvaluationResultsIsPending ? (
                <ActivityIndicator
                  size="small"
                  color={colors.foregroundSecondary}
                />
              ) : (
                <Ionicons
                  name="cloud-upload-outline"
                  size={16}
                  color={colors.foregroundSecondary}
                />
              )}
              <Text className="text-sm font-medium text-foreground-secondary">
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
            <Text className="text-sm text-muted-foreground text-center">
              {"Impossible de charger les élèves."}
            </Text>
            <Pressable
              onPress={() => loadTeachingCourseEvaluationResultRoster()}
              className="h-10 px-4 rounded-lg bg-foreground items-center justify-center"
            >
              <Text className="text-background font-medium">Réessayer</Text>
            </Pressable>
          </View>
        ) : (
          <FlatList
            data={rows}
            keyExtractor={(row, index) =>
              `${row.enrollmentId || "row"}-${index}`
            }
            renderItem={({ item, index }) => (
              <EvaluationScoringRow
                studentLabel={item.studentLabel}
                maxScore={maxScore}
                draft={item.draft}
                error={item.error}
                warning={
                  VALIDATED_STATUSES.includes(item.status) &&
                  draftDiffersFromOriginal(item)
                    ? "Repassera en brouillon"
                    : null
                }
                onChangeText={(text) => handleChangeText(index, text)}
                onBlur={() => handleBlur(index)}
              />
            )}
            ListEmptyComponent={
              <View className="items-center justify-center px-6 py-16">
                <Text className="text-sm text-faint text-center">
                  {"Aucun élève inscrit."}
                </Text>
              </View>
            }
          />
        )}

        <View className="p-4 border-t border-divider flex-row gap-2">
          {canSubmitResults && (
            <Pressable
              onPress={() => void handleSubmitResults()}
              disabled={isBusy || submittableResultIds.length === 0}
              accessibilityLabel="Soumettre les notes pour approbation"
              className={`flex-1 h-12 rounded-lg border items-center justify-center flex-row gap-1.5 ${
                isBusy || submittableResultIds.length === 0
                  ? "border-border opacity-50"
                  : "border-input"
              }`}
            >
              {submitTeachingCourseEvaluationResultsIsPending ? (
                <ActivityIndicator
                  size="small"
                  color={colors.foregroundSecondary}
                />
              ) : (
                <Ionicons
                  name="send-outline"
                  size={16}
                  color={colors.foregroundSecondary}
                />
              )}
              <Text className="text-sm font-medium text-foreground-secondary">
                {submittableResultIds.length > 0
                  ? `Soumettre (${submittableResultIds.length})`
                  : "Soumettre"}
              </Text>
            </Pressable>
          )}

          <Pressable
            onPress={() => void handleSave()}
            disabled={saveTeachingCourseEvaluationResultsIsPending}
            className={`flex-1 h-12 rounded-lg items-center justify-center ${
              saveTeachingCourseEvaluationResultsIsPending
                ? "bg-gray-300 dark:bg-zinc-700"
                : "bg-foreground"
            }`}
          >
            {saveTeachingCourseEvaluationResultsIsPending ? (
              <ActivityIndicator color={colors.background} />
            ) : (
              <Text className="text-background font-medium">
                {canSubmitResults ? "Enregistrer" : "Enregistrer les notes"}
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
