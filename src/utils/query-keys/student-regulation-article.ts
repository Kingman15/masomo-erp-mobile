export const studentRegulationArticleKeys = {
  all: ["studentRegulationArticles"] as const,
  currentTree: (regulationId?: string | null) =>
    [...studentRegulationArticleKeys.all, "current-tree", regulationId] as const,
};
