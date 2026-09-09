export interface TeachingCourseEvaluationType {
  id: string;
  code: string;
  name: string;
  abbreviation: string | null;
  description: string | null;
  isActive: boolean;
  displayOrder: number;
  comments: string | null;

  defaultCountsTowardsFinal: boolean | null;
  defaultGuardianVisibility: boolean | null;
  defaultStudentVisibility: boolean | null;
}
