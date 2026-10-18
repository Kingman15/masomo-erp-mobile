import { ChipSelect } from "@/components/list/chip-select";
import { FilterPanel } from "@/components/list/filter-panel";
import { useCurrentEnrollments } from "@/hooks/queries/items/enrollment";
import { useThemeColors } from "@/hooks/use-theme-colors";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useMemo, useState } from "react";
import { ActivityIndicator, Pressable, Text, View } from "react-native";
import { schoolClassesOfStudent, usePortalSelection } from "./use-portal-selection";

type StudentSwitcherPanelProps = {
  onClose: () => void;
};

// Même ordre que la sélection globale : année -> élève -> classe.
export function StudentSwitcherPanel({ onClose }: StudentSwitcherPanelProps) {
  const colors = useThemeColors();
  const {
    students,
    studentsIsLoading,
    schoolYears,
    schoolYearsIsLoading,
    selectedStudent,
    selectedSchoolYear,
    selectedSchoolClass,
    setSelectedStudent,
    setSelectedSchoolYear,
    setSelectedSchoolClass,
  } = usePortalSelection();

  // Le panneau n'est monté que le temps d'être ouvert (comme LessonFilterPanel) :
  // le brouillon peut donc s'initialiser directement depuis la sélection validée,
  // sans effet déclenché par une prop "visible".
  const [draftSchoolYearId, setDraftSchoolYearId] = useState<string | null>(
    selectedSchoolYear?.id ?? null,
  );
  const [draftStudentId, setDraftStudentId] = useState<string | null>(
    selectedStudent?.id ?? null,
  );
  const [draftSchoolClassId, setDraftSchoolClassId] = useState<string | null>(
    selectedSchoolClass?.id ?? null,
  );

  const {
    enrollments: draftEnrollments = [],
    enrollmentsIsLoading: draftEnrollmentsIsLoading,
  } = useCurrentEnrollments({
    filters: { schoolYearId: draftSchoolYearId },
    enabled: !!draftSchoolYearId,
  });

  const draftEnrolledStudentIds = useMemo(
    () => new Set(draftEnrollments.map((enrollment) => enrollment.studentId)),
    [draftEnrollments],
  );

  // Auto-résolution du brouillon, dérivée (même logique que le hook global) :
  // élève conservé s'il est inscrit sur l'année du brouillon, sinon le premier inscrit (le plus récemment créé).
  const resolvedDraftStudentId = useMemo(() => {
    if (!draftSchoolYearId || draftEnrollmentsIsLoading) return null;
    if (draftStudentId && draftEnrolledStudentIds.has(draftStudentId)) return draftStudentId;

    return students.find((student) => draftEnrolledStudentIds.has(student.id))?.id ?? null;
  }, [draftSchoolYearId, draftEnrollmentsIsLoading, draftEnrolledStudentIds, draftStudentId, students]);

  // Classes tirées des inscriptions de l'année du brouillon (classe incluse) : pas de requête dédiée.
  const draftSchoolClasses = useMemo(
    () =>
      resolvedDraftStudentId
        ? schoolClassesOfStudent(draftEnrollments, resolvedDraftStudentId)
        : [],
    [draftEnrollments, resolvedDraftStudentId],
  );

  // Classe : celle du brouillon si toujours proposée, sinon celle de la dernière inscription de l'élève sur l'année.
  const resolvedDraftSchoolClassId = draftSchoolClasses.some((sc) => sc.id === draftSchoolClassId)
    ? draftSchoolClassId
    : (draftSchoolClasses[0]?.id ?? null);

  const handleSelectDraftStudent = (id: string) => {
    setDraftStudentId(id);
    setDraftSchoolClassId(null);
  };

  const handleApply = () => {
    const schoolYear = schoolYears.find((sy) => sy.id === draftSchoolYearId);
    if (schoolYear) setSelectedSchoolYear(schoolYear);

    const student = students.find((s) => s.id === resolvedDraftStudentId);
    if (student) setSelectedStudent(student);

    const schoolClass = draftSchoolClasses.find((sc) => sc.id === resolvedDraftSchoolClassId);
    if (schoolClass) setSelectedSchoolClass(schoolClass);

    onClose();
  };

  const handleReset = () => {
    setDraftSchoolYearId(selectedSchoolYear?.id ?? null);
    setDraftStudentId(selectedStudent?.id ?? null);
    setDraftSchoolClassId(selectedSchoolClass?.id ?? null);
    onClose();
  };

  return (
    <FilterPanel
      title="Choisir un élève"
      applyLabel="Choisir"
      onApply={handleApply}
      onReset={handleReset}
      onClose={onClose}
      bleed
    >
      {schoolYears.length > 1 && (
        <ChipSelect
          label="Année scolaire"
          options={schoolYears.map((sy) => ({ id: sy.id, label: sy.title }))}
          value={draftSchoolYearId}
          onChange={(id) => {
            if (!id) return;
            setDraftSchoolYearId(id);
            setDraftSchoolClassId(null);
          }}
          loading={schoolYearsIsLoading}
        />
      )}

      {studentsIsLoading || draftEnrollmentsIsLoading ? (
        <ActivityIndicator />
      ) : students.length === 0 ? (
        <Text className="text-base text-foreground mb-4">Aucun élève</Text>
      ) : (
        <View className="mb-4 border border-border rounded-xl overflow-hidden">
          {students.map((student, index) => {
            const enrolled = draftEnrolledStudentIds.has(student.id);
            const selected = student.id === resolvedDraftStudentId;
            const isLast = index === students.length - 1;
            return (
              <Pressable
                key={student.id}
                disabled={!enrolled}
                onPress={() => handleSelectDraftStudent(student.id)}
                className={`flex-row items-center justify-between px-3 py-3 ${
                  isLast ? "" : "border-b border-divider"
                }`}
              >
                <View className="flex-1">
                  <Text
                    className={`text-base ${enrolled ? "text-foreground" : "text-faint"}`}
                    numberOfLines={1}
                  >
                    {student.fullName}
                  </Text>
                  {enrolled ? (
                    <Text className="text-xs text-muted-foreground" numberOfLines={1}>
                      {schoolClassesOfStudent(draftEnrollments, student.id)
                        .map((sc) => sc.title ?? sc.abbreviation)
                        .filter(Boolean)
                        .join(", ")}
                    </Text>
                  ) : (
                    <Text className="text-xs text-faint">
                      Non inscrit cette année
                    </Text>
                  )}
                </View>
                {selected && (
                  <Ionicons
                    name="checkmark"
                    size={18}
                    color={colors.foreground}
                  />
                )}
              </Pressable>
            );
          })}
        </View>
      )}

      {!!resolvedDraftStudentId && draftSchoolClasses.length > 1 && (
        <ChipSelect
          label="Classe"
          options={draftSchoolClasses.map((sc) => ({
            id: sc.id,
            label: sc.title ?? sc.abbreviation ?? "Classe",
          }))}
          value={resolvedDraftSchoolClassId}
          onChange={setDraftSchoolClassId}
        />
      )}
    </FilterPanel>
  );
}
