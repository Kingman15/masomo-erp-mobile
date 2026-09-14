export interface CourseAverageDTO {
  enrollmentNumber: string;
  studentName: string;
  followCourseId: string;
  courseCode: string;
  courseName: string;

  totalPoints: string;
  totalAbsoluteMax: string;
  totalRelativeMax: string;
  totalEffectiveMax: string;
  absolutePercentage: string;
  relativePercentage: string;
  effectivePercentage: string;

  position: number;
}
