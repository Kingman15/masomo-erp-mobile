import { ChipSelect } from "@/components/list/chip-select";
import { FilterPanel } from "@/components/list/filter-panel";
import { useSchoolClasses } from "@/hooks/queries/items/school-class";
import { useSchoolYears } from "@/hooks/queries/items/school-year";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useEffect, useState } from "react";
import { ActivityIndicator, Pressable, Text, View } from "react-native";
import { usePortalSelection } from "./use-portal-selection";

type StudentSwitcherPanelProps = {
  onClose: () => void;
};

export function StudentSwitcherPanel({ onClose }: StudentSwitcherPanelProps) {
  const {
    students,
    studentsIsLoading,
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
  const [draftStudentId, setDraftStudentId] = useState<string | null>(
    selectedStudent?.id ?? null,
  );
  const [draftSchoolYearId, setDraftSchoolYearId] = useState<string | null>(
    selectedSchoolYear?.id ?? null,
  );
  const [draftSchoolClassId, setDraftSchoolClassId] = useState<string | null>(
    selectedSchoolClass?.id ?? null,
  );

  const {
    schoolYears: draftSchoolYears = [],
    schoolYearsIsLoading: draftSchoolYearsIsLoading,
  } = useSchoolYears({
    filters: { studentId: draftStudentId ?? undefined },
    enabled: !!draftStudentId,
  });

  const {
    schoolClasses: draftSchoolClasses = [],
    schoolClassesIsLoading: draftSchoolClassesIsLoading,
  } = useSchoolClasses({
    filters: { studentId: draftStudentId, schoolYearId: draftSchoolYearId },
    enabled: !!draftStudentId && !!draftSchoolYearId,
  });

  // Auto-résolution dans le brouillon, même logique que le hook global :
  // ne s'affiche comme contrôle interactif que s'il y a une vraie ambiguïté.
  useEffect(() => {
    if (!draftStudentId || !draftSchoolYears.length) return;
    if (draftSchoolYears.length === 1) {
      setDraftSchoolYearId(draftSchoolYears[0].id);
    }
  }, [draftStudentId, draftSchoolYears]);

  useEffect(() => {
    if (!draftSchoolYearId || !draftSchoolClasses.length) return;
    if (draftSchoolClasses.length === 1) {
      setDraftSchoolClassId(draftSchoolClasses[0].id);
    }
  }, [draftSchoolYearId, draftSchoolClasses]);

  const handleSelectDraftStudent = (id: string) => {
    setDraftStudentId(id);
    setDraftSchoolYearId(null);
    setDraftSchoolClassId(null);
  };

  const handleApply = () => {
    const student = students.find((s) => s.id === draftStudentId);
    if (student) setSelectedStudent(student);

    const schoolYear = draftSchoolYears.find((sy) => sy.id === draftSchoolYearId);
    if (schoolYear) setSelectedSchoolYear(schoolYear);

    const schoolClass = draftSchoolClasses.find((sc) => sc.id === draftSchoolClassId);
    if (schoolClass) setSelectedSchoolClass(schoolClass);

    onClose();
  };

  const handleReset = () => {
    setDraftStudentId(selectedStudent?.id ?? null);
    setDraftSchoolYearId(selectedSchoolYear?.id ?? null);
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
      {studentsIsLoading ? (
        <ActivityIndicator />
      ) : students.length <= 1 ? (
        <Text className="text-base text-gray-900 mb-4">
          {students[0]?.fullName ?? "Aucun élève"}
        </Text>
      ) : (
        <View className="mb-4 border border-gray-200 rounded-xl overflow-hidden">
          {students.map((student, index) => {
            const selected = student.id === draftStudentId;
            const isLast = index === students.length - 1;
            return (
              <Pressable
                key={student.id}
                onPress={() => handleSelectDraftStudent(student.id)}
                className={`flex-row items-center justify-between px-3 py-3 ${
                  isLast ? "" : "border-b border-gray-100"
                }`}
              >
                <Text className="text-base text-gray-900" numberOfLines={1}>
                  {student.fullName}
                </Text>
                {selected && <Ionicons name="checkmark" size={18} color="#000000" />}
              </Pressable>
            );
          })}
        </View>
      )}

      {!!draftStudentId && draftSchoolYears.length > 1 && (
        <ChipSelect
          label="Année scolaire"
          options={draftSchoolYears.map((sy) => ({ id: sy.id, label: sy.title }))}
          value={draftSchoolYearId}
          onChange={(id) => {
            setDraftSchoolYearId(id);
            setDraftSchoolClassId(null);
          }}
          loading={draftSchoolYearsIsLoading}
        />
      )}

      {!!draftSchoolYearId && draftSchoolClasses.length > 1 && (
        <ChipSelect
          label="Classe"
          options={draftSchoolClasses.map((sc) => ({
            id: sc.id,
            label: sc.title ?? sc.abbreviation ?? "Classe",
          }))}
          value={draftSchoolClassId}
          onChange={setDraftSchoolClassId}
          loading={draftSchoolClassesIsLoading}
        />
      )}
    </FilterPanel>
  );
}
