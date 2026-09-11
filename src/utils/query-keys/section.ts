export const sectionKeys = {
  all: ["sections"] as const,
  list: () => [...sectionKeys.all, "list"] as const,
};
