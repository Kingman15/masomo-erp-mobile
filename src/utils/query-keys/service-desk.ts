export const serviceDeskKeys = {
  all: ["service-desks"] as const,
  mine: () => [...serviceDeskKeys.all, "mine"] as const,
};
