import type { StudentPeriodAppraisalBulkPayload } from "@/api/endpoints/studentPeriodAppraisal";
import { ComboBox } from "@/components/list/combo-box";
import { RequiredFiltersNotice } from "@/components/list/required-filters-notice";
import { getSchoolClassLabel } from "@/features/staff/attendance/attendance-labels";
import { DrawerMenuButton } from "@/features/staff/drawer-menu-button";
import { describeFailure } from "@/features/staff/sync/sync-labels";
import { useCurrentTeacher } from "@/hooks/queries/items/employee";
import { useSchoolClasses } from "@/hooks/queries/items/school-class";
import { useCurrentSchoolYear } from "@/hooks/queries/items/school-year";
import {
  useAppraisalMentions,
  useGeneralClassSchoolPeriods,
  useSaveStudentPeriodAppraisals,
  useStudentPeriodAppraisalGrid,
} from "@/hooks/queries/items/student-period-appraisal";
import { useCan } from "@/hooks/use-can";
import { useConfirm } from "@/hooks/use-confirm";
import { useThemeColors } from "@/hooks/use-theme-colors";
import { handleApiError } from "@/lib/handle-api-error";
import { getFailureCode, getOfflineFailure } from "@/lib/offline/offline-error";
import { notifyQueued } from "@/lib/offline/use-offline-mutation";
import { toastNotify } from "@/lib/toast";
import { studentPeriodAppraisalKeys } from "@/utils/query-keys/student-period-appraisal";
import type {
  AppraisalMention,
  StudentPeriodAppraisalGridRow,
} from "@/utils/types/StudentPeriodAppraisal";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useQueryClient } from "@tanstack/react-query";
import { Stack } from "expo-router";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  Text,
  View,
} from "react-native";
import { AppraisalEditorDialog, type AppraisalDraft } from "./appraisal-editor-dialog";

const COURSE_PERIOD_TYPE_CODE = "period";

type AppraisalRow = {
  enrollmentId: string;
  studentLabel: string;
  original: AppraisalDraft;
  draft: AppraisalDraft;
  // Version lue sur le serveur, renvoyée dans expected_updated_at.
  updatedAt: string | null;
};

function toDraft(row: StudentPeriodAppraisalGridRow): AppraisalDraft {
  return {
    application: row.application?.value ?? null,
    conduct: row.conduct?.value ?? null,
    comments: row.comments ?? null,
  };
}

function toRow(row: StudentPeriodAppraisalGridRow): AppraisalRow {
  const draft = toDraft(row);
  return {
    enrollmentId: row.enrollmentId,
    studentLabel: row.studentName ?? row.enrollmentNumber ?? "Élève",
    original: draft,
    draft,
    updatedAt: row.updatedAt,
  };
}

function isChanged(row: AppraisalRow) {
  return (
    row.draft.application !== row.original.application ||
    row.draft.conduct !== row.original.conduct ||
    (row.draft.comments ?? null) !== (row.original.comments ?? null)
  );
}

// Appréciations « Application » / « Conduite » de la classe du titulaire, par période ; enregistrées par la file hors ligne.
export function AppraisalsScreen() {
  const colors = useThemeColors();
  const queryClient = useQueryClient();
  const { confirm, ConfirmDialog } = useConfirm();
  const canUpdate = useCan("academics.studentAppraisals.update");

  const [selectedSchoolClassId, setSchoolClassId] = useState<string | null>(null);
  const [selectedSchoolPeriodId, setSchoolPeriodId] = useState<string | null>(null);
  const [rows, setRows] = useState<AppraisalRow[]>([]);
  const [editing, setEditing] = useState<AppraisalRow | null>(null);
  // Un rechargement en arrière-plan ne doit pas écraser une saisie non enregistrée (même règle que la grille des notes).
  const hasUnsavedChangesRef = useRef(false);

  const { currentSchoolYear } = useCurrentSchoolYear();
  const schoolYearId = currentSchoolYear?.id ?? null;

  const { currentTeacher, currentTeacherIsLoading } = useCurrentTeacher();
  const { schoolClasses, schoolClassesIsLoading } = useSchoolClasses({
    filters: {
      teacherId: currentTeacher?.id ?? null,
      schoolYearId,
      homeroom: true,
    },
    // Sans enseignant courant (direction), toutes les classes ; un enseignant reste limité aux siennes côté serveur.
    enabled: !currentTeacherIsLoading && Boolean(schoolYearId),
  });

  const schoolClassId =
    selectedSchoolClassId ??
    (schoolClasses?.length === 1 ? schoolClasses[0].id : null);
  const schoolClass = schoolClasses?.find((item) => item.id === schoolClassId);

  const { generalClassSchoolPeriods, generalClassSchoolPeriodsIsLoading } =
    useGeneralClassSchoolPeriods(schoolYearId, schoolClass?.generalClassId);

  // Périodes de cours de la classe (pas d'appréciation sur un examen), et celle en cours pour la présélection.
  const { schoolPeriods, currentSchoolPeriodId } = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);
    const byId = new Map<string, { id: string; label: string; order: number }>();
    let current: string | null = null;

    for (const item of generalClassSchoolPeriods ?? []) {
      const period = item.schoolPeriod;
      if (!period) continue;
      if (period.periodType && period.periodType.code !== COURSE_PERIOD_TYPE_CODE) continue;

      byId.set(period.id, { id: period.id, label: period.name, order: period.displayOrder });
      if (item.startDate && item.endDate && item.startDate <= today && today <= item.endDate) {
        current = period.id;
      }
    }

    return {
      schoolPeriods: [...byId.values()].sort((a, b) => a.order - b.order),
      currentSchoolPeriodId: current,
    };
  }, [generalClassSchoolPeriods]);

  const schoolPeriodId = selectedSchoolPeriodId ?? currentSchoolPeriodId;
  const schoolPeriodLabel = schoolPeriods.find((p) => p.id === schoolPeriodId)?.label;

  const gridFilters = { schoolClassId, schoolYearId, schoolPeriodId };
  const {
    appraisalGrid,
    appraisalGridError,
    appraisalGridIsLoading,
    loadAppraisalGrid,
  } = useStudentPeriodAppraisalGrid(gridFilters);

  const { appraisalMentions } = useAppraisalMentions();
  const mentionsByValue = useMemo(
    () => new Map(appraisalMentions.map((m) => [m.value, m])),
    [appraisalMentions],
  );

  useEffect(() => {
    if (!appraisalGrid || hasUnsavedChangesRef.current) return;
    setRows(appraisalGrid.map(toRow));
  }, [appraisalGrid]);

  const changedRows = rows.filter(isChanged);

  // Changer de classe ou de période abandonne la saisie en cours : on demande d'abord.
  const confirmDiscard = async () => {
    if (!hasUnsavedChangesRef.current || changedRows.length === 0) return true;
    const confirmed = await confirm({
      title: "Modifications non enregistrées",
      description: `${changedRows.length} appréciation(s) modifiée(s) seront perdues. Continuer ?`,
      confirmText: "Abandonner",
      cancelText: "Annuler",
      variant: "destructive",
    });
    if (confirmed) hasUnsavedChangesRef.current = false;
    return confirmed;
  };

  const changeSelection = async (apply: () => void) => {
    if (!(await confirmDiscard())) return;
    setRows([]);
    apply();
  };

  const applyDraft = (enrollmentId: string, draft: AppraisalDraft) => {
    hasUnsavedChangesRef.current = true;
    setRows((prev) =>
      prev.map((row) => (row.enrollmentId === enrollmentId ? { ...row, draft } : row)),
    );
    setEditing(null);
  };

  const { saveStudentPeriodAppraisals, saveStudentPeriodAppraisalsIsPending } =
    useSaveStudentPeriodAppraisals();

  // Les appréciations mises en file restent affichées à la réouverture de la grille.
  // updatedAt n'est pas touché : c'est la version de base, rebasée par la file une fois l'envoi accepté.
  const keepQueuedAppraisals = (payload: StudentPeriodAppraisalBulkPayload) => {
    const queued = new Map(payload.appraisals.map((row) => [row.enrollmentId, row]));
    const toMention = (value: string | null): AppraisalMention | null =>
      value ? (mentionsByValue.get(value as AppraisalMention["value"]) ?? null) : null;

    queryClient.setQueryData<StudentPeriodAppraisalGridRow[]>(
      studentPeriodAppraisalKeys.grid(payload),
      (entries) =>
        entries?.map((entry) => {
          const row = queued.get(entry.enrollmentId);
          if (!row) return entry;
          return {
            ...entry,
            application: toMention(row.application),
            conduct: toMention(row.conduct),
            comments: row.comments,
          };
        }),
    );
  };

  const markSaved = (versions: Map<string, string | null> | null) =>
    setRows((prev) =>
      prev.map((row) => {
        if (!isChanged(row)) return row;
        if (versions && !versions.has(row.enrollmentId)) return row;
        return {
          ...row,
          original: row.draft,
          updatedAt: versions ? (versions.get(row.enrollmentId) ?? null) : row.updatedAt,
        };
      }),
    );

  const submit = async (payload: StudentPeriodAppraisalBulkPayload): Promise<void> => {
    const label = `${schoolClass ? getSchoolClassLabel(schoolClass) : "Classe"} · ${schoolPeriodLabel ?? "Période"} · ${payload.appraisals.length} appréciation(s)`;

    try {
      const result = await saveStudentPeriodAppraisals(payload, label);
      hasUnsavedChangesRef.current = false;

      if (result.status === "queued") {
        keepQueuedAppraisals(payload);
        markSaved(null);
        notifyQueued();
        return;
      }

      // Lignes écrites ou supprimées, plus celles envoyées identiques à l'état serveur (non réécrites).
      const skipped = new Set(result.data.skipped.map((row) => row.enrollment_id));
      const versions = new Map<string, string | null>();
      for (const row of payload.appraisals) {
        if (!skipped.has(row.enrollmentId)) versions.set(row.enrollmentId, row.expectedUpdatedAt ?? null);
      }
      for (const row of result.data.written) versions.set(row.enrollment_id, row.updated_at);
      markSaved(versions);

      toastNotify(
        skipped.size > 0
          ? `Appréciations enregistrées. ${skipped.size} modifiée(s) entre-temps laissée(s) telle(s) quelle(s).`
          : "Appréciations enregistrées avec succès.",
        "success",
      );
    } catch (error) {
      const failure = getOfflineFailure(error);

      // Des appréciations ont changé sur le serveur depuis le chargement (co-titulaire) : rien n'a été écrit.
      if (
        getFailureCode(failure) === "APPRAISALS_CONFLICT" &&
        payload.conflictStrategy !== "skip_conflicts"
      ) {
        const confirmed = await confirm({
          title: "Appréciations modifiées entre-temps",
          description: `${describeFailure(failure)}\n\nEnregistrer les autres sans toucher à celles-ci ?`,
          confirmText: "Enregistrer les autres",
          cancelText: "Annuler",
        });
        if (confirmed) {
          await submit({ ...payload, conflictStrategy: "skip_conflicts" });
        }
        return;
      }

      handleApiError(error);
    }
  };

  const handleSave = () => {
    if (!schoolClassId || !schoolYearId || !schoolPeriodId) return;
    if (changedRows.length === 0) {
      toastNotify("Aucune modification à enregistrer.", "info");
      return;
    }

    void submit({
      schoolClassId,
      schoolYearId,
      schoolPeriodId,
      appraisals: changedRows.map((row) => ({
        enrollmentId: row.enrollmentId,
        ...row.draft,
        expectedUpdatedAt: row.updatedAt,
      })),
    });
  };

  const isSelectionComplete = Boolean(schoolClassId && schoolPeriodId);
  const mentionAbbreviation = (value: string | null) =>
    value ? (mentionsByValue.get(value as AppraisalMention["value"])?.abbreviation ?? value) : "—";

  return (
    <>
      <Stack.Screen
        options={{ title: "Appréciations", headerLeft: () => <DrawerMenuButton /> }}
      />
      <ConfirmDialog />

      <View className="flex-1 bg-background">
        <View className="px-4 pt-3">
          <ComboBox
            label="Classe"
            placeholder="Sélectionner une classe"
            options={(schoolClasses ?? []).map((item) => ({
              id: item.id,
              label: getSchoolClassLabel(item),
            }))}
            value={schoolClassId}
            onChange={(id) =>
              void changeSelection(() => {
                setSchoolClassId(id);
                setSchoolPeriodId(null);
              })
            }
            loading={currentTeacherIsLoading || schoolClassesIsLoading}
            emptyLabel="Vous n'êtes titulaire d'aucune classe cette année"
          />

          {schoolClassId && (
            <ComboBox
              label="Période"
              placeholder="Sélectionner une période"
              options={schoolPeriods}
              value={schoolPeriodId}
              onChange={(id) => void changeSelection(() => setSchoolPeriodId(id))}
              loading={generalClassSchoolPeriodsIsLoading}
              emptyLabel="Aucune période de cours pour cette classe"
            />
          )}
        </View>

        {!isSelectionComplete ? (
          <RequiredFiltersNotice
            title="Aucune appréciation"
            icon="ribbon-outline"
            requirements={[
              { label: "une classe", done: Boolean(schoolClassId) },
              { label: "une période", done: Boolean(schoolPeriodId) },
            ]}
          />
        ) : appraisalGridIsLoading ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator />
          </View>
        ) : appraisalGridError && rows.length === 0 ? (
          <View className="flex-1 items-center justify-center px-6 gap-3">
            <Text className="text-sm text-muted-foreground text-center">
              Impossible de charger les appréciations.
            </Text>
            <Pressable
              onPress={() => void loadAppraisalGrid()}
              className="h-10 px-4 rounded-lg bg-foreground items-center justify-center"
            >
              <Text className="text-background font-medium">Réessayer</Text>
            </Pressable>
          </View>
        ) : (
          <FlatList
            data={rows}
            keyExtractor={(row) => row.enrollmentId}
            contentContainerStyle={{ paddingBottom: 12 }}
            ListHeaderComponent={
              <Text className="px-4 py-2 text-xs text-faint">
                {`${rows.length} élève${rows.length > 1 ? "s" : ""} · Application / Conduite`}
              </Text>
            }
            ListEmptyComponent={
              <View className="items-center justify-center px-6 py-16">
                <Text className="text-sm text-faint text-center">Aucun élève inscrit.</Text>
              </View>
            }
            renderItem={({ item }) => {
              const changed = isChanged(item);
              return (
                <Pressable
                  onPress={() => setEditing(item)}
                  disabled={!canUpdate}
                  className={`flex-row items-center gap-3 px-4 py-3 border-b border-divider active:bg-subtle ${
                    changed ? "bg-amber-50 dark:bg-amber-900/20" : ""
                  }`}
                >
                  <View className="flex-1">
                    <Text className="text-sm font-medium text-foreground" numberOfLines={1}>
                      {item.studentLabel}
                    </Text>
                    {item.draft.comments ? (
                      <Text className="text-xs text-muted-foreground" numberOfLines={1}>
                        {item.draft.comments}
                      </Text>
                    ) : null}
                  </View>
                  <Text className="text-sm font-semibold text-foreground">
                    {`${mentionAbbreviation(item.draft.application)} / ${mentionAbbreviation(item.draft.conduct)}`}
                  </Text>
                  <Ionicons name="chevron-forward" size={16} color={colors.faint} />
                </Pressable>
              );
            }}
          />
        )}

        {canUpdate && isSelectionComplete && rows.length > 0 && (
          <View className="p-4 border-t border-divider">
            <Pressable
              onPress={handleSave}
              disabled={saveStudentPeriodAppraisalsIsPending || changedRows.length === 0}
              className={`h-12 rounded-lg items-center justify-center ${
                saveStudentPeriodAppraisalsIsPending || changedRows.length === 0
                  ? "bg-gray-300 dark:bg-zinc-700"
                  : "bg-foreground"
              }`}
            >
              {saveStudentPeriodAppraisalsIsPending ? (
                <ActivityIndicator color={colors.background} />
              ) : (
                <Text className="text-background font-medium">
                  {changedRows.length > 0
                    ? `Enregistrer (${changedRows.length})`
                    : "Enregistrer"}
                </Text>
              )}
            </Pressable>
          </View>
        )}
      </View>

      {editing && (
        <AppraisalEditorDialog
          studentLabel={editing.studentLabel}
          mentions={appraisalMentions}
          value={editing.draft}
          onApply={(draft) => applyDraft(editing.enrollmentId, draft)}
          onClose={() => setEditing(null)}
        />
      )}
    </>
  );
}
