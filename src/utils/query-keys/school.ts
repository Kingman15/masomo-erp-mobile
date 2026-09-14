export const schoolKeys = {
  all: ["schools"] as const,
  current: () => [...schoolKeys.all, "current"] as const,
};
