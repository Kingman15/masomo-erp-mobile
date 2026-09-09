export const evaluationPeriodKeys = {
  all: ["evaluation-periods"] as const,

  list: () => [...evaluationPeriodKeys.all, "list"] as const,
};
