export const schoolPeriodKeys = {
  all: ["school-periods"] as const,

  list: () => [...schoolPeriodKeys.all, "list"] as const,
};
