import { useThemeColors } from "@/hooks/use-theme-colors";
import { formatNumber } from "@/lib/format";
import { toastNotify } from "@/lib/toast";
import type {
  DeliberationSession,
  EnrollmentClassCourse,
  EnrollmentDecisionGridRow,
  EnrollmentDecisionType,
  EnrollmentMakeUpCourse,
} from "@/utils/types/EnrollmentDecision";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useState, type ReactNode } from "react";
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import {
  coursesFromFailed,
  isInvalidPercentage,
  studentLabel,
  visibleProposal,
  type DecisionDraft,
} from "./deliberation-model";
import { PointAdjustmentsEditor } from "./point-adjustments-editor";

type DecisionEditorTab = "decision" | "points";

const OTHER_COURSES_PREVIEW = 1;

type DecisionEditorDialogProps = {
  row: EnrollmentDecisionGridRow;
  value: DecisionDraft;
  schoolClassId: string;
  schoolYearId: string;
  session: DeliberationSession;
  decisionTypes: EnrollmentDecisionType[];
  classCourses: EnrollmentClassCourse[];
  passMark: number | null;
  readOnly: boolean;
  onApply: (value: DecisionDraft) => void;
  onClose: () => void;
};

function SectionTitle({ children }: { children: ReactNode }) {
  return (
    <Text className="text-xs font-semibold text-muted-foreground uppercase mb-2 mt-4">
      {children}
    </Text>
  );
}

function Chip({
  label,
  selected,
  disabled,
  onPress,
}: {
  label: string;
  selected: boolean;
  disabled?: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      disabled={disabled}
      onPress={onPress}
      className={`px-3 h-9 rounded-full border items-center justify-center ${
        selected ? "bg-foreground border-foreground" : "border-input"
      } ${disabled && !selected ? "opacity-50" : ""}`}
    >
      <Text
        className={`text-sm ${selected ? "text-background font-medium" : "text-foreground"}`}
      >
        {label}
      </Text>
    </Pressable>
  );
}

function parsePercentage(text: string): number | null {
  const trimmed = text.trim().replace(",", ".");
  return trimmed === "" ? null : Number(trimmed);
}

// Résultat affiché quand il est laissé au calcul du serveur
function autoPassedLabel(percentage: number | null, passMark: number | null) {
  if (percentage === null || Number.isNaN(percentage) || passMark === null) return "Auto";
  return percentage >= passMark ? "Auto (réussi)" : "Auto (échoué)";
}

function MakeUpCourseEditor({
  course,
  annualPercentage,
  percentageText,
  passMark,
  editable,
  onPercentageText,
  onChange,
  onRemove,
}: {
  course: EnrollmentMakeUpCourse;
  annualPercentage: number | undefined;
  percentageText: string;
  passMark: number | null;
  editable: boolean;
  onPercentageText: (text: string) => void;
  onChange: (patch: Partial<EnrollmentMakeUpCourse>) => void;
  onRemove: () => void;
}) {
  const colors = useThemeColors();
  const percentage = parsePercentage(percentageText);
  const invalid = isInvalidPercentage(percentage);

  return (
    <View className="rounded-lg border border-border bg-card p-3 mb-2 gap-2">
      <View className="flex-row items-center gap-2">
        <View className="flex-1">
          <Text className="text-sm font-medium text-foreground">
            {course.courseName ?? "Cours"}
          </Text>
          {annualPercentage !== undefined && (
            <Text className="text-xs text-red-600 dark:text-red-300">
              Annuel : {formatNumber(annualPercentage)}%
            </Text>
          )}
        </View>
        {editable && (
          <Pressable onPress={onRemove} hitSlop={8}>
            <Ionicons name="close" size={20} color={colors.foregroundSecondary} />
          </Pressable>
        )}
      </View>

      <View className="flex-row items-center gap-2">
        <Text className="text-sm text-muted-foreground">% repêchage</Text>
        <TextInput
          value={percentageText}
          onChangeText={onPercentageText}
          editable={editable}
          keyboardType="decimal-pad"
          placeholder="—"
          placeholderTextColor={colors.faint}
          textAlignVertical="center"
          className={`w-24 h-11 border rounded-lg px-3 py-0 bg-background text-foreground ${
            invalid ? "border-red-500" : "border-input"
          }`}
        />
        {invalid && <Text className="text-xs text-red-500">Entre 0 et 100</Text>}
      </View>

      <View className="flex-row flex-wrap gap-2">
        <Chip
          label={autoPassedLabel(percentage, passMark)}
          selected={course.passed === null}
          disabled={!editable}
          onPress={() => onChange({ passed: null })}
        />
        <Chip
          label="Réussi"
          selected={course.passed === true}
          disabled={!editable}
          onPress={() => onChange({ passed: true })}
        />
        <Chip
          label="Échoué"
          selected={course.passed === false}
          disabled={!editable}
          onPress={() => onChange({ passed: false })}
        />
      </View>

      <TextInput
        value={course.comments ?? ""}
        onChangeText={(comments) => onChange({ comments: comments === "" ? null : comments })}
        editable={editable}
        maxLength={1000}
        placeholder="Commentaire (optionnel)"
        placeholderTextColor={colors.faint}
        textAlignVertical="center"
        className="h-11 border border-input rounded-lg px-3 py-0 bg-background text-foreground"
      />
    </View>
  );
}

// Fiche de délibération d'un élève, modifiée en mémoire : rien n'est envoyé avant « Enregistrer » sur l'écran.
export function DecisionEditorDialog({
  row,
  value,
  schoolClassId,
  schoolYearId,
  session,
  decisionTypes,
  classCourses,
  passMark,
  readOnly,
  onApply,
  onClose,
}: DecisionEditorDialogProps) {
  const colors = useThemeColors();
  const [draft, setDraft] = useState<DecisionDraft>(value);
  const [tab, setTab] = useState<DecisionEditorTab>("decision");
  // Saisie brute des pourcentages (« 12, » en cours de frappe), convertie à la validation
  const [percentageTexts, setPercentageTexts] = useState<Record<string, string>>(() =>
    Object.fromEntries(
      value.makeUpCourses.map((course) => [
        course.followCourseId,
        course.percentage !== null ? String(course.percentage) : "",
      ]),
    ),
  );

  // En 2ème session, le repêchage (décidé en 1ère session) est en lecture seule : ses résultats se saisissent en 1ère session.
  const makeUpEditable = !readOnly && session === 1 && draft.decision === "make_up_exam";
  const firstSessionMakeUps = row.firstSessionDecision?.makeUpExams ?? [];
  const proposal = visibleProposal(row);

  const annualPercentageOf = (followCourseId: string) =>
    row.failedCourses.find((course) => course.followCourseId === followCourseId)?.percentage;

  const missingFailedCourses = row.failedCourses.filter(
    (failed) => !draft.makeUpCourses.some((c) => c.followCourseId === failed.followCourseId),
  );
  const otherCourses = classCourses.filter(
    (cc) =>
      !draft.makeUpCourses.some((c) => c.followCourseId === cc.followCourseId) &&
      !missingFailedCourses.some((failed) => failed.followCourseId === cc.followCourseId),
  );
  // Les cours hors échec sont rarement repêchés : on n'en montre que quelques-uns, le reste se déroule à la demande
  const [showAllOtherCourses, setShowAllOtherCourses] = useState(false);
  const visibleOtherCourses = showAllOtherCourses
    ? otherCourses
    : otherCourses.slice(0, OTHER_COURSES_PREVIEW);
  const hiddenOtherCoursesCount = otherCourses.length - visibleOtherCourses.length;

  const setMakeUpCourses = (makeUpCourses: EnrollmentMakeUpCourse[]) =>
    setDraft((d) => ({ ...d, makeUpCourses }));

  const addCourses = (courses: EnrollmentMakeUpCourse[]) => {
    setMakeUpCourses([...draft.makeUpCourses, ...courses]);
    setPercentageTexts((texts) => ({
      ...texts,
      ...Object.fromEntries(courses.map((course) => [course.followCourseId, ""])),
    }));
  };

  const selectDecision = (decision: DecisionDraft["decision"]) => {
    setDraft((d) => ({
      ...d,
      decision,
      // Repêchage choisi sans cours : cours en échec proposés d'office, comme « Reprendre les propositions »
      makeUpCourses:
        decision === "make_up_exam" && d.makeUpCourses.length === 0
          ? coursesFromFailed(row)
          : d.makeUpCourses,
    }));
    if (decision === "make_up_exam" && draft.makeUpCourses.length === 0) {
      setPercentageTexts(
        Object.fromEntries(row.failedCourses.map((course) => [course.followCourseId, ""])),
      );
    }
  };

  const apply = () => {
    const makeUpCourses = draft.makeUpCourses.map((course) => ({
      ...course,
      percentage: parsePercentage(percentageTexts[course.followCourseId] ?? ""),
    }));

    if (draft.decision === null && draft.adjustments !== null && draft.adjustments.length > 0) {
      toastNotify("Les points ajustés ne sont enregistrés qu'avec une décision : choisissez-en une.", "warning");
      setTab("decision");
      return;
    }

    if (draft.decision === "make_up_exam" && session === 1) {
      if (makeUpCourses.length === 0) {
        toastNotify("Indiquez au moins un cours à repêcher.", "warning");
        return;
      }
      if (makeUpCourses.some((course) => isInvalidPercentage(course.percentage))) {
        toastNotify("Le pourcentage de repêchage doit être compris entre 0 et 100.", "warning");
        return;
      }
    }

    onApply({
      ...draft,
      makeUpCourses,
      reorientationNote: draft.reorientationNote?.trim() || null,
      comments: draft.comments?.trim() || null,
    });
  };

  return (
    <Modal visible transparent animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        className="flex-1 justify-end bg-black/40"
      >
        <View className="bg-background rounded-t-2xl max-h-[90%]">
          <View className="flex-row items-center justify-between px-4 pt-4 pb-3 border-b border-divider">
            <View className="flex-1">
              <Text className="text-base font-semibold text-foreground" numberOfLines={1}>
                {studentLabel(row)}
              </Text>
              <Text className="text-xs text-muted-foreground">
                {row.percentage !== null ? `${formatNumber(row.percentage)}%` : "Pas de résultat"}
                {row.rank !== null ? ` · ${row.rank}${row.rank === 1 ? "er" : "e"} / ${row.totalStudents}` : ""}
                {proposal ? ` · Proposé : ${proposal.label}` : ""}
              </Text>
            </View>
            <Pressable onPress={onClose} hitSlop={8}>
              <Ionicons name="close" size={22} color={colors.foregroundSecondary} />
            </Pressable>
          </View>

          <View className="flex-row gap-2 px-4 pt-3">
            {(
              [
                { value: "decision", label: "Décision" },
                {
                  value: "points",
                  label:
                    (draft.adjustments?.length ?? row.decision?.adjustedPointsCount ?? 0) > 0
                      ? `Points (${draft.adjustments?.length ?? row.decision?.adjustedPointsCount} ajusté(s))`
                      : "Points",
                },
              ] as const
            ).map((item) => (
              <Chip
                key={item.value}
                label={item.label}
                selected={tab === item.value}
                onPress={() => setTab(item.value)}
              />
            ))}
          </View>

          <ScrollView
            contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 16 }}
            keyboardShouldPersistTaps="handled"
          >
            {tab === "points" && (
              <PointAdjustmentsEditor
                row={row}
                schoolClassId={schoolClassId}
                schoolYearId={schoolYearId}
                session={session}
                hasDecision={draft.decision !== null}
                readOnly={readOnly}
                value={draft.adjustments}
                onChange={(adjustments) => setDraft((d) => ({ ...d, adjustments }))}
              />
            )}

            {tab === "decision" && (
              <>
                {row.failedCourses.length > 0 && (
                  <>
                    <SectionTitle>Cours en échec ({row.failedCourses.length})</SectionTitle>
                    {row.failedCourses.map((course) => (
                      <View key={course.followCourseId} className="flex-row justify-between py-0.5">
                        <Text className="flex-1 text-sm text-foreground">{course.courseName ?? "Cours"}</Text>
                        <Text className="text-sm text-red-600 dark:text-red-300">
                          {formatNumber(course.percentage)}%
                        </Text>
                      </View>
                    ))}
                  </>
                )}
    
                {session === 2 && row.firstSessionDecision && (
                  <>
                    <SectionTitle>1ère session</SectionTitle>
                    <Text className="text-sm text-foreground">{row.firstSessionDecision.label}</Text>
                    {firstSessionMakeUps.map((exam) => (
                      <View key={exam.followCourseId} className="flex-row justify-between py-0.5">
                        <Text className="flex-1 text-sm text-muted-foreground">{exam.courseName ?? "Cours"}</Text>
                        <Text className="text-sm text-foreground">
                          {exam.percentage !== null ? `${formatNumber(exam.percentage)}%` : "—"}
                          {exam.passed === true ? " · réussi" : exam.passed === false ? " · échoué" : ""}
                        </Text>
                      </View>
                    ))}
                  </>
                )}
    
                <SectionTitle>Décision</SectionTitle>
                <View className="flex-row flex-wrap gap-2">
                  {decisionTypes.map((type) => (
                    <Chip
                      key={type.value}
                      label={type.label}
                      selected={draft.decision === type.value}
                      disabled={readOnly}
                      // Toucher la décision choisie la retire : l'élève redevient « non décidé » (décision supprimée à l'enregistrement)
                      onPress={() => selectDecision(draft.decision === type.value ? null : type.value)}
                    />
                  ))}
                </View>
                {!readOnly && proposal && draft.decision !== proposal.value && (
                  <Pressable onPress={() => selectDecision(proposal.value)} className="mt-2 self-start">
                    <Text className="text-sm text-primary">
                      Reprendre la proposition ({proposal.label})
                    </Text>
                  </Pressable>
                )}
    
                {draft.decision === "failed" && (
                  <>
                    <SectionTitle>Réorientation</SectionTitle>
                    <TextInput
                      value={draft.reorientationNote ?? ""}
                      onChangeText={(reorientationNote) => setDraft((d) => ({ ...d, reorientationNote }))}
                      editable={!readOnly}
                      maxLength={255}
                      placeholder="Orientation conseillée (optionnel)"
                      placeholderTextColor={colors.faint}
                      className="h-11 border border-input rounded-lg px-3 bg-card text-foreground"
                    />
                  </>
                )}
    
                {draft.decision === "make_up_exam" && session === 1 && (
                  <>
                    <SectionTitle>Cours à repêcher</SectionTitle>
                    {passMark !== null && (
                      <Text className="text-xs text-muted-foreground mb-2">
                        Note de passage : {formatNumber(passMark)}%. Laissé sur « Auto », le résultat est déduit du pourcentage.
                      </Text>
                    )}
                    {draft.makeUpCourses.length === 0 && (
                      <Text className="text-xs text-red-500 mb-2">Indiquez au moins un cours à repêcher.</Text>
                    )}
                    {draft.makeUpCourses.map((course, index) => (
                      <MakeUpCourseEditor
                        key={course.followCourseId}
                        course={course}
                        annualPercentage={annualPercentageOf(course.followCourseId)}
                        percentageText={percentageTexts[course.followCourseId] ?? ""}
                        passMark={passMark}
                        editable={makeUpEditable}
                        onPercentageText={(text) =>
                          setPercentageTexts((texts) => ({ ...texts, [course.followCourseId]: text }))
                        }
                        onChange={(patch) =>
                          setMakeUpCourses(
                            draft.makeUpCourses.map((c, i) => (i === index ? { ...c, ...patch } : c)),
                          )
                        }
                        onRemove={() =>
                          setMakeUpCourses(draft.makeUpCourses.filter((_, i) => i !== index))
                        }
                      />
                    ))}
    
                    {makeUpEditable && (missingFailedCourses.length > 0 || otherCourses.length > 0) && (
                      <View className="gap-2 mt-1">
                        <Text className="text-xs text-muted-foreground">Ajouter un cours</Text>
                        <View className="flex-row flex-wrap gap-2">
                          {missingFailedCourses.map((failed) => (
                            <Chip
                              key={failed.followCourseId}
                              label={`+ ${failed.courseName ?? "Cours"} (échec)`}
                              selected={false}
                              onPress={() =>
                                addCourses([
                                  {
                                    followCourseId: failed.followCourseId,
                                    courseName: failed.courseName,
                                    percentage: null,
                                    passed: null,
                                    comments: null,
                                  },
                                ])
                              }
                            />
                          ))}
                          {visibleOtherCourses.map((cc) => (
                            <Chip
                              key={cc.followCourseId}
                              label={`+ ${cc.courseName ?? "Cours"}`}
                              selected={false}
                              onPress={() =>
                                addCourses([
                                  {
                                    followCourseId: cc.followCourseId,
                                    courseName: cc.courseName,
                                    percentage: null,
                                    passed: null,
                                    comments: null,
                                  },
                                ])
                              }
                            />
                          ))}
                          {otherCourses.length > OTHER_COURSES_PREVIEW && (
                            <Pressable
                              onPress={() => setShowAllOtherCourses((show) => !show)}
                              className="flex-row items-center gap-1 px-3 h-9 rounded-full border border-dashed border-input"
                            >
                              <Text className="text-sm font-medium text-foreground-secondary">
                                {showAllOtherCourses
                                  ? "Réduire"
                                  : `${hiddenOtherCoursesCount} autre${hiddenOtherCoursesCount > 1 ? "s" : ""} cours`}
                              </Text>
                              <Ionicons
                                name={showAllOtherCourses ? "chevron-up" : "chevron-down"}
                                size={16}
                                color={colors.foregroundSecondary}
                              />
                            </Pressable>
                          )}
                        </View>
                      </View>
                    )}
                  </>
                )}
    
                <SectionTitle>Commentaire</SectionTitle>
                <TextInput
                  value={draft.comments ?? ""}
                  onChangeText={(comments) => setDraft((d) => ({ ...d, comments }))}
                  editable={!readOnly}
                  multiline
                  maxLength={1000}
                  textAlignVertical="top"
                  placeholder="Commentaire (optionnel)"
                  placeholderTextColor={colors.faint}
                  className="min-h-[72px] border border-input rounded-lg px-3 py-2 bg-card text-foreground"
                />
              </>
            )}
          </ScrollView>

          <View className="flex-row gap-2 p-4 border-t border-divider">
            <Pressable
              onPress={onClose}
              className="flex-1 h-12 rounded-lg border border-input items-center justify-center"
            >
              <Text className="text-sm font-medium text-foreground-secondary">
                {readOnly ? "Fermer" : "Annuler"}
              </Text>
            </Pressable>
            {!readOnly && (
              <Pressable
                onPress={apply}
                className="flex-1 h-12 rounded-lg bg-foreground items-center justify-center"
              >
                <Text className="text-background font-medium">Valider</Text>
              </Pressable>
            )}
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
