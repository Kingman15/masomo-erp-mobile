import { Text, View } from "react-native";
import { usePortalSelection } from "./use-portal-selection";

type PortalSelectionEmptyProps = {
  // Ce que l'écran affiche, pour compléter la phrase « … pour afficher {subject} » (ex : "ses incidents")
  subject: string;
  // L'écran a besoin de la classe (la plupart) ; documents et transport s'en passent
  requiresClass?: boolean;
  // Filtre de période propre à l'écran (ex : présences), vérifié une fois la sélection complète
  periodIsMissing?: boolean;
};

/**
 * État vide des écrans portail tant que leurs filtres ne sont pas complets (sélection année -> élève -> classe,
 * puis filtres propres à l'écran) : dit précisément ce qui manque. Même logique que le web (PortalSelectionEmptyState).
 */
export function PortalSelectionEmpty({
  subject,
  requiresClass = true,
  periodIsMissing = false,
}: PortalSelectionEmptyProps) {
  const {
    students,
    studentsIsLoading,
    isStudentEnrolled,
    enrollmentsIsLoading,
    schoolYearsIsLoading,
    schoolClassesIsLoading,
    selectedSchoolYear,
    selectedStudent,
    selectedSchoolClass,
  } = usePortalSelection();

  const [title, description] = ((): [string, string | null] => {
    if (schoolYearsIsLoading || studentsIsLoading || enrollmentsIsLoading || schoolClassesIsLoading) {
      return ["Chargement…", null];
    }
    if (!selectedSchoolYear) {
      return ["Aucune année scolaire", "Choisissez une année scolaire depuis le sélecteur d'élève."];
    }
    if (students.length === 0) {
      return ["Aucun élève rattaché", "Aucun élève n'est encore rattaché à votre compte. Contactez l'école."];
    }
    if (!selectedStudent) {
      return students.some((student) => isStudentEnrolled(student.id))
        ? [
            "Choisissez un élève",
            `Sélectionnez l'un de vos enfants inscrits en ${selectedSchoolYear.title} pour afficher ${subject}.`,
          ]
        : [
            `Aucune inscription en ${selectedSchoolYear.title}`,
            "Aucun de vos enfants n'est inscrit sur cette année. Choisissez une autre année ou rapprochez-vous de l'école.",
          ];
    }
    if (requiresClass && !selectedSchoolClass) {
      return [
        "Classe non déterminée",
        `Aucune classe trouvée pour ${selectedStudent.fullName ?? "cet élève"} en ${selectedSchoolYear.title}.`,
      ];
    }
    if (periodIsMissing) {
      return ["Choisissez une période", `Indiquez une date de début et une date de fin pour afficher ${subject}.`];
    }
    return ["Filtres incomplets", `Complétez les filtres pour afficher ${subject}.`];
  })();

  return (
    <View className="flex-1 items-center justify-center px-6 gap-1">
      <Text className="text-sm font-medium text-foreground-secondary text-center">{title}</Text>
      {description && <Text className="text-sm text-faint text-center">{description}</Text>}
    </View>
  );
}
