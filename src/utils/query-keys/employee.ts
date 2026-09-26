export const employeeKeys = {
  all: ["employees"] as const,

  currentTeacher: () => [...employeeKeys.all, "currentTeacher"] as const,
};
