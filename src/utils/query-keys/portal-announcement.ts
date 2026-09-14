export const portalAnnouncementKeys = {
  all: ["portalAnnouncements"] as const,

  list: (filters: { schoolYearId?: string | null }) =>
    [
      ...portalAnnouncementKeys.all,
      "list",
      { schoolYearId: filters.schoolYearId ?? null },
    ] as const,

  detail: (
    schoolYearId: string | undefined | null,
    announcementId: string | undefined | null,
  ) =>
    [
      ...portalAnnouncementKeys.all,
      "detail",
      {
        schoolYearId: schoolYearId ?? null,
        announcementId: announcementId ?? null,
      },
    ] as const,
};
