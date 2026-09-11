export const generalClassKeys = {
  all: ["generalClasses"] as const,
  list: (filters: { sectionId?: string | null; optionId?: string | null }) =>
    [...generalClassKeys.all, "list", filters] as const,
};
