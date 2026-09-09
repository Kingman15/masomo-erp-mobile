export const teachingCourseEvaluationTypeKeys = {
  all: ["teaching-course-evaluation-types"] as const,

  list: () => [...teachingCourseEvaluationTypeKeys.all, "list"] as const,
};
