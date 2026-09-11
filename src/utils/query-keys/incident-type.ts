export const incidentTypeKeys = {
  all: ["incident-types"] as const,

  list: () => [...incidentTypeKeys.all, "list"] as const,
};
