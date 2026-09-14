import { useSchoolClasses } from "@/hooks/queries/items/school-class";
import { useCurrentSchoolYear, useSchoolYears } from "@/hooks/queries/items/school-year";
import { useCurrentStudents } from "@/hooks/queries/items/student";
import { usePortalSelectionStore } from "@/stores/portal-selection";
import { useEffect, useMemo } from "react";

export function usePortalSelection() {
  const selectedStudentId = usePortalSelectionStore((s) => s.selectedStudentId);
  const selectedSchoolYearId = usePortalSelectionStore((s) => s.selectedSchoolYearId);
  const selectedSchoolClassId = usePortalSelectionStore((s) => s.selectedSchoolClassId);
  const setSelectedStudent = usePortalSelectionStore((s) => s.setSelectedStudent);
  const setSelectedSchoolYear = usePortalSelectionStore((s) => s.setSelectedSchoolYear);
  const setSelectedSchoolClass = usePortalSelectionStore((s) => s.setSelectedSchoolClass);

  const {
    students = [],
    studentsError,
    studentsIsLoading,
    loadStudents,
  } = useCurrentStudents();

  const selectedStudent = useMemo(
    () => students.find((s) => s.id === selectedStudentId) ?? null,
    [students, selectedStudentId],
  );

  const {
    schoolYears = [],
    schoolYearsError,
    schoolYearsIsLoading,
  } = useSchoolYears({
    filters: { studentId: selectedStudent?.id },
    enabled: !!selectedStudent,
  });

  const { currentSchoolYear } = useCurrentSchoolYear();

  const selectedSchoolYear = useMemo(
    () => schoolYears.find((sy) => sy.id === selectedSchoolYearId) ?? null,
    [schoolYears, selectedSchoolYearId],
  );

  const {
    schoolClasses = [],
    schoolClassesError,
    schoolClassesIsLoading,
  } = useSchoolClasses({
    filters: { studentId: selectedStudent?.id, schoolYearId: selectedSchoolYear?.id },
    enabled: !!selectedStudent && !!selectedSchoolYear,
  });

  const selectedSchoolClass = useMemo(
    () => schoolClasses.find((sc) => sc.id === selectedSchoolClassId) ?? null,
    [schoolClasses, selectedSchoolClassId],
  );

  // Un seul enfant -> sélection automatique (idem web).
  useEffect(() => {
    if (students.length === 1) setSelectedStudent(students[0]);
  }, [students, setSelectedStudent]);

  // Résolution année scolaire, dépendante de l'élève sélectionné.
  // Gate sur l'objet dérivé (selectedStudent), pas sur l'id brut : un id
  // persisté périmé/étranger (survivant d'un restart) ne doit jamais
  // déclencher de requête tant qu'il n'est pas confirmé dans la liste
  // fraîchement chargée. Comportement identique au web quand l'id est valide.
  useEffect(() => {
    if (!selectedStudent || !schoolYears.length) return;

    // Une année déjà choisie (manuellement ou par une résolution précédente)
    // reste valable tant qu'elle existe pour l'élève sélectionné : on ne la
    // réécrase pas au profit de l'année courante.
    if (
      selectedSchoolYearId &&
      schoolYears.some((sy) => sy.id === selectedSchoolYearId)
    ) {
      return;
    }

    if (schoolYears.length === 1) {
      setSelectedSchoolYear(schoolYears[0]);
      return;
    }

    const currentInList = currentSchoolYear
      ? schoolYears.find((sy) => sy.id === currentSchoolYear.id)
      : undefined;

    if (currentInList) {
      setSelectedSchoolYear(currentInList);
      return;
    }

    setSelectedSchoolYear(schoolYears[schoolYears.length - 1]);
  }, [
    selectedStudent,
    schoolYears,
    currentSchoolYear,
    setSelectedSchoolYear,
    selectedSchoolYearId,
  ]);

  // Résolution classe, dépendante de l'élève + l'année sélectionnés.
  useEffect(() => {
    if (!selectedSchoolYear || !schoolClasses.length) return;

    if (schoolClasses.length === 1) {
      setSelectedSchoolClass(schoolClasses[0]);
    }
  }, [selectedSchoolYear, schoolClasses, setSelectedSchoolClass]);

  return {
    students,
    studentsIsLoading,
    studentsError,
    loadStudents,

    schoolYears,
    schoolYearsIsLoading,
    schoolYearsError,

    schoolClasses,
    schoolClassesIsLoading,
    schoolClassesError,

    selectedStudent,
    setSelectedStudent,

    selectedSchoolYear,
    setSelectedSchoolYear,

    selectedSchoolClass,
    setSelectedSchoolClass,
  };
}
