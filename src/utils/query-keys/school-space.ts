export const schoolSpaceKeys = {
  all: ["school-spaces"] as const,

  list: (filters: { schoolBuildingId?: string | null }) =>
    [...schoolSpaceKeys.all, "list", filters] as const,
};
