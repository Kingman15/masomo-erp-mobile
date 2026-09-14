export const portalDocumentKeys = {
  all: ["portalDocuments"] as const,

  list: (filters: { schoolYearId?: string | null }) =>
    [
      ...portalDocumentKeys.all,
      "list",
      { schoolYearId: filters.schoolYearId ?? null },
    ] as const,

  detail: (
    schoolYearId: string | undefined | null,
    documentId: string | undefined | null,
  ) =>
    [
      ...portalDocumentKeys.all,
      "detail",
      { schoolYearId: schoolYearId ?? null, documentId: documentId ?? null },
    ] as const,

  attachable: () => [...portalDocumentKeys.all, "attachable"] as const,
};
