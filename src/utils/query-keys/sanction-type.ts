export const sanctionTypeKeys = {
  all: ["sanction-types"] as const,

  list: () => [...sanctionTypeKeys.all, "list"] as const,
};
