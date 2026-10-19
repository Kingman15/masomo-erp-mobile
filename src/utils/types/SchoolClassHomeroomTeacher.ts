import { EmployeeOption } from "./Employee";

/**
 * Affectation d'un titulaire à une classe pour une année scolaire, éventuellement bornée dans l'année (remplacement, intérim).
 * Jamais modifiée : changer de titulaire = clôturer (endDate) puis créer une nouvelle affectation.
 */
export interface SchoolClassHomeroomTeacher {
  id: string;
  schoolClassId: string;
  schoolYearId: string;
  teacherId: string;
  // Affichage uniquement (ex. bulletin) : tous les titulaires ont les mêmes droits
  isPrimary: boolean;
  startDate: string | null;
  endDate: string | null;
  comments: string | null;
  createdAt: string | null;

  teacher?: EmployeeOption | null;
}
