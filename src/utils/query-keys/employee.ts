export const employeeKeys = {
  all: ["employees"] as const,

  currentTeacher: () => [...employeeKeys.all, "currentTeacher"] as const,
  options: () => [...employeeKeys.all, "options"] as const,
};
