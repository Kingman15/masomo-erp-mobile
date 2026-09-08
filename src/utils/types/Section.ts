export interface Section {
  id: string;
  code: string | null;

  title: string | null;
  abbreviation: string | null;

  classLimit?: number | null;
  duration?: number | null; // nombre d'années
  displayOrder: number | null;
  isActive?: boolean | null;
  gradeLevel?: number | null;

  principalId?: string | null;
  description?: string | null;
  extracurricularActivities?: string | null;
  educationalGoals?: string | null;
}
