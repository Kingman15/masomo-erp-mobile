export const optionKeys = {
  all: ["options"] as const,
  list: (filters: { sectionId?: string | null }) =>
    [...optionKeys.all, "list", filters] as const,
};
