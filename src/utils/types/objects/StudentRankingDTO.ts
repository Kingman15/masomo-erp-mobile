export interface StudentRankingDTO {
  enrollmentNumber: string;
  studentName: string;

  totalPoints: string;
  totalAbsoluteMax: string;
  totalRelativeMax: string;
  totalEffectiveMax: string;
  absolutePercentage: string;
  relativePercentage: string;
  effectivePercentage: string;

  position: number;
}
