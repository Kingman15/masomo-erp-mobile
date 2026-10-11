import { useCurrentEnrollments } from "@/hooks/queries/items/enrollment";
import { useSchoolClasses } from "@/hooks/queries/items/school-class";
import {
  useCurrentSchoolYear,
  useSchoolYears,
} from "@/hooks/queries/items/school-year";
import { useCurrentStudents } from "@/hooks/queries/items/student";
import { usePortalSelectionStore } from "@/stores/portal-selection";
import { useCallback, useEffect, useMemo } from "react";

// Ordre de résolution : année -> élève -> classe (idem web). L'année vient en premier car tout en dépend
// (la messagerie et les annonces ne dépendent même que d'elle) ; l'élève se choisit parmi les inscrits de l'année.
export function usePortalSelection() {
  const selectedStudentId = usePortalSelectionStore((s) => s.selectedStudentId);
  const selectedSchoolYearId = usePortalSelectionStore(
    (s) => s.selectedSchoolYearId,
  );
  const selectedSchoolClassId = usePortalSelectionStore(
    (s) => s.selectedSchoolClassId,
  );
  const setSelectedStudent = usePortalSelectionStore(
    (s) => s.setSelectedStudent,
  );
  const clearSelectedStudent = usePortalSelectionStore(
    (s) => s.clearSelectedStudent,
  );
  const setSelectedSchoolYear = usePortalSelectionStore(
    (s) => s.setSelectedSchoolYear,
  );
  const setSelectedSchoolClass = usePortalSelectionStore(
    (s) => s.setSelectedSchoolClass,
  );

  const {
    students = [],
    studentsError,
    studentsIsLoading,
    loadStudents,
  } = useCurrentStudents();

  // Côté portail, l'API renvoie les années de scolarité des élèves du compte, plus l'année courante de l'école.
  const {
    schoolYears = [],
    schoolYearsError,
    schoolYearsIsLoading,
  } = useSchoolYears();

  const { currentSchoolYear } = useCurrentSchoolYear();

  // Gate sur les objets dérivés, pas sur les ids bruts : un id persisté périmé/étranger
  // (survivant d'un restart) ne doit jamais déclencher de requête tant qu'il n'est pas
  // confirmé dans la liste fraîchement chargée.
  const selectedSchoolYear = useMemo(
    () => schoolYears.find((sy) => sy.id === selectedSchoolYearId) ?? null,
    [schoolYears, selectedSchoolYearId],
  );

  const { enrollments = [], enrollmentsIsLoading } = useCurrentEnrollments({
    filters: { schoolYearId: selectedSchoolYear?.id },
    enabled: !!selectedSchoolYear,
  });

  const enrolledStudentIds = useMemo(
    () => new Set(enrollments.map((enrollment) => enrollment.studentId)),
    [enrollments],
  );

  // Élèves du compte inscrits sur l'année sélectionnée ; les autres restent listés mais non sélectionnables.
  const isStudentEnrolled = useCallback(
    (studentId: string) => enrolledStudentIds.has(studentId),
    [enrolledStudentIds],
  );

  const selectedStudent = useMemo(
    () => students.find((s) => s.id === selectedStudentId) ?? null,
    [students, selectedStudentId],
  );

  const {
    schoolClasses = [],
    schoolClassesError,
    schoolClassesIsLoading,
  } = useSchoolClasses({
    filters: {
      studentId: selectedStudent?.id,
      schoolYearId: selectedSchoolYear?.id,
    },
    enabled: !!selectedStudent && !!selectedSchoolYear,
  });

  const selectedSchoolClass = useMemo(
    () => schoolClasses.find((sc) => sc.id === selectedSchoolClassId) ?? null,
    [schoolClasses, selectedSchoolClassId],
  );

  // Résolution année scolaire. Ordre de priorité :
  // 1. Une année déjà choisie et toujours proposée -> conservée (pas réécrasée par l'année courante)
  // 2. currentSchoolYear (globale), toujours proposée côté portail
  // 3. Sinon -> année la plus récente (schoolYears triées de la plus récente à la plus ancienne)
  useEffect(() => {
    if (!schoolYears.length) return;
    if (
      selectedSchoolYearId &&
      schoolYears.some((sy) => sy.id === selectedSchoolYearId)
    )
      return;

    const currentInList = currentSchoolYear
      ? schoolYears.find((sy) => sy.id === currentSchoolYear.id)
      : undefined;

    setSelectedSchoolYear(currentInList ?? schoolYears[0]);
  }, [
    schoolYears,
    currentSchoolYear,
    selectedSchoolYearId,
    setSelectedSchoolYear,
  ]);

  // Résolution élève, dépendante de l'année : conservé s'il est inscrit sur l'année,
  // sinon -> premier inscrit de l'année dans l'ordre de la liste (élève le plus récemment créé d'abord, côté API) ;
  // aucun inscrit -> désélectionné.
  useEffect(() => {
    if (!selectedSchoolYear || enrollmentsIsLoading) return;
    if (selectedStudentId && enrolledStudentIds.has(selectedStudentId)) return;

    const firstEnrolledStudent = students.find((student) => enrolledStudentIds.has(student.id));

    if (firstEnrolledStudent) {
      setSelectedStudent(firstEnrolledStudent);
    } else if (selectedStudentId) {
      clearSelectedStudent();
    }
  }, [
    selectedSchoolYear,
    enrollmentsIsLoading,
    enrolledStudentIds,
    students,
    selectedStudentId,
    setSelectedStudent,
    clearSelectedStudent,
  ]);

  // Résolution classe, dépendante de l'élève + l'année sélectionnés : classe choisie conservée si toujours proposée,
  // sinon -> classe de la dernière inscription de l'élève sur l'année (enrollments triées de la plus récente à la plus ancienne).
  useEffect(() => {
    if (!selectedSchoolYear || !selectedStudent || !schoolClasses.length) return;
    if (selectedSchoolClassId && schoolClasses.some((sc) => sc.id === selectedSchoolClassId)) return;

    const latestClassId = enrollments.find(
      (enrollment) => enrollment.studentId === selectedStudent.id,
    )?.schoolClassId;

    setSelectedSchoolClass(schoolClasses.find((sc) => sc.id === latestClassId) ?? schoolClasses[0]);
  }, [
    selectedSchoolYear,
    selectedStudent,
    schoolClasses,
    selectedSchoolClassId,
    enrollments,
    setSelectedSchoolClass,
  ]);

  return {
    students,
    studentsIsLoading,
    studentsError,
    loadStudents,
    isStudentEnrolled,
    enrollmentsIsLoading,

    schoolYears,
    schoolYearsIsLoading,
    schoolYearsError,
    // Année courante de l'école ; une autre année sélectionnée est une archive
    currentSchoolYear: currentSchoolYear ?? null,

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
