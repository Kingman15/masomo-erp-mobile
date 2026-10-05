import { Employee } from "./Employee";

/**
 * Affectation d'un enseignant à un cours, éventuellement bornée dans l'année (remplacement, intérim).
 */
export interface TeachingCourseTeacher {
  id: string;
  teachingCourseId: string;
  teacherId: string;
  isPrimary: boolean;
  startDate: string | null;
  endDate: string | null;
  comments: string | null;

  teacher?: Employee | null;
}
