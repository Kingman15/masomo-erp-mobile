import { ComboBox } from "@/components/list/combo-box";
import { DateField } from "@/components/list/date-field";
import { getSchoolClassLabel } from "@/features/teacher/attendance/attendance-labels";
import { DrawerMenuButton } from "@/features/teacher/drawer-menu-button";
import { ReportStateView } from "@/features/teacher/grades/report-state-view";
import { useCurrentTeacher } from "@/hooks/queries/items/employee";
import {
  useEnrollmentDecisionGrid,
  useEnrollmentDecisionTypes,
  usePassMark,
  useSaveEnrollmentDecisions,
} from "@/hooks/queries/items/enrollment-decision";
import { useSchoolClasses } from "@/hooks/queries/items/school-class";
import { useCurrentSchoolYear } from "@/hooks/queries/items/school-year";
import { useCan } from "@/hooks/use-can";
import { useConfirm } from "@/hooks/use-confirm";
import { useThemeColors } from "@/hooks/use-theme-colors";
import { formatNumber } from "@/lib/format";
import { handleApiError } from "@/lib/handle-api-error";
import { useIsOnline } from "@/lib/offline/use-offline-queue";
import { toastNotify } from "@/lib/toast";
import type {
  DeliberationSession,
  EnrollmentDecisionGrid,
} from "@/utils/types/EnrollmentDecision";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Stack } from "expo-router";
import { useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  Text,
  TextInput,
  View,
} from "react-native";
import { DecisionEditorDialog } from "./decision-editor-dialog";
import {
  coursesFromFailed,
  DECISION_TONES,
  isChanged,
  selectableDecisionTypes,
  studentLabel,
  toPayloadItem,
  toRow,
  visibleProposal,
  type DecisionDraft,
  type DecisionRow,
} from "./deliberation-model";

const SESSIONS: { value: DeliberationSession; label: string }[] = [
  { value: 1, label: "1ère session" },
  { value: 2, label: "2ème session" },
];

function DecisionRowItem({
  row,
  decisionLabel,
  onPress,
}: {
  row: DecisionRow;
  decisionLabel: string | null;
  onPress: () => void;
}) {
  const { source, draft } = row;
  const changed = isChanged(row);
  // Saisie en cours, sinon ajustements enregistrés
  const adjustedCount =
    draft.adjustments?.length ?? source.decision?.adjustedPointsCount ?? 0;
  const proposal = visibleProposal(source);
  // Comme sur le web : une décision qui s'écarte de la proposition est signalée
  const differsFromProposal =
    draft.decision !== null &&
    proposal !== null &&
    draft.decision !== proposal.value;

  return (
    <Pressable
      onPress={onPress}
      className={`flex-row items-center gap-2 px-3 py-2.5 border rounded-lg mb-2 bg-card ${
        changed ? "border-amber-500" : "border-border"
      }`}
    >
      <View className="flex-1 gap-1">
        <Text
          className="text-sm font-medium text-foreground"
          numberOfLines={1}
        >
          {studentLabel(source)}
        </Text>

        <Text className="text-xs text-muted-foreground">
          {source.percentage !== null
            ? `${formatNumber(source.percentage)}%`
            : "—"}
          {source.rank !== null
            ? ` · ${source.rank}${source.rank === 1 ? "er" : "e"} / ${source.totalStudents}`
            : ""}
          {source.failedCourses.length > 0
            ? ` · ${source.failedCourses.length} échec${source.failedCourses.length > 1 ? "s" : ""}`
            : ""}
        </Text>

        {(changed || adjustedCount > 0) && (
          <Text className="text-xs text-faint">
            {changed ? "Modifié, non enregistré" : ""}
            {changed && adjustedCount > 0 ? " · " : ""}
            {adjustedCount > 0 ? `${adjustedCount} point(s) ajusté(s)` : ""}
          </Text>
        )}
      </View>

      {/* Décision centrée verticalement sur toute la hauteur de la carte */}
      <View className="items-end gap-1">
        {draft.decision && decisionLabel ? (
          <View
            className={`rounded-full px-2.5 py-0.5 ${DECISION_TONES[draft.decision].container}`}
          >
            <Text
              className={`text-xs font-semibold ${DECISION_TONES[draft.decision].text}`}
            >
              {decisionLabel}
            </Text>
          </View>
        ) : (
          <Text className="text-xs text-faint">Non décidé</Text>
        )}
        {proposal && (
          <Text
            className={`text-xs ${
              differsFromProposal
                ? "text-amber-700 dark:text-amber-300"
                : "text-faint"
            }`}
          >
            Proposé : {proposal.label}
          </Text>
        )}
      </View>
    </Pressable>
  );
}

// Délibération de la classe du titulaire (EnrollmentDecisionPolicy) : en ligne uniquement, enregistrement confirmé.
// Seuls les élèves modifiés sont envoyés, avec leurs points ajustés seulement s'ils ont changé.
export function DeliberationScreen() {
  const colors = useThemeColors();
  const isOnline = useIsOnline();
  const canUpdate = useCan("academics.enrollmentDecisions.update");
  const { confirm, ConfirmDialog } = useConfirm();

  const [selectedSchoolClassId, setSchoolClassId] = useState<string | null>(
    null,
  );
  const [session, setSession] = useState<DeliberationSession>(1);
  const [rows, setRows] = useState<DecisionRow[]>([]);
  const [heldOn, setHeldOn] = useState<string | null>(null);
  const [sessionComments, setSessionComments] = useState("");
  // Grille dont la saisie est issue : resynchronisée au rendu quand une nouvelle grille arrive sans saisie en cours
  const [syncedGrid, setSyncedGrid] = useState<EnrollmentDecisionGrid | null>(
    null,
  );
  const [editingId, setEditingId] = useState<string | null>(null);
  // Classe pour laquelle la session d'ouverture a été choisie : la 2ème si elle a déjà eu lieu, une seule fois par classe
  const [sessionPickedFor, setSessionPickedFor] = useState<string | null>(null);

  const { currentSchoolYear } = useCurrentSchoolYear();
  const schoolYearId = currentSchoolYear?.id;

  const { currentTeacher, currentTeacherIsLoading } = useCurrentTeacher();
  const { schoolClasses, schoolClassesIsLoading } = useSchoolClasses({
    filters: {
      teacherId: currentTeacher?.id ?? null,
      schoolYearId: schoolYearId ?? null,
      homeroom: true,
    },
    enabled: Boolean(currentTeacher?.id && schoolYearId),
  });

  // Une seule classe : sélectionnée d'office (cas le plus courant pour un titulaire).
  const schoolClassId =
    selectedSchoolClassId ??
    (schoolClasses?.length === 1 ? schoolClasses[0].id : null);

  const {
    decisionGrid,
    decisionGridError,
    decisionGridIsLoading,
    decisionGridIsFetching,
    loadDecisionGrid,
  } = useEnrollmentDecisionGrid({ schoolClassId, schoolYearId, session });
  const { decisionTypes: allDecisionTypes } = useEnrollmentDecisionTypes();
  const { passMark } = usePassMark();
  const { saveEnrollmentDecisions, saveEnrollmentDecisionsIsPending } =
    useSaveEnrollmentDecisions();

  const meta = decisionGrid?.meta;
  const deliberation = meta?.deliberation ?? null;
  const firstSessionHeld = meta?.firstSessionHeld ?? false;

  const changedRows = rows.filter(isChanged);
  // Comparé à la grille dont la saisie est issue, pas à celle chargée : au changement de session, la grille
  // en cache arrive avant la resynchronisation et ferait passer sa séance pour une modification.
  const syncedDeliberation = syncedGrid?.meta.deliberation ?? null;
  const sessionChanged =
    (heldOn ?? null) !== (syncedDeliberation?.heldOn ?? null) ||
    sessionComments.trim() !== (syncedDeliberation?.comments ?? "").trim();
  const hasUnsavedChanges = changedRows.length > 0 || sessionChanged;

  const resetFrom = (grid: EnrollmentDecisionGrid | null) => {
    setSyncedGrid(grid);
    setRows(grid ? grid.rows.map(toRow) : []);
    setHeldOn(grid?.meta.deliberation?.heldOn ?? null);
    setSessionComments(grid?.meta.deliberation?.comments ?? "");
  };

  // Première grille de la classe : on ouvre la 2ème session si elle a déjà eu lieu (l'utilisateur peut revenir à la 1ère)
  if (schoolClassId && meta && sessionPickedFor !== schoolClassId) {
    setSessionPickedFor(schoolClassId);
    if (session === 1 && meta.secondSessionHeld && !hasUnsavedChanges) {
      resetFrom(null);
      setSession(2);
    }
  }

  // Tant que la session d'ouverture n'est pas choisie, aucune n'est montrée comme sélectionnée et la grille reste en chargement
  const sessionPicked =
    schoolClassId !== null && sessionPickedFor === schoolClassId;

  // Nouvelle grille (chargement, rafraîchissement, enregistrement) : reprise tant que rien n'est en cours de saisie
  if ((decisionGrid ?? null) !== syncedGrid && !hasUnsavedChanges) {
    resetFrom(decisionGrid ?? null);
  }

  const decisionTypes = useMemo(
    () =>
      selectableDecisionTypes(
        allDecisionTypes,
        session,
        meta?.hasMakeUpExams ?? false,
        rows,
      ),
    [allDecisionTypes, session, meta, rows],
  );
  const labelOf = (value: string | null) =>
    allDecisionTypes.find((type) => type.value === value)?.label ?? null;

  const summary = decisionTypes.map((type) => ({
    ...type,
    count: rows.filter((row) => row.draft.decision === type.value).length,
  }));
  const undecidedCount = rows.filter(
    (row) => row.draft.decision === null,
  ).length;
  const applicableProposals = rows.filter(
    (row) =>
      row.draft.decision === null && visibleProposal(row.source) !== null,
  );

  // Pas de 2ème session sans 1ère session délibérée (connu seulement une fois la grille de la session chargée)
  const sessionUnavailable = session === 2 && meta !== undefined && !firstSessionHeld;
  const readOnly =
    !canUpdate || sessionUnavailable || saveEnrollmentDecisionsIsPending;

  // Changer de classe ou de session recharge la grille : on prévient si la saisie n'est pas enregistrée.
  const changeSelection = async (apply: () => void) => {
    if (hasUnsavedChanges) {
      const confirmed = await confirm({
        title: "Modifications non enregistrées",
        description:
          changedRows.length > 0
            ? `${changedRows.length} élève(s) ont des décisions non enregistrées. Les abandonner ?`
            : "Les informations de la séance ne sont pas enregistrées. Les abandonner ?",
        confirmText: "Abandonner",
        cancelText: "Annuler",
        variant: "destructive",
      });
      if (!confirmed) return;
    }
    resetFrom(null);
    apply();
  };

  const applyDraft = (enrollmentId: string, draft: DecisionDraft) => {
    setRows((prev) =>
      prev.map((row) =>
        row.source.enrollmentId === enrollmentId ? { ...row, draft } : row,
      ),
    );
    setEditingId(null);
  };

  // Aide au conseil : reprend la proposition pour les élèves sans décision, sans toucher aux décisions déjà saisies.
  const applyProposals = () => {
    setRows((prev) =>
      prev.map((row) => {
        const proposed = visibleProposal(row.source)?.value ?? null;
        if (row.draft.decision !== null || proposed === null) return row;
        return {
          ...row,
          draft: {
            ...row.draft,
            decision: proposed,
            makeUpCourses:
              proposed === "make_up_exam" &&
              row.draft.makeUpCourses.length === 0
                ? coursesFromFailed(row.source)
                : row.draft.makeUpCourses,
          },
        };
      }),
    );
    toastNotify(
      `${applicableProposals.length} proposition(s) reprise(s). Vérifiez puis enregistrez.`,
      "info",
    );
  };

  const save = async () => {
    if (!schoolClassId || !schoolYearId) return;

    if (!isOnline) {
      toastNotify(
        "La délibération ne s'enregistre qu'avec une connexion.",
        "warning",
      );
      return;
    }

    const makeUpWithoutCourses = changedRows.filter(
      (row) =>
        row.draft.decision === "make_up_exam" &&
        row.draft.makeUpCourses.length === 0,
    );
    if (makeUpWithoutCourses.length > 0) {
      toastNotify(
        `Indiquez au moins un cours à repêcher pour : ${makeUpWithoutCourses.map((row) => studentLabel(row.source)).join(", ")}.`,
        "warning",
      );
      return;
    }

    const removed = changedRows.filter(
      (row) => row.draft.decision === null && row.original.decision !== null,
    ).length;

    const confirmed = await confirm({
      title: "Enregistrer la délibération ?",
      description: [
        changedRows.length > 0
          ? `${changedRows.length} décision(s) modifiée(s)${removed > 0 ? `, dont ${removed} supprimée(s)` : ""}.`
          : "Informations de la séance seulement.",
      ].join(" "),
      confirmText: "Enregistrer",
      cancelText: "Annuler",
      variant: removed > 0 ? "destructive" : "default",
    });
    if (!confirmed) return;

    try {
      const result = await saveEnrollmentDecisions({
        school_class_id: schoolClassId,
        school_year_id: schoolYearId,
        session,
        held_on: heldOn,
        comments: sessionComments.trim() || null,
        decisions: changedRows.map((row) =>
          toPayloadItem(row.source.enrollmentId, row.draft),
        ),
      });
      // Saisie considérée comme enregistrée : la grille rechargée la remplace dès son arrivée
      setRows((prev) => prev.map((row) => ({ ...row, original: row.draft })));
      toastNotify(
        result.deleted > 0
          ? `${result.saved} décision(s) enregistrée(s), ${result.deleted} supprimée(s).`
          : `${result.saved} décision(s) enregistrée(s).`,
        "success",
      );
    } catch (error) {
      handleApiError(error);
    }
  };

  const editingRow =
    rows.find((row) => row.source.enrollmentId === editingId) ?? null;

  return (
    <>
      <Stack.Screen
        options={{
          title: "Délibération",
          headerLeft: () => <DrawerMenuButton />,
        }}
      />
      <ConfirmDialog />

      <View className="flex-1 bg-background">
        <View className="px-4 pt-3 gap-2">
          <ComboBox
            label="Classe"
            placeholder="Sélectionner une classe"
            options={(schoolClasses ?? []).map((schoolClass) => ({
              id: schoolClass.id,
              label: getSchoolClassLabel(schoolClass),
            }))}
            value={schoolClassId}
            onChange={(id) => {
              if (id === schoolClassId) return;
              void changeSelection(() => {
                setSchoolClassId(id);
                setSession(1);
              });
            }}
            loading={currentTeacherIsLoading || schoolClassesIsLoading}
            emptyLabel="Vous n'êtes titulaire d'aucune classe cette année"
          />

          {schoolClassId && (
            <View className="flex-row gap-2">
              {SESSIONS.map((item) => {
                const selected = sessionPicked && item.value === session;
                const disabled =
                  !sessionPicked ||
                  (item.value === 2 && !firstSessionHeld && session !== 2);
                return (
                  <Pressable
                    key={item.value}
                    disabled={disabled || saveEnrollmentDecisionsIsPending}
                    onPress={() => {
                      if (selected) return;
                      void changeSelection(() => setSession(item.value));
                    }}
                    className={`flex-1 h-9 rounded-full border items-center justify-center ${
                      selected
                        ? "bg-foreground border-foreground"
                        : "border-input"
                    } ${disabled ? "opacity-50" : ""}`}
                  >
                    <Text
                      className={`text-sm ${selected ? "text-background font-medium" : "text-foreground"}`}
                    >
                      {item.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          )}

          {!isOnline && (
            <View className="flex-row items-center gap-2 rounded-lg bg-amber-100 dark:bg-amber-900/40 px-3 py-2">
              <Ionicons
                name="cloud-offline-outline"
                size={16}
                color={colors.foreground}
              />
              <Text className="flex-1 text-xs text-amber-700 dark:text-amber-300">
                {
                  "Hors ligne : la délibération n'est consultable et enregistrable qu'avec une connexion."
                }
              </Text>
            </View>
          )}
          {schoolClassId && sessionUnavailable && (
            <Text className="text-xs text-amber-700 dark:text-amber-300">
              {
                "La 2ème session ne peut se tenir qu'après l'enregistrement de la 1ère session pour cette classe."
              }
            </Text>
          )}
        </View>

        <ReportStateView
          // Requête en pause sans réseau (ni chargement ni erreur) : sans ce cas, l'écran resterait vide.
          isSelectionComplete={
            Boolean(schoolClassId) && (isOnline || Boolean(decisionGrid))
          }
          selectionHint={
            schoolClassId
              ? "La délibération n'est consultable qu'avec une connexion."
              : "Sélectionnez une classe pour délibérer."
          }
          isLoading={
            decisionGridIsLoading ||
            (isOnline && !sessionPicked && !decisionGridError)
          }
          error={decisionGridError}
          errorLabel="Impossible de charger la délibération."
          onReload={() => void loadDecisionGrid()}
          isEmpty={!decisionGrid}
          emptyLabel="Aucun élève à délibérer."
        >
          <FlatList
            data={rows}
            keyExtractor={(row) => row.source.enrollmentId}
            contentContainerStyle={{ padding: 12, paddingBottom: 24 }}
            keyboardShouldPersistTaps="handled"
            refreshControl={
              <RefreshControl
                refreshing={decisionGridIsFetching && !decisionGridIsLoading}
                onRefresh={() => void loadDecisionGrid()}
              />
            }
            ListHeaderComponent={
              <View className="gap-3 mb-3">
                <View className="rounded-lg border border-border bg-card p-3 gap-3">
                  <Text className="text-xs font-semibold uppercase text-muted-foreground">
                    Séance
                    {passMark !== null
                      ? ` · note de passage ${formatNumber(passMark)}%`
                      : ""}
                  </Text>
                  {readOnly ? (
                    <Text className="text-sm text-foreground">
                      {heldOn
                        ? `Tenue le ${heldOn.split("-").reverse().join("/")}`
                        : "Date non renseignée"}
                      {sessionComments ? `\n${sessionComments}` : ""}
                    </Text>
                  ) : (
                    <>
                      <View className="flex-row items-end gap-2">
                        <DateField
                          label="Date de délibération"
                          value={heldOn}
                          onChange={setHeldOn}
                        />
                        {heldOn && (
                          <Pressable
                            onPress={() => setHeldOn(null)}
                            className="h-11 px-3 rounded-lg border border-input items-center justify-center"
                          >
                            <Ionicons
                              name="close"
                              size={18}
                              color={colors.foregroundSecondary}
                            />
                          </Pressable>
                        )}
                      </View>
                      <TextInput
                        value={sessionComments}
                        onChangeText={setSessionComments}
                        maxLength={1000}
                        placeholder="Observations de la séance (optionnel)"
                        placeholderTextColor={colors.faint}
                        className="h-11 border border-input rounded-lg px-3 bg-background text-foreground"
                      />
                    </>
                  )}
                </View>

                {rows.length > 0 && (
                  <View className="flex-row flex-wrap gap-1.5">
                    {summary.map((item) => (
                      <View
                        key={item.value}
                        className="rounded-full border border-border px-2.5 py-1"
                      >
                        <Text className="text-xs text-foreground">
                          {item.label} : {item.count}
                        </Text>
                      </View>
                    ))}
                    <View className="rounded-full border border-border px-2.5 py-1">
                      <Text className="text-xs text-muted-foreground">
                        Non décidé : {undecidedCount}
                      </Text>
                    </View>
                  </View>
                )}

                {!readOnly && applicableProposals.length > 0 && (
                  <Pressable
                    onPress={applyProposals}
                    className="flex-row items-center justify-center gap-2 h-10 rounded-lg border border-input"
                  >
                    <Ionicons
                      name="color-wand-outline"
                      size={16}
                      color={colors.foreground}
                    />
                    <Text className="text-sm font-medium text-foreground">
                      Reprendre les propositions ({applicableProposals.length})
                    </Text>
                  </Pressable>
                )}

                <Text className="text-xs text-faint">
                  {
                    "La proposition n'est qu'une aide pour le conseil : seule la décision enregistrée fait foi. Pourcentage et place tiennent compte des points ajustés enregistrés."
                  }
                  {session === 2
                    ? " En 2ème session, la décision remplace celle de 1ère session sur le bulletin."
                    : ""}
                </Text>
              </View>
            }
            renderItem={({ item }) => (
              <DecisionRowItem
                row={item}
                decisionLabel={labelOf(item.draft.decision)}
                onPress={() => setEditingId(item.source.enrollmentId)}
              />
            )}
          />
        </ReportStateView>

        {canUpdate && schoolClassId && decisionGrid && (
          <View className="flex-row gap-2 px-4 py-3 border-t border-divider bg-background">
            <Pressable
              disabled={!hasUnsavedChanges || saveEnrollmentDecisionsIsPending}
              onPress={() => resetFrom(decisionGrid)}
              className={`flex-1 h-12 rounded-lg border border-input items-center justify-center ${
                !hasUnsavedChanges ? "opacity-50" : ""
              }`}
            >
              <Text className="text-sm font-medium text-foreground-secondary">
                Annuler
              </Text>
            </Pressable>
            <Pressable
              disabled={
                !hasUnsavedChanges ||
                saveEnrollmentDecisionsIsPending ||
                sessionUnavailable ||
                !isOnline
              }
              onPress={() => void save()}
              className={`flex-1 h-12 rounded-lg bg-foreground items-center justify-center ${
                !hasUnsavedChanges || sessionUnavailable || !isOnline
                  ? "opacity-50"
                  : ""
              }`}
            >
              {saveEnrollmentDecisionsIsPending ? (
                <ActivityIndicator color={colors.background} />
              ) : (
                <Text className="text-background font-medium">
                  Enregistrer
                  {changedRows.length > 0 ? ` (${changedRows.length})` : ""}
                </Text>
              )}
            </Pressable>
          </View>
        )}
      </View>

      {editingRow && schoolClassId && schoolYearId && (
        <DecisionEditorDialog
          row={editingRow.source}
          value={editingRow.draft}
          schoolClassId={schoolClassId}
          schoolYearId={schoolYearId}
          session={session}
          decisionTypes={decisionTypes}
          classCourses={decisionGrid?.meta.courses ?? []}
          passMark={passMark}
          readOnly={readOnly}
          onApply={(draft) => applyDraft(editingRow.source.enrollmentId, draft)}
          onClose={() => setEditingId(null)}
        />
      )}
    </>
  );
}
